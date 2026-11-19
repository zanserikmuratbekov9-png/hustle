/* ---------- план съёмок ---------- */
function autoPlan(){
  const order=[],groups={};
  S.scenes.forEach(s=>{const k=locKey(s);if(!groups[k]){groups[k]=[];order.push(k)}groups[k].push(s)});
  const cap=Math.max(1,Math.round(num(S.perDay)*8));let day=1,used=0;S.assign={};
  order.forEach(k=>groups[k].forEach(s=>{if(used>0&&used+s.e>cap){day++;used=0}S.assign[s.id]=day;used+=s.e}));
}
function ensurePlan(){if(S.scenes.some(s=>!S.assign[s.id]))autoPlan()}
function maxDay(){let m=0;S.scenes.forEach(s=>{m=Math.max(m,S.assign[s.id]||0)});return m}
function vSchedule(){
  const head=hd('План съёмок','Сцены собираются по локациям и раскладываются по дням с учётом нормы страниц в смену. Любую сцену можно перенести в другой день.',S.scenes.length?dlMenu(ddi('data-c="print"','PDF через печать')):'');
  if(!S.scenes.length)return head+NEED_SCENES('План съёмок раскладывает сцены по сменам — загрузите сценарий, и план соберётся сам.');
  ensurePlan();
  const md=maxDay(),total=S.scenes.reduce((a,s)=>a+s.e,0);let days='';
  for(let d=1;d<=md;d++){
    const sc=S.scenes.filter(s=>S.assign[s.id]===d),tot=sc.reduce((a,s)=>a+s.e,0),locs=[];
    sc.forEach(s=>{const k=locKey(s);if(locs.indexOf(k)<0)locs.push(k)});
    let opts=cur=>{let o='';for(let i=1;i<=md+1;i++)o+='<option value="'+i+'"'+(i===cur?' selected':'')+'>День '+i+'</option>';return o};
    const body='<div>'+(locs.length?locs.map(l=>'<span class="tag">'+esc(l)+'</span>').join(''):'<span class="muted">В этот день сцен нет</span>')+'</div>'+
      (sc.length?'<div class="tw"><table class="grid"><tbody>'+sc.map(s=>'<tr><td style="width:70px"><b>Сц. '+s.id+'</b></td><td>'+esc(s.type)+'. '+esc(s.loc)+(s.time?', '+esc(s.time):'')+'</td><td class="muted">'+esc(s.chars.join(', '))+'</td><td class="r" style="width:70px">'+eighths(s.e)+'</td><td style="width:130px"><select data-a="assign" data-r="1" data-id="'+s.id+'" aria-label="День съёмки для сцены '+s.id+'">'+opts(d)+'</select></td></tr>').join('')+'</tbody></table></div>':'');
    days+=panel('day'+d,'schedule','День '+d,body,{cls:'day',right:'<span class="muted">'+eighths(tot)+' стр.</span>'});
  }
  const top='<div class="row"><label>Норма, страниц в смену <input type="number" min="0.125" step="0.125" data-a="perDay" value="'+esc(S.perDay)+'" style="width:90px;margin-left:8px;background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:9px 10px"></label><button class="btn sec" type="button" data-c="plan">Составить план заново</button></div>'+
    '<div class="stats" style="margin-top:12px"><div><b>'+md+'</b><span>съёмочных дней</span></div><div><b>'+S.scenes.length+'</b><span>сцен</span></div><div><b>'+eighths(total)+'</b><span>страниц</span></div></div>';
  return head+'<div class="col">'+panel('plan','list','Параметры плана',top)+panel('matrix','users','Занятость актёров по дням',matrixHtml())+
    '<div class="row noprint">'+(Array.from({length:md},(_,i)=>'day'+(i+1)).some(k=>!(k in S.pc)||!S.pc[k])?'<button class="link" type="button" data-c="collapseAll" data-pre="day">Свернуть все дни</button>':'<button class="link" type="button" data-c="expandAll" data-pre="day">Развернуть все дни</button>')+'</div>'+days+'</div>';
}

/* ---------- вызывной лист ---------- */
function dayInfo(d){S.cs.info[d]=S.cs.info[d]||{date:'',call:'08:00',addr:'',notes:''};return S.cs.info[d]}
function vCall(){
  const head=hd('Вызывной лист','Документ для группы на конкретный съёмочный день: сцены, места, время вызова актёров. Заполните поля и отправьте команде.',S.scenes.length?'<button class="btn" type="button" data-c="csShare">'+icon('ext')+'Отправить команде</button>'+dlMenu(ddi('data-c="csPdf"','PDF')+ddi('data-c="csDocx"','Word (.docx)')+ddi('data-c="print"','Распечатать')):'');
  if(!S.scenes.length)return head+NEED_SCENES('Вызывной лист собирается из плана съёмок: сцены дня, актёры и время вызова.');
  ensurePlan();
  const md=maxDay();if(S.cs.day>md||S.cs.day<1)S.cs.day=1;
  const d=S.cs.day,inf=dayInfo(d),sc=S.scenes.filter(s=>S.assign[s.id]===d),cast=[];
  sc.forEach(s=>s.chars.forEach(c=>{if(cast.indexOf(c)<0)cast.push(c)}));
  let dayOpts='';for(let i=1;i<=md;i++)dayOpts+='<option value="'+i+'"'+(i===d?' selected':'')+'>День '+i+' из '+md+'</option>';
  let dateStr='';if(inf.date){try{dateStr=new Date(inf.date+'T00:00:00').toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}catch(e){}}
  const form='<div class="fields">'+
    '<label>Съёмочный день<select data-a="csday" data-r="1">'+dayOpts+'</select></label>'+
    '<label>Дата<input type="date" data-a="csinfo" data-f="date" value="'+esc(inf.date)+'"></label>'+
    '<label>Общий сбор группы<input type="time" data-a="csinfo" data-f="call" value="'+esc(inf.call)+'"></label>'+
    '<label>Режиссёр<input data-a="cs" data-f="director" value="'+esc(S.cs.director)+'"></label>'+
    '<label>Продюсер<input data-a="cs" data-f="producer" value="'+esc(S.cs.producer)+'"></label>'+
    '<label>Телефон продюсера<input type="tel" data-a="cs" data-f="phone" value="'+esc(S.cs.phone)+'"></label>'+
    cityFieldHtml()+'<label class="wide">Адрес съёмочной площадки<input data-a="csinfo" data-f="addr" value="'+esc(inf.addr)+'" placeholder="Город, улица, дом, ориентиры для парковки"></label>'+
    '<label class="wide">Примечания для группы<textarea rows="3" data-a="csinfo" data-f="notes" placeholder="Погода, транспорт, питание, требования по безопасности">'+esc(inf.notes)+'</textarea></label>'+
    '</div>';
  return head+'<div class="col"><div class="noprint">'+panel('csform','callsheet','Данные дня',form)+'</div>'+
  '<section class="panel"><div class="sheet-title"><h1>Вызывной лист</h1></div>'+
    '<div class="ph"><h2>'+esc(S.name)+'</h2><b>День '+d+' из '+md+'</b></div>'+
    '<div class="stats" style="gap:36px;margin-top:10px"><div><b>'+(dateStr?esc(dateStr):'Дата не указана')+'</b><span>дата съёмки</span></div><div><b>'+esc(inf.call||'—')+'</b><span>общий сбор</span></div></div>'+
    '<p style="margin:14px 0 4px"><b>Адрес:</b> '+(inf.addr?esc(inf.addr):'<span class="muted">не указан</span>')+'</p>'+
    '<p style="margin:0 0 4px"><b>Режиссёр:</b> '+(esc(S.cs.director)||'—')+'. <b>Продюсер:</b> '+(esc(S.cs.producer)||'—')+(S.cs.phone?', '+esc(S.cs.phone):'')+'</p>'+
    sunHtml(inf.date)+(inf.notes?'<p style="margin:0"><b>Примечания:</b> '+esc(inf.notes).replace(/\n/g,'<br>')+'</p>':'')+'</section>'+
  '<section class="panel"><h2 style="margin-bottom:8px">Сцены дня</h2><div class="tw"><table class="grid"><thead><tr><th>Сц.</th><th>Место</th><th>Время суток</th><th>Персонажи</th><th class="r">Стр.</th></tr></thead><tbody>'+
    sc.map(s=>'<tr><td><b>'+s.id+'</b></td><td>'+esc(s.type)+'. '+esc(s.loc)+'</td><td>'+esc(s.time)+'</td><td>'+esc(s.chars.join(', '))+'</td><td class="r">'+eighths(s.e)+'</td></tr>').join('')+'</tbody></table></div></section>'+
  '<section class="panel"><h2 style="margin-bottom:8px">Вызов актёров</h2>'+(cast.length?'<div class="tw"><table class="grid"><thead><tr><th>Персонаж</th><th>Актёр</th><th>Вызов</th></tr></thead><tbody>'+
    cast.map(c=>{const key=d+'|'+c,cc=S.cs.castCalls[key]||{};return '<tr><td><b>'+esc(c)+'</b></td><td><input data-a="cast" data-key="'+esc(key)+'" data-f="actor" value="'+esc(cc.actor||'')+'" placeholder="Имя актёра" aria-label="Актёр, '+esc(c)+'"></td><td style="width:140px"><input type="time" data-a="cast" data-key="'+esc(key)+'" data-f="time" value="'+esc(cc.time||inf.call||'')+'" aria-label="Время вызова, '+esc(c)+'"></td></tr>'}).join('')+'</tbody></table></div>':'<p class="muted">В сценах этого дня персонажи не найдены.</p>')+'</section></div>';
}

/* ---------- обзор ---------- */
function stepDone(k){
  switch(k){
    case 'script':return S.scenes.length>0;
    case 'kpp':return S.scenes.length>0&&Object.keys(S.cs.info).some(d=>S.cs.info[d]&&S.cs.info[d].date);
    case 'schedule':return S.scenes.length>0&&!!S.seen.schedule;
    case 'budget':return calc().sub>0;
    case 'callsheet':{const i=S.cs.info;let any=false;Object.keys(i).forEach(d=>{if(i[d].addr||i[d].date)any=true});return !!(S.cs.director||S.cs.producer||any)}
    case 'notes':return Object.keys(S.notes).some(i=>S.notes[i]&&(S.notes[i].text||(S.notes[i].status&&S.notes[i].status!=='draft')));
    case 'explic':return !!(S.explic.logline||'').trim();
    case 'shots':return S.shots.length>0;
    case 'lights':return Object.keys(S.light).some(i=>S.light[i].items&&S.light[i].items.length>0);
    case 'gear':return S.gear.length>0;
    case 'tasks':return S.tasks.some(t=>t.status==='done');
    case 'deals':return !!S.seen.deals;
    case 'breakdown':return Object.keys(S.bd).some(i=>Object.keys(S.bd[i]).some(k=>(S.bd[i][k]||'').trim()));
    case 'locations':return S.locs.length>0;
    case 'docs':return Object.keys((S.doc&&S.doc.vals)||{}).some(k=>(S.doc.vals[k]||'').trim());
    case 'story':return Object.keys(S.story).some(k=>S.story[k].some(f=>f.img));
    default:return false;
  }
}
function gearTotalKzt(){return S.gear.reduce((a,g)=>a+num(g.kzt)*num(g.qty)*num(g.days),0)*(1-num(S.disc)/100)}
function homeSteps(){
  const R=S.role;
  if(R==='director')return [
    ['script','Загрузите сценарий','Сцены и персонажи найдутся сами, команда увидит их сразу.','Открыть сценарий'],
    ['explic','Напишите экспликацию','Логлайн, тема, тон и визуальный язык фильма.','Открыть экспликацию'],
    ['shots','Составьте шот-лист','Размеры, ракурсы и движение камеры по сценам.','Открыть шот-лист'],
    ['story','Нарисуйте раскадровку','Ключевые кадры с подписями для оператора.','Открыть раскадровку']];
  if(R==='operator')return [
    ['lights','Нарисуйте светосхемы','Расставьте камеру, актёров и свет по сценам.','Открыть светосхему'],
    ['shots','Проверьте шот-лист','Общий список кадров с режиссёром — отмечайте снятое.','Открыть шот-лист'],
    ['story','Посмотрите раскадровку','Рисунки кадров от режиссёра.','Открыть раскадровку'],
    ['tasks','Проверьте свои задачи','Что команда ждёт от оператора.','Открыть задачи']];
  return [
    ['script','Разберите сценарий','Вставьте или загрузите текст — сайт найдёт сцены, локации и персонажей.','Открыть разбор'],
    ['budget','Заполните смету','Введите ставки — итоги, налог и валюта посчитаются сами.','Открыть смету'],
    ['callsheet','Подготовьте вызывной лист','Выберите съёмочный день, укажите адрес и время вызова.','Открыть лист']];
}
function homeStats(){
  const R=S.role,locs={};let md=0;
  if(S.scenes.length){ensurePlan();md=maxDay();S.scenes.forEach(s=>{locs[locKey(s)]=1})}
  const st=(v,l)=>'<div><b>'+v+'</b><span>'+l+'</span></div>';
  if(R==='director'){
    const fr=Object.keys(S.story||{}).reduce((a,k)=>a+(S.story[k]||[]).length,0);
    return st(S.scenes.length||'—','сцен')+st(S.shots.length||'—','кадров в шот-листе')+st(fr||'—','кадров раскадровки')+st(S.tasks.filter(t=>t.role==='director'&&t.status!=='done').length||'—','задач открыто');
  }
  if(R==='operator'){
    const sch=Object.keys(S.light).filter(i=>S.light[i].items&&S.light[i].items.length).length;
    return st(sch||'—','светосхем')+st(S.shots.length?S.shots.filter(x=>x.done).length+' из '+S.shots.length:'—','кадров снято')+st(Object.keys(S.story||{}).reduce((a,k)=>a+(S.story[k]||[]).length,0)||'—','кадров раскадровки')+st(S.tasks.filter(t=>t.role==='operator'&&t.status!=='done').length||'—','задач открыто');
  }
  const c=calc();
  return st(c.sub>0?money(c.total):'—','бюджет проекта')+st(md||'—','съёмочных дней')+st(S.scenes.length||'—','сцен')+st(Object.keys(locs).length||'—','локаций');
}
