// Генератор вертикальной иллюстрации «подготовка → съёмка» (изометрия, контурная рисовка)
const fs=require('fs');
const W=800,H=+process.env.H||2160;
const OC='#2a2420';
const C=0.866,Sn=0.5,OX=400,OY=270;
const P=(x,y,z=0)=>[OX+(x-y)*C,OY+(x+y)*Sn-z];
const f1=n=>(Math.round(n*10)/10);
const pt=p=>f1(p[0])+','+f1(p[1]);
const OL=(w=1.6)=>`stroke="${OC}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const poly=(pts,fill,w=1.6,ex='')=>`<polygon points="${pts.map(pt).join(' ')}" fill="${fill}" ${w?OL(w):''} ${ex}/>`;
const pl=(pts,col=OC,w=1.6,ex='')=>`<polyline points="${pts.map(pt).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${ex}/>`;
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
function sh(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));return '#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}
// грани
const FR=(x,y,z,w,d,h)=>(u,v)=>P(x+w,y+u,z+v);
const FL=(x,y,z,w,d,h)=>(u,v)=>P(x+u,y+d,z+v);
const FT=(x,y,z,w,d,h)=>(u,v)=>P(x+u,y+v,z+h);
const quad=(m,u0,v0,u1,v1,fill,w=1.2,ex='')=>poly([m(u0,v0),m(u1,v0),m(u1,v1),m(u0,v1)],fill,w,ex);
const ln=(m,u0,v0,u1,v1,col=OC,w=1.2,ex='')=>pl([m(u0,v0),m(u1,v1)],col,w,ex);
function box(x,y,z,w,d,h,c,o={}){
  const top=o.top||sh(c,.18),lf=o.left||c,rt=o.right||sh(c,-.16),lw=o.lw||1.6;
  let s='';
  s+=poly([P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)],rt,lw);
  s+=poly([P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)],lf,lw);
  s+=poly([P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],top,lw);
  return s;
}
const shadow=(x,y,w,d,op=.16)=>poly([P(x,y),P(x+w,y),P(x+w,y+d),P(x,y+d)],`rgba(30,25,20,${op})`,0);
const eshadow=(X,Y,rx,op=.18)=>`<ellipse cx="${f1(X)}" cy="${f1(Y)}" rx="${rx}" ry="${f1(rx*.45)}" fill="rgba(30,25,20,${op})"/>`;
function cyl(X,Y,r,h,c,top){return `<path d="M${f1(X-r)},${f1(Y-h)} L${f1(X-r)},${f1(Y)} A${r},${f1(r*.5)} 0 0 0 ${f1(X+r)},${f1(Y)} L${f1(X+r)},${f1(Y-h)}" fill="${c}" ${OL(1.3)}/><ellipse cx="${f1(X)}" cy="${f1(Y-h)}" rx="${r}" ry="${f1(r*.5)}" fill="${top||sh(c,.2)}" ${OL(1.3)}/>`}

// ---------- люди ----------
const SK=['#F2C9A6','#E3AE85','#C68A62','#8E5B3E','#F5D2B8','#B97B55','#6E432C'];
function arm(sx,sy,a,col,skin,lw){
  const [ex,ey,hx,hy]=a;const E=[sx+ex,sy+ey],Hd=[sx+hx,sy+hy];
  const d=`M${f1(sx)},${f1(sy)} L${f1(E[0])},${f1(E[1])} L${f1(Hd[0])},${f1(Hd[1])}`;
  return `<path d="${d}" fill="none" stroke="${OC}" stroke-width="${lw+3}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${lw}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${f1(Hd[0])}" cy="${f1(Hd[1])}" r="3.6" fill="${skin}" ${OL(1.3)}/>`;
}
const POSE={
  down:[-3,19,-2,37], downR:[3,19,2,37],
  hip:[-9,14,-3,30],
  phone:[9,15,-3,-13],
  point:[12,8,27,14],
  pointUp:[10,-8,20,-24],
  chest:[4,20,-9,24], chestR:[-4,20,9,24],
  carry:[-2,20,-1,38],
  type:[3,22,-4,30],
  up:[4,-14,6,-32],
  boom:[6,-16,4,-34],
  cam:[4,18,-2,26],
  slate:[8,10,16,-6],
  hold:[6,18,4,30],
};
function hairFront(st,hc){
  switch(st){
    case 'short':return `<path d="M-11,-103 Q-12.5,-117 0,-117.5 Q12,-117 11.2,-103 Q9,-110 1,-111 Q-6,-111 -11,-103Z" fill="${hc}" ${OL(1.3)}/>`;
    case 'side':return `<path d="M-11.2,-101 Q-13,-118 1,-118 Q13,-117 11.5,-102 Q10,-108 6,-111 Q-2,-109 -8,-112 Q-10,-108 -11.2,-101Z" fill="${hc}" ${OL(1.3)}/>`;
    case 'long':return `<path d="M-11,-100 Q-13,-117 0,-118 Q13,-117 11,-100 Q8,-111 0,-110 Q-6,-109 -11,-100Z" fill="${hc}" ${OL(1.3)}/>`;
    case 'bun':return `<circle cx="1" cy="-120" r="5.5" fill="${hc}" ${OL(1.3)}/><path d="M-11,-102 Q-12,-117 0,-117 Q12,-117 11,-102 Q8,-111 0,-111 Q-7,-111 -11,-102Z" fill="${hc}" ${OL(1.3)}/>`;
    case 'curly':return `<path d="M-12,-101 Q-16,-108 -11,-113 Q-10,-120 -3,-119 Q1,-123 6,-119 Q13,-119 12,-112 Q16,-107 12,-101 Q10,-108 4,-110 Q-3,-108 -8,-110 Q-11,-106 -12,-101Z" fill="${hc}" ${OL(1.3)}/>`;
    case 'bald':return `<path d="M-10.6,-98 Q-11.5,-104 -10,-107 L-8.5,-100Z M10.6,-98 Q11.5,-104 10,-107 L8.5,-100Z" fill="${hc}" ${OL(1.1)}/>`;
    case 'buzz':return `<path d="M-10.5,-104 Q-11,-115 0,-115.5 Q11,-115 10.5,-104 Q6,-109 0,-109 Q-6,-109 -10.5,-104Z" fill="${hc}" ${OL(1.2)}/>`;
    default:return '';
  }
}
function hairBack(st,hc){ // за головой (вид спереди)
  if(st==='long')return `<path d="M-12,-104 Q-14,-90 -13,-80 L13,-80 Q14,-90 12,-104Z" fill="${hc}" ${OL(1.3)}/>`;
  if(st==='pony')return `<path d="M8,-108 Q20,-104 16,-88 Q13,-96 9,-101Z" fill="${hc}" ${OL(1.3)}/>`;
  return '';
}
function person(o){
  const sk=o.skin||SK[0],hc=o.hair||'#3b2a20',top=o.top||'#e9e5dc',bot=o.bot||'#3b3f4a',shoe=o.shoe||'#2b2622';
  const back=o.v==='back',seat=o.seat,dy=seat?24:0,s=o.s||1,dir=o.dir||1;
  const lw=7.2;
  let g='';
  // ноги
  if(!o.noLegs){
    if(seat){
      if(back){g+=`<path d="M-13,-31 L-12,-4 L-2,-4 L0,-28 L2,-4 L12,-4 L13,-31Z" fill="${bot}" ${OL(1.5)}/>`}
      else{
        g+=`<path d="M-12,-34 L-13,-20 L-3,-20 L0,-30 L3,-20 L13,-20 L12,-34Z" fill="${bot}" ${OL(1.5)}/>`;
        g+=`<path d="M-12,-21 L-11,-5 L-4,-5 L-4,-21Z M4,-21 L4,-5 L11,-5 L12,-21Z" fill="${bot}" ${OL(1.5)}/>`;
      }
      g+=`<path d="M-13,-5 Q-13,0 -7,0 L-2,0 Q-1,-3 -3,-5Z M3,-5 Q1,-2 2,0 L8,0 Q13,0 13,-5Z" fill="${shoe}" ${OL(1.3)}/>`;
    }else if(o.skirt){
      g+=`<path d="M-9,-26 L-8,-4 L-3,-4 L-3,-26Z M3,-26 L3,-4 L8,-4 L9,-26Z" fill="${sk}" ${OL(1.4)}/>`;
      g+=`<path d="M-13,-55 L-17,-24 L17,-24 L13,-55Z" fill="${bot}" ${OL(1.5)}/>`;
      g+=`<path d="M-10,-5 Q-11,0 -5,0 L-1,0 Q-1,-3 -3,-5Z M3,-5 Q1,-2 2,0 L6,0 Q11,0 10,-5Z" fill="${shoe}" ${OL(1.3)}/>`;
    }else{
      const st=o.walk?`M-13,-55 L-15,-5 L-6,-4 L0,-44 L5,-4 L14,-6 L13,-55Z`:`M-13,-55 L-12,-5 L-2,-5 L0,-44 L2,-5 L12,-5 L13,-55Z`;
      g+=`<path d="${st}" fill="${bot}" ${OL(1.5)}/>`;
      g+=o.walk?`<path d="M-16,-6 Q-17,0 -10,0 L-5,0 Q-4,-4 -6,-6Z M5,-6 Q4,-2 6,-1 L12,-1 Q17,-2 15,-7Z" fill="${shoe}" ${OL(1.3)}/>`:`<path d="M-13,-6 Q-14,0 -7,0 L-2,0 Q-1,-3 -2,-6Z M2,-6 Q1,-3 2,0 L7,0 Q14,0 13,-6Z" fill="${shoe}" ${OL(1.3)}/>`;
    }
  }
  let u=`<g transform="translate(0 ${dy})">`;
  const L=[-14.5,-84],R=[14.5,-84];
  const al=o.al||'down',ar=o.ar||'downR';
  const A=(side,p)=>{let a=POSE[p]||p;if(side==='L')a=[-a[0],a[1],-a[2],a[3]];return a};
  const slc=o.sleeve||top;
  // дальняя рука (у вида сзади руки симметричны)
  const backArm=dir>0?'L':'R';
  const armSvg=side=>arm((side==='L'?L:R)[0],(side==='L'?L:R)[1],A(side,side==='L'?al:ar),slc,sk,lw);
  if(!back)u+=hairBack(o.hs,hc);
  if(o.armsBehind!==false)u+=armSvg(back?(dir>0?'R':'L'):backArm);
  // шея и торс
  u+=`<rect x="-4" y="-93" width="8" height="9" fill="${sk}" ${OL(1.2)}/>`;
  const torso=o.dress?`M-14.5,-87 Q-16,-70 -13,-55 L-17,-26 L17,-26 L13,-55 Q16,-70 14.5,-87 Q0,-91 -14.5,-87Z`:`M-14.5,-87 Q-16.5,-70 -13.5,-52 L13.5,-52 Q16.5,-70 14.5,-87 Q0,-91 -14.5,-87Z`;
  u+=`<path d="${torso}" fill="${top}" ${OL(1.5)}/>`;
  if(!back){
    if(o.jacket){u+=`<path d="M-14.5,-87 Q-16.5,-70 -13.5,-52 L-3,-52 L-4,-70 L-6,-87Z M14.5,-87 Q16.5,-70 13.5,-52 L3,-52 L4,-70 L6,-87Z" fill="${o.jacket}" ${OL(1.4)}/>`}
    if(o.tie)u+=`<path d="M-1.6,-86 L1.6,-86 L2.5,-62 L0,-58 L-2.5,-62Z" fill="${o.tie}" ${OL(1.1)}/>`;
    if(o.collar!==false&&!o.hood)u+=`<path d="M-5,-88 L0,-83 L5,-88" fill="none" ${OL(1.2)}/>`;
    if(o.hood)u+=`<path d="M-8,-89 Q0,-80 8,-89" fill="none" ${OL(1.3)}/><path d="M-2,-82 L-2,-72 M2,-82 L2,-72" ${OL(1)}/>`;
    if(o.print)u+=o.print;
    if(o.lanyard)u+=`<path d="M-5,-88 L-1,-70 L5,-88" fill="none" stroke="${o.lanyard}" stroke-width="1.6"/><rect x="-4" y="-71" width="6" height="8" rx="1" fill="#fff" ${OL(1)}/>`;
  }else{
    if(o.jacket)u+=`<path d="${torso}" fill="${o.jacket}" ${OL(1.5)}/>`;
    if(o.hood)u+=`<path d="M-9,-90 Q0,-82 9,-90 L8,-80 Q0,-76 -8,-80Z" fill="${sh(top,-.1)}" ${OL(1.2)}/>`;
    if(o.printBack)u+=o.printBack;
  }
  if(o.belt!==false&&!o.dress)u+=`<path d="M-13.5,-55 L13.5,-55" stroke="${sh(bot,-.35)}" stroke-width="2.4"/>`;
  // голова
  const hx=back?0:1.5;
  if(back){
    u+=`<ellipse cx="-10.5" cy="-101" rx="2.4" ry="3.6" fill="${sk}" ${OL(1.1)}/><ellipse cx="10.5" cy="-101" rx="2.4" ry="3.6" fill="${sk}" ${OL(1.1)}/>`;
    const bald=o.hs==='bald';
    u+=`<ellipse cx="0" cy="-103" rx="10.6" ry="12.2" fill="${bald?sk:hc}" ${OL(1.4)}/>`;
    if(bald)u+=`<path d="M-10.4,-99 Q0,-93 10.4,-99 L10,-96 Q0,-90 -10,-96Z" fill="${hc}" ${OL(1)}/>`;
    if(o.hs==='long')u+=`<path d="M-11,-104 Q-13,-90 -12,-80 L12,-80 Q13,-90 11,-104Z" fill="${hc}" ${OL(1.3)}/>`;
    if(o.hs==='bun')u+=`<circle cx="0" cy="-117" r="5.5" fill="${hc}" ${OL(1.3)}/>`;
    if(o.hs==='pony')u+=`<path d="M-3,-96 Q0,-82 4,-84 Q3,-90 3,-96Z" fill="${hc}" ${OL(1.2)}/>`;
    if(o.cap)u+=`<path d="M-11,-104 Q-11,-117 0,-117 Q11,-117 11,-104Z" fill="${o.cap}" ${OL(1.3)}/>`;
  }else{
    u+=`<ellipse cx="${-9.6+hx}" cy="-101" rx="2.4" ry="3.6" fill="${sk}" ${OL(1.1)}/>`;
    u+=`<ellipse cx="${hx*.4}" cy="-103" rx="10.6" ry="12.2" fill="${sk}" ${OL(1.4)}/>`;
    if(o.blush)u+=`<circle cx="${-4.5+hx}" cy="-97.5" r="1.8" fill="#e98f84" opacity=".45"/><circle cx="${6.5+hx}" cy="-97.5" r="1.8" fill="#e98f84" opacity=".45"/>`;
    const ey=-103;
    u+=`<circle cx="${-3.2+hx}" cy="${ey}" r="1.25" fill="${OC}"/><circle cx="${4.2+hx}" cy="${ey}" r="1.25" fill="${OC}"/>`;
    u+=`<path d="M${-5.2+hx},${ey-3.6} L${-1.6+hx},${ey-4.2} M${2.4+hx},${ey-4.2} L${6+hx},${ey-3.6}" ${OL(1.1)}/>`;
    u+=`<path d="M${1+hx},${ey+1.5} L${-.3+hx},${ey+5.6} L${1.8+hx},${ey+5.8}" fill="none" ${OL(1)}/>`;
    u+=o.mouth==='o'?`<ellipse cx="${1+hx}" cy="-94.5" rx="1.6" ry="2" fill="${OC}"/>`:o.mouth==='smile'?`<path d="M${-2.4+hx},-95.2 Q${.8+hx},-92 ${4+hx},-95.2" fill="none" ${OL(1.1)}/>`:`<path d="M${-2+hx},-94.6 Q${.8+hx},-93.6 ${3.6+hx},-94.8" fill="none" ${OL(1.1)}/>`;
    if(o.beard)u+=`<path d="M${-9.5+hx*.4},-101 Q${-9+hx},-89 ${hx*.4},-89.5 Q${9+hx},-89 ${10+hx*.4},-101 Q${6+hx},-94 ${hx},-95 Q${-6+hx},-94 ${-9.5+hx*.4},-101Z" fill="${hc}" ${OL(1.2)}/><path d="M${-2+hx},-94.4 Q${.8+hx},-93.4 ${3.6+hx},-94.6" fill="none" ${OL(1.1)}/>`;
    if(o.mous)u+=`<path d="M${-2.6+hx},-96.4 Q${.8+hx},-98 ${4.2+hx},-96.4 Q${.8+hx},-95.4 ${-2.6+hx},-96.4Z" fill="${hc}" ${OL(1)}/>`;
    if(o.glasses)u+=`<circle cx="${-3.2+hx}" cy="${ey}" r="3.4" fill="rgba(255,255,255,.25)" ${OL(1.2)}/><circle cx="${4.2+hx}" cy="${ey}" r="3.4" fill="rgba(255,255,255,.25)" ${OL(1.2)}/><path d="M${.2+hx},${ey} L${.8+hx},${ey}" ${OL(1.2)}/>`;
    u+=hairFront(o.hs,hc);
    if(o.cap)u+=`<path d="M-11,-105 Q-11,-118 0,-118 Q11,-118 11,-105Z" fill="${o.cap}" ${OL(1.3)}/><path d="M2,-106 Q12,-108 19,-104 L11,-104Z" fill="${sh(o.cap,-.15)}" ${OL(1.2)}/>`;
  }
  if(o.phones)u+=`<path d="M-12,-101 Q-12,-122 0,-122 Q12,-122 12,-101" fill="none" stroke="${OC}" stroke-width="4"/><path d="M-12,-101 Q-12,-122 0,-122 Q12,-122 12,-101" fill="none" stroke="#555" stroke-width="2"/><rect x="-15" y="-107" width="6" height="10" rx="2.5" fill="#333" ${OL(1.1)}/><rect x="9" y="-107" width="6" height="10" rx="2.5" fill="#333" ${OL(1.1)}/>`;
  // ближняя рука
  u+=armSvg(back?(dir>0?'L':'R'):(dir>0?'R':'L'));
  if(o.item)u+=o.item;
  u+='</g>';
  g+=u;
  const fx=dir<0?-1:1;
  return `<g transform="translate(${f1(o.X)} ${f1(o.Y)}) scale(${f1(fx*s*100)/100} ${s})">${o.under||''}${g}${o.over||''}</g>`;
}
// предметы в руках (локальные координаты рук: правая ближняя рука = R)
const IT={
  phone:`<rect x="10" y="-103" width="4" height="9" rx="1.2" fill="#222" ${OL(1)}/>`,
  cup:(x,y)=>`<path d="M${x-3},${y-10} L${x-2.4},${y} L${x+3.4},${y} L${x+4},${y-10}Z" fill="#fff" ${OL(1.1)}/><rect x="${x-3.2}" y="${y-7}" width="7.4" height="3" fill="#b5754a"/>`,
  clip:(x,y)=>`<rect x="${x-8}" y="${y-14}" width="15" height="19" rx="1.5" fill="#a0784f" ${OL(1.2)}/><rect x="${x-6}" y="${y-11}" width="11" height="14" fill="#fff" ${OL(.8)}/><path d="M${x-4},${y-8}h7M${x-4},${y-5}h7M${x-4},${y-2}h5" stroke="#9aa" stroke-width=".8"/>`,
  script:(x,y)=>`<rect x="${x-7}" y="${y-12}" width="14" height="17" fill="#fffef6" ${OL(1.2)}/><path d="M${x-4},${y-8}h8M${x-4},${y-5}h8M${x-4},${y-2}h6M${x-4},${y+1}h7" stroke="#aab" stroke-width=".8"/>`,
  slate:(x,y,cls='')=>`<g transform="translate(${x} ${y})"><rect x="-16" y="-14" width="32" height="22" rx="1.5" fill="#262626" ${OL(1.2)}/><path d="M-12,-6h24M-12,0h24M0,-6v12" stroke="#ddd" stroke-width=".9"/><g class="slatestick ${cls}"><rect x="-16" y="-20" width="32" height="6" fill="#fff" ${OL(1.1)}/><path d="M-12,-20l4,6h5l-4,-6zM-1,-20l4,6h5l-4,-6zM10,-20l4,6h2v-1l-3,-5z" fill="#222"/></g></g>`,
  tablet:(x,y)=>`<rect x="${x-10}" y="${y-8}" width="20" height="14" rx="2" fill="#333" ${OL(1.2)}/><rect x="${x-8}" y="${y-6}" width="16" height="10" fill="#cfe0ef"/><path d="M${x-6},${y+1} q4,-6 8,-1 t5,-2" fill="none" stroke="#444" stroke-width=".8"/>`,
  meter:(x,y)=>`<rect x="${x-3}" y="${y-11}" width="7" height="12" rx="2" fill="#333" ${OL(1.1)}/><circle cx="${x+.5}" cy="${y-12}" r="3" fill="#fff" ${OL(1)}/>`,
  case:(x,y)=>`<rect x="${x-14}" y="${y+2}" width="28" height="20" rx="2" fill="#2e2e30" ${OL(1.3)}/><path d="M${x-14},${y+6}h28M${x-14},${y+18}h28" stroke="#9a9ea6" stroke-width="1.4"/><path d="M${x-4},${y+2} v-3 h8 v3" fill="none" ${OL(1.3)}/>`,
};

// ---------- сцена ----------
const items=[];// {k,svg}
const add=(k,svg)=>items.push({k,svg});
const floorItems=[];
const decal=svg=>floorItems.push(svg);
let defs='';

// пол офиса — ковролин
let bg=`<rect width="${W}" height="${H}" fill="#a9a59c"/>`;
for(let i=0;i<900;i++){const x=rnd()*W,y=rnd()*1350;bg+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.6+rnd()*1.1)}" fill="${rnd()<.5?'#9a968d':'#b8b4ab'}"/>`}
// студия — бетонный пол
const X0=790,Y0=790;
let studio=poly([P(X0,Y0),P(X0+2600,Y0),P(X0+2600,Y0+2600),P(X0,Y0+2600)],'#5b5a5e',0);
for(let i=0;i<60;i++){const x=X0+rnd()*1800,y=Y0+rnd()*1800;const p=P(x,y);studio+=`<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="${f1(20+rnd()*60)}" ry="${f1(8+rnd()*20)}" fill="${rnd()<.5?'#636267':'#545357'}" opacity=".7"/>`}
for(let i=0;i<500;i++){const x=X0+rnd()*1900,y=Y0+rnd()*1900;const p=P(x,y);if(p[1]>H)continue;studio+=`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(.5+rnd())}" fill="#6c6b70"/>`}

// стены офиса
const WH=720;
let walls='';
walls+=poly([P(0,0,0),P(0,700,0),P(0,700,WH),P(0,0,WH)],'#e3d6b4',1.8);
walls+=poly([P(0,0,0),P(700,0,0),P(700,0,WH),P(0,0,WH)],'#d5c7a3',1.8);
// плинтус
const LW=(u,v)=>P(0,u,v),RW=(u,v)=>P(u,0,v);
walls+=quad(LW,0,0,700,7,'#bfae86',1.2)+quad(RW,0,0,700,7,'#b2a07a',1.2);
// окно с жалюзи (левая стена)
walls+=quad(LW,30,110,150,290,'#f4f1ea',1.6)+quad(LW,38,118,142,282,'#bcd5e3',1.2);
for(let v=124;v<280;v+=7)walls+=ln(LW,38,v,142,v,'#e9eef0',2.4)+ln(LW,38,v+2.2,142,v+2.2,'#9eb3bf',.6);
walls+=ln(LW,90,282,90,300,OC,1)+`<circle cx="${pt(LW(90,302)).split(',')[0]}" cy="${pt(LW(90,302)).split(',')[1]}" r="2" fill="#ddd" ${OL(1)}/>`;
// часы
{const c=LW(175,300);walls+=`<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="15" ry="17" transform="skewY(30) translate(0 0)" fill="none"/>`;
 let pts=[];for(let a=0;a<6.3;a+=.35)pts.push(LW(175+14*Math.cos(a),300+14*Math.sin(a)));walls+=poly(pts,'#fff',1.5);walls+=pl([LW(175,300),LW(175,311)],OC,1.4)+pl([LW(175,300),LW(183,300)],OC,1.4)}
// пробковая доска с раскадровкой
walls+=quad(LW,190,110,420,250,'#8a6a45',1.6)+quad(LW,196,116,414,244,'#c99d6b',1);
{let k=0;for(let r=0;r<3;r++)for(let c=0;c<5;c++){const u=204+c*42,v=124+r*40;walls+=quad(LW,u,v,u+36,v+30,'#fbfaf5',1);
  // наброски в кадрах
  const s=[[[6,8],[14,22],[22,10]],[[4,6],[32,6],[18,24]],[[8,20],[18,8],[30,18]]][k%3];walls+=pl(s.map(q=>LW(u+q[0],v+q[1])),'#555',.9);
  walls+=`<circle cx="${f1(LW(u+18,v+29)[0])}" cy="${f1(LW(u+18,v+29)[1])}" r="1.6" fill="${['#d33','#2a6fd6','#2c9a4b','#e0a400'][k%4]}"/>`;k++}}
// маркерная доска со схемой света (правая стена)
walls+=quad(RW,30,120,230,255,'#cfd3d6',1.6)+quad(RW,36,126,224,249,'#fbfcfd',1);
walls+=pl([RW(60,150),RW(100,180),RW(60,210)],'#2a6fd6',1.3)+pl([RW(60,150),RW(60,210)],'#2a6fd6',1.3);
{const cc=(u,v,r,col)=>{let p=[];for(let a=0;a<6.3;a+=.5)p.push(RW(u+r*Math.cos(a),v+r*Math.sin(a)));return poly(p,'none',0)+pl(p.concat([p[0]]),col,1.3)};
 walls+=cc(118,182,9,'#d33')+cc(190,215,8,'#2c9a4b')+cc(185,150,7,'#2c9a4b')+pl([RW(178,155),RW(130,178)],'#2c9a4b',1.1,'stroke-dasharray="3 3"')+pl([RW(182,210),RW(130,186)],'#2c9a4b',1.1,'stroke-dasharray="3 3"');}
walls+=quad(RW,40,124,58,128,'#333',.8);
// стрипборд (план съёмок)
walls+=quad(RW,255,110,420,265,'#3a3633',1.6);
{const cols=['#f4f1e6','#f2d24b','#7fb4e6','#8fd19e','#f4f1e6','#e6a0c4','#f2d24b','#f4f1e6','#7fb4e6','#3a3633','#f4f1e6','#8fd19e','#f2d24b','#f4f1e6','#e6a0c4','#7fb4e6','#f4f1e6','#8fd19e','#f2d24b','#f4f1e6'];
 cols.forEach((c,i)=>{const u=262+i*7.7;walls+=quad(RW,u,118,u+6.2,257,c,.6)})}
// постер
walls+=quad(RW,440,130,520,250,'#2e3b55',1.5)+quad(RW,446,136,514,244,'#e4b04a',.8);
walls+=pl([RW(460,170),RW(480,150),RW(500,170)],'#2e3b55',3)+`<circle cx="${f1(RW(480,205)[0])}" cy="${f1(RW(480,205)[1])}" r="10" fill="#2e3b55"/>`;

// ---------- мебель офиса ----------
function desk(x,y,w,d,h=48,c='#d9a86c'){
  let s=shadow(x+4,y+4,w,d,.18);
  s+=box(x,y,0,w,d,h,c,{top:'#e8c08a',left:'#cf9a5c',right:'#b98549'});
  // ящики на лицевой грани
  const m=FL(x,y,0,w,d,h);s+=quad(m,w-44,6,w-6,h-8,'#d6a467',1.1)+ln(m,w-44,(h)/2,w-6,h/2,OC,1)+ln(m,w-30,h*.75,w-20,h*.75,OC,1.6)+ln(m,w-30,h*.3,w-20,h*.3,OC,1.6);
  return s;
}
function monitor(x,y,z,face='L',screen='sheet'){
  let s='';
  if(face==='L'){
    s+=box(x+18,y+4,z,6,6,10,'#cfcbc0');s+=box(x,y,z+10,42,6,30,'#d8d4c8');
    const m=FL(x,y,z+10,42,6,30);s+=quad(m,3,3,39,27,'#2f4d78',1);s+=scr(m,screen);
  }else{
    s+=box(x+4,y+18,z,6,6,10,'#cfcbc0');s+=box(x,y,z+10,6,42,30,'#d8d4c8');
    const m=FR(x,y,z+10,6,42,30);s+=quad(m,3,3,39,27,'#2f4d78',1);s+=scr(m,screen);
  }
  return s;
}
function scr(m,t){
  let s='';
  if(t==='sheet'){s+=quad(m,5,5,37,25,'#eef3f6',.6);for(let v=8;v<25;v+=3.4)s+=ln(m,5,v,37,v,'#9fb7c8',.5);for(let u=12;u<37;u+=8)s+=ln(m,u,5,u,25,'#9fb7c8',.5);s+=quad(m,5,21.6,37,25,'#7fc28a',.3)}
  else if(t==='story'){for(let i=0;i<3;i++){s+=quad(m,5+i*11,13,14+i*11,22,'#f6f3ea',.5);s+=ln(m,7+i*11,15,12+i*11,20,'#666',.6)}s+=quad(m,5,5,37,10,'#4a6a98',.3)}
  else if(t==='light'){s+=quad(m,5,5,37,25,'#141a2c',.4);s+=poly([m(10,20),m(26,9),m(30,13)],'rgba(255,220,120,.7)',0);s+=quad(m,9,19,13,22,'#ffd25a',.3);s+=quad(m,24,8,30,14,'#ddd',.3)}
  else if(t==='shot'){s+=quad(m,4,4,38,26,'#3a2a22',.4);s+=poly([m(4,4),m(16,4),m(10,26),m(4,26)],'rgba(255,200,120,.35)',0);s+=quad(m,18,8,23,20,'#e9e1d4',.3);s+=quad(m,27,10,31,20,'#c85b4a',.3)}
  return s;
}
function chair(x,y,c='#3b3b3e',backSide='far'){
  let s=eshadow(...P(x+14,y+14),16,.18);
  // крестовина
  const b=P(x+14,y+14,0);s+=pl([[b[0]-12,b[1]],[b[0]+12,b[1]]],OC,2.4)+pl([[b[0],b[1]-5],[b[0],b[1]+5]],OC,2.4);
  s+=box(x+12,y+12,2,4,4,16,'#555');
  s+=box(x,y,18,28,28,6,c);
  if(backSide==='near')s+=box(x,y+24,20,28,5,30,c);
  if(backSide==='far')s+=box(x,y-1,20,28,5,30,c);
  if(backSide==='nearX')s+=box(x+24,y,20,5,28,30,c);
  return s;
}
function plant(x,y,big){
  const p=P(x,y);let s=eshadow(p[0],p[1]+2,big?18:11,.2);
  s+=cyl(p[0],p[1],big?14:9,big?22:14,'#c8613f','#a24e33');
  const lv=big?18:9,hh=big?22:14;
  for(let i=0;i<lv;i++){const a=-Math.PI/2+(rnd()-.5)*2.6,l=(big?40:20)*(.5+rnd()*.6);const x1=p[0]+Math.cos(a)*l*.6,y1=p[1]-hh-6+Math.sin(a)*l;const col=['#4f8a3c','#5e9e4c','#3f7631','#6cae55'][i%4];
    s+=`<path d="M${f1(p[0])},${f1(p[1]-hh)} Q${f1((p[0]+x1)/2+(rnd()-.5)*10)},${f1((p[1]-hh+y1)/2)} ${f1(x1)},${f1(y1)} Q${f1(x1+6)},${f1(y1+6)} ${f1(p[0]+2)},${f1(p[1]-hh)}Z" fill="${col}" ${OL(1.1)}/>`}
  return s;
}
function papers(x,y,z,n=3,c='#fbfaf4'){let s='';for(let i=0;i<n;i++){const ox=(rnd()-.5)*10,oy=(rnd()-.5)*10;s+=box(x+ox,y+oy,z+i*.8,18,13,.8,c,{top:c,lw:1})}return s}
function mug(x,y,z,c='#fff'){const p=P(x,y,z);return cyl(p[0],p[1],3.4,7,c,'#6b3e22')}

// ===== ОФИС =====
// стол продюсера (слева у окна): сидит спиной к нам
add(560,desk(110,250,150,62));
add(565,monitor(140,256,48,'L','sheet')+box(200,262,48,40,14,2,'#e9e6dc')+papers(225,282,48,3)+mug(130,296,48,'#d84b3a'));
add(566,box(150,286,48,40,12,2.5,'#e7e3d8')+poly([P(150,286,51),P(190,286,51),P(190,298,51),P(150,298,51)],'none',.6));
add(590,chair(170,342,'#353538','near')+'');
add(600,person({X:P(186,358)[0],Y:P(186,358)[1],v:'back',seat:1,dir:1,skin:SK[1],hair:'#2a1d16',hs:'short',top:'#4b6a8f',bot:'#2e3340',ar:'phone',al:'type',item:''}));
add(601,box(170,370,20,28,5,22,'#353538'));
// столик художника-раскадровщика (справа у стены) — лицом к нам
add(380,chair(352,92,'#3b3b3e','far'));
add(390,person({X:P(366,112)[0],Y:P(366,112)[1],seat:1,dir:1,skin:SK[4],hair:'#c26a3a',hs:'bun',top:'#e3d3ee',bot:'#3d3b4a',al:'type',ar:[4,18,-6,28],glasses:1,blush:1}));
add(420,desk(300,140,150,58)+monitor(400,146,48,'L','story')+box(326,160,48,40,28,2,'#2d2d30')+poly([P(330,163,50.5),P(362,163,50.5),P(362,185,50.5),P(330,185,50.5)],'#d9e6ef',.6)+papers(312,178,48,2)+mug(440,186,48,'#3c8d5a'));
{const lb=P(306,150,48);add(425,`<path d="M${f1(lb[0])},${f1(lb[1])} l2,-26 l14,-8" fill="none" stroke="${OC}" stroke-width="3.4"/><path d="M${f1(lb[0])},${f1(lb[1])} l2,-26 l14,-8" fill="none" stroke="#888" stroke-width="1.6"/><path d="M${f1(lb[0]+14)},${f1(lb[1]-38)} l10,4 l-4,8 l-10,-4z" fill="#2c7a5a" ${OL(1.2)}/>`)}
// кулер
{const p=P(110,470);add(580,eshadow(p[0],p[1],14)+box(98,460,0,24,24,58,'#f1efe9')+cyl(p[0],p[1]-58-6,9,18,'rgba(140,190,230,.85)','rgba(170,210,240,.9)'))}
add(540,plant(60,400,1));add(470,plant(400,40,1));add(520,plant(470,60,0));
// большой стол для встречи
const TX=330,TY=330;
add(735,person({X:P(410,300)[0],Y:P(410,300)[1],dir:-1,skin:SK[3],hair:'#1c1410',hs:'buzz',beard:1,top:'#2f2f33',bot:'#2b2d33',jacket:'#55402e',al:'hip',ar:'point',mouth:'o'}));
add(745,person({X:P(352,322)[0],Y:P(352,322)[1],dir:1,skin:SK[0],hair:'#d9b56a',hs:'long',top:'#f0eee8',bot:'#5a6b86',al:'chest',ar:[6,18,4,26],item:IT.script(5,-62),blush:1}));
add(800,shadow(TX+6,TY+6,200,110,.2)+box(TX,TY,0,200,110,46,'#c99a63',{top:'#e3b47a',left:'#c08b52',right:'#a9773f'}));
add(805,papers(TX+30,TY+30,46,4)+papers(TX+140,TY+70,46,2)+box(TX+70,TY+40,46,34,26,1,'#fbfaf4')+
  (()=>{const m=FT(TX+70,TY+40,47,34,26,0);let s='';s+=pl([m(6,6),m(16,13),m(6,20)],'#2a6fd6',1)+pl([m(6,6),m(6,20)],'#2a6fd6',1);s+=`<circle cx="${f1(m(24,13)[0])}" cy="${f1(m(24,13)[1])}" r="2.4" fill="#d33"/>`;return s})()+
  box(TX+120,TY+20,46,26,30,6,'#e8e4da')+box(TX+120,TY+20,52,26,30,1.4,'#f8f6f0')+mug(TX+30,TY+90,46)+mug(TX+180,TY+30,46,'#e0b33c')+mug(TX+165,TY+95,46,'#4d7cc2'));
// ноутбук со светосхемой (экран к нам)
add(806,box(TX+90,TY+70,46,40,26,2,'#bfc3c9')+box(TX+90,TY+66,48,40,3,26,'#bfc3c9')+(()=>{const m=FL(TX+90,TY+66,48,40,3,26);return quad(m,3,3,37,23,'#141a2c',.8)+poly([m(8,6),m(28,18),m(14,20)],'rgba(255,214,110,.75)',0)+quad(m,6,4,10,8,'#ffd25a',.3)+quad(m,28,16,32,20,'#e0e0e0',.3)})());
add(860,person({X:P(560,380)[0],Y:P(560,380)[1],dir:-1,skin:SK[2],hair:'#2a1a12',hs:'curly',top:'#7a8a4a',bot:'#3f3a33',sleeve:'#7a8a4a',ar:[10,10,8,-6],al:'hip',item:IT.meter(8,-6),cap:'#3c4a63'}));
add(905,chair(380,460,'#353538','near'));
add(910,person({X:P(392,470)[0],Y:P(392,470)[1],v:'back',seat:1,dir:-1,skin:SK[0],hair:'#7a4b2a',hs:'long',top:'#c84f4f',bot:'#2b2e38',al:'type',ar:'type'}));
add(911,box(380,486,20,28,5,24,'#353538'));
add(935,person({X:P(500,470)[0],Y:P(500,470)[1],v:'back',dir:1,skin:SK[5],hair:'#151010',hs:'short',top:'#d8d2c4',jacket:'#3a4a6a',bot:'#2b2d33',al:'down',ar:'type'}));
// принтер с вызывными
add(820,box(560,200,0,60,50,40,'#cfcac0')+box(562,202,40,56,46,22,'#e7e3da')+box(575,240,46,30,16,2,'#fbfaf4')+box(574,246,52,32,12,1,'#fbfaf4')+
  (()=>{const m=FT(562,202,40,56,46,22);return quad(m,10,8,24,14,'#555',.6)+`<circle cx="${f1(m(44,10)[0])}" cy="${f1(m(44,10)[1])}" r="2" fill="#4caf50"/>`})());
add(870,person({X:P(612,290)[0],Y:P(612,290)[1],dir:-1,skin:SK[4],hair:'#2b2b2b',hs:'pony',top:'#9fc3e0',bot:'#2c3a52',al:'chest',ar:[8,14,-4,14],item:IT.clip(-5,-60),lanyard:'#c33'}));
// стойка с костюмами
function rack(x,y,len){
  let s=shadow(x,y,len,16,.15);const a=P(x,y+8),b=P(x+len,y+8);
  s+=pl([a,[a[0],a[1]-110]],OC,3.6)+pl([a,[a[0],a[1]-110]],'#b9bcc2',1.8)+pl([b,[b[0],b[1]-110]],OC,3.6)+pl([b,[b[0],b[1]-110]],'#b9bcc2',1.8);
  s+=pl([[a[0],a[1]-108],[b[0],b[1]-108]],OC,3.6)+pl([[a[0],a[1]-108],[b[0],b[1]-108]],'#b9bcc2',1.8);
  const cl=['#8b3a3a','#2f4a6d','#e2c26a','#3b6b4a','#f0ede4','#5b3f6e','#c46a3c'];
  for(let i=0;i<7;i++){const t=(i+.6)/7.4,X=a[0]+(b[0]-a[0])*t,Y=a[1]+(b[1]-a[1])*t-108;const c=cl[i];
    s+=`<path d="M${f1(X)},${f1(Y)} l0,4 M${f1(X-10)},${f1(Y+12)} L${f1(X)},${f1(Y+4)} L${f1(X+10)},${f1(Y+12)}" fill="none" ${OL(1.1)}/><path d="M${f1(X-11)},${f1(Y+10)} L${f1(X+11)},${f1(Y+10)} L${f1(X+12)},${f1(Y+62)} L${f1(X-12)},${f1(Y+62)}Z" fill="${c}" ${OL(1.3)}/><path d="M${f1(X)},${f1(Y+11)} L${f1(X)},${f1(Y+40)}" stroke="${sh(c,-.3)}" stroke-width="1"/>`}
  return s;
}
add(990,rack(330,600,120));
add(1060,person({X:P(420,650)[0],Y:P(420,650)[1],dir:1,skin:SK[6],hair:'#121010',hs:'long',top:'#e6b33c',bot:'#3b2f2a',skirt:1,shoe:'#7a2f2f',al:[-6,10,-16,-2],ar:[8,8,18,-8],blush:1,mouth:'smile',
  over:`<path d="M10,-118 l0,6 M2,-106 L10,-112 L18,-106" fill="none" ${OL(1.1)}/><path d="M1,-108 L19,-108 L21,-62 L-1,-62Z" fill="#3a4f7a" ${OL(1.3)}/><path d="M10,-107 L10,-80" stroke="#22324f" stroke-width="1"/>`}));
// актёр репетирует текст на скамейке
add(1240,box(600,860,0,110,30,22,'#7b5b3f',{top:'#94704f'})+shadow(600,860,110,30,.12));
add(1250,person({X:P(640,878)[0],Y:P(640,878)[1],seat:1,dir:1,skin:SK[1],hair:'#3a2a1f',hs:'side',top:'#f3f1ea',bot:'#4c5b78',al:[-2,18,8,14],ar:[2,16,-6,8],item:IT.script(-4,-66),mouth:'o'}));
add(1255,person({X:P(692,886)[0],Y:P(692,886)[1],seat:1,dir:-1,skin:SK[4],hair:'#e0c070',hs:'long',top:'#2f5c8a',bot:'#2a2b30',al:'chest',ar:[4,16,-6,14],item:IT.cup(-6,-60),blush:1,mouth:'smile'}));
// кофе-ассистент с подносом
add(1150,person({X:P(560,570)[0],Y:P(560,570)[1],dir:1,walk:1,skin:SK[3],hair:'#1a1311',hs:'buzz',top:'#5a6e3a',bot:'#2b2b2b',cap:'#c33f3f',al:[2,16,12,24],ar:[-2,16,-12,24],
  over:`<path d="M-16,-60 L16,-60 L18,-56 L-18,-56Z" fill="#7a5a3a" ${OL(1.2)}/>`+[-11,-3,5,12].map((x,i)=>IT.cup(x,-60)).join('')}));
// кейсы с техникой
function fcase(x,y,z,w,d,h){let s=box(x,y,z,w,d,h,'#2d2d30',{top:'#3c3c40',right:'#232326'});const m=FL(x,y,z,w,d,h);s+=ln(m,0,h*.66,w,h*.66,'#a7abb3',1.3);
  for(const [u,v] of [[0,0],[w,0],[0,h],[w,h]]){const q=m(u,v);s+=`<rect x="${f1(q[0]-2.5)}" y="${f1(q[1]-2.5)}" width="5" height="5" fill="#bfc3ca" ${OL(.8)}/>`}
  const t=m(w/2,h*.66);s+=`<rect x="${f1(t[0]-3)}" y="${f1(t[1]-2)}" width="6" height="5" fill="#d9b24a" ${OL(.8)}/>`;return s}
add(1180,fcase(700,420,0,60,40,34)+fcase(704,424,34,52,34,26)+fcase(770,430,0,40,50,46));
// открытый кейс с приборами — гаффер проверяет
add(1300,box(660,560,0,70,46,20,'#2d2d30',{top:'#3c3c40'})+poly([P(660,560,20),P(730,560,20),P(730,560,62),P(660,560,62)],'#2a2a2c',1.5)+(()=>{const m=FT(660,560,0,70,46,19);return quad(m,6,6,64,40,'#4c4c52',.8)+[[16,22],[38,22],[56,22]].map(([u,v])=>{const c=m(u,v);return `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="7" fill="#1d1d1f" ${OL(1)}/><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="4" fill="#d8dde3"/>`}).join('')})());
add(1320,person({X:P(690,640)[0],Y:P(690,640)[1],dir:-1,skin:SK[5],hair:'#2a2420',hs:'short',beard:1,top:'#3e3e44',bot:'#5a4a36',sleeve:'#3e3e44',hood:1,al:'hip',ar:[8,20,2,36],print:`<rect x="-6" y="-78" width="12" height="9" rx="2" fill="#d9b24a" opacity=".8"/>`,
  under:`<path d="M-14,-46 l-4,22 h6 z" fill="#8b6a3a" ${OL(1)}/>`}));
// тележка со стойками к двери
function cart(x,y){let s=shadow(x,y,90,44,.18);s+=box(x,y,10,90,44,6,'#7d8186');for(const [a,b] of [[x+6,y+6],[x+84,y+6],[x+6,y+38],[x+84,y+38]]){const p=P(a,b);s+=`<circle cx="${f1(p[0])}" cy="${f1(p[1]-4)}" r="4" fill="#222" ${OL(1)}/>`}
  for(let i=0;i<5;i++){const a=P(x+10+i*16,y+22,16),b=P(x+10+i*16,y+22,110);s+=pl([a,b],OC,4.2)+pl([a,b],'#c7cad0',2.2)}
  // мешки с песком
  s+=`<path d="M${f1(P(x+60,y+10,16)[0])},${f1(P(x+60,y+10,16)[1])} q14,-12 28,0 q-14,10 -28,0z" fill="#b24a3a" ${OL(1.2)}/>`;
  return s}
add(1700,cart(960,640));
add(1720,person({X:P(1060,690)[0],Y:P(1060,690)[1],v:'back',dir:1,walk:1,skin:SK[2],hair:'#1a1311',hs:'buzz',top:'#2b2b2e',bot:'#3c4552',al:[-4,16,-14,24],ar:[4,16,-6,24],cap:'#2b2b2e'}));
// человек с кейсом проходит в дверь
add(1850,person({X:P(1040,800)[0],Y:P(1040,800)[1],dir:1,walk:1,skin:SK[0],hair:'#8a5a32',hs:'short',top:'#c9ccd2',bot:'#2b2d33',jacket:'#2e3036',al:'down',ar:'carry',item:IT.case(3,-48)}));

// ===== ПЕРЕГОРОДКА (разрез стены) с дверью =====
const PH=46;
let part='';
part+=box(X0-12,Y0-12,0,12,900,PH,'#e3d6b4',{top:'#3a332c',left:'#d8caa6',right:'#e8dcbc'});
part+=box(X0-12,Y0-12,0,192,12,PH,'#e3d6b4',{top:'#3a332c',left:'#e8dcbc',right:'#d8caa6'});
part+=box(X0+290,Y0-12,0,700,12,PH,'#e3d6b4',{top:'#3a332c',left:'#e8dcbc',right:'#d8caa6'});
// дверной порог и открытая створка
part+=poly([P(X0+180,Y0-12),P(X0+290,Y0-12),P(X0+290,Y0),P(X0+180,Y0)],'#8a8f96',1.2);
part+=box(X0+180,Y0-70,0,4,58,PH,'#9a7a54',{top:'#3a332c'});

// ===== СТУДИЯ =====
// сет: угол комнаты
const SX=1050,SY=1050,SL=230,SH=150;
let set='';
set+=poly([P(SX,SY),P(SX+SL,SY),P(SX+SL,SY+SL),P(SX,SY+SL)],'#8a6a4a',0);
// паркет
for(let i=0;i<SL;i+=14)set+=pl([P(SX+i,SY),P(SX+i,SY+SL)],'#7a5c3e',.8);
// ковёр
set+=poly([P(SX+50,SY+60),P(SX+190,SY+60),P(SX+190,SY+180),P(SX+50,SY+180)],'#7b3b3b',1.3)+poly([P(SX+60,SY+70),P(SX+180,SY+70),P(SX+180,SY+170),P(SX+60,SY+170)],'none',0)+pl([P(SX+60,SY+70),P(SX+180,SY+70),P(SX+180,SY+170),P(SX+60,SY+170),P(SX+60,SY+70)],'#d9b06a',1.2);
// стены сета (флеты) — обратная сторона видна сверху как торец
const SWL=(u,v)=>P(SX,SY+u,v),SWR=(u,v)=>P(SX+u,SY,v);
set+=poly([SWL(0,0),SWL(SL,0),SWL(SL,SH),SWL(0,SH)],'#6f8a7a',1.6);
set+=poly([SWR(0,0),SWR(SL,0),SWR(SL,SH),SWR(0,SH)],'#62806f',1.6);
for(let u=12;u<SL;u+=16){set+=pl([SWL(u,4),SWL(u,SH-4)],'#7f9a89',2.2);set+=pl([SWR(u,4),SWR(u,SH-4)],'#56715f',2.2)}
set+=pl([SWL(0,SH),SWL(SL,SH)],'#3a332c',4)+pl([SWR(0,SH),SWR(SL,SH)],'#3a332c',4);
set+=quad(SWL,0,0,SL,8,'#4f3b2a',1)+quad(SWR,0,0,SL,8,'#4a3727',1);
// окно в правом флете: ночной город
set+=quad(SWR,80,48,180,128,'#f0ede4',1.6)+quad(SWR,86,54,174,122,'#1b2742',1);
[[90,54,104,90],[106,54,118,104],[122,54,140,82],[142,54,152,96],[154,54,172,74]].forEach(([a,b,c,d])=>{set+=quad(SWR,a,b,c,d,'#0f1729',.4);for(let i=0;i<4;i++){const u=a+2+rnd()*(c-a-4),v=b+4+rnd()*(d-b-8);set+=quad(SWR,u,v,u+2.4,v+3,'#f4d27a',0)}});
set+=pl([SWR(130,54),SWR(130,122)],'#f0ede4',2)+pl([SWR(86,88),SWR(174,88)],'#f0ede4',2);
// картина на левом флете
set+=quad(SWL,40,70,110,120,'#b8893d',1.4)+quad(SWL,46,76,104,114,'#cfd7c6',.8)+poly([SWL(50,80),SWL(70,104),SWL(90,84),SWL(100,110),SWL(50,110)],'#7a9a6a',0);
add(1900,set);
// стойка контрового света за сетом (видна над флетами)
function stand(X,Y,h){let s='';s+=pl([[X-14,Y+6],[X,Y-8],[X+14,Y+6]],OC,3.6)+pl([[X-14,Y+6],[X,Y-8],[X+14,Y+6]],'#bfc3ca',1.8)+pl([[X,Y+8],[X,Y-8]],OC,3.6)+pl([[X,Y+8],[X,Y-8]],'#bfc3ca',1.8);
  s+=pl([[X,Y-8],[X,Y-h]],OC,4.4)+pl([[X,Y-8],[X,Y-h]],'#c7cad0',2.4);return s}
function fresnel(X,Y,ang,cls,col='#24242a'){
  return `<g transform="translate(${f1(X)} ${f1(Y)}) rotate(${ang})"><path d="M-8,-12 L-8,12 L6,9 L6,-9Z" fill="${col}" ${OL(1.3)}/><rect x="6" y="-13" width="7" height="26" rx="2" fill="${sh(col,.1)}" ${OL(1.3)}/><path d="M13,-13 L22,-19 M13,13 L22,19" ${OL(2.4)}/><ellipse class="lamp ${cls}" cx="13.5" cy="0" rx="2.6" ry="10.5" fill="#55555c" ${OL(1)}/><path d="M-8,-4 l-6,0 M-8,4 l-6,0" ${OL(1.6)}/></g>`;
}
{const p=P(960,960);add(1880,stand(p[0],p[1],170)+fresnel(p[0],p[1]-176,40,'l3'))}
add(2700,person({X:P(1175,1478)[0],Y:P(1175,1478)[1],dir:1,skin:SK[3],hair:'#121010',hs:'buzz',top:'#3a3a40',bot:'#4a4436',hood:1,al:'hip',ar:[10,-12,14,-30],cap:'#555'}));
// мебель сета
add(2150,shadow(SX+10,SY+70,46,120,.2)+box(SX+8,SY+70,0,44,120,24,'#8b4a3a',{top:'#a65a46'})+box(SX+4,SY+70,24,12,120,26,'#7c4033',{top:'#94503f'})+box(SX+8,SY+66,0,44,8,34,'#7c4033')+box(SX+8,SY+186,0,44,8,34,'#7c4033')+
  box(SX+16,SY+150,24,26,22,8,'#d9b06a'));
add(2110,(()=>{const p=P(SX+26,SY+26);return eshadow(p[0],p[1],10)+pl([[p[0],p[1]],[p[0],p[1]-110]],OC,3.2)+pl([[p[0],p[1]],[p[0],p[1]-110]],'#c6a052',1.6)+`<path d="M${f1(p[0]-14)},${f1(p[1]-104)} L${f1(p[0]+14)},${f1(p[1]-104)} L${f1(p[0]+9)},${f1(p[1]-126)} L${f1(p[0]-9)},${f1(p[1]-126)}Z" fill="#f2e2b4" ${OL(1.3)}/><ellipse class="glowlamp" cx="${f1(p[0])}" cy="${f1(p[1]-112)}" rx="40" ry="30" fill="url(#gWarm)" opacity="0"/>`})());
add(2200,box(SX+130,SY+16,0,34,26,30,'#5a3f2a',{top:'#6e4f36'})+mug(SX+146,SY+28,30,'#fff'));
// актёры
add(2280,person({X:P(SX+36,SY+120)[0],Y:P(SX+36,SY+120)[1],seat:1,dir:1,skin:SK[4],hair:'#2b1d14',hs:'long',top:'#e9e2d0',bot:'#3b4a6a',al:[-4,18,6,26],ar:[2,18,-6,26],mouth:'',blush:1}));
add(2360,person({X:P(SX+150,SY+130)[0],Y:P(SX+150,SY+130)[1],dir:-1,skin:SK[2],hair:'#1a1210',hs:'short',top:'#7a2f35',bot:'#2b2b2e',jacket:'#2c2c30',al:'hip',ar:[10,14,22,4],mouth:'o'}));
// ключевой софтбокс справа
function softbox(X,Y,h,ang){let s=stand(X,Y,h);
  s+=`<g transform="translate(${f1(X)} ${f1(Y-h-4)}) rotate(${ang})"><path d="M-10,-10 L-10,10 L22,30 L22,-30Z" fill="#1d1d20" ${OL(1.4)}/><path class="lamp l1" d="M22,-30 L22,30 L26,27 L26,-27Z" fill="#cfd2d8" ${OL(1.2)}/><rect x="-16" y="-7" width="7" height="14" rx="2" fill="#2a2a2e" ${OL(1.1)}/></g>`;return s}
{const p=P(1380,1110);add(2490,eshadow(p[0],p[1],16)+softbox(p[0],p[1],120,200))}
// заполняющий свет слева спереди
{const p=P(1140,1440);add(2590,eshadow(p[0],p[1],16)+stand(p[0],p[1],90)+fresnel(p[0],p[1]-96,-60,'l2','#2a2a30'))}
// мешки с песком
function sandbag(X,Y){return `<path d="M${f1(X-12)},${f1(Y)} q12,-12 24,0 q-12,9 -24,0z" fill="#b24a3a" ${OL(1.2)}/><path d="M${f1(X-2)},${f1(Y-6)} l2,6" ${OL(1)}/>`}
{const p=P(1380,1110),q=P(1140,1440);add(2495,sandbag(p[0]+10,p[1]+6));add(2595,sandbag(q[0]-10,q[1]+6))}
// кабели
const cable=(pts,col='#1d1d1f')=>`<path d="${pts}" fill="none" stroke="${OC}" stroke-width="4"/><path d="${pts}" fill="none" stroke="${col}" stroke-width="2.4"/>`;
{const a=P(1380,1110),b=P(1500,1300),c=P(1600,1500),d=P(1140,1440),e=P(1300,1600);
 decal(cable(`M${pt(a)} C${pt(P(1460,1150))} ${pt(P(1380,1300))} ${pt(b)} S${pt(P(1650,1450))} ${pt(c)}`));
 decal(cable(`M${pt(d)} C${pt(P(1200,1520))} ${pt(P(1260,1520))} ${pt(e)} S${pt(P(1500,1700))} ${pt(P(1650,1800))}`,'#2b2b2b'));
 decal(cable(`M${pt(P(1500,1560))} C${pt(P(1600,1600))} ${pt(P(1580,1700))} ${pt(P(1700,1760))}`,'#c43'));}
// метки на полу
function tmark(x,y,c='#e9c43a'){return pl([P(x-8,y),P(x+8,y)],c,2.4)+pl([P(x,y),P(x,y+10)],c,2.4)}
decal(tmark(SX+170,SY+250)+tmark(SX+260,SY+180,'#e05a7a')+tmark(1380,1250,'#5ab0e0'));
// рельсы и тележка
const TRK=1395;
{let s='';for(let x=1230;x<=1560;x+=20)s+=box(x,TRK-6,0,6,40,2,'#6a5038',{lw:.9});
 s+=pl([P(1225,TRK),P(1565,TRK)],OC,4)+pl([P(1225,TRK),P(1565,TRK)],'#c8ccd2',2.2)+pl([P(1225,TRK+28),P(1565,TRK+28)],OC,4)+pl([P(1225,TRK+28),P(1565,TRK+28)],'#c8ccd2',2.2);decal(s)}
// хлопушка (второй ассистент) перед камерой
add(2560,person({X:P(1300,1250)[0],Y:P(1300,1250)[1],dir:1,skin:SK[1],hair:'#3a2618',hs:'pony',top:'#2d3e5c',bot:'#2b2b2e',al:[-6,8,-10,-12],ar:[8,8,10,-12],mouth:'smile',
  over:IT.slate(0,-98,'clapme')}));
// бум-оператор
add(2585,person({X:P(1236,1344)[0],Y:P(1236,1344)[1],v:'back',dir:-1,skin:SK[0],hair:'#5a3a22',hs:'short',top:'#4a5a3a',bot:'#3a3a3a',al:[2,-16,4,-34],ar:[4,-14,8,-32],phones:1}));
{const h=P(1236,1344);const a=[h[0]-6,h[1]-128],b=P(SX+110,SY+120,175);add(2587,`<path d="M${f1(a[0])},${f1(a[1])} L${f1(b[0])},${f1(b[1])}" stroke="${OC}" stroke-width="4.4"/><path d="M${f1(a[0])},${f1(a[1])} L${f1(b[0])},${f1(b[1])}" stroke="#cfd2d8" stroke-width="2.4"/><g transform="translate(${f1(b[0])} ${f1(b[1])}) rotate(25)"><rect x="-16" y="-6" width="32" height="12" rx="6" fill="#8a8d93" ${OL(1.3)}/><path d="M-10,-6v12M-4,-6v12M2,-6v12M8,-6v12" stroke="#6a6d73" stroke-width="1"/></g>`)}
// камера на долли
function camRig(x,y){
  let s=shadow(x-6,y-4,70,46,.28);
  s+=box(x,y,4,60,38,14,'#3a3d44',{top:'#4a4e57'});
  for(const [a,b] of [[x+4,y+2],[x+56,y+2],[x+4,y+36],[x+56,y+36]]){const p=P(a,b);s+=`<circle cx="${f1(p[0])}" cy="${f1(p[1]-3)}" r="5" fill="#1d1d1f" ${OL(1)}/>`}
  s+=box(x+22,y+12,18,14,14,50,'#2a2c31');
  s+=box(x+14,y+6,68,32,30,22,'#26282d',{top:'#3a3d44'});
  s+=box(x+20,y-14,72,20,20,16,'#1f2024');
  s+=box(x+16,y-30,68,28,16,24,'#141518',{top:'#2a2b30'});
  s+=box(x+10,y+30,90,10,8,8,'#2a2c31');
  s+=box(x+40,y+34,84,26,4,18,'#2a2c31');s+=(()=>{const m=FL(x+40,y+34,84,26,4,18);return quad(m,2,2,24,16,'#3a2a22',.6)+quad(m,10,4,14,14,'#e9e1d4',0)+quad(m,17,5,20,14,'#7a2f35',0)})();
  return s;
}
add(2700,camRig(1340,1388));
add(2696,person({X:P(1290,1440)[0],Y:P(1290,1440)[1],v:'back',dir:-1,skin:SK[4],hair:'#b46a3a',hs:'bun',top:'#6a5a8a',bot:'#2b2b2e',al:[-2,18,8,20],ar:[6,16,16,8]}));
add(2760,person({X:P(1420,1380)[0],Y:P(1420,1380)[1],v:'back',dir:1,skin:SK[2],hair:'#161210',hs:'buzz',top:'#2c2c30',bot:'#2b2b2e',cap:'#2c2c30',al:[-2,16,-14,18],ar:[2,14,-8,14]}));
// видео-деревня: монитор на тележке, режиссёр в кресле спиной к нам
function vcart(x,y){let s=shadow(x,y,40,30,.2)+box(x,y,6,40,30,40,'#3a3d44',{top:'#4a4e57'});
  s+=box(x+6,y+12,46,4,4,10,'#222');s+=box(x-6,y+10,56,52,6,34,'#1d1e22');
  const m=FL(x-6,y+10,56,52,6,34);s+=quad(m,3,3,49,31,'#3a2a22',.6)+`<g class="monshot">`+poly([m(3,3),m(18,3),m(12,31),m(3,31)],'rgba(255,200,120,.3)',0)+quad(m,16,8,22,26,'#e9e1d4',.3)+quad(m,28,10,34,26,'#7a2f35',.3)+quad(m,34,8,40,13,'#c68a62',.3)+`</g><circle class="rec" cx="${f1(m(46,28)[0])}" cy="${f1(m(46,28)[1])}" r="1.8" fill="#ff3b30"/>`;
  return s}
add(3000,vcart(1500,1560));
function dchair(X,Y,c='#7a3a2a'){return `<path d="M${X-14},${Y} L${X+12},${Y-34} M${X+14},${Y} L${X-12},${Y-34}" ${OL(3)}/><path d="M${X-14},${Y} L${X+12},${Y-34} M${X+14},${Y} L${X-12},${Y-34}" stroke="#c49a62" stroke-width="1.6"/><rect x="${X-15}" y="${Y-40}" width="30" height="6" fill="${c}" ${OL(1.2)}/><path d="M${X-15},${Y-36} L${X-15},${Y-66} M${X+15},${Y-36} L${X+15},${Y-66}" ${OL(3)}/><path d="M${X-15},${Y-36} L${X-15},${Y-66} M${X+15},${Y-36} L${X+15},${Y-66}" stroke="#c49a62" stroke-width="1.6"/>`}
{const p=P(1560,1640);add(3190,dchair(p[0],p[1]));
 add(3200,person({X:p[0],Y:p[1],v:'back',seat:1,dir:1,skin:SK[0],hair:'#6a6a6a',hs:'bald',top:'#2f3a52',bot:'#2b2b2e',al:[-6,16,-8,30],ar:[6,14,-2,30],phones:1}));
 add(3205,`<rect x="${p[0]-15}" y="${p[1]-70}" width="30" height="14" fill="#7a3a2a" ${OL(1.2)}/>`)}
add(3240,person({X:P(1628,1640)[0],Y:P(1628,1640)[1],v:'back',dir:-1,skin:SK[3],hair:'#121010',hs:'long',top:'#e0d8c4',bot:'#2b2b2e',al:'down',ar:[6,16,0,30]}));
// продюсер с кофе — сбоку, лицом к нам
add(3330,person({X:P(1720,1610)[0],Y:P(1720,1610)[1],dir:-1,skin:SK[1],hair:'#3a2a20',hs:'side',top:'#f2f0ea',bot:'#26303f',jacket:'#2f4a6a',al:'hip',ar:'chest',item:IT.cup(-9,-60),mouth:'smile'}));
// скрипт-супервайзер на эппл-боксе
add(3080,box(1420,1650,0,30,18,14,'#c79a62',{top:'#ddb07a'}));
add(3090,person({X:P(1434,1660)[0],Y:P(1434,1660)[1],seat:1,dir:1,skin:SK[4],hair:'#2a2420',hs:'long',top:'#8a5a8a',bot:'#2b2b2e',al:[-4,14,6,24],ar:[6,16,0,22],item:IT.clip(-1,-48),glasses:1,blush:1}));
// гримёр с кейсом
add(2860,box(1600,1290,0,40,26,26,'#b54a5a',{top:'#cf6474'})+box(1600,1290,26,40,26,2,'#e9e1d4'));
add(2920,person({X:P(1610,1340)[0],Y:P(1610,1340)[1],dir:-1,skin:SK[6],hair:'#121010',hs:'curly',top:'#1f1f22',bot:'#1f1f22',al:[-8,10,-14,-6],ar:'phone',mouth:'o',blush:1,phones:0,item:`<rect x="8" y="-106" width="5" height="12" rx="1.5" fill="#222" ${OL(1)}/><path d="M10.5,-106 v-7" ${OL(1.4)}/>`}));
// гаффер у тележки с кабелем
add(2980,cart(1640,1440).replace(/#b24a3a/g,'#3a6ab2'));
add(3010,person({X:P(1700,1520)[0],Y:P(1700,1520)[1],dir:1,skin:SK[2],hair:'#3a2a1a',hs:'short',beard:1,top:'#5b4a3a',bot:'#2f3540',sleeve:'#5b4a3a',al:[-8,14,-2,26],ar:[8,14,2,26],print:'',
  item:`<ellipse cx="0" cy="-26" rx="14" ry="8" fill="none" stroke="${OC}" stroke-width="5"/><ellipse cx="0" cy="-26" rx="14" ry="8" fill="none" stroke="#e05030" stroke-width="2.6"/>`}));
// столик с кофе и перекусом
add(3500,shadow(1760,1780,120,50,.2)+box(1760,1780,0,120,50,40,'#e8e4da',{top:'#f6f3ec',left:'#dcd7cb'})+cyl(...P(1780,1790,40),9,22,'#b5b8be')+mug(1810,1800,40)+mug(1820,1812,40,'#e05030')+box(1840,1790,40,34,22,6,'#d9a86c')+
  [0,1,2,3].map(i=>{const p=P(1846+i*7,1800,46);return `<circle cx="${f1(p[0])}" cy="${f1(p[1]-1)}" r="3.2" fill="${['#e7a84a','#c95a7a','#e7a84a','#7a4a2a'][i]}" ${OL(1)}/>`}).join('')+box(1800,1815,40,20,14,2,'#d33'));
add(3600,person({X:P(1840,1870)[0],Y:P(1840,1870)[1],dir:-1,skin:SK[3],hair:'#1a1210',hs:'curly',top:'#e2a83a',bot:'#2b3a52',al:'hip',ar:[8,8,8,-8],mouth:'o',item:`<circle cx="8" cy="-10" r="4" fill="#c95a7a" ${OL(1)}/>`}));
// кейсы и стойки внизу
add(3420,fcase(1900,1560,0,50,36,30)+fcase(1960,1560,0,40,40,40));
add(3700,fcase(1560,2000,0,60,40,26));
add(3500,shadow(1640,1876,74,40,.2)+box(1640,1876,0,74,36,36,'#e8e4da',{top:'#f6f3ec'})+box(1642,1876,36,70,5,52,'#d9d4c8')+(()=>{const m=FL(1642,1876,36,70,5,52);let r=quad(m,6,6,64,46,'#bcd3df',.9)+poly([m(10,40),m(30,10),m(40,10),m(18,40)],'rgba(255,255,255,.5)',0);for(let i=0;i<7;i++){const q=m(4+i*10.3,49);r+=`<circle cx="${f1(q[0])}" cy="${f1(q[1])}" r="2.4" fill="#fff4cf" ${OL(.8)}/>`}return r})()+
  [0,1,2].map(i=>{const p=P(1652+i*14,1902,36);return `<rect x="${f1(p[0]-2)}" y="${f1(p[1]-9)}" width="4" height="9" rx="1" fill="${['#c95a7a','#2b2b2b','#e7b9a0'][i]}" ${OL(.8)}/>`}).join(''));
add(3560,chair(1664,1932,'#3b3b3e','near'));
add(3570,person({X:P(1678,1948)[0],Y:P(1678,1948)[1],v:'back',seat:1,dir:1,skin:SK[1],hair:'#2a1a12',hs:'long',top:'#e8e1cf',bot:'#3b4a6a',al:'type',ar:'type'}));
add(3571,box(1664,1956,20,28,5,24,'#3b3b3e'));
add(3640,person({X:P(1740,1936)[0],Y:P(1740,1936)[1],dir:-1,skin:SK[6],hair:'#121010',hs:'curly',top:'#1f1f22',bot:'#1f1f22',al:'hip',ar:[8,-4,14,-22],mouth:'smile',blush:1,item:`<path d="M14,-22 l5,-12" ${OL(2.4)}/><path d="M17,-32 l3,-8 l3,2 l-3,8z" fill="#e7b9a0" ${OL(1)}/>`}));
// эппл-боксы и си-стенд у софтбокса
add(2560,box(1380,1150,0,30,20,12,'#c79a62',{top:'#ddb07a'})+box(1382,1150,12,30,20,12,'#c79a62',{top:'#ddb07a'})+box(1386,1152,24,26,18,6,'#c79a62',{top:'#ddb07a'}));
add(3800,plant(2000,1900,1));

// ---------- свет: лучи и пятна (включаются при прокрутке) ----------
defs+=`<radialGradient id="gWarm"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
<linearGradient id="gBeam1" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3cf" stop-opacity=".55"/><stop offset="1" stop-color="#fff3cf" stop-opacity="0"/></linearGradient>
<linearGradient id="gBeam2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".5"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></linearGradient>`;
let light='';
{const k=P(1380,1110,124),a=P(SX+60,SY+150),b=P(SX+180,SY+120);
 light+=`<polygon class="beam b1" points="${pt([k[0]-10,k[1]-24])} ${pt([k[0]-6,k[1]+26])} ${pt(a)} ${pt(P(SX+40,SY+40,60))}" fill="url(#gBeam1)" opacity="0"/>`;
 const f=P(1140,1440,96);light+=`<polygon class="beam b2" points="${pt([f[0]+4,f[1]-8])} ${pt([f[0]+12,f[1]+4])} ${pt(P(SX+200,SY+200))} ${pt(P(SX+140,SY+60,40))}" fill="url(#gBeam2)" opacity="0"/>`;
 const c=P(SX+120,SY+130);light+=`<ellipse class="pool" cx="${f1(c[0])}" cy="${f1(c[1])}" rx="170" ry="80" fill="url(#gWarm)" opacity="0"/>`;}

// ---------- сборка ----------
items.sort((a,b)=>a.k-b.k);
const office=items.filter(i=>i.k<1800).map(i=>i.svg).join('\n');
const stud=items.filter(i=>i.k>=1800).map(i=>i.svg).join('\n');
const css=`<style>
.story .beam,.story .pool,.story .glowlamp{transition:opacity 1.2s ease}
.story.lit .beam{opacity:1}.story.lit .pool{opacity:.35}.story.lit .glowlamp{opacity:.5}
.story .lamp{transition:fill .5s}.story.lit .lamp{fill:#fff6d8}
.story .slatestick{transform-box:fill-box;transform-origin:0% 100%;transform:rotate(-24deg);transition:transform .12s ease-in}
.story.clap .slatestick{transform:rotate(0deg)}
.story .rec{animation:recb 1.2s steps(2) infinite}
@keyframes recb{50%{opacity:.15}}
.story .steam{animation:stm 3.2s ease-in-out infinite;opacity:0}
@keyframes stm{0%{opacity:0;transform:translateY(4px)}40%{opacity:.55}100%{opacity:0;transform:translateY(-10px)}}
@media (prefers-reduced-motion:reduce){.story .rec,.story .steam{animation:none}}
</style>`;
// пар от кофе на столе встречи
let steam='';[[TX+30,TY+90],[TX+180,TY+30]].forEach(([x,y],i)=>{const p=P(x,y,56);steam+=`<path class="steam" style="animation-delay:${i*1.1}s" d="M${f1(p[0])},${f1(p[1])} q-4,-6 0,-11 q4,-5 0,-10" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`});
const svg=`<svg xmlns="http://www.w3.org/2000/svg" class="story" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" role="img" aria-label="Команда готовится к съёмке в офисе, затем снимает сцену в павильоне">${css}<defs>${defs}</defs>${bg}${studio}${walls}${office}${part}${floorItems.join('')}${stud}${light}${steam}</svg>`;
fs.writeFileSync(process.argv[2]||'/tmp/claude-0/ss/story.svg',svg);
console.log('ok',(svg.length/1024).toFixed(0)+'KB',items.length);
