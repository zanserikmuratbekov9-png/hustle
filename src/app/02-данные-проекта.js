/* ---------- данные проекта ---------- */
const CATS=['Права и сценарий','Режиссура и творческая группа','Актёры','Съёмочная группа','Техника: камера, свет, звук','Локации и транспорт','Реквизит, костюмы, грим','Питание и быт','Постпродакшн','Юридические расходы и страховка','Маркетинг и фестивали'];
const CURN={'$':'USD','€':'EUR','₽':'RUB'};
const LEGACY='smena.producerdesk.v1';
const USERS_KEY='zp.users',SESS_KEY='zp.session';
let USER=null,S=null;
const CFG=window.HUSTLE_CONFIG||{};
let SB=null,CLOUD=null;
try{if(CFG.SUPABASE_URL&&CFG.SUPABASE_KEY&&window.supabase&&window.supabase.createClient)SB=window.supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}catch(e){console.warn('Supabase не подключён',e)}

const fresh=()=>({v:2,name:'Новый проект',cur:'₸',tab:'home',
  rates:{USD:448.94,EUR:502.05,RUB:5.26},ratesDate:'09.10.2026',
  budget:CATS.map(c=>({id:uid(),cat:c,name:'',qty:1,unit:'смена',kzt:0,src:''})),
  contPct:10,feePct:0,taxPct:0,script:'',scenes:[],perDay:4,assign:{},
  cs:{day:1,info:{},castCalls:{},director:'',producer:'',phone:''},
  pc:{},dockOpen:false,seen:{},lastExport:0,bnDismiss:0,heroImg:'',
  role:'producer',shots:[],shotScene:'',notes:{},explic:{},kpp:{},kppMeta:{},tasks:[],tasksAll:true,
  light:{},lightScene:0,lightSel:'',gear:[],disc:0,dealCat:'Все',rtab:'deals',posters:[],artCat:'Все',city:'Алматы',onboarded:false,ptype:'',hubAll:false,doc:{type:'actor',vals:{}},bd:{},locs:[],story:{},storyScene:0,pen:'pen',
  calc:{fps:24,angle:180,ndFrom:8,ndTo:2,mbps:400,mins:30,card:512,d1:2,d2:3},
  });
const perOf=(d,c)=>c==='₸'?1:(num(d.rates[CURN[c]])||1);
const per=()=>perOf(S,S.cur);
function normalize(d){
  const f=fresh();
  Object.keys(f).forEach(k=>{if(d[k]===undefined)d[k]=f[k]});
  if(!d.rates)d.rates=f.rates;
  /* старые и облачные проекты: приводим сценарий и сцены к нужному виду, чтобы разделы не падали */
  if(typeof d.script!=='string')d.script=d.script==null?'':String(d.script);
  if(!Array.isArray(d.scenes))d.scenes=[];
  d.scenes=d.scenes.filter(x=>x&&typeof x==='object').map((x,i)=>{x.id=num(x.id)||i+1;x.type=String(x.type||'ИНТ');x.loc=String(x.loc==null?'':x.loc);x.time=String(x.time==null?'':x.time);
    if(!Array.isArray(x.chars))x.chars=typeof x.chars==='string'?x.chars.split(',').map(t=>t.trim()).filter(Boolean):[];x.chars=x.chars.map(String);x.e=num(x.e)||1;return x});
  if(!d.assign||typeof d.assign!=='object'||Array.isArray(d.assign))d.assign={};
  if(!d.pc||typeof d.pc!=='object'||Array.isArray(d.pc))d.pc={};
  if(!d.kpp||typeof d.kpp!=='object'||Array.isArray(d.kpp))d.kpp={};
  if(!d.kppMeta||typeof d.kppMeta!=='object'||Array.isArray(d.kppMeta))d.kppMeta={};
  if(!(d.cur==='₸'||CURN[d.cur]))d.cur='₸';
  if(d.v!==2){d.budget.forEach(r=>{if(r.kzt==null){r.kzt=num(r.rate)*perOf(d,d.cur);delete r.rate}if(r.src==null)r.src=''});d.v=2}
  d.calc=Object.assign(f.calc,d.calc||{});
  if(d.tab==='deals'||d.tab==='gear'){d.rtab=d.tab==='gear'?'list':'deals';d.tab='rentals'}
  if(!d.rtab)d.rtab='deals';
  if(!ROLE_TABS[d.role])d.role='producer';
  if(ROLE_TABS[d.role].indexOf(d.tab)<0)d.tab='home';
  return d;
}
const dataKey=()=>'zp.data.'+USER+(CLOUD&&CLOUD.pid&&CLOUD.pid!==CLOUD.uid?'.p.'+CLOUD.pid:'');
function loadData(){
  let raw=null;
  try{raw=localStorage.getItem(dataKey())}catch(e){}
  if(!raw){try{const lg=localStorage.getItem(LEGACY);if(lg&&!localStorage.getItem('zp.legacyClaimed')){raw=lg;localStorage.setItem('zp.legacyClaimed',USER)}}catch(e){}}
  let d=null,broken=false;
  try{d=raw?JSON.parse(raw):null}catch(e){broken=true}
  if(raw&&(broken||!d||typeof d!=='object'||Array.isArray(d))){
    try{localStorage.setItem(dataKey()+'.corrupt',raw)}catch(e){}
    LOAD_WARN='Сохранённые данные повреждены. Копия отложена в браузере, начат новый проект.';d=null;
  }
  if(d&&d.onboarded===undefined)d.onboarded=true;
  return normalize(d||fresh());
}
let SAVE_OK=null,LOAD_WARN='';
let LAST_SIG='',cloudTimer=null,cloudBusy=false;
/* подпись содержимого проекта без служебных полей: по ней понимаем, что есть что отправлять в облако */
const syncSig=()=>JSON.stringify(S,(k,v)=>(k==='savedAt'||k==='heroImg')?undefined:v);
function save(){
  if(!S||!USER)return true;
  let ok=true;
  try{
    if(CLOUD){const sig=syncSig();if(sig!==LAST_SIG){LAST_SIG=sig;S.savedAt=Date.now();CLOUD.dirty=true}}
    localStorage.setItem(dataKey(),JSON.stringify(S));
    if(!CLOUD)setSaveState(true);
  }catch(e){ok=false;setSaveState(false,e)}
  if(CLOUD&&CLOUD.dirty)scheduleCloud();
  return ok;
}
function scheduleCloud(delay){
  if(!CLOUD||CLOUD.noPush||CLOUD.ro)return;
  if(!cloudBusy)setSaveState('pending');
  clearTimeout(cloudTimer);cloudTimer=setTimeout(cloudPush,delay==null?500:delay);
}
async function cloudPush(){
  const c=CLOUD;
  if(!c||!SB||c.noPush||c.ro||!c.dirty||!S)return true;
  if(cloudBusy)return false;
  cloudBusy=true;const stamp=S.savedAt;let ok=false,retry=true;
  try{
    const rest=Object.assign({},S);delete rest.heroImg;
    const data=JSON.parse(JSON.stringify(rest));
    if(JSON.stringify(data).length>6e6){const er=new Error('too-big');er.big=true;throw er}
    const now=new Date().toISOString();let r;
    if(c.pid===c.uid)r=await SB.from('projects').upsert({user_id:c.uid,data:data,updated_at:now});
    else{r=await SB.from('projects').update({data:data,updated_at:now}).eq('user_id',c.pid).select('user_id');
      if(!r.error&&(!r.data||!r.data.length)){const er=new Error('no-access');er.noAccess=true;throw er}}
    if(r.error)throw r.error;
    ok=true;c.remoteAt=now;
    if(CLOUD===c&&S&&S.savedAt===stamp){c.dirty=false;setSaveState(true)}
  }catch(e){
    if(e&&e.big)retry=false;
    if(e&&e.noAccess){retry=false;c.noPush=true;toast('Доступ к этому проекту закрыт. Изменения не сохраняются в облаке.')}
    setSaveState(false,{cloud:true,big:!!(e&&e.big)});
    if(retry){clearTimeout(cloudTimer);cloudTimer=setTimeout(cloudPush,30000)}
  }finally{cloudBusy=false}
  if(ok&&CLOUD===c&&c.dirty)scheduleCloud(300);
  return ok;
}
function setSaveState(ok,err){
  const el=$('#saveStat');
  if(ok==='pending'){
    if(el){el.className='savestat ok';el.textContent='Сохраняется…';el.title='Отправляем изменения в облако'}
    return;
  }
  if(ok){
    SAVE_OK=true;setSaveState.warned=false;
    if(el){el.className='savestat ok';el.textContent='Сохранено';el.title=(CLOUD?'Сохранено в облаке в ':'Сохранено в этом браузере в ')+new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}
    return;
  }
  const cloud=!!err&&!!err.cloud;
  const quota=!!err&&!cloud&&(err.name==='QuotaExceededError'||err.code===22||err.code===1014);
  SAVE_OK=false;
  if(el){el.className='savestat bad';el.textContent='Не сохранено';el.title=cloud?(err.big?'Проект слишком большой для облака':'Нет связи с облаком'):(quota?'Память браузера переполнена':'Хранилище браузера недоступно')}
  if(!setSaveState.warned){
    setSaveState.warned=true;
    toast(cloud?(err.big?'Проект слишком большой для облака (больше 6 МБ). Удалите рисунки раскадровки или сохраните проект в файл.':'Не удалось сохранить в облаке. Изменения остаются в этом браузере и отправятся, когда появится связь.'):
      (quota?'Не удалось сохранить: память браузера переполнена. Сохраните проект в файл или удалите рисунки раскадровки.':'Не удалось сохранить: хранилище браузера недоступно. Сохраните проект в файл, иначе данные пропадут.'));
  }
}
window.addEventListener('online',()=>{if(CLOUD&&CLOUD.dirty)scheduleCloud(200)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&CLOUD&&CLOUD.dirty){clearTimeout(cloudTimer);cloudPush()}});
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('on'),2600)}
const money=n=>Math.round(n/per()).toLocaleString('ru-RU')+'\u00A0'+S.cur;
const fmtIn=k=>S.cur==='₸'||S.cur==='₽'?Math.round(k/per()):Math.round(k/per()*100)/100;
function eighths(e){const w=Math.floor(e/8),r=e%8;if(!w&&!r)return '0';return (w?w:'')+(w&&r?' ':'')+(r?r+'/8':'')}

/* ---------- возможности claude.ai (если доступны) ---------- */
let DL=null;
try{
  if(window.claude&&window.claude.use){
    window.claude.use('downloads').then(d=>{DL=d;if(S&&(S.tab==='budget'||S.tab==='script'))render()}).catch(()=>{});
  }
}catch(e){}
const MIMES={json:'application/json',csv:'text/csv',svg:'image/svg+xml',txt:'text/plain',md:'text/markdown',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',zip:'application/zip'};
async function saveFile(name,data,mime){
  mime=(mime||MIMES[(name.split('.').pop()||'').toLowerCase()]||'text/plain');if(typeof data==='string')mime+=';charset=utf-8';
  if(DL){
    try{await DL.save({filename:name,data:data});return true}
    catch(e){if(!(e&&e.code==='declined'))toast('Не удалось сохранить файл');return false}
  }
  /* SVG на телефоне: iOS не принимает его как файл — отдаём картинку PNG */
  if(/\.svg$/i.test(name)&&typeof data==='string'&&matchMedia('(pointer:coarse)').matches){
    try{
      const png=await new Promise((ok,no)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.naturalWidth||1600;c.height=im.naturalHeight||1040;c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(b=>b?ok(b):no(),'image/png')};im.onerror=no;im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(data)});
      return await saveFile(name.replace(/\.svg$/i,'.png'),png,'image/png');
    }catch(e){}
  }
  /* телефон: окно «Поделиться» с пунктом «Сохранить в Файлы» — надёжнее, чем скачивание по ссылке */
  try{
    if(matchMedia('(pointer:coarse)').matches&&navigator.canShare&&navigator.share){
      const f=new File([data],name,{type:mime.split(';')[0]});
      if(navigator.canShare({files:[f]})){
        try{await navigator.share({files:[f],title:name});toast('Файл отправлен: '+name+'. Выберите «Сохранить в Файлы»');return true}
        catch(e){if(e&&e.name==='AbortError')return false}
      }
    }
  }catch(e){}
  try{
    const blob=new Blob([data],{type:mime}),a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800);
    toast('Файл сохранён: '+name);return true;
  }catch(e){toast('Скачивание недоступно в этом окне — используйте копирование');return false}
}

