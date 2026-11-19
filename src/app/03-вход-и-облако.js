/* ---------- вход ---------- */
let authMode='login',AUTH_PENDING='';
const getUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY))||{}}catch(e){return {}}};
const setUsers=u=>{try{localStorage.setItem(USERS_KEY,JSON.stringify(u))}catch(e){}};
async function hashPw(pw,salt){
  if(!(window.crypto&&crypto.subtle))throw new Error('no-subtle');
  const enc=new TextEncoder();
  const key=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256);
  return 'p'+Array.from(new Uint8Array(bits)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
let RECOVERY=false;
function renderAuth(){
  {const jn=$('#joinNote');if(jn)jn.hidden=!(SB&&pendingJoin())}
  const cloud=!!SB,mode=authMode,reg=mode==='register',rec=mode==='recover',forgot=mode==='forgot',ver=mode==='verify',res=mode==='reset';
  const card=$('#authCard');if(card)card.classList.toggle('cloud',cloud);
  const sm=$('.auth-more summary');if(sm)sm.textContent=cloud?'Вход и регистрация':'Локальный аккаунт (демо)';
  const det=$('.auth-more');if(det&&cloud&&!renderAuth.opened){det.open=true;renderAuth.opened=true}
  const tabs=$('.auth-more .tabs');if(tabs)tabs.hidden=rec||forgot||ver||res;
  $('#tab-login').setAttribute('aria-selected',String(mode==='login'));
  $('#tab-register').setAttribute('aria-selected',String(reg));
  const minPw=cloud?8:6;
  let h='';
  if(rec){
    h='<p class="auth-sub">Введите новый пароль для вашего аккаунта.</p><label>Новый пароль (не короче 8 символов)<input name="password" type="password" autocomplete="new-password" required></label><button class="btn" type="submit">Сохранить пароль</button>';
  }else if(res){
    h='<p class="auth-sub">Если аккаунт с почтой <b>'+esc(AUTH_PENDING)+'</b> есть, мы отправили на неё код. Введите код и придумайте новый пароль. Проверьте также папку «Спам».</p><label>Код из письма<input name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="10" pattern="[0-9 ]*" required placeholder="123456"></label><label>Новый пароль (не короче 8 символов)<input name="password" type="password" autocomplete="new-password" required></label><button class="btn" type="submit">Сменить пароль</button><button class="link" type="button" data-c="authTab" data-k="resend">Отправить код ещё раз</button><button class="link" type="button" data-c="authTab" data-k="login">Вернуться ко входу</button>';
  }else if(ver){
    h='<p class="auth-sub">Мы отправили код подтверждения на <b>'+esc(AUTH_PENDING)+'</b>. Введите его ниже. Письмо может прийти в течение минуты, проверьте также папку «Спам».</p><label>Код из письма<input name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="10" pattern="[0-9 ]*" required placeholder="123456"></label><button class="btn" type="submit">Подтвердить</button><button class="link" type="button" data-c="authTab" data-k="resend">Отправить код ещё раз</button><button class="link" type="button" data-c="authTab" data-k="register">Изменить почту</button>';
  }else if(forgot){
    h='<p class="auth-sub">Укажите почту аккаунта — пришлём код для смены пароля.</p><label>Эл. почта<input name="email" type="email" autocomplete="email" required></label><button class="btn" type="submit">Отправить ссылку</button><button class="link" type="button" data-c="authTab" data-k="login">Назад ко входу</button>';
  }else{
    h=(reg?'<label>Имя<input name="name" autocomplete="name" placeholder="Как к вам обращаться"></label>':'')+
      '<label>Эл. почта<input name="email" type="email" autocomplete="email" required placeholder="you@example.com"></label>'+
      '<label>Пароль'+(reg?' (не короче '+minPw+' символов)':'')+'<input name="password" type="password" autocomplete="'+(reg?'new-password':'current-password')+'" required></label>'+
      (cloud&&reg?'<label class="chk"><input type="checkbox" name="consent" required><span>Согласен(на) на обработку персональных данных согласно <a href="privacy.html" target="_blank" rel="noopener">политике конфиденциальности</a></span></label>':'')+
      '<button class="btn" type="submit">'+(reg?'Создать аккаунт':'Войти')+'</button>'+
      (cloud&&!reg?'<button class="link" type="button" data-c="authTab" data-k="forgot">Забыли пароль?</button>':'');
  }
  $('#authForm').innerHTML=h;
  const note=$('#authNote');
  if(note)note.textContent=cloud?'Проект сохраняется в облаке и доступен с любого устройства после входа.':'Аккаунт нужен, чтобы держать несколько проектов в одном браузере. Он не защищает данные от других пользователей этого компьютера и не работает на других устройствах. Для публичного запуска и платной подписки нужна серверная авторизация.';
  $('#authMsg').textContent='';
}
function showAuth(keepMode){
  USER=null;S=null;CLOUD=null;LAST_SIG='';document.body.classList.remove('ro');try{if(RT&&SB){SB.removeChannel(RT);RT=null}}catch(e){}
  $('#onb').hidden=true;$('#app').hidden=true;$('#auth').hidden=false;
  document.body.classList.remove('homebg');
  if(!keepMode)authMode='login';
  renderAuth();paintLandTour();$$('.logo').forEach(b=>b.innerHTML=LOGO);$$('.lf-ic').forEach(s=>{if(!s.firstChild)s.innerHTML=icon(s.dataset.ic)});applyTheme();
}
function enter(user){
  CLOUD=null;USER=user;S=loadData();
  try{localStorage.setItem(SESS_KEY,user)}catch(e){}
  $('#auth').hidden=true;$('#app').hidden=false;
  closeMenus();
  render();showOnb();
  if(LOAD_WARN){toast(LOAD_WARN);LOAD_WARN=''}
}

/* ---------- облачный вход (Supabase) ---------- */
function authError(e){
  const m=String((e&&(e.code||e.message))||'').toLowerCase();
  if(m.indexOf('invalid_credentials')>-1||m.indexOf('invalid login')>-1)return 'Неверная почта или пароль.';
  if(m.indexOf('email_not_confirmed')>-1||m.indexOf('not confirmed')>-1)return 'Почта ещё не подтверждена. Введите код из письма.';
  if(m.indexOf('user_already_exists')>-1||m.indexOf('already registered')>-1)return 'Такой аккаунт уже есть. Войдите или восстановите пароль.';
  if(m.indexOf('weak_password')>-1||(m.indexOf('password')>-1&&m.indexOf('should')>-1))return 'Пароль слишком простой: нужно не меньше 8 символов, лучше буквы и цифры.';
  if(m.indexOf('over_email_send_rate_limit')>-1||m.indexOf('over_request_rate_limit')>-1||(m.indexOf('rate')>-1&&m.indexOf('limit')>-1))return 'Слишком много попыток. Подождите немного и повторите.';
  if(m.indexOf('otp_expired')>-1||m.indexOf('token has expired')>-1||m.indexOf('invalid')>-1&&m.indexOf('token')>-1)return 'Код неверный или устарел. Проверьте цифры или запросите новый код.';
  if(m.indexOf('failed to fetch')>-1||m.indexOf('load failed')>-1||m.indexOf('network')>-1||m.indexOf('fetch')>-1&&m.indexOf('error')>-1)return 'Сервер сейчас не отвечает. Проверьте интернет и попробуйте ещё раз через пару минут.';
  const raw=String((e&&(e.message||e.code))||'').slice(0,160);
  return 'Не удалось выполнить действие. Попробуйте ещё раз чуть позже.'+(raw?' Причина: '+raw:'');
}
async function onAuthSubmitCloud(e){
  e.preventDefault();
  const f=e.target,g=n=>f.elements.namedItem(n),msg=$('#authMsg'),btn=f.querySelector('button[type=submit]');
  const email=g('email')?g('email').value.trim().toLowerCase():'',pw=g('password')?g('password').value:'';
  msg.textContent='';
  try{
    if(btn)btn.disabled=true;
    if(authMode==='recover'){
      if(pw.length<8){msg.textContent='Пароль слишком короткий: нужно не меньше 8 символов.';return}
      const r=await SB.auth.updateUser({password:pw});
      if(r.error)throw r.error;
      RECOVERY=false;authMode='login';
      const s=(await SB.auth.getSession()).data.session;
      toast('Пароль изменён');
      if(s)enterCloud(s);else renderAuth();
      return;
    }
    if(authMode==='reset'){
      const code=((g('code')||{value:''}).value||'').replace(/\D/g,'');
      if(code.length<6){msg.textContent='Введите код из письма: он состоит из цифр, обычно их 6.';return}
      if(pw.length<8){msg.textContent='Пароль слишком короткий: нужно не меньше 8 символов.';return}
      const v=await SB.auth.verifyOtp({email:AUTH_PENDING,token:code,type:'recovery'});
      if(v.error)throw v.error;
      const u=await SB.auth.updateUser({password:pw});
      if(u.error)throw u.error;
      AUTH_PENDING='';authMode='login';
      toast('Пароль изменён');
      const ss=(v.data&&v.data.session)||(await SB.auth.getSession()).data.session;
      if(ss)enterCloud(ss);else renderAuth();
      return;
    }
    if(authMode==='verify'){
      const code=((g('code')||{value:''}).value||'').replace(/\D/g,'');
      if(code.length<6){msg.textContent='Введите код из письма: он состоит из цифр, обычно их 6.';return}
      const r=await SB.auth.verifyOtp({email:AUTH_PENDING,token:code,type:'signup'});
      if(r.error)throw r.error;
      AUTH_PENDING='';authMode='login';
      if(r.data&&r.data.session){enterCloud(r.data.session)}
      else{renderAuth();$('#authMsg').textContent='Почта подтверждена. Теперь войдите.'}
      return;
    }
    if(authMode==='forgot'){
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){msg.textContent='Проверьте адрес почты: он должен выглядеть как name@example.com.';return}
      const r=await SB.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
      if(r.error)throw r.error;
      AUTH_PENDING=email;authMode='reset';renderAuth();
      return;
    }
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){msg.textContent='Проверьте адрес почты: он должен выглядеть как name@example.com.';return}
    if(authMode==='register'){
      if(pw.length<8){msg.textContent='Пароль слишком короткий: нужно не меньше 8 символов.';return}
      if(!g('consent')||!g('consent').checked){msg.textContent='Нужно согласие на обработку персональных данных.';return}
      const name=((g('name')||{value:''}).value||'').trim()||email.split('@')[0];
      const r=await SB.auth.signUp({email:email,password:pw,options:{data:Object.assign({name:name,consent_at:new Date().toISOString()},pendingJoin()?{join:pendingJoin()}:{}),emailRedirectTo:location.origin+location.pathname}});
      if(r.error)throw r.error;
      if(r.data&&!r.data.session&&r.data.user&&Array.isArray(r.data.user.identities)&&r.data.user.identities.length===0){
        authMode='login';renderAuth();const em=$('#authForm input[name=email]');if(em)em.value=email;
        $('#authMsg').textContent='Аккаунт с такой почтой уже есть, письмо с кодом не отправляется. Войдите с паролем или нажмите «Забыли пароль?». Если почта не подтверждена, после входа придёт новый код.';return;
      }
      if(r.data&&r.data.session){enterCloud(r.data.session)}
      else{AUTH_PENDING=email;authMode='verify';renderAuth();$('#authMsg').textContent='Код отправлен на '+email+'.'+(pendingJoin()?' После подтверждения откроется проект команды.':'')}
      return;
    }
    const r=await SB.auth.signInWithPassword({email:email,password:pw});
    if(r.error){
      if(String(r.error.code||r.error.message).toLowerCase().indexOf('not_confirmed')>-1||String(r.error.message||'').toLowerCase().indexOf('not confirmed')>-1){
        AUTH_PENDING=email;authMode='verify';renderAuth();
        try{await SB.auth.resend({type:'signup',email:email})}catch(x){}
        $('#authMsg').textContent='Почта ещё не подтверждена. Мы отправили новый код на '+email+'.';return;
      }
      throw r.error;
    }
    enterCloud(r.data.session);
  }catch(err){msg.textContent=authError(err)}
  finally{if(btn)btn.disabled=false}
}
function onAuthSubmit(e){return SB?onAuthSubmitCloud(e):onAuthSubmitLocal(e)}

async function enterCloud(session,pid){
  const u=session.user;
  if(!pid){try{pid=localStorage.getItem('zp.lastpid.'+u.id)}catch(e){}}
  pid=pid||u.id;
  if(CLOUD&&CLOUD.uid===u.id&&CLOUD.pid===pid)return;
  const c=CLOUD={uid:u.id,pid:pid,email:u.email||'',name:(u.user_metadata&&u.user_metadata.name)||'',dirty:false,noPush:false,remoteAt:null};
  USER='u:'+u.id;
  const am=$('#authMsg');if(am)am.textContent='Загружаем проект…';
  let cacheRaw=null;try{cacheRaw=localStorage.getItem(dataKey())}catch(e){}
  let remote=null,failed=false;
  try{
    const r=await SB.from('projects').select('data,updated_at').eq('user_id',pid).maybeSingle();
    if(r.error)throw r.error;
    remote=r.data;
  }catch(e){failed=true}
  if(CLOUD!==c)return;
  if(!failed&&pid!==u.id&&!remote){
    try{localStorage.removeItem('zp.lastpid.'+u.id)}catch(e){}
    toast('Проект команды недоступен: возможно, вас убрали из команды. Открываю ваш проект.');CLOUD=null;return enterCloud(session,u.id);
  }
  if(failed){
    showDialog({title:'Нет связи с облаком',
      text:cacheRaw?'Не удалось загрузить проект с сервера. Можно повторить или открыть копию из этого браузера (до перезагрузки страницы изменения в облако отправляться не будут).':'Не удалось загрузить проект с сервера. Проверьте интернет и повторите.',
      actions:[{label:'Повторить',run:()=>{CLOUD=null;enterCloud(session,pid)}}].concat(cacheRaw?[{label:'Открыть копию из браузера',sec:true,run:()=>finishCloud(c,null,true)}]:[{label:'Выйти',sec:true,run:()=>showAuth()}])});
    return;
  }
  c.remoteAt=remote&&remote.updated_at||null;
  if(pid!==u.id){try{const m=await SB.from('project_members').select('role').eq('owner_id',pid).eq('member_id',u.id).maybeSingle();c.ro=!!(m.data&&m.data.role==='viewer')}catch(e){}}
  if(CLOUD!==c)return;
  finishCloud(c,remote,false);
}
function finishCloud(c,remote,offline){
  if(CLOUD!==c)return;
  let cacheRaw=null;try{cacheRaw=localStorage.getItem(dataKey())}catch(e){}
  const local=cacheRaw?loadData():null;
  let rem=null;
  if(remote&&remote.data&&typeof remote.data==='object'&&!Array.isArray(remote.data)){try{rem=normalize(JSON.parse(JSON.stringify(remote.data)))}catch(e){rem=null}}
  let chosen=null,fromRemote=false,offerGuest=null;
  if(rem&&(c.ro||!local||(rem.savedAt||0)>=(local.savedAt||0))){
    chosen=rem;chosen.heroImg=(local&&local.heroImg)||chosen.heroImg||'';fromRemote=true;
  }else if(local){
    chosen=local;if(!offline)c.dirty=true;
  }
  if(offline)c.noPush=true;
  if(!chosen){
    chosen=fresh();
    if(c.pid===c.uid)
    try{
      const raw=localStorage.getItem('zp.data.guest');
      if(raw){const g=normalize(JSON.parse(raw)),prev=S;S=g;const has=hasData();S=prev;if(has)offerGuest=g}
    }catch(e){}
  }
  S=chosen;
  LAST_SIG=fromRemote?syncSig():'';
  $('#auth').hidden=true;const am=$('#authMsg');if(am)am.textContent='';$('#app').hidden=false;
  closeMenus();render();showOnb();
  if(LOAD_WARN){toast(LOAD_WARN);LOAD_WARN=''}
  if(offline)setSaveState(false,{cloud:true});
  document.body.classList.toggle('ro',!!c.ro);if(c.ro)setTimeout(()=>toast('У вас доступ только для просмотра: изменения не сохраняются'),600);
  liveSub();TEAM.at=0;setTimeout(processJoin,300);
  if(offerGuest){
    showDialog({title:'Перенести проект из демо-режима?',text:'В этом браузере есть проект «'+String(offerGuest.name||'без названия')+'», созданный без аккаунта. Перенести его в ваш аккаунт?',
      actions:[{label:'Перенести',run:()=>applyImport(offerGuest)},{label:'Нет, начать с нуля',sec:true}]});
  }
}
async function doLogout(){
  if(!CLOUD){save();try{localStorage.removeItem(SESS_KEY)}catch(err){}showAuth();return}
  save();
  const key=dataKey();
  clearTimeout(cloudTimer);
  let synced=true;
  if(CLOUD.dirty&&!CLOUD.noPush)synced=await cloudPush();
  else if(CLOUD.dirty)synced=false;
  try{await SB.auth.signOut()}catch(e){}
  if(synced){try{localStorage.removeItem(key)}catch(e){}}
  else toast('Часть изменений не успела отправиться в облако — они остались в этом браузере.');
  try{localStorage.removeItem(SESS_KEY)}catch(err){}
  showAuth();
}
async function deleteAccount(){
  try{
    const s=(await SB.auth.getSession()).data.session;
    if(!s)throw new Error('no-session');
    const r=await fetch(CFG.SUPABASE_URL.replace(/\/+$/,'')+'/functions/v1/delete-account',{method:'POST',headers:{Authorization:'Bearer '+s.access_token,apikey:CFG.SUPABASE_KEY}});
    if(!r.ok)throw new Error('http '+r.status);
    clearTimeout(cloudTimer);
    try{localStorage.removeItem(dataKey())}catch(e){}
    if(CLOUD)CLOUD.dirty=false;
    try{await SB.auth.signOut({scope:'local'})}catch(e){}
    showAuth();toast('Аккаунт и все данные удалены');
  }catch(e){toast('Не удалось удалить аккаунт. Попробуйте позже или напишите нам.')}
}
function initCloud(){
  SB.auth.onAuthStateChange((ev,session)=>{
    setTimeout(()=>{
      if(ev==='PASSWORD_RECOVERY'){RECOVERY=true;authMode='recover';showAuth(true);return}
      if(ev==='SIGNED_IN'&&session&&!RECOVERY){if(!CLOUD||CLOUD.uid!==session.user.id)enterCloud(session)}
      else if(ev==='SIGNED_OUT'&&CLOUD){showAuth()}
    },0);
  });
}
async function onAuthSubmitLocal(e){
  e.preventDefault();
  const f=e.target,g=n=>f.elements.namedItem(n),email=g('email').value.trim().toLowerCase(),pw=g('password').value,msg=$('#authMsg');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){msg.textContent='Проверьте адрес почты: он должен выглядеть как name@example.com.';return}
  const users=getUsers();
  try{
    if(authMode==='register'){
      if(pw.length<6){msg.textContent='Пароль слишком короткий: нужно не меньше 6 символов.';return}
      if(users[email]){msg.textContent='Такой аккаунт уже есть. Перейдите на вкладку «Вход».';return}
      const salt=uid()+uid();
      users[email]={salt:salt,hash:await hashPw(pw,salt),name:((g('name')||{value:''}).value.trim())||email.split('@')[0],created:Date.now()};
      setUsers(users);enter(email);toast('Локальный аккаунт создан. Данные остаются в этом браузере.');
    }else{
      const u=users[email];
      if(u&&String(u.hash).charAt(0)==='f'){msg.textContent='Этот аккаунт создан в упрощённом режиме защиты, он больше не поддерживается. Создайте аккаунт заново или нажмите «Попробовать демо».';return}
      if(!u||u.hash!==await hashPw(pw,u.salt)){msg.textContent='Неверная почта или пароль. Проверьте данные и попробуйте снова.';return}
      enter(email);
    }
  }catch(err){
    msg.textContent=err&&err.message==='no-subtle'?'В этом браузере недоступно безопасное хранение пароля. Нажмите «Попробовать демо» — вход без аккаунта.':'Не удалось выполнить вход. Попробуйте ещё раз или нажмите «Попробовать демо».';
  }
}
function userName(){
  if(USER==='guest')return 'Гость';
  if(CLOUD)return CLOUD.name||(CLOUD.email||'').split('@')[0]||'Аккаунт';
  const u=getUsers()[USER];return (u&&u.name)||USER||'?';
}
function userSub(){return USER==='guest'?'данные только в этом браузере':(CLOUD?CLOUD.email:USER)}
function renderAcct(){
  const name=userName();
  {const db=$('#delAccBtn');if(db)db.hidden=!(CLOUD&&USER!=='guest')}
  $('#acct').innerHTML='<div class="av" aria-hidden="true">'+esc(name.charAt(0).toUpperCase())+'</div><div class="who"><b>'+esc(name)+'</b><span>'+esc(userSub())+'</span></div><button class="icon-btn" type="button" data-c="logout" aria-label="'+(USER==='guest'?'Войти или создать аккаунт':'Выйти')+'" title="'+(USER==='guest'?'Войти или создать аккаунт':'Выйти')+'">'+icon('logout')+'</button>';
}

