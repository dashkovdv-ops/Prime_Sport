(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const roles = { human: 'Человек', auto: 'Автоматизация', result: 'Результат', decision: 'Решение' };
  const phaseViews = {
    preparation:[{label:'Подбор товаров и модели',nodes:['look','products','model']},{label:'Формирование карточки образа',nodes:['dress','card-check','dressed']}],
    fit:[{label:'Проверка образа и посадки',nodes:['product-fit','fit']},{label:'Коррекция посадки',nodes:['retouch','reshoot']}],
    basis:[{label:'Согласованная карточка образа',nodes:['approved-card']}],
    photo:[{label:'Товары и ракурсы',nodes:['photo-products','photo-angles']},{label:'Генерация и автопроверка фото',nodes:['photo-generate','photo-check']},{label:'Ручная проверка и Product-согласование фото',nodes:['photo-manual','photo-product']},{label:'Корректировки с помощью ретушёра',nodes:['photo-manual','photo-retouch']},{label:'Согласованное фото',nodes:['photo-product','photo-approved']}],
    video:[{label:'Промпт, описание и структура ролика',nodes:['video-prompt','video-explain','video-structure']},{label:'Генерация и автоанализ видео',nodes:['video-structure','video-generate','video-check']},{label:'Ручная проверка и Product-согласование видео',nodes:['video-manual','video-product']},{label:'Согласованное видео',nodes:['video-product','video-approved']}]
  };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const svgEl = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
  function roundedRoute(source, radius = 15) {
    if (/[^MLHV0-9.,\s+\-]/.test(source)) return source;
    const points=[];let x=0,y=0;
    for(const part of source.matchAll(/([MLHV])\s*([^MLHV]+)/g)) {
      const values=part[2].match(/-?\d+(?:\.\d+)?/g)?.map(Number);
      if(!values?.length)return source;
      if(part[1]==='H')x=values[0];else if(part[1]==='V')y=values[0];else {x=values[0];y=values[1];}
      if(!Number.isFinite(x)||!Number.isFinite(y))return source;
      if(!points.length||points.at(-1).x!==x||points.at(-1).y!==y)points.push({x,y});
    }
    if(points.length<2)return source;
    let path=`M ${points[0].x} ${points[0].y}`;
    for(let i=1;i<points.length-1;i++) {
      const a=points[i-1],b=points[i],c=points[i+1],ab=Math.hypot(b.x-a.x,b.y-a.y),bc=Math.hypot(c.x-b.x,c.y-b.y);
      const r=Math.min(radius,ab/2,bc/2),cross=(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);
      if(Math.abs(cross)<.001){path+=` L ${b.x} ${b.y}`;continue;}
      const before={x:b.x-(b.x-a.x)*r/ab,y:b.y-(b.y-a.y)*r/ab},after={x:b.x+(c.x-b.x)*r/bc,y:b.y+(c.y-b.y)*r/bc};
      path+=` L ${before.x} ${before.y} Q ${b.x} ${b.y} ${after.x} ${after.y}`;
    }
    const last=points.at(-1);return path+` L ${last.x} ${last.y}`;
  }
  function mount(container, data) {
    if (!container || !data) throw new Error('Process map requires a container and data');
    container.replaceChildren(); container.classList.add('process-map');
    const toolbar = el('div', 'process-toolbar');
    const presets = el('div', 'process-presets'); presets.setAttribute('aria-label', 'Масштаб этапа');
    const tools = el('div', 'process-tools');
    const viewport = el('div', 'process-viewport'); viewport.tabIndex = 0; viewport.setAttribute('role', 'region'); viewport.setAttribute('aria-label', 'Интерактивная схема процесса. Используйте стрелки для перемещения, плюс и минус для масштаба, 0 для обзора.');
    const world = el('div', 'process-world'); world.style.width = data.width + 'px'; world.style.height = data.height + 'px';
    window.PrimeProcessArt.attach(world);
    const inspector = el('div', 'process-inspector'); inspector.setAttribute('aria-live', 'polite');
    const note = el('p', 'process-source-note', data.sourceNote || '');
    const legend = el('div', 'process-legend'); legend.setAttribute('aria-label', 'Обозначения');
    const stepNavigation = el('div', 'process-step-navigation'); stepNavigation.setAttribute('role', 'group'); stepNavigation.setAttribute('aria-label', 'Крупный просмотр процесса');
    const previousSteps = el('button', 'process-step-nav'), nextSteps = el('button', 'process-step-nav');
    [[previousSteps, 'Предыдущие шаги процесса', 'M 14 5 L 7 12 L 14 19'], [nextSteps, 'Следующие шаги процесса', 'M 10 5 L 17 12 L 10 19']].forEach(([button, label, route]) => { button.type='button';button.setAttribute('aria-label',label);const icon=svgEl('svg',{viewBox:'0 0 24 24','aria-hidden':'true'});icon.append(svgEl('path',{d:route}));button.append(icon); });
    const stepStatus = el('span', 'process-step-status'); stepStatus.setAttribute('aria-live', 'polite');
    stepNavigation.append(previousSteps, stepStatus, nextSteps);
    const colorKey = el('div', 'process-color-key');
    [['preparation','Подготовка'],['fit','Посадка'],['photo','Фото'],['video','Видео']].forEach(([group,label])=>{const item=el('span','process-legend-item'),swatch=el('i','process-legend-swatch');swatch.dataset.group=group;swatch.setAttribute('aria-hidden','true');item.append(swatch,document.createTextNode(label));colorKey.append(item);});
    const humanLegend = el('span', 'process-legend-item'); const dot = el('i', 'process-legend-dot'); dot.setAttribute('aria-hidden', 'true'); humanLegend.append(dot, document.createTextNode('Человек')); colorKey.append(humanLegend);
    const returnLegend=el('span','process-legend-item'),returnLine=el('i','process-legend-return');returnLine.setAttribute('aria-hidden','true');returnLegend.append(returnLine,document.createTextNode('Возврат'));colorKey.append(returnLegend);legend.append(stepNavigation,colorKey);
    (data.bands || []).forEach(b => { const band = el('div', 'process-band');band.dataset.group=b.id==='correction'?'fit':b.id; Object.assign(band.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' }); band.append(el('strong', 'process-band-title', b.title)); if (b.subtitle) band.append(el('span', 'process-band-subtitle', b.subtitle)); if (b.art) { const art = el('span', 'process-band-art'); art.append(window.PrimeProcessArt.render(b.art)); band.append(art); } world.append(band); });
    const svg = svgEl('svg', { class: 'process-edges', width: data.width, height: data.height, viewBox: `0 0 ${data.width} ${data.height}`, role: 'group', 'aria-label': 'Связи между этапами' });
    const defs = svgEl('defs', {});
    ['standard', 'return', 'positive', 'active'].forEach(tone => { const marker = svgEl('marker', { id: `process-arrow-${tone}`, viewBox: '0 0 12 12', refX: '10', refY: '6', markerUnits: 'userSpaceOnUse', markerWidth: '14', markerHeight: '14', orient: 'auto' }); marker.append(svgEl('path', { d: 'M 3 2 L 10 6 L 3 10', class: 'process-arrow-' + tone })); defs.append(marker); }); svg.append(defs);
    const nodesById=new Map((data.nodes||[]).map(node=>[node.id,node])),edgeControls=new Map();
    (data.edges || []).forEach(edge => {
      const tone=edge.tone||'standard',route=roundedRoute(edge.path),label=`Показать связь: ${nodesById.get(edge.from).title} → ${nodesById.get(edge.to).title}${edge.label?' · '+edge.label:''}`;
      const control=svgEl('g',{class:'process-edge-control','data-edge-id':edge.id,tabindex:'0',role:'button','aria-label':label,'aria-pressed':'false'});
      const title=svgEl('title',{});title.textContent=label;
      const visible=svgEl('path',{d:route,class:'process-edge process-edge-'+tone,'marker-end':`url(#process-arrow-${tone})`,'data-from':edge.from,'data-to':edge.to,'aria-hidden':'true'});
      const hit=svgEl('path',{d:route,class:'process-edge-hit','aria-hidden':'true'});
      control.append(title,visible,hit);
      if(edge.label&&!edge.decision){const text=svgEl('text',{x:edge.labelX,y:edge.labelY,class:'process-edge-label process-edge-label-'+tone,'aria-hidden':'true'});text.textContent=edge.label;control.append(text);}
      if(edge.decision){
        const outcome=svgEl('g',{class:'process-edge-outcome','data-outcome':edge.decision,transform:`translate(${edge.decisionX} ${edge.decisionY})`,'aria-hidden':'true'});
        outcome.append(svgEl('rect',{x:-47,y:-22,width:94,height:44,rx:22,class:'process-outcome-surface'}));
        outcome.append(svgEl('path',{d:edge.decision==='yes'?'M -35 0 L -28 7 L -16 -8':'M -33 -7 L -19 7 M -19 -7 L -33 7',class:'process-outcome-symbol'}));
        const label=svgEl('text',{x:-7,y:7,class:'process-outcome-text'});label.textContent=edge.decision==='yes'?'Да':'Нет';outcome.append(label);control.append(outcome);
      }
      control.addEventListener('click',event=>{event.stopPropagation();if(!suppressClick)selectEdge(edge);});
      control.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();selectEdge(edge);}});
      edgeControls.set(edge.id,{control,path:visible,edge});svg.append(control);
    });world.append(svg);
    const nodeButtons = new Map();
    (data.nodes || []).forEach(node => {
      const button = el('button', 'process-node process-node-' + node.kind), human = node.kind === 'human' || node.actor === 'human';
      button.type = 'button'; button.dataset.kind = node.kind; button.dataset.group = node.group; button.dataset.human = String(human); if (node.actor) button.dataset.actor = node.actor; button.dataset.nodeId = node.id;
      button.setAttribute('aria-pressed', 'false'); button.setAttribute('aria-label', `${node.stage || ''}. ${node.title}${human ? '. Участие человека' : ''}`);
      Object.assign(button.style, { left: node.x + 'px', top: node.y + 'px', width: node.w + 'px', height: node.h + 'px' });
      const heading = el('span', 'process-node-heading'); heading.append(el('strong', 'process-node-title', node.title)); button.append(heading);
      if (node.stage != null && node.stage !== '') button.append(el('span', 'process-node-stage', String(node.stage)));
      if (human) { const marker = el('span', 'process-human-dot'); marker.setAttribute('aria-hidden', 'true'); button.append(marker); }
      button.append(window.PrimeProcessArt.render(node.id));
      if (node.summary || node.detail) button.append(el('span', 'process-node-detail', node.summary || node.detail));
      button.addEventListener('click', () => { if (suppressClick) return; select(node); }); nodeButtons.set(node.id, button); world.append(button);
    });
    viewport.append(world); toolbar.append(presets, tools); container.append(toolbar, legend, viewport, inspector); if (data.sourceNote) container.append(note);
    let scale = 1, x = 0, y = 0, minScale = .1, selected = null, selectedEdge = null, activePreset = 'overview', presetPage = 0, raf = 0, suppressClick = false, drag = null, transitionMs = 0;
    const pointers = new Map(); let pinch = null, phaseLayoutNarrow = viewport.clientWidth < 600;
    const output = el('output', 'process-scale'); output.setAttribute('aria-label', 'Масштаб');
    const presetButtons = new Map();
    function phasePages(id, narrow = viewport.clientWidth < 600) {
      const pages=phaseViews[id]||[];
      if(!narrow)return pages;
      return [...new Set(pages.flatMap(p=>p.nodes))].map(id=>({label:nodesById.get(id).title,nodes:[id]}));
    }
    function withOutcomes(rect,ids){
      let left=rect.x,top=rect.y,right=rect.x+rect.w,bottom=rect.y+rect.h;
      (data.edges||[]).filter(edge=>edge.decision&&ids.includes(edge.from)).forEach(edge=>{left=Math.min(left,edge.decisionX-62);right=Math.max(right,edge.decisionX+62);top=Math.min(top,edge.decisionY-37);bottom=Math.max(bottom,edge.decisionY+37);});
      return {x:left,y:top,w:right-left,h:bottom-top};
    }
    function phaseRect(id) {
      const pages=phasePages(id);presetPage=Math.min(presetPage,Math.max(0,pages.length-1));
      if(!pages.length)return (data.presets||[]).find(p=>p.id===id)||{x:0,y:0,w:data.width,h:data.height};
      const nodes=pages[presetPage].nodes.map(id=>nodesById.get(id)),left=Math.min(...nodes.map(n=>n.x)),top=Math.min(...nodes.map(n=>n.y)),right=Math.max(...nodes.map(n=>n.x+n.w)),bottom=Math.max(...nodes.map(n=>n.y+n.h));
      const pad=viewport.clientWidth<600?8:38;return withOutcomes({x:left-pad,y:top-pad,w:right-left+pad*2,h:bottom-top+pad*2},pages[presetPage].nodes);
    }
    function draw() {
      viewport.scrollLeft=0;viewport.scrollTop=0;
      raf = 0; world.style.transitionDuration = transitionMs + 'ms'; world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`; output.textContent = Math.round(scale * 100) + '%'; viewport.classList.toggle('process-overview-scale', scale < .48);
      defs.querySelectorAll('marker').forEach(marker=>{marker.setAttribute('markerWidth',14/scale);marker.setAttribute('markerHeight',14/scale);});
      const pages=phasePages(activePreset),page=pages[presetPage];previousSteps.disabled=!page||presetPage===0;nextSteps.disabled=!page||presetPage===pages.length-1;
      stepStatus.textContent=page?`${page.label} · ${presetPage+1}/${pages.length}`:selectedEdge?'Выбрана связь':selected?nodesById.get(selected).title:'Вся схема';
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(draw); }
    function clampPosition() { const w = viewport.clientWidth, h = viewport.clientHeight, margin = 80; x = Math.min(w - margin, Math.max(margin - data.width * scale, x)); y = Math.min(h - margin, Math.max(margin - data.height * scale, y)); }
    function updatePreset(id) { activePreset = id; presetButtons.forEach((button, key) => button.setAttribute('aria-pressed', String(key === id))); }
    function fitRect(rect, id, duration = 450) { transitionMs = duration; const w = viewport.clientWidth, h = viewport.clientHeight; if (!w || !h) return; const pad = 28; scale = Math.min(3, Math.max(minScale, Math.min((w - pad * 2) / rect.w, (h - pad * 2) / rect.h))); x = w / 2 - (rect.x + rect.w / 2) * scale; y = h / 2 - (rect.y + rect.h / 2) * scale; clampPosition(); updatePreset(id || ''); schedule(); }
    function fit(id = 'overview') { clearSelection();presetPage=0;fitRect(phaseRect(id),id); }
    function changePage(delta) { const pages=phasePages(activePreset);if(!pages.length)return;const id=activePreset;presetPage=Math.max(0,Math.min(pages.length-1,presetPage+delta));clearSelection();fitRect(phaseRect(id),id); }
    previousSteps.addEventListener('click',()=>changePage(-1));nextSteps.addEventListener('click',()=>changePage(1));
    function zoomBy(factor, anchor) { transitionMs = 160; const rect = viewport.getBoundingClientRect(); const ax = anchor ? anchor.x : rect.width / 2, ay = anchor ? anchor.y : rect.height / 2; const next = Math.min(3, Math.max(minScale, scale * factor)); x = ax - (ax - x) * next / scale; y = ay - (ay - y) * next / scale; scale = next; clampPosition(); updatePreset(''); schedule(); }
    function clearSelection() {
      selected=null;selectedEdge=null;world.classList.remove('process-has-edge-selection');
      nodeButtons.forEach(button=>{button.setAttribute('aria-pressed','false');delete button.dataset.edgeRole;});
      edgeControls.forEach(({control,path,edge})=>{control.classList.remove('is-selected');control.setAttribute('aria-pressed','false');path.setAttribute('marker-end',`url(#process-arrow-${edge.tone||'standard'})`);});
      inspector.replaceChildren(el('p','process-inspector-help','Нажмите на стрелку, чтобы показать два связанных этапа, или выберите карточку для подробностей. Перетаскивайте схему и меняйте масштаб.'));
    }
    function nodeRect(node) { const narrow = viewport.clientWidth < 600; const padX = narrow ? 20 : Math.max(100, node.w * .25), padY = narrow ? 20 : Math.max(100, node.h * .5); return withOutcomes({ x: node.x - padX, y: node.y - padY, w: node.w + padX * 2, h: node.h + padY * 2 },[node.id]); }
    function select(node) { clearSelection(); selected = node.id; nodeButtons.forEach((b, id) => b.setAttribute('aria-pressed', String(id === selected))); inspector.replaceChildren(); const label = el('span', 'process-inspector-role', node.actor === 'human' ? 'Человек · решение' : (roles[node.kind] || node.kind)); const title = el('strong', 'process-inspector-title', node.title); const detail = el('p', 'process-inspector-detail', node.detail || ''); inspector.append(label, title, detail); fitRect(nodeRect(node), ''); }
    function pairRect(edge) {
      const a=nodesById.get(edge.from),b=nodesById.get(edge.to),left=Math.min(a.x,b.x),top=Math.min(a.y,b.y),right=Math.max(a.x+a.w,b.x+b.w),bottom=Math.max(a.y+a.h,b.y+b.h);
      const pad=viewport.clientWidth<600?40:110;return withOutcomes({x:left-pad,y:top-pad,w:right-left+pad*2,h:bottom-top+pad*2},[edge.from]);
    }
    function selectEdge(edge) {
      clearSelection();selectedEdge=edge.id;world.classList.add('process-has-edge-selection');
      const source=nodeButtons.get(edge.from),target=nodeButtons.get(edge.to);source.dataset.edgeRole='source';target.dataset.edgeRole='target';source.setAttribute('aria-pressed','true');target.setAttribute('aria-pressed','true');
      const rendered=edgeControls.get(edge.id);rendered.control.classList.add('is-selected');rendered.control.setAttribute('aria-pressed','true');rendered.path.setAttribute('marker-end','url(#process-arrow-active)');
      rendered.control.focus({preventScroll:true});
      inspector.replaceChildren(el('span','process-inspector-role','Связь этапов'),el('strong','process-inspector-title',nodesById.get(edge.from).title+' → '+nodesById.get(edge.to).title),el('p','process-inspector-detail',edge.label||'Выделены начало и конец выбранной стрелки.'));
      fitRect(pairRect(edge),'');
    }
    (data.presets || []).forEach(p => { const button = el('button', 'process-preset', p.label); button.type = 'button'; button.setAttribute('aria-pressed', 'false'); button.addEventListener('click', () => fit(p.id)); presets.append(button); presetButtons.set(p.id, button); });
    function tool(label, text, action) { const b = el('button', 'process-tool', text); b.type = 'button'; b.setAttribute('aria-label', label); b.addEventListener('click', action); tools.append(b); return b; }
    tool('Уменьшить', '−', () => zoomBy(1 / 1.25)); tools.append(output); tool('Увеличить', '+', () => zoomBy(1.25)); tool('Показать всю схему', 'Обзор', () => { clearSelection(); fit(); });
    const fullscreen = tool('Схема на весь экран', '', () => { if (document.fullscreenElement === container) { document.exitFullscreen(); } else if (container.requestFullscreen) { container.requestFullscreen().catch(() => {}); } }); fullscreen.title = 'Схема на весь экран'; fullscreen.classList.add('process-fullscreen'); fullscreen.disabled = !document.fullscreenEnabled; const fullscreenIcon = svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }); fullscreenIcon.append(svgEl('path', { d: 'M 4 9 V 4 H 9 M 15 4 H 20 V 9 M 20 15 V 20 H 15 M 9 20 H 4 V 15' })); fullscreen.append(fullscreenIcon);
    function point(e) { const r = viewport.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function down(e) { transitionMs = 0; world.style.transitionDuration = '0ms'; if (e.pointerType === 'mouse' && e.button !== 0) return; pointers.set(e.pointerId, point(e)); e.target.setPointerCapture(e.pointerId); if (pointers.size === 1) drag = { start: point(e), x, y, moved: false }; if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale, x, y, center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }; drag = null; } }
    function move(e) { transitionMs = 0; if (!pointers.has(e.pointerId)) return; pointers.set(e.pointerId, point(e)); if (pointers.size === 2 && pinch) { const [a, b] = [...pointers.values()]; const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; const next = Math.min(3, Math.max(minScale, pinch.scale * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, pinch.distance))); x = center.x - (pinch.center.x - pinch.x) * next / pinch.scale; y = center.y - (pinch.center.y - pinch.y) * next / pinch.scale; scale = next; suppressClick = true; clampPosition(); updatePreset(''); schedule(); } else if (drag && pointers.size === 1) { const p = point(e), dx = p.x - drag.start.x, dy = p.y - drag.start.y; if (Math.hypot(dx, dy) >= 5) drag.moved = true; if (drag.moved) { x = drag.x + dx; y = drag.y + dy; clampPosition(); updatePreset(''); schedule(); } } }
    function up(e) { pointers.delete(e.pointerId); if (drag && drag.moved) suppressClick = true; drag = null; pinch = null; if (pointers.size === 1) { const p = [...pointers.values()][0]; drag = { start: p, x, y, moved: false }; } if (suppressClick) setTimeout(() => { suppressClick = false; }, 0); }
    function wheel(e) { if (!e.ctrlKey) return; e.preventDefault(); zoomBy(Math.exp(-e.deltaY * .002), point(e)); }
    function dbl(e) { e.preventDefault(); zoomBy(1.5, point(e)); }
    function key(e) { let handled = true; switch (e.key) { case '+': case '=': zoomBy(1.25); break; case '-': case '_': zoomBy(1 / 1.25); break; case '0': fit(); break; case 'ArrowLeft': x += 60; break; case 'ArrowRight': x -= 60; break; case 'ArrowUp': y += 60; break; case 'ArrowDown': y -= 60; break; case 'Escape': clearSelection(); break; default: handled = false; } if (handled) { e.preventDefault(); e.stopPropagation(); clampPosition(); schedule(); } }
    viewport.addEventListener('pointerdown', down); viewport.addEventListener('pointermove', move); viewport.addEventListener('pointerup', up); viewport.addEventListener('pointercancel', up); viewport.addEventListener('wheel', wheel, { passive: false }); viewport.addEventListener('dblclick', dbl); viewport.addEventListener('keydown', key);
    function resize() {
      const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;
      if((w<600)!==phaseLayoutNarrow){
        const anchor=phasePages(activePreset,phaseLayoutNarrow)[presetPage]?.nodes[0];phaseLayoutNarrow=w<600;
        presetPage=Math.max(0,phasePages(activePreset,phaseLayoutNarrow).findIndex(page=>page.nodes.includes(anchor)));
      }
      minScale=Math.min((w-56)/data.width,(h-56)/data.height);
      const edge=!activePreset&&selectedEdge&&data.edges.find(e=>e.id===selectedEdge);if(edge){fitRect(pairRect(edge),'',0);return;}
      const node=!activePreset&&selected&&nodesById.get(selected);if(node){fitRect(nodeRect(node),'',0);return;}
      const id=activePreset||'overview';fitRect(phaseRect(id),id,0);
    }
    function fullscreenChanged() { const active = document.fullscreenElement === container; fullscreen.setAttribute('aria-label', active ? 'Выйти из полноэкранного режима' : 'Схема на весь экран'); fullscreen.title = active ? 'Выйти из полноэкранного режима' : 'Схема на весь экран'; resize(); }
    document.addEventListener('fullscreenchange', fullscreenChanged);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null; if (observer) observer.observe(viewport); else window.addEventListener('resize', resize);
    clearSelection(); resize();
    return { fit, zoomBy, getState: () => { const edge=selectedEdge&&data.edges.find(e=>e.id===selectedEdge),pages=phasePages(activePreset);return {scale,x,y,selected,edge:selectedEdge,edgeEndpoints:edge?{from:edge.from,to:edge.to}:null,preset:activePreset,presetPage,presetPageCount:pages.length,presetNodes:pages[presetPage]?.nodes||[]}; }, destroy() { if (raf) cancelAnimationFrame(raf); document.removeEventListener('fullscreenchange', fullscreenChanged); if (observer) observer.disconnect(); else window.removeEventListener('resize', resize); viewport.removeEventListener('pointerdown', down); viewport.removeEventListener('pointermove', move); viewport.removeEventListener('pointerup', up); viewport.removeEventListener('pointercancel', up); viewport.removeEventListener('wheel', wheel); viewport.removeEventListener('dblclick', dbl); viewport.removeEventListener('keydown', key); container.replaceChildren(); container.classList.remove('process-map'); } };
  }
  window.PrimeProcessMap = { mount };
}());

