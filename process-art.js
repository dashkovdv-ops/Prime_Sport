/* Generated transparent image icons. SVG is only a native image container, not drawn artwork. */
(() => {
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  const aliases={'group-photo':'photo-generate','group-video':'video-generate'};
  function attach(world){
    const assets=window.PRIME_PROCESS_GENERATED_ICONS;
    if(!assets||Object.keys(assets.icons).length!==27)throw new Error('Missing generated process image assets');
    world.dataset.iconStyle='generated-illustrated-v15';
  }
  function render(requestedId){
    const id=aliases[requestedId]||requestedId,asset=window.PRIME_PROCESS_GENERATED_ICONS?.icons[id];
    if(!asset)throw new Error('Unknown generated process icon: '+requestedId);
    const svg=document.createElementNS(NS,'svg');
    Object.entries({class:'process-art process-art-generated',viewBox:'0 0 240 180','aria-hidden':'true',focusable:'false'}).forEach(([k,v])=>svg.setAttribute(k,v));
    svg.dataset.artId=requestedId;svg.dataset.iconId=id;svg.dataset.iconStyle='generated-illustrated-v15';svg.dataset.assetHash=asset.sha256;
    const scale=Math.min(240/asset.width,180/asset.height),w=asset.width*scale,h=asset.height*scale;
    const object=document.createElementNS(NS,'g'),image=document.createElementNS(NS,'image');object.setAttribute('class','process-art-object');
    Object.entries({href:asset.url,x:(240-w)/2,y:(180-h)/2,width:w,height:h,preserveAspectRatio:'xMidYMid meet'}).forEach(([k,v])=>image.setAttribute(k,String(v)));
    object.append(image);svg.append(object);return svg;
  }
  window.PrimeProcessArt={attach,render,get iconIds(){return Object.keys(window.PRIME_PROCESS_GENERATED_ICONS?.icons||{});},style:'generated-illustrated-v15'};
})();
