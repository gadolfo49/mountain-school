/* Deliberately demonstration-only: no GPS, Supabase, auth or push subscription. */
(function(){
'use strict';
const $=id=>document.getElementById(id),C=MCSCore;
const startTime=Date.parse('2026-09-07T06:00:00-04:00');
let school={name:'Colegio (verificar punto)',lat:18.461167,lng:-69.302111};
let stops=[{name:'Familia ficticia A',lat:18.484518,lng:-69.313358},{name:'Familia ficticia B',lat:18.48188,lng:-69.30114}];
let route,started=false,playing=false,seconds=0,now=startTime,map=null,layers=null,boarded=new Set(),fired=new Set(),events=[];
function node(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
function selected(){return Number($('family').value)||0;}
function event(key,message,recipient=null){if(fired.has(key))return;fired.add(key);events.unshift({message,recipient,time:C.windowAt(now).time.slice(0,5)});}
function updateRoute(){route=C.estimate([school,...stops,school]);$('progress').max=String(Math.ceil(route.duration));$('route-summary').textContent=`${stops.length} paradas ficticias · ${C.distanceLabel(route.distance)} aproximados · ${Math.round(route.duration/60)} min sin esperas ni trafico. Se sale del colegio y se regresa al colegio.`;}
function familyOptions(){const old=selected();$('family').replaceChildren(...stops.map((s,i)=>{const o=node('option',s.name);o.value=i;return o;}));$('family').value=String(Math.min(old,stops.length-1));}
function planForm(){const rows=[school,...stops].map((s,i)=>{const row=node('div',undefined,'stop');for(const [key,label] of [['name',i===0?'Colegio':'Alias de prueba'],['lat','Latitud'],['lng','Longitud']]){const l=node('label',label),input=node('input');input.value=s[key];input.dataset.index=i;input.dataset.field=key;if(key!=='name'){input.type='number';input.step='any';input.min=key==='lat'?-90:-180;input.max=key==='lat'?90:180;}input.maxLength=70;l.append(input);row.append(l);}if(i>0){const b=node('button','Quitar');b.disabled=stops.length<=1;b.onclick=()=>{stops.splice(i-1,1);reset();familyOptions();planForm();updateRoute();};row.append(b);}return row;});$('stops').replaceChildren(...rows);}
function reset(){started=false;playing=false;seconds=0;now=startTime;boarded.clear();fired.clear();events=[];render();}
function destroyMap(){if(map){map.remove();map=null;layers=null;}$('map').hidden=true;}
function paintMap(position){
 if(!window.L){$('status').textContent+=' Mapa no disponible: comprueba la conexion.';destroyMap();return;}
 $('map').hidden=false;
 if(!map){map=L.map('map',{scrollWheelZoom:false}).setView([school.lat,school.lng],13);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(map);layers=L.layerGroup().addTo(map);map.on('tileerror',()=>{});}
 layers.clearLayers();const own=stops[selected()];
 L.circleMarker([school.lat,school.lng],{radius:8}).bindTooltip(node('span','Colegio: punto del prototipo')).addTo(layers);
 L.circleMarker([own.lat,own.lng],{radius:8}).bindTooltip(node('span',own.name)).addTo(layers);
 const icon=L.divIcon({html:'&#128652;',className:'bus',iconSize:[38,38],iconAnchor:[19,19]});
 L.marker([position.lat,position.lng],{icon}).bindTooltip(node('span','Autobus SIMULADO')).addTo(layers);
 // No route polyline or other families' stop markers in the family view.
 map.fitBounds([[school.lat,school.lng],[own.lat,own.lng],[position.lat,position.lng]],{padding:[35,35],maxZoom:15,animate:false});map.invalidateSize();
}
function render(){
 const access=started && C.windowAt(now).open;
 $('clock').textContent=started?C.windowAt(now).time.slice(0,5):'--:--';$('progress').value=seconds;
 for(const id of ['pause','progress','cutoff'])$(id).disabled=!access;
 $('pause').textContent=playing?'Pausar':'Continuar';
 $('start').disabled=started;$('board').disabled=!access||boarded.has(selected())||seconds<C.arrivalSeconds(route,selected())||seconds>=route.duration;
 if(!started){$('headline').textContent='Seguimiento real no habilitado';$('status').textContent='Esta pantalla no representa la ubicacion actual del autobus.';$('signal').textContent='SIN CONEXION REAL';}
 else if(!access){$('headline').textContent='Seguimiento cerrado a las 8:30';$('status').textContent='El ensayo ha ocultado la ubicacion. En produccion el servidor tambien debe dejar de entregar coordenadas.';$('signal').textContent='FUERA DE HORARIO';}
 else{const eta=Math.max(0,C.arrivalSeconds(route,selected())-seconds);$('headline').textContent=seconds>=route.duration?'Autobus de ensayo en el colegio':boarded.has(selected())?'Abordaje de prueba confirmado':eta>0?`Llegada simulada en ${Math.max(1,Math.ceil(eta/60))} min`:'Parada de prueba alcanzada';$('status').textContent='DEMOSTRACION: posicion y tiempos sinteticos, no GPS ni trafico real.';$('signal').textContent='SIMULADO · 15x';}
 $('closed').hidden=access;if(access)paintMap(C.atElapsed(route,seconds));else destroyMap();
 const list=events.filter(e=>e.recipient===null||e.recipient===selected());$('events').replaceChildren(...(list.length?list.map(e=>{const row=node('div',undefined,'event');row.append(node('time',e.time),node('p',`[Ensayo] ${e.message}`));return row;}):[node('p','No hay avisos de prueba para esta familia.')]));
}
function evaluateEvents(){for(let i=0;i<stops.length;i++){const eta=C.arrivalSeconds(route,i)-seconds;if(eta>0&&eta<=360)event(`prepare-${i}`,'Ten al nino listo: faltan aproximadamente 6 minutos en este ensayo.',i);if(eta>0&&eta<=120)event(`near-${i}`,'El autobus simulado esta proximo a tu parada.',i);if(eta<=0)event(`stop-${i}`,'El recorrido de ensayo alcanzo tu parada. Esto no confirma que el nino abordo.',i);}if(seconds>=route.duration){playing=false;for(let i=0;i<stops.length;i++)event(`school-${i}`,boarded.has(i)?'Autobus de ensayo en el colegio; abordaje de prueba registrado. La recepcion del nino requiere confirmacion del personal.':'Autobus de ensayo en el colegio. No hay abordaje registrado para esta familia.',i);}}
$('start').onclick=()=>{reset();started=true;playing=true;event('start','El autobus de ensayo salio del colegio.');evaluateEvents();render();};
$('pause').onclick=()=>{playing=!playing;render();};
$('cutoff').onclick=()=>{now=Date.parse('2026-09-07T08:30:00-04:00');playing=false;render();};
$('board').onclick=()=>{boarded.add(selected());event(`board-${selected()}`,'Abordaje ficticio confirmado por el operador del ensayo.',selected());render();};
$('reset').onclick=reset;$('family').onchange=render;
$('progress').oninput=()=>{playing=false;const value=Number($('progress').value);if(value<seconds){fired.clear();events=[];boarded.clear();event('restart','Se reinicio el historial al retroceder el ensayo.');}seconds=value;now=startTime+seconds*1000;evaluateEvents();render();};
$('family-tab').onclick=()=>{$('family-view').hidden=false;$('plan-view').hidden=true;$('family-tab').classList.add('selected');$('plan-tab').classList.remove('selected');render();};
$('plan-tab').onclick=()=>{playing=false;$('family-view').hidden=true;$('plan-view').hidden=false;$('family-tab').classList.remove('selected');$('plan-tab').classList.add('selected');};
$('add').onclick=()=>{if(stops.length>=20){$('route-summary').textContent='Maximo 20 paradas de ensayo.';return;}stops.push({name:`Familia ficticia ${stops.length+1}`,lat:school.lat+0.005,lng:school.lng});reset();familyOptions();planForm();updateRoute();};
$('calculate').onclick=()=>{try{const next=[school,...stops].map(s=>({...s}));for(const input of $('stops').querySelectorAll('input')){if(!input.value.trim())throw Error('Completa todos los campos.');next[Number(input.dataset.index)][input.dataset.field]=input.dataset.field==='name'?input.value.trim().slice(0,70):Number(input.value);}if(next.some(s=>!s.name||!C.validPoint(s)))throw Error('Completa alias y coordenadas validas.');school=next[0];stops=next.slice(1);reset();familyOptions();updateRoute();}catch(e){$('route-summary').textContent=e.message;}};
setInterval(()=>{if(started&&playing){seconds=Math.min(route.duration,seconds+15);now=startTime+seconds*1000;if(!C.windowAt(now).open)playing=false;else evaluateEvents();render();}},1000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)playing=false;else render();});
familyOptions();planForm();updateRoute();render();
if('serviceWorker'in navigator && location.protocol==='https:')navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
})();
