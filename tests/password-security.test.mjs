import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const access=read('access-v6.js');

test('new family accounts require at least 8 characters',()=>{
  assert.ok(access.includes("signup?8:6"));
  assert.ok(access.includes('contraseña de al menos 8 caracteres'));
});

test('password recovery requires at least 8 characters',()=>{
  assert.ok(access.includes("if(password.length<8)"));
  assert.ok(access.includes("$('#password').minLength=8"));
});

test('existing accounts retain login compatibility',()=>{
  assert.ok(access.includes("loginMinimum=mode==='signup-family'?8:6"));
});
