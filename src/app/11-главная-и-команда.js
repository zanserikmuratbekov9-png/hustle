/* ---------- главная ---------- */
/* лого и слоган на главной — по центру всего экрана, а не колонки справа от меню */
function heroHtml(){
  const bg=S.heroImg||PHOTO_BG;
  const flt=(id,sc)=>'<filter id="'+id+'" x="-6%" y="-25%" width="112%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.016 0.03" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="'+sc+'" xChannelSelector="R" yChannelSelector="G" result="d"/><feDropShadow in="d" dx="0" dy="4" stdDeviation="0" style="flood-color:var(--brand-dark);flood-opacity:.35"/></filter>';
  const big='';
  const sub='<p class="yf-slogan">Снимай красивое кино, вместе с HUSTLE</p>';
  return '<section class="yf" aria-label="HUSTLE"'+(bg?' style="--yf-img:url(\''+bg+'\')"':'')+'>'+
    '<div aria-hidden="true"></div>'+
    '<div class="yf-mid">'+big+sub+'<div class="yf-act"><button class="yw-btn yf-b1" type="button" data-c="tab" data-k="proj">Начать проект</button></div></div>'+
    '<div aria-hidden="true"></div></section>'+heroCtl();
}
function heroCtl(){return ''}
function sloganHtml(){return '';
  return '<footer class="slogan'+(S.tab==='home'?' big':'')+'" aria-label="Слоган"><span class="sl-t">Снимай кино…</span><span class="sl-b">HUSTLE — рабочий стол для съёмок</span></footer>';
}
function statsOrHint(){
  const hs=homeStats(),vals=(hs.match(/<b>[^<]*<\/b>/g)||[]);
  if(vals.length&&vals.every(x=>x==='<b>—</b>'))return '<div class="pc-hint">'+icon('bulb')+'<span>'+({producer:'Загрузите сценарий и заполните смету: здесь появятся бюджет, съёмочные дни, сцены и локации.',director:'Загрузите сценарий: здесь появятся сцены, заметки и кадры.',operator:'Начните светосхему или шот-лист: здесь появится прогресс по кадрам и технике.'}[S.role]||'Заполните проект: здесь появятся цифры.')+'</span></div>';
  return '<div class="stats">'+hs+'</div>';
}
function quickActions(){
  const m={
    producer:[['script','script','Загрузить сценарий'],['budget','budget','Открыть смету'],['tasks','check','Задачи команды']],
    director:[['script','script','Загрузить сценарий'],['shots','frame','Шот-лист'],['tasks','check','Задачи команды']],
    operator:[['lights','bulb','Светосхема'],['shots','frame','Шот-лист'],['tasks','check','Задачи команды']]
  }[S.role];
  return m.map((x,i)=>'<button class="btn'+(i?' sec':'')+'" type="button" data-c="tab" data-k="'+x[0]+'">'+icon(x[1])+x[2]+'</button>').join('');
}
function posterList(){
  const custom=(S.posters||[]).map(p=>({custom:true,id:p.id,rental:p.rental,title:p.title,price:p.price,note:'акция рентала',url:p.url||'',badge:'Акция'}));
  const ids=['r8-fx3','r8-a7c','r8-ls600','r8-amaran60','r8-podcast','r8-gopro','r8-sm7b','r8-xt3','r8-tele','r8-visico'];
  const deals=ids.map(dealById).filter(Boolean).map(d=>({id:d[0],rental:rentalName(d[3]),title:d[1],price:(d[5]?'от ':'')+money(d[4]),note:'за сутки, по прайсу Rental8 на 12.10.2026 (на 8 часов дешевле)',url:dealUrl(d),badge:'Прайс',deal:true}));
  return custom.concat(deals);
}
function posterHtml(p,i){
  const link=p.url?'<a class="btn" href="'+esc(p.url)+'" target="_blank" rel="noopener noreferrer">'+icon('ext')+'Открыть</a>':'';
  const add=p.deal?'<button class="btn sec" type="button" data-c="gearAdd" data-id="'+p.id+'">'+icon('plus')+'В список</button>':'';
  const del=p.custom?'<button class="x" type="button" data-c="posterDel" data-id="'+p.id+'" aria-label="Удалить постер">×</button>':'';
  return '<article class="poster p1">'+del+'<span class="pbadge">'+esc(p.badge)+'</span><div class="pr">'+esc(p.rental)+'</div><h3>'+esc(p.title)+'</h3><div class="pp">'+esc(p.price)+'</div><div class="pf">'+esc(p.note)+'</div><div class="row">'+link+add+'</div></article>';
}
function showHero(){return !USER||USER==='guest'}
function vHome(){
  const cat=S.artCat||'Все';
  const steps=homeSteps();let next=-1;steps.forEach((x,i)=>{if(next<0&&!stepDone(x[0]))next=i});
  const intro={producer:'Продюсер: сценарий, план съёмок, смета и документы.',director:'Режиссёр: сценарий, заметки, экспликация и кадры.',operator:'Оператор: свет, кадры и техника.'}[S.role];
  const nextBlock=next>-1?
    '<div class="pc-next"><div><b>'+t('Следующий шаг')+': '+steps[next][1]+'</b><span>'+steps[next][2]+'</span></div><button class="btn" type="button" data-c="tab" data-k="'+steps[next][0]+'">'+icon(TAB_DEF[steps[next][0]][2])+steps[next][3]+'</button></div>':
    '<div class="pc-next"><div><b>Все шаги выполнены</b><span>Всё главное заполнено.</span></div><button class="btn" type="button" data-c="tab" data-k="'+steps[steps.length-1][0]+'">'+icon(TAB_DEF[steps[steps.length-1][0]][2])+steps[steps.length-1][3]+'</button></div>';
  const demo=S.scenes.length?'':'<div class="row" style="margin-top:10px"><span class="muted">Начать с готового примера:</span>'+[['1','Короткий метр'],['3','Клип'],['4','Реклама'],['2','Короткий метр «Ночной эфир»']].map(x=>'<button class="btn sec" type="button" data-c="demo" data-k="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  const proj='<section class="hero projcard"><div class="pc-top"><div><span class="lbl">'+(isShared()?'Проект команды':t('Мой проект'))+' — '+t(ROLES[S.role].t)+'</span><h2>'+esc(S.name)+'</h2><p>'+intro+'</p></div>'+statsOrHint()+'</div>'+
    '<div class="row" style="margin-top:14px">'+quickActions()+'</div>'+demo+'</section>';
  const posters=posterList().map(posterHtml).join('');
  const addForm='<details class="addp noprint"><summary>Добавить акцию, о которой вам рассказал рентал</summary><div class="fields" style="margin-top:10px"><label>Рентал<input id="pk-rental" placeholder="Например, BQRental"></label><label>Что в акции<input id="pk-title" placeholder="Например, Aputure 300x на выходные"></label><label>Цена или скидка<input id="pk-price" placeholder="Например, −20% или 8 800 ₸"></label><label>Ссылка (необязательно)<input id="pk-url" placeholder="https://…"></label><div class="wide"><button class="btn" type="button" data-c="posterAdd">'+icon('plus')+'Добавить постер</button></div></div></details>';
  return toolMenu()+todayBanner()+proj+
    '<section class="card promo8"><div><b>Нужна техника? Rental8</b><p class="muted">Камеры, свет, звук и комплекты для съёмок в Алматы.</p></div><button class="btn sec" type="button" data-c="tab" data-k="rentals">'+icon('store')+'Смотреть</button></section>'+
    (showHero()?heroHtml():'')+'<p class="site-foot">HUSTLE · Сделано в Алматы, 2026</p>';
}


/* ---------- командная работа ---------- */
let TEAM={at:0,teams:[],members:[],invite:'',busy:false,err:''};
try{const m=/[#&]join=([A-Za-z0-9_-]{20,64})/.exec(location.hash);if(m){localStorage.setItem('zp.join',m[1]);history.replaceState(null,'',location.pathname+location.search)}}catch(e){}
const pendingJoin=()=>{try{return localStorage.getItem('zp.join')}catch(e){return null}};
const isShared=()=>!!(CLOUD&&CLOUD.pid&&CLOUD.pid!==CLOUD.uid);
async function processJoin(){
  if(!CLOUD||!SB)return;
  let tok=pendingJoin(),fromMeta=false;
  if(!tok){try{const u=(await SB.auth.getSession()).data.session;const j=u&&u.user&&u.user.user_metadata&&u.user.user_metadata.join;if(j&&/^[A-Za-z0-9_-]{20,64}$/.test(j)){tok=j;fromMeta=true}}catch(e){}}
  if(!tok)return;
  try{localStorage.removeItem('zp.join')}catch(e){}
  try{if(fromMeta)SB.auth.updateUser({data:{join:null}})}catch(e){}
  try{
    const r=await SB.rpc('join_project',{p_token:tok});
    if(r.error)throw r.error;
    const owner=r.data;
    if(!owner||owner===CLOUD.uid){toast('Это приглашение в ваш собственный проект');return}
    TEAM.at=0;toast('Вы присоединились к проекту команды');switchProject(owner);
  }catch(e){
    const m=String(e&&(e.message||e.code)||'');
    toast(/invite_invalid/.test(m)?'Ссылка-приглашение недействительна или устарела. Попросите новую.':/function|join_project|schema/i.test(m)?'Командная работа ещё не включена на сервере.':'Не удалось присоединиться к проекту. Попробуйте ещё раз.');
  }
}
async function loadTeam(force){
  if(!CLOUD||!SB||TEAM.busy)return;
  if(!force&&Date.now()-TEAM.at<30000)return;
  TEAM.busy=true;TEAM.err='';
  try{
    const a=await SB.rpc('my_teams');if(a.error)throw a.error;
    TEAM.teams=a.data||[];
    if(!isShared()){const b=await SB.from('project_members').select('*').eq('owner_id',CLOUD.uid).order('joined_at');if(b.error)throw b.error;TEAM.members=b.data||[]}
    else TEAM.members=[];
  }catch(e){TEAM.err=/function|relation|schema|does not exist/i.test(String(e&&(e.message||e.code)||''))?'setup':'net'}
  finally{TEAM.busy=false;TEAM.at=Date.now()}
  if(S&&S.tab==='proj')render();
}
async function switchProject(pid){
  if(!CLOUD||!SB||CLOUD.pid===pid)return;
  const c=CLOUD;
  if(c.dirty&&!c.noPush)await cloudPush();
  const s=(await SB.auth.getSession()).data.session;if(!s){showAuth();return}
  try{localStorage.setItem('zp.lastpid.'+c.uid,pid)}catch(e){}
  CLOUD=null;TEAM.at=0;TEAM.invite='';
  await enterCloud(s,pid);
}
async function teamInvite(btn,role){
  role=role==='viewer'?'viewer':'editor';
  if(!CLOUD||isShared())return;
  if(btn)btn.disabled=true;
  try{
    if(CLOUD.dirty)await cloudPush();
    const a=new Uint8Array(18);crypto.getRandomValues(a);
    const tok=btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    let r=await SB.from('project_invites').insert({token:tok,owner_id:CLOUD.uid,role:role});
    if(r.error&&/role/.test(String(r.error.message||''))){toast('Чтобы выбрать права, выполните supabase/team_roles.sql в Supabase');return}
    if(r.error)throw r.error;
    TEAM.invite=location.origin+location.pathname+'#join='+tok;TEAM.invRole=role;render();
    copyText(TEAM.invite,role==='viewer'?'Ссылка для просмотра скопирована':'Ссылка для редактора скопирована');
  }catch(e){toast(/relation|schema|does not exist/i.test(String(e&&(e.message||e.code)||''))?'Командная работа ещё не включена на сервере.':'Не удалось создать приглашение')}
  finally{if(btn)btn.disabled=false}
}
async function teamRole(id,role){
  if(!CLOUD||isShared())return;role=role==='viewer'?'viewer':'editor';
  const r=await SB.from('project_members').update({role:role}).eq('owner_id',CLOUD.uid).eq('member_id',id).select('member_id');
  if(r.error||!r.data||!r.data.length){toast('Не удалось изменить права. Проверьте, что выполнен supabase/team_roles.sql');return}
  toast(role==='viewer'?'Теперь участник может только смотреть':'Теперь участник может редактировать');loadTeam(true);
}
async function teamKick(id){
  if(!CLOUD)return;
  const r=await SB.from('project_members').delete().eq('owner_id',CLOUD.uid).eq('member_id',id);
  if(r.error){toast('Не удалось убрать участника');return}
  toast('Участник убран из команды');loadTeam(true);
}
async function teamLeave(){
  if(!isShared())return;
  const pid=CLOUD.pid,uid=CLOUD.uid;
  const r=await SB.from('project_members').delete().eq('owner_id',pid).eq('member_id',uid);
  if(r.error){toast('Не удалось выйти из проекта');return}
  CLOUD.noPush=true;try{localStorage.removeItem(dataKey());localStorage.removeItem('zp.lastpid.'+uid)}catch(e){}
  toast('Вы вышли из проекта команды');switchProject(uid);
}
const KEEP_LOCAL=['tab','role','pc','dockOpen','hubAll','seen','onboarded','rtab','dealCat','artCat','lightSel'];
let PULL_WAIT=false,PULL_BUSY=false,ROLE_AT=0;
async function roleCheck(){
  const c=CLOUD;if(!c||!SB||!isShared())return;const w=2500-(Date.now()-ROLE_AT);if(w>0){if(!roleCheck.t)roleCheck.t=setTimeout(()=>{roleCheck.t=0;roleCheck()},w);return}ROLE_AT=Date.now();
  try{const m=await SB.from('project_members').select('role').eq('owner_id',c.pid).eq('member_id',c.uid).maybeSingle();
    if(CLOUD!==c||m.error||!m.data)return;const ro=m.data.role==='viewer';
    if(ro!==!!c.ro){c.ro=ro;document.body.classList.toggle('ro',ro);if(!ro)c.dirty=false;toast(ro?'Владелец изменил ваши права: теперь только просмотр':'Владелец изменил ваши права: теперь вы редактор');if(S&&S.tab==='proj')render()}
  }catch(e){}
}
async function pullRemote(){
  roleCheck();
  const c=CLOUD;if(!c||!SB||(c.dirty&&!c.ro)||(c.noPush&&!c.ro)||cloudBusy||!S||PULL_BUSY)return;
  const ae=document.activeElement;if(!c.ro&&ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)){PULL_WAIT=true;return}
  PULL_BUSY=true;PULL_WAIT=false;
  try{
    const h=await SB.from('projects').select('updated_at').eq('user_id',c.pid).maybeSingle();
    if(CLOUD!==c||h.error||!h.data)return;
    if(c.remoteAt&&new Date(h.data.updated_at)<=new Date(c.remoteAt))return;
    const r=await SB.from('projects').select('data,updated_at').eq('user_id',c.pid).maybeSingle();
    if(CLOUD!==c||(c.dirty&&!c.ro)||r.error||!r.data||!r.data.data)return;
    if(c.remoteAt&&new Date(r.data.updated_at)<=new Date(c.remoteAt))return;
    if(!c.remoteAt){c.remoteAt=r.data.updated_at;return}
    const d=normalize(JSON.parse(JSON.stringify(r.data.data)));
    KEEP_LOCAL.forEach(k=>{if(k in S)d[k]=S[k]});d.heroImg=S.heroImg||'';
    S=d;LAST_SIG=syncSig();c.remoteAt=r.data.updated_at;
    try{localStorage.setItem(dataKey(),JSON.stringify(S))}catch(e){}
    c.dirty=false;render();toast(isShared()||TEAM.members.length?'Проект обновлён: есть изменения от команды':'Проект обновлён: появились новые изменения');
  }catch(e){}finally{PULL_BUSY=false}
}
setInterval(()=>{if(document.visibilityState==='visible')pullRemote()},4000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pullRemote()});
document.addEventListener('focusout',()=>{if(PULL_WAIT)setTimeout(pullRemote,300)});
let RT=null;
function liveSub(){
  try{
    if(RT&&SB){SB.removeChannel(RT);RT=null}
    const c=CLOUD;if(!c||!SB||!SB.channel)return;
    RT=SB.channel('proj-'+c.pid).on('postgres_changes',{event:'*',schema:'public',table:'projects',filter:'user_id=eq.'+c.pid},()=>{if(CLOUD===c)pullRemote()}).subscribe();
  }catch(e){}
}
function teamHtml(){
  if(!SB)return '';
  if(!CLOUD)return panel('team','users','Команда','<p class="muted" style="margin:0">Чтобы работать над проектом вместе, войдите в аккаунт. В демо-режиме проект хранится только в этом браузере.</p>');
  loadTeam();
  if(TEAM.err==='setup')return panel('team','users','Команда','<p class="muted" style="margin:0">Командная работа ещё не включена на сервере: нужно выполнить <b>supabase/team.sql</b> в Supabase.</p>');
  const own=!isShared();
  const projBtn=(pid,label,sub)=>'<button class="tproj'+(CLOUD.pid===pid?' on':'')+'" type="button" data-c="switchProj" data-id="'+esc(pid)+'"'+(CLOUD.pid===pid?' aria-current="true"':'')+'><b>'+esc(label)+'</b><small>'+esc(sub)+'</small></button>';
  const projs='<div class="tprojs">'+projBtn(CLOUD.uid,'Мой проект',own?S.name:'ваш личный проект')+TEAM.teams.map(x=>projBtn(x.owner_id,x.project_name||'Проект без названия','владелец: '+(x.owner_name||x.owner_email||'участник'))).join('')+'</div>';
  let body='<span class="lbl">Проекты</span>'+projs;
  if(own){
    const mem=TEAM.members.length?'<ul class="tmem">'+TEAM.members.map(m=>'<li><span class="av" aria-hidden="true">'+esc(((m.member_name||m.member_email||'?')[0]||'?').toUpperCase())+'</span><span><b>'+esc(m.member_name||m.member_email||'Участник')+'</b>'+(m.member_name&&m.member_email?'<small>'+esc(m.member_email)+'</small>':'')+'</span><span class="trole" role="group" aria-label="Права"><button type="button" data-c="teamRole" data-k="viewer" data-id="'+esc(m.member_id)+'" aria-pressed="'+(m.role==='viewer')+'">Просмотр</button><button type="button" data-c="teamRole" data-k="editor" data-id="'+esc(m.member_id)+'" aria-pressed="'+(m.role!=='viewer')+'">Редактор</button></span><button class="link" type="button" data-c="teamKick" data-id="'+esc(m.member_id)+'">Убрать</button></li>').join('')+'</ul>':'<p class="muted" style="margin:6px 0 0">Пока в команде только вы.</p>';
    body+='<span class="lbl" style="margin-top:16px;display:block">Команда этого проекта</span>'+mem+
      '<span class="lbl" style="margin-top:16px;display:block">Пригласить по ссылке</span><div class="row" style="margin-top:8px"><button class="btn" type="button" data-c="teamInvite" data-k="editor">'+icon('plus')+'Редактор</button><button class="btn sec" type="button" data-c="teamInvite" data-k="viewer">'+icon('plus')+'Только просмотр</button></div>'+
      (TEAM.invite?'<label style="margin-top:10px;display:flex;flex-direction:column;gap:6px">Ссылка '+(TEAM.invRole==='viewer'?'для просмотра':'для редактора')+' (действует 14 дней)<input class="tinv" readonly value="'+esc(TEAM.invite)+'" onclick="this.select()"></label>':'')+
      '<p class="muted" style="margin:10px 0 0;font-size:13px">Редактор может менять проект, участник с правом просмотра только смотрит. Права можно поменять в списке команды. Изменения появляются у всех почти сразу; если двое правят одно и то же одновременно, сохранится последнее изменение.</p>';
  }else{
    const ow=TEAM.teams.find(x=>x.owner_id===CLOUD.pid);
    body+='<p style="margin:14px 0 0">Вы участник проекта'+(ow?' <b>'+esc(ow.owner_name||ow.owner_email||'')+'</b>':'')+'. '+(CLOUD.ro?'У вас доступ <b>только для просмотра</b>: ваши правки не сохраняются.':'Вы <b>редактор</b>: изменения сохраняются для всей команды.')+'</p>'+
      '<div class="row" style="margin-top:12px"><button class="btn sec" type="button" data-c="teamLeave">Покинуть проект</button></div>';
  }
  return panel('team','users','Команда и проекты',body);
}
