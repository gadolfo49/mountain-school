import SwiftUI
import CoreLocation
import Network
import Security

@main struct MountainTransporteApp: App {
    @StateObject private var tracker = Tracker()
    var body: some Scene { WindowGroup { ContentView().environmentObject(tracker) } }
}

struct GPSFix: Codable, Identifiable {
    let id: UUID; let latitude: Double; let longitude: Double; let accuracy: Double
    let timestamp: Date; let speed: Double; let course: Double
    init(_ l: CLLocation) { id=UUID(); latitude=l.coordinate.latitude; longitude=l.coordinate.longitude; accuracy=l.horizontalAccuracy; timestamp=l.timestamp; speed=max(0,l.speed); course=max(0,l.course) }
}

@MainActor final class Tracker: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var tracking=false; @Published var network=false; @Published var server=false
    @Published var lastFix: GPSFix?; @Published var lastSent: Date?; @Published var queued=0
    @Published var message="Listo para iniciar"; @Published var permission="Verificando permiso"
    private let manager=CLLocationManager(); private let monitor=NWPathMonitor(); private let monitorQueue=DispatchQueue(label:"mcs.network")
    private let gpsURL=URL(string:"https://iwpbzbjfsljqeajikytu.supabase.co/functions/v1/mcs-gps")!
    private let nativeURL=URL(string:"https://iwpbzbjfsljqeajikytu.supabase.co/functions/v1/mcs-native")!
    private let queueKey="mcs.native.gps.queue"; private var sending=false
    private(set) var token=""

    override init(){ super.init(); manager.delegate=self; manager.desiredAccuracy=kCLLocationAccuracyBestForNavigation; manager.distanceFilter=5; manager.activityType=.automotiveNavigation; manager.pausesLocationUpdatesAutomatically=false; manager.allowsBackgroundLocationUpdates=true; token=Keychain.token(); queued=load().count; monitor.pathUpdateHandler={ [weak self] p in Task { @MainActor in self?.network = p.status == .satisfied; if p.status == .satisfied { await self?.flush() } } }; monitor.start(queue:monitorQueue); updatePermission() }

    func requestPermission(){ manager.requestAlwaysAuthorization() }
    func start() async {
        guard CLLocationManager.locationServicesEnabled() else { message="Ubicación del iPhone está apagada"; return }
        guard manager.authorizationStatus == .authorizedAlways else { requestPermission(); message="Autoriza ubicación: Siempre"; return }
        tracking=true; manager.startUpdatingLocation(); message="Obteniendo primera ubicación…"
        // El servidor solo inicia el viaje después de que exista una posición fresca.
    }
    func stop(){ tracking=false; manager.stopUpdatingLocation(); message="Seguimiento detenido" }
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager){ updatePermission() }
    private func updatePermission(){ switch manager.authorizationStatus { case .authorizedAlways: permission="Siempre ✓"; case .authorizedWhenInUse: permission="Falta permiso Siempre"; case .denied,.restricted: permission="Ubicación bloqueada"; default: permission="Permiso pendiente" } }
    func locationManager(_ manager: CLLocationManager,didUpdateLocations locations:[CLLocation]) { guard tracking, let l=locations.last, l.horizontalAccuracy >= 0, l.horizontalAccuracy <= 100, abs(l.timestamp.timeIntervalSinceNow)<180 else{return}; let f=GPSFix(l); lastFix=f; enqueue(f); Task { await flush(); await ensureTripStarted() } }
    func locationManager(_ manager: CLLocationManager,didFailWithError error:Error){ message="GPS: \(error.localizedDescription)" }

    private func enqueue(_ f:GPSFix){ var q=load(); if !q.contains(where:{$0.id==f.id}) { q.append(f) }; save(q); queued=q.count }
    private func load()->[GPSFix]{ guard let d=UserDefaults.standard.data(forKey:queueKey) else{return []}; return (try? JSONDecoder().decode([GPSFix].self,from:d)) ?? [] }
    private func save(_ q:[GPSFix]){ if let d=try? JSONEncoder().encode(Array(q.suffix(5000))){UserDefaults.standard.set(d,forKey:queueKey)} }
    func flush() async { guard network,!sending else{return}; sending=true; defer{sending=false}; var q=load(); while let f=q.first { do { var r=URLRequest(url:gpsURL); r.httpMethod="POST"; r.setValue("application/json",forHTTPHeaderField:"Content-Type"); let iso=ISO8601DateFormatter().string(from:f.timestamp); r.httpBody=try JSONSerialization.data(withJSONObject:["device_id":token,"latitude":f.latitude,"longitude":f.longitude,"accuracy":f.accuracy,"timestamp":iso]); let (d,res)=try await URLSession.shared.data(for:r); guard let h=res as? HTTPURLResponse,h.statusCode==200, let j=try JSONSerialization.jsonObject(with:d) as? [String:Any], j["accepted"] as? Bool == true else { server=false; break }; server=true; lastSent=Date(); q.removeFirst(); save(q); queued=q.count } catch { server=false; break } } }
    private func ensureTripStarted() async { guard tracking,server,lastSent != nil else{return}; do { var r=URLRequest(url:nativeURL);r.httpMethod="POST";r.setValue("application/json",forHTTPHeaderField:"Content-Type");r.httpBody=try JSONSerialization.data(withJSONObject:["action":"start_trip","device_token":token]);let(d,res)=try await URLSession.shared.data(for:r);if let h=res as? HTTPURLResponse,h.statusCode==200,let j=try JSONSerialization.jsonObject(with:d) as? [String:Any],let s=j["status"] as? String,s=="started"||s=="already_active" { message="RECORRIDO ACTIVO · GPS transmitiendo" } }catch{} }
}

enum Keychain {
    static let service="com.mountaincreativityschool.transporte", account="native-device-token"
    static func token()->String { if let d=read(),let s=String(data:d,encoding:.utf8),s.count==64{return s}; let bytes=(0..<32).map{_ in UInt8.random(in:0...255)};let s=bytes.map{String(format:"%02x",$0)}.joined();save(Data(s.utf8));return s }
    private static func read()->Data? { let q:[String:Any]=[kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:service,kSecAttrAccount as String:account,kSecReturnData as String:true];var x:CFTypeRef?;guard SecItemCopyMatching(q as CFDictionary,&x)==errSecSuccess else{return nil};return x as? Data }
    private static func save(_ d:Data){ let q:[String:Any]=[kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:service,kSecAttrAccount as String:account];SecItemDelete(q as CFDictionary);var a=q;a[kSecValueData as String]=d;a[kSecAttrAccessible as String]=kSecAttrAccessibleAfterFirstUnlock;SecItemAdd(a as CFDictionary,nil) }
}

struct ContentView: View {
 @EnvironmentObject var t:Tracker
 var body: some View { NavigationStack { ScrollView { VStack(spacing:16) {
   Text("Mountain Transporte").font(.largeTitle.bold()); Text("Native Tracker").foregroundStyle(.secondary)
   status("GPS", t.lastFix == nil ? "Esperando" : String(format:"± %.0f m",t.lastFix!.accuracy))
   status("Permiso",t.permission); status("Internet",t.network ? "Conectado ✓":"Sin conexión"); status("Servidor",t.server ? "Mountain conectado ✓":"Esperando"); status("Cola offline","\(t.queued) posiciones")
   if let d=t.lastSent { status("Último envío",d.formatted(date:.omitted,time:.standard)) }
   Text(t.message).font(.headline).multilineTextAlignment(.center).padding()
   Button(t.tracking ? "FINALIZAR SEGUIMIENTO" : "INICIAR RECORRIDO") { if t.tracking { t.stop() } else { Task { await t.start() } } }.buttonStyle(.borderedProminent).controlSize(.large)
   if t.permission != "Siempre ✓" { Button("Autorizar ubicación Siempre"){t.requestPermission()}.buttonStyle(.bordered) }
   Text("El viaje solo se declara iniciado después de obtener una ubicación real y confirmar su recepción en Mountain.").font(.footnote).foregroundStyle(.secondary).multilineTextAlignment(.center)
 }.padding() }.navigationBarTitleDisplayMode(.inline) } }
 func status(_ a:String,_ b:String)->some View { HStack { Text(a).bold();Spacer();Text(b) }.padding().background(.thinMaterial,in:RoundedRectangle(cornerRadius:14)) }
}
