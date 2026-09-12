(()=>{'use strict';
const URL='https://kbtjkjdjvkorekzzhxcx.supabase.co';
const KEY='sb_publishable_4uce_DqQ7LpVOSnGAGnfmA_ZXEUWofq';
if(!window.supabase?.createClient)throw new Error('Supabase JS no está disponible.');
const factory=window.supabase.createClient.bind(window.supabase);
const sb=factory(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const originalCreate=window.supabase.createClient.bind(window.supabase);
window.supabase.createClient=(url,key,options)=>url===URL&&key===KEY?sb:originalCreate(url,key,options);
let profile=null,profileUserId=null,profilePromise=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isNetworkError=e=>/load failed|failed to fetch|networkerror|network request failed|network connection was lost|internet connection appears to be offline/i.test(String(e?.message||e||''));
const friendlyError=e=>isNetworkError(e)?'La conexión se interrumpió por un momento. Intenta nuevamente.':String(e?.message||e||'No se pudo completar la operación.');
const inferMime=file=>{const name=String(file?.name||'').toLowerCase(),ext=name.includes('.')?name.split('.').pop():'';const map={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',heic:'image/heic',heif:'image/heif',mp4:'video/mp4',mov:'video/quicktime',webm:'video/webm',mp3:'audio/mpeg',m4a:'audio/x-m4a',wav:'audio/wav',pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',txt:'text/plain',csv:'text/csv'};return String(file?.type||'').trim()||map[ext]||'application/octet-stream'};
async function getProfile(force=false){const {data:{session}}=await sb.auth.getSession();if(!session){profile=null;profileUserId=null;profilePromise=null;return null}if(!force&&profile&&profileUserId===session.user.id)return profile;if(!force&&profilePromise)return profilePromise;profilePromise=(async()=>{const {data,error}=await sb.from('mf_profiles').select('id,full_name,role,active').eq('id',session.user.id).maybeSingle();if(error)throw error;profile=data||null;profileUserId=session.user.id;return profile})().finally(()=>{profilePromise=null});return profilePromise}
function clearProfile(){profile=null;profileUserId=null;profilePromise=null}
sb.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||!session)clearProfile();else if(profileUserId&&profileUserId!==session.user.id)clearProfile()});
async function role(){return(await getProfile())?.role||null}
async function isAdmin(){return(await role())==='admin'}
async function isStaff(){return['admin','teacher'].includes(await role())}
window.MountainRuntime=Object.freeze({URL,KEY,sb,esc,friendlyError,isNetworkError,inferMime,getProfile,clearProfile,role,isAdmin,isStaff,version:'R5-FORENSIC'});
})();