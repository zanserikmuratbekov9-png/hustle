/* ---------- ренталы и цены (по открытым прайсам, 10.10.2026) ---------- */
const PRICE_DATE='10.10.2026';
const RENTALS=[
  {id:'bq',name:'BQRental',url:'https://bqrental.kz/',area:'Коктем-3, 24 (ЖК Central Esentai Residence)',tags:['камеры','свет','грип','звук','дроны'],blurb:'Цены по каждой позиции открыты на сайте. Много недорогого света и мелкого грипа — удобно собрать бюджетный набор.'},
  {id:'yume',name:'yume.rent',url:'https://yume.rent/',area:'ул. Наурызбай батыра, 111 (ЖК Exclusive Life)',tags:['камеры','оптика','свет','грип','команда'],blurb:'Кинотехника и услуги команды за смену: гаффер, механик камеры, кей грип. На 2ГИС у них больше 200 оценок.'},
  {id:'svet',name:'СВЕТ Production',url:'https://svpro.kz/rental.php',area:'Ауэзовский район, мкр. 10-16-5',tags:['камеры','оптика','свет','звук','студия'],blurb:'Аренда почасовая, посуточная и долгосрочная, самовывоз или доставка по городу. Есть своя студия с циклорамой и хромакеем.'},
  {id:'raf',name:'Rent-A-Film',url:'https://rent-a-film.kz/',area:'адрес уточняйте на сайте',tags:['кинокамеры','свет'],blurb:'Кинокамеры уровня ARRI Alexa Mini LF и мощный свет — для проектов, где нужна «картинка как в кино».'},
  {id:'s33',name:'33studio Rental',url:'https://33studio.kz/rental/',area:'Алматы',tags:['кинокамеры','оптика','свет','студия'],blurb:'Камеры RED Komodo 6K и Raptor XL 8K. На странице пишут про гибкую систему скидок — спросите про условия и скидки. Страница могла устареть, сверяйтесь с менеджером.'}
];
const OTHER_RENTALS=[['Pixel rental','ул. Толе би, 176'],['Go rental','пр. Абая, 10'],['Penumbra','ул. Жантобе, 3-4а']];
const GIS_URL='https://2gis.kz/almaty/search/%D0%9F%D1%80%D0%BE%D0%BA%D0%B0%D1%82%20%D1%84%D0%BE%D1%82%D0%BE%20%D0%B8%20%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE%D1%82%D0%B5%D1%85%D0%BD%D0%B8%D0%BA%D0%B8/rubricId/110385';
// [id, название, категория, рентал, цена за смену (₸), пометка]
const DEALS=[
  ['bq-fx3','Sony FX3 Combo','Камеры','bq',32700,''],
  ['bq-300x','Aputure 300x (комплект)','Свет','bq',11000,''],
  ['bq-300c','Aputure 300C RGB (комплект)','Свет','bq',10950,''],
  ['bq-h600','Amaran Halo 600x (комплект)','Свет','bq',9900,''],
  ['bq-h200','Amaran Halo 200x (комплект)','Свет','bq',7900,''],
  ['bq-ml30','Godox ML30Bi + Spotlight MLP26K','Свет','bq',5500,''],
  ['bq-ls60','LS 60x Bi-Color LED, 2 шт.','Свет','bq',9350,''],
  ['bq-rgb6','K&F 6W RGB Video Light','Свет','bq',2000,''],
  ['bq-rf10','Smallrig RF10C (комплект)','Аксессуары','bq',2750,''],
  ['bq-apple','Apple Box 20','Аксессуары','bq',600,''],
  ['bq-magic','Magic Arm короткий','Аксессуары','bq',500,''],
  ['bq-suction','Присоска-крепление 4″ для съёмки из авто','Аксессуары','bq',5000,''],
  ['sv-bmpcc','Blackmagic Pocket Cinema Camera 6K','Камеры','svet',20000,'от'],
  ['sv-m50','Canon EOS M50 + kit','Камеры','svet',8000,'от'],
  ['sv-sig7020','Sigma 70-200 (EF)','Оптика','svet',6000,'от'],
  ['sv-sig1835','Sigma 18-35 f/1.8 Art (EF-S)','Оптика','svet',5000,'от'],
  ['sv-qt1200','Godox QT1200IIIM импульсный свет','Свет','svet',15000,'от'],
  ['sv-ad600','Godox AD600PRO','Свет','svet',10000,'от'],
  ['sv-octo','Октобокс Godox 120 см','Аксессуары','svet',4000,'от'],
  ['sv-stand','Стойка Godox 300F','Аксессуары','svet',2000,'от'],
  ['raf-alexa','ARRI Alexa Mini LF','Камеры','raf',180000,''],
  ['raf-1200d','Aputure LS 1200d Pro','Свет','raf',35000,'']
];
const DEAL_SETS=[
  {name:'Минимальный комплект',desc:'Лёгкая кинокамера, мягкий свет и светосильный зум.',ids:['sv-bmpcc','bq-ml30','sv-sig1835','sv-stand']},
  {name:'Диалог в интерьере',desc:'Камера для кино, основной свет и мягкий заполняющий.',ids:['bq-fx3','bq-300x','bq-h200','sv-octo']},
  {name:'Ночь и машина',desc:'Цветной свет, мощный контровой и крепление на авто.',ids:['bq-fx3','bq-300c','bq-h600','bq-suction']}
];
const dealById=id=>DEALS.find(d=>d[0]===id);
const rentalById=id=>RENTALS.find(r=>r.id===id);
const rentalName=id=>(rentalById(id)||{name:id}).name;
const roleName=k=>(ROLES[k]||{t:k}).t;
function sceneOpts(sel,withNone){
  let o=withNone?'<option value="">— без сцены —</option>':'';
  S.scenes.forEach(s=>{o+='<option value="'+s.id+'"'+(String(sel)===String(s.id)?' selected':'')+'>Сц. '+s.id+' — '+esc(s.type)+'. '+esc(s.loc)+(s.time?', '+esc(s.time):'')+'</option>'});
  return o;
}
const optList=(arr,sel)=>arr.map(a=>'<option'+(a===sel?' selected':'')+'>'+esc(a)+'</option>').join('');
const NEED_SCENES=(msg)=>'<div class="empty need"><span class="need-ic">'+icon('script')+'</span><b>Сначала нужен сценарий</b><span>'+msg+'</span><div class="row" style="justify-content:center;margin-top:14px"><button class="btn" type="button" data-c="tab" data-k="script">'+icon('upload')+'Загрузить сценарий</button><button class="btn sec" type="button" data-c="demo" data-k="1">Открыть пример</button></div></div>';

/* ---------- ренталы ---------- */
function rentalsCards(){
  const cards=RENTALS.filter(r=>r.id==='r8').map(r=>{
    const items=DEALS.filter(d=>d[3]===r.id).sort((a,b)=>b[4]-a[4]).slice(0,4);
    return '<article class="card"><h2>'+esc(r.name)+'</h2><div>'+r.tags.map(t=>'<span class="tag">'+esc(t)+'</span>').join('')+'</div><p>'+esc(r.blurb)+'</p><p class="muted" style="font-size:14px">'+esc(r.area)+'</p>'+
      (items.length?'<table class="mini"><tbody>'+items.map(d=>'<tr><td>'+esc(d[1])+'</td><td>'+(d[5]?d[5]+' ':'')+money(d[4])+'</td></tr>').join('')+'</tbody></table><small class="muted">'+(r.id==='r8'?'цена за сутки, по данным сайта на 12.10.2026':'цена за смену, по данным сайта на '+PRICE_DATE)+'</small>':'')+
      '<div class="row"><a class="btn" href="'+r.url+'" target="_blank" rel="noopener noreferrer">'+icon('ext')+'Открыть сайт</a><button class="btn sec" type="button" data-c="tab" data-k="deals">'+icon('tag')+'Цены и скидки</button></div><small class="muted">'+r.url.replace('https://','')+'</small></article>';
  }).join('');
  const other='<article class="card"><h2>Ещё в 2ГИС</h2><p>Ещё несколько ренталов фото- и видеотехники в Алматы. Сайты и прайсы я не проверял — смотрите карточки в 2ГИС.</p><table class="mini"><tbody>'+OTHER_RENTALS.map(o=>'<tr><td>'+esc(o[0])+'</td><td>'+esc(o[1])+'</td></tr>').join('')+'</tbody></table><div class="row"><a class="btn sec" href="'+GIS_URL+'" target="_blank" rel="noopener noreferrer">'+icon('ext')+'Открыть список в 2ГИС</a></div></article>';
  return '<header class="head"><div class="slate"></div><h1>Ренталы Алматы</h1><p>Где взять технику для съёмки. Выбраны ренталы с открытыми ценами или контактами. Сравните условия и уточняйте цены у менеджеров.</p></header>'+
    '<div class="cards">'+cards+'</div>';
}

/* ---------- скидки ---------- */
function msgText(){
  const m=S.msg||{};
  const what=(m.what&&m.what.trim())||(S.gear.length?S.gear.map(g=>g.name).join(', '):'[список техники]');
  return 'Здравствуйте! Пишу от '+((m.uni&&m.uni.trim())||'[проект или компания]')+', готовлю съёмки. Хочу арендовать: '+what+' на '+((m.when&&m.when.trim())||'[даты и количество смен]')+'.\nПодскажите, пожалуйста, есть ли скидка или пакетная цена при аренде на несколько смен? Готовы оставить залог. Спасибо!';
}
function paintMsg(){const el=$('#msg-out');if(el)el.value=msgText()}
function dealsBody(){
  S.msg=S.msg||{};
  const cats=['Все','Камеры','Свет','Звук','Аксессуары'];
  const chips='<div class="chips" role="group" aria-label="Категория">'+cats.map(c=>'<button class="chip" type="button" data-c="dealcat" data-k="'+c+'" aria-pressed="'+(S.dealCat===c)+'">'+c+'</button>').join('')+'</div>';
  const rows=DEALS.filter(d=>d[3]==='r8'&&(S.dealCat==='Все'||d[2]===S.dealCat)).sort((a,b)=>a[4]-b[4]).map(d=>{
    const r=rentalById(d[3]);
    return '<tr><td><b>'+esc(d[1])+'</b><small class="src">'+esc(d[2])+'</small></td><td>'+esc(r.name)+'</td><td class="r">'+(d[5]?d[5]+' ':'')+money(d[4])+'</td><td class="r">'+(S.disc>0?'<b>'+money(d[4]*(1-S.disc/100))+'</b>':'<span class="muted">—</span>')+'</td>'+
      '<td class="r" style="width:150px"><button class="btn sec" type="button" data-c="gearAdd" data-id="'+d[0]+'" style="padding:7px 12px">'+icon('plus')+'В список</button></td></tr>';
  }).join('');
  const table=chips+'<div class="tw" style="margin-top:10px"><table class="grid"><thead><tr><th>Позиция</th><th>Рентал</th><th class="r">Цена за сутки</th><th class="r">С вашей скидкой</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<p class="muted" style="font-size:14px;margin:10px 0 0">Цены Rental8 за сутки, по данным сайта на 12.10.2026. Условия, залог и комплектацию уточняйте у рентала.</p>';
  const sets=DEAL_SETS.map(st=>{
    const items=st.ids.map(dealById),sum=items.reduce((a,d)=>a+d[4],0);
    return '<article class="card"><h2>'+esc(st.name)+'</h2><p>'+esc(st.desc)+'</p><table class="mini"><tbody>'+items.map(d=>'<tr><td>'+esc(d[1])+'<small class="src" style="padding:0">'+esc(rentalName(d[3]))+'</small></td><td>'+money(d[4])+'</td></tr>').join('')+'</tbody></table><p><b>Итого за смену: '+money(sum)+'</b>'+(S.disc>0?'<br><span class="pill">со скидкой '+money(sum*(1-S.disc/100))+'</span>':'')+'</p><div class="row"><button class="btn" type="button" data-c="setAdd" data-k="'+DEAL_SETS.indexOf(st)+'">'+icon('plus')+'Добавить набор</button></div></article>';
  }).join('');
  const disc='<div class="row"><label>Моя скидка, %<input type="number" min="0" max="90" step="1" data-a="disc" data-r="1" value="'+esc(S.disc)+'" style="width:90px;margin-left:8px;background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:9px 10px"></label><span class="muted" style="font-size:14px">Впишите скидку, которую согласовал рентал, — цены ниже пересчитаются.</span></div>';
  const tips='<ul style="margin:0;padding-left:22px"><li>Просите цену за пакет и за несколько смен подряд — так чаще идут навстречу.</li><li>Сначала спросите про скидку и условия залога.</li><li>Беря всё в одном месте, вы экономите на доставке и можете договориться о цене за комплект.</li><li>Перед выдачей проверьте комплектацию: аккумуляторы, карты, кабели, чехлы — и сфотографируйте состояние техники.</li><li>Уточните залог и условия отмены заранее.</li></ul>';
  const msg='<div class="fields"><label>Проект или компания<input data-a="msg" data-f="uni" value="'+esc(S.msg.uni||'')+'" placeholder="Например, КазНУ, Каз НАИ, Нархоз"></label><label>Когда и на сколько<input data-a="msg" data-f="when" value="'+esc(S.msg.when||'')+'" placeholder="Например, 14–16 ноября, 3 смены"></label><label class="wide">Что арендуете (пусто — возьмётся список оборудования)<input data-a="msg" data-f="what" value="'+esc(S.msg.what||'')+'" placeholder="Sony FX3, Aputure 300x…"></label>'+
    '<label class="wide">Готовое сообщение<textarea id="msg-out" rows="5" readonly>'+esc(msgText())+'</textarea></label><div class="wide row"><button class="btn" type="button" data-c="msgCopy">'+icon('copy')+'Скопировать сообщение</button></div></div>';
  return '<header class="head"><div class="slate"></div><h1>Скидки и цены</h1><p>Позиции из открытых прайсов ренталов Алматы — от дешёвых к дорогим. Подтверждённых акций пока нет, поэтому ниже готовое письмо: попросите скидку у рентала сами.</p></header>'+
    '<div class="col">'+panel('dprice','tag','Цены Rental8',disc+'<div style="height:12px"></div>'+table)+
    
    panel('dmsg','note','Попросить скидку',msg)+panel('dtips','check','Как договориться о цене',tips)+'</div>';
}

/* ---------- оборудование ---------- */
function gearUpdate(){
  S.gear.forEach(g=>{setText('[data-gt="'+g.id+'"]',money(num(g.kzt)*num(g.qty)*num(g.days)))});
  const raw=S.gear.reduce((a,g)=>a+num(g.kzt)*num(g.qty)*num(g.days),0);
  setText('#g-raw',money(raw));setText('#g-total',money(raw*(1-num(S.disc)/100)));
}
function gearBody(){
  const head='<header class="head"><div class="slate"></div><h1>Оборудование</h1><p>Список техники на съёмку: цены, количество и смены. Добавляйте позиции из раздела «Скидки» или вписывайте свои, а потом отправляйте в смету.</p></header>';
  if(!S.gear.length)return head+'<div class="empty"><b>Список пока пуст</b>Добавьте технику из прайсов или впишите свою позицию.<br><br><button class="btn" type="button" data-c="tab" data-k="deals">'+icon('tag')+'Открыть скидки</button> <button class="btn sec" type="button" data-c="gearAddRow">'+icon('plus')+'Своя позиция</button></div>';
  const rows=S.gear.map(g=>'<tr><td><input data-a="gear" data-id="'+g.id+'" data-f="name" value="'+esc(g.name)+'" aria-label="Позиция">'+(g.src?'<small class="src m">'+esc(g.src)+'</small>':'')+(g.sent?'<small class="src">уже в смете</small>':'')+'</td>'+
    '<td style="width:150px"><input data-a="gear" data-id="'+g.id+'" data-f="rental" value="'+esc(g.rental)+'" aria-label="Рентал"></td>'+
    '<td style="width:120px"><input class="n" type="number" min="0" step="any" data-a="gear" data-id="'+g.id+'" data-f="rate" value="'+fmtIn(g.kzt)+'" aria-label="Цена за смену"></td>'+
    '<td style="width:80px"><input class="n" type="number" min="0" step="1" data-a="gear" data-id="'+g.id+'" data-f="qty" value="'+esc(g.qty)+'" aria-label="Количество"></td>'+
    '<td style="width:80px"><input class="n" type="number" min="0" step="1" data-a="gear" data-id="'+g.id+'" data-f="days" value="'+esc(g.days)+'" aria-label="Смен"></td>'+
    '<td class="r" style="width:130px" data-gt="'+g.id+'"></td><td style="width:44px"><button class="x" type="button" data-c="gearDel" data-id="'+g.id+'" aria-label="Удалить позицию">×</button></td></tr>').join('');
  const table='<div class="tw"><table class="grid"><thead><tr><th>Позиция</th><th>Рентал</th><th>Цена за смену</th><th>Шт.</th><th>Смен</th><th class="r">Сумма</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<div class="line"><span>Без скидки</span><b id="g-raw"></b></div><div class="line"><span class="pct">Скидка рентала <input type="number" min="0" max="90" data-a="disc" data-r="1" value="'+esc(S.disc)+'" aria-label="Скидка, %">%</span><span></span></div><div class="total"><span>К оплате за аренду</span><b id="g-total"></b></div>'+
    '<div class="row noprint"><button class="btn sec" type="button" data-c="gearAddRow">'+icon('plus')+'Своя позиция</button><button class="btn" type="button" data-c="gearToBudget">'+icon('budget')+'Отправить в смету</button><button class="btn sec" type="button" data-c="gearCopy">'+icon('copy')+'Скопировать список</button><button class="btn sec" type="button" data-c="gearClear">Очистить</button></div>';
  return head+'<div class="col">'+panel('glist','camera','Список техники',table)+'</div>';
}

/* ---------- задачи ---------- */
const TASK_SEED={
  producer:['Утвердить смету с командой','Забронировать технику в рентале','Согласовать локации и разрешения','Подписать договоры с актёрами','Разослать вызывной лист'],
  director:['Доработать финал сценария','Провести пробы и утвердить актёров','Написать режиссёрскую экспликацию','Репетиция с актёрами','Согласовать шот-лист с оператором'],
  operator:['Сделать светосхемы по сценам','Составить список оборудования','Тест камеры и оптики перед съёмкой','Проверить карты памяти и аккумуляторы','Тест-съёмка на локации']
};
const ST_NAMES={todo:'Сделать',doing:'В работе',done:'Готово'};
function taskCard(t){
  return '<div class="tcard"><div class="row" style="gap:6px"><span class="tag">'+esc(roleName(t.role))+'</span>'+(t.scene?'<span class="tag">Сц. '+esc(t.scene)+'</span>':'')+'</div><p style="margin:6px 0">'+esc(t.text)+'</p><div class="row" style="gap:4px">'+
    (t.status!=='todo'?'<button class="x" type="button" data-c="taskMove" data-id="'+t.id+'" data-d="-1" aria-label="Вернуть назад">◀</button>':'')+
    (t.status!=='done'?'<button class="x" type="button" data-c="taskMove" data-id="'+t.id+'" data-d="1" aria-label="Двигать дальше">▶</button>':'')+
    '<button class="x" type="button" data-c="taskDel" data-id="'+t.id+'" aria-label="Удалить задачу">×</button></div></div>';
}
function vTasks(){
  const my=S.tasksAll?S.tasks:S.tasks.filter(t=>t.role===S.role);
  const col=st=>{const it=my.filter(t=>t.status===st);return '<div class="bcol"><h3 style="margin:0">'+ST_NAMES[st]+' <span class="muted">'+it.length+'</span></h3>'+(it.length?it.map(taskCard).join(''):'<p class="muted" style="margin:0;font-size:14px">Пока пусто</p>')+'</div>'};
  const add='<div class="fields"><label class="wide">Новая задача<input id="tk-text" placeholder="Например, согласовать референсы с оператором"></label>'+
    '<label>Для кого<select id="tk-role">'+Object.keys(ROLES).map(k=>'<option value="'+k+'"'+(k===S.role?' selected':'')+'>'+ROLES[k].t+'</option>').join('')+'</select></label>'+
    '<label>Сцена<select id="tk-scene">'+sceneOpts('',true)+'</select></label>'+
    '<div class="wide row"><button class="btn" type="button" data-c="taskAdd">'+icon('plus')+'Добавить задачу</button><button class="btn sec" type="button" data-c="taskSeed">Добавить типовые задачи роли</button>'+
    '<button class="chip" type="button" data-c="taskFilter" aria-pressed="'+!!S.tasksAll+'">Все роли</button></div></div>';
  return '<header class="head"><div class="slate"></div><h1>Задачи</h1><p>Общая доска команды: двигайте карточки от «Сделать» до «Готово», все видят, кто чем занят.</p></header>'+
    '<div class="col">'+panel('tadd','plus','Добавить',add)+'<div class="board">'+col('todo')+col('doing')+col('done')+'</div></div>';
}

