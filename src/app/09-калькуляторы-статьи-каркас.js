/* ---------- калькуляторы оператора ---------- */
function vCalc(){
  const f=(k,l,step)=>'<label>'+l+'<input type="number" step="'+(step||'any')+'" min="0" data-a="calc" data-f="'+k+'" value="'+esc(S.calc[k])+'"></label>';
  const card=(ic,title,inputs,out)=>'<article class="card"><h2>'+icon(ic)+' '+title+'</h2><div class="fields" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">'+inputs+'</div>'+out+'</article>';
  return '<header class="head"><div class="slate"></div><h1>Калькуляторы</h1><p>Быстрые расчёты для площадки: выдержка, ND-фильтры, объём памяти и потеря света с расстоянием. Результат обновляется сразу.</p></header>'+
    '<div class="calcs">'+
    card('camera','Выдержка по углу затвора',f('fps','Кадров в секунду')+f('angle','Угол затвора, °'),'<p class="res" id="c-shutter"></p><small class="muted">Классика для кино: 180° даёт выдержку вдвое длиннее кадра.</small>')+
    card('bulb','ND-фильтр',f('ndFrom','Диафрагма сейчас, f/')+f('ndTo','Нужная диафрагма, f/'),'<p class="res" id="c-nd"></p><small class="muted" id="c-nd2"></small>')+
    card('download','Объём памяти',f('mbps','Скорость записи, Мбит/с')+f('mins','Минут съёмки')+f('card','Размер карты, ГБ'),'<p class="res" id="c-mem"></p><small class="muted" id="c-mem2"></small>')+
    card('bulb','Свет и расстояние',f('d1','Было, м')+f('d2','Стало, м'),'<p class="res" id="c-dist"></p><small class="muted">Свет падает по закону обратных квадратов: вдвое дальше — на 2 стопа темнее.</small>')+
    '</div>';
}
const fnum=(n,d)=>(Math.round(n*Math.pow(10,d))/Math.pow(10,d)).toLocaleString('ru-RU');
function calcUpdate(){
  const c=S.calc,fps=num(c.fps)||24,ang=num(c.angle)||180,sh=ang/(360*fps);
  setText('#c-shutter','1/'+Math.round(1/sh)+' с');
  const a=num(c.ndFrom),b=num(c.ndTo);
  const stops=(a>0&&b>0)?2*Math.log2(a/b):0;
  const ND=[[0.3,1],[0.6,2],[0.9,3],[1.2,4],[1.5,5],[1.8,6],[2.1,7],[2.4,8],[3.0,10]];
  let best=ND[0];ND.forEach(n=>{if(Math.abs(n[1]-stops)<Math.abs(best[1]-stops))best=n});
  if(stops<=0.2){setText('#c-nd','ND не нужен');setText('#c-nd2','Нужная диафрагма не открытее текущей: света и так хватает.')}
  else{setText('#c-nd','ND '+best[0].toFixed(1)+' ('+best[1]+' ст.)');setText('#c-nd2','Чтобы открыть диафрагму с f/'+fnum(a,1)+' до f/'+fnum(b,1)+', нужно убрать около '+fnum(stops,1)+' стопа света.')}
  const gb=num(c.mbps)/8*60*num(c.mins)/1000,cards=num(c.card)>0?Math.ceil(gb/num(c.card)):0;
  setText('#c-mem',fnum(gb,1)+' ГБ');setText('#c-mem2',cards?'Понадобится карт по '+fnum(num(c.card),0)+' ГБ: '+cards+' шт. Берите запас.':'Укажите размер карты.');
  const d1=num(c.d1),d2=num(c.d2);
  if(d1>0&&d2>0){const st=2*Math.log2(d2/d1);setText('#c-dist',(st>=0?'−':'+')+fnum(Math.abs(st),1)+' стопа')}else setText('#c-dist','—');
}

/* ---------- ссылки на конкретные позиции и дополнительные цены (BQRental, 10.10.2026) ---------- */
DEALS.push(
  ['bq-sig1850','Sigma 18-50 mm f/2.8 DC DN (Sony E)','Оптика','bq',6950,''],
  ['bq-djimic','DJI Mic mini 2 (3,5 мм)','Звук','bq',3000,''],
  ['bq-mke600','Sennheiser MKE 600','Звук','bq',4800,''],
  ['bq-tl60','Godox TL60 RGB, комплект из двух','Свет','bq',7950,''],
  ['bq-pocket4p','DJI Osmo Pocket 4P','Камеры','bq',14900,'']
);
RENTALS.push({id:'r8',name:'Rental8',url:'https://www.rental8.kz/',area:'пр. Гагарина, 124 (ЖК Дом на Абая, 4 этаж), ежедневно 09:00–23:30',tags:['камеры','свет','звук','дроны'],blurb:'Больше 100 позиций: камеры Sony, объективы Sigma, свет Aputure, дроны DJI, микрофоны Rode. Есть готовые комплекты, цена указана за сутки и за 8 часов, за заказ начисляют 5% бонусов.'});
DEALS.push(
  ['r8-fx3','Sony FX3 (комплект)','Камеры','r8',28000,''],
  ['r8-a7c','Sony Alpha A7C (комплект)','Камеры','r8',13000,''],
  ['r8-ls600','Aputure LS 600x Pro Lamp Head','Свет','r8',18000,''],
  ['r8-amaran60','Комплект свет Amaran 60x','Свет','r8',8000,''],
  ['r8-podcast','Комплект подкаст на 2 персоны','Звук','r8',19000,''],
  ['r8-gopro','GoPro HERO11 Black (комплект)','Камеры','r8',10000,''],
  ['r8-sm7b','Shure SM7B (комплект)','Звук','r8',7500,''],
  ['r8-xt3','Fujifilm X-T3 (комплект)','Камеры','r8',7000,''],
  ['r8-tele','Комплект телесуфлер','Аксессуары','r8',7000,''],
  ['r8-visico','Фотофон Visico 2x3 м многоцветный','Аксессуары','r8',10000,'']
);
const DEAL_URL={
  'bq-fx3':'https://bqrental.kz/komplekty/sony-fx-3-combo/','bq-300x':'https://bqrental.kz/komplekty/aputure-300x-set/',
  'bq-300c':'https://bqrental.kz/komplekty/aputure-300s-rgb-set/','bq-h600':'https://bqrental.kz/komplekty/amaran-halo-600x-combo/',
  'bq-h200':'https://bqrental.kz/komplekty/amaran-halo-200x-set/','bq-ml30':'https://bqrental.kz/komplekty/godox-ml30bi-spotlight-mlp26k-full-complect/',
  'bq-ls60':'https://bqrental.kz/komplekty/ls-60x-bi-color-led-light-2-sht/','bq-rgb6':'https://bqrental.kz/svet/6w-rgb-video-light-k-f/',
  'bq-rf10':'https://bqrental.kz/komplekty/smallrig-rf10c-set/','bq-apple':'https://bqrental.kz/stabilizaciya/apple-box-20/',
  'bq-magic':'https://bqrental.kz/stabilizaciya/magic-arm-korotkij/','bq-suction':'https://bqrental.kz/stabilizaciya/4-suction-cup-camera-mount-kit-for-vehicle-shooting/',
  'bq-sig1850':'https://bqrental.kz/obektivy/obektiv-sigma-18-50mm-f-2-8-dc-dn-dlya-sony-e/','bq-djimic':'https://bqrental.kz/zvuk/dji-mic-mini-2-3-5mm-jack/',
  'bq-mke600':'https://bqrental.kz/zvuk/sennheiser-mke-600/','bq-tl60':'https://bqrental.kz/komplekty/duo-komplekt-godox-tl60-rgb/',
  'bq-pocket4p':'https://bqrental.kz/kamery/dji-osmo-pocket-4p/'
};
const dealUrl=d=>DEAL_URL[d[0]]||(rentalById(d[3])||{url:'#'}).url;

/* ---------- статьи ---------- */
/* ---------- ренталы: одна страница с подразделами ---------- */
const stripHead=h=>h.replace(/<header class="head">[\s\S]*?<\/header>/,'');
function rental8Card(){
  const r=RENTALS.find(x=>x.id==='r8');
  const items=['r8-fx3','r8-a7c','r8-ls600','r8-amaran60'].map(dealById).filter(Boolean);
  return '<article class="card"><h2>Rental8</h2><p>Аренда кино- и фототехники в Алматы: камеры Sony, свет Aputure, объективы, звук, дроны. Готовые комплекты под съёмку.</p>'+
    (items.length?'<table class="mini"><tbody>'+items.map(d=>'<tr><td>'+esc(d[1])+'</td><td>'+money(d[4])+' / сутки</td></tr>').join('')+'</tbody></table>':'')+
    '<p class="muted" style="font-size:14px">'+esc(r.area)+'</p><div class="row"><a class="btn" href="'+r.url+'" target="_blank" rel="noopener noreferrer">'+icon('ext')+'Открыть сайт Rental8</a></div></article>';
}
function vRentalsPage(){
  return '<header class="head"><div class="slate"></div><h1>Rental8</h1><p>Партнёр HUSTLE: техника для ваших съёмок.</p></header><div class="cards">'+rental8Card()+'</div>';
}

/* ---------- каркас ---------- */
const ROLES={producer:{t:'Продюсер',i:'briefcase'},director:{t:'Режиссёр',i:'megaphone'},operator:{t:'Оператор',i:'camera'}};
const TAB_DEF={
  home:['Главная','Новости и акции','home'],proj:['Обзор проекта','Шаги и прогресс','briefcase'],script:['Сценарий','Текст, загрузка, разбор','script'],
  schedule:['План съёмок','Сцены по дням','schedule'],budget:['Смета','Бюджет по статьям','budget'],today:['Съёмочный день','Для площадки','camera'],callsheet:['Вызывной лист','Документ на день','callsheet'],
  rentals:['Ренталы','Техника и скидки','store'],deals:['Скидки и цены','Прайсы ренталов','tag'],gear:['Список техники','Что берём в аренду','camera'],
  tasks:['Задачи','Что сделать по роли','check'],
  notes:['Заметки по сценам','Что доработать','note'],explic:['Экспликация','Видение режиссёра','megaphone'],shots:['Шот-лист','Кадры по сценам','frame'],
  kpp:['КПП','Календарно-постановочный план','schedule'],
  lights:['Светосхема','План света по сцене','bulb'],calc:['Калькуляторы','Выдержка, ND, память','calc']
};
const NAV={
  producer:[['Главное',['home','rentals']],['Мой проект',['proj','script','schedule','budget','callsheet','kpp']]],
  director:[['Главное',['home','rentals']],['Мой проект',['proj','script','notes','explic','shots','kpp']]],
  operator:[['Главное',['home','rentals']],['Мой проект',['proj','lights','shots','calc','script']]]
};
const ROLE_TABS={};Object.keys(NAV).forEach(r=>{ROLE_TABS[r]=[].concat.apply([],NAV[r].map(g=>g[1]))});
/* ========== v4: новая структура сайта ========== */
Object.assign(IC,{
 users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14.5c2.4 0 4 1.8 4 4.5"/>',
 pin:'<path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
 file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
 eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 pencil:'<path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16z"/><path d="M14 7l3 3"/>',
 grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
 trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6"/>',
 book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/>'
});
Object.assign(TAB_DEF,{
 breakdown:['Разбивка по элементам','Реквизит, костюмы, грим','grid'],locations:['Локации','Места и разрешения','pin'],docs:['Документы','Договоры и акты','file'],
 story:['Раскадровка','Рисунки кадров','pencil'],events:['Фестивали и гранты','Куда подать фильм','trophy'],school:['Школа','Статьи и словарь','book']
});

/* ---------- копия проекта: экспорт, проверка и безопасный импорт ---------- */
const MAX_IMPORT=6*1024*1024;
const PROJ_VERSION=3;
const PROJ_FORMATS=['hustle-project','student-project'];
function hasData(){
  if(!S)return false;
  return !!(S.script.trim()||S.scenes.length||S.gear.length||S.tasks.length||S.shots.length||S.locs.length||
    S.budget.some(r=>r.name||num(r.kzt)>0)||Object.keys(S.story).some(k=>S.story[k].length)||
    Object.keys(S.light).some(k=>S.light[k].items&&S.light[k].items.length)||Object.keys(S.notes).length||
    Object.keys(S.explic).some(k=>(S.explic[k]||'').trim()));
}
function backupBanner(){
  const bad=SAVE_OK===false;
  if(CLOUD&&!bad)return '';
  if(!hasData()&&!bad)return '';
  if(!bad&&S.bnDismiss&&Date.now()-S.bnDismiss<3*864e5)return '';
  const when=S.lastExport?'Последняя копия в файле: '+new Date(S.lastExport).toLocaleDateString('ru-RU'):'Копии в файле пока нет';
  return '<div class="note noprint" role="status"><b>'+(bad?(CLOUD?'Изменения пока не ушли в облако.':'Данные не сохраняются.'):'Данные хранятся только в этом браузере.')+'</b> Очистка браузера или смена устройства удалят проект. '+when+'.<div class="row" style="margin-top:8px"><button class="btn sec" type="button" data-c="exportProj">'+icon('download')+'Сохранить проект в файл</button>'+(bad?'':'<button class="link" type="button" data-c="bnClose">Напомнить позже</button>')+'</div></div>';
}
function exportEnvelope(){
  const d=JSON.parse(JSON.stringify(S));
  return {format:'hustle-project',version:PROJ_VERSION,app:'HUSTLE',exportedAt:new Date().toISOString(),data:d};
}
async function exportProject(){
  const ok=await saveFile('hustle-project-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(exportEnvelope(),null,1),'application/json');
  if(ok){S.lastExport=Date.now();save();if(['home','proj','budget'].indexOf(S.tab)>-1)render()}
  return ok;
}
function validateProject(raw){
  const errs=[],bad=m=>{if(errs.length<6)errs.push(m)};
  const isObj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
  const str=(v,max)=>typeof v==='string'&&v.length<=(max||2000);
  const numish=(v,min,max)=>{
    const n=typeof v==='number'?v:(typeof v==='string'&&/^\s*-?\d+([.,]\d+)?\s*$/.test(v)?parseFloat(v.replace(',','.')):NaN);
    return isFinite(n)&&n>=(min===undefined?-1e15:min)&&n<=(max===undefined?1e15:max);
  };
  const int=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
  const inl=(v,list)=>list.indexOf(v)>-1;
  const arr=(v,max)=>Array.isArray(v)&&v.length<=max;
  const has=(o,k)=>o[k]!==undefined;
  if(!isObj(raw)){bad('файл не содержит проект');return {ok:false,errors:errs}}
  let d=raw;
  if(PROJ_FORMATS.indexOf(raw.format)>-1){
    if(raw.version!==PROJ_VERSION)bad('версия файла '+raw.version+' не поддерживается (нужна '+PROJ_VERSION+')');
    d=raw.data;
  }else if(raw.v!==2)bad('это не файл проекта HUSTLE или у него неизвестная версия');
  if(!isObj(d)){bad('в файле нет данных проекта');return {ok:false,errors:errs}}
  if(has(d,'v')&&d.v!==2)bad('внутренняя версия данных '+d.v+' не поддерживается');
  if(!arr(d.budget,2000))bad('смета: ожидается список строк, не больше 2000');
  else d.budget.forEach((r,i)=>{
    if(!isObj(r)||!str(r.cat,100)||!str(r.name,300)||!numish(r.qty,0,1e7)||!numish(r.kzt,0,1e12)||(has(r,'fact')&&!numish(r.fact,0,1e12))||(has(r,'unit')&&!str(r.unit,40)))
      bad('смета: строка '+(i+1)+' повреждена или содержит отрицательные значения');
  });
  if(has(d,'name')&&!str(d.name,200))bad('название проекта должно быть текстом до 200 символов');
  if(has(d,'cur')&&!inl(d.cur,['₸','$','€','₽']))bad('неизвестная валюта: '+String(d.cur).slice(0,10));
  if(has(d,'role')&&!ROLES[d.role])bad('неизвестная роль: '+String(d.role).slice(0,20));
  if(has(d,'tab')&&!(inl(d.tab,PAGE_IDS)||inl(d.tab,['deals','gear'])))bad('неизвестная страница: '+String(d.tab).slice(0,20));
  ['contPct','feePct','taxPct'].forEach(k=>{if(has(d,k)&&!numish(d[k],0,100))bad('«'+k+'» должно быть числом от 0 до 100')});
  if(has(d,'script')&&!str(d.script,600000))bad('текст сценария слишком длинный или не текст');
  if(has(d,'perDay')&&!numish(d.perDay,0.01,50))bad('норма страниц в смену должна быть числом от 0,01 до 50');
  if(has(d,'scenes')){
    if(!arr(d.scenes,1000))bad('сцены: ожидается список, не больше 1000');
    else d.scenes.forEach((s,i)=>{if(!isObj(s)||!int(s.id,1,100000)||!inl(s.type,['ИНТ','НАТ','ИНТ/НАТ'])||!str(s.loc,300)||!str(s.time,100)||!arr(s.chars,60)||!s.chars.every(c=>str(c,100))||!int(s.e,1,5000))bad('сцены: сцена '+(i+1)+' повреждена')});
  }
  if(has(d,'assign')){
    if(!isObj(d.assign)||!Object.keys(d.assign).every(k=>int(d.assign[k],1,500)))bad('план съёмок: номера дней должны быть целыми числами от 1 до 500');
  }
  if(has(d,'tasks')){
    if(!arr(d.tasks,2000)||!d.tasks.every(x=>isObj(x)&&str(x.id,40)&&str(x.text,1000)&&ROLES[x.role]&&inl(x.status,['todo','doing','done'])))bad('задачи: список повреждён');
  }
  if(has(d,'shots')){
    if(!arr(d.shots,5000)||!d.shots.every(x=>isObj(x)&&str(x.id,40)&&str(String(x.desc===undefined?'':x.desc),2000)&&numish(x.mm===undefined?35:x.mm,1,2000)))bad('шот-лист: список повреждён');
  }
  if(has(d,'gear')){
    if(!arr(d.gear,1000)||!d.gear.every(g=>isObj(g)&&str(g.name,300)&&numish(g.kzt,0,1e12)&&numish(g.qty,0,10000)&&numish(g.days,0,1000)))bad('список техники: данные повреждены или отрицательные');
  }
  if(has(d,'locs')){
    if(!arr(d.locs,1000)||!d.locs.every(l=>isObj(l)&&str(l.name,300)&&str(l.addr||'',500)&&inl(l.status,LOC_ST)))bad('локации: список повреждён');
  }
  if(has(d,'notes')){
    if(!isObj(d.notes)||!Object.keys(d.notes).every(k=>isObj(d.notes[k])&&str(d.notes[k].text||'',5000)&&inl(d.notes[k].status||'draft',['draft','fix','ok'])))bad('заметки по сценам: данные повреждены');
  }
  if(has(d,'explic')){
    if(!isObj(d.explic)||!Object.keys(d.explic).every(k=>str(d.explic[k],10000)))bad('экспликация: данные повреждены');
  }
  if(has(d,'light')){
    if(!isObj(d.light)||!Object.keys(d.light).every(k=>isObj(d.light[k])&&arr(d.light[k].items||[],300)&&(d.light[k].items||[]).every(it=>isObj(it)&&str(it.id,40)&&LT_DEF[it.type]&&numish(it.x,-100,900)&&numish(it.y,-100,620)&&numish(it.rot===undefined?0:it.rot,-3600,3600))))bad('светосхема: данные повреждены');
  }
  if(has(d,'story')){
    if(!isObj(d.story)||!Object.keys(d.story).every(k=>arr(d.story[k],40)&&d.story[k].every(f=>isObj(f)&&str(f.id,40)&&str(f.cap||'',500)&&(!f.img||(typeof f.img==='string'&&f.img.indexOf('data:image/png;base64,')===0&&f.img.length<1.2e6)))))bad('раскадровка: данные повреждены или рисунок не в формате PNG');
  }
  if(has(d,'bd')){
    if(!isObj(d.bd)||!Object.keys(d.bd).every(k=>isObj(d.bd[k])&&Object.keys(d.bd[k]).every(f=>str(d.bd[k][f],3000))))bad('разбивка по элементам: данные повреждены');
  }
  if(has(d,'doc')){
    if(!isObj(d.doc)||!inl(d.doc.type,Object.keys(DOC_FIELDS))||!isObj(d.doc.vals||{})||(d.doc.custom!==undefined&&(!isObj(d.doc.custom)||!Object.keys(d.doc.custom).every(k=>inl(k,Object.keys(DOC_FIELDS))&&str(d.doc.custom[k],60000)))))bad('документы: данные повреждены');
  }
  if(has(d,'posters')){
    if(!arr(d.posters,200)||!d.posters.every(p=>isObj(p)&&str(p.id,40)&&str(p.rental,200)&&str(p.title,300)&&str(p.price,100)&&(!p.url||/^https?:\/\//i.test(p.url))))bad('постеры: данные повреждены или ссылка не http(s)');
  }
  if(has(d,'rates')){
    if(!isObj(d.rates)||!['USD','EUR','RUB'].every(k=>numish(d.rates[k],0.0001,1e6)))bad('курсы валют должны быть положительными числами');
  }
  if(has(d,'heroImg')&&!(d.heroImg===''||(typeof d.heroImg==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(d.heroImg)&&d.heroImg.length<1.6e6)))bad('фото в шапке: допускаются JPG, PNG или WebP до 1,2 МБ');
  if(has(d,'city')&&!CITIES[d.city])bad('неизвестный город: '+String(d.city).slice(0,30));
  if(has(d,'rtab')&&!inl(d.rtab,['deals','places','list']))bad('неизвестный подраздел ренталов');
  return {ok:errs.length===0,errors:errs,data:d};
}
let DLG=null;
function showDialog(o){
  DLG=o;const el=$('#onb');if(!el)return;
  el.hidden=false;
  el.innerHTML='<div class="onb-card" role="dialog" aria-modal="true" aria-labelledby="dlg-h"><h2 id="dlg-h">'+esc(o.title)+'</h2><p>'+esc(o.text)+'</p>'+(o.list&&o.list.length?'<ul>'+o.list.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+
    '<div class="row">'+o.actions.map((a,i)=>'<button class="btn'+(a.sec?' sec':'')+'" type="button" data-c="dlg" data-i="'+i+'">'+esc(a.label)+'</button>').join('')+'</div></div>';
}
function closeDialog(){DLG=null;showOnb()}
function importFromInput(t){
  const f=t.files&&t.files[0];t.value='';
  if(!f)return;
  const ok=[{label:'Понятно',sec:true}];
  if(f.size>MAX_IMPORT){showDialog({title:'Файл слишком большой',text:'Максимальный размер файла проекта — 6 МБ. Текущий проект не изменён.',actions:ok});return}
  f.arrayBuffer().then(buf=>{
    let raw;
    try{raw=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buf))}
    catch(e){showDialog({title:'Не удалось открыть файл',text:'Файл не похож на проект HUSTLE: это не корректный JSON. Текущий проект не изменён.',actions:ok});return}
    const v=validateProject(raw);
    if(!v.ok){showDialog({title:'Файл не прошёл проверку',text:'Текущий проект не изменён. Что не так:',list:v.errors,actions:ok});return}
    const data=v.data;
    if(!hasData()){applyImport(data);return}
    showDialog({title:'Заменить текущий проект?',text:'Файл «'+String(data.name||'без названия')+'» заменит проект «'+S.name+'». Сначала можно сохранить копию текущего.',actions:[
      {label:'Сохранить копию и открыть',run:async()=>{if(await exportProject())applyImport(data)}},
      {label:'Открыть без копии',sec:true,run:()=>applyImport(data)},
      {label:'Отмена',sec:true}]});
  }).catch(()=>toast('Не удалось прочитать файл'));
}
function applyImport(data){
  let d;
  try{d=normalize(JSON.parse(JSON.stringify(data)))}catch(e){toast('Не удалось применить файл');return}
  S=d;S.onboarded=true;save();closeMenus();render();toast('Проект открыт: '+S.name);
}

