(function(){
  'use strict';
  function mount(header){
    const menu=header.querySelector('.header-menu'),viewport=menu.querySelector('.page-links'),links=[...viewport.querySelectorAll('a')];
    const previous=menu.querySelector('[data-menu-scroll="-1"]'),next=menu.querySelector('[data-menu-scroll="1"]');
    const controls=header.querySelector('#controls'),motionSlot=header.querySelector('.header-motion-controls');
    const pause=controls.querySelector('[data-action="pause"]'),replay=controls.querySelector('[data-action="replay"]');
    const small=matchMedia('(max-width:680px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
    function update(){
      const end=Math.max(0,viewport.scrollWidth-viewport.clientWidth),left=viewport.scrollLeft;
      previous.disabled=left<=1;next.disabled=left>=end-1;
      menu.classList.toggle('can-scroll-left',!previous.disabled);menu.classList.toggle('can-scroll-right',!next.disabled);
    }
    function reveal(link,instant=true){
      if(!link)return;
      const r=viewport.getBoundingClientRect(),a=link.getBoundingClientRect();let delta=0;
      if(a.left<r.left+8)delta=a.left-r.left-8;else if(a.right>r.right-8)delta=a.right-r.right+8;
      if(delta)viewport.scrollBy({left:delta,behavior:instant||reduced.matches?'instant':'smooth'});
      update();
    }
    function revealCurrent(){reveal(viewport.querySelector('[aria-current="page"]'));}
    function scroll(direction){
      const current=viewport.scrollLeft,end=Math.max(0,viewport.scrollWidth-viewport.clientWidth),r=viewport.getBoundingClientRect();
      const desired=Math.max(0,Math.min(end,current+direction*Math.max(100,viewport.clientWidth*.8)));
      const positions=links.filter(a=>a.offsetWidth).map(a=>a.getBoundingClientRect().left-r.left+current-8);
      let target=direction>0?(positions.find(x=>x>=desired)??end):([...positions].reverse().find(x=>x<=desired)??0);
      target=Math.max(0,Math.min(end,target));viewport.scrollTo({left:target,behavior:reduced.matches?'instant':'smooth'});update();
    }
    function reflow(){
      const active=document.activeElement;
      if(small.matches){motionSlot.hidden=false;motionSlot.append(pause,replay);}else{controls.append(pause,replay);motionSlot.hidden=true;}
      if(active===pause||active===replay)active.focus({preventScroll:true});
      requestAnimationFrame(revealCurrent);
    }
    previous.addEventListener('click',()=>scroll(-1));next.addEventListener('click',()=>scroll(1));
    viewport.addEventListener('scroll',update,{passive:true});viewport.addEventListener('focusin',e=>reveal(e.target.closest('a')));
    menu.addEventListener('keydown',event=>{
      if(event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();event.stopPropagation();
      const current=event.target.closest('a'),index=links.indexOf(current);
      if(current||event.key==='Home'||event.key==='End'){
        const target=event.key==='Home'?links[0]:event.key==='End'?links[links.length-1]:links[Math.max(0,Math.min(links.length-1,index+(event.key==='ArrowRight'?1:-1)))];
        target.focus({preventScroll:true});reveal(target,false);
      }else scroll(event.key==='ArrowRight'?1:-1);
    });
    menu.addEventListener('wheel',event=>{
      if(event.ctrlKey||event.metaKey||viewport.scrollWidth<=viewport.clientWidth)return;
      event.preventDefault();event.stopPropagation();
      viewport.scrollLeft+=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;update();
    },{passive:false});
    small.addEventListener('change',reflow);new ResizeObserver(revealCurrent).observe(viewport);
    document.fonts.ready.then(revealCurrent);reflow();update();
    return {revealCurrent,update};
  }
  window.PrimeHeaderNavigation={mount};
}());
