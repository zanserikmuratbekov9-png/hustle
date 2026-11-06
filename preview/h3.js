/* ---------- главная: три фото, переход «в экран» ---------- */
const H3={
  // экраны и фокусы задаются в пикселях исходных фото
  s:[
    {src:'t1.jpg',w:1920,h:1080,quad:[[860,470],[1140,500],[1130,690],[850,650]],focus:[960,560],mfocus:[990,560]},
    {src:'t2.jpg',w:1920,h:1080,quad:[[420,420],[600,400],[605,520],[425,535]],focus:[800,540],mfocus:[560,520]},
    {src:'t3.jpg',w:1920,h:1080,quad:[[480,90],[1440,110],[1430,560],[490,540]],focus:[960,560],mfocus:[960,520]},
  ],
  site:{src:'site.jpg',w:1440,h:900},
  film:{src:'film.jpg',w:1920,h:1080},
  // отрезки прокрутки
  T:{push1:[0,.26],in1:[.26,.42],push2:[.42,.6],in2:[.6,.74],out3:[.74,.94],end:[.9,1]},
  p:0,tp:0,raf:0,v:0
};
const h3sq=q=>{const [x0,y0]=q[0],[x1,y1]=q[1],[x2,y2]=q[2],[x3,y3]=q[3];const dx1=x1-x2,dx2=x3-x2,dy1=y1-y2,dy2=y3-y2,sx=x0-x1+x2-x3,sy=y0-y1+y2-y3;let g=0,h=0;if(Math.abs(sx)>1e-9||Math.abs(sy)>1e-9){const den=dx1*dy2-dx2*dy1;g=(sx*dy2-dx2*sy)/den;h=(dx1*sy-sx*dy1)/den}return [x1-x0+g*x1,x3-x0+h*x3,x0,y1-y0+g*y1,y3-y0+h*y3,y0,g,h,1]};
const h3mul=(A,B)=>{const r=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)r.push(A[i*3]*B[j]+A[i*3+1]*B[3+j]+A[i*3+2]*B[6+j]);return r};
const h3inv=m=>{const [a,b,c,d,e,f,g,h,i]=m;const A=e*i-f*h,B=-(d*i-f*g),C=d*h-e*g,det=a*A+b*B+c*C;return [A/det,-(b*i-c*h)/det,(b*f-c*e)/det,B/det,(a*i-c*g)/det,-(a*f-c*d)/det,C/det,-(a*h-b*g)/det,(a*e-b*d)/det]};
const h3q2q=(src,dst)=>h3mul(h3sq(dst),h3inv(h3sq(src)));
const h3ap=(M,p)=>{const w=M[6]*p[0]+M[7]*p[1]+M[8];return [(M[0]*p[0]+M[1]*p[1]+M[2])/w,(M[3]*p[0]+M[4]*p[1]+M[5])/w]};
const h3css=M=>{const k=M[8];const m=M.map(v=>v/k);return `matrix3d(${m[0]},${m[3]},0,${m[6]},${m[1]},${m[4]},0,${m[7]},0,0,1,0,${m[2]},${m[5]},0,1)`};
const h3rect=(w,h)=>[[0,0],[w,0],[w,h],[0,h]];
const h3cl=v=>v<0?0:v>1?1:v,h3seg=(p,r)=>h3cl((p-r[0])/(r[1]-r[0]));
const h3ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,h3sm=t=>t*t*(3-2*t);
const h3lq=(a,b,t)=>a.map((p,i)=>[p[0]+(b[i][0]-p[0])*t,p[1]+(b[i][1]-p[1])*t]);
// камера: центр в пикселях фото и масштаб → матрица фото→экран
function h3cam(c,s,vw,vh){return [s,0,vw/2-c[0]*s,0,s,vh/2-c[1]*s,0,0,1]}
function h3inner(q){return {x0:Math.max(q[0][0],q[3][0]),y0:Math.max(q[0][1],q[1][1]),x1:Math.min(q[1][0],q[2][0]),y1:Math.min(q[2][1],q[3][1])}}
function h3bbox(q){const xs=q.map(p=>p[0]),ys=q.map(p=>p[1]);return {x0:Math.min(...xs),y0:Math.min(...ys),x1:Math.max(...xs),y1:Math.max(...ys)}}
// плавный зум к точке: центр движется так, чтобы точка цели вела себя естественно
function h3zoom(c0,s0,c1,s1,t){const s=Math.exp(Math.log(s0)+(Math.log(s1)-Math.log(s0))*t);const k=Math.abs(1-s0/s1)<1e-6?t:(1-s0/s)/(1-s0/s1);return {c:[c0[0]+(c1[0]-c0[0])*k,c0[1]+(c1[1]-c0[1])*k],s}}
function h3html(){
  const im=(o,cls)=>`<img class="${cls}" src="${o.src}" width="${o.w}" height="${o.h}" alt="" decoding="async" draggable="false">`;
  const S=H3.s;
  return `<section class="h3" aria-label="Студенты готовятся к съёмке в HUSTLE, снимают и смотрят своё кино в кинозале"><div class="h3-stage">`+
    `<div class="h3-l" id="h3L1">${im(S[0],'h3-i')}${im(H3.site,'h3-site')}<div class="h3-glare"></div></div>`+
    `<div class="h3-l" id="h3L2">${im(S[1],'h3-i')}</div>`+
    `<div class="h3-l" id="h3L3">${im(S[2],'h3-i')}${im(H3.film,'h3-film')}</div>`+
    `<div class="h3-bloom" id="h3Bloom"></div><div class="h3-vig"></div><div class="h3-grain"></div>`+
    `<div class="h3-end" id="h3End"><h2><span>Снимай</span> <span>красивое</span> <span>кино</span> <span>вместе</span> <span>с</span> <b>HUSTLE</b></h2><button class="btn" type="button" data-c="tab" data-k="proj">Начать проект</button></div>`+
    `<div class="h3-hint" id="h3Hint" aria-hidden="true"><i></i></div>`+
  `</div></section>`;
}
function h3render(){
  const st=document.querySelector('.h3-stage');if(!st)return;
  const vw=st.clientWidth,vh=st.clientHeight,mob=vw<vh;
  const S=H3.s,T=H3.T,p=H3.p;
  const VP=[[0,0],[vw,0],[vw,vh],[0,vh]];
  const foc=i=>mob?S[i].mfocus:S[i].focus;
  const cover=i=>Math.max(vw/S[i].w,vh/S[i].h);
  // подогнать экран (внутренний прямоугольник) под окно
  const fitQ=(q,mode)=>{const b=mode==='cover'?h3inner(q):h3bbox(q);const bw=b.x1-b.x0,bh=b.y1-b.y0;return {c:[(b.x0+b.x1)/2,(b.y0+b.y1)/2],s:mode==='cover'?Math.max(vw/bw,vh/bh):Math.min(vw/bw,vh/bh)*.96}};
  // сцена 1
  const a1={c:foc(0),s:cover(0)*1.03};
  const b1={c:[foc(0)[0]+(S[0].quad[0][0]+S[0].quad[2][0]-2*foc(0)[0])*.18,foc(0)[1]+(S[0].quad[0][1]+S[0].quad[2][1]-2*foc(0)[1])*.18],s:cover(0)*1.2};
  const e1=fitQ(S[0].quad,'fit');
  const t1=h3ease(h3seg(p,T.push1)),q1=h3seg(p,T.in1),z1=h3ease(q1);
  let cam1=h3zoom(a1.c,a1.s,b1.c,b1.s,t1);if(q1>0)cam1=h3zoom(b1.c,b1.s,e1.c,e1.s,z1);
  const M1=h3cam(cam1.c,cam1.s,vw,vh);
  const lap=S[0].quad.map(pt=>h3ap(M1,pt));
  // сцена 2: стартовое окно
  const a2={c:foc(1),s:cover(1)*1.04};
  const win2=[[a2.c[0]-vw/2/a2.s,a2.c[1]-vh/2/a2.s],[a2.c[0]+vw/2/a2.s,a2.c[1]-vh/2/a2.s],[a2.c[0]+vw/2/a2.s,a2.c[1]+vh/2/a2.s],[a2.c[0]-vw/2/a2.s,a2.c[1]+vh/2/a2.s]];
  const b2={c:[foc(1)[0]+(S[1].quad[0][0]+S[1].quad[2][0]-2*foc(1)[0])*.22,foc(1)[1]+(S[1].quad[0][1]+S[1].quad[2][1]-2*foc(1)[1])*.22],s:cover(1)*1.22};
  const e2=fitQ(S[1].quad,'fit');
  const t2=h3ease(h3seg(p,T.push2)),q2=h3seg(p,T.in2),z2=h3ease(q2);
  let M2,clip2=null;
  if(p<T.in1[1]){const w=Math.pow(h3sm(h3seg(z1,[.35,1])),1.4);const dst=h3lq(lap,VP,w);M2=h3q2q(win2,dst);clip2=dst}
  else{let cam2=h3zoom(a2.c,a2.s,b2.c,b2.s,t2);if(q2>0)cam2=h3zoom(b2.c,b2.s,e2.c,e2.s,z2);M2=h3cam(cam2.c,cam2.s,vw,vh)}
  const mon=S[1].quad.map(pt=>h3ap(M2,pt));
  // сцена 3
  const a3=fitQ(S[2].quad,'cover');const scr3=S[2].quad;
  const A3=h3cam(a3.c,a3.s,vw,vh);const scrA=scr3.map(pt=>h3ap(A3,pt));
  const e3={c:foc(2),s:cover(2)*1.02};
  const q3=h3seg(p,T.out3);
  let M3,clip3=null;
  if(p<T.in2[1]){const w=Math.pow(h3sm(h3seg(z2,[.35,1])),1.4);const dst=h3lq(mon,scrA,w);M3=h3q2q(scr3,dst);clip3=dst}
  else{const cam3=h3zoom(a3.c,a3.s,e3.c,e3.s,h3ease(q3));M3=h3cam(cam3.c,cam3.s,vw,vh)}
  // применяем
  const L1=document.getElementById('h3L1'),L2=document.getElementById('h3L2'),L3=document.getElementById('h3L3');
  const show=(el,v)=>{el.style.visibility=v?'visible':'hidden'};
  show(L1,p<=T.in1[1]-.002);show(L2,p>=T.in1[0]&&p<=T.in2[1]-.002);show(L3,p>=T.in1[1]-.02);
  L1.querySelector('.h3-i').style.transform=h3css(M1);
  L1.querySelector('.h3-site').style.transform=h3css(h3mul(M1,h3q2q(h3rect(H3.site.w,H3.site.h),S[0].quad)));
  const gl=L1.querySelector('.h3-glare');gl.style.clipPath=`polygon(${lap.map(q=>q[0].toFixed(1)+'px '+q[1].toFixed(1)+'px').join(',')})`;
  L2.querySelector('.h3-i').style.transform=h3css(M2);
  L2.style.clipPath=clip2?`polygon(${clip2.map(q=>q[0].toFixed(1)+'px '+q[1].toFixed(1)+'px').join(',')})`:'none';
  L2.style.opacity=p<T.in1[1]?h3sm(h3seg(q1,[0,.45])):1;
  L3.querySelector('.h3-i').style.transform=h3css(M3);
  L3.querySelector('.h3-film').style.transform=h3css(h3mul(M3,h3q2q(h3rect(H3.film.w,H3.film.h),scr3)));
  L3.style.clipPath=clip3?`polygon(${clip3.map(q=>q[0].toFixed(1)+'px '+q[1].toFixed(1)+'px').join(',')})`:'none';
  // свет экрана при входе, лёгкое размытие от скорости
  const bl=Math.max(Math.sin(Math.PI*h3seg(q1,[.45,1])),Math.sin(Math.PI*h3seg(q2,[.45,1])))*.55;
  document.getElementById('h3Bloom').style.opacity=bl.toFixed(3);
  const blur=Math.min(2.4,Math.abs(H3.v)*900);
  st.style.setProperty('--h3b',blur.toFixed(2)+'px');
  // финал
  const en=h3seg(p,T.end);const end=document.getElementById('h3End');end.style.setProperty('--e',en.toFixed(3));end.style.visibility=en>.01?'visible':'hidden';
  document.getElementById('h3Hint').style.opacity=(1-h3seg(p,[0,.03])).toFixed(2);
}
function h3tick(){
  const sec=document.querySelector('.h3');if(!sec){H3.raf=0;return}
  const r=sec.getBoundingClientRect(),tot=sec.offsetHeight-innerHeight;
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  H3.tp=tot>0?h3cl(-r.top/tot):0;
  const d=H3.tp-H3.p;const k=still?1:.14;H3.v=d*k;H3.p+=Math.abs(d)<.0004?d:d*k;
  h3render();
  H3.raf=Math.abs(H3.tp-H3.p)>.0002?requestAnimationFrame(h3tick):0;
}
function h3kick(){if(!H3.raf)H3.raf=requestAnimationFrame(h3tick)}
addEventListener('scroll',h3kick,{passive:true});addEventListener('resize',()=>{H3.raf=0;h3kick()});
