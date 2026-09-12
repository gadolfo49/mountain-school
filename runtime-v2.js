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
const isNetworkError=e=>/load failed|failed to fetch|networkerror|network request failed|network connection was lost|internet connection appears to be offline|functionsfetcherror|functionsrelayerror/i.test(String(e?.message||e||''));
const friendlyError=e=>{if(isNetworkError(e))return 'La conexión se interrumpió por un momento. Intenta nuevamente.';const m=String(e?.message||e||'No se pudo completar la operación.');if(/edge function returned a non-2xx status code/i.test(m))return 'El servicio respondió con un error. Intenta nuevamente.';return m};
const inferMime=file=>{const name=String(file?.name||'').toLowerCase(),ext=name.includes('.')?name.split('.').pop():'';const map={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',heic:'image/heic',heif:'image/heif',mp4:'video/mp4',mov:'video/quicktime',webm:'video/webm',mp3:'audio/mpeg',m4a:'audio/x-m4a',wav:'audio/wav',pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',txt:'text/plain',csv:'text/csv'};return String(file?.type||'').trim()||map[ext]||'application/octet-stream'};
async function getProfile(force=false){const {data:{session}}=await sb.auth.getSession();if(!session){profile=null;profileUserId=null;profilePromise=null;return null}if(!force&&profile&&profileUserId===session.user.id)return profile;if(!force&&profilePromise)return profilePromise;profilePromise=(async()=>{const {data,error}=await sb.from('mf_profiles').select('id,full_name,role,active').eq('id',session.user.id).maybeSingle();if(error)throw error;profile=data||null;profileUserId=session.user.id;return profile})().finally(()=>{profilePromise=null});return profilePromise}
function clearProfile(){profile=null;profileUserId=null;profilePromise=null}
function currentProfile(){return profile}
function hasRole(...roles){return !!profile?.active&&roles.includes(profile.role)}
function notify(event,session){window.dispatchEvent(new CustomEvent('mountain:auth',{detail:{event,user_id:session?.user?.id||null}}))}
sb.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||!session){clearProfile();notify(event,null);return}if(profileUserId&&profileUserId!==session.user.id)clearProfile();setTimeout(()=>getProfile(true).then(()=>notify(event,session)).catch(()=>notify(event,session)),0)});
async function role(){return(await getProfile())?.role||null}
async function isAdmin(){return(await role())==='admin'}
async function isStaff(){return['admin','teacher'].includes(await role())}
async function parseFunctionError(error){if(!error)return null;let payload=null,status=error?.context?.status||error?.status||null;try{const ctx=error.context?.clone?error.context.clone():error.context;if(ctx?.json)payload=await ctx.json()}catch{try{const ctx=error.context?.clone?error.context.clone():error.context;if(ctx?.text){const t=await ctx.text();payload=t?{error:t}:null}}catch{}}
 const err=new Error(String(payload?.error||error.message||'No se pudo completar la operación.'));err.name='MountainFunctionError';err.code=payload?.code||error.code||'FUNCTION_ERROR';err.retryable=Boolean(payload?.retryable);err.requestId=payload?.request_id||null;err.status=status;err.payload=payload;return err}
async function invokeFunction(name,body,options={}){const retry=Boolean(options.retry),maxAttempts=retry?2:1;let last=null;for(let attempt=1;attempt<=maxAttempts;attempt++){const {data,error}=await sb.functions.invoke(name,{body});if(!error&&!data?.error)return data;if(!error&&data?.error){const e=new Error(String(data.error));e.code=data.code||'FUNCTION_ERROR';e.retryable=Boolean(data.retryable);e.requestId=data.request_id||null;e.payload=data;last=e}else last=await parseFunctionError(error);if(last?.status===401&&attempt===1){try{await sb.auth.refreshSession();continue}catch{}}if(attempt<maxAttempts&&(last?.retryable||isNetworkError(last))){await new Promise(r=>setTimeout(r,500));continue}throw last||new Error('No se pudo completar la operación.')}throw last||new Error('No se pudo completar la operación.')}
window.MountainRuntime=Object.freeze({URL,KEY,sb,esc,friendlyError,isNetworkError,inferMime,getProfile,currentProfile,clearProfile,hasRole,role,isAdmin,isStaff,parseFunctionError,invokeFunction,version:'R5.1-MOUNTY-RELIABILITY'});
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>getProfile().catch(()=>{}),0));
})();