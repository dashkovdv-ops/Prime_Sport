(() => {
  'use strict';
  const ease='cubic-bezier(.16,1,.3,1)';
  const select=(root,selector)=>[...root.querySelectorAll(selector)];
  function composition(page){
    const all=selector=>select(page,selector),one=selector=>page.querySelector(selector);
    let heading=[],groups=[],floats=[],decorations=[];
    const float=(selector,kind,amplitude=3,sync=false)=>all(selector).map((el,i)=>({el,kind,amplitude,phase:sync?0:i*1.37,anchor:sync?one('.fit-portraits'):null}));
    switch(page.id){
      case 'home':heading=all('h1');groups=[...all('.hero-card'),one('.next-link')];floats=float('.hero-card>.motion-surface','hero');break;
      case 'agenda':heading=all('.agenda-heading');groups=[...all('.agenda-topic'),one('.agenda-timing')];floats=float('.agenda-timing','agenda',2);break;
      case 'why':heading=all('#why-title');groups=[...all('.float-unit'),one('.source-note')];floats=float('.float-unit>.motion-surface','panel');break;
      case 'cases':heading=all('.section-heading');groups=all('.case-button');floats=float('.case-cover','case-card');break;
      case 'case-sportmaster':heading=all('.section-heading');groups=[one('.sportmaster-task'),one('.sportmaster-results'),one('.sportmaster-test'),...all('.sportmaster-secondary>section'),one('.sportmaster-footer')];floats=float('.sportmaster-metric','metric',2);break;
      case 'case-kanzler':heading=all('.section-heading');groups=[one('.kanzler-task'),...all('.kanzler-primary>section'),...all('.kanzler-secondary>section'),one('.kanzler-footer')];floats=float('.kanzler-metric','metric',2);break;
      case 'case-funday':heading=all('.section-heading');groups=[one('.funday-task'),...all('.funday-primary>section'),...all('.funday-secondary>section'),one('.funday-footer')];floats=float('.funday-metric','metric',2);break;
      case 'process':heading=all('.section-heading');groups=all('.process-map');break;
      case 'prototype':heading=all('.prototype-heading');groups=all('.prototype-fragment');floats=float('.prototype-frame','prototype',2);break;
      case 'fit':heading=all('.fit-heading');groups=[one('.fit-comparison'),...all('.fit-info-unit'),one('.fit-takeaway')];floats=[...float('.fit-model>.motion-surface','fit-model',3,true),...float('.fit-icon','fit-icon',2)];break;
      case 'solution':heading=all('.solution-heading');groups=[...all('.solution-card'),one('.solution-takeaway')];floats=float('.solution-card>.motion-surface','solution-card');break;
      case 'benefits':heading=all('.benefits-heading');groups=all('.benefits-row');floats=float('.benefits-icon','benefits-icon',2);break;
      case 'rollout':heading=all(':scope>h2');groups=all('.rollout-stage');decorations=all('.rollout-route');floats=float('.rollout-icon-motion','rollout-icon',2);break;
      case 'costs':heading=all('.costs-heading');groups=[...all('.costs-row'),one('.costs-note')];floats=float('.costs-icon','costs-icon',2);break;
      case 'catalogue':heading=all('.catalogue-heading');groups=[one('.catalogue-before'),one('.catalogue-platform'),one('.catalogue-takeaway')];decorations=all('.catalogue-chevron');floats=[...float('.catalogue-media>.motion-surface','catalogue-media',2),...float('.catalogue-icon>.motion-surface','catalogue-icon',2)];break;
      case 'planning':heading=all('.planning-heading');groups=[one('.planning-data'),one('.planning-options'),one('.planning-takeaway')];decorations=all('.planning-arrow');floats=float('.planning-art','planning-icon',2);break;
      case 'flagship':heading=all('.flagship-heading');groups=[...all('.flagship-card'),one('.flagship-takeaway')];floats=float('.flagship-icon>.motion-surface','flagship-icon',2);break;
      case 'discussion':{
        heading=all('.discussion-heading');const items=all('.discussion-item');
        groups=innerWidth>680?items.reduce((rows,item,i)=>{if(i%2===0)rows.push([item]);else rows[rows.length-1].push(item);return rows;},[]):items;break;
      }
      case 'closing':heading=all('.closing-title,.closing-slash');groups=all('.closing-wish');break;
      default:heading=all(':scope>h2,:scope>.section-heading');groups=[...page.children].filter(el=>!heading.includes(el)&&el.tagName!=='SVG');
    }
    const entries=[];
    const add=(el,role,order)=>{if(!el)return;const fade=/footer|source-note|takeaway|costs-note/.test(el.className?.baseVal||el.className);entries.push({el,role,order,fade,done:false,started:false,animation:null,opacity:el.style.getPropertyValue('opacity'),priority:el.style.getPropertyPriority('opacity')});};
    heading.forEach(el=>add(el,'heading',0));
    groups.forEach((group,i)=>(Array.isArray(group)?group:[group]).forEach(el=>add(el,'body',Math.min(i,5))));
    decorations.forEach(el=>{add(el,'decoration',0);entries[entries.length-1].fade=true;});
    return {entries,floats};
  }
  function mount({pages,getPage,isPaused,isReduced,onReconcile=()=>{}}){
    let active=-1,pending=null,pendingOptions=null,entries=[],floats=[],arrivalFrame=0,floatFrame=0,readFrame=0,requestId=0,lastFrame=0;
    const plays={},pointer={x:0,y:0,active:false};let fontReady=false;
    // Keep reveal state for the entire visit, including when scrolling back.
    const plans=pages.map(composition),allEntries=plans.flatMap(plan=>plan.entries);
    const entryByElement=new Map(allEntries.map(entry=>[entry.el,entry])),inView=new Set();
    const hoverQuery=matchMedia('(hover: hover) and (pointer: fine)'),touchQuery=matchMedia('(pointer: coarse)');
    const canFloat=()=>hoverQuery.matches&&!isPaused()&&!isReduced()&&!document.hidden&&!document.querySelector('dialog[open]');
    const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(changes=>{
      changes.forEach(change=>{
        const entry=entryByElement.get(change.target);
        if(change.isIntersecting)inView.add(entry);
        else{inView.delete(entry);if(entry.animation)finish(entry);}
      });
      reveal();
    },{rootMargin:'0px 0px -20px 0px',threshold:0}):null;
    function restore(entry){
      if(entry.opacity)entry.el.style.setProperty('opacity',entry.opacity,entry.priority);else entry.el.style.removeProperty('opacity');
      entry.el.removeAttribute('data-pm-hidden');entry.el.classList.remove('pm-entering');
    }
    function finish(entry){const animation=entry.animation;entry.animation=null;if(animation)animation.cancel();restore(entry);entry.done=true;inView.delete(entry);observer?.unobserve(entry.el);}
    function finishAll(){entries.forEach(finish);}
    function prepare(entry){
      const animation=entry.animation;entry.animation=null;if(animation)animation.cancel();restore(entry);
      entry.done=false;entry.started=false;
      if(!observer||isPaused()||isReduced()){finish(entry);return;}
      entry.el.style.opacity='0';entry.el.setAttribute('data-pm-hidden','');observer.observe(entry.el);
    }
    function resetFloats(){
      cancelAnimationFrame(floatFrame);floatFrame=0;
      floats.forEach(f=>{if(f.translate)f.el.style.setProperty('translate',f.translate,f.priority);else f.el.style.removeProperty('translate');f.el.classList.remove('pm-float-live');f.x=f.y=0;});
    }
    function visible(el){const rect=el.getBoundingClientRect(),header=document.querySelector('.site-header')?.getBoundingClientRect().bottom||88;return rect.bottom>header+4&&rect.top<innerHeight-20&&rect.width>0&&rect.height>0;}
    function wake(){if(!floatFrame&&active>=0&&pending===null&&canFloat()&&floats.length){lastFrame=performance.now();floatFrame=requestAnimationFrame(frame);}}
    function frame(now){
      floatFrame=0;if(!canFloat()||pending!==null)return;
      const blend=1-Math.exp(-10*Math.min((now-lastFrame)/1000,.05));lastFrame=now;let moving=false;
      floats.forEach(f=>{
        if(f.entry&&!f.entry.done||!visible(f.el)){
          if(f.translate)f.el.style.setProperty('translate',f.translate,f.priority);else f.el.style.removeProperty('translate');
          f.el.classList.remove('pm-float-live');f.x=f.y=0;return;
        }
        const rect=(f.anchor||f.el).getBoundingClientRect(),offsetX=f.anchor?0:f.x,offsetY=f.anchor?0:f.y;
        const inside=pointer.active&&pointer.x>=rect.left-offsetX&&pointer.x<=rect.right-offsetX&&pointer.y>=rect.top-offsetY&&pointer.y<=rect.bottom-offsetY;
        const nx=inside?Math.max(-1,Math.min(1,(pointer.x-(rect.left-offsetX+rect.width/2))/(rect.width/2))):0;
        const targetY=Math.sin(now/7000*Math.PI*2+f.phase)*f.amplitude-(inside?4:0);
        f.x+=(nx*2-f.x)*blend;f.y+=(targetY-f.y)*blend;
        f.el.style.translate=`${f.x.toFixed(3)}px ${f.y.toFixed(3)}px`;
        f.el.classList.add('pm-float-live');moving=true;
      });
      if(moving)floatFrame=requestAnimationFrame(frame);
    }
    function reveal(initial=false){
      if(document.hidden)return;
      if(isPaused()||isReduced()){allEntries.forEach(finish);resetFloats();return;}
      if(document.querySelector('dialog[open]'))return;
      const batch=[...inView].filter(e=>!e.started&&!e.done&&visible(e.el));
      const orders=[...new Set(batch.filter(e=>e.role==='body').map(e=>e.order))];
      batch.forEach(entry=>{
        entry.started=true;entry.el.removeAttribute('data-pm-hidden');entry.el.classList.add('pm-entering');
        const touch=touchQuery.matches,duration=entry.role==='decoration'||entry.fade?300:touch?380:440;
        const delay=entry.role==='heading'?0:Math.min(touch?90:180,(initial?40:0)+(touch?35:60)*Math.max(0,orders.indexOf(entry.order)));
        const base=getComputedStyle(entry.el).transform,rest=base==='none'?'':` ${base}`;
        const frames=entry.fade?[{opacity:0},{opacity:1}]:[{opacity:0,transform:`translateY(${touch?12:18}px)${rest}`},{opacity:1,transform:`translateY(0px)${rest}`}];
        const animation=entry.el.animate(frames,{duration,delay,easing:ease,fill:'both'});entry.animation=animation;
        animation.finished.then(()=>{if(entry.animation===animation){finish(entry);wake();}}).catch(()=>{});
      });wake();
    }
    function start(index,initial=false){
      pending=null;pendingOptions=null;active=index;plays[pages[index].id]=(plays[pages[index].id]||0)+1;
      if(isPaused()){finishAll();return;}reveal(initial);
    }
    function request(index,{top=scrollY,instant=false,force=false,passive=false,replay=false}={}){
      if(index===active&&pending===null&&!force){reveal();return;}
      ++requestId;const token=requestId;cancelAnimationFrame(arrivalFrame);arrivalFrame=0;resetFloats();
      const plan=plans[index];entries=plan.entries;floats=plan.floats.map(f=>({...f,x:0,y:0,translate:f.el.style.getPropertyValue('translate'),priority:f.el.style.getPropertyPriority('translate'),entry:entries.find(e=>e.el.contains(f.el))}));
      if(replay)entries.forEach(prepare);
      // Native scrolling must reveal content while the finger is still moving.
      if(passive){start(index);return;}
      pending=index;active=-1;
      const bounds=window.PrimeWheelNavigation.range(pages[index]);
      pendingOptions={top,instant,passive,align:!passive&&Math.abs(top-bounds.start)<2?'start':!passive&&Math.abs(top-bounds.end)<2?'end':'position'};
      const started=performance.now();let previousY=scrollY,stillSince=started,alignedFrames=0;
      const check=now=>{
        arrivalFrame=0;if(token!==requestId)return;
        if(document.hidden)return;
        const maximum=Math.max(0,document.documentElement.scrollHeight-innerHeight),destination=Math.max(0,Math.min(maximum,top));
        if(Math.abs(scrollY-previousY)>.5)stillSince=now;previousY=scrollY;
        alignedFrames=Math.abs(scrollY-destination)<2?alignedFrames+1:0;
        const settled=passive?now-stillSince>=90:alignedFrames>=2;
        if(fontReady&&!passive&&now-started>1000&&now-stillSince>=160&&!settled){
          let actual=0;pages.forEach((page,i)=>{if(page.getBoundingClientRect().top<innerHeight*.43)actual=i;});
          if(actual!==index){onReconcile(actual);request(actual,{top:scrollY,passive:true,force:true});return;}
        }
        if(fontReady&&getPage()===index&&(settled||now-started>2200&&now-stillSince>=90&&visible(pages[index]))){start(index,true);return;}
        arrivalFrame=requestAnimationFrame(check);
      };
      arrivalFrame=requestAnimationFrame(check);
    }
    function sync(){
      if(isPaused()||isReduced()){allEntries.forEach(finish);resetFloats();}
      else if(document.hidden||document.querySelector('dialog[open]')){allEntries.filter(e=>e.animation).forEach(finish);resetFloats();}
      else if(!hoverQuery.matches)resetFloats();
      if(document.hidden){cancelAnimationFrame(arrivalFrame);arrivalFrame=0;return;}
      if(pending!==null&&!arrivalFrame){
        const index=pending,options=pendingOptions,bounds=window.PrimeWheelNavigation.range(pages[index]);
        const top=options.align==='start'?bounds.start:options.align==='end'?bounds.end:options.top;
        pending=null;request(index,{...options,top,force:true});
        if(!options.passive)window.scrollTo({top,behavior:isReduced()||options.instant?'instant':'smooth'});
      }
      else{reveal();wake();}
    }
    function read(){
      readFrame=0;reveal();wake();
    }
    document.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;pointer.x=event.clientX;pointer.y=event.clientY;pointer.active=true;wake();},{passive:true});
    document.addEventListener('pointerleave',()=>{pointer.active=false;wake();});
    document.addEventListener('pointerdown',event=>{entries.filter(e=>e.animation&&e.el.contains(event.target)).forEach(finish);},{capture:true,passive:true});
    document.addEventListener('focusin',event=>{allEntries.filter(e=>!e.done&&e.el.contains(event.target)).forEach(finish);});
    window.addEventListener('scroll',()=>{if(!readFrame)readFrame=requestAnimationFrame(read);},{passive:true});
    window.addEventListener('resize',()=>{if(!readFrame)readFrame=requestAnimationFrame(read);},{passive:true});
    document.addEventListener('visibilitychange',sync);
    hoverQuery.addEventListener('change',sync);
    new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
    allEntries.forEach(prepare);
    document.fonts.ready.then(()=>{fontReady=true;reveal();});
    return {
      request,wake:()=>{reveal();wake();},activate:index=>{if(index!==pending&&index!==active)request(index,{top:scrollY,passive:true});},
      replay:()=>request(getPage(),{top:scrollY,instant:true,force:true,replay:true}),sync,stop:()=>{finishAll();resetFloats();},
      getState:()=>({active,pending,navigating:pending!==null&&!pendingOptions.passive,running:Boolean(floatFrame),plays:{...plays},revealed:entries.filter(e=>e.done).length,waiting:entries.filter(e=>!e.started&&!e.done).length,targets:entries.length}),
      getMotionSnapshot:()=>floats.map(f=>({kind:f.kind,x:f.x,y:f.y,rx:0,ry:0,scale:1}))
    };
  }
  window.PrimePresentationMotion={mount};
})();
