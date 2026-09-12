import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const guide=read('mounty-guide-v1.js');
const finalFlow=read('final-flow-v1.js');
const html=read('index.html');
const sw=read('sw.js');
const guard=JSON.parse(read('RELEASE_GUARD.json'));

test('R5.3 principal audit marker is published',()=>assert.ok(html.includes('MF-R5.3-PRINCIPAL-AUDIT-20260912')));
test('release guard protects all five audience levels',()=>assert.deepEqual(guard.architecture.communication_audiences,['all_families','cycle','classroom','single_student','selected_students']));
test('Mounty exposes whole community',()=>assert.ok(guide.includes('Toda la comunidad')));
test('Mounty exposes cycle',()=>assert.ok(guide.includes('Un ciclo')));
test('Mounty exposes grade',()=>assert.ok(guide.includes('Un grado')));
test('Mounty exposes one student',()=>assert.ok(guide.includes('Un estudiante')));
test('Mounty exposes selected students',()=>assert.ok(guide.includes('Estudiantes seleccionados')));
test('single student is normalized to selected_students backend model',()=>assert.ok(guide.includes("a.type==='single_student'")&&guide.includes("type:'selected_students'")));
test('single student requires explicit student selection',()=>assert.ok(guide.includes('Selecciona un estudiante.')));
test('dashboard Crear con Mounty is intercepted by unified flow',()=>assert.ok(finalFlow.includes("['broadcast','mountyCompose']")));
test('broadcast is intercepted by unified flow',()=>assert.ok(finalFlow.includes("['broadcast','mountyCompose']")));
test('media evidence is intercepted by unified flow',()=>assert.ok(finalFlow.includes("a==='media'")));
test('service worker keeps R5.3 audited release',()=>assert.ok(sw.includes('mountain-family-shell-r5-3-principal-audit-20260912')));
test('human review remains mandatory',()=>assert.equal(guard.architecture.mounty.human_approval_required,true));
