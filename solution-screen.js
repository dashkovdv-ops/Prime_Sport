(function(){
  'use strict';
  function mount(container,api){
    const dialog=document.getElementById('solution-dialog');
    const content=dialog.querySelector('.solution-dialog-content');
    const title=dialog.querySelector('h2');
    const zoomButton=dialog.querySelector('[data-solution-zoom]');
    let opener=null;
    function zoom(value){
      const image=content.querySelector('img');
      const normalWidth=value&&image?image.getBoundingClientRect().width:0;
      dialog.classList.toggle('is-zoomed',value);
      zoomButton.setAttribute('aria-pressed',String(value));
      zoomButton.setAttribute('aria-label',value?'Вписать фотографию в окно':'Увеличить фотографию в два раза');
      zoomButton.textContent=value?'Вписать':'2×';
      if(image)image.style.width=value?`${Math.round(normalWidth*2)}px`:'';
      content.scrollTop=0;content.scrollLeft=0;
    }
    function open(button){
      if(document.querySelector('dialog[open]'))return;
      opener=button;api.stop?.();
      const image=button.querySelector('img').cloneNode();image.className='solution-enlarged';
      title.textContent=button.dataset.solutionTitle;
      content.replaceChildren(image);zoom(false);
      document.documentElement.classList.add('solution-view-open');
      dialog.showModal();dialog.querySelector('[data-solution-close]').focus({preventScroll:true});
    }
    container.querySelectorAll('.solution-photo-open').forEach(button=>button.addEventListener('click',()=>open(button)));
    zoomButton.addEventListener('click',()=>zoom(!dialog.classList.contains('is-zoomed')));
    dialog.addEventListener('keydown',event=>{
      if(event.key!=='Tab')return;
      const controls=[zoomButton,dialog.querySelector('[data-solution-close]'),content];
      const edge=event.shiftKey?controls[0]:controls[controls.length-1];
      if(document.activeElement===edge){event.preventDefault();controls[event.shiftKey?controls.length-1:0].focus();}
    });
    dialog.querySelector('[data-solution-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
    dialog.addEventListener('close',()=>{zoom(false);content.replaceChildren();document.documentElement.classList.remove('solution-view-open');if(opener?.isConnected)opener.focus({preventScroll:true});api.wake?.();});
    window.addEventListener('resize',()=>{if(dialog.open&&dialog.classList.contains('is-zoomed'))zoom(false);});
    function enter(){
      api.animate(container.querySelector('.prime-slash'),[{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:250});
      api.animate(container.querySelector('h2'),[{opacity:.5,transform:'translateY(16px)',filter:'blur(3px)'},{opacity:1,transform:'none',filter:'blur(0px)'}],{duration:550});
      container.querySelectorAll('.solution-card').forEach((card,i)=>{
        api.animate(card,[{opacity:.4,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:650,delay:180+i*180});
        api.animate(card.querySelector('.solution-photo-frame'),[{opacity:.2},{opacity:1}],{duration:500,delay:330+i*180});
      });
      api.animate(container.querySelector('.solution-takeaway'),[{opacity:0},{opacity:1}],{duration:450,delay:1000});
    }
    return {enter};
  }
  window.PrimeSolutionScreen={mount};
}());
