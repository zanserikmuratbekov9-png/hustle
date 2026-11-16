/* ---------- проект: хаб инструментов ---------- */
function toolCard(x){
  return '<button class="tool'+(x.r.indexOf(S.role)>-1?' rel':'')+'" type="button" data-c="tab" data-k="'+x.id+'"><span class="ti">'+icon(x.ic)+'</span><span><b>'+t(x.n)+'</b><small>'+t(x.d)+'</small></span>'+(stepDone(x.id)?'<i class="ok" aria-label="готово">✓</i>':'')+'</button>';
}
/* пульт проекта: готовность по этапам, ближайшая смена, главные цифры */
function toolStatus(id){
  const n=S.scenes.length;
  let md=0;if(n){ensurePlan();md=maxDay()}
  switch(id){
    case 'script':return n?{ok:true,t:n+' '+plural(n,'сцена','сцены','сцен')}:{ok:false,t:'текст не загружен'};
    case 'story':{const f=Object.keys(S.story||{}).reduce((a,k)=>a+(S.story[k]||[]).length,0);return f?{ok:true,t:f+' '+plural(f,'кадр','кадра','кадров')}:{ok:false,t:'кадров нет'}}
    case 'explic':{const f=EX_FIELDS.filter(x=>(S.explic[x[0]]||'').trim()).length;return f?{ok:f>=3,t:'заполнено '+f+' из '+EX_FIELDS.length}:{ok:false,t:'пусто'}}
    case 'notes':{const ok=S.scenes.filter(s=>(S.notes[s.id]||{}).status==='ok').length;return n?{ok:ok===n,t:'утверждено '+ok+' из '+n}:{ok:false,t:'нет сцен'}}
    case 'schedule':return n?{ok:!!S.seen.schedule,t:md+' '+plural(md,'смена','смены','смен')}:{ok:false,t:'нет сцен'};
    case 'kpp':{if(!n)return {ok:false,t:'нет сцен'};const d=Object.keys(S.cs.info).filter(k=>S.cs.info[k]&&S.cs.info[k].date).length;return {ok:d>=md,t:'даты: '+Math.min(d,md)+' из '+md}}
    case 'budget':{const c=calc();return c.sub>0?{ok:true,t:money(c.total)}:{ok:false,t:'ставки не введены'}}
    case 'shots':{const k=S.shots.length,dn=S.shots.filter(x=>x.done).length;return k?{ok:true,t:'снято '+dn+' из '+k}:{ok:false,t:'кадров нет'}}
    case 'lights':{const k=Object.keys(S.light).filter(i=>S.light[i].items&&S.light[i].items.length).length;return k?{ok:true,t:k+' '+plural(k,'схема','схемы','схем')}:{ok:false,t:'схем нет'}}
    case 'tasks':{const o=S.tasks.filter(x=>x.status!=='done').length;return S.tasks.length?{ok:null,t:o?'открыто '+o:'всё сделано'}:{ok:null,t:'задач пока нет'}}
    case 'today':{const ti=todayIndex();return {ok:null,t:ti?'сегодня день '+ti:'экран для площадки'}}
    case 'rentals':return {ok:null,t:'техника для съёмок'};
    case 'callsheet':{if(!n)return {ok:false,t:'нет сцен'};const d=Object.keys(S.cs.info).filter(k=>S.cs.info[k]&&S.cs.info[k].addr).length;return {ok:d>=md,t:'адрес указан: '+Math.min(d,md)+' из '+md}}
  }
  return {ok:null,t:''};
}
function nextShift(){
  if(!S.scenes.length)return null;ensurePlan();const md=maxDay(),iso=localISO();let best=null;
  for(let d=1;d<=md;d++){const i=S.cs.info[d]||{};if(i.date&&i.date>=iso&&(!best||i.date<best.date))best={d,date:i.date}}
  const d=best?best.d:1,i=S.cs.info[d]||{},sc=S.scenes.filter(s=>S.assign[s.id]===d),locs=[];sc.forEach(s=>{const k=s.loc||'—';if(locs.indexOf(k)<0)locs.push(k)});
  return {d,md,date:i.date||'',call:i.call||'',addr:i.addr||'',sc,locs};
}
function vProj(){
  const head='<section class="hub-head"><div><span class="lbl">'+t('Название проекта')+'</span><input id="pname" data-a="pname" value="'+esc(S.name)+'" autocomplete="off" aria-label="Название проекта"></div>'+statsOrHint()+'</section>';
  const groups=navGroups();
  let next=null;groups.forEach(g=>g[1].forEach(x=>{if(!next&&toolStatus(x.id).ok===false)next=x}));
  const nx=next?'<div class="cont"><div><b>Следующий шаг: '+t(next.n)+'</b><span>'+esc(toolStatus(next.id).t)+'. '+esc(next.d||'')+'</span></div><button class="btn" type="button" data-c="tab" data-k="'+next.id+'">'+icon(next.ic)+'Открыть</button></div>':
    '<div class="cont"><div><b>Всё главное заполнено</b><span>Проверьте вызывной лист ближайшей смены и отправьте его команде.</span></div><button class="btn" type="button" data-c="tab" data-k="callsheet">'+icon('callsheet')+'Вызывной лист</button></div>';
  const sh=nextShift();
  const shift=sh?'<section class="pult-shift"><div class="ps-l"><small>Ближайшая смена</small><b>Смена '+sh.d+' из '+sh.md+'</b><span>'+(sh.date?esc(kppDate(sh.date)):'дата не указана')+(sh.call?' · сбор '+esc(sh.call):'')+'</span></div>'+
    '<div class="ps-m"><span>'+sh.sc.length+' '+plural(sh.sc.length,'сцена','сцены','сцен')+'</span>'+sh.locs.map(l=>'<span class="tag">'+esc(l)+'</span>').join('')+(sh.addr?'<span class="muted">'+esc(sh.addr)+'</span>':'')+'</div>'+
    '<button class="btn sec" type="button" data-c="openDay" data-k="'+sh.d+'">'+icon('callsheet')+'Вызывной лист дня</button></section>':'';
  const stages='<div class="pult">'+groups.map(g=>{
    const st=g[1].map(x=>[x,toolStatus(x.id)]),cnt=st.filter(y=>y[1].ok!==null),done=cnt.filter(y=>y[1].ok).length;
    return '<section class="pult-st"><div class="pst-h"><b>'+g[0]+'</b><span>'+(cnt.length?done+' из '+cnt.length:'')+'</span></div>'+(cnt.length?'<div class="pst-bar"><i style="width:'+Math.round(done/cnt.length*100)+'%"></i></div>':'')+
      st.map(y=>'<button class="pst-i" type="button" data-c="tab" data-k="'+y[0].id+'"><span class="pst-ic">'+icon(y[0].ic)+'</span><span class="pst-t"><b>'+t(y[0].n)+'</b><small>'+esc(y[1].t)+'</small></span><i class="pst-s '+(y[1].ok===true?'ok':y[1].ok===false?'no':'na')+'" aria-label="'+(y[1].ok===true?'готово':y[1].ok===false?'не готово':'')+'"></i></button>').join('')+'</section>'}).join('')+'</div>';
  const team=teamHtml();
  return head+nx+shift+stages+teamDoing()+backupBanner()+(team?'<div class="hub-team">'+team+'</div>':'');
}
/* кто что делает: открытые задачи по ролям, видны всей команде */
function teamDoing(){
  const open=S.tasks.filter(x=>x.status!=='done'),all=S.tasks.length;
  const cards=Object.keys(ROLES).map(r=>{
    const mine=open.filter(x=>x.role===r),act=mine.filter(x=>x.status==='doing'),show=(act.length?act:mine).slice(0,3);
    return '<article class="td-role'+(r===S.role?' me':'')+'"><div class="tr-h">'+icon(ROLES[r].i)+'<b>'+t(ROLES[r].t)+(r===S.role?' (вы)':'')+'</b><span>'+mine.length+' '+plural(mine.length,'задача','задачи','задач')+'</span></div>'+
      (show.length?'<ul>'+show.map(x=>'<li class="'+esc(x.status)+'">'+esc(x.text)+'</li>').join('')+'</ul>':'<p class="muted">Пока нет задач</p>')+'</article>'}).join('');
  return '<section class="team-doing"><div class="pst-h"><b>Кто что делает</b><span>'+(all?(all-open.length)+' из '+all+' задач готово':'')+'</span></div><div class="td-roles">'+cards+'</div>'+
    '<div class="td-foot"><button class="btn" type="button" data-c="tab" data-k="tasks">'+icon('check')+'Задачи команды</button>'+(all?'':'<button class="btn sec" type="button" data-c="taskSeed">Добавить типовые задачи моей роли</button>')+'</div></section>';
}

/* ---------- фестивали и гранты ---------- */

/* ---------- школа и словарь ---------- */

/* ---------- документы ---------- */
const DOC_TYPES=[['actor','Договор с актёром'],['consent','Согласие на съёмку'],['location','Разрешение на локацию'],['gear','Акт приёма техники']];
const DOC_FIELDS={
 actor:[['city','Город'],['date','Дата'],['project','Название фильма'],['producer','Продюсер (ФИО)'],['actor','Актёр (ФИО)'],['role','Роль'],['place','Место съёмок'],['dates','Даты и время съёмок'],['fee','Вознаграждение (пусто — безвозмездно)']],
 consent:[['city','Город'],['date','Дата'],['project','Название фильма'],['producer','Продюсер (ФИО)'],['person','Участник съёмки (ФИО)'],['place','Где снимаем'],['dates','Когда снимаем']],
 location:[['city','Город'],['date','Дата'],['project','Название фильма'],['producer','Продюсер (ФИО)'],['owner','Владелец или арендатор (ФИО)'],['address','Адрес локации'],['dates','Даты и время съёмок'],['fee','Плата за использование (пусто — безвозмездно)']],
 gear:[['city','Город'],['date','Дата'],['project','Название фильма'],['owner','Кто выдаёт технику (рентал)'],['student','Кто получает (ФИО)'],['dates','Срок аренды'],['deposit','Залог']]
};
const dv=k=>{const v=((S.doc.vals||{})[k]||'').trim();return v||'[___]'};
function docText(kk){
  const k=kk||S.doc.type;{const cu=(S.doc.custom||{})[k];if(cu)return cu}
  const hd=(n)=>n+'\n\u0433. '+dv('city')+', '+dv('date')+'\n\n';
  const foot='\n\nОбразец документа. Это не юридическая консультация: перед коммерческим использованием проверьте текст у юриста.';
  if(k==='actor'){
    const fee=((S.doc.vals||{}).fee||'').trim();
    return hd('ДОГОВОР ОБ УЧАСТИИ В СЪЁМКАХ ФИЛЬМА')+dv('producer')+' (далее — «Продюсер») и '+dv('actor')+' (далее — «Актёр») заключили настоящий договор.\n\n1. Предмет договора\n1.1. Актёр участвует в съёмках фильма «'+dv('project')+'» и исполняет роль: '+dv('role')+'.\n1.2. Съёмки проходят: '+dv('place')+'. Даты и время: '+dv('dates')+'.\n\n2. Обязанности сторон\n2.1. Актёр приходит на съёмки вовремя, выполняет указания режиссёра и соблюдает правила безопасности на площадке.\n2.2. Продюсер обеспечивает безопасные условия работы, питьевую воду и питание на время съёмок и заранее сообщает об изменениях графика.\n\n3. Вознаграждение\n3.1. '+(fee?'Размер вознаграждения: '+fee+'. Порядок оплаты: [___].':'Актёр участвует безвозмездно.')+'\n\n4. Права на изображение и исполнение\n4.1. Актёр разрешает использовать своё изображение, голос и исполнение в фильме «'+dv('project')+'», а также в его показах на фестивалях, закрытых просмотрах и в материалах для продвижения (афиша, трейлер, социальные сети).\n4.2. Использование в иных целях возможно только с отдельного согласия Актёра.\n\n5. Прочие условия\n5.1. Договор можно расторгнуть по соглашению сторон. Споры стороны решают переговорами.\n5.2. Договор составлен в двух экземплярах, по одному для каждой стороны.\n\nПродюсер: ____________ / '+dv('producer')+'\nАктёр: ____________ / '+dv('actor')+foot;
  }
  if(k==='consent'){
    return hd('СОГЛАСИЕ НА СЪЁМКУ')+'Я, '+dv('person')+', даю согласие на съёмку моего изображения и голоса для фильма «'+dv('project')+'» (продюсер: '+dv('producer')+').\n\nСъёмка проходит: '+dv('place')+', '+dv('dates')+'.\n\nЯ разрешаю использовать отснятый материал в фильме, на его показах на фестивалях и закрытых просмотрах, а также в материалах для продвижения фильма (афиша, трейлер, социальные сети).\n\nЯ понимаю, что участие добровольное. Согласие можно отозвать, письменно сообщив Продюсеру до выхода фильма.\n\nПодпись: ____________ / '+dv('person')+foot;
  }
  if(k==='location'){
    const fee=((S.doc.vals||{}).fee||'').trim();
    return hd('РАЗРЕШЕНИЕ НА СЪЁМКУ НА ЛОКАЦИИ')+dv('owner')+' (далее — «Владелец») разрешает '+dv('producer')+' (далее — «Продюсер») провести съёмки фильма «'+dv('project')+'» по адресу: '+dv('address')+'.\n\n1. Даты и время съёмок: '+dv('dates')+'.\n2. Продюсер обязуется беречь имущество Владельца, соблюдать правила безопасности, убрать за собой и вернуть помещение в прежнем состоянии.\n3. Продюсер возмещает документально подтверждённый ущерб, причинённый по вине группы.\n4. '+(fee?'Плата за использование локации: '+fee+'.':'Локация предоставляется безвозмездно.')+'\n5. Владелец подтверждает, что вправе распоряжаться помещением и разрешает использовать отснятый материал в фильме и его показах.\n\nВладелец: ____________ / '+dv('owner')+'\nПродюсер: ____________ / '+dv('producer')+foot;
  }
  const list=S.gear.length?S.gear.map((g,i)=>(i+1)+'. '+g.name+' — '+g.qty+' шт., состояние: [___], комплектация: [___]').join('\n'):'1. [Название техники] — [кол-во] шт., состояние: [___], комплектация: [___]';
  return hd('АКТ ПРИЁМА-ПЕРЕДАЧИ ТЕХНИКИ')+dv('owner')+' передаёт, а '+dv('student')+' принимает во временное пользование технику для съёмок фильма «'+dv('project')+'».\n\nСрок аренды: '+dv('dates')+'. Залог: '+dv('deposit')+'.\n\nПеречень техники:\n'+list+'\n\nСтороны проверили технику при выдаче и подтверждают её состояние. Получатель отвечает за сохранность техники до возврата и возвращает её в том же состоянии и комплектации.\n\nВыдал: ____________ / '+dv('owner')+'\nПринял: ____________ / '+dv('student')+foot;
}
function paintDoc(){const el=$('#doc-out');if(el)el.value=docText()}
function vDocs(){
  S.doc=S.doc||{type:'actor',vals:{}};S.doc.vals=S.doc.vals||{};
  const chips='<div class="chips" role="group" aria-label="Тип документа">'+DOC_TYPES.map(d=>'<button class="chip" type="button" data-c="docType" data-k="'+d[0]+'" aria-pressed="'+(S.doc.type===d[0])+'">'+d[1]+'</button>').join('')+'</div>';
  const fields='<div class="fields" style="margin-top:14px">'+DOC_FIELDS[S.doc.type].map(f=>'<label>'+f[1]+'<input data-a="docf" data-f="'+f[0]+'" value="'+esc(S.doc.vals[f[0]]||'')+'"></label>').join('')+'</div>';
  const out=(((S.doc.custom||{})[S.doc.type])?'<p class="note noprint">Текст изменён вручную или загружен из файла: поля выше его больше не обновляют. «Вернуть шаблон» включит автоматический текст.</p>':'')+'<textarea class="doc" data-a="doccustom" id="doc-out" aria-label="Текст документа">'+esc(docText())+'</textarea><div class="row noprint" style="margin-top:12px"><button class="btn" type="button" data-c="docCopy">'+icon('copy')+'Скопировать</button><button class="btn sec" type="button" data-c="docDl">'+icon('download')+'Скачать .txt</button><button class="btn sec" type="button" data-c="docDocx">'+icon('download')+'Скачать .docx</button><label class="btn sec" for="docIn" style="cursor:pointer">'+icon('upload')+'Загрузить свой текст</label><input class="sr" id="docIn" type="file" accept=".docx,.txt,.md,text/plain" data-a="docimport">'+(((S.doc.custom||{})[S.doc.type])?'<button class="btn sec" type="button" data-c="docReset">Вернуть шаблон</button>':'')+'<button class="btn sec" type="button" data-c="exportAll">'+icon('download')+'Все документы (.zip)</button><button class="btn sec" type="button" data-c="print">'+icon('print')+'Печать / PDF</button></div>';
  return '<header class="head"><div class="slate"></div><h1>'+t('Документы')+'</h1><p>Образцы документов для съёмок: заполните поля — текст соберётся сам. Фамилии и данные нигде не сохраняются, кроме вашего браузера.</p></header>'+
    '<div class="note">Образцы не заменяют юриста. Для коммерческих съёмок и работы с несовершеннолетними проверьте документы у специалиста.</div>'+
    '<div class="col">'+panel('dctype','file','Документ',chips+fields)+panel('dctext','script','Текст',out)+'</div>';
}

/* ---------- разбивка по элементам ---------- */
const BD_CATS=[['props','Реквизит'],['costume','Костюмы'],['makeup','Грим'],['transport','Транспорт'],['fx','Эффекты и трюки'],['notes','Заметки']];
const splitItems=v=>String(v||'').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean);
function bdSummary(){
  let out='';
  BD_CATS.slice(0,5).forEach(c=>{
    const map={},order=[];
    S.scenes.forEach(s=>{splitItems((S.bd[s.id]||{})[c[0]]).forEach(it=>{const k=it.toLowerCase();if(!map[k]){map[k]={n:it,sc:[]};order.push(k)}if(map[k].sc.indexOf(s.id)<0)map[k].sc.push(s.id)})});
    if(order.length)out+='<h3>'+c[1]+'</h3><ul style="margin:0;padding-left:22px">'+order.map(k=>'<li>'+esc(map[k].n)+' — сц. '+map[k].sc.join(', ')+'</li>').join('')+'</ul>';
  });
  return out||'<p class="muted" style="margin:0">Заполните таблицу — здесь появятся общие списки по сценам.</p>';
}
function bdText(){
  let out='';
  BD_CATS.slice(0,5).forEach(c=>{
    const map={},order=[];
    S.scenes.forEach(s=>{splitItems((S.bd[s.id]||{})[c[0]]).forEach(it=>{const k=it.toLowerCase();if(!map[k]){map[k]={n:it,sc:[]};order.push(k)}if(map[k].sc.indexOf(s.id)<0)map[k].sc.push(s.id)})});
    if(order.length)out+=c[1]+':\n'+order.map(k=>'- '+map[k].n+' (сц. '+map[k].sc.join(', ')+')').join('\n')+'\n\n';
  });
  return out.trim();
}
function vBreakdown(){
  const head='<header class="head"><div class="slate"></div><h1>'+t('Разбивка по элементам')+'</h1><p>Для каждой сцены впишите, что нужно: реквизит, костюмы, грим, транспорт. Перечисляйте через запятую — ниже соберутся общие списки.</p></header>';
  if(!S.scenes.length)return head+NEED_SCENES('Разбивка строится по сценам — сначала разберите сценарий.');
  const rows=S.scenes.map(s=>{const b=S.bd[s.id]||{};
    return '<tr><td style="width:150px"><b>Сц. '+s.id+'</b><small class="src" style="padding:0">'+esc(s.type)+'. '+esc(s.loc)+'</small></td>'+BD_CATS.map(c=>'<td style="min-width:130px"><input data-a="bd" data-id="'+s.id+'" data-f="'+c[0]+'" value="'+esc(b[c[0]]||'')+'" aria-label="'+c[1]+', сцена '+s.id+'"></td>').join('')+'</tr>'}).join('');
  const table='<div class="tw"><table class="grid" style="min-width:900px"><thead><tr><th>Сцена</th>'+BD_CATS.map(c=>'<th>'+c[1]+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
  const sum='<div id="bd-sum">'+bdSummary()+'</div><div class="row noprint" style="margin-top:12px"><button class="btn sec" type="button" data-c="dlScriptBd">'+icon('download')+'Сценарий и разбор (Word)</button><button class="btn sec" type="button" data-c="bdCopy">'+icon('copy')+'Скопировать списки</button><button class="btn sec" type="button" data-c="print">'+icon('print')+'Печать / PDF</button></div>';
  return head+'<div class="col">'+panel('bdt','grid','Элементы по сценам',table)+panel('bds','list','Общие списки',sum)+'</div>';
}

/* ---------- локации ---------- */
const LOC_ST=['Ищем','Нашли','Согласовано','Разрешение получено'];
function vLocations(){
  const head='<header class="head"><div class="slate"></div><h1>'+t('Локации')+'</h1><p>Места съёмок: адрес, контакт, условия и статус разрешения. Ссылка на карту ведёт в 2ГИС.</p></header>';
  const cards=S.locs.map(l=>'<div class="loc-card"><div class="fields" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))"><label>Название<input data-a="loc" data-id="'+l.id+'" data-f="name" value="'+esc(l.name)+'"></label><label>Адрес<input data-a="loc" data-id="'+l.id+'" data-f="addr" value="'+esc(l.addr)+'" placeholder="Город, улица, дом"></label><label>Контакт (имя, телефон)<input data-a="loc" data-id="'+l.id+'" data-f="contact" value="'+esc(l.contact)+'"></label><label>Цена или условия<input data-a="loc" data-id="'+l.id+'" data-f="price" value="'+esc(l.price)+'"></label><label>Сцены<input data-a="loc" data-id="'+l.id+'" data-f="scenes" value="'+esc(l.scenes)+'" placeholder="Например, 1, 3, 4"></label><label>Статус<select data-a="loc" data-id="'+l.id+'" data-f="status">'+optList(LOC_ST,l.status)+'</select></label><label class="wide">Заметки (парковка, питание, ограничения)<input data-a="loc" data-id="'+l.id+'" data-f="notes" value="'+esc(l.notes)+'"></label></div>'+
    '<div class="row"><a class="link" href="https://2gis.kz/almaty/search/'+encodeURIComponent((l.addr||l.name||'').trim())+'" target="_blank" rel="noopener noreferrer">На карте в 2ГИС</a><button class="x" type="button" data-c="locDel" data-id="'+l.id+'" aria-label="Удалить локацию">×</button></div></div>').join('');
  const body=(S.locs.length?'<div class="col">'+cards+'</div>':'<div class="empty"><b>Локаций пока нет</b>Добавьте место вручную или возьмите список из сценария.</div>')+
    '<div class="row" style="margin-top:12px"><button class="btn" type="button" data-c="locAdd">'+icon('plus')+'Добавить локацию</button>'+(S.scenes.length?'<button class="btn sec" type="button" data-c="locFromScript">'+icon('parse')+'Взять из сценария</button>':'')+'</div>';
  return head+'<div class="col">'+panel('locl','pin','Список локаций',body)+'</div>';
}

/* ---------- раскадровка ---------- */
function findFrame(id){const ids=Object.keys(S.story);for(let i=0;i<ids.length;i++){const f=S.story[ids[i]].find(x=>x.id===id);if(f)return f}return null}
function vStory(){
  const head=hd(t('Раскадровка'),'Рисуйте кадры пальцем или мышью и подписывайте их. Рисунки хранятся в вашем браузере.',S.scenes.length?'<button class="btn" type="button" data-c="sbAdd">'+icon('plus')+'Добавить кадр</button>'+dlMenu(ddi('data-c="print"','PDF через печать')):'');
  if(!S.scenes.length)return head+NEED_SCENES('Раскадровка строится по сценам — сначала разберите сценарий.');
  const sid=S.storyScene&&S.scenes.some(s=>s.id===S.storyScene)?S.storyScene:S.scenes[0].id;
  const list=S.story[sid]||[];
  const top='<div class="row noprint" style="margin-bottom:12px"><label>Сцена <select data-a="sbscene" data-r="1" style="margin-left:8px;background:var(--soft);border:1px solid var(--line);border-radius:10px;padding:9px 12px;max-width:60vw">'+sceneOpts(sid,false)+'</select></label><span class="muted" style="font-size:14px">Нажмите на кадр, чтобы рисовать на весь экран.</span></div>';
  const frames=list.length?'<div class="frames">'+list.map((f,i)=>'<div class="frame"><canvas class="sb-cv" data-id="'+f.id+'" width="1280" height="720" aria-label="Кадр '+(i+1)+'"></canvas><input data-a="sbcap" data-id="'+f.id+'" value="'+esc(f.cap||'')+'" placeholder="Кадр '+(i+1)+': что в кадре"><div class="row noprint" style="gap:6px"><button class="btn sec" type="button" data-c="sbOpen" data-id="'+f.id+'" style="padding:6px 14px;font-size:14px">'+icon('pencil')+'Рисовать</button><button class="btn sec" type="button" data-c="sbClear" data-id="'+f.id+'" style="padding:6px 12px;font-size:14px">Очистить</button><button class="x" type="button" data-c="sbDel" data-id="'+f.id+'" aria-label="Удалить кадр">×</button></div></div>').join('')+'</div>':'<div class="empty"><b>Кадров пока нет</b>Нажмите «Добавить кадр» и нарисуйте первый.</div>';
  const add='<div class="row noprint" style="margin-top:12px"><button class="btn sec" type="button" data-c="sbAdd">'+icon('plus')+'Ещё кадр</button></div>';
  return head+'<div class="col">'+panel('sbp','pencil','Кадры сцены',top+frames+add)+'</div>';
}
function paintStory(){
  $$('.sb-cv').forEach(cv=>{
    const c=cv.getContext&&cv.getContext('2d');if(!c)return;
    c.fillStyle='#fff';c.fillRect(0,0,cv.width,cv.height);
    const f=findFrame(cv.dataset.id);
    if(f&&f.img){const im=new Image();im.onload=()=>c.drawImage(im,0,0,cv.width,cv.height);im.src=f.img}
  });
}

/* ---------- шаблоны сметы ---------- */
const BT={
 etude:{n:'Короткая съёмка',days:2,lines:[['deal','bq-fx3','d',1],['deal','bq-h200','d',1],['deal','bq-ml30','d',1],['deal','bq-mke600','d',1],['deal','bq-apple','d',2],['deal','bq-magic','d',1],
   ['x',C_ACT,'Актёры (символический гонорар)','смена',15000,'d',2],['x',C_FOOD,'Питание группы (8 чел.)','смена',28000,'d',1],['x',C_LOC,'Транспорт и такси','смена',10000,'d',1],['x',C_LOC,'Локация','смена',15000,'d',1],
   ['x',C_PROP,'Реквизит и костюмы','проект',30000,'p',1],['x',C_POST,'Музыка и лицензии','проект',20000,'p',1],['x',C_LEG,'Печать документов, мелкие расходы','проект',5000,'p',1]]},
 diploma:{n:'Короткий метр',days:5,lines:[['deal','sv-bmpcc','d',1],['deal','sv-sig1835','d',1],['deal','sv-sig7020','d',1],['deal','bq-300x','d',1],['deal','bq-h600','d',1],['deal','bq-ml30','d',1],['deal','bq-mke600','d',1],['deal','bq-djimic','d',1],['deal','bq-apple','d',2],
   ['x',C_CREW,'Гаффер','смена',100000,'d',1,'прайс Yume.rent'],['x',C_CREW,'Осветитель','смена',50000,'d',1,'прайс Yume.rent'],['x',C_CREW,'Механик камеры','смена',55000,'d',1,'прайс Yume.rent'],
   ['x',C_ACT,'Актёры, гонорары','смена',30000,'d',3],['x',C_CREW,'Гримёр','смена',15000,'d',1],['x',C_FOOD,'Питание группы (12 чел.)','смена',42000,'d',1],['x',C_LOC,'Транспорт','смена',20000,'d',1],['x',C_LOC,'Локации','смена',40000,'d',1],
   ['x',C_PROP,'Реквизит и костюмы','проект',80000,'p',1],['x',C_POST,'Монтаж','проект',150000,'p',1],['x',C_POST,'Саунд-дизайн и музыка','проект',120000,'p',1],['x',C_POST,'Цветокоррекция','проект',80000,'p',1],
   ['x',C_LEG,'Страхование съёмок','проект',30000,'p',1],['x',C_MKT,'Фестивальные взносы','заявка',8000,'p',5]]},
 clip:{n:'Клип',days:2,lines:[['deal','bq-fx3','d',1],['deal','bq-h600','d',1],['deal','bq-tl60','d',1],['deal','bq-300c','d',1],['deal','bq-pocket4p','d',1],
   ['x',C_ACT,'Исполнители и танцоры','смена',20000,'d',3],['x',C_PROP,'Грим и стилист','смена',15000,'d',1],['x',C_LOC,'Локация','смена',30000,'d',1],['x',C_FOOD,'Питание группы (10 чел.)','смена',35000,'d',1],
   ['x',C_POST,'Монтаж','проект',100000,'p',1],['x',C_POST,'Цветокоррекция','проект',60000,'p',1]]}
};
function applyBT(type,days){
  const T=BT[type];if(!T)return 0;
  days=Math.max(1,Math.round(num(days)||T.days));
  const rows=[];
  T.lines.forEach(l=>{
    if(l[0]==='deal'){const d=dealById(l[1]);if(!d)return;rows.push({cat:C_TECH,name:d[1]+' ('+rentalName(d[3])+')',qty:l[2]==='d'?days*l[3]:l[3],unit:'смена',kzt:d[4],src:'прайс '+rentalName(d[3])})}
    else rows.push({cat:l[1],name:l[2],qty:l[5]==='d'?days*l[6]:l[6],unit:l[3],kzt:l[4],src:l[7]||'оценка'});
  });
  const cats={};rows.forEach(r=>{cats[r.cat]=1});
  S.budget=S.budget.filter(r=>!(cats[r.cat]&&!r.name&&!num(r.kzt)));
  rows.forEach(r=>S.budget.push(Object.assign({id:uid()},r)));
  return rows.length;
}
function budgetTplPanel(){
  const body='<div class="fields"><label>Тип проекта<select id="bt-type">'+Object.keys(BT).map(k=>'<option value="'+k+'">'+BT[k].n+'</option>').join('')+'</select></label><label>Съёмочных дней<input id="bt-days" type="number" min="1" step="1" value="'+(S.scenes.length?Math.max(1,maxDay()):2)+'"></label>'+
    '<div class="wide row"><button class="btn sec" type="button" data-c="btApply">'+icon('plus')+'Добавить строки шаблона</button><span class="muted" style="font-size:14px">Строки добавятся к смете. Ставки с пометкой «прайс» взяты у ренталов, «оценка» — ориентир.</span></div></div>';
  return panel('btpl','budget','Шаблон сметы под тип проекта',body);
}

