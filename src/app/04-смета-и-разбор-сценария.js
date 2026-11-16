/* ---------- панель (сворачиваемый раздел) ---------- */
function panel(key,ic,title,body,opt){
  opt=opt||{};const open=(key in S.pc)?!S.pc[key]:!opt.defClosed;
  return '<section class="panel'+(opt.cls?' '+opt.cls:'')+'"><div class="ph"><button class="cat" type="button" data-c="togglePanel" data-p="'+esc(key)+'" aria-expanded="'+open+'"><span class="chev" aria-hidden="true">'+(open?'▾':'▸')+'</span>'+(ic?icon(ic):'')+'<h2>'+title+'</h2></button>'+(opt.right||'')+'</div>'+(open?'<div class="pb">'+body+'</div>':'')+'</section>';
}

/* ---------- смета ---------- */
function calc(){
  let sub=0,fact=0;const by={};
  S.budget.forEach(r=>{const t=num(r.qty)*num(r.kzt);sub+=t;fact+=num(r.fact);by[r.cat]=(by[r.cat]||0)+t});
  const cont=sub*num(S.contPct)/100,fee=(sub+cont)*num(S.feePct)/100,base=sub+cont+fee,tax=base*num(S.taxPct)/100;
  return {sub,by,cont,fee,tax,fact,total:base+tax};
}
const setText=(sel,v)=>{const el=$(sel);if(el)el.textContent=v};
function updateTotals(){
  const c=calc();
  $$('[data-row]').forEach(el=>{const r=S.budget.find(x=>x.id===el.dataset.row);el.textContent=r?money(num(r.qty)*num(r.kzt)):''});
  $$('[data-sub]').forEach(el=>{el.textContent=money(c.by[el.dataset.sub]||0)});
  setText('#t-sub',money(c.sub));setText('#t-cont',money(c.cont));setText('#t-fee',money(c.fee));setText('#t-tax',money(c.tax));setText('#t-total',money(c.total));setText('#dock-total',money(c.total));setText('#t-fact',money(c.fact));setText('#t-left',money(c.total-c.fact));
  const bars=$('#bars');
  if(bars){
    const cats=Object.keys(c.by).filter(k=>c.by[k]>0);
    bars.innerHTML=cats.length?cats.map(k=>{const p=c.sub?c.by[k]/c.sub*100:0;return '<div class="bar"><span>'+esc(k)+'</span><span>'+Math.round(p)+'%</span><div class="t"><i style="width:'+p+'%"></i></div></div>'}).join(''):'<p class="muted">Доли статей появятся, как только вы введёте ставки.</p>';
  }
}
function vDock(){
  const open=S.dockOpen;
  return '<div class="dock"><div class="dock-bar"><button class="cat" type="button" data-c="dockToggle" aria-expanded="'+open+'"><span class="chev" aria-hidden="true">'+(open?'▾':'▴')+'</span>'+icon('budget')+'<h2>Итоги</h2></button><div class="dock-tot"><span>Бюджет проекта</span><b id="dock-total"></b></div></div>'+
  (open?'<div class="dock-body"><div>'+
    '<div class="line"><span>Прямые расходы</span><b id="t-sub"></b></div>'+
    '<div class="line"><span class="pct">Непредвиденные <input type="number" min="0" step="any" data-a="pct" data-f="contPct" value="'+esc(S.contPct)+'" aria-label="Непредвиденные, %">%</span><span id="t-cont"></span></div>'+
    '<div class="line"><span class="pct">Гонорар продюсера <input type="number" min="0" step="any" data-a="pct" data-f="feePct" value="'+esc(S.feePct)+'" aria-label="Гонорар продюсера, %">%</span><span id="t-fee"></span></div>'+
    '<div class="line"><span class="pct">Налог (НДС) <input type="number" min="0" step="any" data-a="pct" data-f="taxPct" value="'+esc(S.taxPct)+'" aria-label="Налог, %">%</span><span id="t-tax"></span></div>'+
    '<div class="total"><span>Бюджет проекта</span><b id="t-total"></b></div>'+
    '<div class="line"><span>Потрачено (факт)</span><b id="t-fact"></b></div><div class="line"><span>Остаток бюджета</span><b id="t-left"></b></div>'+

  '</div><div><h2 style="margin-bottom:10px">Структура расходов</h2><div id="bars"></div></div></div>':'')+'</div>';
}
function vBudget(){
  const cats=[];S.budget.forEach(r=>{if(cats.indexOf(r.cat)<0)cats.push(r.cat)});
  const budOpen=c=>{const k='cat:'+c;if(k in S.pc)return !S.pc[k];return !S.budget.filter(r=>r.cat===c).every(r=>!String(r.name||'').trim()&&!num(r.kzt)&&!num(r.fact))};
  const groups=cats.map(c=>{
    const rows=S.budget.filter(r=>r.cat===c).map(r=>
      '<tr><td data-l="Статья"><input data-a="bud" data-id="'+r.id+'" data-f="name" value="'+esc(r.name)+'" placeholder="Например, оператор-постановщик" aria-label="Статья">'+(r.src?'<small class="src'+(r.src.indexOf('прайс')===0?' m':'')+'">'+esc(r.src)+'</small>':'')+'</td>'+
      '<td data-l="Кол-во" style="width:84px"><input class="n" type="number" min="0" step="any" data-a="bud" data-id="'+r.id+'" data-f="qty" value="'+esc(r.qty)+'" aria-label="Количество"></td>'+
      '<td data-l="Ед." style="width:100px"><input data-a="bud" data-id="'+r.id+'" data-f="unit" value="'+esc(r.unit)+'" aria-label="Единица"></td>'+
      '<td data-l="Ставка" style="width:124px"><input class="n" type="number" min="0" step="any" data-a="bud" data-id="'+r.id+'" data-f="rate" value="'+fmtIn(r.kzt)+'" aria-label="Ставка"></td>'+
      '<td data-l="Факт" style="width:124px"><input class="n" type="number" min="0" step="any" data-a="bud" data-id="'+r.id+'" data-f="fact" value="'+(r.fact?fmtIn(r.fact):'')+'" placeholder="0" aria-label="Фактически потрачено"></td>'+
      '<td data-l="Сумма" class="r" style="width:130px" data-row="'+r.id+'"></td>'+
      '<td class="del" style="width:44px"><button class="x" type="button" data-c="delRow" data-id="'+r.id+'" aria-label="Удалить строку">×</button></td></tr>').join('');
    const body='<div class="tw"><table class="grid budget"><thead><tr><th>Статья</th><th>Кол-во</th><th>Ед.</th><th>Ставка</th><th>Факт</th><th class="r">Сумма</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><button class="link" type="button" data-c="addRow" data-cat="'+esc(c)+'">Добавить строку</button>';
    const empty=S.budget.filter(r=>r.cat===c).every(r=>!String(r.name||'').trim()&&!num(r.kzt)&&!num(r.fact));
    return panel('cat:'+c,'',esc(c)+(empty?' <small class="muted" style="font-weight:500">· пусто</small>':''),body,{right:'<b data-sub="'+esc(c)+'"></b>',defClosed:empty});
  }).join('');
  return hd('Смета','Введите количество и ставку — подитоги, непредвиденные расходы, гонорар и налог считаются сами. Ставки с пометкой «прайс» взяты из открытых прайс-листов Алматы (октябрь 2026), «оценка» — ориентир, уточните у поставщика. Итоги — внизу экрана.',
    dd(icon('upload')+'Загрузить',ddi('data-c="tab" data-k="rentals"',icon('store')+'Технику из рентала')+'<label class="ghost" for="budIn" style="cursor:pointer">'+icon('upload')+'Выбрать файл .xlsx или .csv</label><small>Столбцы: Раздел, Статья, Кол-во, Ед., Ставка, как в нашей выгрузке. Ставки читаются в выбранной валюте.</small>',{right:true})+'<input class="sr" id="budIn" type="file" accept=".xlsx,.csv,.tsv,.txt,text/csv" data-a="budimport">'+
    dd(icon('download')+'Скачать',ddi('data-c="budXlsx"','Excel (.xlsx)')+ddi('data-c="budgetPdf"','PDF')+ddi('data-c="csvBudget"','CSV')+ddi('data-c="copyBudget"','Скопировать для таблицы')+ddi('data-c="print" data-dock="1"','Распечатать'),{right:true,primary:true}))+
  '<div class="tbar noprint" style="margin-bottom:10px">'+(cats.some(budOpen)?'<button class="link" type="button" data-c="collapseAll" data-pre="cat:">Свернуть все разделы</button>':'<button class="link" type="button" data-c="expandAll" data-pre="cat:">Развернуть все разделы</button>')+'</div>'+
  backupBanner()+'<div class="col">'+budgetTplPanel()+groups+'</div>'+vDock();
}

/* ---------- разбор сценария ---------- */
const HEAD=/^\s*(?:(?:СЦЕНА|SCENE)\s*)?(?:(\d+)[\.\)]?\s+)?(ИНТ\.?\s*\/\s*НАТ|ИНТЕРЬЕР|ИНТ|НАТУРА|ЭКСТЕРЬЕР|ЭКСТ|НАТ|INT\.?\s*\/\s*EXT|I\/E|INT|EXT)[\.\s]+(.+)$/i;
function normType(t){t=t.toUpperCase().replace(/\s/g,'').replace(/\.$/,'');if(t.indexOf('/')>-1||t==='I/E')return 'ИНТ/НАТ';return (t.indexOf('INT')===0||t.indexOf('ИНТ')===0)?'ИНТ':'НАТ'}
function isCue(line){
  if(!line||line.length>38)return false;
  if(/[a-zа-яё]/.test(line.replace(/\(.*?\)/g,'')))return false;
  const name=line.replace(/\(.*?\)/g,'').trim();
  const numbered=/^[А-ЯЁA-Z][А-ЯЁA-Z'\-]+(?: [А-ЯЁA-Z'\-]+)? \d{1,2}$/.test(name)&&!/^(СЦЕНА|ДЕНЬ|НОЧЬ|ЧАСТЬ|СЕРИЯ|ГЛАВА|ЭПИЗОД|SCENE|DAY|PART)\b/.test(name);
  if(!name||(!numbered&&(/[\d\.:!?]$/.test(name)||/\d/.test(name))))return false;
  if(!/[А-ЯЁA-Z]/.test(name))return false;
  if(/^(ЗТМ|ЗАТЕМНЕНИЕ|КОНЕЦ|ТИТР|СМЕНА|ПЕРЕХОД|CUT|FADE|THE END|ПРОДОЛЖЕНИЕ)/.test(name))return false;
  return true;
}
function parseScript(text){
  const lines=text.replace(/\r/g,'').split('\n'),scenes=[];let cur=null;
  lines.forEach(raw=>{
    const line=raw.trim(),m=line.match(HEAD);
    if(m){
      const parts=m[3].trim().split(/\s*[-–—]\s+/);let time='';
      if(parts.length>1)time=parts.pop();
      cur={id:scenes.length+1,type:normType(m[2]),loc:parts.join(' — ').trim(),time:time.trim().toUpperCase(),chars:[],len:0};
      scenes.push(cur);return;
    }
    if(!cur)return;
    cur.len+=raw.length+1;
    if(isCue(line)){const n=line.replace(/\(.*?\)/g,'').trim();if(cur.chars.indexOf(n)<0)cur.chars.push(n)}
    else{const mc=line.match(/^([А-ЯЁA-Z][А-ЯЁA-Z0-9 .'\-]{1,22})(?:\s*\([^)]*\))?\s*[:\u2014]\s+\S/);if(mc){const n=mc[1].trim();if(!/^(ПРИМЕЧАНИЕ|ВНИМАНИЕ|ТИТР|СУПЕР|ЗТМ|ПРИМ|ВАЖНО|ЗАМЕТКА)/.test(n)&&cur.chars.indexOf(n)<0)cur.chars.push(n)}}
  });
  scenes.forEach(s=>{s.e=Math.max(1,Math.round(s.len/1800*8));delete s.len});
  return scenes;
}
const locKey=s=>s.loc.split(',')[0].trim().toUpperCase();
function applyScript(text,msg){
  const sig=a=>a.map(x=>x.id+'|'+x.loc+'|'+x.time).join('#'),before=sig(S.scenes),keep=S.assign;
  S.script=text;S.scenes=parseScript(text);
  const kept=S.scenes.length>0&&sig(S.scenes)===before;
  if(kept)S.assign=keep;else{S.assign={};autoPlan()}
  render();
  toast(msg||(S.scenes.length?'Найдено сцен: '+S.scenes.length+(kept?'. Ручной план съёмок сохранён.':''):'Сцены не найдены — проверьте заголовки (ИНТ./НАТ.)'));
}
/* ---------- сценарий: текст по сценам, итоги, помощник ---------- */
function splitScenes(text){
  const out=[],pre=[];let cur=null;
  text.replace(/\r/g,'').split('\n').forEach(raw=>{
    const m=raw.trim().match(HEAD);
    if(m){cur={head:raw.trim(),num:m[1]?parseInt(m[1],10):0,lines:[]};out.push(cur);return}
    if(cur)cur.lines.push(raw);else if(raw.trim())pre.push(raw);
  });
  out.pre=pre;return out;
}
function sceneBlocks(lines){
  const b=[];let dlg=false;
  const push=(k,t,who)=>{const l=b[b.length-1];if(l&&l.k===k&&(k==='act'||k==='dlg')&&!who){l.t+=' '+t}else b.push({k:k,t:t})};
  lines.forEach(raw=>{
    const line=raw.trim();
    if(!line){dlg=false;return}
    if(isCue(line)){b.push({k:'cue',t:line});dlg=true;return}
    const mc=line.match(/^([А-ЯЁA-Z][А-ЯЁA-Z0-9 .'\-]{1,22})(\s*\([^)]*\))?\s*[:—]\s+(\S.*)$/);
    if(mc&&!/^(ПРИМЕЧАНИЕ|ВНИМАНИЕ|ТИТР|СУПЕР|ЗТМ|ПРИМ|ВАЖНО|ЗАМЕТКА)/.test(mc[1].trim())){b.push({k:'cue',t:mc[1].trim()+(mc[2]||'')});b.push({k:'dlg',t:mc[3]});dlg=true;return}
    if(dlg&&/^\(/.test(line)){b.push({k:'par',t:line});return}
    push(dlg?'dlg':'act',line);
  });
  return b;
}
const cueName=t=>t.replace(/\(.*?\)/g,'').trim().toUpperCase();
let _SM={key:'',v:null};
function sceneModel(){
  if(_SM.key===S.script&&_SM.v&&_SM.v.n===S.scenes.length)return _SM.v;
  const sp=splitScenes(S.script),list=sp.map((s,i)=>{
    const blocks=sceneBlocks(s.lines),replies={},empty=[],long=[];
    blocks.forEach((x,j)=>{if(x.k!=='cue')return;const n=cueName(x.t),nx=blocks[j+1];
      if(nx&&nx.k==='par'&&blocks[j+2]&&blocks[j+2].k==='dlg'){replies[n]=(replies[n]||0)+1;if(blocks[j+2].t.length>600)long.push(n)}
      else if(nx&&nx.k==='dlg'){replies[n]=(replies[n]||0)+1;if(nx.t.length>600)long.push(n)}
      else empty.push(n)});
    const parens=s.lines.filter(l=>(l.match(/\(/g)||[]).length!==(l.match(/\)/g)||[]).length);
    return {head:s.head,num:s.num,blocks:blocks,replies:replies,empty:empty,long:long,parens:parens.length,hasBody:blocks.some(x=>x.k==='act'||x.k==='dlg')};
  });
  _SM={key:S.script,v:{n:S.scenes.length,list:list,pre:sp.pre}};return _SM.v;
}
function fmtDur(e){const sec=Math.round(e/8*60);return sec<90?'≈ '+Math.max(5,Math.round(sec/5)*5)+' с':'≈ '+Math.round(sec/60)+' мин'}
const timeKind=s=>/НОЧ/.test(s.time)?'night':(/ДЕНЬ|ДНЁМ|ДНЕМ|УТР|ВЕЧЕР|РАССВЕТ|ЗАКАТ|ПОЛДЕНЬ|СУМЕРК/.test(s.time)?'day':'none');
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=[];for(let j=0;j<=n;j++)p[j]=j;
  for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
const TIME_WORDS=['ДЕНЬ','НОЧЬ','УТРО','ВЕЧЕР','РАССВЕТ','ЗАКАТ','ПОЗЖЕ','ПОЛДЕНЬ','ПОЛНОЧЬ','СУМЕРКИ','ТОТ ЖЕ','ПОТОМ','СПУСТЯ','ДНЁМ','ДНЕМ','ВЕЧЕРОМ','УТРОМ','НОЧЬЮ','МГНОВЕНИЕ'];
function scriptCheck(){
  const out=[],M=sceneModel(),sc=S.scenes,add=(sev,id,t,d,fix)=>out.push({sev:sev,sc:id,t:t,d:d||'',fix:fix||null});
  if(!S.script.trim())return out;
  if(!sc.length){add('err',0,'Сцены не найдены','Каждая сцена должна начинаться с заголовка: «ИНТ.» или «НАТ.», место и время суток. Например: ИНТ. КВАРТИРА МАРИИ — НОЧЬ.');return out}
  if(M.pre&&M.pre.length)add('tip',0,'Перед первой сценой есть текст','Это '+M.pre.length+' '+plural(M.pre.length,'строка','строки','строк')+' (титульный лист или заметки). В разбор они не попадают.');
  const nums=M.list.map(x=>x.num).filter(Boolean);
  if(nums.length>1){for(let i=1;i<nums.length;i++){if(nums[i]!==nums[i-1]+1){add('warn',0,'Номера сцен идут не по порядку','После сцены '+nums[i-1]+' стоит '+nums[i]+'. Проверьте нумерацию.');break}}}
  sc.forEach((s,i)=>{
    const m=M.list[i];
    if(!s.time)add('warn',s.id,'Не указано время суток','Без него сайт не сможет отличить день от ночи в плане съёмок. Добавьте, например: «— ДЕНЬ».');
    else{const w=s.time.split(/[\s,]+/)[0];if(w&&!TIME_WORDS.some(x=>s.time.indexOf(x)===0)){
      const best=TIME_WORDS.map(x=>[x,lev(w,x)]).sort((a,b)=>a[1]-b[1])[0];
      if(best&&best[1]<=2)add('warn',s.id,'Возможно, опечатка во времени суток','Написано «'+s.time+'». Может быть, «'+best[0]+'»?')}}
    if(i>0&&m&&M.list[i-1]&&String(M.list[i-1].head||'').toUpperCase()===String(m.head||'').toUpperCase())add('warn',s.id,'Заголовок повторяет предыдущую сцену','Если действие в том же месте непрерывно, это одна сцена.');
    if(m){
      if(!m.hasBody&&!Object.keys(m.replies).length)add('err',s.id,'Пустая сцена','Под заголовком нет ни действия, ни реплик.');
      m.empty.forEach(n=>add('warn',s.id,'«'+n+'»: нет текста под именем','Строка выглядит как имя персонажа, но реплики под ней нет. Если это не персонаж, напишите её строчными буквами.'));
      if(m.parens)add('warn',s.id,'Не закрыта скобка','Проверьте ремарки в круглых скобках: открывающих и закрывающих должно быть поровну.');
      m.long.forEach(n=>add('tip',s.id,'Очень длинная реплика: '+n,'Больше 600 знаков подряд. В кадре это тяжело, подумайте, не разбить ли её действием или паузой.'));
    }
    if(s.e>=40)add('tip',s.id,'Длинная сцена: '+fmtDur(s.e),'Для короткого метра сцену дольше 5 страниц стоит разбить или сократить.');
  });
  /* персонажи: похожие имена */
  const st=charStats(),names=Object.keys(st),seen={};
  for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){
    const a=names[i],b=names[j],mn=Math.min(a.length,b.length),mx=Math.max(a.length,b.length);
    const near=mn>=4&&lev(a,b)<=(mx>=7?2:1),pref=mn>=3&&(a.indexOf(b+' ')===0||b.indexOf(a+' ')===0);
    if(!near&&!pref)continue;
    const keep=st[a].replies>=st[b].replies?a:b,drop=keep===a?b:a;if(seen[drop])continue;seen[drop]=1;
    add('warn',0,'Один ли это персонаж: «'+a+'» и «'+b+'»?','Имена очень похожи. Если это опечатка, сайт посчитает двух разных людей, а в вызывном листе будет два актёра.',{c:'aiMerge',k:'char',a:drop,b:keep,l:'Объединить: '+drop+' → '+keep});
  }
  /* локации */
  const lk={};sc.forEach(s=>{const k=locKey(s);(lk[k]=lk[k]||{ids:[],types:{}}).ids.push(s.id);lk[k].types[s.type]=1});
  Object.keys(lk).forEach(k=>{const ty=Object.keys(lk[k].types).filter(x=>x!=='ИНТ/НАТ');if(ty.length>1)add('warn',lk[k].ids[0],'«'+k+'»: то интерьер, то натура','Сцены '+lk[k].ids.join(', ')+'. Проверьте, везде ли указано верно: от этого зависит свет и разрешения.')});
  const ks=Object.keys(lk),ls={};
  for(let i=0;i<ks.length;i++)for(let j=i+1;j<ks.length;j++){
    const a=ks[i],b=ks[j],mn=Math.min(a.length,b.length);
    const near=mn>=6&&lev(a,b)<=2,pref=mn>=5&&(a.indexOf(b+' ')===0||b.indexOf(a+' ')===0);
    if(!near&&!pref)continue;
    const keep=lk[a].ids.length>=lk[b].ids.length?a:b,drop=keep===a?b:a;if(ls[drop])continue;ls[drop]=1;
    add('tip',lk[drop].ids[0],'Одна ли это локация: «'+a+'» и «'+b+'»?','Сайт группирует сцены по названию места. Разные написания разведут их по разным съёмочным дням.',{c:'aiMerge',k:'loc',a:drop,b:keep,l:'Объединить: '+drop+' → '+keep});
  }
  /* персонажи с одной репликой */
  const once=names.filter(n=>st[n].replies===1&&names.length>3);
  if(once.length>1)add('tip',0,'Говорят один раз: '+once.slice(0,6).join(', ')+(once.length>6?' и ещё '+(once.length-6):''),'Эпизодические роли — это лишние актёры и смены. Проверьте, нужны ли они.');
  /* производственные советы */
  const nightExt=sc.filter(s=>s.type==='НАТ'&&timeKind(s)==='night').length;
  if(nightExt)add('tip',0,'Ночных съёмок на улице: '+nightExt,'Нужен свет, больше времени на подготовку и разрешение на ночную съёмку.');
  const nl=ks.length;
  if(nl>=5&&nl*2>sc.length)add('tip',0,'Много локаций: '+nl+' на '+sc.length+' сцен','Каждый переезд — потерянные часы и деньги. Для короткого метра чаще всего хватает 2–4 мест.');
  if(names.length>6)add('tip',0,'Много персонажей: '+names.length,'Чем больше актёров, тем сложнее собрать их в один день. Подумайте, кого можно объединить.');
  const order={err:0,warn:1,tip:2};out.sort((x,y)=>order[x.sev]-order[y.sev]||x.sc-y.sc);
  return out;
}
function charStats(){
  const M=sceneModel(),st={};
  S.scenes.forEach((s,i)=>{
    s.chars.forEach(c=>{const n=c.toUpperCase();st[n]=st[n]||{replies:0,scenes:0};st[n].scenes++});
    const m=M.list[i];if(m)Object.keys(m.replies).forEach(n=>{st[n]=st[n]||{replies:0,scenes:0};st[n].replies+=m.replies[n]});
  });
  return st;
}
function barsHtml(title,rows,unit){
  const mx=Math.max.apply(null,rows.map(r=>r.v).concat([1]));
  return '<div class="sc-bars"><h3>'+title+'</h3>'+rows.map(r=>'<div class="sc-bar"><b title="'+esc(r.n)+'">'+esc(r.n)+'</b><span>'+r.l+'</span><i style="--w:'+Math.max(4,Math.round(r.v/mx*100))+'%"></i></div>').join('')+'</div>';
}
function plural(n,a,b,c){const m=n%100,k=n%10;return (m>10&&m<20)?c:(k===1?a:(k>1&&k<5?b:c))}
function summaryHtml(){
  const total=S.scenes.reduce((a,s)=>a+s.e,0),st=charStats(),lk={};
  S.scenes.forEach(s=>{const k=locKey(s);lk[k]=lk[k]||{n:0,e:0};lk[k].n++;lk[k].e+=s.e});
  const chars=Object.keys(st).sort((a,b)=>st[b].replies-st[a].replies||st[b].scenes-st[a].scenes).slice(0,6).map(n=>({n:n,v:st[n].replies||st[n].scenes*0.5,l:st[n].replies+' '+plural(st[n].replies,'реплика','реплики','реплик')+' · '+st[n].scenes+' '+plural(st[n].scenes,'сцена','сцены','сцен')}));
  const locs=Object.keys(lk).sort((a,b)=>lk[b].e-lk[a].e).slice(0,6).map(n=>({n:n,v:lk[n].e,l:lk[n].n+' '+plural(lk[n].n,'сцена','сцены','сцен')+' · '+fmtDur(lk[n].e)}));
  const cnt={day:0,night:0,none:0,int:0,ext:0};S.scenes.forEach(s=>{cnt[timeKind(s)]++;if(s.type==='НАТ')cnt.ext++;else cnt.int++});
  const split=[{n:'День / утро / вечер',v:cnt.day,l:cnt.day+''},{n:'Ночь',v:cnt.night,l:cnt.night+''},{n:'Время не указано',v:cnt.none,l:cnt.none+''},{n:'Интерьер',v:cnt.int,l:cnt.int+''},{n:'Натура',v:cnt.ext,l:cnt.ext+''}].filter(r=>r.v>0);
  return '<div class="stats"><div><b>'+S.scenes.length+'</b><span>'+plural(S.scenes.length,'сцена','сцены','сцен')+'</span></div><div><b>'+Object.keys(lk).length+'</b><span>'+plural(Object.keys(lk).length,'локация','локации','локаций')+'</span></div><div><b>'+Object.keys(st).length+'</b><span>'+plural(Object.keys(st).length,'персонаж','персонажа','персонажей')+'</span></div><div><b>'+eighths(total)+'</b><span>страниц (оценка)</span></div><div><b>'+fmtDur(total).replace('≈ ','≈')+'</b><span>на экране</span></div></div>'+
    '<p class="muted" style="margin:8px 0 0;font-size:14px">Хронометраж грубый: одна страница сценария — около минуты на экране.</p>'+
    '<div class="sc-sum">'+(chars.length?barsHtml('Кто сколько говорит',chars):'')+barsHtml('Где снимаем дольше всего',locs)+barsHtml('День, ночь, интерьер, натура',split)+'</div>';
}
function assistHtml(){
  const is=scriptCheck();
  if(!S.script.trim())return '<p class="muted" style="margin:0">Вставьте сценарий — помощник проверит оформление, имена и последовательность.</p>';
  const cnt={err:0,warn:0,tip:0};is.forEach(x=>cnt[x.sev]++);
  const sum=is.length?[cnt.err?cnt.err+' '+plural(cnt.err,'ошибка','ошибки','ошибок'):'',cnt.warn?cnt.warn+' проверить':'',cnt.tip?cnt.tip+' '+plural(cnt.tip,'совет','совета','советов'):''].filter(Boolean).join(' · '):'Явных проблем не найдено';
  const lab={err:'Ошибка',warn:'Проверьте',tip:'Совет'};
  const items=is.map(x=>{const i=x.sc?S.scenes.findIndex(s=>s.id===x.sc):-1;
    return '<li class="ai ai-'+x.sev+'"><span class="ai-k">'+lab[x.sev]+'</span><div><b>'+esc(x.t)+'</b>'+(x.d?'<p>'+esc(x.d)+'</p>':'')+
      '<div class="row noprint" style="gap:8px;margin-top:6px">'+(i>-1?'<button class="chip" type="button" data-c="scOpen" data-i="'+i+'">Сцена '+x.sc+'</button>':'')+
      (x.fix?'<button class="chip ai-fix" type="button" data-c="aiMerge" data-k="'+x.fix.k+'" data-a="'+esc(x.fix.a)+'" data-b="'+esc(x.fix.b)+'">'+esc(x.fix.l)+'</button>':'')+'</div></div></li>'}).join('');
  return '<p class="ai-sum"><b>'+sum+'</b></p>'+(items?'<ul class="ai-list">'+items+'</ul>':'')+
    '<p class="muted" style="margin:12px 0 0;font-size:14px">Помощник проверяет оформление и последовательность по правилам. Сюжет он не оценивает и текст не переписывает.</p>';
}
function sceneIssueCount(id){return scriptCheck().filter(x=>x.sc===id).length}
function scenesHtml(){
  if(!S.scenes.length)return '<div class="empty"><b>Сцен пока нет</b>Вставьте текст сценария или загрузите файл. Сцены найдутся сами. Можно загрузить пример проекта в меню слева.</div>';
  const iss=scriptCheck(),by={};iss.forEach(x=>{if(x.sc)by[x.sc]=(by[x.sc]||0)+1});
  return '<div class="scl">'+S.scenes.map((s,i)=>{
    const mk=timeKind(s),n=by[s.id]||0;
    return '<article class="scc"><button class="scc-main" type="button" data-c="scOpen" data-i="'+i+'" aria-label="Открыть сцену '+s.id+'"><span class="scc-n">'+s.id+'</span><span class="scc-t"><b>'+esc(s.type)+'. '+esc(s.loc||'без названия')+'</b><small>'+(s.time?esc(s.time):'время не указано')+' · '+fmtDur(s.e)+(n?' · <em>'+n+' '+plural(n,'замечание','замечания','замечаний')+'</em>':'')+'</small></span><span class="scc-go" aria-hidden="true">›</span></button>'+
      (s.chars.length?'<div class="scc-ch">'+s.chars.map(c=>'<span class="tag">'+esc(c)+'</span>').join('')+'</div>':'')+
      '<details class="scc-ed"><summary>Изменить данные сцены</summary><div class="scc-f">'+
      '<label>Тип<select data-a="scene" data-id="'+s.id+'" data-f="type">'+['ИНТ','НАТ','ИНТ/НАТ'].map(t=>'<option'+(t===s.type?' selected':'')+'>'+t+'</option>').join('')+'</select></label>'+
      '<label>Локация<input data-a="scene" data-id="'+s.id+'" data-f="loc" value="'+esc(s.loc)+'"></label>'+
      '<label>Время суток<input data-a="scene" data-id="'+s.id+'" data-f="time" value="'+esc(s.time)+'"></label>'+
      '<label>Персонажи<input data-a="scene" data-id="'+s.id+'" data-f="chars" value="'+esc(s.chars.join(', '))+'" placeholder="через запятую"></label></div></details></article>';
  }).join('')+'</div>';
}
function scriptDerived(){
  const body=S.scenes.length?summaryHtml():'';
  return (S.scenes.length?panel('ssum','list','Итоги и хронометраж',body):'')+
    (S.script.trim()?panel('sai','check','Помощник: ошибки и несостыковки',assistHtml()):'')+
    panel('sscenes','list','Сцены'+(S.scenes.length?' ('+S.scenes.length+')':''),scenesHtml());
}
function refreshScriptDerived(){const el=$('#scDer');if(el)el.innerHTML=scriptDerived()}
function silentParse(){
  const sig=a=>a.map(x=>x.id+'|'+x.loc+'|'+x.time).join('#'),before=sig(S.scenes),keep=S.assign;
  S.scenes=parseScript(S.script);
  if(S.scenes.length&&sig(S.scenes)===before)S.assign=keep;else{S.assign={};autoPlan()}
  save();refreshScriptDerived();
}
function aiMerge(k,a,b){
  const lines=S.script.replace(/\r/g,'').split('\n');let n=0;
  const out=lines.map(raw=>{
    const line=raw.trim();
    if(k==='char'){
      if(isCue(line)&&cueName(line)===a){n++;return raw.replace(new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),b)}
      const mc=line.match(/^([А-ЯЁA-Z][А-ЯЁA-Z0-9 .'\-]{1,22})(?=\s*(?:\([^)]*\))?\s*[:—]\s+\S)/);
      if(mc&&mc[1].trim().toUpperCase()===a){n++;return raw.replace(mc[1].trim(),b)}
      return raw;
    }
    const m=line.match(HEAD);
    if(m&&locKey({loc:m[3].trim().split(/\s*[-–—]\s+/)[0]})===a){n++;return raw.replace(new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),b)}
    return raw;
  });
  if(!n){toast('Не нашёл, что заменить');return}
  applyScript(out.join('\n'),'Объединено: '+a+' → '+b+' (правок: '+n+')');
}
/* просмотр сцены */
let SV=null;
function scvHtml(){
  const M=sceneModel(),i=SV.i,s=S.scenes[i],m=M.list[i];if(!s)return '';
  const iss=scriptCheck().filter(x=>x.sc===s.id);
  const lab={err:'Ошибка',warn:'Проверьте',tip:'Совет'};
  const body=m?m.blocks.map(b=>{
    if(b.k==='cue')return '<p class="sv-cue">'+esc(b.t)+'</p>';
    if(b.k==='par')return '<p class="sv-par">'+esc(b.t)+'</p>';
    if(b.k==='dlg')return '<p class="sv-dlg">'+esc(b.t)+'</p>';
    return '<p class="sv-act">'+esc(b.t)+'</p>';
  }).join(''):'';
  return '<div class="scv-top"><button class="btn sec" type="button" data-c="scNav" data-d="-1"'+(i>0?'':' disabled')+' aria-label="Предыдущая сцена">‹</button><b class="scv-n">Сцена '+s.id+' из '+S.scenes.length+'</b><button class="btn sec" type="button" data-c="scNav" data-d="1"'+(i<S.scenes.length-1?'':' disabled')+' aria-label="Следующая сцена">›</button><span style="flex:1"></span><button class="btn" type="button" data-c="scClose">Закрыть</button></div>'+
    '<div class="scv-body"><div class="scv-page"><h2 class="sv-head">'+esc(s.type)+'. '+esc(s.loc)+(s.time?' — '+esc(s.time):'')+'</h2>'+
    '<p class="sv-meta">'+fmtDur(s.e)+' · '+(s.chars.length?esc(s.chars.join(', ')):'без реплик')+'</p>'+(body||'<p class="muted">В этой сцене пока нет текста.</p>')+'</div>'+
    (iss.length?'<div class="scv-ai"><h3>Помощник по этой сцене</h3><ul class="ai-list">'+iss.map(x=>'<li class="ai ai-'+x.sev+'"><span class="ai-k">'+lab[x.sev]+'</span><div><b>'+esc(x.t)+'</b>'+(x.d?'<p>'+esc(x.d)+'</p>':'')+'</div></li>').join('')+'</ul></div>':'')+'</div>';
}
function scvOpen(i){
  if(!S.scenes[i])return;SV={i:i};
  let el=$('#scv');if(!el){el=document.createElement('div');el.id='scv';el.className='scv';el.setAttribute('role','dialog');el.setAttribute('aria-label','Просмотр сцены');document.body.appendChild(el);document.body.style.overflow='hidden'}
  el.innerHTML=scvHtml();const bd=$('#scv .scv-body');if(bd)bd.scrollTop=0;
}
function scvClose(){const el=$('#scv');if(el)el.remove();document.body.style.overflow='';SV=null}
document.addEventListener('keydown',e=>{
  if(!SV)return;
  if(e.key==='Escape'){scvClose();return}
  if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
  if(e.key==='ArrowRight')scvOpen(Math.min(S.scenes.length-1,SV.i+1));
  else if(e.key==='ArrowLeft')scvOpen(Math.max(0,SV.i-1));
});
function vScript(){
  if(S.script.trim()&&!S.scenes.length){S.scenes=parseScript(S.script);if(S.scenes.length){S.assign={};autoPlan()}}
  const text='<textarea class="script" data-a="script" placeholder="ИНТ. КВАРТИРА МАРИИ — НОЧЬ&#10;&#10;Мария сидит у окна.&#10;&#10;МАРИЯ&#10;Позвони. Просто позвони." aria-label="Текст сценария">'+esc(S.script)+'</textarea>'+
    '<p class="muted" style="margin:10px 0 0;font-size:14px">Сцены находятся сами, когда вы вставляете или правите текст. Загружаются PDF, Word (.docx), Final Draft (.fdx), .txt, .md и .fountain. PDF-скан без текстового слоя прочитать не получится.</p>';
  return hd('Сценарий','Вставьте текст или загрузите файл. Сайт сам найдёт сцены, локации и персонажей, посчитает хронометраж и подскажет, что проверить. Сцены ищутся по заголовкам вида «ИНТ. КВАРТИРА — НОЧЬ», персонажи — по репликам заглавными буквами.','<label class="btn" for="fileIn" style="cursor:pointer">'+icon('upload')+'Загрузить файл</label><input class="sr" id="fileIn" type="file" accept=".pdf,.txt,.md,.fountain,.text,.docx,.fdx,application/pdf,text/plain" data-a="upload">'+(S.script.trim()?dlMenu(ddi('data-c="dlScriptDocx"','Word (.docx)')+(S.scenes.length?ddi('data-c="dlScriptBd"','Сценарий и разбор (.docx)'):'')+ddi('data-c="dlScript"','Текст (.txt)')):''))+
    '<div class="col">'+panel('stext','script','Текст сценария',text)+'<div id="scDer" style="display:contents">'+scriptDerived()+'</div></div>';
}

