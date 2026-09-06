// MCS private commissioning receiver. No libraries or request logging.
export class InputError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
function numeric(value) {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') return NaN;
  return Number(value);
}
function instant(value) {
  if (typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value))) {
    const n = Number(value); return n < 1e11 ? n * 1000 : n;
  }
  if (typeof value === 'string' && /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)) return Date.parse(value);
  return NaN;
}
export function normalize(payload) {
  if (!object(payload)) throw new InputError(400, 'invalid_payload');
  const credential = payload.device_id ?? payload.deviceid ?? payload.id;
  if (typeof credential !== 'string' || !/^[a-f0-9]{64}$/.test(credential)) throw new InputError(401, 'unauthorized');
  let entries = payload.location;
  if (entries === undefined) entries = [payload];
  else if (object(entries)) entries = [entries];
  if (!Array.isArray(entries) || entries.length < 1 || entries.length > 50) throw new InputError(400, 'invalid_batch');
  const fixes = entries.map(entry => {
    if (!object(entry)) throw new InputError(400, 'invalid_fix');
    const c = object(entry.coords) ? entry.coords : entry;
    return {
      lat: numeric(c.latitude ?? c.lat), lon: numeric(c.longitude ?? c.lon),
      accuracy: numeric(c.accuracy), captured: instant(entry.timestamp),
      invalid: entry.valid === false || entry.valid === 'false' || entry.valid === 0 || entry.valid === '0'
    };
  });
  const valid = fixes.filter(f => !f.invalid && Number.isFinite(f.lat) && Math.abs(f.lat) <= 90 &&
    Number.isFinite(f.lon) && Math.abs(f.lon) <= 180 && Number.isFinite(f.accuracy) && f.accuracy >= 0 &&
    f.accuracy <= 100 && Number.isFinite(f.captured) && Math.abs(f.captured) < 8.64e15);
  valid.sort((a,b) => b.captured - a.captured);
  return {credential, fix: valid[0] ?? null};
}
export async function boundedBody(request, maximum = 65536) {
  const length = request.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > maximum)) throw new InputError(413, 'payload_too_large');
  if (!request.body) return '';
  const reader = request.body.getReader();
  const pieces=[]; let size=0;
  try {
    while (true) {
      const {done,value} = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size>maximum) { await reader.cancel(); throw new InputError(413,'payload_too_large'); }
      pieces.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let at=0;
  for (const p of pieces) { bytes.set(p,at); at+=p.byteLength; }
  try { return new TextDecoder('utf-8',{fatal:true}).decode(bytes); }
  catch { throw new InputError(400,'invalid_encoding'); }
}
export async function requestPayload(request) {
  const url = new URL(request.url);
  if (url.search.length > 8192) throw new InputError(413,'payload_too_large');
  if (request.method === 'GET') return Object.fromEntries(url.searchParams);
  if (request.method !== 'POST') throw new InputError(405,'method_not_allowed');
  const body = await boundedBody(request);
  const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  try {
    if (type === 'application/json') return JSON.parse(body);
    if (type === 'application/x-www-form-urlencoded') return Object.fromEntries(new URLSearchParams(body));
    if (body === '' && url.search) return Object.fromEntries(url.searchParams);
  } catch { throw new InputError(400,'invalid_payload'); }
  throw new InputError(415,'unsupported_content_type');
}
export async function sha256(text) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
export function reply(status, body) {
  return new Response(JSON.stringify(body), {status,headers:{
    'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private',
    'Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff',
    ...(status===429 ? {'Retry-After':'60'} : {}),...(status===405 ? {'Allow':'GET, POST'} : {})
  }});
}
export function makeHandler({rpc, now=Date.now}) {
  return async request => {
    try {
      const url=new URL(request.url);
      if (request.method === 'GET' && !url.search) return reply(200,{service:'MCS GPS',status:'private_test_receiver',family_tracking:false});
      const {credential,fix}=normalize(await requestPayload(request));
      const t=now(), fresh=fix && fix.captured>=t-180000 && fix.captured<=t+5000;
      const body=await rpc({p_hash:await sha256(credential),p_lat:fresh?fix.lat:null,p_lon:fresh?fix.lon:null,
        p_accuracy:fresh?fix.accuracy:null,p_captured_at:fresh?new Date(fix.captured).toISOString():null});
      if (!object(body) || ![200,401,403,429].includes(body.code) || typeof body.status!=='string') throw Error('invalid_server_reply');
      return reply(body.code,{status:body.status,accepted:body.accepted===true});
    } catch(error) {
      if (error instanceof InputError) return reply(error.status,{status:error.message,accepted:false});
      return reply(503,{status:'temporarily_unavailable',accepted:false});
    }
  };
}
