'use strict';
// Reference policy, NOT a deployed API. Dependencies must be server-side trusted adapters.
const {windowAt,validFix}=require('../web/core.js');
module.exports=function createSnapshot({authenticate,loadAccess,loadPosition,clock=Date.now}){
 for(const fn of [authenticate,loadAccess,loadPosition,clock])if(typeof fn!=='function')throw new TypeError('Server adapters required');
 const response=(status,body)=>({status,headers:{'Cache-Control':'no-store, private','Vary':'Authorization','Content-Type':'application/json'},body});
 return async function snapshot(request){
  try{
   const user=await authenticate(request); // Verify token/session, never trust a client userId/role.
   if(!user?.id)return response(401,{status:'authentication_required'});
   let now=clock(),window=windowAt(now);
   if(!window.open)return response(403,{status:'outside_hours'});
   const access=await loadAccess(user.id,request.routeId); // DB membership and today's trip.
   if(!access||access.userId!==user.id||access.routeId!==request.routeId||!access.active||access.serviceDate!==window.date)return response(403,{status:'not_authorized'});
   const position=await loadPosition(access.routeId);
   now=clock();window=windowAt(now); // Check again after I/O; an in-flight read may cross 08:30.
   if(!window.open||access.serviceDate!==window.date)return response(403,{status:'outside_hours'});
   if(!position||position.routeId!==access.routeId||!validFix(position,now))return response(200,{status:'no_fresh_signal',serverTime:now,expiresAt:window.closesAt});
   // Deliberate allowlist: no names, stop lists, other families, historic track or private tokens.
   return response(200,{status:'live',serverTime:now,expiresAt:window.closesAt,position:{lat:position.lat,lng:position.lng,accuracy:position.accuracy,capturedAt:position.capturedAt}});
  }catch{return response(503,{status:'temporarily_unavailable'});}
 };
};
