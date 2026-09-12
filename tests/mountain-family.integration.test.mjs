import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const files={
 runtime:read('runtime-v2.js'),network:read('network-guard-v1.js'),app:read('app-v3.js'),gate:read('admin-gate.js'),access:read('access-v6.js'),users:read('admin-users-v1.js'),adminData:read('admin-data-v1.js'),docs:read('admin-documents-v1.js'),familyDocs:read('family-documents-v1.js'),school:read('school-admin-v1.js'),academic:read('academic-v2.js'),guide:read('mounty-guide-v1.js'),teacher:read('teacher-experience-v1.js'),notifications:read('notifications-v1.js'),finalFlow:read('final-flow-v1.js'),sw:read('sw.js'),html:read('index.html')
};
const manifest=JSON.parse(read('manifest.webmanifest'));
const has=(s,n)=>s.includes(n);
const contracts=[];
const add=(name,fn)=>contracts.push([name,fn]);
const contains=(file,text)=>()=>assert.ok(has(files[file],text),`${file} must contain ${text}`);
const notContains=(file,text)=>()=>assert.equal(has(files[file],text),false,`${file} must not contain ${text}`);

for(const [name,source] of Object.entries(files))if(name!=='html'&&name!=='sw')add(`${name} parses`,()=>assert.doesNotThrow(()=>new vm.Script(source)));

add('R5 marker',contains('html','MF-R5-FORENSIC-20260912'));
add('Supabase dependency is pinned',contains('html','@supabase/supabase-js@2.116.0'));
add('floating Supabase dependency removed',notContains('html','@supabase/supabase-js@2"></script>'));
add('runtime loads before app',()=>assert.ok(files.html.indexOf('runtime-v2.js')<files.html.indexOf('app-v3.js')));
add('legacy auth not loaded',notContains('html','auth-v5.js'));
add('runtime exposes one shared client',contains('runtime','window.supabase.createClient=(url,key,options)=>url===URL&&key===KEY?sb'));
add('runtime caches authoritative profile',contains('runtime','currentProfile'));
add('runtime has role helper',contains('runtime','hasRole'));
add('runtime infers MIME',contains('runtime','inferMime'));
add('runtime normalizes network errors',contains('runtime','friendlyError'));
add('runtime emits auth state',contains('runtime','mountain:auth'));

for(const g of ['Maternal','Infantes','Párvulos','Pre-Kínder','Kínder','Preprimario'])add(`grade ${g}`,contains('app',g));
for(const m of ['Desayuno','Almuerzo','Siesta','Higiene','Actividad pedagógica'])add(`routine ${m}`,contains('app',m));
add('admin gate uses PIN endpoint',contains('gate','mountain-admin-pin'));
add('admin gate verifies OTP',contains('gate','verifyOtp'));
add('family uses password sign-in',contains('access','signInWithPassword'));
add('family registration endpoint',contains('access','mountain-register-cors'));
add('wrong role signs out',contains('access','auth.signOut()'));

add('admin user list',contains('users','Usuarios y accesos'));
add('admin invite',contains('users',"action:'invite'"));
add('admin link student',contains('users',"action:'link_student'"));
add('classrooms saved atomically',contains('users',"action:'set_classrooms'"));
add('frontend no longer loops assign calls',notContains('users',"action:'assign_classroom'"));
add('frontend no longer loops unassign calls',notContains('users',"action:'unassign_classroom'"));
add('protected admin account displayed',contains('users','Cuenta administrativa principal protegida'));

add('payment amount validation',contains('adminData','amount<=0'));
add('pickup id validation',contains('adminData','exactamente 4 dígitos'));
add('student future DOB blocked',contains('school','no puede estar en el futuro'));
add('teacher planning uses classroom staff',contains('school',"from('mf_classroom_staff')"));
add('academic observation has all core domains',()=>{for(const x of ['Lenguaje','Cognición','Socioemocional','Psicomotricidad fina','Psicomotricidad gruesa','Matemáticas','Lectoescritura','Inglés','Creatividad','Autonomía'])assert.ok(has(files.academic,x))});

add('documents require physical file',contains('docs','Selecciona el archivo que deseas guardar.'));
add('documents use prepare signed upload',contains('docs','prepare_document_upload'));
add('documents rollback failed upload',contains('docs','cancel_document_upload'));
add('documents infer MIME',contains('docs','inferMime'));
add('documents open Safari tab synchronously',contains('docs',"window.open('about:blank'"));
add('family docs use signed reads',contains('familyDocs','signed_document_read'));
add('family docs show document owner context',contains('familyDocs','Toda la familia'));
add('family docs Safari-safe open',contains('familyDocs',"window.open('about:blank'"));

add('Mounty validates selected audience',contains('guide','Selecciona al menos un estudiante.'));
add('Mounty previews recipients before creation',contains('guide','mf_broadcast_preview_count'));
add('Mounty rejects zero recipients',contains('guide','No hay familias activas vinculadas'));
add('Mounty teacher scope comes from classroom staff',contains('guide',"from('mf_classroom_staff')"));
add('Mounty upload prepares',contains('guide',"action:'prepare_upload'"));
add('Mounty upload finalizes',contains('guide',"action:'finalize_upload'"));
add('Mounty cancels failed upload',contains('guide',"action:'cancel_upload'"));
add('Mounty broadcast rollback deletes draft',contains('guide',".delete().eq('id',broadcastId).eq('status','draft')"));
add('Mounty requires human review copy',contains('guide','Revísalo antes de enviar'));
add('Mounty supports community audience',contains('guide','Toda la comunidad'));
add('Mounty supports cycle audience',contains('guide','Un ciclo'));
add('Mounty supports classroom audience',contains('guide','Un grado'));
add('Mounty supports selected students',contains('guide','Estudiantes seleccionados'));
add('Mounty keeps 24h transient media',contains('guide','24 horas'));

add('teacher observer no longer watches whole body',notContains('teacher','observer.observe(document.body'));
add('teacher home has render guard',contains('teacher','teacherPanel'));
add('teacher context only assigned classrooms',contains('teacher',"from('mf_classroom_staff')"));
add('teacher empty-grade state',contains('teacher','Aún no tienes grados asignados'));

add('notifications clear interval',contains('notifications','clearInterval(timer)'));
add('notifications remove visibility listener',contains('notifications',"removeEventListener('visibilitychange'"));
add('notifications reset on signout',contains('notifications',"event==='SIGNED_OUT'"));
add('notification preferences retained',contains('notifications','Preferencias de notificación'));

add('attachment clicks intercepted before legacy handler',contains('finalFlow','[data-openfile]'));
add('attachment uses signed read',contains('finalFlow',"action:'signed_read'"));
add('attachment Safari-safe tab',contains('finalFlow',"window.open('about:blank'"));
add('broadcast routes through Mounty',contains('finalFlow',"a==='broadcast'"));
add('evidence routes through Mounty',contains('finalFlow',"a==='media'"));

add('network guard catches rejected promises',contains('network','unhandledrejection'));
add('network guard user message',contains('network','La conexión se interrumpió'));
add('PWA standalone',()=>assert.equal(manifest.display,'standalone'));
add('R5 service worker cache',contains('sw','mountain-family-shell-r5-forensic-20260912'));
add('service worker caches runtime',contains('sw',"'./runtime-v2.js'"));
add('service worker excludes Supabase',contains('sw',"hostname.includes('supabase.co')"));
add('service worker never caches auth legacy',notContains('sw','auth-v5.js'));

for(const [name,source] of Object.entries(files))if(!['html','sw'].includes(name))add(`${name} has no malformed &quot entity`,()=>assert.equal(/&quot(?!;)/.test(source),false));

for(const [name,fn] of contracts)test(name,fn);
