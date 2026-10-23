// Движок научпоп-роликов: сцены по таймлайну, вырезки Кристины, схема-фигурка с позвоночником и мышцами.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),inv=(a,b,v)=>clamp((v-a)/(b-a)),lerp=(a,b,t)=>a+(b-a)*t;
const eOut3=t=>1-Math.pow(1-t,3),eIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const spring=t=>t<=0?0:1-Math.exp(-7*t)*Math.cos(10*t);
const $=s=>document.querySelector(s);
const V=+(new URLSearchParams(location.search).get('v')||1),SP=VIDEOS[V-1];
window.DURATION=25;window.VIDEO_NAME=SP.file;const EVENTS=[];window.EVENTS=EVENTS;
const TL=[['hook',0,2.5],['a',2.5,5.4],['b',5.4,8.3],['act0',8.3,11.6],['act1',11.6,14.9],['act2',14.9,18.2],['club',18.2,22.2],['disc',22.2,25]];

// ---------- текст: «*акцент*» курсивом, хвостовая пунктуация прилипает к слову
function textBlock(parent,top,lines){const el=document.createElement('div');el.className='t';el.style.top=top+'px';
  el.innerHTML=lines.map(([cls,s])=>{const toks=[];s.replace(/\*([^*]+)\*(\S*)|(\S+)/g,(m,a,tail,w)=>{toks.push(a?`<i class="acc">${a}</i>${tail}`:w)});
    return `<div class="${cls}">${cls==='chip'?`<span class="w chip">${s}</span>`:toks.map(x=>`<span class="w">${x}</span>`).join('')}</div>`;}).join('');
  parent.appendChild(el);return el;}
function fitLines(el){[...el.children].forEach(d=>{const wd=()=>[...d.children].reduce((a,c)=>a+c.offsetWidth+.24*parseFloat(getComputedStyle(d).fontSize),0);
  let fs=parseFloat(getComputedStyle(d).fontSize);while(wd()>940&&fs>64){fs-=2;d.style.fontSize=fs+'px';}});}
function animWords(el,a,lt,dur,step=.22){const ws=[...el.querySelectorAll('.w')];ws.forEach((w,i)=>{const p=spring(inv(a+i*step,a+i*step+.55,lt)*1.1),o=1-inv(dur-.25,dur,lt);
  w.style.opacity=clamp(p*3)*o;w.style.transform=`translateY(${(1-clamp(p))*40}px) scale(${lerp(.7,1,clamp(p))}) rotate(${(1-clamp(p))*(i%2?4:-4)}deg)`;});return ws.length;}

// ---------- вырезка героини: вписывается в рамку снизу, въезд сбоку/снизу
const FLAT=new Set(['k08','k11','k12','k13','k20']); // обрезаны снизу — ставим на край кадра
function heroEl(parent,id){const img=document.createElement('img');img.className='hero';img.src=id==='k21'?'cut/kristina_07_clean.png':`cut56/${id}.png`;img.dataset.id=id;parent.appendChild(img);return img;}
function placeHero(img,lt,dur,o){const nw=img.naturalWidth,nh=img.naturalHeight,top=o.top||680,maxH=(o.maxH||1920-top-(FLAT.has(img.dataset.id)?0:70)),maxW=o.maxW||960;
  let h=Math.min(maxH,maxW*nh/nw),w=h*nw/nh;const bottom=FLAT.has(img.dataset.id)?1930:1850,cx=o.cx||540;
  const p=spring(inv(0,.7,lt)*1.05),out=inv(dur-.3,dur,lt),from=o.from||'right';
  const dx=from==='right'?(1-clamp(p))*700:from==='left'?-(1-clamp(p))*700:0,dy=from==='up'?(1-clamp(p))*500:0;
  img.style.width=w+'px';img.style.height=h+'px';
  img.style.transform=`translate(${cx-w/2+dx}px,${bottom-h+dy+Math.sin(lt*3)*5}px) rotate(${Math.sin(lt*2.2)*1+(1-clamp(p))*(from==='left'?-8:8)}deg) scale(${lerp(1,1.03,lt/dur)})`;
  img.style.opacity=clamp(p*4)*(1-out);}

// ---------- фигурка (вид сбоку, viewBox 600×600): точки H голова, N шея, C середина спины, P таз, S плечо, E локоть, W кисть, K колено, F стопа
const POSES={
 sitGood:{H:[312,128],N:[300,190],C:[298,272],P:[300,360],S:[302,206],E:[318,292],W:[392,284],K:[410,368],F:[412,505]},
 sitSlouch:{H:[372,178],N:[338,222],C:[274,282],P:[294,366],S:[332,232],E:[362,302],W:[424,288],K:[410,368],F:[412,505]},
 standGood:{H:[300,92],N:[300,150],C:[298,236],P:[300,322],S:[300,166],E:[304,246],W:[308,320],K:[302,425],F:[302,528]},
 standSlouch:{H:[344,128],N:[324,170],C:[280,242],P:[300,324],S:[322,184],E:[330,258],W:[338,324],K:[302,425],F:[302,528]},
 phoneLook:{H:[350,138],N:[318,170],C:[294,240],P:[300,322],S:[314,182],E:[330,256],W:[374,214],K:[302,425],F:[302,528]},
 phoneUp:{H:[306,92],N:[300,150],C:[298,236],P:[300,322],S:[300,166],E:[350,214],W:[384,112],K:[302,425],F:[302,528]},
 nodFwd:{H:[324,104],N:[302,152],C:[298,236],P:[300,322],S:[300,166],E:[304,246],W:[308,320],K:[302,425],F:[302,528]},
 nodBack:{H:[288,96],N:[300,152],C:[298,236],P:[300,322],S:[300,166],E:[304,246],W:[308,320],K:[302,425],F:[302,528]},
 walk1:{H:[306,92],N:[302,150],C:[300,236],P:[300,322],S:[302,166],E:[330,240],W:[352,300],K:[336,420],F:[356,528]},
 walk2:{H:[306,92],N:[302,150],C:[300,236],P:[300,322],S:[302,166],E:[276,240],W:[262,302],K:[272,422],F:[244,528]},
 wallOpen:{H:[312,92],N:[304,150],C:[300,236],P:[300,322],S:[300,166],E:[236,154],W:[214,92],K:[302,425],F:[302,528]},
 wallClosed:{H:[330,110],N:[316,160],C:[290,238],P:[300,322],S:[316,176],E:[332,250],W:[340,320],K:[302,425],F:[302,528]},
 bridgeDown:{H:[112,470],N:[168,478],C:[252,484],P:[340,484],S:[176,480],E:[214,514],W:[276,516],K:[436,398],F:[474,506]},
 bridgeUp:{H:[112,470],N:[168,478],C:[258,438],P:[350,388],S:[176,480],E:[214,514],W:[276,516],K:[444,370],F:[474,506]},
 cat:{H:[470,350],N:[418,300],C:[332,238],P:[242,300],S:[412,306],E:[414,404],W:[416,500],K:[236,500],F:[122,505]},
 cow:{H:[478,282],N:[420,300],C:[330,350],P:[242,300],S:[412,306],E:[414,404],W:[416,500],K:[236,500],F:[122,505]},
};
for(const n in POSES){const p=POSES[n];if(!p.K2){p.K2=p.K;p.F2=p.F;}}
POSES.walk1.K2=[270,424];POSES.walk1.F2=[244,528];POSES.walk2.K2=[336,420];POSES.walk2.F2=[358,528];
const add2=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],nrm=v=>{const l=Math.hypot(v[0],v[1])||1;return[v[0]/l,v[1]/l]};
function lerpPose(A,B,k){const o={};for(const n in A)o[n]=[lerp(A[n][0],B[n][0],k),lerp(A[n][1],B[n][1],k)];return o;}
function poseAt(spec,lt){if(spec.loop){const [a,b]=spec.loop,ph=(1-Math.cos(2*Math.PI*lt/(spec.period||2)))/2;return lerpPose(POSES[a],POSES[b],eIO(ph));}
  const k=spec.keys;let i=0;while(i<k.length-1&&lt>=k[i+1][0])i++;if(i>=k.length-1)return POSES[k[k.length-1][1]];
  const [t0,a]=k[i],[t1,b]=k[i+1];return lerpPose(POSES[a],POSES[b],eIO(inv(t0,t0+Math.min(1.1,t1-t0),lt)));}
const ctrlOf=p=>[2*p.C[0]-(p.N[0]+p.P[0])/2,2*p.C[1]-(p.N[1]+p.P[1])/2];
const qpt=(p,u)=>{const c=ctrlOf(p),m=1-u;return[m*m*p.N[0]+2*m*u*c[0]+u*u*p.P[0],m*m*p.N[1]+2*m*u*c[1]+u*u*p.P[1]]};
const qtan=(p,u)=>{const c=ctrlOf(p);return nrm([2*(1-u)*(c[0]-p.N[0])+2*u*(p.P[0]-c[0]),2*(1-u)*(c[1]-p.N[1])+2*u*(p.P[1]-c[1])])};
const backN=p=>{const d=nrm(sub(p.P,p.N));return[-d[1],d[0]]}; // нормаль в сторону спины
const ang=v=>Math.atan2(v[1],v[0])*180/Math.PI;
function anchor(p,a){if(Array.isArray(a))return a;const b=backN(p);
  switch(a){case'neck':return add2(add2(p.N,sub(p.H,p.N),.35),b,24);case'upperBack':return add2(qpt(p,.28),b,34);case'lowerBack':return add2(qpt(p,.8),b,34);
   case'chest':return add2(qpt(p,.22),b,-40);case'glute':return add2(add2(p.P,b,38),nrm(sub(p.P,p.N)),12);case'hip':return add2(add2(p.P,sub(p.K,p.P),.32),b,-20);
   case'head':return p.H;case'W':return p.W;case'P':return p.P;default:return p[a]||[300,300];}}
const COL={tense:'196,139,124',good:'108,142,173',neutral:'42,42,42'};
function spineCol(spec,lt){const s=spec.spine||[[0,'neutral']];let i=0;while(i<s.length-1&&lt>=s[i+1][0])i++;
  const cur=s[i][1],prev=i?s[i-1][1]:cur,k=i?eOut3(inv(s[i][0],s[i][0]+.6,lt)):1;
  const A=COL[prev].split(',').map(Number),B=COL[cur].split(',').map(Number);return {rgb:A.map((v,j)=>Math.round(lerp(v,B[j],k))).join(','),glow:(cur==='good'?k:0)+(prev==='good'?1-k:0)};}
function props(list,p){return (list||[]).map(pr=>{
  if(pr==='chair')return `<path d="M246 268 V500 M246 380 H364 M362 380 V500" stroke="#2A2A2A" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  if(pr==='desk')return `<path d="M400 300 H570 M548 300 V500" stroke="#2A2A2A" stroke-width="10" stroke-linecap="round"/><path d="M450 300 L470 236 H540 L522 300" fill="#fff" stroke="#2A2A2A" stroke-width="7" stroke-linejoin="round"/>`;
  if(pr==='floor')return `<path d="M50 532 H550" stroke="#2A2A2A" stroke-width="6" stroke-linecap="round" opacity=".5"/>`;
  if(pr==='mat')return `<rect x="70" y="528" width="460" height="12" rx="6" fill="#6C8EAD" opacity=".45"/>`;
  if(pr==='wall')return `<path d="M200 40 V532" stroke="#2A2A2A" stroke-width="8"/>`+[...Array(12)].map((_,i)=>`<path d="M200 ${60+i*40} l-24 22" stroke="#2A2A2A" stroke-width="4"/>`).join('');
  if(pr==='phone'){const d=nrm(sub(p.H,p.W));return `<rect x="-16" y="-28" width="32" height="56" rx="7" fill="#2A2A2A" transform="translate(${p.W[0]+6} ${p.W[1]-6}) rotate(${ang(d)+90})"/>`;}
  return '';}).join('');}
function drawFig(svg,spec,lt){const p=poseAt(spec,lt),c=ctrlOf(p);
  const shapes=[['line',p.P,p.K2,p.F2,40],['line',p.P,p.K,p.F,40],['torso',0,0,0,74],['line',p.N,p.H,null,30],['line',p.S,p.E,p.W,30]];
  const path=(s,w)=>s[0]==='torso'?`<path d="M${p.N} Q${c} ${p.P}" stroke-width="${w}"/>`:`<path d="M${s[1]} L${s[2]}${s[3]?' L'+s[3]:''}" stroke-width="${w}"/>`;
  let h=props(spec.props,p);
  h+=`<g fill="none" stroke="#2A2A2A" stroke-linecap="round" stroke-linejoin="round">${shapes.map(s=>path(s,s[4]+12)).join('')}<circle cx="${p.H[0]}" cy="${p.H[1]}" r="52" fill="#2A2A2A"/></g>`;
  h+=`<g fill="none" stroke="#E8DFD3" stroke-linecap="round" stroke-linejoin="round">${shapes.map(s=>path(s,s[4])).join('')}<circle cx="${p.H[0]}" cy="${p.H[1]}" r="46" fill="#E8DFD3" stroke="none"/></g>`;
  // мышцы
  (spec.muscles||[]).forEach(m=>{const a=anchor(p,m.at),k=spring(inv(m.t0||0,(m.t0||0)+.6,lt)*1.05);if(k<=0)return;const pulse=.5+.5*Math.sin(lt*7);
    const dir=m.at==='neck'?sub(p.H,p.N):m.at==='hip'?sub(p.K,p.P):m.at==='glute'?[1,0]:qtan(p,m.at==='lowerBack'?.8:.25);
    const rx=(m.rx||30)*clamp(k),ry=(m.ry||56)*clamp(k),rot=ang(dir)+90;
    const st=m.state==='tense'?`fill="rgba(196,139,124,${.45+.3*pulse})"`:m.state==='weak'?`fill="rgba(108,142,173,.12)" stroke="#6C8EAD" stroke-width="5" stroke-dasharray="10 9"`:`fill="rgba(108,142,173,${.5+.15*pulse})"`;
    h+=`<ellipse cx="${a[0]}" cy="${a[1]}" rx="${ry}" ry="${rx}" transform="rotate(${rot} ${a[0]} ${a[1]})" ${st}/>`;});
  // позвоночник: позвонки вдоль кривой + шейный отдел
  const sc=spineCol(spec,lt);let v='';const n=10;
  for(let i=0;i<n;i++){const u=(i+.5)/n,pt=qpt(p,u),tg=qtan(p,u);v+=`<rect x="-17" y="-10" width="34" height="20" rx="7" transform="translate(${pt[0]} ${pt[1]}) rotate(${ang(tg)+90})"/>`;}
  for(let i=1;i<=2;i++){const pt=add2(p.N,sub(p.H,p.N),i*.22),tg=nrm(sub(p.H,p.N));v+=`<rect x="-13" y="-8" width="26" height="16" rx="6" transform="translate(${pt[0]} ${pt[1]}) rotate(${ang(tg)+90})"/>`;}
  h+=`<g fill="rgba(${sc.rgb},.85)" stroke="#fff" stroke-width="3" style="filter:drop-shadow(0 0 ${14*sc.glow}px rgba(108,142,173,${.9*sc.glow}))">${v}</g>`;
  // стрелки
  (spec.arrows||[]).forEach(r=>{const k=eOut3(inv(r.t0||0,(r.t0||0)+.6,lt));if(k<=0)return;const a=add2(anchor(p,r.at),r.off||[0,0]),d=r.d,len=Math.hypot(d[0],d[1])*(r.grow?lerp(.6,1.15,eIO(inv(r.t0,r.t0+2,lt))):1),u=nrm(d);
    const e=add2(a,u,len*k),col=r.col||'#2A2A2A',nx=[-u[1],u[0]];
    h+=`<path d="M${add2(a,u,0)} L${e}" stroke="${col}" stroke-width="9" stroke-linecap="round"/><path d="M${add2(add2(e,u,-26),nx,16)} L${add2(e,u,6)} L${add2(add2(e,u,-26),nx,-16)}" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;});
  // подписи
  (spec.labels||[]).forEach(l=>{const k=spring(inv(l.t0||0,(l.t0||0)+.5,lt)*1.05);if(k<=0)return;const a=anchor(p,l.at),b=add2(a,l.off),w=l.text.length*19+40;
    h+=`<path d="M${a} L${b}" stroke="#2A2A2A" stroke-width="3" stroke-dasharray="6 6"/><circle cx="${a[0]}" cy="${a[1]}" r="7" fill="#2A2A2A"/>`+
      `<g transform="translate(${b[0]} ${b[1]}) scale(${clamp(k)})"><rect x="${-w/2}" y="-30" width="${w}" height="56" rx="28" fill="${l.dark?'#2A2A2A':'#fff'}" stroke="#2A2A2A" stroke-width="3"/><text y="10" text-anchor="middle" font-family="Montserrat" font-weight="700" font-size="32" fill="${l.dark?'#F3EEE7':'#2A2A2A'}">${l.text}</text></g>`;});
  svg.innerHTML=h;}

// ---------- иконки (viewBox 100)
const ICONS={clock:'<circle cx="50" cy="50" r="30"/><path d="M50 32 V50 L62 58"/>',
 walk:'<circle cx="54" cy="22" r="7"/><path d="M52 32 L46 56 L56 76 M46 56 L36 78 M50 40 L64 50 M50 40 L36 48"/>',
 stretch:'<circle cx="34" cy="28" r="7"/><path d="M36 38 L46 60 L76 74 M46 60 L28 78 M38 44 L60 36"/>',
 ball:'<circle cx="50" cy="54" r="28"/><path d="M26 44 Q50 60 74 44 M30 68 Q50 54 72 70"/>',
 screen:'<rect x="34" y="40" width="32" height="46" rx="6"/><path d="M28 24 Q50 8 72 24"/><circle cx="50" cy="22" r="4"/>',
 head:'<circle cx="50" cy="48" r="16"/><path d="M22 52 A28 28 0 0 1 30 28 M78 52 A28 28 0 0 0 70 28 M30 28 l-2 8 M30 28 l8 0 M70 28 l2 8 M70 28 l-8 0"/>',
 wind:'<path d="M20 38 H60 Q72 38 70 28 Q66 20 58 26 M20 54 H74 Q86 54 84 66 Q80 74 72 68 M20 70 H50"/>',
 wall:'<path d="M26 18 V84 M26 30 l-8 8 M26 50 l-8 8 M26 70 l-8 8"/><circle cx="58" cy="26" r="7"/><path d="M58 36 V64 L50 84 M58 64 L66 84 M58 42 L34 30"/>',
 band:'<rect x="22" y="38" width="56" height="24" rx="12"/><path d="M30 50 H70"/>',
 bridge:'<path d="M14 76 H88"/><circle cx="20" cy="66" r="6"/><path d="M28 70 Q48 40 66 48 L76 72"/>',
 cat:'<path d="M18 74 H86"/><path d="M28 74 V54 Q50 30 72 54 V74"/><circle cx="80" cy="52" r="6"/>',
 up:'<circle cx="50" cy="22" r="7"/><path d="M50 32 V60 M50 60 L40 82 M50 60 L60 82 M50 40 L32 30 M50 40 L68 30"/>'};

// ---------- сборка сцен
const stage=$('#stage'),SC={};
TL.forEach(([id,a,b])=>{const el=document.createElement('div');el.className='scene';stage.appendChild(el);SC[id]={el,a,b,d:b-a};});
function buildDiagram(s,spec){if(spec.card){const c=document.createElement('div');c.className='card';c.style.width=(spec.card.w||430)+'px';
    c.innerHTML=`<img src="${spec.card.src}"><div class="cap">${spec.card.cap}</div>`;s.el.appendChild(c);s.card=c;
    const cr=document.createElement('div');cr.className='credit';cr.textContent=spec.card.credit;s.el.appendChild(cr);s.credit=cr;}
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','fig');svg.setAttribute('viewBox','0 0 600 600');s.el.appendChild(svg);s.svg=svg;s.spec=spec;}
// крючок
SC.hook.text=textBlock(SC.hook.el,150,SP.hook.lines);SC.hook.hero=heroEl(SC.hook.el,SP.hook.hero);
// объяснение
['a','b'].forEach(k=>{const s=SC[k];s.text=textBlock(s.el,150,SP[k].lines);buildDiagram(s,SP[k]);});
// действия
SP.acts.forEach((ac,i)=>{const s=SC['act'+i];s.ac=ac;
  s.el.insertAdjacentHTML('beforeend',`<div class="badge">${i+1}</div><div class="ico"><svg viewBox="0 0 100 100">${ICONS[ac.icon]||''}</svg></div>`);
  s.badge=s.el.querySelector('.badge');s.ico=s.el.querySelector('.ico');
  s.text=textBlock(s.el,ac.top||330,ac.lines);
  if(ac.hero)s.hero=heroEl(s.el,ac.hero);if(ac.fig)buildDiagram(s,ac.fig);});
// клуб
SC.club.text=textBlock(SC.club.el,140,[['small','Онлайн-клуб'],['h2','*«Здоровая спина»*'],['mid','15 минут в день'],['chip','Напиши «СПИНА»'],['small','мне в личные сообщения']]);
SC.club.hero=heroEl(SC.club.el,SP.clubHero||'k20');
// дисклеймер
SC.disc.el.insertAdjacentHTML('beforeend',`<svg style="position:absolute;left:465px;top:560px" width="150" height="150" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#fff" stroke="#6C8EAD" stroke-width="5"/><path d="M50 28 V72 M28 50 H72" stroke="#6C8EAD" stroke-width="10" stroke-linecap="round"/></svg>`);
SC.disc.ico=SC.disc.el.lastElementChild;SC.disc.text=textBlock(SC.disc.el,760,SP.disc||[['mid','Если боль сильная'],['mid','или есть онемение,'],['mid','*обратись к врачу*']]);

// события звука
TL.forEach(([id,a])=>{if(a>0)EVENTS.push({t:a,type:'paper'});const s=SC[id];if(s.text)[...s.text.querySelectorAll('.w')].forEach((_,i)=>EVENTS.push({t:a+.1+i*(id==='disc'?.12:.22),type:'pop'}));});
EVENTS.push({t:SC.club.a+.1+3*.22,type:'chime'});

function layoutDiagram(s,lt,pos){const sp=s.spec;if(!s.svg)return;const k=spring(inv(.15,.85,lt)*1.05),out=inv(s.d-.3,s.d,lt);
  const box=pos||(s.card?{x:-30,y:640,size:780}:{x:60,y:620,size:960});
  s.svg.style.width=s.svg.style.height=box.size+'px';
  s.svg.style.transform=`translate(${box.x}px,${box.y+(1-clamp(k))*120}px)`;s.svg.style.opacity=clamp(k*3)*(1-out);
  drawFig(s.svg,sp,lt);
  if(s.card){const ck=spring(inv(.5,1.2,lt)*1.05);s.card.style.left=(sp.card.x||600)+'px';s.card.style.top=(sp.card.y||1080)+'px';
    s.card.style.transform=`translateX(${(1-clamp(ck))*500}px) rotate(${lerp(10,-3,clamp(ck))}deg)`;s.card.style.opacity=clamp(ck*3)*(1-out);s.credit.style.opacity=clamp(ck)*(1-out);}}

function seek(t){t=clamp(t,0,24.999);
  $('#sh1').style.transform=`translate(${-260+Math.sin(t*.4)*30}px,${880+Math.cos(t*.3)*20}px)`;
  $('#sh2').style.transform=`translate(${700+Math.sin(t*.5)*40}px,${520+Math.sin(t*.6)*30}px)`;
  $('#arcp').setAttribute('stroke-dashoffset',-t*40);
  for(const id in SC){const s=SC[id],vis=t>=s.a&&t<s.b;s.el.style.display=vis?'block':'none';if(!vis)continue;const lt=t-s.a;
    if(s.text)animWords(s.text,.1,lt,s.d,id==='disc'?.12:.22);
    if(id==='hook')placeHero(s.hero,lt,s.d,{from:SP.hook.from||'right',top:SP.hook.top||560,maxW:SP.hook.maxW});
    if(id==='a'||id==='b')layoutDiagram(s,lt);
    if(id.startsWith('act')){const k=spring(inv(0,.6,lt)*1.05),out=1-inv(s.d-.25,s.d,lt);
      s.badge.style.transform=`scale(${clamp(k,0,1.2)})`;s.badge.style.opacity=out;
      s.ico.style.transform=`scale(${clamp(spring(inv(.2,.8,lt)*1.05),0,1.2)}) rotate(${Math.sin(lt*2)*6}deg)`;s.ico.style.opacity=out;
      if(s.hero)placeHero(s.hero,lt,s.d,{from:s.ac.from||(id==='act1'?'left':'right'),top:s.ac.heroTop||660,maxW:s.ac.maxW,cx:s.ac.cx});
      if(s.svg)layoutDiagram(s,lt,s.ac.figBox||{x:60,y:640,size:960});}
    if(id==='club')placeHero(s.hero,lt,s.d,{from:'up',top:900,maxW:820});
    if(id==='disc'){const k=spring(inv(0,.6,lt)*1.05);s.ico.style.transform=`scale(${clamp(k,0,1.2)})`;}
  }
  $('#fade').style.opacity=inv(24.4,25,t);}
window.seek=seek;
Promise.all([document.fonts.load("800 50px Montserrat"),document.fonts.load("italic 600 50px 'Cormorant Garamond'"),document.fonts.load("700 50px Montserrat"),document.fonts.load("500 50px Montserrat"),document.fonts.ready,
  ...[...document.images].map(i=>i.decode())]).then(()=>{
  for(const id in SC){const s=SC[id];s.el.style.display='block';if(s.text)fitLines(s.text);s.el.style.display='none';}
  seek(0);window.READY=true;
  if(!new URLSearchParams(location.search).get('render')){const t0=performance.now();(function L(){seek(((performance.now()-t0)/1000)%25);requestAnimationFrame(L)})();}
});
