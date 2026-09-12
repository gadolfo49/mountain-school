(()=>{'use strict';
function intercept(e){const b=e.target.closest?.('[data-action]');if(!b)return;const a=b.dataset.action;if(a==='broadcast'&&window.MountyGuide?.compose){e.preventDefault();e.stopImmediatePropagation();window.MountyGuide.compose();return}if(a==='media'&&window.MountyGuide?.evidence){e.preventDefault();e.stopImmediatePropagation();window.MountyGuide.evidence();return}}
document.addEventListener('click',intercept,true);
})();