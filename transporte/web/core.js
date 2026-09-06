/* MCS Transporte: pure, dependency-free helpers. MIT for this new file only. */
(function (root) {
  'use strict';
  const formatter = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Santo_Domingo', year:'numeric', month:'2-digit', day:'2-digit', weekday:'short', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'});
  function windowAt(now = Date.now()) {
    if (!Number.isFinite(now)) throw new TypeError('Invalid server time');
    const p = Object.fromEntries(formatter.formatToParts(now).map(x => [x.type,x.value]));
    const minute = Number(p.hour)*60+Number(p.minute);
    const weekday = ['Mon','Tue','Wed','Thu','Fri'].includes(p.weekday);
    return {open:weekday && minute>=360 && minute<510, date:`${p.year}-${p.month}-${p.day}`, time:`${p.hour}:${p.minute}:${p.second}`, closesAt:now+(510-minute)*60000-Number(p.second)*1000-((now%1000+1000)%1000)};
  }
  function validPoint(p) {
    return !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat)<=90 && Math.abs(p.lng)<=180;
  }
  function validFix(p, now=Date.now()) {
    return validPoint(p) && Number.isFinite(p.capturedAt) && p.capturedAt<=now+5000 && now-p.capturedAt<=30000 && Number.isFinite(p.accuracy) && p.accuracy>=0 && p.accuracy<=100;
  }
  function meters(a,b) {
    if (!validPoint(a)||!validPoint(b)) throw new TypeError('Invalid coordinates');
    const rad=x=>x*Math.PI/180;
    const h=Math.sin(rad(b.lat-a.lat)/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(rad(b.lng-a.lng)/2)**2;
    return 6371000*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
  }
  function estimate(points) {
    if (!Array.isArray(points)||points.length<2||!points.every(validPoint)) throw new TypeError('Two valid points required');
    const legs=points.slice(1).map((p,i)=>{const distance=meters(points[i],p)*1.3;return {distance,duration:distance/(22000/3600)}});
    return {points,legs,distance:legs.reduce((s,x)=>s+x.distance,0),duration:legs.reduce((s,x)=>s+x.duration,0),kind:'approximation-not-road-routing'};
  }
  function atElapsed(route,seconds) {
    let left=Math.max(0,Number.isFinite(seconds)?seconds:0);
    for(let i=0;i<route.legs.length;i++){
      const leg=route.legs[i];
      if(left<=leg.duration && leg.duration>0){const f=left/leg.duration,a=route.points[i],b=route.points[i+1];return {lat:a.lat+(b.lat-a.lat)*f,lng:a.lng+(b.lng-a.lng)*f};}
      left-=leg.duration;
    }
    return {...route.points[route.points.length-1]};
  }
  function arrivalSeconds(route,stopIndex){return route.legs.slice(0,stopIndex+1).reduce((sum,x)=>sum+x.duration,0);}
  function distanceLabel(m){return Number.isFinite(m)?(m<1000?`${Math.round(m)} m`:`${(m/1000).toFixed(1)} km`):'No disponible';}
  const api={windowAt,validPoint,validFix,meters,estimate,atElapsed,arrivalSeconds,distanceLabel};
  root.MCSCore=Object.freeze(api);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
