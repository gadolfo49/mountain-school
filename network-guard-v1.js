(()=>{'use strict';
const isNetwork=v=>/load failed|failed to fetch|networkerror|network request failed/i.test(String(v?.message||v||''));
const show=()=>{const t=document.querySelector('#toast');if(t){t.textContent='La conexión se interrumpió por un momento. Intenta nuevamente.';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3200)}};
window.addEventListener('unhandledrejection',e=>{if(isNetwork(e.reason)){e.preventDefault();show()}});
window.addEventListener('error',e=>{if(isNetwork(e.error||e.message)){e.preventDefault();show()}});
window.MountainNetworkGuard={isNetwork,show};
})();