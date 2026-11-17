(function(){
  'use strict';
  function mount(container,api){
    let pending=false,plays=0;
    const owned=new Set();
    const visible=()=>{const r=container.getBoundingClientRect();return r.top<innerHeight*.85&&r.bottom>108;};
    function settle(){owned.forEach(animation=>{try{animation.finish();}catch{animation.cancel();}});owned.clear();}
    function run(element,frames,timing){
      const animation=api.animate(element,frames,timing);
      if(animation){owned.add(animation);animation.finished.catch(()=>{}).finally(()=>owned.delete(animation));}
    }
    const rise=(element,pixels,duration,delay)=>run(element,[{opacity:0,transform:`translateY(${pixels}px)`},{opacity:1,transform:'none'}],{duration,delay});
    const fade=(element,duration,delay)=>run(element,[{opacity:0},{opacity:1}],{duration,delay});
    function start(){
      if(!pending||!visible())return;
      pending=false;settle();plays++;
      if(!api.canMove())return;
      run(container.querySelector('.prime-slash'),[{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:250});
      rise(container.querySelector('h2'),16,550,0);
      rise(container.querySelector('.catalogue-heading p'),12,500,120);
      rise(container.querySelector('.catalogue-before'),22,650,180);
      rise(container.querySelector('.catalogue-before .catalogue-icon'),4,450,280);
      container.querySelectorAll('.catalogue-before .catalogue-media').forEach((el,i)=>rise(el,14,480,300+i*70));
      fade(container.querySelector('.catalogue-before .catalogue-caption'),400,680);
      run(container.querySelector('.catalogue-chevron'),[{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}],{duration:450,delay:560});
      rise(container.querySelector('.catalogue-platform'),20,650,480);
      rise(container.querySelector('.catalogue-platform .catalogue-icon'),4,450,580);
      container.querySelectorAll('.catalogue-platform .catalogue-media').forEach((el,i)=>rise(el,14,520,640+i*80));
      fade(container.querySelector('.catalogue-platform .catalogue-caption'),400,1060);
      fade(container.querySelector('.catalogue-takeaway'),450,1250);
    }
    function enter(){pending=true;start();}
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)start();else settle();}),{rootMargin:'-108px 0px -15% 0px',threshold:0});
    observer.observe(container);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();else start();});
    return {enter,settle,getState:()=>({pending,plays,activeAnimations:owned.size})};
  }
  window.PrimeCatalogueScreen={mount};
}());
