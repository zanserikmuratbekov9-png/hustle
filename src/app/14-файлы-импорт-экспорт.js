/* ---------- импорт Word (.docx) и Final Draft (.fdx) ---------- */
async function inflateRaw(bytes){
  if(typeof DecompressionStream==='undefined')throw new Error('no-ds');
  const ds=new DecompressionStream('deflate-raw'),w=ds.writable.getWriter();w.write(bytes);w.close();
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}
async function zipEntry(buf,want){
  const u=new Uint8Array(buf),dv=new DataView(buf);let e=-1;
  for(let i=u.length-22;i>=Math.max(0,u.length-70000);i--){if(dv.getUint32(i,true)===0x06054b50){e=i;break}}
  if(e<0)throw new Error('bad-zip');
  let n=dv.getUint16(e+10,true),p=dv.getUint32(e+16,true);
  for(let k=0;k<n;k++){
    if(dv.getUint32(p,true)!==0x02014b50)break;
    const method=dv.getUint16(p+10,true),csize=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),off=dv.getUint32(p+42,true);
    const name=new TextDecoder().decode(u.subarray(p+46,p+46+nl));
    if(name===want){
      const ln=dv.getUint16(off+26,true),le=dv.getUint16(off+28,true),st=off+30+ln+le,data=u.subarray(st,st+csize);
      return method===0?data:await inflateRaw(data);
    }
    p+=46+nl+el+cl;
  }
  throw new Error('no-entry');
}
async function docxText(buf){
  const xml=new TextDecoder('utf-8').decode(await zipEntry(buf,'word/document.xml'));
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  if(doc.getElementsByTagName('parsererror').length)throw new Error('bad-xml');
  const out=[];
  Array.from(doc.getElementsByTagName('w:p')).forEach(par=>{
    let line='';
    Array.from(par.getElementsByTagName('*')).forEach(n=>{
      if(n.nodeName==='w:t')line+=n.textContent;else if(n.nodeName==='w:tab')line+=' ';else if(n.nodeName==='w:br')line+='\n';
    });
    out.push(line);
  });
  return out.join('\n').replace(/\n{3,}/g,'\n\n');
}
function fdxText(xml){
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  if(doc.getElementsByTagName('parsererror').length)throw new Error('bad-xml');
  const out=[];
  Array.from(doc.getElementsByTagName('Paragraph')).forEach(par=>{
    const type=par.getAttribute('Type')||'',txt=Array.from(par.getElementsByTagName('Text')).map(x=>x.textContent).join('').trim();
    if(!txt)return;
    if(type==='Scene Heading'){out.push('',txt.toUpperCase())}
    else if(type==='Character'){out.push('',txt.toUpperCase())}
    else if(type==='Action'){out.push('',txt)}
    else out.push(txt);
  });
  return out.join('\n').trim();
}

/* ---------- файлы: zip, docx, xlsx, csv ---------- */
const CRC_T=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRC_T[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
const U8=x=>new TextEncoder().encode(x);
const xe=x=>String(x==null?'':x).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function makeZip(files){
  const parts=[],cd=[],d=new Date();let off=0;
  const dt=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1),dd=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
  files.forEach(f=>{
    const nm=U8(f.name),data=typeof f.data==='string'?U8(f.data):f.data,crc=crc32(data);
    const lh=new DataView(new ArrayBuffer(30));
    lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(10,dt,true);lh.setUint16(12,dd,true);lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,nm.length,true);
    parts.push(new Uint8Array(lh.buffer),nm,data);
    const ch=new DataView(new ArrayBuffer(46));
    ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(12,dt,true);ch.setUint16(14,dd,true);ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
    cd.push(new Uint8Array(ch.buffer),nm);
    off+=30+nm.length+data.length;
  });
  const cdLen=cd.reduce((a,x)=>a+x.length,0),end=new DataView(new ArrayBuffer(22));
  end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cdLen,true);end.setUint32(16,off,true);
  const all=parts.concat(cd,[new Uint8Array(end.buffer)]),out=new Uint8Array(all.reduce((a,x)=>a+x.length,0));let q=0;
  all.forEach(x=>{out.set(x,q);q+=x.length});return out;
}
function docxPara(t,o){
  o=o||{};const sz=o.size?'<w:sz w:val="'+(o.size*2)+'"/>':'',rpr=(o.b||sz)?'<w:rPr>'+(o.b?'<w:b/>':'')+sz+'</w:rPr>':'';
  const runs=String(t).split('\n').map((l,i)=>(i?'<w:r>'+rpr+'<w:br/></w:r>':'')+'<w:r>'+rpr+'<w:t xml:space="preserve">'+xe(l)+'</w:t></w:r>').join('');
  return '<w:p><w:pPr>'+(o.pb?'<w:pageBreakBefore/>':'')+(o.keep?'<w:keepNext/>':'')+'<w:spacing w:before="'+(o.before||0)+'" w:after="'+(o.after==null?100:o.after)+'"/>'+(o.center?'<w:jc w:val="center"/>':'')+'</w:pPr>'+runs+'</w:p>';
}
function docxTable(rows,head,widths){
  const cell=c=>{if(c&&typeof c==='object'){const fill=c.fill||(c.day?'FFE08A':c.total?'EEF1F8':'');return '<w:tc><w:tcPr>'+(c.colSpan>1?'<w:gridSpan w:val="'+c.colSpan+'"/>':'')+(fill?'<w:shd w:val="clear" w:color="auto" w:fill="'+fill+'"/>':'')+'</w:tcPr>'+docxPara(c.content,{b:true,after:40})+'</w:tc>'}return null};
  const bd=['top','left','bottom','right','insideH','insideV'].map(k=>'<w:'+k+' w:val="single" w:sz="4" w:space="0" w:color="888888"/>').join('');
  return '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>'+bd+'</w:tblBorders>'+(widths?'<w:tblLayout w:type="fixed"/>':'')+'</w:tblPr>'+(widths?'<w:tblGrid>'+widths.map(w=>'<w:gridCol w:w="'+w+'"/>').join('')+'</w:tblGrid>':'')+rows.map((r,i)=>'<w:tr>'+r.map(c=>cell(c)||('<w:tc><w:tcPr/>'+docxPara(c,{b:head&&i===0,after:40})+'</w:tc>')).join('')+'</w:tr>').join('')+'</w:tbl>'+docxPara('',{after:60});
}
function makeDocx(blocks,opt){
  opt=opt||{};
  const body=blocks.map(b=>typeof b==='string'?docxPara(b):(b.table?docxTable(b.table,b.head,b.widths):docxPara(b.t,b))).join('');
  const ns='xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
  return makeZip([
    {name:'[Content_Types].xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'},
    {name:'_rels/.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'},
    {name:'word/_rels/document.xml.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'},
    {name:'word/styles.xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles '+ns+'><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri" w:eastAsia="Calibri"/><w:sz w:val="22"/><w:lang w:val="ru-RU"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>'},
    {name:'word/document.xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document '+ns+'><w:body>'+body+''+(opt.landscape?'<w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="500" w:footer="500" w:gutter="0"/></w:sectPr>':'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>')+'</w:body></w:document>'}
  ]);
}
const colL=i=>{let r='';i++;while(i>0){const m=(i-1)%26;r=String.fromCharCode(65+m)+r;i=Math.floor((i-1)/26)}return r};
function makeXlsx(rows,sheet,widths){
  const sd=rows.map((r,ri)=>'<row r="'+(ri+1)+'">'+r.map((c,ci)=>{
    const ref=colL(ci)+(ri+1),st=ri===0?' s="1"':'';
    if(c==null||c==='')return '';
    if(typeof c==='number')return '<c r="'+ref+'"'+st+'><v>'+(isFinite(c)?c:0)+'</v></c>';
    if(typeof c==='object')return '<c r="'+ref+'"><f>'+xe(c.f)+'</f><v>'+(isFinite(c.v)?c.v:0)+'</v></c>';
    return '<c r="'+ref+'" t="inlineStr"'+st+'><is><t xml:space="preserve">'+xe(c)+'</t></is></c>';
  }).join('')+'</row>').join('');
  const cols=(widths||[]).length?'<cols>'+widths.map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join('')+'</cols>':'';
  const M='http://schemas.openxmlformats.org/spreadsheetml/2006/main',RL='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const nm=xe(String(sheet||'Лист1').replace(/[\[\]:*?\/\\]/g,' ').slice(0,31)||'Лист1');
  return makeZip([
    {name:'[Content_Types].xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'},
    {name:'_rels/.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+RL+'/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
    {name:'xl/workbook.xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="'+M+'" xmlns:r="'+RL+'"><sheets><sheet name="'+nm+'" sheetId="1" r:id="rId1"/></sheets></workbook>'},
    {name:'xl/_rels/workbook.xml.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+RL+'/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="'+RL+'/styles" Target="styles.xml"/></Relationships>'},
    {name:'xl/styles.xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="'+M+'"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>'},
    {name:'xl/worksheets/sheet1.xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="'+M+'">'+cols+'<sheetData>'+sd+'</sheetData></worksheet>'}
  ]);
}
function csvParse(text){
  const first=text.split('\n')[0]||'',cnt=c=>first.split(c).length-1,sep=[';','\t',','].reduce((a,c)=>cnt(c)>cnt(a)?c:a,';');
  const rows=[];let row=[],cell='',q=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(q){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++}else q=false}else cell+=ch}
    else if(ch==='"')q=true;
    else if(ch===sep){row.push(cell);cell=''}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell=''}
    else cell+=ch;
  }
  if(cell!==''||row.length){row.push(cell);rows.push(row)}
  return rows;
}
async function xlsxRows(buf){
  let ss=[];
  try{const d=new DOMParser().parseFromString(new TextDecoder().decode(await zipEntry(buf,'xl/sharedStrings.xml')),'application/xml');ss=Array.from(d.getElementsByTagName('si')).map(si=>Array.from(si.getElementsByTagName('t')).map(t=>t.textContent).join(''))}catch(e){}
  const d=new DOMParser().parseFromString(new TextDecoder().decode(await zipEntry(buf,'xl/worksheets/sheet1.xml')),'application/xml');
  if(d.getElementsByTagName('parsererror').length)throw new Error('bad-xml');
  const rows=[];
  Array.from(d.getElementsByTagName('row')).forEach(r=>{
    const row=[];
    Array.from(r.getElementsByTagName('c')).forEach(c=>{
      const m=(c.getAttribute('r')||'').match(/^([A-Z]+)/);let ci=0;if(m)for(const ch of m[1])ci=ci*26+ch.charCodeAt(0)-64;ci=Math.max(0,ci-1);
      const t=c.getAttribute('t'),v=c.getElementsByTagName('v')[0];let val='';
      if(t==='s'&&v)val=ss[parseInt(v.textContent,10)]||'';
      else if(t==='inlineStr')val=Array.from(c.getElementsByTagName('t')).map(x=>x.textContent).join('');
      else if(v)val=v.textContent;
      row[ci]=val;
    });
    rows.push(Array.from(row,x=>x==null?'':x));
  });
  return rows;
}
function budgetFromRows(rows){
  const clean=rows.filter(r=>r.some(c=>String(c).trim())),norm=x=>String(x).trim().toLowerCase();
  if(!clean.length)return [];
  const hi=clean.slice(0,6).findIndex(r=>r.some(c=>/статья|назван|наимен|позици|item|name/.test(norm(c)))&&r.some(c=>/ставк|цена|rate|price|кол|qty/.test(norm(c))));
  let map,start=0;
  if(hi>=0){
    const h=clean[hi].map(norm),f=re=>h.findIndex(x=>re.test(x));
    map={cat:f(/раздел|категор|cat|групп/),name:f(/статья|назван|наимен|позици|item|name/),qty:f(/кол-?во|колич|qty|шт/),unit:f(/^ед|unit/),rate:f(/ставк|цена|rate|price/),fact:f(/факт|actual/)};start=hi+1;
  }else{const w=clean[0].length;map=w>=5?{cat:0,name:1,qty:2,unit:3,rate:4,fact:w>5?5:-1}:{cat:-1,name:0,qty:1,unit:-1,rate:2,fact:-1}}
  const out=[];let lastCat='';
  clean.slice(start).forEach(r=>{
    const g=i=>i>=0&&i<r.length?r[i]:'',name=String(g(map.name)).trim();
    if(!name||/^(итого|прямые расходы|непредвиденные|гонорар|налог|ндс|бюджет)/i.test(name))return;
    let cat=String(g(map.cat)).trim()||lastCat||'Другое';lastCat=cat;
    const ci=CATS.findIndex(c=>c.toLowerCase()===cat.toLowerCase());if(ci>-1)cat=CATS[ci];
    const q=num(g(map.qty)),rate=num(String(g(map.rate)).replace(/[\s\u00A0]/g,'')),fact=num(String(g(map.fact)).replace(/[\s\u00A0]/g,''));
    out.push({cat:cat,name:name,qty:q>0?q:1,unit:String(g(map.unit)).trim()||'смена',rate:rate,fact:fact});
  });
  return out;
}
function applyBudgetImport(items,replace){
  const rows=items.map(it=>({id:uid(),cat:it.cat,name:it.name,qty:it.qty,unit:it.unit,kzt:it.rate*per(),src:'из файла',fact:it.fact?it.fact*per():0}));
  if(replace)S.budget=rows;
  else{const cats={};rows.forEach(r=>{cats[r.cat]=1});S.budget=S.budget.filter(r=>!(cats[r.cat]&&!r.name&&!num(r.kzt))).concat(rows)}
  if(!S.budget.length)S.budget=fresh().budget;
  save();render();toast('Загружено строк сметы: '+rows.length);
}
function budgetHasData(){return S.budget.some(r=>r.name||num(r.kzt)>0)}
function budgetXlsx(){
  const b=S.budget.filter(r=>r.name||num(r.kzt)>0||num(r.fact)>0),n=b.length,cur=S.cur,P=per(),c=calc();
  const rows=[['Раздел','Статья','Кол-во','Ед.','Ставка, '+cur,'Факт, '+cur,'Сумма, '+cur,'Источник цены']];
  b.forEach((r,i)=>rows.push([r.cat,r.name,num(r.qty),r.unit,Math.round(num(r.kzt)/P*100)/100,r.fact?Math.round(num(r.fact)/P*100)/100:'',{f:'C'+(i+2)+'*E'+(i+2),v:num(r.qty)*Math.round(num(r.kzt)/P*100)/100},r.src||'']));
  const r1=n+3,r2=n+4,r3=n+5,r4=n+6,r5=n+7,R=x=>Math.round(x/P);
  rows.push([]);
  rows.push(['','Прямые расходы','','','','',{f:'SUM(G2:G'+(n+1)+')',v:R(c.sub)}]);
  rows.push(['','Непредвиденные, %',num(S.contPct),'','','',{f:'G'+r1+'*C'+r2+'/100',v:R(c.cont)}]);
  rows.push(['','Гонорар продюсера, %',num(S.feePct),'','','',{f:'(G'+r1+'+G'+r2+')*C'+r3+'/100',v:R(c.fee)}]);
  rows.push(['','Налог (НДС), %',num(S.taxPct),'','','',{f:'(G'+r1+'+G'+r2+'+G'+r3+')*C'+r4+'/100',v:R(c.tax)}]);
  rows.push(['','ИТОГО','','','','',{f:'SUM(G'+r1+':G'+r4+')',v:R(c.total)}]);
  return makeXlsx(rows,'Смета',[30,40,9,9,14,14,16,22]);
}
function scriptBlocks(){
  const out=[{t:S.name,b:true,size:16,center:true,after:200}];
  S.script.replace(/\r/g,'').split('\n').forEach(l=>{
    const t=l.trim();if(!t)return;
    out.push(HEAD.test(t)||isCue(t)?{t:t,b:true,after:60}:{t:t,after:80});
  });
  return out;
}
function scriptBdBlocks(){
  const out=[{t:S.name||'Сценарий',b:true,size:16,center:true,after:60},{t:'Сценарий и разбор по сценам',center:true,after:280}];
  const W=[2700,6900],cell=(t,f)=>({content:t,fill:f});
  /* персонажи сцены: реплики + герои, представленные в ремарках как «ИМЯ (возраст)», и их упоминания */
  const lines=S.script.replace(/\r/g,'').split('\n'),roster=[],seen={};
  const addR=n=>{n=n.replace(/\s+/g,' ').trim();const k=n.toLowerCase();if(n&&!seen[k]){seen[k]=1;roster.push(n)}};
  S.scenes.forEach(sc=>sc.chars.forEach(addR));
  lines.forEach(l=>{if(HEAD.test(l.trim()))return;const re=/(^|[^А-ЯЁA-Z])([А-ЯЁ][А-ЯЁ\-]+(?: [А-ЯЁ][А-ЯЁ\-]+| \d{1,2}){0,2})\s*\(\d{1,3}\)/g;let m;while((m=re.exec(l)))addR(m[2])});
  const rx={};roster.forEach(n=>{rx[n]=new RegExp('(^|[^а-яёa-z])'+n.toLowerCase().split(' ').map(w=>/^\d+$/.test(w)?w+'(?!\\d)':(w.length>4?w.slice(0,-2):w).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[а-яё]*').join('\\s+'),'i')});
  const sceneText=[];let si=-1;lines.forEach(l=>{if(HEAD.test(l.trim())){si++;sceneText[si]='';return}if(si>=0)sceneText[si]+=l+'\n'});
  const castOf=(sc,i)=>{const t=(sceneText[i]||'').toLowerCase();const out=roster.filter(n=>sc.chars.indexOf(n)>-1||rx[n].test(t));return out.filter(n=>!out.some(o=>o!==n&&o.length>n.length&&o.toLowerCase().indexOf(n.toLowerCase())>-1&&!rx[n].test(t.replace(new RegExp(rx[o].source,'gi'),' '))))};
  const box=(sc,i)=>{
    const b=S.bd[sc.id]||{},rows=[[Object.assign(cell('Разбор сцены '+sc.id+' · '+sc.type+'. '+sc.loc+(sc.time?' — '+sc.time:''),'C9D4FB'),{colSpan:2})]];
    const add=(k,v)=>{v=String(v||'').trim();if(v)rows.push([cell(k,'EEF1F8'),v])};
    const cast=castOf(sc,i);sc._cast=cast;add('Персонажи',cast.join(', '));add('Объём',eighths(sc.e)+' стр. (оценка)');
    const n=rows.length;BD_CATS.forEach(c=>add(c[1],b[c[0]]));
    if(rows.length===n)rows.push([cell('Разбивка','EEF1F8'),'Не заполнена — впишите реквизит, костюмы и грим в разделе «Разбивка по элементам».']);
    out.push({table:rows,widths:W},{t:'',after:120});
  };
  let idx=0,cur=null;
  S.script.replace(/\r/g,'').split('\n').forEach(l=>{
    const t=l.trim();if(!t)return;
    if(HEAD.test(t)){if(cur)box(cur,idx-1);cur=S.scenes[idx++]||null;out.push({t:t,b:true,keep:true,before:200,after:80});return}
    out.push(isCue(t)?{t:t,b:true,keep:true,after:40}:{t:t,after:80});
  });
  if(cur)box(cur,idx-1);
  out.push({t:'Сводный разбор',b:true,size:14,pb:true,after:160});
  const ch={},chO=[];S.scenes.forEach(sc=>(sc._cast||sc.chars).forEach(n=>{if(!ch[n]){ch[n]=[];chO.push(n)}ch[n].push(sc.id)}));S.scenes.forEach(sc=>{delete sc._cast});
  if(chO.length)out.push({t:'Персонажи',b:true,after:60},{table:[['Персонаж','Сцены','Всего']].concat(chO.map(n=>[n,ch[n].join(', '),String(ch[n].length)])),head:true,widths:[4200,4200,1200]},{t:'',after:160});
  const lc={},lO=[];S.scenes.forEach(sc=>{const k=locKey(sc);if(!lc[k]){lc[k]={t:sc.type,sc:[]};lO.push(k)}lc[k].sc.push(sc.id)});
  if(lO.length)out.push({t:'Локации',b:true,after:60},{table:[['Локация','Инт./Нат.','Сцены']].concat(lO.map(k=>[k,lc[k].t,lc[k].sc.join(', ')])),head:true,widths:[5000,1800,2800]},{t:'',after:160});
  const lists=[];BD_CATS.slice(0,5).forEach(c=>{const map={},order=[];
    S.scenes.forEach(sc=>{splitItems((S.bd[sc.id]||{})[c[0]]).forEach(it=>{const k=it.toLowerCase();if(!map[k]){map[k]={n:it,sc:[]};order.push(k)}if(map[k].sc.indexOf(sc.id)<0)map[k].sc.push(sc.id)})});
    if(order.length)lists.push([cell(c[1],'EEF1F8'),order.map(k=>map[k].n+' (сц. '+map[k].sc.join(', ')+')').join('\n')])});
  if(lists.length)out.push({t:'Что подготовить',b:true,after:60},{table:lists,widths:W});
  return out;
}
function textBlocks(text){
  const lines=String(text).replace(/\r/g,'').split('\n'),out=[];
  lines.forEach((l,i)=>{if(!l.trim()){out.push({t:'',after:40});return}out.push(i===0?{t:l,b:true,size:14,center:true,after:160}:l)});
  return out;
}


/* ---------- текст из PDF (pdf.js, грузится только по нажатию) ---------- */
async function pdfText(buf){
  if(!window.pdfjsLib)await loadScript('vendor/pdf.min.js?v=1');
  const L=window.pdfjsLib;L.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.js?v=1';
  const pdf=await L.getDocument({data:new Uint8Array(buf)}).promise,out=[];
  for(let n=1;n<=pdf.numPages;n++){
    const pg=await pdf.getPage(n),tc=await pg.getTextContent(),rows=[];
    tc.items.forEach(it=>{if(!it.str)return;const y=Math.round(it.transform[5]),x=it.transform[4],h=Math.abs(it.transform[3])||it.height||10;
      let r=rows.find(r=>Math.abs(r.y-y)<=Math.max(2,h*.3));if(!r){r={y:y,h:h,parts:[]};rows.push(r)}r.parts.push({x:x,s:it.str,w:it.width||0})});
    rows.sort((a,b)=>b.y-a.y);
    let prev=null;
    rows.forEach(r=>{
      r.parts.sort((a,b)=>a.x-b.x);
      let line='',end=null;r.parts.forEach(p=>{if(end!==null&&p.x-end>r.h*.25&&!/\s$/.test(line)&&!/^\s/.test(p.s))line+=' ';line+=p.s;end=p.x+p.w});
      line=line.replace(/\s+$/,'');
      if(/^\s*\d{1,3}\.?\s*$/.test(line))return;
      if(prev&&prev.y-r.y>r.h*1.8)out.push('');
      out.push(line);prev=r;
    });
    out.push('');
  }
  return out.join('\n').replace(/\n{3,}/g,'\n\n').trim();
}
/* ---------- PDF (jsPDF, грузится только по нажатию) ---------- */
const loadScript=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('load '+src));document.head.appendChild(s)});
let PDF_READY=null;
function pdfLib(){
  if(!PDF_READY)PDF_READY=(async()=>{
    if(!window.jspdf)await loadScript('vendor/jspdf.umd.min.js?v=1');
    if(!(window.jspdf&&window.jspdf.jsPDF&&window.jspdf.jsPDF.API.autoTable))await loadScript('vendor/jspdf.plugin.autotable.min.js?v=1');
    const f=async n=>{const r=await fetch('vendor/fonts/'+n);if(!r.ok)throw new Error('font');const b=new Uint8Array(await r.arrayBuffer());let s='';for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(s)};
    const fs=await Promise.all([f('PT_Sans-Web-Regular.ttf'),f('PT_Sans-Web-Bold.ttf')]);
    return {r:fs[0],b:fs[1]};
  })().catch(e=>{PDF_READY=null;throw e});
  return PDF_READY;
}
async function makePdf(blocks,title,opt){
  opt=opt||{};const fonts=await pdfLib(),doc=new window.jspdf.jsPDF({unit:'pt',format:'a4',orientation:opt.landscape?'landscape':'portrait'});
  doc.addFileToVFS('pts.ttf',fonts.r);doc.addFont('pts.ttf','PTS','normal');doc.addFileToVFS('ptsb.ttf',fonts.b);doc.addFont('ptsb.ttf','PTS','bold');
  const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),M=40,BLUE=[30,58,138],YEL=[255,210,63];
  let y=64;
  const fix=v=>String(v==null?'':v).replace(/₸/g,'тг');
  const room=h=>{if(y+h>H-46){doc.addPage();y=56}};
  blocks.forEach(b=>{
    if(b&&b.table){
      const rows=b.table.filter(r=>r&&r.length).map(r=>r.map(c=>c&&typeof c==='object'?{content:fix(c.content),colSpan:c.colSpan||1,styles:c.day?{fontStyle:'bold',fillColor:[255,224,138],textColor:[20,25,40]}:c.total?{fontStyle:'bold',fillColor:[238,241,248]}:{}}:fix(c)));if(!rows.length)return;
      if(b.meta){doc.autoTable({startY:y,body:rows,theme:'plain',margin:{left:M,right:M},styles:{font:'PTS',fontSize:10,cellPadding:2.5,textColor:[25,25,35]},columnStyles:{0:{fontStyle:'bold',cellWidth:150}}});y=doc.lastAutoTable.finalY+14;return}
      doc.autoTable({startY:y,head:b.head?[rows[0]]:undefined,body:b.head?rows.slice(1):rows,margin:{left:M,right:M,top:56,bottom:46},
        styles:{font:'PTS',fontSize:b.kpp?8:9.5,cellPadding:b.kpp?3.5:5,textColor:[25,25,35],lineColor:[190,198,218],lineWidth:.5,valign:'top'},
        columnStyles:b.kpp?{0:{cellWidth:30,halign:'center'},1:{cellWidth:88},2:{cellWidth:40},3:{cellWidth:44},4:{cellWidth:150},5:{cellWidth:80},6:{cellWidth:62},7:{cellWidth:82},8:{cellWidth:30,halign:'right'},9:{cellWidth:36,halign:'right'}}:{},
        headStyles:{font:'PTS',fontStyle:'bold',fillColor:BLUE,textColor:[255,255,255],valign:'middle'},alternateRowStyles:b.kpp?{}:{fillColor:[244,246,252]},
        didParseCell:d=>{if(b.boldLast&&d.section==='body'&&d.row.index===d.table.body.length-1)d.cell.styles.fontStyle='bold'}});
      y=doc.lastAutoTable.finalY+16;return;
    }
    const o=typeof b==='string'?{t:b}:b,size=o.size||(o.b?12:10.5);
    if(o.b&&!o.center&&y>80)y+=8;
    doc.setFont('PTS',o.b?'bold':'normal');doc.setFontSize(size);doc.setTextColor(25,25,35);
    const lines=doc.splitTextToSize(fix(o.t),W-2*M),lh=size*1.35;
    lines.forEach(l=>{room(lh);doc.text(l,o.center?W/2:M,y,{align:o.center?'center':'left'});y+=lh});
    y+=o.after?o.after/20:4;
  });
  const n=doc.getNumberOfPages();
  for(let i=1;i<=n;i++){
    doc.setPage(i);doc.setFillColor(...BLUE);doc.rect(0,0,W,30,'F');
    doc.setFont('PTS','bold');doc.setFontSize(12);doc.setTextColor(...YEL);doc.text('HUSTLE',M,20);
    doc.setFont('PTS','normal');doc.setFontSize(9);doc.setTextColor(255,255,255);doc.text(fix(title),W-M,20,{align:'right'});
    doc.setTextColor(120,125,140);doc.setFontSize(8.5);doc.text('Сделано в HUSTLE',M,H-22);doc.text('стр. '+i+' из '+n,W-M,H-22,{align:'right'});
  }
  return doc.output('blob');
}
async function savePdf(name,blocks,title,btn,opt){
  if(btn)btn.disabled=true;toast('Готовлю PDF…');
  try{const blob=await makePdf(blocks,title,opt);await saveFile(name,blob,'application/pdf')}
  catch(e){console.warn(e);toast('Не удалось собрать PDF. Проверьте интернет и попробуйте ещё раз.')}
  finally{if(btn)btn.disabled=false}
}
function budgetPdfBlocks(){
  const nf=v=>(typeof v==='number'||(v!==''&&!isNaN(Number(v))))?Number(v).toLocaleString('ru-RU'):v;
  const rows=budgetRows().map((r,k)=>k===0||!r.length?r:r.map((v,j)=>j>=2&&j!==3?nf(v):v)),i=rows.findIndex(r=>!r.length),items=rows.slice(0,i<0?rows.length:i).filter((r,k)=>k===0||String(r[1]||'').trim()||num(r[5])),tot=i<0?[]:rows.slice(i+1);
  const b=[{t:'СМЕТА',b:true,size:16,center:true},{t:S.name,b:true,center:true,after:200}];
  if(items.length>1)b.push({table:items,head:true});else b.push('Смета пока пустая.');
  if(tot.length)b.push({t:'Итоги',b:true,after:60},{table:tot.map(r=>[r[1],r[4]||'',r[5]]),boldLast:true});
  return b;
}
function callsheetBlocks(d){
  ensurePlan();const inf=dayInfo(d),sc=S.scenes.filter(s=>S.assign[s.id]===d),cast=[];
  sc.forEach(s=>s.chars.forEach(c=>{if(cast.indexOf(c)<0)cast.push(c)}));
  let ds='';if(inf.date){try{ds=new Date(inf.date+'T00:00:00').toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}catch(e){}}
  const b=[{t:'ВЫЗЫВНОЙ ЛИСТ',b:true,size:16,center:true},{t:S.name+' — день '+d+' из '+maxDay(),b:true,center:true,after:200},
    'Дата: '+(ds||'не указана')+'. Общий сбор: '+(inf.call||'—'),'Адрес: '+(inf.addr||'не указан'),'Режиссёр: '+(S.cs.director||'—')+'. Продюсер: '+(S.cs.producer||'—')+(S.cs.phone?', '+S.cs.phone:'')];
  if(inf.notes)b.push('Примечания: '+inf.notes);
  b.push({t:'Сцены дня',b:true,after:60},{table:[['Сц.','Место','Время суток','Персонажи','Стр.']].concat(sc.map(s=>[String(s.id),s.type+'. '+s.loc,s.time,s.chars.join(', '),eighths(s.e)])),head:true},
    {t:'Вызов актёров',b:true,after:60},{table:[['Персонаж','Актёр','Вызов']].concat(cast.map(c=>{const cc=S.cs.castCalls[d+'|'+c]||{};return [c,cc.actor||'',cc.time||inf.call||'']})),head:true});
  return b;
}
const DOC_NAMES={actor:'dogovor-s-akterom',consent:'soglasie-na-semku',location:'razreshenie-na-lokaciyu',gear:'akt-priema-tehniki'};
function shotsXlsx(){const r=[['Сцена','№','Размер','Ракурс','Движение','мм','Описание','Снято']];S.shots.forEach(x=>r.push([String(x.scene||''),String(x.no||''),x.size,x.angle,x.move,num(x.mm),x.desc||'',x.done?'да':'нет']));return makeXlsx(r,'Шот-лист',[8,6,14,14,14,6,50,8])}
function planXlsx(){ensurePlan();const r=[['Сцена','Тип','Локация','Время суток','Персонажи','Страниц','День съёмки']];S.scenes.forEach(s=>r.push([String(s.id),s.type,s.loc,s.time,s.chars.join(', '),eighths(s.e),num(S.assign[s.id])]));return makeXlsx(r,'План съёмок',[8,10,36,14,36,10,12])}
function locsXlsx(){const r=[['Название','Адрес','Контакт','Цена или условия','Сцены','Статус','Заметки']];S.locs.forEach(l=>r.push([l.name,l.addr,l.contact,l.price,l.scenes,l.status,l.notes]));return makeXlsx(r,'Локации',[24,30,24,20,12,18,40])}
function explicBlocks(){const b=[{t:'ЭКСПЛИКАЦИЯ — '+S.name,b:true,size:16,center:true,after:200}];EX_FIELDS.forEach(f=>{b.push({t:f[1],b:true,after:40},((S.explic[f[0]]||'').trim()||'—'))});return b}
async function exportAll(){
  const f=[],stamp=new Date().toISOString().slice(0,10);
  if(S.script.trim()){f.push({name:'scenariy.txt',data:S.script},{name:'scenariy.docx',data:makeDocx(scriptBlocks())});if(S.scenes.length)f.push({name:'scenariy-i-razbor.docx',data:makeDocx(scriptBdBlocks())})}
  if(S.scenes.length){f.push({name:'plan-syomok.xlsx',data:planXlsx()});ensurePlan();for(let d=1;d<=maxDay();d++)f.push({name:'vyzyvnoy-list-den-'+d+'.docx',data:makeDocx(callsheetBlocks(d))})}
  f.push({name:'smeta.xlsx',data:budgetXlsx()},{name:'smeta.csv',data:'\uFEFF'+budgetRows().map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n')});
  Object.keys(DOC_FIELDS).forEach(k=>f.push({name:'dokumenty/'+DOC_NAMES[k]+'.docx',data:makeDocx(textBlocks(docText(k)))}));
  if(S.shots.length)f.push({name:'shot-list.xlsx',data:shotsXlsx()});
  if(S.locs.length)f.push({name:'lokacii.xlsx',data:locsXlsx()});
  if(Object.keys(S.explic).some(k=>(S.explic[k]||'').trim()))f.push({name:'eksplikaciya.docx',data:makeDocx(explicBlocks())});
  if(S.scenes.length&&bdText())f.push({name:'razbivka-po-elementam.txt',data:bdText()});
  f.push({name:'hustle-project.json',data:JSON.stringify(exportEnvelope(),null,1)});
  const ok=await saveFile('hustle-dokumenty-'+stamp+'.zip',makeZip(f),'application/zip');
  if(ok)toast('Архив документов сохранён ('+f.length+' файлов)');
}

