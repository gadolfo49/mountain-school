(()=>{'use strict';
const SURL='https://kbtjkjdjvkorekzzhxcx.supabase.co';
const SKEY='sb_publishable_4uce_DqQ7LpVOSnGAGnfmA_ZXEUWofq';
const client=window.supabase?.createClient(SURL,SKEY);
async function openAdmin(){
  const pin=prompt('PIN de administrador');
  if(pin===null)return;
  if(!/^\d{4}$/.test(pin)){alert('Introduce 4 digitos.');return;}
  try{
    const r=await fetch(SURL+'/functions/v1/mountain-admin-pin',{method:'POST',headers:{'Content-Type':'application/json','apikey':SKEY},body:JSON.stringify({pin})});
    const j=await r.json();
    if(!r.ok)throw new Error(j.error||'PIN incorrecto.');
    const x=await client.auth.verifyOtp({token_hash:j.token_hash,type:'magiclink'});
    if(x.error)throw x.error;
    location.reload();
  }catch(e){alert(e.message||'No se pudo entrar.');}
}
document.addEventListener('DOMContentLoaded',()=>{
  const b=document.querySelector('[data-authmode="admin"]');
  if(!b)return;
  b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openAdmin();},true);
});
})();