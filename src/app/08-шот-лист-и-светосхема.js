/* ---------- шот-лист ---------- */
const SIZES=['Общий','Средний','Крупный','Деталь','Двойной','Через плечо'];
const ANGLES=['Прямо','Сверху','Снизу','Голландский','Субъективный'];
const MOVES=['Статика','Панорама','Наезд','Тележка','Ручная','Стедикам','Слайдер'];
function vShots(){
  const head=hd('Шот-лист','Общий список кадров для режиссёра и оператора: размер, ракурс, движение, объектив. Отмечайте галочкой снятое.',S.scenes.length?'<button class="btn" type="button" data-c="shotAdd">'+icon('plus')+'Добавить кадр</button>'+(S.shots.length?dlMenu(ddi('data-c="shotXlsx"','Excel (.xlsx)')+ddi('data-c="shotCopy"','Скопировать для таблицы')+ddi('data-c="print"','PDF через печать')):''):'');
  if(!S.scenes.length)return head+NEED_SCENES('Шот-лист строится по сценам — сначала разберите сценарий.');
  const flt=S.shotScene||'';
  const list=S.shots.filter(x=>!flt||String(x.scene)===String(flt));
  const done=S.shots.filter(x=>x.done).length;
  const rows=list.map(x=>'<tr><td style="width:190px"><select data-a="sh" data-id="'+x.id+'" data-f="scene" aria-label="Сцена">'+sceneOpts(x.scene,true)+'</select></td>'+
    '<td style="width:70px"><input data-a="sh" data-id="'+x.id+'" data-f="no" value="'+esc(x.no)+'" aria-label="Номер кадра"></td>'+
    '<td style="width:130px"><select data-a="sh" data-id="'+x.id+'" data-f="size" aria-label="Размер">'+optList(SIZES,x.size)+'</select></td>'+
    '<td style="width:150px"><select data-a="sh" data-id="'+x.id+'" data-f="angle" aria-label="Ракурс">'+optList(ANGLES,x.angle)+'</select></td>'+
    '<td style="width:130px"><select data-a="sh" data-id="'+x.id+'" data-f="move" aria-label="Движение">'+optList(MOVES,x.move)+'</select></td>'+
    '<td style="width:84px"><input class="n" type="number" min="8" max="400" data-a="sh" data-id="'+x.id+'" data-f="mm" value="'+esc(x.mm)+'" aria-label="Объектив, мм"></td>'+
    '<td style="min-width:200px"><input data-a="sh" data-id="'+x.id+'" data-f="desc" value="'+esc(x.desc)+'" placeholder="Что в кадре" aria-label="Описание"></td>'+
    '<td style="width:60px;text-align:center"><input type="checkbox" data-a="sh" data-r="1" data-id="'+x.id+'" data-f="done"'+(x.done?' checked':'')+' style="width:22px;height:22px" aria-label="Снято"></td>'+
    '<td style="width:44px"><button class="x" type="button" data-c="shotDel" data-id="'+x.id+'" aria-label="Удалить кадр">×</button></td></tr>').join('');
  const body='<div class="row" style="margin-bottom:10px"><label class="fltlab">Показать сцену <select data-a="shotflt" data-r="1" style="margin-left:8px;max-width:100%;background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:9px 10px"><option value="">Все сцены</option>'+sceneOpts(flt,false)+'</select></label><span class="muted">Снято '+done+' из '+S.shots.length+'</span></div>'+
    (list.length?'<div class="tw"><table class="grid" style="min-width:980px"><thead><tr><th>Сцена</th><th>№</th><th>Размер</th><th>Ракурс</th><th>Движение</th><th>мм</th><th>Описание</th><th>Снято</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<div class="empty"><b>Кадров пока нет</b>Добавьте первый кадр кнопкой ниже.</div>')+
    '<div class="row" style="margin-top:12px"><button class="btn sec" type="button" data-c="shotAdd">'+icon('plus')+'Ещё кадр</button></div>';
  return head+'<div class="col">'+panel('shl','frame','Кадры',body)+'</div>';
}

/* ---------- светосхема ---------- */
const LT_DEF={camera:{label:'Камера',mm:35,rot:0},light:{label:'Свет',w:300,k:5600,mod:'Софтбокс',rot:0},actor:{label:'Актёр',rot:0},flag:{label:'Флаг',len:100,rot:0},diff:{label:'Рассеиватель',len:110,rot:0},window:{label:'Окно',len:180,rot:180},prop:{label:'Предмет',len:90,rot:0}};
/* предметы: kind → имя, ширина по умолчанию (1 м = 40), глубина как доля ширины, высота в метрах */
const PROP_K={box:{n:'Предмет',len:36,d:.6,h:.6},chair:{n:'Стул',len:20,d:1,h:.95},table:{n:'Стол',len:52,d:.6,h:.76},sofa:{n:'Диван',len:84,d:.45,h:.85},
  bed:{n:'Кровать',len:66,d:1.25,h:.9},wardrobe:{n:'Шкаф',len:48,d:.5,h:2.05},door:{n:'Дверь',len:36,d:.12,h:2.1},car:{n:'Машина',len:180,d:.4,h:1.45},tree:{n:'Дерево',len:60,d:1,h:3.4}};
const propKind=it=>PROP_K[it.kind]?it.kind:'box';
const LT_NAMES={camera:'Камера',light:'Свет',actor:'Актёр',flag:'Флаг',diff:'Рассеиватель',window:'Окно',prop:'Предмет'};
const LT_CSS='.lt-fov{fill:rgba(127,227,255,.18);stroke:rgba(127,227,255,.6);stroke-width:1.5}.lt-cam{fill:#cfd6e6;stroke:#fff;stroke-width:1.5}.lt-beam{opacity:.26}.lt-actor{fill:#ff8fb1;stroke:#fff;stroke-width:2}.lt-nose{fill:#fff}.lt-flag{fill:#2a2f3d;stroke:#fff;stroke-width:1.5}.lt-diff{fill:rgba(255,255,255,.35);stroke:#fff;stroke-width:1.5;stroke-dasharray:6 4}.lt-window{fill:#9fd3ff;stroke:#fff;stroke-width:1.5}.lt-wbeam{fill:#bfe3ff;opacity:.18}.lt-prop{fill:#3b4252;stroke:#a9b1c6;stroke-width:1.5}.lt-prop2{fill:#565f75;stroke:#a9b1c6;stroke-width:1.2}.lt-pill{fill:#c9cfdc}.lt-pline{stroke:#a9b1c6;stroke-width:1.5;fill:none}.lt-car{fill:#4a5670;stroke:#cfd6e6;stroke-width:1.8}.lt-glass{fill:#9fb7d8;opacity:.8}.lt-tree{fill:rgba(76,140,90,.55);stroke:#8fcf9a;stroke-width:1.5}.lt-label{fill:#fff;font:600 13px sans-serif;text-anchor:middle;pointer-events:none}.lt-spec{fill:#b9c2d9;font:12px sans-serif;text-anchor:middle;pointer-events:none}.lt-sel{fill:none;stroke:#FFD23F;stroke-width:2.5;stroke-dasharray:5 4}';
function kelvinColor(k){k=num(k);return k<=2800?'#ff9d4d':k<=3400?'#ffb66b':k<=4500?'#ffe2b8':k<=5800?'#f4f7ff':'#a9ccff'}
function curLight(){const id=String(S.lightScene||0);S.light[id]=S.light[id]||{items:[],note:''};return S.light[id]}
function selItem(){return curLight().items.find(i=>i.id===S.lightSel)}
function ltItem(it,sel){
  const t=it.type,l=num(it.len)||100;let g='',lines=[it.label||''];
  if(t==='camera'){
    const half=Math.atan(18/(num(it.mm)||35)),L=170,x=Math.round(L*Math.sin(half)),y=Math.round(L*Math.cos(half));
    g='<path class="lt-fov" d="M0 0L'+(-x)+' '+(-y)+'L'+x+' '+(-y)+'Z"/><rect class="lt-cam" x="-14" y="-6" width="28" height="22" rx="4"/><rect class="lt-cam" x="-6" y="-15" width="12" height="10" rx="2"/>';
    lines.push((num(it.mm)||35)+' мм');
  }else if(t==='light'){
    const c=kelvinColor(it.k);let sp='';
    for(let i=0;i<8;i++){const a=i*Math.PI/4,cs=Math.cos(a),sn=Math.sin(a);sp+='<line x1="'+(cs*17).toFixed(1)+'" y1="'+(sn*17).toFixed(1)+'" x2="'+(cs*24).toFixed(1)+'" y2="'+(sn*24).toFixed(1)+'" stroke="'+c+'" stroke-width="2.5" stroke-linecap="round"/>'}
    g='<path class="lt-beam" fill="'+c+'" d="M0 0L-58 -175L58 -175Z"/><circle r="13" fill="'+c+'" stroke="#fff" stroke-width="2"/>'+sp;
    lines.push((num(it.w)||0)+' Вт, '+(num(it.k)||0)+' K');
  }else if(t==='actor'){
    g='<circle class="lt-actor" r="14"/><path class="lt-nose" d="M-6 -12L0 -23L6 -12Z"/>';
  }else if(t==='flag'){
    g='<rect class="lt-flag" x="'+(-l/2)+'" y="-4" width="'+l+'" height="8" rx="2"/>';
  }else if(t==='diff'){
    g='<rect class="lt-diff" x="'+(-l/2)+'" y="-4" width="'+l+'" height="8" rx="2"/>';
  }else if(t==='window'){
    g='<path class="lt-wbeam" d="M'+(-l/2)+' 0L'+(l/2)+' 0L'+(l/2+30)+' -150L'+(-l/2-30)+' -150Z"/><rect class="lt-window" x="'+(-l/2)+'" y="-5" width="'+l+'" height="10" rx="2"/>';
  }else{
    g=propSvg(propKind(it),l);
  }
  let R=Math.max(30,t==='camera'||t==='light'||t==='actor'?30:l/2+14);
  if(t==='prop'){const k=propKind(it),P=PROP_K[k],hx=k==='car'?l*P.d/2:l/2,hy=k==='car'?l/2:k==='door'?l/2:Math.max(18,l*P.d/2),r=(num(it.rot)||0)*Math.PI/180;R=Math.max(26,Math.abs(Math.sin(r))*hx+Math.abs(Math.cos(r))*hy+12)}
  let txt='<text class="lt-label" y="'+(R+14)+'">'+esc(lines[0])+'</text>';
  if(lines[1])txt+='<text class="lt-spec" y="'+(R+29)+'">'+esc(lines[1])+'</text>';
  return '<g class="lt-item" data-id="'+it.id+'" transform="translate('+Math.round(it.x)+' '+Math.round(it.y)+')"><g transform="rotate('+Math.round(it.rot||0)+')">'+g+'</g>'+(sel?'<circle class="lt-sel" r="'+R+'"/>':'')+txt+'<circle r="'+Math.max(26,R-4)+'" fill="transparent"/></g>';
}
function propSvg(k,l){
  const P=PROP_K[k],d=Math.max(8,l*P.d),hw=l/2,hd=d/2,R=(x,y,w,h,r,c)=>'<rect class="'+(c||'lt-prop')+'" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="'+(r||0)+'"/>';
  if(k==='chair')return R(-hw,-hd,l,d,3)+R(-hw,hd-d*.22,l,d*.22,2,'lt-prop2');
  if(k==='table')return R(-hw,-hd,l,d,4)+'<circle class="lt-prop2" cx="0" cy="0" r="'+Math.min(hw,hd)*.25+'"/>';
  if(k==='sofa')return R(-hw,-hd,l,d,6)+R(-hw,hd-d*.3,l,d*.3,4,'lt-prop2')+R(-hw,-hd,l*.1,d,4,'lt-prop2')+R(hw-l*.1,-hd,l*.1,d,4,'lt-prop2');
  if(k==='bed')return R(-hw,-hd,l,d,5)+R(-hw,hd-d*.1,l,d*.1,2,'lt-prop2')+R(-hw+l*.08,hd-d*.28,l*.38,d*.15,4,'lt-pill')+R(l*.04,hd-d*.28,l*.38,d*.15,4,'lt-pill');
  if(k==='wardrobe')return R(-hw,-hd,l,d,2)+'<line class="lt-pline" x1="0" y1="'+(-hd)+'" x2="0" y2="'+hd+'"/>';
  if(k==='door')return R(-hw,-3,l,6,1)+'<path class="lt-pline" fill="none" d="M'+(-hw)+' 0A'+l+' '+l+' 0 0 1 '+hw+' '+(-l)+'"/><line class="lt-pline" x1="'+(-hw)+'" y1="0" x2="'+(-hw)+'" y2="'+(-l)+'"/>';
  if(k==='car'){const w=l*P.d,L=l;return '<rect class="lt-car" x="'+(-w/2).toFixed(1)+'" y="'+(-L/2).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+L.toFixed(1)+'" rx="'+(w*.3).toFixed(1)+'"/>'+R(-w*.38,-L*.22,w*.76,L*.14,4,'lt-glass')+R(-w*.36,L*.2,w*.72,L*.1,4,'lt-glass')}
  if(k==='tree')return '<circle class="lt-tree" r="'+hw+'"/><circle class="lt-prop2" r="'+Math.max(4,hw*.15)+'"/>';
  return R(-hw,-18,l,36,6);
}
function legendHtml(L){
  if(!L.items.length)return '<p class="muted" style="margin:0">Схема пуста: добавьте камеру, актёра и свет или выберите шаблон.</p>';
  const rows=L.items.map((it,i)=>{
    let sp='';
    if(it.type==='light')sp=(num(it.w)||0)+' Вт, '+(num(it.k)||0)+' K, '+esc(it.mod||'');
    else if(it.type==='camera')sp=(num(it.mm)||35)+' мм';
    else if(it.type==='prop')sp=PROP_K[propKind(it)].n+', '+(num(it.len)/40).toFixed(1)+' м';
    else if(['flag','diff','window'].indexOf(it.type)>-1)sp=Math.round(num(it.len)||0)+' см условно';
    return '<tr><td>'+(i+1)+'</td><td><b>'+esc(it.label||'')+'</b></td><td>'+LT_NAMES[it.type]+'</td><td>'+sp+'</td></tr>';
  }).join('');
  const W=L.items.filter(i=>i.type==='light').reduce((a,i)=>a+num(i.w),0),tdn=TOD[L.tod]?'<p class="muted" style="margin:0 0 8px;font-size:14px">Время суток: <b>'+TOD[L.tod].n+'</b></p>':'';
  return tdn+'<div class="tw"><table class="grid" style="min-width:420px"><thead><tr><th>№</th><th>Название</th><th>Тип</th><th>Параметры</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="muted" style="margin:8px 0 0;font-size:14px">Суммарная мощность света: '+W+' Вт.</p>';
}
function paintLight(){
  if(LT3&&PREF.lt3d)lt3Sync();
  const g=$('#lt-items');if(!g)return;
  const L=curLight();
  g.innerHTML=L.items.map(it=>ltItem(it,it.id===S.lightSel)).join('');
  const lg=$('#lt-legend');if(lg)lg.innerHTML=legendHtml(L);
}
function ltRotNorm(r){let v=Math.round(num(r)||0)%360;if(v>180)v-=360;if(v<-180)v+=360;return v}
function ltRotShow(r){const v=ltRotNorm(r);return (v>0?'+':'')+v}
function inspector(){
  const it=selItem();
  if(!it)return '<p class="muted" style="margin:0">Выберите предмет на схеме или добавьте новый кнопками выше. Двигайте мышью или пальцем.</p>';
  let h='<div class="fields" style="grid-template-columns:1fr"><label>Название<input data-a="lt" data-f="label" value="'+esc(it.label)+'"></label>'+
    '<label>Поворот: <b id="rotv">'+ltRotShow(it.rot)+'°</b><input type="range" min="-180" max="180" step="1" data-a="lt" data-f="rot" value="'+ltRotNorm(it.rot)+'"></label>'+
    '<div class="lt-nudge"><span class="muted" style="font-size:13px">Повернуть на шаг</span><div><button class="btn sec" type="button" data-c="ltRot" data-k="-90" aria-label="Влево на 90 градусов">⟲ 90°</button><button class="btn sec" type="button" data-c="ltRot" data-k="-15" aria-label="Влево на 15 градусов">↺ 15°</button><button class="btn sec" type="button" data-c="ltRot" data-k="15" aria-label="Вправо на 15 градусов">15° ↻</button><button class="btn sec" type="button" data-c="ltRot" data-k="90" aria-label="Вправо на 90 градусов">90° ⟳</button></div></div>';
  if(it.type==='light'){
    h+='<label>Мощность, Вт<input type="number" min="0" step="10" data-a="lt" data-f="w" value="'+esc(it.w)+'"></label>'+
      '<label>Цветовая температура<select data-a="lt" data-f="k">'+[2700,3200,4300,5600,6500].map(k=>'<option value="'+k+'"'+(num(it.k)===k?' selected':'')+'>'+k+' K'+({2700:' (лампа накаливания)',3200:' (тёплый)',4300:' (нейтральный)',5600:' (дневной)',6500:' (холодный)'}[k])+'</option>').join('')+'</select></label>'+
      '<label>Насадка<select data-a="lt" data-f="mod">'+optList(['Софтбокс','Фреснель','Голый прибор','LED-панель','Отражатель'],it.mod)+'</select></label>';
  }
  const rng=(lab,f,id,min,max,step,val,unit)=>'<label>'+lab+': <b id="'+id+'">'+val+unit+'</b><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" data-a="lt" data-f="'+f+'" value="'+val+'"></label>';
  if(it.type==='light'){h+=rng('Высота','h','hv',0.3,5,0.1,(num(it.h)||2.3).toFixed(1),' м')+rng('Наклон','tilt','tiltv',-90,45,1,Math.round(it.tilt==null?ltAutoTilt(it):num(it.tilt)),'°')}
  if(it.type==='camera'){h+=rng('Высота','h','hv',0.3,3,0.05,(num(it.h)||1.45).toFixed(2),' м')+rng('Наклон','tilt','tiltv',-60,30,1,Math.round(num(it.tilt)||0),'°')}
  if(it.type==='actor'){h+=rng('Рост','h','hv',1,2.1,0.01,(num(it.h)||1.75).toFixed(2),' м')+'<label>Поза<select data-a="lt" data-f="pose">'+[['stand','Стоит'],['sit','Сидит']].map(o=>'<option value="'+o[0]+'"'+((it.pose||'stand')===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></label>'}
  h+='<div class="lt-nudge"><span class="muted" style="font-size:13px">Сдвиг (стрелки на клавиатуре)</span><div><button class="btn sec" type="button" data-c="ltNudge" data-k="l" aria-label="Влево">←</button><button class="btn sec" type="button" data-c="ltNudge" data-k="u" aria-label="Вглубь">↑</button><button class="btn sec" type="button" data-c="ltNudge" data-k="d" aria-label="Ближе">↓</button><button class="btn sec" type="button" data-c="ltNudge" data-k="r" aria-label="Вправо">→</button></div></div>';
  if(it.type==='camera')h+='<label>Объектив, мм<input type="number" min="8" max="400" data-a="lt" data-f="mm" value="'+esc(it.mm)+'"></label>';
  if(it.type==='prop')h+='<label>Что это<select data-a="lt" data-f="kind">'+Object.keys(PROP_K).map(k=>'<option value="'+k+'"'+(propKind(it)===k?' selected':'')+'>'+PROP_K[k].n+'</option>').join('')+'</select></label><label>'+(propKind(it)==='car'?'Длина':'Ширина')+': <b id="lenv">'+(num(it.len)/40).toFixed(1)+' м</b><input type="range" min="8" max="240" data-a="lt" data-f="len" value="'+Math.round(num(it.len))+'"></label>';
  else if(['flag','diff','window'].indexOf(it.type)>-1)h+='<label>Размер: <b id="lenv">'+Math.round(num(it.len))+'</b><input type="range" min="30" max="320" data-a="lt" data-f="len" value="'+Math.round(num(it.len))+'"></label>';
  return h+'</div><div class="row" style="margin-top:10px"><button class="btn sec" type="button" data-c="ltDup">Дублировать</button><button class="btn sec" type="button" data-c="ltDel">Удалить</button></div>';
}
function paintInspector(){const el=$('#lt-insp');if(el)el.innerHTML=inspector()}
function vLights(){
  const sid=S.lightScene||0,L=curLight(),sc=S.scenes.find(s=>s.id===sid);
  const opts='<option value="0"'+(!sid?' selected':'')+'>Без сцены (черновик)</option>'+sceneOpts(sid,false);
  const quick=['camera','light','actor'].map(k=>'<button class="btn sec" type="button" data-c="ltAdd" data-k="'+k+'" style="padding:8px 14px">'+icon('plus')+LT_NAMES[k]+'</button>').join('');
  const more=dd(icon('plus')+'Ещё',ddh('Свет и предметы')+'<div class="two">'+Object.keys(LT_NAMES).filter(k=>['camera','light','actor'].indexOf(k)<0).map(k=>ddi('data-c="ltAdd" data-k="'+k+'"',LT_NAMES[k])).join('')+ddi('data-c="ltTop"','Топлайт')+'</div>'+
    ddh('Мебель и объекты')+'<div class="two">'+Object.keys(PROP_K).filter(k=>k!=='box').map(k=>ddi('data-c="ltProp" data-k="'+k+'"',PROP_K[k].n)).join('')+'</div>',{wide:true});
  const pres=dd('Шаблон света',[['three','Классика: 3 точки'],['window','Окно + отражатель'],['night','Ночь: контровой + лампа']].map(p=>ddi('data-c="ltPreset" data-k="'+p[0]+'"',p[1])).join(''));
  const info=sc?'<p class="muted" style="margin:0 0 10px">'+esc(sc.type)+'. '+esc(sc.loc)+(sc.time?', '+esc(sc.time):'')+(sc.chars.length?'. В кадре: '+esc(sc.chars.join(', ')):'')+'</p>':'';
  const canvas=info+'<div class="row noprint" style="margin-bottom:10px"><label>Сцена <select data-a="ltscene" data-r="1" style="margin-left:8px;background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:9px 10px;max-width:60vw">'+opts+'</select></label></div>'+
    '<div class="tbar noprint" style="margin-bottom:10px">'+quick+more+pres+'</div>'+
    '<div class="tbar noprint" style="margin-bottom:12px"><div class="seg" role="group" aria-label="Время суток">'+[['','Студия'],['day','День'],['eve','Вечер'],['night','Ночь']].map(o=>'<button class="chip" type="button" data-c="ltTod" data-k="'+o[0]+'" aria-pressed="'+((L.tod||'')===o[0])+'">'+o[1]+'</button>').join('')+'</div>'+
    '<div class="seg lt-mode" role="group" aria-label="Вид схемы"><button class="chip" type="button" data-c="ltView" data-k="2d" aria-pressed="'+!PREF.lt3d+'">План</button><button class="chip" type="button" data-c="ltView" data-k="3d" aria-pressed="'+!!PREF.lt3d+'">3D</button></div></div>'+
    '<div class="lt'+(PREF.lt3d?' is3d':'')+'"><div>'+(PREF.lt3d?'<div id="lt3d" class="lt3d"><p class="lt3d-hint">Загружаю 3D…</p></div><p class="muted lt3d-help">Вращайте мышью или пальцем, колёсико или два пальца — приближение, правая кнопка или два пальца — сдвиг. Предметы можно перетаскивать по полу, выбранный предмет настраивается справа.</p>':'')+'<svg id="lt-svg"'+(PREF.lt3d?' hidden':'')+' viewBox="0 0 800 520" role="img" aria-label="План света: вид сверху"><style>'+LT_CSS+'</style><defs><pattern id="lt-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/></pattern></defs><rect id="lt-bg" width="800" height="520" fill="url(#lt-grid)"/><text x="400" y="22" text-anchor="middle" style="fill:rgba(255,255,255,.35);font:600 13px sans-serif">ДАЛЬНЯЯ СТЕНА</text><text x="400" y="510" text-anchor="middle" style="fill:rgba(255,255,255,.35);font:600 13px sans-serif">БЛИЖНЯЯ СТОРОНА</text><g id="lt-items"></g></svg></div>'+
    '<aside class="note-box noprint"><h2>Свойства</h2><div id="lt-insp"></div></aside></div>';
  const notes='<label class="fields" style="display:block"><span class="muted" style="font-size:14px">Настроение и заметки к свету</span><textarea rows="3" data-a="ltnote" style="width:100%;margin-top:4px;background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:10px 12px" placeholder="Контраст, соотношение ключ/заполнение, откуда падает свет, что нужно для практиков">'+esc(L.note||'')+'</textarea></label>'+
    '<div class="tbar noprint" style="margin-top:12px"><button class="btn sec" type="button" data-c="tab" data-k="rentals">'+icon('store')+'Подобрать технику</button><button class="btn sec" type="button" data-c="ltClear">Очистить схему</button></div>';
  return hd('Светосхема','План света сверху: камера показывает угол кадра по объективу, свет — направление и цвет луча. Перетаскивайте предметы, меняйте мощность и температуру. Схема сохраняется отдельно для каждой сцены.',
    '<button class="btn" type="button" data-c="print">'+icon('print')+'Распечатать схему</button>'+dlMenu(ddi('data-c="ltSvg"','Картинка SVG')+ddi('data-c="print"','PDF через печать')))+
    '<div class="col">'+panel('ltcv','bulb','Схема',canvas)+panel('ltleg','list','Экспликация света','<div id="lt-legend"></div><div style="height:12px"></div>'+notes)+'</div>';
}

/* ---------- светосхема: 3D-вид (three.js, грузится по запросу) ---------- */
let LT3=null,LT3_LOADING=null;
const M3=v=>v/40;
const LT_BEAM={'Софтбокс':48,'Фреснель':22,'Голый прибор':60,'LED-панель':42,'Отражатель':38};
async function lt3Lib(){
  if(!LT3_LOADING)LT3_LOADING=Promise.all([import('../vendor/three.module.min.js'),import('../vendor/OrbitControls.js')]).catch(e=>{LT3_LOADING=null;throw e});
  return LT3_LOADING;
}
async function lt3Mount(sel){
  sel=sel||'#lt3d';const host=$(sel);if(!host)return;
  let mods;try{mods=await lt3Lib()}catch(e){host.innerHTML='<p class="lt3d-hint">Не удалось загрузить 3D. Проверьте интернет и обновите страницу.</p>';return}
  if(!host.isConnected)return;
  const T=mods[0],OrbitControls=mods[1].OrbitControls;
  if(!LT3){
    let renderer;
    try{renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true})}catch(e){host.innerHTML='<p class="lt3d-hint">Этот браузер не поддерживает 3D (WebGL).</p>';return}
    renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
    renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;
    const scene=new T.Scene();scene.background=new T.Color(0x0d1226);scene.fog=new T.Fog(0x0d1226,22,45);
    const cam=new T.PerspectiveCamera(45,1.6,0.1,200);cam.position.set(4.5,5.5,8.5);
    const controls=new OrbitControls(cam,renderer.domElement);controls.target.set(0,0.8,0);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2-0.03;controls.minDistance=2;controls.maxDistance=35;
    const hemi=new T.HemisphereLight(0xb8c6ff,0x2a3050,0.75);scene.add(hemi);
    const sun=new T.DirectionalLight(0xfff4e0,0);sun.position.set(4,8,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;scene.add(sun);
    const floor=new T.Mesh(new T.PlaneGeometry(M3(800)+6,M3(520)+6),new T.MeshStandardMaterial({color:0x3a4266,roughness:.85}));
    floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
    const grid=new T.GridHelper(Math.max(M3(800),M3(520))+6,Math.round(Math.max(M3(800),M3(520))+6),0x5566aa,0x3a4466);grid.position.y=0.002;grid.material.opacity=.35;grid.material.transparent=true;scene.add(grid);
    const group=new T.Group();scene.add(group);
    LT3={T:T,renderer:renderer,scene:scene,cam:cam,controls:controls,group:group,floor:floor,hemi:hemi,sun:sun,grid:grid,drag:null,ray:new T.Raycaster(),raf:0};
    lt3Events();
  }
  host.innerHTML='';host.appendChild(LT3.renderer.domElement);
  LT3.mode=sel==='#sb3d'?'sb':'lt';
  lt3Look();
  if(LT3.mode==='lt')LT3.controls.minDistance=2;
  if(LT3.mode==='lt'&&LT3.cam.fov!==45){LT3.cam.fov=45;LT3.cam.position.set(4.5,5.5,8.5);LT3.controls.target.set(0,0.8,0)}
  lt3Size();lt3Sync();
  if(!LT3.raf)lt3Loop();
}
const TOD={day:{n:'День',bg:0xa9cdf0,sky:0xe4f0ff,gr:0x7a6c58,hemi:1.05,sun:2.3,sc:0xfff1d8,sp:[4,11,6],floor:0x8a8f9c},
  eve:{n:'Вечер',bg:0xe7a07c,sky:0xffc29a,gr:0x40304e,hemi:.6,sun:1.9,sc:0xff9550,sp:[9,2.4,-5],floor:0x6e6070},
  night:{n:'Ночь',bg:0x060a17,sky:0x6f86c9,gr:0x101425,hemi:.16,sun:.45,sc:0x9fb4ff,sp:[-5,9,-3],floor:0x232838}};
function lt3Look(){
  if(!LT3)return;const T=LT3.T,sb=LT3.mode==='sb',lit=sb&&SB3.lit,bg=lit?0x05070f:sb?0x9aa4ba:0x0d1226,td=TOD[curLight().tod];
  LT3.hemi.color.set(0xb8c6ff);LT3.hemi.groundColor.set(0x2a3050);LT3.sun.color.set(0xfff4e0);LT3.sun.position.set(4,8,6);
  LT3.scene.background=new T.Color(bg);LT3.scene.fog.color=new T.Color(bg);
  LT3.hemi.intensity=lit?0.12:sb?1.3:0.75;LT3.sun.intensity=sb&&!lit?1.6:0;LT3.floor.material.color=new T.Color(lit?0x262b3d:sb?0x6b7590:0x3a4266);LT3.grid.visible=!sb;
  if(td){LT3.scene.background=new T.Color(td.bg);LT3.scene.fog.color=new T.Color(td.bg);LT3.hemi.color.set(td.sky);LT3.hemi.groundColor.set(td.gr);LT3.hemi.intensity=td.hemi;
    LT3.sun.color.set(td.sc);LT3.sun.intensity=td.sun;LT3.sun.position.set(td.sp[0],td.sp[1],td.sp[2]);LT3.floor.material.color=new T.Color(td.floor)}
  LT3.controls.maxPolarAngle=sb?Math.PI*0.62:Math.PI/2-0.03;
}
function lt3Size(){
  if(!LT3)return;const el=LT3.renderer.domElement,host=el.parentElement;if(!host)return;
  if(LT3.mode==='sb'){const m=host.parentElement,W=m.clientWidth||800,H=m.clientHeight||450,w=Math.round(Math.min(W,H*16/9)),h=Math.round(w*9/16);
    LT3.renderer.setSize(w,h,false);el.style.width=w+'px';el.style.height=h+'px';host.style.width=w+'px';host.style.height=h+'px';LT3.cam.aspect=16/9;LT3.cam.updateProjectionMatrix();return}
  const w=host.clientWidth||800,h=Math.max(280,Math.round(document.body.classList.contains('fs')?window.innerHeight-140:w*0.62));
  LT3.renderer.setSize(w,h,false);el.style.width='100%';el.style.height=h+'px';LT3.cam.aspect=w/h;LT3.cam.updateProjectionMatrix();
}
window.addEventListener('resize',()=>{if(LT3)lt3Size()});
function lt3Loop(){
  if(!LT3)return;
  const el=LT3.renderer.domElement;
  if(!el.isConnected){LT3.raf=0;return}
  LT3.controls.update();LT3.renderer.render(LT3.scene,LT3.cam);
  LT3.raf=requestAnimationFrame(lt3Loop);
}
function lt3Label(text,color){
  const T=LT3.T,c=document.createElement('canvas'),x=c.getContext('2d'),fs=44;
  x.font='600 '+fs+'px Onest,system-ui,sans-serif';const w=Math.ceil(x.measureText(text).width)+28;c.width=w;c.height=fs+24;
  x.font='600 '+fs+'px Onest,system-ui,sans-serif';x.fillStyle='rgba(13,18,38,.78)';x.beginPath();if(x.roundRect)x.roundRect(0,0,w,c.height,18);else x.rect(0,0,w,c.height);x.fill();
  x.fillStyle=color||'#fff';x.textBaseline='middle';x.fillText(text,14,c.height/2+2);
  const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;
  const s=new T.Sprite(new T.SpriteMaterial({map:tx,depthTest:false,transparent:true}));{const q=LT3.mode==='sb'?0.2:0.4;s.scale.set(w/c.height*q,q,1)};s.renderOrder=10;return s;
}
function lt3Prop(T,G,k,W,selM,std){
  const P=PROP_K[k],D=W*P.d,wood=selM||std(0x8a6a4a),fab=selM||std(0x5a6b8c,{roughness:.9}),dark=selM||std(0x2a2f3d),
    box=(w,h,d,x,y,z,m)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);b.castShadow=true;b.receiveShadow=true;G.add(b);return b},
    cyl=(r,h,x,y,z,m,rx,rz)=>{const c=new T.Mesh(new T.CylinderGeometry(r,r,h,16),m);c.position.set(x,y,z);if(rx)c.rotation.x=rx;if(rz)c.rotation.z=rz;c.castShadow=true;G.add(c);return c},
    legs=(w,d,h,r,m)=>[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>cyl(r,h,q[0]*(w/2-r*1.5),h/2,q[1]*(d/2-r*1.5),m));
  if(k==='chair'){legs(W,D,.45,.02,wood);box(W,.05,D,0,.47,0,wood);box(W,.48,.04,0,.73,-D/2+.02,wood)}
  else if(k==='table'){legs(W,D,.72,.03,wood);box(W,.05,D,0,.74,0,wood)}
  else if(k==='sofa'){box(W,.42,D,0,.21,0,fab);box(W,.45,D*.28,0,.62,-D/2+D*.14,fab);box(W*.08,.3,D,-W/2+W*.04,.55,0,fab);box(W*.08,.3,D,W/2-W*.04,.55,0,fab)}
  else if(k==='bed'){box(W,.32,D,0,.16,0,wood);box(W*.97,.18,D*.97,0,.41,0,std(0xd9dde6,{roughness:.95}));box(W,.95,.06,0,.47,-D/2,wood);box(W*.36,.1,D*.13,-W*.22,.55,-D/2+D*.12,std(0xffffff,{roughness:1}));box(W*.36,.1,D*.13,W*.22,.55,-D/2+D*.12,std(0xffffff,{roughness:1}))}
  else if(k==='wardrobe'){box(W,P.h,D,0,P.h/2,0,wood);box(.012,P.h*.92,.01,0,P.h/2,D/2+.005,dark);cyl(.012,.16,-.05,P.h*.55,D/2+.03,dark);cyl(.012,.16,.05,P.h*.55,D/2+.03,dark)}
  else if(k==='door'){box(.06,P.h+.06,.12,-W/2-.03,(P.h+.06)/2,0,dark);box(.06,P.h+.06,.12,W/2+.03,(P.h+.06)/2,0,dark);box(W+.12,.06,.12,0,P.h+.03,0,dark);
    const leaf=new T.Group();leaf.position.set(-W/2,0,0);leaf.rotation.y=-.6;G.add(leaf);const m=new T.Mesh(new T.BoxGeometry(W,P.h,.04),wood);m.position.set(W/2,P.h/2,0);m.castShadow=true;leaf.add(m)}
  else if(k==='car'){const L=W,w=W*P.d,body=selM||std(0x9aa3b5,{metalness:.5,roughness:.35}),glass=std(0x1c2433,{metalness:.2,roughness:.15}),tire=std(0x15171d,{roughness:.9});
    box(w,.55,L,0,.55,0,body);box(w*.9,.5,L*.48,0,1.05,-L*.04,glass);box(w*.86,.06,L*.44,0,1.32,-L*.04,body);
    [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(q=>cyl(.33,.22,q[0]*(w/2-.08),.33,q[1]*L*.32,tire,0,Math.PI/2));
    box(w*.22,.08,.02,-w*.3,.62,L/2+.005,std(0xfff3c4,{emissive:0xfff3c4,emissiveIntensity:.6}));box(w*.22,.08,.02,w*.3,.62,L/2+.005,std(0xfff3c4,{emissive:0xfff3c4,emissiveIntensity:.6}))}
  else if(k==='tree'){cyl(.12,P.h*.55,0,P.h*.275,0,selM||std(0x5b4330));const c=new T.Mesh(new T.SphereGeometry(W/2,20,14),selM||std(0x3f7a4c,{roughness:.95}));c.position.y=P.h*.62;c.scale.y=1.15;c.castShadow=true;G.add(c)}
  else box(W,.6,W*.6,0,.3,0,selM||std(0x8a6a4a));
}
function lt3Dir(rot){const r=(num(rot)||0)*Math.PI/180;return {x:Math.sin(r),z:-Math.cos(r)}}
function lt3Sync(){
  if(!LT3)return;
  const T=LT3.T,G=LT3.group;
  G.children.slice().forEach(o=>{G.remove(o);o.traverse(m=>{if(m.geometry)m.geometry.dispose();if(m.material){(Array.isArray(m.material)?m.material:[m.material]).forEach(mt=>{if(mt.map)mt.map.dispose();mt.dispose()})}})});
  const std=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.1},o||{}));
  const items=curLight().items;let lights=0;
  items.forEach(it=>{
    const o=new T.Group();o.userData.id=it.id;o.position.set(M3(it.x-400),0,M3(it.y-260));
    const d=lt3Dir(it.rot),yaw=Math.atan2(d.x,d.z);
    const sel=it.id===S.lightSel,selMat=std(0xffd23f,{emissive:0xffd23f,emissiveIntensity:.6});
    const add=(m,cast)=>{m.castShadow=cast!==false;m.receiveShadow=true;o.add(m);return m};
    if(it.type==='actor'){
      const hg=num(it.h)||1.75,sit=it.pose==='sit',k=hg/1.75,eye=sit?.47+.75*k:1.62*k;
      if(sit){const ch=add(new T.Mesh(new T.BoxGeometry(.5,.45,.5),std(0x6b5644)));ch.position.set(-d.x*.05,.225,-d.z*.05);const bk=add(new T.Mesh(new T.BoxGeometry(.5,.55,.06),std(0x6b5644)));bk.position.set(-d.x*.27,.72,-d.z*.27);bk.rotation.y=yaw}
      const fig=new T.Group();fig.rotation.y=yaw;o.add(fig);const skin=std(0xffc2d4),cloth=std(0xff8fb1),pants=std(0x7a5a8f);
      const limb=(r,len,mat,x,y,z,rx)=>{const m=new T.Mesh(new T.CapsuleGeometry(r,len,6,12),mat);m.castShadow=true;m.receiveShadow=true;m.position.set(x,y,z);if(rx)m.rotation.x=rx;fig.add(m);return m};
      const hip=sit?.47:.92*k,sh=sit?hip+.55*k:1.42*k;
      limb(.17*k,(sh-hip)-.2*k,cloth,0,(hip+sh)/2,0);
      if(sit){limb(.075*k,.38*k,pants,-.1*k,hip,.22*k,Math.PI/2);limb(.075*k,.38*k,pants,.1*k,hip,.22*k,Math.PI/2);limb(.065*k,.32*k,pants,-.1*k,.24,.44*k);limb(.065*k,.32*k,pants,.1*k,.24,.44*k)}
      else{limb(.08*k,.72*k,pants,-.1*k,hip/2,0);limb(.08*k,.72*k,pants,.1*k,hip/2,0)}
      limb(.06*k,.5*k,cloth,-.25*k,sh-.3*k,0,sit?-.5:0);limb(.06*k,.5*k,cloth,.25*k,sh-.3*k,0,sit?-.5:0);
      limb(.05*k,.08*k,skin,0,sh+.06*k,0);
      const head=add(new T.Mesh(new T.SphereGeometry(.15*k,20,16),std(0xffc2d4)));head.position.y=eye;
      const nose=add(new T.Mesh(new T.ConeGeometry(.05,.14,12),std(0xffffff)));nose.position.set(d.x*.17*k,eye,d.z*.17*k);nose.lookAt(o.position.x+d.x*2,eye,o.position.z+d.z*2);nose.rotateX(Math.PI/2);
      if(sel){const ring=new T.Mesh(new T.RingGeometry(.32,.4,32),selMat);ring.rotation.x=-Math.PI/2;ring.position.y=.01;o.add(ring)}
    }else if(it.type==='camera'){
      const ch=num(it.h)||1.45,head=new T.Group();head.position.y=ch;head.rotation.order='YXZ';head.rotation.y=yaw+Math.PI;head.rotation.x=(num(it.tilt)||0)*Math.PI/180;o.add(head);
      const box=new T.Mesh(new T.BoxGeometry(.22,.2,.34),sel?selMat:std(0xcfd6e6));box.castShadow=true;head.add(box);
      const lens=new T.Mesh(new T.CylinderGeometry(.07,.08,.18,20),std(0x222633));lens.rotation.x=Math.PI/2;lens.position.z=-.25;head.add(lens);
      [0,1,2].forEach(i=>{const a=i*Math.PI*2/3,l=add(new T.Mesh(new T.CylinderGeometry(.015,.015,ch),std(0x444a5e)));l.position.set(Math.sin(a)*.22,ch/2,Math.cos(a)*.22);l.rotation.set(Math.cos(a)*-.15,0,Math.sin(a)*.15)});
      const half=Math.atan(18/(num(it.mm)||35)),L=4.2,hw=Math.tan(half)*L,hh=hw*9/16;
      const pts=[[0,0,0],[-hw,-hh,-L],[0,0,0],[hw,-hh,-L],[0,0,0],[hw,hh,-L],[0,0,0],[-hw,hh,-L],[-hw,-hh,-L],[hw,-hh,-L],[hw,-hh,-L],[hw,hh,-L],[hw,hh,-L],[-hw,hh,-L],[-hw,hh,-L],[-hw,-hh,-L]].map(p=>new T.Vector3(p[0],p[1],p[2]));
      const fr=new T.LineSegments(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0x7fe3ff,transparent:true,opacity:.75}));fr.position.z=-.3;head.add(fr);
    }else if(it.type==='light'){
      const H=num(it.h)||2.3,pos=new T.Vector3(0,H,0),aimDist=3.2,tl=(it.tilt==null?ltAutoTilt(it):num(it.tilt))*Math.PI/180,boom=it.boom||tl<=-60*Math.PI/180;
      const sx=boom?-d.x*1.3:0,sz=boom?-d.z*1.3:0,SH=boom?H+.15:H;
      const stand=add(new T.Mesh(new T.CylinderGeometry(.025,.03,SH),std(0x3a3f52)));stand.position.set(sx,SH/2,sz);
      if(boom){const arm=add(new T.Mesh(new T.CylinderGeometry(.02,.02,1.45),std(0x3a3f52)));arm.position.set(sx/2,H+.15,sz/2);arm.rotation.z=Math.PI/2;arm.rotation.y=-yaw+Math.PI/2;arm.rotation.order='YXZ';arm.rotation.set(0,Math.atan2(sx,sz)+Math.PI/2,Math.PI/2)}
      [0,1,2].forEach(i=>{const a=i*Math.PI*2/3,l=add(new T.Mesh(new T.CylinderGeometry(.015,.015,.6),std(0x3a3f52)));l.position.set(sx+Math.sin(a)*.18,.22,sz+Math.cos(a)*.18);l.rotation.set(Math.cos(a)*.7,0,-Math.sin(a)*.7)});
      const col=new T.Color(kelvinColor(it.k));
      const headG=new T.Group();headG.position.copy(pos);o.add(headG);
      const cl=Math.cos(tl),tx=d.x*cl*aimDist,tz=d.z*cl*aimDist+(Math.abs(cl)<1e-3?1e-3:0),ty=H+Math.sin(tl)*aimDist;headG.lookAt(o.position.x+tx,ty,o.position.z+tz);
      const isBox=it.mod==='Софтбокс'||it.mod==='LED-панель';
      const hm=new T.Mesh(isBox?new T.BoxGeometry(it.mod==='Софтбокс'?.7:.45,it.mod==='Софтбокс'?.5:.3,.12):new T.CylinderGeometry(.13,.17,.28,20),sel?selMat:std(0x23283a));
      if(!isBox)hm.rotation.x=Math.PI/2;hm.castShadow=true;headG.add(hm);
      const face=new T.Mesh(isBox?new T.PlaneGeometry(it.mod==='Софтбокс'?.66:.42,it.mod==='Софтбокс'?.46:.27):new T.CircleGeometry(.12,24),new T.MeshBasicMaterial({color:col}));face.position.z=isBox?.07:.15;headG.add(face);
      const ang=(LT_BEAM[it.mod]||40)*Math.PI/180/2;
      if(lights<8){
        const sp=new T.SpotLight(col,Math.max(40,num(it.w)*2.2),18,ang,isBox?.85:.4,1.6);
        sp.position.copy(pos);sp.castShadow=lights<4;sp.shadow.mapSize.set(1024,1024);sp.shadow.bias=-.0004;
        sp.target.position.set(tx,ty,tz);o.add(sp);o.add(sp.target);lights++;
      }
      const len=3.2,cone=new T.Mesh(new T.ConeGeometry(Math.tan(ang)*len,len,32,1,true),new T.MeshBasicMaterial({color:col,transparent:true,opacity:.08,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));
      cone.position.z=len/2+.1;cone.rotation.x=-Math.PI/2;headG.add(cone);
    }else if(it.type==='flag'||it.type==='diff'){
      const w=M3(num(it.len)||100),pan=new T.Group();pan.position.y=1.3;pan.rotation.y=yaw+Math.PI/2;o.add(pan);
      const p=new T.Mesh(new T.BoxGeometry(w,.9,.03),it.type==='flag'?(sel?selMat:std(0x111318)):new T.MeshStandardMaterial({color:sel?0xffd23f:0xffffff,transparent:true,opacity:.55,roughness:1}));p.castShadow=it.type==='flag';pan.add(p);
      const stand=add(new T.Mesh(new T.CylinderGeometry(.02,.025,.85),std(0x3a3f52)));stand.position.y=.42;
    }else if(it.type==='window'){
      const w=M3(num(it.len)||180),win=new T.Group();win.position.y=1.5;win.rotation.y=yaw;o.add(win);
      const p=new T.Mesh(new T.PlaneGeometry(w,1.5),new T.MeshBasicMaterial({color:sel?0xffe58a:0xcfe6ff,side:T.DoubleSide}));win.add(p);
      const fr=new T.Mesh(new T.BoxGeometry(w+.12,1.62,.06),std(0x1b2033));fr.position.z=-.04;win.add(fr);
      if(lights<8){const sp=new T.SpotLight(0xdbe9ff,420,22,Math.PI/3.2,.9,1.4);sp.position.set(0,1.6,0);sp.castShadow=lights<4;sp.shadow.mapSize.set(1024,1024);sp.target.position.set(d.x*4,.6,d.z*4);o.add(sp);o.add(sp.target);lights++}
    }else{
      const pg=new T.Group();pg.rotation.y=yaw;o.add(pg);lt3Prop(T,pg,propKind(it),Math.max(.15,M3(num(it.len)||36)),sel?selMat:null,std);
    }
    if(it.label){const lb=lt3Label(it.label,sel?'#FFD23F':'#fff');lb.position.y=it.type==='light'?(num(it.h)||2.3)+.45:it.type==='camera'?(num(it.h)||1.45)+.55:it.type==='actor'?(it.pose==='sit'?(num(it.h)||1.75)*.72+.35:(num(it.h)||1.75)+.2):it.type==='window'?2.45:it.type==='prop'?PROP_K[propKind(it)].h+.35:1.25;o.add(lb)}
    G.add(o);
  });
}
function lt3Pick(e){
  const el=LT3.renderer.domElement,r=el.getBoundingClientRect(),T=LT3.T;
  const v=new T.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  LT3.ray.setFromCamera(v,LT3.cam);
  const hits=LT3.ray.intersectObjects(LT3.group.children,true).filter(h=>!(h.object.isSprite)&&h.object.type!=='LineSegments'&&!(h.object.material&&h.object.material.blending===T.AdditiveBlending));
  for(const h of hits){let o=h.object;while(o&&!o.userData.id)o=o.parent;if(o)return o}
  return null;
}
function lt3Floor(e){
  const el=LT3.renderer.domElement,r=el.getBoundingClientRect(),T=LT3.T;
  LT3.ray.setFromCamera(new T.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),LT3.cam);
  const p=new T.Vector3();return LT3.ray.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),0),p)?p:null;
}
function lt3Events(){
  const el=LT3.renderer.domElement;el.style.touchAction='none';el.style.display='block';el.style.borderRadius='16px';
  el.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    const o=lt3Pick(e);if(!o)return;
    const it=curLight().items.find(i=>i.id===o.userData.id);if(!it)return;
    const f=lt3Floor(e);LT3.controls.enabled=false;
    LT3.drag={id:it.id,o:o,dx:f?o.position.x-f.x:0,dz:f?o.position.z-f.z:0,moved:false};
    try{el.setPointerCapture(e.pointerId)}catch(err){}
    if(S.lightSel!==it.id){S.lightSel=it.id;paintInspector();lt3Sync();LT3.drag.o=LT3.group.children.find(c=>c.userData.id===it.id)}
  });
  el.addEventListener('pointermove',e=>{
    const D=LT3.drag;if(!D)return;const f=lt3Floor(e);if(!f)return;
    const it=curLight().items.find(i=>i.id===D.id);if(!it)return;
    const x=Math.max(-80,Math.min(880,Math.round((f.x+D.dx)*40+400))),y=Math.max(-80,Math.min(600,Math.round((f.z+D.dz)*40+260)));
    it.x=x;it.y=y;D.moved=true;if(D.o)D.o.position.set(M3(x-400),0,M3(y-260));
  });
  const end=()=>{const D=LT3&&LT3.drag;if(!D)return;LT3.drag=null;LT3.controls.enabled=true;if(D.moved){lt3Sync();const lg=$('#lt-legend');if(lg)lg.innerHTML=legendHtml(curLight());save()}};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
}

function ltAutoTilt(it){const H=num(it.h)||2.3;return Math.round(-Math.atan2(H-1.3,3.2)*180/Math.PI)}
function ltNudge(k,step){const it=selItem();if(!it)return;
  if(k==='l')it.x-=step;else if(k==='r')it.x+=step;else if(k==='u')it.y-=step;else if(k==='d')it.y+=step;
  it.x=Math.max(-80,Math.min(880,it.x));it.y=Math.max(-80,Math.min(600,it.y));paintLight();save()}
function ltAim(x,y,tx,ty){return (Math.round(Math.atan2(tx-x,-(ty-y))*180/Math.PI)+360)%360}
function ltMake(type,x,y,extra){return Object.assign({id:uid(),type:type,x:x,y:y},JSON.parse(JSON.stringify(LT_DEF[type])),extra||{})}
function ltPreset(k){
  const L=curLight(),it=[];
  const A=(x,y)=>ltMake('actor',x,y,{label:'Актёр',rot:0});
  if(k==='three'){
    it.push(A(400,250),ltMake('camera',400,470,{label:'Камера A',mm:50,rot:0}),
      ltMake('light',250,400,{label:'Ключ',w:300,k:5600,mod:'Софтбокс',rot:ltAim(250,400,400,250)}),
      ltMake('light',560,420,{label:'Заполнение',w:120,k:5600,mod:'LED-панель',rot:ltAim(560,420,400,250)}),
      ltMake('light',500,90,{label:'Контровой',w:200,k:5600,mod:'Фреснель',rot:ltAim(500,90,400,250)}));
  }else if(k==='window'){
    it.push(ltMake('window',400,40,{label:'Окно',len:240,rot:180}),A(400,230),ltMake('diff',470,330,{label:'Отражатель',len:120,rot:ltAim(470,330,400,230)}),ltMake('camera',230,430,{label:'Камера A',mm:35,rot:ltAim(230,430,400,230)}));
  }else{
    it.push(A(400,260),ltMake('camera',400,470,{label:'Камера A',mm:35,rot:0}),
      ltMake('light',460,90,{label:'Контровой холодный',w:300,k:6500,mod:'Фреснель',rot:ltAim(460,90,400,260)}),
      ltMake('light',250,330,{label:'Практикал: лампа',w:60,k:2700,mod:'Голый прибор',rot:ltAim(250,330,400,260)}),
      ltMake('prop',200,360,{label:'Тумба',len:90,rot:0}));
  }
  L.items=it;S.lightSel='';
}
function ltSvgString(){
  const L=curLight();
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="1600" height="1040"><style>'+LT_CSS+'</style><rect width="800" height="520" fill="#12151f"/>'+L.items.map(it=>ltItem(it,false)).join('')+'</svg>';
}

