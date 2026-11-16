/* старые Safari (iOS до 16.2) не понимают color-mix — тогда цвета пропадают. Подменяем на ближайший цвет. */
(function(){
  var ok=false;try{ok=window.CSS&&CSS.supports&&CSS.supports('color','color-mix(in srgb, red 50%, blue)')}catch(e){}
  if(ok&&!/[?&]nocm\b/.test(location.search))return;
  function split(t){var a=[],d=0,c='';for(var i=0;i<t.length;i++){var ch=t[i];if(ch==='(')d++;else if(ch===')')d--;if(ch===','&&d===0){a.push(c);c=''}else c+=ch}a.push(c);return a}
  function pct(x){var m=/\s(\d+(?:\.\d+)?)%\s*$/.exec(' '+x);return m?{c:x.replace(/\s*\d+(?:\.\d+)?%\s*$/,'').trim(),p:parseFloat(m[1])}:{c:x.trim(),p:null}}
  function fix(t){var k,out='',from=0;
    while((k=t.indexOf('color-mix(',from))>-1){var d=0,j=k+9;for(;j<t.length;j++){if(t[j]==='(')d++;else if(t[j]===')'){d--;if(d===0)break}}
      var parts=split(t.slice(k+10,j));var A=pct(parts[1]||''),B=pct(parts[2]||'');
      var pa=A.p!=null?A.p:(B.p!=null?100-B.p:50);var pick=pa>=50?A.c:B.c;if(pick==='transparent')pick=pa>=50?B.c:A.c;
      out+=t.slice(from,k)+fix(pick);from=j+1}
    return out+t.slice(from)}
  window.__cmfix=fix;
  /* стили теперь во внешнем файле: загружаем его, подменяем color-mix и подключаем исправленную копию поверх */
  try{var x=new XMLHttpRequest();x.open('GET','css/app.css?v=20261116',false);x.send();if(x.status===200){var st=document.createElement('style');st.textContent=fix(x.responseText);document.head.appendChild(st)}}catch(e){}
})();
