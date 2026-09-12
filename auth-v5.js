(()=>{'use strict';
let mode='family';
const $=s=>document.querySelector(s),show=(el,on)=>el?.classList.toggle('hidden',!on);
function landing(){show($('#authLanding'),true);show($('#authForm'),false);$('#authMsg').textContent=''}
function enterLocal(role){try{localStorage.setItem('mf-role',role)}catch(e){} location.href='./family/'}
function form(m){
  if(m==='admin') return enterLocal('admin');
  mode=m;show($('#authLanding'),false);show($('#authForm'),true);
  const signup=m==='signup-family';show($('#nameField'),signup);show($('#confirmField'),signup);show($('#emailField'),true);
  $('#passwordLabel').textContent='CONTRASEÑA';$('#password').type='password';$('#password').inputMode='text';$('#password').maxLength=128;$('#password').minLength=4;$('#password').autocomplete=signup?'new-password':'current-password';
  const map={family:['Familia','Accede a la información de tus hijos.'],staff:['Maestra','Acceso para personal docente.'],'signup-family':['Registro de familia','Crea tu acceso familiar de forma sencilla.']};
  const item=map[m]||map.family;$('#authTitle').textContent=item[0];$('#authHint').textContent=item[1];$('#loginBtn').textContent=signup?'Crear cuenta y entrar':'Entrar';$('#authMsg').textContent='';$('#password').value='';
}
function submit(){
  if(mode==='signup-family'){
    const name=$('#fullName').value.trim(),email=$('#email').value.trim(),password=$('#password').value,p2=$('#password2').value;
    if(!name||!email)return void($('#authMsg').textContent='Completa tu nombre y correo.');
    if(password.length<4)return void($('#authMsg').textContent='Usa una contraseña de al menos 4 caracteres.');
    if(password!==p2)return void($('#authMsg').textContent='Las contraseñas no coinciden.');
    try{localStorage.setItem('mf-family-name',name);localStorage.setItem('mf-family-email',email)}catch(e){}
    return enterLocal('family');
  }
  if(mode==='family') return enterLocal('family');
  if(mode==='staff') return enterLocal('teacher');
}
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-authmode]').forEach(b=>b.addEventListener('click',()=>form(b.dataset.authmode)));$('#authBack')?.addEventListener('click',landing);const b=$('#loginBtn');if(b){b.onclick=null;b.addEventListener('click',submit)}['email','password','password2'].forEach(id=>$('#'+id)?.addEventListener('keydown',e=>{if(e.key==='Enter')submit()}));});
window.MountainAuthV5={landing,form};
})();