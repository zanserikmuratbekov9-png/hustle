/* ---------- заметки режиссёра по сценам ---------- */
const NOTE_ST={draft:'Черновик',fix:'Доработать',ok:'Утверждена'};
function vNotes(){
  const head=hd('Заметки по сценам','Для каждой сцены — что нужно доработать и статус.',S.scenes.length?dlMenu(ddi('data-c="print"','PDF через печать')):'');
  if(!S.scenes.length)return head+NEED_SCENES('Загрузите или вставьте сценарий и разберите его на сцены.');
  const cnt={draft:0,fix:0,ok:0};
  const rows=S.scenes.map(s=>{
    const n=S.notes[s.id]||{text:'',status:'draft'};cnt[n.status||'draft']++;
    return '<div class="note-box"><div class="row" style="justify-content:space-between"><b>Сц. '+s.id+' — '+esc(s.type)+'. '+esc(s.loc)+(s.time?', '+esc(s.time):'')+'</b>'+
      '<select data-a="nstatus" data-r="1" data-id="'+s.id+'" aria-label="Статус сцены '+s.id+'" style="background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:8px 10px">'+Object.keys(NOTE_ST).map(k=>'<option value="'+k+'"'+((n.status||'draft')===k?' selected':'')+'>'+NOTE_ST[k]+'</option>').join('')+'</select></div>'+
      '<textarea data-a="ntext" data-id="'+s.id+'" placeholder="Что доработать: мотивация героя, диалог, темп, подтекст…" aria-label="Заметка к сцене '+s.id+'">'+esc(n.text||'')+'</textarea>'+
      '</div>';
  }).join('');
  const stats='<div class="stats"><div><b>'+cnt.ok+' из '+S.scenes.length+'</b><span>сцен утверждено</span></div><div><b>'+cnt.fix+'</b><span>на доработке</span></div><div><b>'+cnt.draft+'</b><span>черновики</span></div></div>';
  return head+'<div class="col"><section class="panel">'+stats+'</section>'+panel('nlist','note','Сцены','<div class="col">'+rows+'</div>')+'</div>';
}

/* ---------- экспликация ---------- */
const EX_FIELDS=[['logline','Логлайн','Одно предложение: кто, чего хочет и что мешает.'],['theme','Тема','О чём фильм на самом деле?'],['tone','Тон и настроение','Три слова, музыка и цвета-ассоциации.'],['visual','Визуальный язык и референсы','Фильмы, фотографы, палитра, ссылки.'],['actors','Работа с актёрами','Как репетируем и чего ждём от игры.'],['rhythm','Ритм и монтаж','Длинные планы или нарезка, темп.'],['sound','Звук и музыка','Тишина, шумы, музыкальные акценты.']];
function exText(){return EX_FIELDS.map(f=>f[1]+':\n'+((S.explic[f[0]]||'').trim()||'—')).join('\n\n')}
function vExplic(){
  const fields='<div class="fields" style="grid-template-columns:1fr">'+EX_FIELDS.map(f=>'<label>'+f[1]+' <span style="font-weight:400">— '+f[2]+'</span><textarea rows="3" data-a="ex" data-f="'+f[0]+'">'+esc(S.explic[f[0]]||'')+'</textarea></label>').join('')+
    '</div>';
  return hd('Экспликация','Режиссёрское видение фильма на одной странице. Пригодится на защите проекта и чтобы команда понимала, что вы снимаете.',dlMenu(ddi('data-c="explicCopy"','Скопировать текст')+ddi('data-c="print"','PDF через печать')))+'<div class="col">'+panel('exp','megaphone','Видение фильма',fields)+'</div>';
}

/* ---------- КПП: календарно-постановочный план ---------- */
function kppSummary(i){try{const m=sceneModel().list[i];if(!m)return '';const a=m.blocks.find(b=>b.k==='act');const t=a?a.t:'';return t.length>110?t.slice(0,108).replace(/\s+\S*$/,'')+'…':t}catch(e){return ''}}
function kppDate(v){if(!v)return '';const d=new Date(v+'T12:00:00');return isNaN(d)?v:d.toLocaleDateString('ru-RU',{weekday:'short',day:'numeric',month:'long'})}
/* поля сцены в КПП: массовка, реквизит/транспорт/спецэффекты, примечание (старые записи — строка-примечание) */
function kppF(id,f){const v=S.kpp[id];if(typeof v==='string')return f==='n'?v:'';return (v&&typeof v==='object'&&v[f])||''}
function kppSet(id,f,val){let v=S.kpp[id];if(!v||typeof v!=='object')v={n:typeof v==='string'?v:''};v[f]=val;S.kpp[id]=v}
function kppIO(s){const t=String(s.type||'').toUpperCase();return /ИНТ/.test(t)&&/НАТ/.test(t)?'Инт./Нат.':/НАТ/.test(t)?'Нат.':/ИНТ/.test(t)?'Инт.':(s.type||'')}
function kppMode(s){const t=String(s.time||'').trim();return t?t.charAt(0).toUpperCase()+t.slice(1).toLowerCase():'—'}
function kppMin(e){return Math.max(0.1,Math.round(e/8*10)/10)}
function kppDays(){ensurePlan();const idx={};S.scenes.forEach((s,i)=>idx[s.id]=i);const out=[];
  for(let d=1;d<=maxDay();d++){const sc=S.scenes.filter(s=>S.assign[s.id]===d);if(!sc.length)continue;
    sc.sort((a,b)=>locKey(a)<locKey(b)?-1:locKey(a)>locKey(b)?1:0);
    const inf=S.cs.info[d]||{},e=sc.reduce((a,s)=>a+s.e,0),locs=[];sc.forEach(s=>{const k=s.loc||'—';if(locs.indexOf(k)<0)locs.push(k)});
    out.push({d,date:inf.date||'',call:inf.call||'',addr:inf.addr||'',sc,e,locs,night:sc.some(s=>/НОЧ/i.test(s.time)),idx})}
  return out}
function kppPeriod(days){const ds=days.map(x=>x.date).filter(Boolean).sort();if(!ds.length)return 'даты не указаны';const f=v=>{const d=new Date(v+'T12:00:00');return d.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})};return ds.length>1?f(ds[0])+' — '+f(ds[ds.length-1]):f(ds[0])}
const KPP_COLS=['№ сц.','Объект (место съёмки)','Инт./Нат.','Режим','Краткое содержание','Персонажи','Массовка, групповка','Реквизит, транспорт, спецэффекты','Стр.','Хрон., мин','Примечание'];
function kppDayTitle(x){return 'СМЕНА '+x.d+(x.date?' · '+kppDate(x.date):' · дата не указана')+(x.call?' · сбор '+x.call:'')+(x.addr?' · '+x.addr:'')+(x.night?' · НОЧНАЯ СМЕНА':'')}
function kppSceneRow(s,x){return [String(s.id),s.loc||'—',kppIO(s),kppMode(s),kppSummary(x.idx[s.id])||'',s.chars.join(', '),kppF(s.id,'m'),kppF(s.id,'r'),eighths(s.e),kppMin(s.e),kppF(s.id,'n')]}
function kppMetaLines(days){const tot=S.scenes.reduce((a,s)=>a+s.e,0);return [
  ['Фильм',S.name],['Режиссёр-постановщик',S.cs.director||'—'],['Оператор-постановщик',(S.kppMeta&&S.kppMeta.dop)||'—'],['Продюсер',S.cs.producer||'—'],
  ['Период съёмок',kppPeriod(days)],['Всего',days.length+' '+plural(days.length,'смена','смены','смен')+' · '+S.scenes.length+' '+plural(S.scenes.length,'сцена','сцены','сцен')+' · '+eighths(tot)+' стр. · ≈ '+kppMin(tot)+' мин экранного времени']]}
function kppRows(){const days=kppDays(),out=[KPP_COLS.slice()];days.forEach(x=>{out.push([kppDayTitle(x)]);x.sc.forEach(s=>out.push(kppSceneRow(s,x)));out.push(['','Итого за смену: '+x.sc.length+' сц.','','','','','','',eighths(x.e),kppMin(x.e),''])});return out}
/* документ для PDF и Word */
function kppBlocks(){
  const days=kppDays(),b=[{t:'КАЛЕНДАРНО-ПОСТАНОВОЧНЫЙ ПЛАН',b:true,size:16,center:true},{t:'«'+S.name+'»',b:true,center:true,after:160}];
  b.push({table:kppMetaLines(days).map(r=>[r[0],r[1]]),meta:true,widths:[3600,11800]});
  const body=[KPP_COLS.slice()];
  days.forEach(x=>{body.push([{content:kppDayTitle(x),colSpan:11,day:true}]);x.sc.forEach(s=>body.push(kppSceneRow(s,x).map(String)));
    body.push([{content:'Итого за смену '+x.d+': '+x.sc.length+' сц.',colSpan:8,total:true},{content:eighths(x.e),total:true},{content:String(kppMin(x.e)),total:true},{content:'',total:true}])});
  b.push({table:body,head:true,kpp:true,widths:[520,1700,820,820,3500,1500,1300,1700,600,740,2000]});
  b.push({t:'Утверждаю: продюсер ______________________ / '+(S.cs.producer||'')+'          Режиссёр-постановщик ______________________ / '+(S.cs.director||''),after:200});
  return b}
/* Excel с оформлением: шапка, строки смен, итоги, перенос текста, альбомная печать */
function kppXlsx(){
  const days=kppDays(),R=[],st=[],mg=[];const add=(r,s)=>{R.push(r);st.push(s)};
  add(['КАЛЕНДАРНО-ПОСТАНОВОЧНЫЙ ПЛАН'],4);mg.push('A1:K1');
  kppMetaLines(days).forEach(r=>{add([r[0],'','',r[1]],5);mg.push('A'+R.length+':C'+R.length,'D'+R.length+':K'+R.length)});
  add([],0);add(KPP_COLS.slice(),1);const hr=R.length;
  days.forEach(x=>{add([kppDayTitle(x)],2);mg.push('A'+R.length+':K'+R.length);
    x.sc.forEach(s=>add(kppSceneRow(s,x),0));
    add(['','Итого за смену: '+x.sc.length+' сц.','','','','','','',eighths(x.e),kppMin(x.e),''],3)});
  add([],0);add(['Утверждаю: продюсер ____________ / '+(S.cs.producer||'')+'      Режиссёр-постановщик ____________ / '+(S.cs.director||'')],0);mg.push('A'+R.length+':K'+R.length);
  const W=[7,26,9,10,46,24,18,28,7,9,26];
  const sd=R.map((r,ri)=>'<row r="'+(ri+1)+'"'+(st[ri]===4?' ht="26" customHeight="1"':st[ri]===2?' ht="22" customHeight="1"':'')+'>'+r.map((c,ci)=>{const ref=colL(ci)+(ri+1),sa=' s="'+(st[ri]===5?(ci?6:5):st[ri])+'"';
    if(c==null||c==='')return st[ri]===2||st[ri]===3||st[ri]===1?'<c r="'+ref+'"'+sa+'/>':'';
    if(typeof c==='number')return '<c r="'+ref+'"'+sa+'><v>'+c+'</v></c>';
    return '<c r="'+ref+'" t="inlineStr"'+sa+'><is><t xml:space="preserve">'+xe(c)+'</t></is></c>'}).join('')+'</row>').join('');
  const M='http://schemas.openxmlformats.org/spreadsheetml/2006/main',RL='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const B='<border><left style="thin"><color rgb="FF9AA3B8"/></left><right style="thin"><color rgb="FF9AA3B8"/></right><top style="thin"><color rgb="FF9AA3B8"/></top><bottom style="thin"><color rgb="FF9AA3B8"/></bottom><diagonal/></border>';
  const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="'+M+'">'+
    '<fonts count="4"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font><font><b/><sz val="10"/><name val="Arial"/></font><font><b/><sz val="15"/><name val="Arial"/></font></fonts>'+
    '<fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1E3A8A"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFE08A"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEEF1F8"/></patternFill></fill></fills>'+
    '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>'+B+'</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
    '<cellXfs count="7">'+
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>'+
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>'+
    '<xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>'+
    '<xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>'+
    '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'+
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1"/>'+
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>'+
    '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  const sheet='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="'+M+'" xmlns:r="'+RL+'"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0"><pane ySplit="'+hr+'" topLeftCell="A'+(hr+1)+'" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'+
    '<cols>'+W.map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join('')+'</cols><sheetData>'+sd+'</sheetData>'+
    '<mergeCells count="'+mg.length+'">'+mg.map(m=>'<mergeCell ref="'+m+'"/>').join('')+'</mergeCells>'+
    '<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>';
  const wb='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="'+M+'" xmlns:r="'+RL+'"><sheets><sheet name="КПП" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm.Print_Titles" localSheetId="0">\'КПП\'!$'+hr+':$'+hr+'</definedName></definedNames></workbook>';
  return makeZip([
    {name:'[Content_Types].xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'},
    {name:'_rels/.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+RL+'/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
    {name:'xl/workbook.xml',data:wb},
    {name:'xl/_rels/workbook.xml.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+RL+'/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="'+RL+'/styles" Target="styles.xml"/></Relationships>'},
    {name:'xl/styles.xml',data:styles},
    {name:'xl/worksheets/sheet1.xml',data:sheet}])}
function kppFile(){return 'kpp-'+String(S.name||'proekt').toLowerCase().replace(/[^a-zа-яё0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,40)}
function vKpp(){
  const can=S.scenes.length;
  const dl=can?dd(icon('download')+'Скачать КПП',ddi('data-c="kppXlsx"','Excel (.xlsx)')+ddi('data-c="kppPdf"','PDF (альбомный лист)')+ddi('data-c="kppDocx"','Word (.docx)')+ddi('data-c="kppCopy"','Скопировать для таблицы')+ddi('data-c="print"','Распечатать'),{right:true,primary:true}):'';
  const head=hd('КПП','Календарно-постановочный план — как на площадке: по сменам — объекты, интерьер или натура, режим, сцены, персонажи, массовка, реквизит, объём и хронометраж. Собирается сам из сценария и плана съёмок; даты и время сбора общие с вызывным листом.',dl);
  if(!can)return head+NEED_SCENES('КПП строится по сценам — сначала вставьте сценарий.');
  const days=kppDays(),tot=S.scenes.reduce((a,s)=>a+s.e,0);
  const inp=(a,f,v,ph,extra)=>'<input data-a="'+a+'"'+(f?' data-f="'+f+'"':'')+(extra||'')+' value="'+esc(v)+'" placeholder="'+ph+'">';
  const meta='<section class="panel kpp-doc"><div class="kpp-title"><small>Календарно-постановочный план</small><b>«'+esc(S.name)+'»</b></div>'+
    '<div class="fields kpp-meta"><label>Режиссёр-постановщик'+inp('cs','director',S.cs.director||'','Имя и фамилия')+'</label><label>Оператор-постановщик'+inp('kppmeta','dop',(S.kppMeta&&S.kppMeta.dop)||'','Имя и фамилия')+'</label><label>Продюсер'+inp('cs','producer',S.cs.producer||'','Имя и фамилия')+'</label></div>'+
    '<div class="stats" style="margin-top:14px"><div><b>'+days.length+'</b><span>смен</span></div><div><b>'+S.scenes.length+'</b><span>сцен</span></div><div><b>'+eighths(tot)+'</b><span>страниц</span></div><div><b>≈ '+kppMin(tot)+'</b><span>мин экранного времени</span></div><div><b style="font-size:16px;line-height:1.3">'+esc(kppPeriod(days))+'</b><span>период съёмок</span></div></div>'+
    '<p class="muted noprint" style="margin:12px 0 0;font-size:14px">Порядок сцен внутри смены — по объектам, чтобы не переезжать лишний раз. Переставить сцену в другую смену можно в «Плане съёмок».</p></section>';
  const daysHtml=days.map(x=>{
    const rows=x.sc.map(s=>'<tr><td class="c"><b>'+s.id+'</b></td><td><b>'+esc(s.loc||'—')+'</b></td><td class="c">'+esc(kppIO(s))+'</td><td class="c">'+esc(kppMode(s))+'</td>'+
      '<td class="kpp-sum">'+esc(kppSummary(x.idx[s.id])||'—')+'</td><td>'+(s.chars.length?esc(s.chars.join(', ')):'<span class="muted">—</span>')+'</td>'+
      '<td>'+inp('kppf','m',kppF(s.id,'m'),'Нет',' data-id="'+s.id+'" aria-label="Массовка, сцена '+s.id+'"')+'</td>'+
      '<td>'+inp('kppf','r',kppF(s.id,'r'),'Машина, дождь…',' data-id="'+s.id+'" aria-label="Реквизит, транспорт, спецэффекты, сцена '+s.id+'"')+'</td>'+
      '<td class="r">'+eighths(s.e)+'</td><td class="r">'+kppMin(s.e)+'</td>'+
      '<td>'+inp('kppf','n',kppF(s.id,'n'),'',' data-id="'+s.id+'" aria-label="Примечание, сцена '+s.id+'"')+'</td></tr>').join('');
    const bar='<div class="kpp-bar"><label>Дата <input type="date" data-a="kppdate" data-d="'+x.d+'" value="'+esc(x.date)+'"></label><label>Сбор <input type="time" data-a="kppcall" data-d="'+x.d+'" value="'+esc(x.call)+'"></label>'+
      x.locs.map(l=>'<span class="tag">'+esc(l)+'</span>').join('')+(x.night?'<span class="tag kpp-night">ночная смена</span>':'')+'</div>';
    const table='<div class="tw"><table class="grid kpp-t"><thead><tr>'+KPP_COLS.map((c,i)=>'<th'+(i>=8&&i<=9?' class="r"':'')+'>'+c+'</th>').join('')+'</tr></thead><tbody>'+rows+
      '<tr class="kpp-tot"><td colspan="8">Итого за смену: '+x.sc.length+' сц.</td><td class="r">'+eighths(x.e)+'</td><td class="r">'+kppMin(x.e)+'</td><td></td></tr></tbody></table></div>';
    return panel('kpp'+x.d,'schedule','Смена '+x.d+(x.date?' · '+esc(kppDate(x.date)):''),bar+table,{right:'<span class="muted">'+x.sc.length+' сц. · '+eighths(x.e)+' стр.</span>'});
  }).join('');
  return head+'<div class="col">'+meta+daysHtml+'</div>';
}

