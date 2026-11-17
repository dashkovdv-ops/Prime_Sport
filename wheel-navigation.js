(() => {
  'use strict';
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function range(page){
    const start=page.offsetTop;
    // Leave a reading margin without requiring a gesture just for bottom padding.
    const padding=parseFloat(getComputedStyle(page).paddingBottom)||0;
    return {start,end:start+Math.max(0,page.offsetHeight-innerHeight-Math.max(0,padding-24))};
  }
  function mount({pages,getPage,navigate,navigationLocked}){
    let lastTime=-Infinity,direction=0,total=0,mode=null;
    function nestedScroller(target){
      for(let node=target;node&&node!==document.body&&node!==document.documentElement;node=node.parentElement){
        if(/^(auto|scroll)$/.test(getComputedStyle(node).overflowY)&&node.scrollHeight>node.clientHeight+1)return node;
      }
      return null;
    }
    function onWheel(event){
      const target=event.target instanceof Element?event.target:null;
      if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||
        !Number.isFinite(event.deltaY)||!event.deltaY||Math.abs(event.deltaX)>=Math.abs(event.deltaY)||
        target?.closest('input,textarea,select')||target?.isContentEditable||document.querySelector('dialog[open]'))return;
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
      const now=performance.now(),sign=Math.sign(delta);
      if(now-lastTime>220||sign!==direction){total=0;mode=null;}
      lastTime=now;direction=sign;
      event.preventDefault();
      const nested=nestedScroller(target);
      if(nested){
        nested.scrollTop=clamp(nested.scrollTop+delta,0,nested.scrollHeight-nested.clientHeight);
        mode='nested';total=0;return;
      }
      // Momentum remains consumed even after the transition lock expires.
      if(mode==='slide'||mode==='nested')return;
      if(navigationLocked()){mode='slide';return;}
      const index=getPage(),bounds=range(pages[index]),position=window.scrollY;
      if(sign>0&&position<bounds.end-1||sign<0&&position>bounds.start+1){
        window.scrollTo({top:clamp(position+delta,bounds.start,bounds.end),behavior:'instant'});
        mode='content';total=0;return;
      }
      // Reaching a content boundary requires a fresh gesture to turn the page.
      if(mode==='content')return;
      total+=Math.abs(delta);
      if(total<48)return;
      mode='slide';
      const next=index+sign;
      if(next>=0&&next<pages.length)navigate(next,{align:sign<0?'end':'start'});
    }
    document.addEventListener('wheel',onWheel,{passive:false});
    return {destroy:()=>document.removeEventListener('wheel',onWheel)};
  }
  window.PrimeWheelNavigation={mount,range};
})();
