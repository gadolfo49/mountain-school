import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const files={
 runtime:read('runtime-v2.js'),network:read('network-guard-v1.js'),app:read('app-v3.js'),gate:read('admin-gate.js'),access:read('access-v6.js'),users:read('admin-users-v1.js'),adminData:read('admin-data-v1.js'),docs:read('admin-documents-v1.js'),familyDocs:read('family-documents-v1.js'),school:read('school-admin-v1.js'),academic:read('academic-v2.js'),guide:read('mounty-guide-v1.js'),teacher:read('teacher-experience-v1.js'),notifications:read('notifications-v1.js'),finalFlow:read('final-flow-v1.js'),sw:read('sw.js'),html:read('index.html')
};
const manifest=JSON.parse(read('manifest.webmanifest'));
const guard=JSON.parse(read('RELEASE_GUARD.json'));
const has=(s,n)=>s.includes(n),contracts=[],add=(n,f)=>contracts.push([n,f]),contains=(f,t)=>()=>assert.ok(has(files[f],t),`${f} must contain ${t}`),notContains=(f,t)=>()=>assert.equal(has(files[f],t),false,`${f} must not contain ${t}`);
for(const [name,source] of Object.entries(files))if(name!=='html'&&name!=='sw')add(`${name} parses`,()=>assert.doesNotThrow(()=>new vm.Script(source)));

add('protected release marker',()=>assert.equal(guard.release,'MF-R5.1-MOUNTY-RELIABILITY-20260912'));
add('protected baseline status',()=>assert.equal(guard.status,'protected-baseline'));
add('transport stays separate',()=>assert.equal(guard.architecture.transport_app_is_separate,true));
add('exact six-grade baseline',()=>assert.deepEqual(guard.architecture.grades,['Maternal','Infantes','Párvulos','Pre-Kínder','Kínder','Preprimario']));
add('Mounty human approval invariant',()=>assert.equal(guard.architecture.mounty.human_approval_required,true));
add('Mounty strict grounding invariant',()=>assert.equal(guard.architecture.mounty.strict_context_grounding,true));
add('Mounty structured error invariant',()=>assert.equal(guard.architecture.mounty.structured_error_reference,true));
add('Mounty retry invariant',()=>assert.equal(guard.architecture.mounty.retry_transient_ai_failures,true));

add('R5.1 marker',contains('html','MF-R5.1-MOUNTY-RELIABILITY-20260912'));
add('Supabase dependency pinned',contains('html','@supabase/supabase-js@2.116.0'));
add('runtime loads before app',()=>assert.ok(files.html.indexOf('runtime-v2.js')<files.html.indexOf('app-v3.js')));
add('legacy auth absent',notContains('html','auth-v5.js'));
add('retired admin endpoint absent from shell',notContains('html','mountain-admin-simple'));
add('retired register endpoint absent from shell',notContains('html','mountain-register\''));
add('temporary Mounty QA endpoint absent from shell',notContains('html','mounty-qa-temp'));
add('temporary role QA endpoint absent from shell',notContains('html','final-role-qa-temp'));
add('runtime shared client',contains('runtime','window.supabase.createClient=(url,key,options)=>url===URL&&key===KEY?sb'));
add('runtime profile cache',contains('runtime','currentProfile'));
add('runtime auth events',contains('runtime','mountain:auth'));
add('runtime R5.1 version',contains('runtime','R5.1-MOUNTY-RELIABILITY'));
add('runtime parses Edge Function bodies',contains('runtime','parseFunctionError'));
add('runtime centralized invoke',contains('runtime','invokeFunction'));
add('runtime refreshes 401 session',contains('runtime','refreshSession'));
add('runtime supports retryable function errors',contains('runtime','last?.retryable'));
add('runtime hides raw non-2xx message',contains('runtime','edge function returned a non-2xx status code'));
add('runtime infers MIME',contains('runtime','inferMime'));

for(const g of ['Maternal','Infantes','Párvulos','Pre-Kínder','Kínder','Preprimario'])add(`grade ${g}`,contains('app',g));
for(const m of ['Desayuno','Almuerzo','Siesta','Higiene','Actividad pedagógica'])add(`routine ${m}`,contains('app',m));
add('admin PIN endpoint',contains('gate','mountain-admin-pin'));add('admin OTP',contains('gate','verifyOtp'));add('family password login',contains('access','signInWithPassword'));add('family registration',contains('access','mountain-register-cors'));

add('admin users panel',contains('users','Usuarios y accesos'));add('atomic classroom assignment',contains('users',"action:'set_classrooms'"));add('protected admin',contains('users','Cuenta administrativa principal protegida'));
add('payment validation',contains('adminData','amount<=0'));add('pickup validation',contains('adminData','exactamente 4 dígitos'));add('future DOB blocked',contains('school','no puede estar en el futuro'));add('teacher planning scope',contains('school',"from('mf_classroom_staff')"));
add('academic core domains',()=>{for(const x of ['Lenguaje','Cognición','Socioemocional','Psicomotricidad fina','Psicomotricidad gruesa','Matemáticas','Lectoescritura','Inglés','Creatividad','Autonomía'])assert.ok(has(files.academic,x))});

add('document physical file required',contains('docs','Selecciona el archivo que deseas guardar.'));add('document signed upload',contains('docs','prepare_document_upload'));add('document rollback',contains('docs','cancel_document_upload'));add('family signed document read',contains('familyDocs','signed_document_read'));

add('Mounty centralized function invoke',contains('guide','rt.invokeFunction'));
add('Mounty compose retries',contains('guide',"invoke('mounty-compose',body,{retry:true})"));
add('Mounty no raw functions.invoke compose',notContains('guide',"sb.functions.invoke('mounty-compose'"));
add('Mounty displays request reference',contains('guide','Referencia:'));
add('Mounty generating state',contains('guide','Mounty está redactando…'));
add('Mounty max context',contains('guide','maxlength="5000"'));
add('Mounty selected audience validation',contains('guide','Selecciona al menos un estudiante.'));
add('Mounty previews recipients',contains('guide','mf_broadcast_preview_count'));
add('Mounty zero recipient guard',contains('guide','No hay familias activas vinculadas'));
add('Mounty teacher classroom scope',contains('guide',"from('mf_classroom_staff')"));
add('Mounty media prepare',contains('guide',"action:'prepare_upload'"));
add('Mounty media finalize',contains('guide',"action:'finalize_upload'"));
add('Mounty media cancel',contains('guide',"action:'cancel_upload'"));
add('Mounty draft rollback',contains('guide',".delete().eq('id',broadcastId).eq('status','draft')"));
add('Mounty human review',contains('guide','Revísalo antes de enviar'));
for(const x of ['Toda la comunidad','Un ciclo','Un grado','Estudiantes seleccionados','24 horas'])add(`Mounty UI ${x}`,contains('guide',x));

add('teacher observer scoped',notContains('teacher','observer.observe(document.body'));add('teacher render guard',contains('teacher','teacherPanel'));add('teacher classroom staff scope',contains('teacher',"from('mf_classroom_staff')"));
add('notification timer cleanup',contains('notifications','clearInterval(timer)'));add('notification listener cleanup',contains('notifications',"removeEventListener('visibilitychange'"));
add('attachment signed read',contains('finalFlow',"action:'signed_read'"));add('attachment Safari tab',contains('finalFlow',"window.open('about:blank'"));
add('network rejected promises',contains('network','unhandledrejection'));add('PWA standalone',()=>assert.equal(manifest.display,'standalone'));
add('R5.1 service worker cache',contains('sw','mountain-family-shell-r5-1-mounty-reliability-20260912'));add('SW caches runtime',contains('sw',"'./runtime-v2.js'"));add('SW excludes Supabase',contains('sw',"hostname.includes('supabase.co')"));add('SW no legacy auth',notContains('sw','auth-v5.js'));
for(const [name,source] of Object.entries(files))if(!['html','sw'].includes(name))add(`${name} no malformed quote entity`,()=>assert.equal(/&quot(?!;)/.test(source),false));
for(const [name,fn] of contracts)test(name,fn);
