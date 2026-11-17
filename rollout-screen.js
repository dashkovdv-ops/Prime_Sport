(() => {
  'use strict';
  function mount(container, api) {
    const stages=[...container.querySelectorAll('.rollout-stage')];
    const dialog=document.getElementById('rollout-dialog');
    const mobile=matchMedia('(max-width:1100px)');
    const localAnimations=new Set(), seen=new Set(), partAnimations=new Map();
    let opener=null,originalGutter='',scrollTop=0,started=false,visible=false,pending=false;
    function run(element,frames,timing) {
      const animation=api.animate(element,frames,timing);
      if(animation){localAnimations.add(animation);animation.finished.catch(()=>{}).finally(()=>localAnimations.delete(animation));}
      return animation;
    }
    function stopParts(stage,returnHome=false) {
      stage.querySelectorAll('[data-rollout-part]').forEach(part=>{
        const animation=partAnimations.get(part);
        if(!animation)return;
        const transform=getComputedStyle(part).transform;
        animation.cancel();partAnimations.delete(part);
        if(returnHome&&transform!=='none'){
          const returning=run(part,[{transform},{transform:'none'}],{duration:400});
          if(returning)partAnimations.set(part,returning);
        }
      });
    }
    function reset(stage,immediate=false) {
      if(stage.classList.contains('is-active')||immediate)stopParts(stage,!immediate&&api.canMove()&&visible);
      stage.classList.remove('is-active');
      stage.querySelector('.rollout-icon-motion').removeAttribute('style');
    }
    function settle() {
      localAnimations.forEach(animation=>{try{animation.finish();}catch{animation.cancel();}});
      stages.forEach(stage=>reset(stage,true));
      container.getAnimations({subtree:true}).forEach(animation=>{try{animation.finish();}catch{animation.cancel();}});
    }
    function revealStage(stage,index,delay) {
      seen.add(index);
      run(stage.querySelector('.rollout-point'),[{opacity:0,transform:'scale(.9)'},{opacity:1,transform:'scale(1)'}],{duration:220,delay});
      run(stage.querySelector('.rollout-stage-control'),[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:550,delay});
      run(stage.querySelector('h3'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:400,delay:delay+70});
      stage.querySelectorAll('li').forEach((item,i)=>run(item,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:400,delay:delay+180+i*60}));
    }
    function enter() {
      pending=true;
      if(visible)reveal();
    }
    function reveal() {
      pending=false;
      settle();seen.clear();started=true;
      run(container.querySelector('h2'),[{opacity:.1,transform:'translateY(16px)',filter:'blur(3px)'},{opacity:1,transform:'none',filter:'blur(0px)'}],{duration:550});
      run(container.querySelector('.rollout-route'),[{clipPath:mobile.matches?'inset(0 0 100% 0)':'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:1250,delay:200});
      stages.forEach((stage,i)=>{
        const rect=stage.getBoundingClientRect();
        if(!mobile.matches)revealStage(stage,i,350+i*250);
        else if(rect.top<innerHeight&&rect.bottom>0)revealStage(stage,i,200);
      });
    }
    function micro(stage) {
      stopParts(stage);
      const effects={
        pencil:[{transform:'translate(0px,0px)'},{transform:'translate(3px,-3px)'},{transform:'translate(0px,0px)'}],
        photos:[{transform:'translateX(0px)'},{transform:'translateX(-5px)'},{transform:'translateX(0px)'}],
        play:[{transform:'scale(1)'},{transform:'scale(1.04)'},{transform:'scale(1)'}],
        slider:[{transform:'translateX(0px)'},{transform:'translateX(6px)'},{transform:'translateX(0px)'}],
        tiles:[{transform:'translateX(0px) rotate(0deg)'},{transform:'translateX(5px) rotate(2deg)'},{transform:'translateX(0px) rotate(0deg)'}],
        arrows:[{transform:'rotate(0deg)'},{transform:'rotate(18deg)'},{transform:'rotate(0deg)'}]
      };
      stage.querySelectorAll('[data-rollout-part]').forEach(part=>{
        const animation=run(part,effects[part.dataset.rolloutPart],{duration:650});
        if(animation)partAnimations.set(part,animation);
      });
    }
    function activate(stage,event) {
      if(!api.canMove()||!visible)return;
      const first=!stage.classList.contains('is-active');
      stages.forEach(other=>{if(other!==stage)reset(other);});
      stage.classList.add('is-active');
      const rect=stage.getBoundingClientRect();
      const x=event?.clientX===undefined?0:Math.max(-1,Math.min(1,(event.clientX-rect.left-rect.width/2)/(rect.width/2)));
      const y=event?.clientY===undefined?0:Math.max(-1,Math.min(1,(event.clientY-rect.top-rect.height/2)/(rect.height/2)));
      stage.querySelector('.rollout-icon-motion').style.cssText=`--rollout-x:${(x*4).toFixed(2)}px;--rollout-y:-8px;--rollout-rx:${(-y*2).toFixed(2)}deg;--rollout-ry:${(x*2).toFixed(2)}deg;--rollout-scale:1.03`;
      if(first)micro(stage);
    }
    function cloneIcon(svg) {
      const copy=svg.cloneNode(true),ids=new Map();
      copy.querySelectorAll('[id]').forEach(node=>{const old=node.id;node.id='detail-'+old;ids.set(old,node.id);});
      copy.querySelectorAll('*').forEach(node=>[...node.attributes].forEach(attribute=>{
        let value=attribute.value;ids.forEach((id,old)=>{value=value.replaceAll(`url(#${old})`,`url(#${id})`);});
        if(value!==attribute.value)node.setAttribute(attribute.name,value);
      }));
      return copy;
    }
    function open(button) {
      if(document.querySelector('dialog[open]'))return;
      const stage=button.closest('.rollout-stage');opener=button;api.stop();settle();
      dialog.querySelector('#rollout-dialog-title').textContent=stage.querySelector('h3').textContent;
      dialog.querySelector('.rollout-dialog-number').textContent=stage.querySelector('.rollout-number').textContent;
      dialog.querySelector('.rollout-dialog-icon').replaceChildren(cloneIcon(stage.querySelector('svg')));
      dialog.querySelector('.rollout-dialog-actions').replaceChildren(...[...stage.querySelectorAll('li')].map(item=>item.cloneNode(true)));
      const root=document.documentElement,width=document.body.getBoundingClientRect().width;
      originalGutter=root.style.scrollbarGutter;scrollTop=window.scrollY;
      window.scrollTo({top:scrollTop,behavior:'instant'});root.classList.add('fit-view-open');
      if(Math.abs(document.body.getBoundingClientRect().width-width)>.5)root.style.scrollbarGutter='auto';
      window.scrollTo({top:scrollTop,behavior:'instant'});dialog.showModal();
      run(dialog,[{opacity:0,transform:'scale(.98)'},{opacity:1,transform:'scale(1)'}],{duration:300});
      dialog.querySelector('[data-rollout-close]').focus();
    }
    stages.forEach(stage=>{
      stage.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')activate(stage,event);});
      stage.addEventListener('pointermove',event=>{if(event.pointerType!=='touch')activate(stage,event);},{passive:true});
      stage.addEventListener('pointerleave',()=>{if(!stage.contains(document.activeElement))reset(stage);});
      stage.addEventListener('focusin',()=>activate(stage));
      stage.addEventListener('focusout',event=>{if(!stage.contains(event.relatedTarget))reset(stage);});
      stage.querySelector('[data-rollout-open]').addEventListener('click',event=>open(event.currentTarget));
    });
    dialog.querySelector('[data-rollout-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{
      if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}
    });
    dialog.addEventListener('close',()=>{
      const root=document.documentElement;
      if(!document.querySelector('dialog[open]'))root.classList.remove('fit-view-open');
      root.style.scrollbarGutter=originalGutter;
      window.scrollTo({top:scrollTop,behavior:'instant'});opener?.focus({preventScroll:true});api.wake();
    });
    new IntersectionObserver(entries=>entries.forEach(entry=>{
      visible=entry.isIntersecting&&entry.intersectionRatio>=.15;
      if(visible&&pending)reveal();
      else if(!visible)settle();
    }),{threshold:[0,.15]}).observe(container);
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      const index=stages.indexOf(entry.target);
      if(started&&mobile.matches&&entry.isIntersecting&&!seen.has(index)&&!document.hidden&&!dialog.open)revealStage(entry.target,index,0);
    }),{threshold:.12});stages.forEach(stage=>observer.observe(stage));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();});
    return {enter,settle};
  }
  window.PrimeRolloutScreen={mount};
})();
