/* ---------- события ---------- */
const A={
  pname:t=>{S.name=t.value;save()},
  cur:t=>{S.cur=t.value},
  rate:t=>{const k=t.dataset.k,v=num(t.value);if(v>0){S.rates[k]=v;S.ratesDate=null;if(S.tab==='budget')render();else save()}},
  bud:t=>{const r=S.budget.find(x=>x.id===t.dataset.id);if(!r)return;
    if(t.dataset.f==='rate'){r.kzt=num(t.value)*per();r.src='';const bd=t.closest('tr').querySelector('.src');if(bd)bd.remove()}else if(t.dataset.f==='fact')r.fact=num(t.value)*per();else r[t.dataset.f]=t.value;
    updateTotals();save()},
  pct:t=>{S[t.dataset.f]=t.value;updateTotals();save()},
  script:t=>{S.script=t.value;save();clearTimeout(A._st);A._st=setTimeout(silentParse,600)},
  upload:t=>{
    const f=t.files&&t.files[0];if(!f)return;
    if(f.size>5*1024*1024){toast('Файл слишком большой: максимум 5 МБ');t.value='';return}
    const nm=f.name,isPdf=/\.pdf$/i.test(nm)||f.type==='application/pdf',isDocx=/\.docx$/i.test(nm),isFdx=/\.fdx$/i.test(nm),isTxt=/\.(txt|md|fountain|text)$/i.test(nm);
    if(!isPdf&&!isDocx&&!isFdx&&!isTxt&&f.type&&f.type!=='text/plain'){toast('Поддерживаются PDF, .txt, .md, .fountain, .docx и .fdx.');t.value='';return}
    f.arrayBuffer().then(async buf=>{
      let txt;
      if(isPdf){toast('Читаю PDF…');try{txt=await pdfText(buf)}catch(e){console.warn(e);toast('Не удалось прочитать PDF. Попробуйте другой файл или вставьте текст.');return}
        if(!txt.replace(/\s/g,'').length){toast('В этом PDF нет текста: похоже, это скан. Нужен PDF, сохранённый из текстового редактора.');return}}
      else if(isDocx)txt=await docxText(buf);
      else{
        try{txt=new TextDecoder('utf-8',{fatal:true}).decode(buf)}catch(e){txt=new TextDecoder('windows-1251').decode(buf)}
        txt=txt.replace(/^\uFEFF/,'');
        if(isFdx)txt=fdxText(txt);
      }
      const n=parseScript(txt).length;
      applyScript(txt,'Загружен файл «'+nm+'». '+(n?'Найдено сцен: '+n:'Сцены не найдены — проверьте заголовки (ИНТ./НАТ.)'));
    }).catch(err=>toast(err&&err.message==='no-ds'?'Этот браузер не умеет открывать .docx: сохраните сценарий как .txt или вставьте текст':'Не удалось прочитать файл. Для .docx и .fdx проверьте, что файл не повреждён'));
    t.value='';
  },
  scene:t=>{const s=S.scenes.find(x=>String(x.id)===t.dataset.id);if(!s)return;const f=t.dataset.f;
    if(f==='chars')s.chars=t.value.split(',').map(x=>x.trim()).filter(Boolean);else if(f==='time')s.time=t.value.toUpperCase();else s[f]=t.value;save()},
  doccustom:t=>{S.doc.custom=S.doc.custom||{};if(t.value.trim())S.doc.custom[S.doc.type]=t.value;else delete S.doc.custom[S.doc.type];save()},
  docimport:t=>{
    const f=t.files&&t.files[0];t.value='';if(!f)return;
    if(f.size>3*1024*1024){toast('Файл слишком большой: максимум 3 МБ');return}
    f.arrayBuffer().then(async buf=>{
      let txt;
      if(/\.docx$/i.test(f.name))txt=await docxText(buf);
      else{try{txt=new TextDecoder('utf-8',{fatal:true}).decode(buf)}catch(e){txt=new TextDecoder('windows-1251').decode(buf)}txt=txt.replace(/^\uFEFF/,'')}
      txt=txt.trim();if(!txt){toast('В файле нет текста');return}
      S.doc.custom=S.doc.custom||{};S.doc.custom[S.doc.type]=txt;save();render();toast('Текст документа загружен из файла «'+f.name+'»');
    }).catch(()=>toast('Не удалось прочитать файл: поддерживаются .docx, .txt и .md'));
  },
  budimport:t=>{
    const f=t.files&&t.files[0];t.value='';if(!f)return;
    if(f.size>5*1024*1024){toast('Файл слишком большой: максимум 5 МБ');return}
    f.arrayBuffer().then(async buf=>{
      let rows;
      if(/\.xlsx$/i.test(f.name))rows=await xlsxRows(buf);
      else{let txt;try{txt=new TextDecoder('utf-8',{fatal:true}).decode(buf)}catch(e){txt=new TextDecoder('windows-1251').decode(buf)}rows=csvParse(txt.replace(/^\uFEFF/,''))}
      const items=budgetFromRows(rows);
      if(!items.length){showDialog({title:'Строки сметы не найдены',text:'Нужны столбцы «Статья» и «Ставка» (и по желанию «Раздел», «Кол-во», «Ед.»). Проще всего скачать нашу выгрузку .xlsx, заполнить её и загрузить обратно.',actions:[{label:'Понятно',sec:true}]});return}
      if(!budgetHasData()){applyBudgetImport(items,true);return}
      showDialog({title:'Загрузить смету из файла',text:'В файле «'+f.name+'» найдено строк: '+items.length+'. Добавить их к текущей смете или заменить её?',actions:[
        {label:'Добавить к смете',run:()=>applyBudgetImport(items,false)},
        {label:'Заменить смету',sec:true,run:()=>applyBudgetImport(items,true)},
        {label:'Отмена',sec:true}]});
    }).catch(err=>toast(err&&err.message==='no-ds'?'Этот браузер не открывает .xlsx: сохраните файл как .csv':'Не удалось прочитать файл. Проверьте, что это .xlsx или .csv'));
  },
  perDay:t=>{S.perDay=t.value;save()},
  assign:t=>{S.assign[t.dataset.id]=parseInt(t.value,10)||1;save()},
  csday:t=>{S.cs.day=parseInt(t.value,10)||1;save()},
  cs:t=>{S.cs[t.dataset.f]=t.value;save()},
  csinfo:t=>{dayInfo(S.cs.day)[t.dataset.f]=t.value;save()},
  cast:t=>{const k=t.dataset.key;S.cs.castCalls[k]=S.cs.castCalls[k]||{};S.cs.castCalls[k][t.dataset.f]=t.value;save()},
  disc:t=>{S.disc=Math.max(0,Math.min(90,num(t.value)));gearUpdate();save()},
  msg:t=>{S.msg=S.msg||{};S.msg[t.dataset.f]=t.value;paintMsg();save()},
  gear:t=>{const g=S.gear.find(x=>x.id===t.dataset.id);if(!g)return;const f=t.dataset.f;
    if(f==='rate'){g.kzt=num(t.value)*per();g.src=''}else if(f==='qty'||f==='days')g[f]=Math.max(0,num(t.value));else g[f]=t.value;
    gearUpdate();save()},
  nstatus:t=>{const id=t.dataset.id;S.notes[id]=Object.assign({text:'',status:'draft'},S.notes[id]);S.notes[id].status=t.value;save()},
  kppdate:t=>{dayInfo(+t.dataset.d).date=t.value;save()},
  kppnote:t=>{kppSet(t.dataset.id,'n',t.value);save()},
  kppf:t=>{kppSet(t.dataset.id,t.dataset.f,t.value);save()},
  kppcall:t=>{dayInfo(+t.dataset.d).call=t.value;save()},
  kppmeta:t=>{S.kppMeta=S.kppMeta||{};S.kppMeta[t.dataset.f]=t.value;save()},
  ntext:t=>{const id=t.dataset.id;S.notes[id]=Object.assign({text:'',status:'draft'},S.notes[id]);S.notes[id].text=t.value;save()},
  ex:t=>{S.explic[t.dataset.f]=t.value;save()},
  sh:t=>{const x=S.shots.find(i=>i.id===t.dataset.id);if(!x)return;const f=t.dataset.f;x[f]=f==='done'?t.checked:t.value;save()},
  shotflt:t=>{S.shotScene=t.value;save()},
  lt:t=>{const it=selItem();if(!it)return;const f=t.dataset.f;
    if(['rot','w','k','mm','len','h','tilt'].indexOf(f)>-1)it[f]=num(t.value);else it[f]=t.value;
    if(f==='h')setText('#hv',(it.type==='light'?num(t.value).toFixed(1):num(t.value).toFixed(2))+' м');
    if(f==='tilt')setText('#tiltv',Math.round(it.tilt)+'°');
    if(f==='rot')setText('#rotv',Math.round(it.rot)+'°');
    if(f==='len')setText('#lenv',it.type==='prop'?(it.len/40).toFixed(1)+' м':Math.round(it.len));
    if(f==='kind'){const P=PROP_K[propKind(it)],old=Object.keys(PROP_K).some(k=>(it.label||'').indexOf(PROP_K[k].n)===0)||/^Тумба|^Стол$/.test(it.label||'');it.len=P.len;if(old||!it.label)it.label=P.n;paintLight();paintInspector();save();return}
    paintLight();save()},
  ltscene:t=>{S.lightScene=parseInt(t.value,10)||0;S.lightSel='';save()},
  ltnote:t=>{curLight().note=t.value;save()},
  calc:t=>{S.calc[t.dataset.f]=t.value;calcUpdate();save()},
  city:t=>{S.city=t.value;save()},
  bd:t=>{S.bd[t.dataset.id]=S.bd[t.dataset.id]||{};S.bd[t.dataset.id][t.dataset.f]=t.value;const el=$('#bd-sum');if(el)el.innerHTML=bdSummary();save()},
  loc:t=>{const l=S.locs.find(x=>x.id===t.dataset.id);if(l){l[t.dataset.f]=t.value;save()}},
  sbscene:t=>{S.storyScene=parseInt(t.value,10)||0;save()},
  sbcap:t=>{const f=findFrame(t.dataset.id);if(f){f.cap=t.value;save()}},
  docf:t=>{S.doc.vals[t.dataset.f]=t.value;paintDoc();save()},
  gloss:t=>{const q=t.value.trim().toLowerCase();$$('.gl-item').forEach(el=>{el.hidden=!!q&&el.dataset.q.indexOf(q)<0})},
  projfile:t=>{importFromInput(t)},
  heroimg:t=>{
    const f=t.files&&t.files[0];t.value='';if(!f)return;
    if(!/^image\/(jpeg|png|webp)$/.test(f.type)){toast('Подойдёт фото в формате JPG, PNG или WebP');return}
    if(f.size>8*1024*1024){toast('Фото слишком большое: максимум 8 МБ');return}
    const rd=new FileReader();
    rd.onload=()=>{
      const src=String(rd.result),im=new Image();
      im.onload=()=>{
        let out='';
        try{const k=Math.min(1,1100/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(im.width*k));cv.height=Math.max(1,Math.round(im.height*k));cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);out=cv.toDataURL('image/jpeg',.82)}
        catch(e){out=src.length<900000?src:''}
        if(!/^data:image\/(jpeg|png|webp);base64,/.test(out)||out.length>1.5e6){toast('Не удалось подготовить фото: выберите файл поменьше');return}
        S.heroImg=out;save();render();
      };
      im.onerror=()=>toast('Не удалось открыть фото');
      im.src=src;
    };
    rd.readAsDataURL(f);
  }
};
function onField(e){
  if(!S)return;
  const t=e.target,a=t.dataset&&t.dataset.a;if(!a||!A[a])return;
  if((a==='upload'||a==='projfile'||a==='heroimg'||a==='budimport'||a==='docimport')&&e.type!=='change')return;
  A[a](t);
  if(t.dataset.r&&e.type==='change')render();
}
document.addEventListener('input',onField);
document.addEventListener('change',onField);
document.addEventListener('submit',e=>{if(e.target.id==='authForm')onAuthSubmit(e)});

function updateFSBtn(){$$('.fsfab span').forEach(sp=>{sp.textContent=document.body.classList.contains('fs')?'Свернуть':'На весь экран'})}
function setFS(on){
  document.body.classList.toggle('fs',on);
  try{
    if(on&&!document.fullscreenElement&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});
    if(!on&&document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});
  }catch(e){}
  updateFSBtn();window.scrollTo(0,0);
}
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('fs')){document.body.classList.remove('fs');updateFSBtn()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('fs'))setFS(false)});
function copyText(text,okMsg){
  const fallback=()=>{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}document.body.removeChild(ta);toast(ok?okMsg:'Не удалось скопировать — выделите текст вручную')};
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(()=>toast(okMsg),fallback);return}}catch(e){}
  fallback();
}
function budgetRows(){
  const rows=[['Раздел','Статья','Кол-во','Ед.','Ставка, '+S.cur,'Сумма, '+S.cur]];
  S.budget.forEach(r=>rows.push([r.cat,r.name,r.qty,r.unit,fmtIn(r.kzt),Math.round(num(r.qty)*num(r.kzt)/per()*100)/100]));
  const t=calc();
  rows.push([],['','Прямые расходы','','','',Math.round(t.sub/per())],['','Непредвиденные','','',S.contPct+'%',Math.round(t.cont/per())],['','Гонорар продюсера','','',S.feePct+'%',Math.round(t.fee/per())],['','Налог','','',S.taxPct+'%',Math.round(t.tax/per())],['','ИТОГО','','','',Math.round(t.total/per())]);
  return rows;
}
let resetArmed=false;
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-c]');if(!b)return;
  const c=b.dataset.c;
  if(['tab','role','lang','demo','exportProj','exportAll'].indexOf(c)>-1)closeMenus();
  if(c==='tab'&&b.classList.contains('brand')){const lg=$('#logoBtn');if(lg)clap(lg)}
  if(c==='logo'){clap(b);return}
  if(c==='authTab'&&b.dataset.k==='resend'){
    if(!SB||!AUTH_PENDING)return;b.disabled=true;
    (authMode==='reset'?SB.auth.resetPasswordForEmail(AUTH_PENDING,{redirectTo:location.origin+location.pathname}):SB.auth.resend({type:'signup',email:AUTH_PENDING})).then(r=>{const mm=$('#authMsg');if(mm)mm.textContent=r.error?authError(r.error):'Новый код отправлен на '+AUTH_PENDING+'.';setTimeout(()=>{b.disabled=false},30000)});
    return;
  }
  if(c==='authTab'){authMode=b.dataset.k;renderAuth();return}
  if(c==='guest'){enter('guest');return}
  if(c==='landDemo'){enter('guest');if(!hasData())loadDemo('2');showOnb();return}
  if(c==='landReg'){const d=$('.auth-more');if(d){d.hidden=false;d.open=true}const tb=$('#tab-register');if(tb)tb.click();const cd=$('#authCard');if(cd)cd.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>{const f=$('#authForm input');if(f)f.focus({preventScroll:true})},350);return}
  if(!S)return;
  if(c==='logout'){doLogout();return}
  if(c==='tab'){document.body.classList.remove('navopen');let k=b.dataset.k;if(k==='deals'||k==='gear'){S.rtab=k==='gear'?'list':'deals';k='rentals'}if(b.dataset.sub)S.rtab=b.dataset.sub;S.tab=k;render();window.scrollTo(0,0)}
  else if(c==='lang'){PREF.lang=PREF.lang==='kk'?'ru':'kk';savePref();render()}
  else if(c==='fs'){setFS(!document.body.classList.contains('fs'))}
  else if(c==='hubfilter'){S.hubAll=b.dataset.k==='all';render()}
  else if(c==='btApply'){const n=applyBT($('#bt-type').value,$('#bt-days').value);toast('Добавлено строк: '+n);render()}
  else if(c==='docType'){S.doc.type=b.dataset.k;render()}
  else if(c==='docCopy'){copyText(docText(),'Текст скопирован')}
  else if(c==='docDl'){saveFile('document.txt',docText())}
  else if(c==='bdCopy'){copyText(bdText()||'Списки пусты','Списки скопированы')}
  else if(c==='locAdd'){S.locs.push({id:uid(),name:'Новая локация',addr:'',contact:'',price:'',scenes:'',status:'Ищем',notes:''});render()}
  else if(c==='locDel'){S.locs=S.locs.filter(l=>l.id!==b.dataset.id);render()}
  else if(c==='locFromScript'){
    let n=0;
    S.scenes.forEach(s=>{const k=locKey(s);if(!S.locs.some(l=>l.name.toUpperCase()===k)){
      const nums=S.scenes.filter(x=>locKey(x)===k).map(x=>x.id).join(', ');
      S.locs.push({id:uid(),name:k.charAt(0)+k.slice(1).toLowerCase(),addr:'',contact:'',price:'',scenes:nums,status:'Ищем',notes:''});n++}});
    toast(n?'Добавлено локаций: '+n:'Все локации уже в списке');render()}
  else if(c==='sbAdd'){
    const sid=S.storyScene&&S.scenes.some(s=>s.id===S.storyScene)?S.storyScene:S.scenes[0].id;
    S.story[sid]=S.story[sid]||[];
    if(S.story[sid].length>=12){toast('В одной сцене максимум 12 кадров');return}
    S.story[sid].push({id:uid(),cap:'',img:''});S.storyScene=sid;render()}
  else if(c==='sbDel'){Object.keys(S.story).forEach(k=>{S.story[k]=S.story[k].filter(f=>f.id!==b.dataset.id)});render()}
  else if(c==='sbClear'){const f=findFrame(b.dataset.id);if(f){f.img='';render()}}
  else if(c==='sbOpen'){sbOpen(b.dataset.id)}
  else if(c==='heroClear'){S.heroImg='';save();render()}
  else if(c==='exportProj'){exportProject()}
  else if(c==='exportAll'){exportAll()}
  else if(c==='budXlsx'){saveFile('smeta.xlsx',budgetXlsx())}
  else if(c==='dlScriptDocx'){saveFile('scenariy.docx',makeDocx(scriptBlocks()))}
  else if(c==='dlScriptBd'){if(!S.scenes.length){toast('Сначала добавьте сценарий со сценами');return}saveFile('scenariy-i-razbor.docx',makeDocx(scriptBdBlocks()))}
  else if(c==='switchProj'){switchProject(b.dataset.id)}
  else if(c==='openDay'){S.cs.day=+b.dataset.k||1;S.tab='callsheet';render();window.scrollTo(0,0)}
  else if(c==='teamInvite'){teamInvite(b,b.dataset.k)}
  else if(c==='teamRole'){teamRole(b.dataset.id,b.dataset.k)}
  else if(c==='teamKick'){showDialog({title:'Убрать участника?',text:'Он больше не сможет открыть этот проект.',actions:[{label:'Убрать',run:()=>teamKick(b.dataset.id)},{label:'Отмена',sec:true}]})}
  else if(c==='teamLeave'){showDialog({title:'Покинуть проект команды?',text:'Проект останется у владельца, но вы больше не сможете его открыть без нового приглашения.',actions:[{label:'Покинуть',run:teamLeave},{label:'Отмена',sec:true}]})}
  else if(c==='todayDay'){S.cs.day=parseInt(b.dataset.k,10)||1;TODAY_PICKED=true;save();render()}
  else if(c==='csShare'){shareCallsheet(b)}
  else if(c==='csPdf'){ensurePlan();savePdf('vyzyvnoy-list-den-'+S.cs.day+'.pdf',callsheetBlocks(S.cs.day),'Вызывной лист · '+S.name,b)}
  else if(c==='budgetPdf'){savePdf('smeta.pdf',budgetPdfBlocks(),'Смета · '+S.name,b)}
  else if(c==='csDocx'){ensurePlan();saveFile('vyzyvnoy-list-den-'+S.cs.day+'.docx',makeDocx(callsheetBlocks(S.cs.day)))}
  else if(c==='shotXlsx'){saveFile('shot-list.xlsx',shotsXlsx())}
  else if(c==='docDocx'){saveFile((DOC_NAMES[S.doc.type]||'document')+'.docx',makeDocx(textBlocks(docText())))}
  else if(c==='docReset'){if(S.doc.custom)delete S.doc.custom[S.doc.type];save();render()}
  else if(c==='saveInfo'){if(SAVE_OK===false)exportProject();else toast(CLOUD?'Проект сохранён в вашем аккаунте. Копию в файл можно сделать в меню профиля.':'Проект сохранён в этом браузере. Копию в файл можно сделать в меню профиля.')}
  else if(c==='delAccount'){if(!CLOUD)return;showDialog({title:'Удалить аккаунт?',text:'Аккаунт и все данные в облаке будут удалены без возможности восстановления. Перед этим можно сохранить копию проекта в файл.',actions:[{label:'Сохранить копию и удалить',run:async()=>{if(await exportProject())deleteAccount()}},{label:'Удалить без копии',sec:true,run:deleteAccount},{label:'Отмена',sec:true}]})}
  else if(c==='bnClose'){S.bnDismiss=Date.now();save();render()}
  else if(c==='dlg'){const a=DLG&&DLG.actions[parseInt(b.dataset.i,10)];closeDialog();if(a&&a.run)a.run()}
  else if(c==='onbRole'){S.role=b.dataset.k;$$('.onb-roles .opt').forEach(o=>o.classList.toggle('on',o.dataset.k===b.dataset.k));save()}
  else if(c==='onbStart'){
    const nm=($('#ob-name').value||'').trim(),ty=$('#ob-type').value;
    if(nm)S.name=nm;S.ptype=ty;
    if($('#ob-tpl').checked&&OB_TYPES[ty])applyBT(OB_TYPES[ty],null);
    S.onboarded=true;showOnb();render();if(!tourSeen())openTour();else toast('Готово! Начните с выделенного шага.')}
  else if(c==='onbSkip'){S.onboarded=true;showOnb();render();if(!tourSeen())openTour()}

  else if(c==='rtab'){S.rtab=b.dataset.k;render()}
  else if(c==='posterAdd'){
    const g=id=>($(id).value||'').trim(),rental=g('#pk-rental'),title=g('#pk-title'),price=g('#pk-price');let url=g('#pk-url');
    if(!rental||!title||!price){toast('Заполните рентал, название акции и цену или скидку');return}
    if(url&&!/^https?:\/\//i.test(url))url='https://'+url;
    S.posters.unshift({id:uid(),rental:rental,title:title,price:price,url:url});render();toast('Постер добавлен')}
  else if(c==='posterDel'){S.posters=S.posters.filter(p=>p.id!==b.dataset.id);render()}
  else if(c==='rail'){PREF.rail=!PREF.rail;savePref();applyTheme()}
  else if(c==='palette'){PREF.palette=b.dataset.k;savePref();applyTheme()}
  else if(c==='mode'){PREF.mode={auto:'light',light:'dark',dark:'auto'}[PREF.mode];savePref();applyTheme()}
  else if(c==='togglePanel'){S.pc[b.dataset.p]=b.getAttribute('aria-expanded')==='true';render()}
  else if(c==='collapseAll'){const pre=b.dataset.pre;
    if(pre==='cat:')S.budget.forEach(r=>{S.pc['cat:'+r.cat]=true});else{for(let d=1;d<=maxDay();d++)S.pc[pre+d]=true}render()}
  else if(c==='expandAll'){const pre=b.dataset.pre;Object.keys(S.pc).forEach(k=>{if(k.indexOf(pre)===0)delete S.pc[k]});if(pre==='cat:')S.budget.forEach(r=>{S.pc['cat:'+r.cat]=false});render()}
  else if(c==='dockToggle'){S.dockOpen=!S.dockOpen;render()}
  else if(c==='addRow'){
    S.budget.push({id:uid(),cat:b.dataset.cat,name:'',qty:1,unit:'смена',kzt:0,src:''});
    let idx=-1;S.budget.forEach((r,i)=>{if(r.cat===b.dataset.cat&&i<S.budget.length-1)idx=i});
    if(idx>-1){const last=S.budget.pop();S.budget.splice(idx+1,0,last)}render()}
  else if(c==='delRow'){S.budget=S.budget.filter(r=>r.id!==b.dataset.id);if(!S.budget.length)S.budget=fresh().budget;render()}
  else if(c==='parse'){applyScript($('textarea.script').value)}
  else if(c==='scOpen'){scvOpen(parseInt(b.dataset.i,10))}
  else if(c==='scClose'){scvClose()}
  else if(c==='scNav'){if(SV)scvOpen(Math.max(0,Math.min(S.scenes.length-1,SV.i+parseInt(b.dataset.d,10))))}
  else if(c==='aiMerge'){aiMerge(b.dataset.k,b.dataset.a,b.dataset.b)}
  else if(c==='plan'){autoPlan();render();toast('План составлен')}
  else if(c==='print'){if(b.dataset.dock&&!S.dockOpen){S.dockOpen=true;render()}try{window.print()}catch(err){toast('Печать недоступна — используйте печать браузера (Ctrl+P)')}}
  else if(c==='copyBudget'){copyText(budgetRows().map(r=>r.join('\t')).join('\n'),'Скопировано — вставьте в Excel или Google Таблицы')}
  else if(c==='csvBudget'){saveFile('smeta.csv','\uFEFF'+budgetRows().map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n'))}
  else if(c==='dlScript'){saveFile('scenariy.txt',S.script)}
  else if(c==='demo'){loadDemo(b.dataset.k)}
  else if(c==='role'){S.role=b.dataset.k;if(ROLE_TABS[S.role].indexOf(S.tab)<0)S.tab='home';render();window.scrollTo(0,0)}
  else if(c==='dealcat'){S.dealCat=b.dataset.k;render()}
  else if(c==='gearAdd'){addGear(b.dataset.id);toast('Добавлено в список оборудования')}
  else if(c==='setAdd'){DEAL_SETS[parseInt(b.dataset.k,10)].ids.forEach(addGear);toast('Набор добавлен в список оборудования')}
  else if(c==='gearAddRow'){S.gear.push({id:uid(),name:'Новая позиция',rental:'',kzt:0,qty:1,days:1,src:'',sent:false});render()}
  else if(c==='gearDel'){S.gear=S.gear.filter(g=>g.id!==b.dataset.id);render()}
  else if(c==='gearClear'){S.gear=[];render()}
  else if(c==='gearToBudget'){
    const cat='Техника: камера, свет, звук';let n=0;
    S.gear.forEach(g=>{if(g.sent)return;const k=Math.round(num(g.kzt)*(1-num(S.disc)/100));
      S.budget.push({id:uid(),cat:cat,name:g.name+(g.rental?' ('+g.rental+')':''),qty:num(g.qty)*num(g.days),unit:'смена',kzt:k,src:g.src||'оценка'});g.sent=true;n++});
    if(n)S.budget=S.budget.filter(r=>!(r.cat===cat&&!r.name&&!num(r.kzt)));
    toast(n?'В смету добавлено позиций: '+n:'Все позиции уже в смете');render()}
  else if(c==='gearCopy'){
    const rows=[['Позиция','Рентал','Цена за смену, '+S.cur,'Шт.','Смен','Сумма, '+S.cur]];
    S.gear.forEach(g=>rows.push([g.name,g.rental,fmtIn(g.kzt),g.qty,g.days,Math.round(num(g.kzt)*num(g.qty)*num(g.days)/per())]));
    rows.push(['Итого со скидкой '+S.disc+'%','','','','',Math.round(gearTotalKzt()/per())]);
    copyText(rows.map(r=>r.join('\t')).join('\n'),'Скопировано — вставьте в Excel или Google Таблицы')}
  else if(c==='msgCopy'){copyText(msgText(),'Сообщение скопировано')}
  else if(c==='taskAdd'){
    const txt=($('#tk-text').value||'').trim();if(!txt){toast('Впишите текст задачи');return}
    S.tasks.push({id:uid(),text:txt,role:$('#tk-role').value,status:'todo',scene:$('#tk-scene').value});render()}
  else if(c==='taskMove'){const t=S.tasks.find(x=>x.id===b.dataset.id);if(t){const o=['todo','doing','done'];t.status=o[Math.max(0,Math.min(2,o.indexOf(t.status)+parseInt(b.dataset.d,10)))];render()}}
  else if(c==='taskDel'){S.tasks=S.tasks.filter(x=>x.id!==b.dataset.id);render()}
  else if(c==='taskSeed'){(TASK_SEED[S.role]||[]).forEach(txt=>{if(!S.tasks.some(t=>t.text===txt&&t.role===S.role))S.tasks.push({id:uid(),text:txt,role:S.role,status:'todo',scene:''})});render()}
  else if(c==='taskFilter'){S.tasksAll=!S.tasksAll;render()}
  else if(c==='shotAdd'){
    const sc=S.shotScene||(S.scenes[0]?S.scenes[0].id:'');const n=S.shots.filter(x=>String(x.scene)===String(sc)).length+1;
    S.shots.push({id:uid(),scene:sc,no:String(n),size:'Средний',angle:'Прямо',move:'Статика',mm:35,desc:'',done:false});render()}
  else if(c==='shotDel'){S.shots=S.shots.filter(x=>x.id!==b.dataset.id);render()}
  else if(c==='kppXlsx'){saveFile(kppFile()+'.xlsx',kppXlsx())}
  else if(c==='kppPdf'){savePdf(kppFile()+'.pdf',kppBlocks(),'КПП · '+S.name,b,{landscape:true})}
  else if(c==='kppDocx'){saveFile(kppFile()+'.docx',makeDocx(kppBlocks(),{landscape:true}))}
  else if(c==='kppCopy'){copyText(kppRows().map(r=>r.join('\t')).join('\n'),'КПП скопирован — вставьте в таблицу')}
  else if(c==='shotCopy'){
    const rows=[['Сцена','№','Размер','Ракурс','Движение','мм','Описание','Снято']];
    S.shots.forEach(x=>rows.push([x.scene,x.no,x.size,x.angle,x.move,x.mm,x.desc,x.done?'да':'нет']));
    copyText(rows.map(r=>r.join('\t')).join('\n'),'Шот-лист скопирован')}
  else if(c==='explicCopy'){copyText(exText(),'Экспликация скопирована')}
  else if(c==='ltTod'){const L=curLight();L.tod=b.dataset.k||'';if(!L.tod)delete L.tod;document.querySelectorAll('[data-c=ltTod]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));lt3Look();const lg=$('#lt-legend');if(lg)lg.innerHTML=legendHtml(L);save()}
  else if(c==='ltProp'){const L=curLight(),k=b.dataset.k,P=PROP_K[k];if(!P)return;const n=L.items.filter(i=>i.type==='prop'&&propKind(i)===k).length;
    const it=ltMake('prop',400+Math.round((Math.random()-.5)*160),260+Math.round((Math.random()-.5)*120),{kind:k,len:P.len,label:P.n+(n?' '+(n+1):''),rot:k==='car'?90:0});L.items.push(it);S.lightSel=it.id;paintLight();paintInspector();save()}
  else if(c==='ltAdd'){
    const L=curLight(),k=b.dataset.k,cnt=L.items.filter(i=>i.type===k).length;
    const it=ltMake(k,400+Math.round((Math.random()-.5)*120),260+Math.round((Math.random()-.5)*120));
    if(cnt)it.label=it.label+' '+(cnt+1);
    L.items.push(it);S.lightSel=it.id;paintLight();paintInspector();save()}
  else if(c==='ltTop'){const L=curLight(),sel=selItem(),a=(sel&&sel.type==='actor')?sel:L.items.find(i=>i.type==='actor'),x=a?a.x:400,y=a?a.y:260,cnt=L.items.filter(i=>i.boom).length;
    const it=ltMake('light',x,y,{label:'Топлайт'+(cnt?' '+(cnt+1):''),w:200,k:5600,mod:'Софтбокс',h:3.6,tilt:-90,boom:true,rot:0});L.items.push(it);S.lightSel=it.id;paintLight();paintInspector();save()}
  else if(c==='ltNudge'){ltNudge(b.dataset.k,10)}
  else if(c==='toolsTog'){S.toolsOff=!S.toolsOff;renderChrome()}
  else if(c==='menu'){document.body.classList.toggle('navopen')}
  else if(c==='ltView'){PREF.lt3d=b.dataset.k==='3d';savePref();render()}
  else if(c==='ltPreset'){ltPreset(b.dataset.k);paintLight();paintInspector();save()}
  else if(c==='ltDup'){const it=selItem();if(it){const cp=Object.assign({},it,{id:uid(),x:Math.min(780,it.x+34),y:Math.min(500,it.y+34)});curLight().items.push(cp);S.lightSel=cp.id;paintLight();paintInspector();save()}}
  else if(c==='ltDel'){const L=curLight();L.items=L.items.filter(i=>i.id!==S.lightSel);S.lightSel='';paintLight();paintInspector();save()}
  else if(c==='ltClear'){curLight().items=[];S.lightSel='';paintLight();paintInspector();save()}
  else if(c==='ltSvg'){saveFile('svetoshema.svg',ltSvgString())}

  else if(c==='reset'){
    const btn=$('#resetBtn');
    if(!resetArmed){resetArmed=true;btn.textContent='Нажмите ещё раз — данные удалятся';setTimeout(()=>{resetArmed=false;btn.textContent='Начать с чистого листа'},3500)}
    else{resetArmed=false;btn.textContent='Начать с чистого листа';const kr=S.rates,kd=S.ratesDate,kc=S.cur;S=fresh();S.rates=kr;S.ratesDate=kd;S.cur=kc;S.onboarded=true;render();toast('Проект очищен')}
  }
});

