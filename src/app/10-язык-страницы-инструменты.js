/* ---------- язык (казахский: основные разделы) ---------- */
const KK={
 'Главная':'Басты бет','Проект':'Жоба','Ренталы':'Жалға беру','Фестивали и гранты':'Фестивальдар мен гранттар','Школа':'Мектеп','Конкурсы':'Байқаулар',
 'Продюсер':'Продюсер','Режиссёр':'Режиссёр','Оператор':'Оператор','Я работаю как':'Мен былай жұмыс істеймін','Название проекта':'Жоба атауы',
 'Для моей роли':'Менің рөлім үшін','Все инструменты':'Барлық құралдар','Следующий шаг':'Келесі қадам','Идея и текст':'Идея және мәтін','Подготовка':'Дайындық','Съёмки':'Түсіру','Команда':'Команда',
 'Сценарий':'Сценарий','Заметки по сценам':'Көріністер бойынша жазбалар','Экспликация':'Экспликация','Разбивка по элементам':'Элементтер бойынша бөлу','Локации':'Локациялар',
 'План съёмок':'Түсіру жоспары','Смета':'Смета','Документы':'Құжаттар','Шот-лист':'Кадрлар тізімі','Раскадровка':'Кадр суреттері','Светосхема':'Жарық сызбасы',
 'Калькуляторы':'Калькуляторлар','Вызывной лист':'Шақыру парағы','Задачи':'Тапсырмалар',
 'Текст, загрузка файла, разбор на сцены':'Мәтін, файл жүктеу, көріністерге бөлу','Что доработать и статус каждой сцены':'Нені жетілдіру және әр көріністің мәртебесі','Видение фильма на одной странице':'Фильм көрінісі бір бетте',
 'Реквизит, костюмы, грим, транспорт по сценам':'Көріністер бойынша реквизит, киім, грим, көлік','Места съёмок, контакты и разрешения':'Түсіру орындары, байланыс және рұқсаттар','Сцены по дням и занятость актёров':'Күндер бойынша көріністер мен актёрлер жұмысы',
 'План и факт, шаблоны, итоги':'Жоспар мен факт, үлгілер, қорытынды','Договоры, согласия, акт приёма техники':'Шарттар, келісімдер, техника қабылдау актісі','Кадры по сценам для режиссёра и оператора':'Режиссёр мен оператор үшін кадрлар',
 'Рисунки кадров с подписями':'Кадр суреттері мен жазулар','План света, камеры и актёров':'Жарық, камера және актёрлер жоспары','Выдержка, ND, память, свет':'Ұстама, ND, жад, жарық',
 'Документ на съёмочный день с рассветом и закатом':'Таң мен күннің батуы көрсетілген түсіру күніне арналған құжат','Доска задач по ролям':'Рөлдер бойынша тапсырмалар тақтасы',
 'Идея и текст ':'',  'Ренталы и скидки':'Жалға беру және жеңілдіктер','Мой проект':'Менің жобам','Цены из открытых прайсов':'Ашық прайстардағы бағалар','Кино: новости и школа':'Кино: жаңалықтар және мектеп','Продолжить':'Жалғастыру'
};
const t=s=>s;

/* ---------- страницы и инструменты ---------- */
const C_RIGHTS='Права и сценарий',C_DIR='Режиссура и творческая группа',C_ACT='Актёры',C_CREW='Съёмочная группа',C_TECH='Техника: камера, свет, звук',C_LOC='Локации и транспорт',C_PROP='Реквизит, костюмы, грим',C_FOOD='Питание и быт',C_POST='Постпродакшн',C_LEG='Юридические расходы и страховка',C_MKT='Маркетинг и фестивали';
const TOOLS=[
 {id:'kpp',g:'Подготовка',ic:'schedule',n:'КПП',d:'Календарно-постановочный план: что снимаем в каждый день',r:['director']},
 {id:'script',g:'Идея и текст',ic:'script',n:'Сценарий',d:'Текст, загрузка файла, разбор на сцены',r:['producer','director','operator']},
 {id:'notes',g:'Идея и текст',ic:'note',n:'Заметки по сценам',d:'Что доработать и статус каждой сцены',r:['director']},
 {id:'explic',g:'Идея и текст',ic:'megaphone',n:'Экспликация',d:'Видение фильма на одной странице',r:['director']},
 {id:'breakdown',g:'Подготовка',ic:'grid',n:'Разбивка по элементам',d:'Реквизит, костюмы, грим, транспорт по сценам',r:['producer','director']},
 {id:'locations',g:'Подготовка',ic:'pin',n:'Локации',d:'Места съёмок, контакты и разрешения',r:['producer','operator']},
 {id:'schedule',g:'Подготовка',ic:'schedule',n:'План съёмок',d:'Сцены по дням и занятость актёров',r:['producer','director']},
 {id:'budget',g:'Подготовка',ic:'budget',n:'Смета',d:'План и факт, шаблоны, итоги',r:['producer']},
 {id:'docs',g:'Подготовка',ic:'file',n:'Документы',d:'Договоры, согласия, акт приёма техники',r:['producer']},
 {id:'shots',g:'Съёмки',ic:'frame',n:'Шот-лист',d:'Кадры по сценам для режиссёра и оператора',r:['director','operator']},
 {id:'story',g:'Съёмки',ic:'pencil',n:'Раскадровка',d:'Рисунки кадров с подписями',r:['director','operator']},
 {id:'lights',g:'Съёмки',ic:'bulb',n:'Светосхема',d:'План света, камеры и актёров',r:['operator']},
 {id:'calc',g:'Съёмки',ic:'calc',n:'Калькуляторы',d:'Выдержка, ND, память, свет',r:['operator']},
 {id:'today',g:'Съёмки',ic:'camera',n:'Съёмочный день',d:'Экран для площадки: сцены, кадры, вызовы',r:['producer','director','operator']},
 {id:'callsheet',g:'Съёмки',ic:'callsheet',n:'Вызывной лист',d:'Документ на съёмочный день с рассветом и закатом',r:['producer']},
 {id:'tasks',g:'Команда',ic:'check',n:'Задачи',d:'Доска задач по ролям',r:['producer','director','operator']}
];
const TOOL_IDS=TOOLS.map(x=>x.id);
const CORE=['script','explic','story','kpp','budget','shots','lights','callsheet','today','tasks'];
const HUB_FIRST=['lights','story'];
const TOOL_GROUPS=['Идея и текст','Подготовка','Съёмки','Команда'];
const PAGE_IDS=['home','proj','rentals'].concat(TOOL_IDS);
Object.keys(ROLE_TABS).forEach(r=>{ROLE_TABS[r]=PAGE_IDS.slice()});
const TOP=[['home','home','Главная','Главная'],['proj','briefcase','Проект','Проект']];
const secOf=tab=>(TOOL_IDS.indexOf(tab)>-1||tab==='rentals')?'proj':tab;
function closeMenus(){$$('details.menu').forEach(d=>{d.open=false})}
/* компактное меню «Ещё ▾» вместо ряда кнопок */
function dd(label,items,o){o=o||{};return '<details class="menu dd'+(o.cls?' '+o.cls:'')+'"><summary class="btn'+(o.primary?'':' sec')+' dd-b">'+label+'<i class="caret" aria-hidden="true">▾</i></summary><div class="menu-pop dd-pop'+(o.right?'':' l')+(o.wide?' wide':'')+'">'+items+'</div></details>'}
function ddi(attrs,txt){return '<button class="ghost" type="button" '+attrs+'>'+txt+'</button>'}
function ddh(t){return '<small class="dd-h">'+t+'</small>'}
document.addEventListener('click',e=>{const it=e.target.closest('details.dd .menu-pop button,details.dd .menu-pop label');if(it&&!it.dataset.keep){const d=it.closest('details.dd');setTimeout(()=>{if(d)d.open=false},0)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('details.dd[open]').forEach(d=>{d.open=false})});
document.addEventListener('click',e=>{if(!e.target.closest('details.menu'))closeMenus()});

function renderChrome(){
  const sec=secOf(S.tab);
  $('#topnav').innerHTML=TOP.map(x=>'<button class="tn" type="button" title="'+t(x[2])+'" data-c="tab" data-k="'+x[0]+'"'+((x[0]==='proj'?S.tab==='proj':sec===x[0])?' aria-current="page"':'')+'>'+icon(x[1])+'<span>'+t(x[2])+'</span></button>'+
    (x[0]==='proj'?'<button class="tntog" type="button" data-c="toolsTog" aria-expanded="'+!S.toolsOff+'"><span>Инструменты</span><i class="caret">▾</i></button><div class="tnsub"'+(S.toolsOff?' hidden':'')+' role="group" aria-label="Инструменты проекта">'+navGroups().map(g=>'<small class="tng">'+g[0]+'</small>'+g[1].map(y=>'<button class="tns" type="button" title="'+t(y.n)+'" data-c="tab" data-k="'+y.id+'"'+(S.tab===y.id?' aria-current="page"':'')+'>'+icon(y.ic)+'<span>'+t(y.n)+'</span></button>').join('')).join('')+'</div>':'')).join('');
  $('#botnav').innerHTML=TOP.map(x=>'<button class="bt" type="button" data-c="tab" data-k="'+x[0]+'"'+(sec===x[0]?' aria-current="page"':'')+'>'+icon(x[1])+'<span>'+t(x[3])+'</span></button>').join('');
  
  ['#topnav','#botnav'].forEach(q=>{const el=$(q);if(PREF.lang==='kk')el.setAttribute('lang','kk');else el.removeAttribute('lang')});
  $('#roleSeg').innerHTML='<small>Я работаю как</small><div class="rs-row">'+Object.keys(ROLES).map(k=>'<button class="rs" type="button" data-c="role" data-k="'+k+'" title="'+t(ROLES[k].t)+'"'+(S.role===k?' aria-pressed="true"':' aria-pressed="false"')+'>'+icon(ROLES[k].i)+'<span>'+t(ROLES[k].t)+'</span></button>').join('')+'</div>';
  $('#roleBtn').innerHTML=icon(ROLES[S.role].i)+'<span>'+t(ROLES[S.role].t)+'</span><i class="caret">▾</i>';
  $('#roleList').innerHTML='<p class="mt">'+t('Я работаю как')+'</p>'+Object.keys(ROLES).map(k=>'<button class="opt'+(S.role===k?' on':'')+'" type="button" data-c="role" data-k="'+k+'">'+icon(ROLES[k].i)+'<span>'+t(ROLES[k].t)+'</span></button>').join('');
  const nm=userName();
  $('#avBtn').innerHTML='<span class="av">'+esc(String(nm).charAt(0).toUpperCase())+'</span><span class="avn"><b>'+esc(nm)+'</b><small>'+(USER==='guest'?'демо без аккаунта':'профиль и настройки')+'</small></span>';
}
const FS_SVG='<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
const STAGES=[['Текст',['script','explic','story']],['Подготовка',['kpp','budget','shots','lights']],['Съёмочный день',['callsheet','today']],['Команда',['tasks']],['Рентал',['rentals']]];
const RENT_TOOL={id:'rentals',ic:'store',n:'Rental8',d:'Аренда техники в Алматы'};
function navGroups(){
  const mine=TOOLS.filter(x=>CORE.indexOf(x.id)>-1&&x.r.indexOf(S.role)>-1);
  return STAGES.map(g=>[g[0],g[1].map(id=>id==='rentals'?RENT_TOOL:mine.find(x=>x.id===id)).filter(Boolean)]).filter(g=>g[1].length);
}
function toolMenu(){
  const g=navGroups();if(!g.length)return '';
  return '<details class="toolmenu noprint"'+(S.tmOpen?' open':'')+'><summary>'+icon('briefcase')+'<span>Инструменты</span></summary><div class="tm-pan">'+g.map(x=>'<div class="tm-g"><small>'+esc(x[0])+'</small><div class="tm-row">'+x[1].map(t0=>'<button class="chip" type="button" data-c="tab" data-k="'+t0.id+'">'+icon(t0.ic)+esc(t0.n)+'</button>').join('')+'</div></div>').join('')+'</div></details>';
}
function canOpen(id){return navGroups().some(g=>g[1].some(x=>x.id===id))}
function roleTools(){return [].concat.apply([],navGroups().map(g=>g[1]))}
function toolBar(){
  if(TOOL_IDS.indexOf(S.tab)<0&&S.tab!=='rentals')return '';
  const list=roleTools();if(!list.some(x=>x.id===S.tab)){const c=TOOLS.find(x=>x.id===S.tab);if(c)list.push(c)}
  return '<div class="crumbs noprint"><button class="back" type="button" data-c="tab" data-k="proj">'+icon('left')+'<span>'+t('Проект')+'</span></button><div class="tstrip" role="group" aria-label="Инструменты">'+list.map(x=>'<button class="chip" type="button" data-c="tab" data-k="'+x.id+'" aria-pressed="'+(x.id===S.tab)+'">'+t(x.n)+'</button>').join('')+'</div></div>'+
    '<button class="fsfab noprint" type="button" data-c="fs" aria-label="Свернуть полноэкранный режим">'+FS_SVG+'<span>Свернуть</span></button>';
}
/* шапка проекта: название и переключатель проектов, роль, команда, приглашение */
function projHead(){
  const own=!isShared(),isTool=TOOL_IDS.indexOf(S.tab)>-1;
  if(CLOUD)loadTeam();
  let projs='';
  if(CLOUD){
    const it=(pid,label,sub)=>'<button class="ghost ph-pi'+(CLOUD.pid===pid?' on':'')+'" type="button" data-c="switchProj" data-id="'+esc(pid)+'"><b>'+esc(label)+'</b><small>'+esc(sub)+'</small></button>';
    projs=ddh('Ваши проекты')+it(CLOUD.uid,own?S.name:'Мой проект','личный проект')+TEAM.teams.map(x=>it(x.owner_id,x.project_name||'Проект без названия','владелец: '+(x.owner_name||x.owner_email||'участник'))).join('')+'<hr>';
  }else{
    projs=ddh('Проект')+'<button class="ghost ph-pi on" type="button" data-c="tab" data-k="proj"><b>'+esc(S.name)+'</b><small>хранится в этом браузере</small></button><hr>';
  }
  projs+=ddi('data-c="tab" data-k="proj"',icon('briefcase')+'Пульт проекта')+'<hr>'+ddh('Файлы')+ddi('data-c="exportProj"',icon('download')+'Сохранить проект в файл')+ddi('data-c="exportAll"',icon('download')+'Все документы одним архивом (.zip)')+'<label class="ghost" for="projIn" style="cursor:pointer">'+icon('upload')+'Открыть проект из файла</label>'+
    '<hr>'+ddi('data-c="demo" data-k="1"',icon('script')+'Открыть пример «Последний звонок»')+'<button class="ghost" type="button" data-c="reset" id="resetBtn" data-keep="1">'+(resetArmed?'Нажмите ещё раз — данные удалятся':'Начать с чистого листа')+'</button>';
  const name=dd('<span class="ph-n"><small>'+(isShared()?'Проект команды':'Проект')+'</small><b>'+esc(S.name)+'</b></span>',projs,{cls:'ph-proj',wide:true});
  const role=dd('<span class="ph-you">Вы:</span> '+icon(ROLES[S.role].i)+t(ROLES[S.role].t),ddh(t('Я работаю как'))+Object.keys(ROLES).map(k=>'<button class="ghost opt'+(S.role===k?' on':'')+'" type="button" data-c="role" data-k="'+k+'">'+icon(ROLES[k].i)+'<span>'+t(ROLES[k].t)+'</span></button>').join(''),{right:true});
  const ppl=[userName()];if(CLOUD&&own)TEAM.members.forEach(m=>ppl.push(m.member_name||m.member_email||'?'));
  else if(CLOUD){const ow=TEAM.teams.find(x=>x.owner_id===CLOUD.pid);if(ow)ppl.unshift(ow.owner_name||ow.owner_email||'?')}
  const avs='<span class="ph-avs" title="'+esc(ppl.join(', '))+'" aria-label="Команда: '+esc(ppl.join(', '))+'">'+ppl.slice(0,4).map(n=>'<i>'+esc(String(n).charAt(0).toUpperCase())+'</i>').join('')+(ppl.length>4?'<i class="more">+'+(ppl.length-4)+'</i>':'')+'</span>';
  let inv;
  if(!CLOUD)inv=ddh('Командная работа')+'<p class="ph-note">Чтобы работать над проектом вместе, войдите в аккаунт.</p>'+ddi('data-c="logout"',icon('users')+'Войти или создать аккаунт');
  else if(!own)inv='<p class="ph-note">Пригласить людей может владелец проекта.</p>';
  else inv=ddh('Ссылка-приглашение')+ddi('data-c="teamInvite" data-k="editor"',icon('pencil')+'<span><b>Редактор</b><small>может менять проект</small></span>')+ddi('data-c="teamInvite" data-k="viewer"',icon('eye')+'<span><b>Только просмотр</b><small>смотрит без правок</small></span>')+'<p class="ph-note">Ссылка скопируется, отправьте её в мессенджер.</p>';
  const invite=dd(icon('plus')+'<span class="ph-lbl">Пригласить</span>',inv,{right:true});
  const fs=isTool?'<button class="btn sec ph-fs" type="button" data-c="fs" title="На весь экран" aria-label="Развернуть инструмент на весь экран">'+FS_SVG+'</button>':'';
  return '<div class="phead noprint">'+name+'<div class="ph-r">'+role+avs+invite+fs+'</div></div>';
}
/* заголовок инструмента: название слева, действия справа — одна жёлтая кнопка и «Скачать» */
function hd(title,desc,acts){
  return '<header class="head"><div class="slate"></div><div class="hrow"><h1>'+title+'</h1>'+(acts?'<div class="hact noprint">'+acts+'</div>':'')+'</div>'+(desc?'<p>'+desc+'</p>':'')+'</header>';
}
function dlMenu(items){return dd(icon('download')+'Скачать',items,{right:true})}


/* ---------- съёмочный день ---------- */
const localISO=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function todayIndex(){if(!S.scenes.length)return 0;ensurePlan();const md=maxDay(),iso=localISO();for(let d=1;d<=md;d++){const i=S.cs.info[d];if(i&&i.date===iso)return d}return 0}
let TODAY_PICKED=false;
function callsheetText(d){
  ensurePlan();const inf=dayInfo(d),sc=S.scenes.filter(s=>S.assign[s.id]===d),cast=[];sc.forEach(s=>s.chars.forEach(c=>{if(cast.indexOf(c)<0)cast.push(c)}));
  let ds='';if(inf.date){try{ds=new Date(inf.date+'T00:00:00').toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}catch(e){}}
  const L=['🎬 Вызывной лист: '+S.name,'День '+d+' из '+maxDay()+(ds?' · '+ds:''),'Общий сбор: '+(inf.call||'—')];
  if(inf.addr)L.push('Адрес: '+inf.addr);
  if(sc.length)L.push('','Сцены:',...sc.map(s=>'• '+s.id+'. '+s.type+'. '+s.loc+(s.time?' — '+s.time:'')));
  if(cast.length)L.push('','Вызов актёров:',...cast.map(c=>{const cc=S.cs.castCalls[d+'|'+c]||{};return '• '+c+(cc.actor?' ('+cc.actor+')':'')+' — '+(cc.time||inf.call||'')}));
  if(inf.notes)L.push('','Примечания: '+inf.notes);
  if(S.cs.producer||S.cs.phone)L.push('','Продюсер: '+(S.cs.producer||'')+(S.cs.phone?', '+S.cs.phone:''));
  return L.join('\n');
}
async function shareCallsheet(btn){
  ensurePlan();const d=S.cs.day,text=callsheetText(d),name='vyzyvnoy-list-den-'+d+'.pdf';
  if(navigator.share&&navigator.canShare){
    if(btn)btn.disabled=true;
    try{
      const blob=await makePdf(callsheetBlocks(d),'Вызывной лист · '+S.name),file=new File([blob],name,{type:'application/pdf'});
      if(navigator.canShare({files:[file]})){await navigator.share({files:[file],text:text});return}
    }catch(e){if(e&&e.name==='AbortError')return}
    finally{if(btn)btn.disabled=false}
  }
  window.open('https://t.me/share/url?url='+encodeURIComponent(location.origin+location.pathname)+'&text='+encodeURIComponent(text),'_blank','noopener');
}
function vToday(){
  const head='<header class="head"><div class="slate"></div><h1>Съёмочный день</h1><p>Всё для площадки на одном экране: сцены, кадры с галочками, вызов актёров и контакты.</p></header>';
  if(!S.scenes.length)return head+NEED_SCENES('Экран съёмочного дня строится по плану съёмок — сначала разберите сценарий.');
  ensurePlan();pdfLib().catch(()=>{});
  const md=maxDay(),ti=todayIndex();
  if(!TODAY_PICKED&&ti){S.cs.day=ti;TODAY_PICKED=true}
  if(S.cs.day>md||S.cs.day<1)S.cs.day=1;
  const d=S.cs.day,inf=dayInfo(d),sc=S.scenes.filter(s=>S.assign[s.id]===d),cast=[];sc.forEach(s=>s.chars.forEach(c=>{if(cast.indexOf(c)<0)cast.push(c)}));
  let ds='';if(inf.date){try{ds=new Date(inf.date+'T00:00:00').toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}catch(e){}}
  const days='<div class="chips" role="group" aria-label="Съёмочный день">'+Array.from({length:md},(_,i)=>i+1).map(i=>'<button class="chip" type="button" data-c="todayDay" data-k="'+i+'" aria-pressed="'+(i===d)+'">День '+i+(i===ti?' · сегодня':'')+'</button>').join('')+'</div>';
  const shotsAll=S.shots.filter(x=>sc.some(s=>String(s.id)===String(x.scene))),done=shotsAll.filter(x=>x.done).length;
  const top='<section class="td-top"><div><span class="lbl">'+(d===ti?'Сегодня':'День '+d+' из '+md)+'</span><h2>'+(ds?esc(ds.charAt(0).toUpperCase()+ds.slice(1)):'Дата не указана')+'</h2>'+
    '<div class="td-facts"><span><b>'+esc(inf.call||'—')+'</b> общий сбор</span><span><b>'+sc.length+'</b> '+(sc.length===1?'сцена':'сцен')+'</span><span><b>'+done+' из '+shotsAll.length+'</b> кадров снято</span></div>'+
    (inf.addr?'<p class="td-addr">'+esc(inf.addr)+' · <a href="https://2gis.kz/almaty/search/'+encodeURIComponent(inf.addr)+'" target="_blank" rel="noopener noreferrer">открыть в 2ГИС</a></p>':'<p class="td-addr muted">Адрес не указан. Его можно добавить в вызывном листе.</p>')+
    sunHtml(inf.date)+'</div>'+
    '<div class="row td-act"><button class="btn" type="button" data-c="csShare">'+icon('ext')+'Отправить команде</button><button class="btn sec" type="button" data-c="csPdf">'+icon('download')+'PDF</button>'+
    (S.cs.phone?'<a class="btn sec" href="tel:'+esc(S.cs.phone.replace(/[^\d+]/g,''))+'">Позвонить продюсеру</a>':'')+'<button class="btn sec" type="button" data-c="tab" data-k="callsheet">Изменить данные дня</button></div></section>';
  const scenes=sc.length?sc.map(s=>{
    const sh=S.shots.filter(x=>String(x.scene)===String(s.id)),dn=sh.filter(x=>x.done).length;
    const list=sh.length?'<ul class="td-shots">'+sh.map(x=>'<li><label><input type="checkbox" data-a="sh" data-id="'+x.id+'" data-f="done" data-r="1"'+(x.done?' checked':'')+'><span><b>'+esc(String(x.no||''))+'</b> '+esc([x.size,x.angle,x.move,x.mm?x.mm+' мм':''].filter(Boolean).join(' · '))+(x.desc?' — '+esc(x.desc):'')+'</span></label></li>').join('')+'</ul>':
      '<p class="muted" style="margin:8px 0 0">Кадров пока нет. <button class="link" type="button" data-c="tab" data-k="shots">Добавить в шот-лист</button></p>';
    return '<article class="td-scene'+(sh.length&&dn===sh.length?' done':'')+'"><div class="td-sh"><b>Сцена '+s.id+'</b><span>'+esc(s.type+'. '+s.loc+(s.time?' — '+s.time:''))+'</span>'+(sh.length?'<i>'+dn+'/'+sh.length+'</i>':'')+'</div>'+
      (s.chars.length?'<p class="td-chars">'+esc(s.chars.join(', '))+'</p>':'')+list+'</article>';
  }).join(''):'<div class="empty"><b>В этот день сцен нет</b>Распределите сцены в плане съёмок.</div>';
  const castT=cast.length?'<ul class="td-cast">'+cast.map(c=>{const cc=S.cs.castCalls[d+'|'+c]||{};return '<li><b>'+esc(c)+'</b><span>'+esc(cc.actor||'актёр не указан')+'</span><time>'+esc(cc.time||inf.call||'—')+'</time></li>'}).join('')+'</ul>':'<p class="muted" style="margin:0">В сценах этого дня нет персонажей с репликами.</p>';
  return head+days+top+'<div class="td-grid"><div class="col">'+scenes+'</div><div class="col">'+panel('tdcast','users','Вызов актёров',castT)+(inf.notes?panel('tdnotes','note','Примечания',esc(inf.notes)):'')+'</div></div>';
}
function todayBanner(){
  const ti=todayIndex();if(!ti)return '';
  return '<div class="pc-next td-banner"><div><b>Сегодня съёмочный день '+ti+'</b><span>Сцены, кадры и вызовы для площадки на одном экране.</span></div><button class="btn" type="button" data-c="tab" data-k="today">'+icon('camera')+'Открыть</button></div>';
}
