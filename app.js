(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  $('control-slot').append($('controls'));
  const headerMenu=window.PrimeHeaderNavigation.mount(document.querySelector('.site-header'));
  const pages = [...document.querySelectorAll('[data-page]')];
  const caseKeys = ['sportmaster','kanzler','funday'];
  const totalSteps = pages.length;
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { page:0, paused:false, reduced:reducedQuery.matches };
  let navLock=0, noticeTimer;
  const sequences = new Set();
  const step = () => state.page;
  function updateControls(){
    $('counter').textContent=`${state.page+1} / ${totalSteps}`;
    document.querySelector('[data-action="previous"]').disabled=state.page===0;
    document.querySelector('[data-action="next"]').disabled=state.page===pages.length-1;
    const active=pages[state.page].dataset.caseKey?'cases':pages[state.page].id;
    document.querySelectorAll('.page-links a').forEach(a=>{if(a.getAttribute('href')==='#'+active){a.setAttribute('aria-current','page');const nav=a.parentElement;if(a.offsetWidth&&nav.scrollWidth>nav.clientWidth){const delta=a.getBoundingClientRect().left-nav.getBoundingClientRect().left;if(delta<0)nav.scrollLeft+=delta;else if(delta+a.offsetWidth>nav.clientWidth)nav.scrollLeft+=delta+a.offsetWidth-nav.clientWidth;}}else a.removeAttribute('aria-current');});
    headerMenu.revealCurrent();
    const title={agenda:'Структура презентации',why:'Почему внедряем ИИ сейчас',cases:'Как российские бренды используют ИИ','case-sportmaster':'Спортмастер','case-kanzler':'KANZLER','case-funday':'FUNDAY',benefits:'Плюсы использования новой системы',costs:'Целевые ориентиры по стоимости',catalogue:'Каталог вглубь',flagship:'Почему сохраняем съёмку',fit:'Посадка',solution:'Решение',process:'Наш процесс',prototype:'Прототип системы',rollout:'Этапы внедрения',planning:'Планирование контента',discussion:'Вопросы для дальнейшего обсуждения',closing:'Спасибо за внимание'}[pages[state.page].id]||'Prime Sport';
    document.title=title+': ИИ контент';
  }
  function showControls(){
    $('controls').classList.remove('is-hidden');
  }
  function replaceHash(hash){try{history.replaceState(null,'',hash);}catch{/* Navigation also works without writable history. */}}
  function goTo(page, options={}){
    state.page=Math.max(0,Math.min(pages.length-1,page));navLock=performance.now()+950;
    const target=pages[state.page],top=options.align==='end'?window.PrimeWheelNavigation.range(target).end:target.offsetTop;
    window.scrollTo({top,behavior:state.reduced||options.instant?'instant':'smooth'});
    replaceHash('#'+pages[state.page].id);updateControls();showControls();
    window.presentation.motion.request(state.page,{top,instant:state.reduced||Boolean(options.instant)});
  }
  function next(){if(state.page<pages.length-1)goTo(state.page+1);}
  function previous(){if(state.page>0)goTo(state.page-1);}
  function animate(el, frames, timing){
    if(state.reduced||state.paused)return;
    const a=el.animate(frames,{easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards',...timing});
    sequences.add(a);a.finished.catch(()=>{}).finally(()=>sequences.delete(a));return a;
  }
  function enterPage(page){window.presentation?.motion?.activate(page);}
  function openCase(key, options={}){
    const index=pages.findIndex(page=>page.dataset.caseKey===key);if(index<0)return;
    goTo(index,options);if(!options.noFocus){const title=pages[index].querySelector('h2');title.tabIndex=-1;title.focus({preventScroll:true});}
  }
  function closeCase(){goTo(pages.findIndex(page=>page.id==='cases'));}

  function wake(){window.presentation?.motion?.wake();}
  function setPaused(value){
    state.paused=Boolean(value);document.body.classList.toggle('is-paused',state.paused);
    const button=document.querySelector('[data-action="pause"]');button.setAttribute('aria-pressed',String(state.paused));button.setAttribute('aria-label',state.paused?'Продолжить движение':'Приостановить движение');
    $('pause-icon').setAttribute('d',state.paused?'m9 5 9 7-9 7V5':'M9 5v14M15 5v14');
    if(state.paused)sequences.forEach(a=>a.finish());
    window.presentation?.motion?.sync();
  }
  function notice(text){$('notice').textContent=text;$('notice').classList.add('is-visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').classList.remove('is-visible'),3000);}
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notice('Для полного экрана также можно использовать F11');}}
  let fitOpener=null;
  function openFit(){
    const dialog=$('fit-dialog');if(document.querySelector('dialog[open]'))return;fitOpener=document.activeElement;
    const pair=document.querySelector('#fit .fit-portraits').cloneNode(true);
    pair.querySelectorAll('.float-unit').forEach(e=>{e.classList.remove('float-unit','is-moving');delete e.dataset.motion;});
    pair.querySelectorAll('.motion-surface').forEach(e=>e.removeAttribute('style'));
    dialog.querySelector('.fit-dialog-scroll').replaceChildren(pair);sequences.forEach(a=>a.finish());window.presentation.motion.stop();
    window.scrollTo({top:window.scrollY,behavior:'instant'});document.documentElement.classList.add('fit-view-open');dialog.showModal();dialog.querySelector('button').focus();
  }
  function closeFit(){if($('fit-dialog').open)$('fit-dialog').close();}
  $('fit-dialog').addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.documentElement.classList.remove('fit-view-open');fitOpener?.focus({preventScroll:true});wake();});
  $('fit-dialog').addEventListener('click',e=>{if(e.target===$('fit-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeFit();}});
  const actions={next,previous,overview:closeCase,'fit-zoom':openFit,'fit-close':closeFit,pause:()=>setPaused(!state.paused),replay:()=>{if(pages[state.page].id==='process')window.presentation.processMap.fit('overview');else window.presentation.motion.replay();},fullscreen};
  document.addEventListener('click',e=>{
    const open=e.target.closest('[data-open-case]'),tab=e.target.closest('[data-case-tab]'),action=e.target.closest('[data-action]');
    if(open){openCase(open.dataset.openCase);return;}if(tab){openCase(tab.dataset.caseTab);return;}if(action){actions[action.dataset.action]?.();showControls();return;}
    const anchor=e.target.closest('a[href^="#"]');if(anchor){const page=pages.findIndex(p=>'#'+p.id===anchor.getAttribute('href'));if(page>=0){e.preventDefault();goTo(page);}}
  });
  document.addEventListener('keydown',e=>{
    if(document.querySelector('dialog[open]'))return;
    if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable)return;
    if((e.code==='Space'||e.key==='Enter')&&e.target.closest('button,a'))return;
    let handled=true;
    if(['ArrowRight','ArrowDown','PageDown'].includes(e.key)||e.code==='Space'&&!e.shiftKey)next();
    else if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)||e.code==='Space'&&e.shiftKey)previous();
    else if(e.key==='Home')goTo(0);else if(e.key==='End')goTo(pages.length-1);
    else if(e.key==='Escape'&&document.fullscreenElement)document.exitFullscreen();
    
    else if(e.code==='KeyF')fullscreen();else if(e.code==='KeyP')setPaused(!state.paused);else if(e.code==='KeyR')actions.replay();else handled=false;
    if(handled){e.preventDefault();showControls();}
  });
  document.addEventListener('pointermove',showControls,{passive:true});
  document.addEventListener('pointerdown',showControls,{passive:true});
  document.addEventListener('focusin',showControls);
  let scrollFrame=0;
  window.addEventListener('scroll',()=>{wake();if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;if(performance.now()<navLock||window.presentation?.motion?.getState().navigating)return;let page=0;pages.forEach((p,i)=>{if(p.getBoundingClientRect().top<innerHeight*.43)page=i;});if(page!==state.page){state.page=page;updateControls();enterPage(page);}});},{passive:true});
  reducedQuery.addEventListener('change',e=>{state.reduced=e.matches;window.presentation.motion.sync();});
  window.presentation={ready:false,version:'40-hero-four-questions',goTo,openCase,closeCase,next,previous,setPaused,
    getState:()=>({index:state.page,page:state.page,case:pages[state.page].dataset.caseKey||null,step:step(),paused:state.paused,reducedMotion:state.reduced,renderer:'native-dom'}),
    getMotionSnapshot:()=>window.presentation.motion?.getMotionSnapshot()||[]};
  window.presentation.solution=window.PrimeSolutionScreen.mount($('solution'),{animate,wake,stop:()=>{sequences.forEach(a=>a.finish());window.presentation.motion.stop();}});
  window.presentation.catalogue=window.PrimeCatalogueScreen.mount($('catalogue'),{animate,canMove:()=>false});
  window.presentation.flagship=window.PrimeFlagshipScreen.mount($('flagship'),{animate,canMove:()=>false});
  window.presentation.rollout=window.PrimeRolloutScreen.mount($('rollout'),{animate,wake,stop:()=>{sequences.forEach(a=>a.finish());window.presentation.motion.stop();},canMove:()=>false});
  updateControls();showControls();
  window.presentation.processMap=window.PrimeProcessMap.mount($('process-map'),window.PRIME_PROCESS_DATA);
  window.presentation.wheelNavigation=window.PrimeWheelNavigation.mount({pages,getPage:()=>state.page,navigate:goTo,navigationLocked:()=>performance.now()<navLock});
  window.presentation.motion=window.PrimePresentationMotion.mount({pages,getPage:()=>state.page,isPaused:()=>state.paused,isReduced:()=>state.reduced,onReconcile:page=>{state.page=page;navLock=0;replaceHash('#'+pages[page].id);updateControls();showControls();}});
  const hash=location.hash.slice(1).split('/');
  if(hash[0]==='cases'){if(caseKeys.includes(hash[1]))openCase(hash[1],{instant:true,noFocus:true});else goTo(pages.findIndex(page=>page.id==='cases'),{instant:true});}else{const index=pages.findIndex(page=>page.id===hash[0]);goTo(Math.max(0,index),{instant:true});}
  document.fonts.ready.then(()=>{enterPage(state.page);wake();});
  window.presentation.ready=true;
})();
