const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>{const n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:0};

/* ---------- значки ---------- */
const IC={
 home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
 script:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
 schedule:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 14h3M13 14h3M8 17.5h3"/>',
 budget:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5h.01M18 14.5h.01"/>',
 callsheet:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 12h6M9 16h4"/>',
  list:'<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
 upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
 download:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
 copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
 print:'<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/>',
 logout:'<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><path d="M16 8l4 4-4 4M20 12H9"/>',
 left:'<path d="M15 6l-6 6 6 6"/>',
 right:'<path d="M9 6l6 6-6 6"/>',
 stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 parse:'<path d="M4 7h16M4 12h10M4 17h7"/><path d="M17 14l3 3-3 3"/>',
 briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
 megaphone:'<path d="M3 11v3a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
 camera:'<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
 bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
 tag:'<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.4"/>',
 store:'<path d="M4 9l1-5h14l1 5"/><path d="M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 6 0 2.5 2.5 0 0 0 5 0"/><path d="M5 12v8h14v-8"/>',
 check:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>',
 frame:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 10h4M3 14h4M17 10h4M17 14h4"/>',
 calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
 note:'<path d="M5 4h14v12l-5 5H5z"/><path d="M14 21v-5h5"/>',
 ext:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
};
const icon=n=>'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[n]||'')+'</svg>';

/* ---------- логотип ---------- */
const LOGO='<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="flash" cx="24" cy="24" r="22"/><rect class="body" x="6" y="19" width="36" height="23" rx="4"/><path class="play" d="M20 25.5v10l9-5z"/><g class="arm"><rect class="armbg" x="6" y="9" width="36" height="9" rx="2.5"/><path class="stripe" d="M12 9h5l-5 9H7zM22 9h5l-5 9h-5zM32 9h5l-5 9h-5z"/></g></svg>';
function clap(btn){btn.classList.remove('clap');void btn.offsetWidth;btn.classList.add('clap');clearTimeout(btn._t);btn._t=setTimeout(()=>btn.classList.remove('clap'),900)}

/* ---------- настройки оформления (общие для всех проектов) ---------- */
const PREF_KEY='zp.prefs';
const PALETTES=['hustle'];
const PAL_DARK={hustle:'#1E3A8A',icy:'#03062F',petal:'#6E184E',aqua:'#2D198A'};
let PREF={palette:'hustle',mode:'dark',rail:false};
try{Object.assign(PREF,JSON.parse(localStorage.getItem(PREF_KEY))||{})}catch(e){}
if(PALETTES.indexOf(PREF.palette)<0)PREF.palette='hustle';
if(PREF.v!==5){PREF.v=5;PREF.palette='hustle';PREF.mode='dark'}
if(window.innerWidth<700)PREF.lt3d=false;
const savePref=()=>{try{localStorage.setItem(PREF_KEY,JSON.stringify(PREF))}catch(e){}};
function applyTheme(){
  const r=document.documentElement;r.dataset.palette=PREF.palette;
  if(PREF.mode==='light'||PREF.mode==='dark')r.dataset.theme=PREF.mode;else delete r.dataset.theme;
  const mb=$('#modeBtn');if(mb)mb.textContent='Тема: '+({auto:'как в системе',light:'светлая',dark:'тёмная'}[PREF.mode]);
  $$('.sw').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.k===PREF.palette)));
  $$('.palopt').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.k===PREF.palette)));
  {const mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute('content',PAL_DARK[PREF.palette]||'#1E3A8A')}
  const lb=$('#langBtn');if(lb)lb.textContent='Язык: '+(PREF.lang==='kk'?'Қазақша (частично)':'Русский');
  document.documentElement.lang='ru';
  {const ap=document.getElementById('app');if(ap)ap.classList.toggle('rail',!!PREF.rail);document.body.classList.toggle('railed',!!PREF.rail);const rb=document.getElementById('railBtn');if(rb){const tx=PREF.rail?'Развернуть панель':'Свернуть панель';rb.title=tx;rb.setAttribute('aria-label',tx)}}
}

