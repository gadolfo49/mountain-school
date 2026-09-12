import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const access=read('access-v6.js');
const users=read('admin-users-v1.js');
const account=read('account-controls-v1.js');
const html=read('index.html');
const guard=JSON.parse(read('RELEASE_GUARD.json'));

test('new managed accounts require temporary passwords with at least 8 characters',()=>{
  assert.equal(guard.architecture.auth.minimum_new_or_recovered_password_length,8);
  assert.equal(guard.architecture.auth.family_teacher_provisioning,'administrator-only');
  assert.ok(users.includes('password.length<8'));
  assert.ok(users.includes("action:'create'"));
});

test('temporary password must be changed on first login',()=>{
  assert.equal(guard.architecture.auth.temporary_password_required_change,true);
  assert.ok(access.includes('must_change_password'));
  assert.ok(access.includes('Crea tu contraseña personal'));
  assert.ok(access.includes('must_change_password:false'));
});

test('password recovery and self-service changes require at least 8 characters',()=>{
  assert.ok(access.includes("password.length<8"));
  assert.ok(account.includes('p.length<8'));
  assert.ok(account.includes('auth.updateUser'));
});

test('existing accounts retain login compatibility',()=>{
  assert.equal(guard.architecture.auth.legacy_login_compatibility_minimum,6);
  assert.ok(access.includes('password.length<6'));
});

test('public family self-registration is disabled',()=>{
  assert.equal(guard.architecture.auth.public_family_self_registration,false);
  assert.equal(html.includes('signup-family'),false);
  assert.equal(access.includes('mountain-register-cors'),false);
});
