/* ---------- оборудование и светосхема: вспомогательные события ---------- */
function addGear(id){
  const d=dealById(id);if(!d)return;
  const ex=S.gear.find(g=>g.dealId===id);
  if(ex){ex.qty=num(ex.qty)+1;ex.sent=false}
  else S.gear.push({id:uid(),dealId:id,name:d[1],rental:rentalName(d[3]),kzt:d[4],qty:1,days:1,src:'прайс '+rentalName(d[3]),sent:false});
  save();
}
let ltDrag=null;
function ltPoint(e){
  const svg=$('#lt-svg');
  if(!svg||!svg.createSVGPoint)return {x:e.clientX,y:e.clientY};
  const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;
  const m=svg.getScreenCTM();
  return m?pt.matrixTransform(m.inverse()):{x:pt.x,y:pt.y};
}
document.addEventListener('pointerdown',e=>{
  if(!S||S.tab!=='lights')return;
  const g=e.target.closest&&e.target.closest('.lt-item');
  if(g){
    const it=curLight().items.find(i=>i.id===g.dataset.id);if(!it)return;
    S.lightSel=it.id;const p=ltPoint(e);ltDrag={id:it.id,dx:it.x-p.x,dy:it.y-p.y};
    try{$('#lt-svg').setPointerCapture(e.pointerId)}catch(err){}
    e.preventDefault();paintLight();paintInspector();
  }else if(e.target.id==='lt-bg'||e.target.id==='lt-svg'){S.lightSel='';paintLight();paintInspector()}
});
document.addEventListener('pointermove',e=>{
  if(!ltDrag)return;
  const it=curLight().items.find(i=>i.id===ltDrag.id);if(!it)return;
  const p=ltPoint(e);it.x=Math.max(10,Math.min(790,p.x+ltDrag.dx));it.y=Math.max(10,Math.min(510,p.y+ltDrag.dy));paintLight();
});
document.addEventListener('pointerup',()=>{if(ltDrag){ltDrag=null;save()}});
document.addEventListener('keydown',e=>{
  if(!S||S.tab!=='lights'||!S.lightSel)return;
  const tag=(e.target.tagName||'').toLowerCase();if(tag==='input'||tag==='textarea'||tag==='select')return;
  const nk={ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d'}[e.key];if(nk){ltNudge(nk,e.shiftKey?40:10);e.preventDefault();return}
  if(e.key==='Delete'||e.key==='Backspace'){const L=curLight();L.items=L.items.filter(i=>i.id!==S.lightSel);S.lightSel='';paintLight();paintInspector();save();e.preventDefault()}
});


/* ---------- раскадровка: кадр из 3D-сцены ---------- */
let SB3={on:false,mm:35,lit:false};
const sbFov=mm=>2*Math.atan(12/mm)*180/Math.PI;
function sbSceneId(){return S.storyScene&&S.scenes.some(s=>s.id===S.storyScene)?S.storyScene:(S.scenes[0]&&S.scenes[0].id)}
async function sb3dEnter(){
  if(!ED||SB3.on)return;
  const sid=sbSceneId();S.lightScene=sid||0;S.lightSel='';
  const L=curLight();
  if(!L.items.some(i=>i.type==='actor')){
    const sc=S.scenes.find(s=>s.id===sid),names=(sc&&sc.chars.length?sc.chars:['Актёр']).slice(0,4);
    names.forEach((n,i)=>L.items.push(ltMake('actor',400+Math.round((i-(names.length-1)/2)*60),260,{label:n,rot:180})));save();
  }
  SB3.on=true;
  const main=$('#sbed .sbed-main'),tools=$('#sbed .sbed-tools');
  main.insertAdjacentHTML('beforeend','<div id="sb3d" class="sb3d"><p class="lt3d-hint">Загружаю 3D…</p></div>');
  $('#sbBig').hidden=true;tools.hidden=true;{const z=$('#sbed .sbz');if(z)z.hidden=true}
  tools.insertAdjacentHTML('afterend','<div class="sbed-tools sb3-tools" id="sb3tools">'+
    '<label class="sbsize">Объектив <b id="sb3mm">'+SB3.mm+' мм</b><input type="range" min="14" max="135" step="1" value="'+SB3.mm+'" data-sb3mm="1"></label><span class="sbsep"></span>'+
    '<button class="sbt" type="button" data-sb3="actor">'+sbIcon('person')+'<span>Актёр</span></button><label class="sbt sb3-kind"><span>＋ Предмет</span><select data-sb3kind="1" aria-label="Добавить предмет"><option value="">выбрать…</option>'+Object.keys(PROP_K).map(k=>'<option value="'+k+'">'+PROP_K[k].n+'</option>').join('')+'</select></label>'+
    '<button class="sbt" type="button" data-sb3="pose"><span>Сидит / стоит</span></button><button class="sbt" type="button" data-sb3="turn"><span>Повернуть</span></button><button class="sbt" type="button" data-sb3="del"><span>Удалить</span></button><span class="sbsep"></span>'+
    '<label class="sbt sb3-kind"><span id="sb3tod">'+((TOD[curLight().tod]||{}).n||'Время суток')+'</span><select data-sb3tod="1" aria-label="Время суток"><option value="">Студия</option><option value="day">День</option><option value="eve">Вечер</option><option value="night">Ночь</option></select></label>'+
    '<button class="sbt" type="button" data-sb3="lit" aria-pressed="'+SB3.lit+'" title="Показать сцену со светом из светосхемы">'+sbIcon('light')+'<span>Свет сцены</span></button><span class="sbsep"></span>'+
    '<button class="sbt" type="button" data-sb3="back"><span>Назад к рисунку</span></button><button class="sbt sbt-shot" type="button" data-sb3="shot">'+sbIcon('camera')+'<span>Снять кадр</span></button>'+
    '<span class="sb3-help">Крутите и приближайте сцену, чтобы найти ракурс. Персонажей можно перетаскивать по полу.</span></div>');
  await lt3Mount('#sb3d');
  if(!LT3||!SB3.on)return;
  LT3.controls.minDistance=.6;LT3.cam.fov=sbFov(SB3.mm);LT3.cam.position.set(0,1.55,5.2);LT3.controls.target.set(0,1.3,0);LT3.cam.updateProjectionMatrix();lt3Size();
}
function sb3dExit(){
  if(!SB3.on)return;SB3.on=false;
  const h=$('#sb3d');if(h)h.remove();const tb=$('#sb3tools');if(tb)tb.remove();
  const cv=$('#sbBig');if(cv)cv.hidden=false;const tools=$('#sbed .sbed-tools');if(tools)tools.hidden=false;{const z=$('#sbed .sbz');if(z)z.hidden=false}
}
function sb3dShot(){
  if(!LT3)return;const T=LT3.T,R=LT3.renderer,C=LT3.cam,items=curLight().items,hid=[];
  LT3.group.traverse(o=>{if(o.visible&&(o.isSprite||o.type==='LineSegments'||(o.material&&o.material.blending===T.AdditiveBlending))){o.visible=false;hid.push(o)}});
  LT3.group.children.forEach(g=>{const it=items.find(i=>i.id===g.userData.id);if(it&&it.type==='camera'&&g.visible){g.visible=false;hid.push(g)}});
  const pr=R.getPixelRatio();R.setPixelRatio(1);R.setSize(SB_W,SB_H,false);C.aspect=16/9;C.updateProjectionMatrix();R.render(LT3.scene,C);
  let url='';try{url=R.domElement.toDataURL('image/png')}catch(e){}
  hid.forEach(o=>o.visible=true);R.setPixelRatio(pr);lt3Size();
  if(!url){toast('Не удалось снять кадр');return}
  const im=new Image();im.onload=()=>{sb3dExit();const cv=$('#sbBig');if(!cv)return;sbPush();cv.getContext('2d').drawImage(im,0,0,SB_W,SB_H);sbSave();toast('Кадр снят. Можно дорисовать поверх.')};im.src=url;
}
document.addEventListener('change',e=>{if(!SB3.on||!e.target.dataset||!e.target.dataset.sb3tod||!LT3)return;const L=curLight(),v=e.target.value;if(TOD[v])L.tod=v;else delete L.tod;setText('#sb3tod',(TOD[v]||{}).n||'Время суток');lt3Look();save()});
document.addEventListener('change',e=>{if(!SB3.on||!e.target.dataset||!e.target.dataset.sb3kind||!LT3)return;const k=e.target.value;e.target.value='';const P=PROP_K[k];if(!P)return;
  const L=curLight(),n=L.items.filter(i=>i.type==='prop'&&propKind(i)===k).length,ni=ltMake('prop',400+Math.round((Math.random()-.5)*120),260+Math.round((Math.random()-.5)*80),{kind:k,len:P.len,label:P.n+(n?' '+(n+1):''),rot:k==='car'?90:0});
  L.items.push(ni);S.lightSel=ni.id;lt3Sync();save()});
document.addEventListener('input',e=>{if(!SB3.on||!e.target.dataset||!e.target.dataset.sb3mm||!LT3)return;SB3.mm=parseInt(e.target.value,10)||35;setText('#sb3mm',SB3.mm+' мм');LT3.cam.fov=sbFov(SB3.mm);LT3.cam.updateProjectionMatrix()});
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('#sb3tools [data-sb3]');if(!b||!SB3.on)return;
  const k=b.dataset.sb3,L=curLight(),it=selItem();
  if(k==='shot')sb3dShot();
  else if(k==='lit'){SB3.lit=!SB3.lit;b.setAttribute('aria-pressed',String(SB3.lit));lt3Look();if(SB3.lit&&!L.items.some(i=>i.type==='light'))toast('В светосхеме этой сцены пока нет приборов: добавьте свет во вкладке «Светосхема»')}
  else if(k==='back')sb3dExit();
  else if(k==='actor'||k==='prop'){const n=L.items.filter(i=>i.type===k).length,x=400+Math.round((Math.random()-.5)*120),y=260+Math.round((Math.random()-.5)*80);
    const ni=ltMake(k,x,y,k==='actor'?{label:'Актёр '+(n+1),rot:180}:{label:'Предмет '+(n+1)});L.items.push(ni);S.lightSel=ni.id;lt3Sync();save()}
  else if(!it)toast('Сначала выберите персонажа или предмет: нажмите на него в сцене');
  else if(k==='pose'){if(it.type!=='actor'){toast('Сидеть может только актёр');return}it.pose=it.pose==='sit'?'stand':'sit';lt3Sync();save()}
  else if(k==='turn'){it.rot=((num(it.rot)||0)+45)%360;lt3Sync();save()}
  else if(k==='del'){L.items=L.items.filter(i=>i.id!==it.id);S.lightSel='';lt3Sync();save()}
});
/* ---------- раскадровка: редактор на весь экран ---------- */
const SB_W=1280,SB_H=720;
const SB_TOOLS=[['hand','Рука (двигать)'],['pen','Карандаш'],['marker','Маркер'],['erase','Ластик'],['person','Человек'],['top','Человек сверху'],['camera','Камера'],['light','Свет'],['arrow','Движение героя'],['carrow','Движение камеры'],['text','Текст']];
const SB_COLORS=[['#1b1b2f','Чёрный'],['#d6302b','Красный'],['#2563eb','Синий'],['#1e8a4c','Зелёный'],['#f59e0b','Оранжевый']];
let ED=null;
document.addEventListener('click',e=>{const cv=e.target.closest&&e.target.closest('.sb-cv');if(cv&&S)sbOpen(cv.dataset.id)});
function sbSceneFrames(){const sid=S.storyScene&&S.scenes.some(s=>s.id===S.storyScene)?S.storyScene:(S.scenes[0]&&S.scenes[0].id);return S.story[sid]||[]}
function sbOpen(id){
  const f=findFrame(id);if(!f)return;
  sbClose(true);
  const list=sbSceneFrames(),idx=list.findIndex(x=>x.id===id);
  ED={id:id,tool:(ED0.tool==='hand'?'pen':(ED0.tool||'pen')),color:(ED0.color||'#1b1b2f'),size:(ED0.size||4),scale:(ED0.scale||1),undo:[],drag:null,text:'',last:null,z:{s:1,x:0,y:0},ptrs:new Map(),pinch:null};
  const el=document.createElement('div');el.className='sbed';el.id='sbed';el.setAttribute('role','dialog');el.setAttribute('aria-label','Рисование кадра');
  el.innerHTML='<div class="sbed-top"><button class="btn sec" type="button" data-sbe="prev"'+(idx>0?'':' disabled')+' aria-label="Предыдущий кадр">‹</button><b class="sbed-n">Кадр '+(idx+1)+' из '+list.length+'</b><button class="btn sec" type="button" data-sbe="next"'+(idx<list.length-1?'':' disabled')+' aria-label="Следующий кадр">›</button>'+
    '<input class="sbed-cap" value="'+esc(f.cap||'')+'" placeholder="Что в кадре: крупность, действие, звук"><button class="btn" type="button" data-sbe="done">Готово</button></div>'+
    '<div class="sbz"><button class="sbz-b sbz-undo" type="button" data-sbe="undo" aria-label="Отменить последнее действие">'+sbIcon('undo')+'<span>Отменить</span></button><span class="sbz-sp"></span><button class="sbz-b" type="button" data-sbe="zout" aria-label="Уменьшить">−</button><button class="sbz-b" type="button" data-sbe="zin" aria-label="Увеличить">+</button><button class="sbz-b sbz-r" type="button" data-sbe="zreset" aria-label="Показать целиком">1:1</button></div>'+
    '<div class="sbed-main"><canvas id="sbBig" width="'+SB_W+'" height="'+SB_H+'"></canvas></div>'+
    '<div class="sbed-tools">'+SB_TOOLS.map(x=>'<button class="sbt" type="button" data-sbt="'+x[0]+'" aria-pressed="'+(ED.tool===x[0])+'">'+sbIcon(x[0])+'<span>'+x[1]+'</span></button>').join('')+
    '<span class="sbsep"></span>'+
    '<label class="sbsize"><span class="sbl">Размер</span><input type="range" min="0.5" max="4" step="0.1" value="'+ED.scale+'" data-sbscale="1" aria-label="Размер фигуры: камеры, света, человека, текста"></label>'+
    '<span class="sbsep"></span>'+SB_COLORS.map(x=>'<button class="sbc" type="button" data-sbcol="'+x[0]+'" aria-label="'+x[1]+'" aria-pressed="'+(ED.color===x[0])+'" style="--c:'+x[0]+'"></button>').join('')+
    '<label class="sbsize"><span class="sbl">Толщина</span><input type="range" min="2" max="18" value="'+ED.size+'" data-sbsize="1" aria-label="Толщина линии"></label>'+
    '<input class="sbtext" data-sbtext="1" placeholder="Текст для штампа"'+(ED.tool==='text'?'':' hidden')+'>'+
    '<button class="sbt" type="button" data-sbe="frame" aria-label="Рамка 2.39">'+sbIcon('frame')+'<span>Рамка 2.39</span></button><button class="sbt" type="button" data-sbe="grid" aria-label="Сетка третей">'+sbIcon('grid')+'<span>Сетка третей</span></button>'+
    '<button class="sbt" type="button" data-sbe="undo" aria-label="Отменить">'+sbIcon('undo')+'<span>Отменить</span></button><button class="sbt" type="button" data-sbe="clear" aria-label="Очистить кадр">'+sbIcon('clear')+'<span>Очистить</span></button></div>';
  document.body.appendChild(el);document.body.classList.add('sbed-open');
  const cv=$('#sbBig'),c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,SB_W,SB_H);
  if(f.img){const im=new Image();im.onload=()=>{c.drawImage(im,0,0,SB_W,SB_H)};im.src=f.img}
  try{if(window.innerWidth<900&&screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{})}catch(err){}
}
const ED0={};
function sbSave(){
  if(!ED)return;const f=findFrame(ED.id),cv=$('#sbBig');if(!f||!cv)return;
  try{f.img=cv.toDataURL('image/png')}catch(err){}
  const cap=$('#sbed .sbed-cap');if(cap)f.cap=cap.value.slice(0,500);
  save();
}
function sbClose(silent){
  const el=$('#sbed');if(!el)return;
  if(SB3.on)sb3dExit();
  sbSave();ED0.tool=ED.tool;ED0.color=ED.color;ED0.size=ED.size;ED0.scale=ED.scale;
  el.remove();document.body.classList.remove('sbed-open');ED=null;
  try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}catch(err){}
  if(!silent)render();
}
function sbIcon(k){
  const m={pen:'<path d="M4 20l4-1 11-11-3-3L5 16z"/>',marker:'<path d="M5 19l3-1 10-10-2-2L6 16z" stroke-width="3.2"/>',erase:'<path d="M7 20h11M5 15l8-8 5 5-6 6H8z"/>',person:'<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M8 11h8M12 15l-3 6M12 15l3 6"/>',
    top:'<circle cx="12" cy="13" r="6"/><path d="M12 7l2-3h-4z"/>',camera:'<rect x="3" y="7" width="12" height="10" rx="2"/><path d="M15 11l6-3v8l-6-3"/>',light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
    arrow:'<path d="M4 18L18 6M18 6h-7M18 6v7"/>',carrow:'<path d="M4 18L18 6" stroke-dasharray="3 3"/><path d="M18 6h-7M18 6v7"/>',text:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',hand:'<path d="M8 13V6a1.5 1.5 0 013 0v5M11 11V4.5a1.5 1.5 0 013 0V11M14 11V6a1.5 1.5 0 013 0v7c0 4-2 7-6 7-3 0-4.500-1.500-6-4l-2-3a1.500 1.500 0 012.500-1.500L8 14"/>',undo:'<path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3"/>',clear:'<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>',frame:'<rect x="3" y="7" width="18" height="10" rx="1"/>',grid:'<path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>'};
  return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(m[k]||'')+'</svg>';
}
function sbPt(cv,e){const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height}}
function sbArrowHead(c,x1,y1,x2,y2,s){const a=Math.atan2(y2-y1,x2-x1);c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-s*Math.cos(a-.45),y2-s*Math.sin(a-.45));c.lineTo(x2-s*Math.cos(a+.45),y2-s*Math.sin(a+.45));c.closePath();c.fill()}
function sbStamp(c,k,a,b){
  const K=ED.scale||1,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),ang=len>8?Math.atan2(dy,dx):-Math.PI/2,lw=Math.max(2,ED.size*.8);
  c.save();c.strokeStyle=ED.color;c.fillStyle=ED.color;c.lineWidth=lw;c.lineCap='round';c.lineJoin='round';
  if(k==='arrow'||k==='carrow'){
    const e=len>8?b:{x:a.x+90*K,y:a.y};
    if(k==='carrow')c.setLineDash([lw*3,lw*2.4]);
    c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.stroke();c.setLineDash([]);sbArrowHead(c,a.x,a.y,e.x,e.y,10+lw*3);
  }else if(k==='person'){
    const h=len>20?Math.min(len,900):170*K,u=h/8;c.translate(a.x,a.y);
    c.beginPath();c.arc(0,u,u,0,Math.PI*2);c.stroke();
    c.beginPath();c.moveTo(0,u*2);c.lineTo(0,u*5);c.moveTo(-u*1.6,u*3);c.lineTo(u*1.6,u*3);c.moveTo(0,u*5);c.lineTo(-u*1.3,h);c.moveTo(0,u*5);c.lineTo(u*1.3,h);c.stroke();
  }else if(k==='top'){
    const r=34;c.translate(a.x,a.y);c.rotate(ang+Math.PI/2);c.scale(K,K);c.lineWidth=lw/K;
    c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.globalAlpha=.15;c.fill();c.globalAlpha=1;c.stroke();
    c.beginPath();c.moveTo(-12,-r+2);c.lineTo(0,-r-22);c.lineTo(12,-r+2);c.closePath();c.fill();
  }else if(k==='camera'){
    c.translate(a.x,a.y);c.rotate(ang);c.scale(K,K);c.lineWidth=lw/K;
    c.beginPath();c.rect(-46,-28,62,56);c.stroke();c.beginPath();c.moveTo(16,-12);c.lineTo(52,-30);c.lineTo(52,30);c.lineTo(16,12);c.closePath();c.stroke();
    c.beginPath();c.arc(-30,-40,12,0,Math.PI*2);c.arc(-4,-40,12,0,Math.PI*2);c.stroke();
  }else if(k==='light'){
    c.translate(a.x,a.y);c.scale(K,K);c.lineWidth=lw/K;c.beginPath();c.arc(0,0,22,0,Math.PI*2);c.globalAlpha=.25;c.fill();c.globalAlpha=1;c.stroke();
    for(let i=0;i<8;i++){const q=i*Math.PI/4;c.beginPath();c.moveTo(Math.cos(q)*32,Math.sin(q)*32);c.lineTo(Math.cos(q)*48,Math.sin(q)*48);c.stroke()}
    if(len>30){c.setLineDash([8,8]);c.beginPath();c.moveTo(0,0);c.lineTo(dx/K,dy/K);c.stroke();c.setLineDash([])}
  }else if(k==='text'){
    const s=(ED.text||'').trim()||'ТЕКСТ';c.font='600 '+Math.round((18+ED.size*3)*K)+'px Onest,system-ui,sans-serif';c.textBaseline='middle';c.fillText(s,a.x,a.y);
  }
  c.restore();
}
function sbGuide(k){
  const cv=$('#sbBig');if(!cv)return;const c=cv.getContext('2d');sbPush();
  c.save();
  if(k==='frame'){const h=SB_W/2.39,pad=(SB_H-h)/2;c.fillStyle='rgba(20,20,30,.85)';c.fillRect(0,0,SB_W,pad);c.fillRect(0,SB_H-pad,SB_W,pad)}
  else{c.strokeStyle='rgba(37,99,235,.55)';c.lineWidth=2;c.setLineDash([10,8]);c.beginPath();[1,2].forEach(i=>{c.moveTo(SB_W*i/3,0);c.lineTo(SB_W*i/3,SB_H);c.moveTo(0,SB_H*i/3);c.lineTo(SB_W,SB_H*i/3)});c.stroke()}
  c.restore();
}
function sbPush(){const cv=$('#sbBig');if(!cv||!ED)return;try{ED.undo.push(cv.getContext('2d').getImageData(0,0,SB_W,SB_H));if(ED.undo.length>25)ED.undo.shift()}catch(err){}}
function sbZoomApply(){
  const cv=$('#sbBig');if(!cv||!ED)return;const z=ED.z;
  z.s=Math.min(6,Math.max(1,z.s));
  const w=cv.offsetWidth,h=cv.offsetHeight,mx=(z.s-1)*w/2,my=(z.s-1)*h/2;
  z.x=Math.min(mx,Math.max(-mx,z.x));z.y=Math.min(my,Math.max(-my,z.y));
  if(z.s<=1.001){z.s=1;z.x=0;z.y=0}
  cv.style.transform=z.s===1?'':'translate('+z.x+'px,'+z.y+'px) scale('+z.s+')';
  const r=$('#sbed .sbz-r');if(r)r.textContent=z.s===1?'1:1':Math.round(z.s*100)+'%';
}
function sbZoomBy(f){if(!ED)return;ED.z.s*=f;sbZoomApply()}
function sbRelast(){
  const L=ED&&ED.last,cv=$('#sbBig');if(!L||!cv)return;
  const c=cv.getContext('2d');if(L.snap)c.putImageData(L.snap,0,0);sbStamp(c,L.tool,L.a,L.b);sbSave();
}
document.addEventListener('pointerdown',e=>{
  const cv=e.target.closest&&e.target.closest('#sbBig');if(!cv||!ED)return;
  e.preventDefault();const c=cv.getContext('2d');
  ED.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  try{cv.setPointerCapture(e.pointerId)}catch(err){}
  if(ED.ptrs.size>=2){
    /* два пальца: масштаб и сдвиг. Начатый штрих отменяем */
    if(ED.drag&&ED.drag.cv){const im=ED.undo.pop();if(im)c.putImageData(im,0,0);c.globalAlpha=1;ED.drag=null}
    ED.pan=null;const q=[...ED.ptrs.values()];
    ED.pinch={d:Math.hypot(q[0].x-q[1].x,q[0].y-q[1].y)||1,s:ED.z.s,mx:(q[0].x+q[1].x)/2,my:(q[0].y+q[1].y)/2,x:ED.z.x,y:ED.z.y};
    return;
  }
  if(ED.tool==='hand'){ED.pan={px:e.clientX,py:e.clientY,x:ED.z.x,y:ED.z.y};return}
  const p=sbPt(cv,e);ED.last=null;sbPush();
  if(ED.tool==='pen'||ED.tool==='marker'||ED.tool==='erase'){
    c.lineCap='round';c.lineJoin='round';
    c.lineWidth=ED.tool==='erase'?ED.size*6:ED.tool==='marker'?ED.size*3.2:ED.size;
    c.strokeStyle=ED.tool==='erase'?'#fff':ED.color;c.globalAlpha=ED.tool==='marker'?.45:1;
    c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+.1,p.y+.1);c.stroke();ED.drag={free:true,c:c,cv:cv};
  }else{
    ED.drag={free:false,c:c,cv:cv,a:p,b:p,snap:ED.undo[ED.undo.length-1]};
    sbStamp(c,ED.tool,p,p);
  }
});
document.addEventListener('pointermove',e=>{
  if(!ED)return;
  if(ED.ptrs.has(e.pointerId))ED.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ED.pinch&&ED.ptrs.size>=2){
    const q=[...ED.ptrs.values()],d=Math.hypot(q[0].x-q[1].x,q[0].y-q[1].y)||1,P=ED.pinch;
    ED.z.s=P.s*d/P.d;ED.z.x=P.x+((q[0].x+q[1].x)/2-P.mx);ED.z.y=P.y+((q[0].y+q[1].y)/2-P.my);sbZoomApply();return;
  }
  if(ED.pan){ED.z.x=ED.pan.x+(e.clientX-ED.pan.px);ED.z.y=ED.pan.y+(e.clientY-ED.pan.py);sbZoomApply();return}
  if(!ED.drag)return;const d=ED.drag,p=sbPt(d.cv,e);
  if(d.free){d.c.lineTo(p.x,p.y);d.c.stroke()}
  else{d.b=p;if(d.snap)d.c.putImageData(d.snap,0,0);sbStamp(d.c,ED.tool,d.a,p)}
});
function sbPointerEnd(e){
  if(!ED)return;ED.ptrs.delete(e.pointerId);
  if(ED.pinch){if(ED.ptrs.size<2)ED.pinch=null;return}
  ED.pan=null;
  if(!ED.drag)return;
  ED.drag.c.globalAlpha=1;
  if(!ED.drag.free)ED.last={tool:ED.tool,a:ED.drag.a,b:ED.drag.b,snap:ED.drag.snap};
  ED.drag=null;sbSave();
}
document.addEventListener('pointerup',sbPointerEnd);
document.addEventListener('pointercancel',sbPointerEnd);
document.addEventListener('wheel',e=>{
  if(!ED||!(e.target.closest&&e.target.closest('#sbBig')))return;
  e.preventDefault();sbZoomBy(e.deltaY<0?1.15:1/1.15);
},{passive:false});
document.addEventListener('click',e=>{
  if(!ED)return;const b=e.target.closest&&e.target.closest('#sbed [data-sbt],#sbed [data-sbcol],#sbed [data-sbe]');if(!b)return;
  if(b.dataset.sbt){ED.tool=b.dataset.sbt;$$('#sbed [data-sbt]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const ti=$('#sbed .sbtext');if(ti){ti.hidden=ED.tool!=='text';if(!ti.hidden)ti.focus()}return}
  if(b.dataset.sbcol){ED.color=b.dataset.sbcol;$$('#sbed [data-sbcol]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sbRelast();return}
  const a=b.dataset.sbe,cv=$('#sbBig'),c=cv&&cv.getContext('2d');
  if(a==='done')sbClose();
  else if(a==='undo'){ED.last=null;const im=ED.undo.pop();if(im&&c){c.putImageData(im,0,0);sbSave()}else toast('Больше нечего отменять')}
  else if(a==='zin')sbZoomBy(1.4)
  else if(a==='zout')sbZoomBy(1/1.4)
  else if(a==='zreset'){ED.z={s:1,x:0,y:0};sbZoomApply()}
  else if(a==='clear'){ED.last=null;sbPush();c.fillStyle='#fff';c.fillRect(0,0,SB_W,SB_H);sbSave()}
  else if(a==='frame'||a==='grid'){ED.last=null;sbGuide(a);sbSave()}
  else if(a==='s3d'){sb3dEnter()}
  else if(a==='prev'||a==='next'){const list=sbSceneFrames(),i=list.findIndex(x=>x.id===ED.id),n=list[i+(a==='next'?1:-1)];if(n){sbSave();const keep={tool:ED.tool,color:ED.color,size:ED.size,scale:ED.scale};Object.assign(ED0,keep);sbOpen(n.id)}}
});
document.addEventListener('input',e=>{if(!ED)return;if(e.target.dataset&&e.target.dataset.sbsize){ED.size=parseInt(e.target.value,10)||4;sbRelast()}if(e.target.dataset&&e.target.dataset.sbscale){ED.scale=Math.min(4,Math.max(.5,parseFloat(e.target.value)||1));sbRelast()}if(e.target.dataset&&e.target.dataset.sbtext)ED.text=e.target.value.slice(0,80)});
document.addEventListener('keydown',e=>{if(!ED)return;if(e.key==='Escape'){sbClose()}else if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!/INPUT/.test(document.activeElement.tagName)){e.preventDefault();const b=$('#sbed [data-sbe=undo]');b&&b.click()}});

if(window.__STUDENT_TEST__)window.__student={parseScript,calc,validateProject,exportEnvelope,sunTimes,applyBT,autoPlan,applyScript,normalize,fresh,hasData,importFromInput,applyImport,exportProject,saveFile,backupBanner,render,save,
  fdxText,csvParse,budgetFromRows,makeZip,makeDocx,scriptBdBlocks,makeXlsx,crc32,zipEntry,budgetXlsx,docText,getS:()=>S,setS:v=>{S=v;USER=USER||'test'},lt3:()=>LT3,BT,DEALS};
const CINE_BG='data:image/svg+xml;utf8,'+encodeURIComponent(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs>',
'<radialGradient id="bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#22438a"/><stop offset=".55" stop-color="#0d1b3d"/><stop offset="1" stop-color="#04070f"/></radialGradient>',
'<linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFEFB3" stop-opacity=".6"/><stop offset="1" stop-color="#FFEFB3" stop-opacity="0"/></linearGradient>',
'<radialGradient id="vig" cx="50%" cy="50%" r="70%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>',
'<pattern id="holes" width="60" height="40" patternUnits="userSpaceOnUse"><rect x="22" y="10" width="16" height="20" rx="4" fill="#FFEFB3" fill-opacity=".85"/></pattern>',
'<pattern id="frames" width="200" height="120" patternUnits="userSpaceOnUse"><rect x="8" y="8" width="184" height="104" rx="6" fill="#FFEFB3" fill-opacity=".1"/></pattern>',
'<g id="strip"><rect x="-200" y="560" width="2000" height="200" fill="#05070f" fill-opacity=".85"/><rect x="-200" y="560" width="2000" height="40" fill="url(#holes)"/><rect x="-200" y="720" width="2000" height="40" fill="url(#holes)"/><rect x="-200" y="600" width="2000" height="120" fill="url(#frames)"/></g>',
'</defs><rect width="1600" height="900" fill="url(#bg)"/>',
'<polygon points="120,-10 140,10 1600,900 1600,160" fill="url(#beam)" opacity=".55"/>',
'<g transform="translate(0,-500) rotate(7 800 450)" opacity=".3"><use href="#strip"/></g>',
'<g transform="rotate(-9 800 450)"><use href="#strip"/></g>',
'<g fill="#FFEFB3" fill-opacity=".5"><circle cx="420" cy="180" r="3"/><circle cx="760" cy="310" r="2"/><circle cx="1010" cy="240" r="3.5"/><circle cx="1240" cy="420" r="2"/><circle cx="560" cy="430" r="2.5"/><circle cx="900" cy="140" r="2"/></g>',
'<rect width="1600" height="900" fill="url(#vig)"/></svg>'].join(''));
const PHOTO_BG='';
const LOGO_IMG='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjMxIDE2OSAxNTcxIDYzNyI+PHBhdGggZmlsbD0iIzAwMCIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTM2LjAgNzEwLjJMMTI1LjAgNzEwLjRMMTE1LjAgNzA5LjRMOTkuMCA3MDUuNEw4OS4wIDcwMS40TDgxLjAgNjk3LjFMNzIuMCA2OTEuM0w2My41IDY4NC4wTDU2LjkgNjc3LjBMNTEuNiA2NzAuMEw0Ny4wIDY2MS45TDQyLjggNjUyLjBMNDAuOCA2NDUuMEwzOS41IDYzNy4wTDM5LjggNjE4LjBMNDIuOSA2MDQuMEw0OC45IDU4Ny4wTDU2LjcgNTcxLjBMNjQuOCA1NTcuMEw3NC45IDU0Mi4wTDg4LjYgNTI0LjBMMTI4LjEgNDc3LjBMMTQzLjAgNDU4LjBMMTU4LjIgNDM1LjBMMTY3LjMgNDE2LjBMMTcwLjIgNDA3LjBMMTcyLjIgMzk4LjBMMTczLjEgMzg0LjBMMTcxLjMgMzcwLjBMMTYyLjcgMzM1LjBMMTYxLjggMzI2LjBMMTYxLjkgMzE0LjBMMTYzLjYgMzAyLjBMMTY2LjkgMjkxLjBMMTcwLjYgMjgyLjBMMTc4LjUgMjY4LjBMMTg1LjcgMjU4LjBMMTk0LjkgMjQ3LjBMMjA3LjIgMjM1LjBMMjI1LjAgMjIwLjVMMjM3LjAgMjEzLjhMMjQzLjAgMjExLjdMMjUxLjAgMjEwLjNMMjYwLjAgMjEwLjRMMjY2LjAgMjExLjZMMjc2LjAgMjE2LjZMMjgxLjIgMjIxLjBMMjg1LjEgMjI2LjBMMjg5LjEgMjM0LjBMMjkxLjQgMjQ1LjBMMjkxLjIgMjU2LjBMMjg4LjIgMjY4LjBMMjg0LjIgMjc4LjBMMjc5LjEgMjg4LjBMMjUxLjUgMzMzLjBMMjQzLjYgMzQ4LjBMMjM3LjkgMzYyLjBMMjM1LjggMzcwLjBMMjM1LjAgMzc2LjNMMjM0LjkgMzg0LjBMMjM2LjAgMzg5LjhMMjM4LjggMzk2LjBMMjQyLjAgNDAwLjBMMjQ3LjAgNDAzLjRMMjUzLjAgNDA1LjNMMjU5LjAgNDA1LjZMMjY1LjAgNDA0LjVMMjczLjAgNDAxLjJMMjc4LjAgMzk4LjFMMjg4LjggMzg5LjBMMzAwLjQgMzc2LjBMMzA5LjEgMzYzLjBMMzIwLjMgMzQxLjBMMzI3LjMgMzIzLjBMMzQwLjggMjg0LjBMMzUwLjcgMjYxLjBMMzU1LjggMjUxLjBMMzYyLjcgMjQwLjBMMzcxLjYgMjI4LjBMMzc5LjYgMjE5LjBMMzk1LjAgMjA0LjVMNDA2LjAgMTk2LjBMNDIxLjAgMTg2LjZMNDM3LjAgMTc5LjVMNDQ5LjAgMTc2LjhMNDYxLjAgMTc2LjVMNDcyLjAgMTc4LjZMNDgyLjAgMTgzLjZMNDg4LjYgMTg5LjBMNDk0LjMgMTk2LjBMNDk4LjMgMjA0LjBMNTAwLjUgMjEyLjBMNTAxLjIgMjIyLjBMNTAwLjQgMjMwLjBMNDk4LjQgMjM4LjBMNDk1LjEgMjQ2LjBMNDkxLjIgMjUzLjBMNDg0LjMgMjYzLjBMNDczLjAgMjc1LjZMNDUwLjAgMjk2LjVMNDE1LjAgMzI1LjBMNDA0LjcgMzM1LjBMMzk2LjkgMzQ0LjBMMzg3LjAgMzU4LjBMMzc4LjkgMzc0LjBMMzc0LjggMzg2LjBMMzcyLjEgNDAxLjBMMzcxLjYgNDE2LjBMMzcyLjcgNDI3LjBMMzc3LjkgNDQ5LjBMMzg1LjkgNDY5LjBMNDE2LjQgNTM0LjBMNDI5LjQgNTY4LjBMNDM1LjQgNTkwLjBMNDM4LjIgNjEwLjBMNDM3LjIgNjI5LjBMNDMzLjIgNjQ1LjBMNDMwLjMgNjUyLjBMNDI1LjIgNjYxLjBMNDE0LjcgNjc0LjBMNDA1LjAgNjgyLjNMMzk5LjAgNjg2LjNMMzkyLjAgNjkwLjJMMzg0LjAgNjkzLjNMMzc2LjAgNjk1LjRMMzY3LjAgNjk2LjdMMzUwLjAgNjk2LjJMMzM4LjAgNjkzLjNMMzMwLjAgNjkwLjFMMzIxLjAgNjg1LjJMMzE2LjAgNjgxLjZMMzA3LjYgNjc0LjBMMzAyLjYgNjY4LjBMMjk3LjggNjYxLjBMMjkzLjcgNjUzLjBMMjg4LjcgNjM5LjBMMjg1LjUgNjI0LjBMMjgzLjkgNjAyLjBMMjg1LjYgNTcyLjBMMjk3LjMgNDk1LjBMMjk4LjIgNDgyLjBMMjk3LjIgNDcwLjBMMjk1LjMgNDYzLjBMMjkyLjMgNDU3LjBMMjg5LjAgNDUzLjBMMjg1LjAgNDQ5LjhMMjgxLjAgNDQ3LjdMMjc1LjAgNDQ1LjlMMjY5LjAgNDQ1LjRMMjYxLjAgNDQ1LjhMMjUzLjEgNDQ4LjBMMjQ1LjAgNDUxLjdMMjM3LjMgNDU3LjBMMjMxLjggNDYyLjBMMjI1LjkgNDY5LjBMMjIwLjggNDc3LjBMMjE2LjkgNDg1LjBMMjEyLjcgNDk3LjBMMjA3LjggNTE5LjBMMjAzLjYgNTUyLjBMMjAyLjYgNTY5LjBMMjAyLjYgNTg4LjBMMjA1LjUgNjI2LjBMMjA1LjYgNjQzLjBMMjAzLjQgNjU3LjBMMTk5LjMgNjY4LjBMMTk0LjMgNjc3LjBMMTg4LjIgNjg1LjBMMTgyLjAgNjkxLjJMMTc0LjAgNjk3LjJMMTY3LjAgNzAxLjVMMTU1LjAgNzA2LjVMMTQ5LjAgNzA4LjJMMTM2LjAgNzEwLjJaTTEwNjAuMCA3MTAuMUwxMDQ3LjAgNzEwLjJMMTAyOC4wIDcwNy40TDEwMTMuMCA3MDIuNEwxMDAxLjAgNjk2LjRMOTg5LjAgNjg4LjBMOTgwLjcgNjgwLjBMOTczLjUgNjcwLjBMOTY3LjcgNjU3LjBMOTY1LjcgNjQ4LjBMOTY0LjcgNjM5LjBMOTY1LjcgNjIwLjBMOTY3LjcgNjA5LjBMOTc4LjQgNTY3LjBMOTg0LjMgNTM5LjBMOTg4LjIgNTE0LjBMOTkwLjEgNDkxLjBMOTkwLjEgNDc5LjBMOTg4LjIgNDU4LjBMOTg1LjQgNDQ1LjBMOTgwLjIgNDMyLjBMOTc2LjMgNDI2LjBMOTcxLjAgNDIwLjZMOTY1LjAgNDE2LjhMOTU5LjAgNDE0LjlMOTUzLjAgNDE0LjJMOTQ2LjAgNDE0LjVMOTI3LjAgNDE3LjRMOTE3LjAgNDE4LjBMOTA4LjAgNDE3LjFMOTAyLjAgNDE1LjNMODkzLjAgNDEwLjJMODg2LjYgNDA0LjBMODgxLjYgMzk1LjBMODc5LjYgMzg2LjBMODgwLjMgMzc3LjBMODgzLjcgMzY4LjBMODg4LjYgMzYxLjBMODk3LjAgMzUzLjlMOTA1LjAgMzQ5LjVMOTE1LjAgMzQ1LjdMOTQ4LjAgMzM5LjBMOTU3LjAgMzM2LjRMOTY5LjAgMzMwLjNMOTczLjAgMzI3LjRMOTc4LjIgMzIyLjBMOTgyLjIgMzE2LjBMOTg0LjMgMzExLjBMOTg2LjUgMzAwLjBMOTg1LjIgMjg1LjBMOTc4LjcgMjYwLjBMOTc2LjggMjQ3LjBMOTc3LjYgMjMzLjBMOTc5LjggMjI1LjBMOTg1LjYgMjE0LjBMOTkwLjcgMjA4LjBMOTk3LjAgMjAyLjdMMTAwNC4wIDE5OC44TDEwMTIuMCAxOTUuOEwxMDI0LjAgMTkzLjhMMTAzMi4wIDE5My45TDEwNDIuMCAxOTUuN0wxMDUyLjAgMTk5LjZMMTA2MC4wIDIwNC42TDEwNjguMCAyMTIuM0wxMDc0LjAgMjIxLjFMMTA3Ny4yIDIyOC4wTDEwNzkuNSAyMzguMEwxMDgwLjIgMjQ2LjBMMTA3OS41IDI1NC4wTDEwNzguMCAyNjIuMEwxMDc1LjMgMjcwLjBMMTA2Ny42IDI4Ni4wTDEwNDUuOSAzMjEuMEwxMDQyLjAgMzMwLjBMMTA0MC43IDMzNS4wTDEwNDAuMyAzNDEuMEwxMDQwLjkgMzQ1LjBMMTA0My4wIDM0OS41TDEwNDYuMCAzNTIuOUwxMDQ5LjAgMzU1LjBMMTA1NC4wIDM1Ny4wTDEwNjEuMCAzNTcuOUwxMDczLjAgMzU2LjFMMTA5MS4wIDM1MC43TDExMDEuMCAzNDguNkwxMTEzLjAgMzQ4LjNMMTEyMS4wIDM0OS43TDExMzEuMCAzNTQuOEwxMTM2LjUgMzYwLjBMMTE0MC40IDM2Ni4wTDExNDMuMyAzNzYuMEwxMTQzLjMgMzg0LjBMMTE0MC41IDM5NC4wTDExMzUuMiA0MDIuMEwxMTI3LjAgNDA5LjNMMTExNy4wIDQxNC41TDExMTEuMCA0MTYuNUwxMTAyLjAgNDE4LjNMMTA3NC4wIDQyMS44TDEwNjIuMCA0MjYuN0wxMDU2LjIgNDMxLjBMMTA1MS4wIDQzNy4xTDEwNDYuOSA0NDQuMEwxMDQzLjggNDUzLjBMMTA0MS40IDQ2OC4wTDEwNDEuOCA0ODYuMEwxMDQ1LjkgNTA2LjBMMTA1MS43IDUyMy4wTDEwNTguNiA1MzguMEwxMDY5LjggNTU3LjBMMTA4MS45IDU3NC4wTDExMDEuNCA1OTkuMEwxMTEzLjMgNjE2LjBMMTEyMS4xIDYzMS4wTDExMjQuMSA2NDAuMEwxMTI1LjUgNjQ5LjBMMTEyNS4yIDY2MC4wTDExMjIuNCA2NzEuMEwxMTE3LjMgNjgxLjBMMTEwOS4wIDY5MC40TDExMDAuMCA2OTcuM0wxMDg2LjAgNzA0LjRMMTA3Ny4wIDcwNy40TDEwNjAuMCA3MTAuMVpNMTMxOC4wIDY5Ni4yTDEzMDkuMCA2OTYuOEwxMjk4LjAgNjk2LjNMMTI4NC4wIDY5My4yTDEyNzAuMCA2ODguM0wxMjU2LjAgNjgyLjNMMTIzMi4wIDY3MC4zTDExODMuMCA2NDMuM0wxMTUyLjAgNjI0LjJMMTEzNS4zIDYxMS4wTDExMjcuNiA2MDMuMEwxMTIxLjggNTk1LjBMMTExNy44IDU4OC4wTDExMTMuNiA1NzguMEwxMTExLjcgNTcwLjBMMTExMC42IDU1OC4wTDExMTEuNyA1NDQuMEwxMTEzLjcgNTM1LjBMMTEyMC43IDUxNS4wTDExNDIuMyA0NjcuMEwxMTUzLjMgNDM5LjBMMTE1OC40IDQxOC4wTDExNTkuOCA0MDAuMEwxMTU5LjQgMzg2LjBMMTE1OC40IDM3OC4wTDExNTYuNCAzNjguMEwxMTUzLjIgMzU3LjBMMTE0Ny4xIDM0MS4wTDExMjYuNyAyOTguMEwxMTE5LjYgMjc4LjBMMTExNy42IDI2OC4wTDExMTYuOSAyNTkuMEwxMTE3LjYgMjQ2LjBMMTExOS43IDIzNi4wTDExMjIuNyAyMjguMEwxMTI3LjYgMjE5LjBMMTEzMC41IDIxNS4wTDExMzYuMCAyMDguOEwxMTQzLjAgMjAzLjBMMTE1MC4wIDE5OC44TDExNTcuMCAxOTUuOUwxMTY5LjAgMTkzLjhMMTE4MS4wIDE5NC40TDExOTMuMCAxOTcuOUwxMjA0LjAgMjAzLjhMMTIxNS4zIDIxNC4wTDEyMjMuMyAyMjUuMEwxMjI5LjEgMjM3LjBMMTIzMy4zIDI1Mi4wTDEyMzUuMSAyNzIuMEwxMjMzLjIgMjk1LjBMMTIyOS41IDMxMi4wTDEyMTUuOSAzNTguMEwxMjA4LjggMzg1LjBMMTIwNC45IDQwNS4wTDEyMDIuNyA0MjQuMEwxMjAyLjMgNDUyLjBMMTIwNC4wIDQ3MS4wTDEyMDkuMCA0OTQuMEwxMjE1LjkgNTEzLjBMMTIyMi4wIDUyNC43TDEyMjguNyA1MzQuMEwxMjM4LjAgNTQzLjRMMTI0Ny4wIDU0OS4zTDEyNTkuMCA1NTQuM0wxMjg5LjAgNTU5LjhMMTI5OS4wIDU2Mi42TDEzMTIuMCA1NjcuOUwxMzI1LjAgNTc1LjlMMTMzNS4wIDU4NC4wTDEzNDYuMyA1OTYuMEwxMzU1LjUgNjEwLjBMMTM2MC41IDYyMi4wTDEzNjIuNiA2MzEuMEwxMzYyLjYgNjQ4LjBMMTM2MC41IDY1OC4wTDEzNTYuNCA2NjguMEwxMzUwLjQgNjc3LjBMMTM0MS4wIDY4Ni40TDEzMzEuMCA2OTIuM0wxMzI2LjAgNjk0LjNMMTMxOC4wIDY5Ni4yWk03NDguMCA3OTguMUw3MjUuMCA3OTcuMkw3MDQuMCA3OTMuNkw2ODQuMCA3ODcuNEw2NjUuMCA3NzguMkw2NTEuMCA3NjguNEw2NDQuOSA3NjMuMEw2MzcuOCA3NTUuMEw2MjkuNiA3NDIuMEw2MjUuNiA3MzIuMEw2MjMuNyA3MjUuMEw2MjIuNCA3MTUuMEw2MjIuNyA3MDMuMEw2MjQuNiA2OTUuMEw2MjguNSA2ODYuMEw2MzMuMyA2NzkuMEw2NDEuMCA2NzEuN0w2NDguMCA2NjcuN0w2NTYuMCA2NjQuOUw2NjkuMCA2NjMuOUw2ODIuMCA2NjUuNkw2OTYuMCA2NzAuNkw3MjQuMCA2ODQuM0w3NDAuMCA2OTEuMUw3NTQuMCA2OTUuNUw3NjYuMCA2OTcuNkw3ODAuMCA2OTcuNEw3ODguMCA2OTUuNUw3OTQuMCA2OTMuMEw3OTkuMCA2ODkuNUw4MDMuMiA2ODUuMEw4MDYuMyA2ODAuMEw4MDguMSA2NzUuMEw4MDkuMCA2NjcuMEw4MDcuMyA2NTcuMEw4MDMuMCA2NDcuMEw3OTYuMiA2MzcuMEw3ODAuMCA2MTkuNEw3NDMuMCA1ODUuMkw3MjYuOSA1NjkuMEw3MTIuNiA1NTIuMEw3MDIuNyA1MzcuMEw2OTMuOCA1MTkuMEw2ODkuOCA1MDUuMEw2ODguOCA0OTAuMEw2ODkuNyA0ODMuMEw2OTEuOSA0NzUuMEw2OTQuOSA0NjkuMEw2OTkuNSA0NjMuMEw3MDQuMCA0NTguOUw3MDkuMCA0NTUuN0w3MTQuMCA0NTMuNkw3MjIuMCA0NTIuMUw3MjguMCA0NTIuMEw3MzQuMCA0NTIuOEw3NDAuMCA0NTQuNkw3NDcuMCA0NTcuN0w3NTQuMCA0NjIuMEw3NjAuMCA0NjYuN0w3NzEuMCA0NzcuNEw4MDEuMCA1MTEuMEw4MTMuMCA1MjEuNEw4MjQuMCA1MjguMkw4MzEuMCA1MzEuMUw4MzYuMCA1MzIuM0w4NDEuMCA1MzIuNEw4NDYuMCA1MzEuM0w4NTAuMCA1MjkuMEw4NTMuNCA1MjUuMEw4NTUuNCA1MjAuMEw4NTYuMSA1MTQuMEw4NTQuNSA1MDUuMEw4NTAuMyA0OTQuMEw4NDIuMSA0ODAuMEw4MzAuNCA0NjQuMEw4MDkuNCA0NDEuMEw3NTcuMCAzOTIuNEw3NDIuNiAzNzYuMEw3MzUuNyAzNjYuMEw3MjcuOSAzNTEuMEw3MjIuMyAzMzMuMEw3MjEuMyAzMTcuMEw3MjIuNCAzMDYuMEw3MjMuNiAzMDEuMEw3MjYuNiAyOTIuMEw3MzEuNSAyODIuMEw3MzYuOCAyNzQuMEw3NDQuMiAyNjUuMEw3NTMuMCAyNTYuN0w3NjEuMCAyNTAuNkw3NzMuMCAyNDMuNUw3ODUuMCAyMzcuOEw3OTYuMCAyMzMuOEw4MTIuMCAyMjkuNUw4MzAuMCAyMjYuN0w4NDIuMCAyMjUuN0w4NTguMCAyMjUuNUw4NzQuMCAyMjYuNkw4ODMuMCAyMjcuNkw4OTguMCAyMzAuN0w5MTQuMCAyMzYuN0w5MjUuMCAyNDMuOUw5MzMuMSAyNTIuMEw5MzcuMiAyNTguMEw5NDAuMSAyNjQuMEw5NDIuMyAyNzEuMEw5NDMuMyAyNzguMEw5NDMuMiAyODQuMEw5NDIuMiAyOTEuMEw5NDAuMiAyOTguMEw5MzguMCAzMDIuOUw5MzMuMyAzMTEuMEw5MjkuMyAzMTYuMEw5MjMuMCAzMjIuMkw5MTIuMCAzMjkuNkw4OTkuMCAzMzQuMkw4OTAuMCAzMzQuOUw4ODIuMCAzMzQuNEw4NzAuMCAzMzEuNUw4NDIuMCAzMTkuOEw4MzIuMCAzMTYuNkw4MjYuMCAzMTUuNkw4MTYuMCAzMTUuOEw4MDguMCAzMTkuMEw4MDIuNCAzMjQuMEw3OTkuNyAzMzAuMEw3OTkuMiAzMzcuMEw4MDAuOCAzNDQuMEw4MDQuNiAzNTIuMEw4MTYuOCAzNjguMEw4MzUuMCAzODYuMUw4NzMuMCA0MTkuNkw4OTEuMiA0MzcuMEw5MDUuNCA0NTMuMEw5MTMuMiA0NjMuMEw5MjMuMiA0NzguMEw5MzAuMyA0OTEuMEw5MzUuMyA1MDIuMEw5NDAuMSA1MTYuMEw5NDQuMiA1MzMuMEw5NDYuMiA1NDguMEw5NDYuOCA1NjYuMEw5NDYuMSA1ODQuMEw5NDQuMiA1OTkuMEw5NDAuMCA2MjAuMEw5MzUuNCA2MzYuMEw5MjcuMyA2NTguMEw5MjAuNSA2NzMuMEw5MTEuMyA2OTAuMEw5MDYuNCA2OTguMEw4OTIuMyA3MTguMEw4ODAuNCA3MzIuMEw4NjUuMCA3NDcuNEw4NTIuMCA3NTguNEw4MzUuMCA3NzAuNkw4MjAuMCA3NzkuMkw4MTEuMCA3ODMuNUw3OTcuMCA3ODkuMkw3NzkuMCA3OTQuM0w3NjIuMCA3OTcuMkw3NDguMCA3OTguMVpNMTQ4MC4wIDYzNi4xTDE0NjUuMCA2MzUuOUwxNDQ5LjAgNjM0LjJMMTQzNi4wIDYzMS41TDE0MjMuMCA2MjcuNUwxNDA2LjAgNjIwLjNMMTM5MC4wIDYxMS40TDEzNzcuMCA2MDIuM0wxMzYzLjMgNTkxLjBMMTM0OC4wIDU3NS45TDEzMzQuOCA1NjEuMEwxMzIxLjcgNTQ0LjBMMTMxMS43IDUyOS4wTDEzMDMuNyA1MTUuMEwxMjk1LjggNDk4LjBMMTI4OS43IDQ4MC4wTDEyODUuNyA0NjIuMEwxMjg0LjYgNDUzLjBMMTI4My45IDQzMi4wTDEyODQuNyA0MTcuMEwxMjg3LjggMzk3LjBMMTI5MS42IDM4Mi4wTDEyOTcuNyAzNjUuMEwxMzA1LjYgMzQ4LjBMMTMxMy42IDMzNS4wTDEzMjQuOCAzMjAuMEwxMzM2LjAgMzA4LjFMMTM0OS4wIDI5Ni43TDEzNjIuMCAyODcuNkwxMzc4LjAgMjc4LjdMMTM5Mi4wIDI3Mi43TDE0MDguMCAyNjcuN0wxNDIyLjAgMjY0LjhMMTQzNy4wIDI2My40TDE0NDguMCAyNjMuNUwxNDYxLjAgMjY0LjdMMTQ3Ni4wIDI2Ny44TDE0ODUuMCAyNzAuNkwxNDk5LjAgMjc2LjVMMTUxMi4wIDI4My42TDE1MjIuMCAyOTAuN0wxNTMzLjggMzAxLjBMMTU0Mi4xIDMxMC4wTDE1NTAuNCAzMjEuMEwxNTU4LjAgMzM0LjFMMTU2My4yIDM0Ni4wTDE1NjcuMSAzNTkuMEwxNTY4LjYgMzcxLjBMMTU2OC4zIDM4Mi4wTDE1NjUuNCAzOTUuMEwxNTYyLjAgNDAyLjlMMTU1Ny40IDQxMS4wTDE1NDguNiA0MjIuMEwxNTM1LjAgNDM0LjNMMTUyMC4wIDQ0NC4zTDE0OTQuMCA0NTcuNEwxNDYzLjAgNDY5LjNMMTQxMi4wIDQ4NS43TDE0MDQuMCA0ODkuNUwxMzk3LjAgNDk1LjBMMTM5My40IDUwMS4wTDEzOTIuNSA1MDYuMEwxMzkyLjggNTEwLjBMMTM5My42IDUxMy4wTDEzOTYuNSA1MTguMEwxNDAyLjAgNTI0LjhMMTQwOS4wIDUzMS4yTDE0MTYuMCA1MzYuMUwxNDI0LjAgNTQwLjRMMTQzMi4wIDU0My40TDE0NDAuMCA1NDUuM0wxNDQ5LjAgNTQ1LjlMMTQ1Ny4wIDU0NS4zTDE0NjIuMCA1NDQuMUwxNDY5LjggNTQxLjBMMTQ3OS41IDUzNS4wTDE0ODguMCA1MjguMUwxNTE0LjAgNTAyLjdMMTUyOC4wIDQ5Mi43TDE1MzQuMCA0ODkuNkwxNTQyLjAgNDg2LjZMMTU1MC4wIDQ4NC45TDE1NTcuMCA0ODQuNkwxNTYzLjAgNDg1LjRMMTU3MS4wIDQ4Ny45TDE1NzYuMCA0OTAuN0wxNTgyLjAgNDk1LjdMMTU4Ni4yIDUwMS4wTDE1OTAuMCA1MDguMEwxNTkyLjMgNTE0LjBMMTU5My45IDUyMi4wTDE1OTQuNiA1MzIuMEwxNTk0LjAgNTQxLjBMMTU5Mi4yIDU1MS4wTDE1ODguMSA1NjMuMEwxNTg0LjAgNTcyLjBMMTU3Ni4xIDU4NS4wTDE1NjguMSA1OTUuMEwxNTYxLjAgNjAyLjNMMTU1Mi4wIDYxMC4wTDE1NDMuMCA2MTYuM0wxNTM1LjAgNjIxLjFMMTUyMi4wIDYyNy4yTDE1MDIuMCA2MzMuM0wxNDkxLjAgNjM1LjFMMTQ4MC4wIDYzNi4xWk01MjguMCA2ODcuMUw1MTMuMCA2ODYuM0w1MDUuMCA2ODQuM0w0OTQuMCA2NzkuM0w0ODUuMCA2NzMuMkw0NzcuOSA2NjYuMEw0NzEuOCA2NTguMEw0NjUuNyA2NDcuMEw0NjAuNSA2MzQuMEw0NTUuNyA2MTUuMEw0NTIuNiA1OTAuMEw0NTIuNSA1NjAuMEw0NTQuNCA1MjcuMEw0NTQuNCA1MTMuMEw0NTMuNCA1MDEuMEw0NTAuMSA0ODQuMEw0NDUuMiA0NjkuMEw0NDEuMyA0NjAuMEw0MjYuNyA0MzIuMEw0MjIuNyA0MjMuMEw0MTkuNiA0MTMuMEw0MTguMCA0MDMuMEw0MTcuOSAzOTUuMEw0MTguOCAzODcuMEw0MjEuNyAzNzcuMEw0MjguNiAzNjMuMEw0MzQuNSAzNTUuMEw0NDIuMCAzNDYuN0w0NTAuMCAzMzkuOEw0NTkuMCAzMzMuNkw0NzMuMCAzMjYuOUw0ODEuMCAzMjQuNkw0ODguMCAzMjMuNUw0OTcuMCAzMjMuNUw1MDQuMCAzMjQuN0w1MTAuMCAzMjYuN0w1MTcuMCAzMzAuNkw1MjIuMCAzMzQuN0w1MjYuNiAzNDAuMEw1MzEuMyAzNDguMEw1MzQuNCAzNTcuMEw1MzUuNyAzNjYuMEw1MzUuNiAzNzcuMEw1MzMuMyAzOTEuMEw1MTkuOSA0MzkuMEw1MTQuNyA0NjIuMEw1MTAuOCA0OTEuMEw1MTAuNCA1MDYuMEw1MTAuOSA1MTYuMEw1MTEuOCA1MjIuMEw1MTQuOCA1MzIuMEw1MTguOCA1NDAuMEw1MjQuMCA1NDYuMkw1MzAuMCA1NTAuNEw1MzguMCA1NTMuM0w1NDYuMCA1NTMuNkw1NTMuMCA1NTIuMUw1NjEuMCA1NDguM0w1NjguMCA1NDMuMEw1NzYuMyA1MzQuMEw1ODAuMyA1MjguMEw1ODYuMCA1MTcuOEw1OTEuMCA1MDUuN0w1OTQuMyA0OTUuMEw1OTcuMiA0ODIuMEw1OTkuMyA0NjQuMEw1OTkuMSA0MzYuMEw1OTcuMSA0MTguMEw1ODkuNSAzNzEuMEw1ODguOCAzNTguMEw1OTAuNCAzNDAuMEw1OTIuNyAzMzEuMEw1OTUuNyAzMjMuMEw2MDEuNiAzMTIuMEw2MTAuNiAzMDAuMEw2MjAuMCAyOTEuM0w2MzEuMCAyODMuOUw2NDIuMCAyNzguOEw2NTEuMCAyNzYuNEw2NjUuMCAyNzUuN0w2NzYuMCAyNzcuOUw2ODcuMCAyODMuN0w2OTQuNSAyOTEuMEw2OTcuNCAyOTUuMEw3MDAuNSAzMDEuMEw3MDIuNCAzMDcuMEw3MDMuOSAzMTcuMEw3MDMuOCAzMjQuMEw3MDEuNSAzMzcuMEw2OTcuMyAzNDguMEw2OTEuMyAzNjAuMEw2NzAuOSAzOTYuMEw2NjEuNyA0MTguMEw2NTcuNyA0MzMuMEw2NTUuNyA0NDUuMEw2NTQuOCA0NTkuMEw2NTUuNiA0NzUuMEw2NTkuNyA0OTcuMEw2NjIuNyA1MDcuMEw2NjguOCA1MjIuMEw2NzcuOCA1MzkuMEw2ODYuOSA1NTMuMEw3MDMuNSA1NzYuMEw3MDkuMyA1ODcuMEw3MTIuMiA1OTYuMEw3MTIuOSA2MDIuMEw3MTIuOSA2MDkuMEw3MTEuMiA2MTYuMEw3MDguMiA2MjIuMEw3MDQuMSA2MjcuMEw2OTkuMCA2MzEuMUw2OTMuMCA2MzQuM0w2ODYuMCA2MzYuMkw2NzkuMCA2MzYuOUw2NTYuMCA2MzUuNUw2NDUuMCA2MzUuN0w2MzcuMCA2MzYuN0w2MjguMCA2MzkuMEw2MTkuMCA2NDIuNkw2MDYuMCA2NDkuNkw1NzguMCA2NjguM0w1NjYuMCA2NzUuM0w1NTMuMCA2ODEuMkw1NDQuMCA2ODQuNEw1MjguMCA2ODcuMVpNMTM4Ny43IDQ0OC4wTDEzOTUuMCA0NDYuM0wxNDA2LjAgNDQyLjNMMTQyNC4wIDQzMy4zTDE0NDAuNSA0MjIuMEwxNDQ2LjEgNDE3LjBMMTQ1Mi4wIDQwOS44TDE0NTQuMyA0MDYuMEwxNDU2LjQgNDAwLjBMMTQ1Ny4yIDM5NC4wTDE0NTYuMyAzODcuMEwxNDU0LjAgMzgxLjBMMTQ1MS4yIDM3Ny4wTDE0NDcuMCAzNzIuNEwxNDQyLjAgMzY4LjZMMTQzMi4wIDM2My43TDE0MjIuMCAzNjEuMkwxNDA5LjAgMzYwLjhMMTM5OS4wIDM2Mi43TDEzODkuMCAzNjYuNUwxMzc5LjAgMzcyLjZMMTM2OS44IDM4MS4wTDEzNjMuOCAzODkuMEwxMzU3LjkgNDAxLjBMMTM1NC44IDQxNC4wTDEzNTQuOCA0MjIuMEwxMzU3LjggNDM0LjBMMTM2My4wIDQ0MS43TDEzNjkuMCA0NDYuMUwxMzc4LjAgNDQ4LjVMMTM4Ny43IDQ0OC4wWiIvPjwvc3ZnPg==';
document.documentElement.style.setProperty('--logo',"url('"+LOGO_IMG+"')");
/* ---------- старт ---------- */
$$('.logo').forEach(b=>b.innerHTML=LOGO);
applyTheme();
let sess=null;try{sess=localStorage.getItem(SESS_KEY)}catch(e){}
if(SB){
  RECOVERY=/type=recovery/.test(location.hash);
  initCloud();
  SB.auth.getSession().then(r=>{
    if(RECOVERY){authMode='recover';showAuth(true);return}
    const s=r&&r.data&&r.data.session;
    if(s)enterCloud(s);
    else if(sess==='guest')enter('guest');
    else showAuth();
  }).catch(()=>showAuth());
}else{
  if(sess&&(sess==='guest'||getUsers()[sess]))enter(sess);else showAuth();
}
