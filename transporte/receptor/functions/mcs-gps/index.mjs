import {makeHandler} from './core.mjs';
// verify_jwt=false is required for the tracker's protocol. Authentication is NOT
// disabled: a high-entropy device credential is verified by the service-only RPC.
function backendKey() {
  const values=Deno.env.get('SUPABASE_SECRET_KEYS');
  if (values) { const key=JSON.parse(values).default; if (typeof key==='string' && key) return key; }
  const legacy=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!legacy) throw Error('missing_backend_key');
  return legacy;
}
const rpc = async args => {
  const key=backendKey(),base=Deno.env.get('SUPABASE_URL');
  if (!base || !base.startsWith('https://')) throw Error('missing_backend_url');
  const headers={'Content-Type':'application/json','apikey':key};
  if (key.startsWith('eyJ')) headers.Authorization='Bearer '+key;
  const result=await fetch(base+'/rest/v1/rpc/mcs_receive_gps',{
    method:'POST',headers,body:JSON.stringify(args),signal:AbortSignal.timeout(8000)
  });
  if (!result.ok) { await result.body?.cancel(); throw Error('database_unavailable'); }
  return await result.json();
};
Deno.serve(makeHandler({rpc}));
