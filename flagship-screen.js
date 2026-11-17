(function(){
  'use strict';
  function mount(container,api){
    let pending=false,plays=0;
    const owned=new Set();
    const visible=()=>{const r=container.getBoundingClientRect();return r.top<innerHeight*.85&&r.bottom>108;};
    function settle(){owned.forEach(animation=>{try{animation.finish();}catch{animation.cancel();}});owned.clear();}
    function run(element,frames,timing){const animation=api.animate(element,frames,timing);if(animation){owned.add(animation);animation.finished.catch(()=>{}).finally(()=>owned.delete(animation));}}
    const rise=(element,pixels,duration,delay)=>run(element,[{opacity:0,transform:`translateY(${pixels}px)`},{opacity:1,transform:'none'}],{duration,delay});
    function start(){
      if(!pending||!visible())return;
      pending=false;settle();plays++;
      if(!api.canMove())return;
      run(container.querySelector('.prime-slash'),[{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:250});
      rise(container.querySelector('h2'),16,550,0);
      rise(container.querySelector('.flagship-heading p'),12,500,120);
      container.querySelectorAll('.flagship-card').forEach((card,i)=>{
        rise(card,22,650,180+i*160);
        rise(card.querySelector('.flagship-icon'),8,500,320+i*160);
        run(card.querySelector('.flagship-divider'),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:380,delay:560+i*160});
        card.querySelectorAll('li').forEach((item,j)=>rise(item,8,350,600+i*160+j*100));
      });
      run(container.querySelector('.flagship-takeaway'),[{opacity:0},{opacity:1}],{duration:450,delay:1350});
    }
    function enter(){pending=true;start();}
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)start();else settle();}),{rootMargin:'-108px 0px -15% 0px',threshold:0});
    observer.observe(container);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();else start();});
    return{enter,settle,getState:()=>({pending,plays,activeAnimations:owned.size})};
  }
  window.PrimeFlagshipScreen={mount};
}());
