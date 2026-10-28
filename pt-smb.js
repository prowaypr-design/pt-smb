/* PT для SMB × PROWAY — скрипт сайта для Тильды. Подключается в head с defer после GSAP, ScrollTrigger и Lenis */
/* Общий JS: в Tilda — в «Настройки сайта → Ещё → HTML-код в конец body» */
(function(){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

/* Мобильное меню */
const head=$('.head'),burger=$('.burger');
if(burger)burger.addEventListener('click',()=>{const o=head.classList.toggle('open');burger.setAttribute('aria-expanded',o)});

/* Выпадающие меню: по клику и по наведению */
const dds=$$('.nav .dd');
function ddSet(o,d){(d?[d]:dds).forEach(x=>{const st=d?o:false;x.classList.toggle('open',st);x.querySelector('button').setAttribute('aria-expanded',st)})}
dds.forEach(dd=>{const b=dd.querySelector('button');b.setAttribute('aria-expanded','false');let t;
  b.addEventListener('click',e=>{e.stopPropagation();const o=!dd.classList.contains('open');ddSet(false);ddSet(o,dd)});
  dd.addEventListener('mouseenter',()=>{clearTimeout(t);if(matchMedia('(hover:hover)').matches){ddSet(false);ddSet(true,dd)}});
  dd.addEventListener('mouseleave',()=>{t=setTimeout(()=>ddSet(false,dd),200)})});
document.addEventListener('click',e=>{if(!e.target.closest('.nav .dd'))ddSet(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')ddSet(false)});
const ddb=dds[0]&&dds[0].querySelector('button');

/* Прототип: все страницы в одном файле, переключение по #странице */
const views=$$('.view'),CFG=window.VIEWCFG||{};
function route(name,scroll){
  if(!views.length)return false;
  const v=views.find(x=>x.dataset.view===name);if(!v)return false;
  views.forEach(x=>x.hidden=x!==v);
  const c=CFG[name]||{};document.title=c.title||document.title;{const md=document.querySelector('meta[name=description]');if(md&&c.desc)md.content=c.desc}
  if($('#ftitle')&&c.ft){$('#ftitle').textContent=c.ft;$('#flead').textContent=c.fl}
  const k=document.getElementById(c.kind==='xs'?'k-xs':'k-kp');if(k)k.checked=true;
  if($('#task'))$('#task').value=c.task||'';
  $$('.nav a').forEach(a=>{const h=a.getAttribute('href').slice(1);a.toggleAttribute('aria-current',h===name||(name==='stati-zamena-xspider'&&h==='stati'))});
  if(ddb)ddb.style.color=['produkty','pt-ngfw','xspider-pro','maxpatrol-epp','pt-email-gateway','pt-maze'].includes(name)?'#fff':'';
  ddSet(false);head&&head.classList.remove('open');
  if(dds[1])dds[1].querySelector('button').style.color=['kak-kupit','trebovaniya','uslugi','faq','glossariy'].includes(name)?'#fff':'';
  if(scroll!==false){if(window.__lenis)window.__lenis.scrollTo(0,{immediate:true});else scrollTo({top:0,behavior:'auto'})}
  if(typeof armView==='function')setTimeout(armView,30);
    return true}
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||a.dataset.task!==undefined)return;
  const name=a.getAttribute('href').slice(1);if(!name){e.preventDefault();return}
  if(CFG[name]){e.preventDefault();route(name);try{history.replaceState(null,'','#'+name)}catch(_){}}});
if(views.length){const h=location.hash.slice(1);if(!CFG[h]||!route(h,false))route('home',false)}
else{/* Тильда: каждая страница отдельная, видов нет */setTimeout(()=>{try{armView()}catch(e){}},0)}
/* Кнопки с data-task → тип заявки и задача в форме этой страницы */
const task=$('#task');
function prefill(v,extra){
  if(!$('#zayavka'))return;
  const kind=v==='xs'?'k-xs':v==='pilot'?'k-pilot':'k-kp';
  const k=document.getElementById(kind);if(k)k.checked=true;
  if(task&&v&&!['kp','xs','pilot'].includes(v))task.value=v;
  if(extra&&$('#comment'))$('#comment').value=extra;
  $('#zayavka').scrollIntoView({behavior:reduce?'auto':'smooth'});
  if(task){task.classList.remove('flash');void task.offsetWidth;task.classList.add('flash')}}
$$('[data-task]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();prefill(b.dataset.task)}));
/* По умолчанию задача формы — продукт страницы */
const pageTask=document.body.dataset.task;if(task&&pageTask)task.value=pageTask;

/* Сколько дней до конца продаж XSpider 7.8 */
const end=new Date('2026-12-31T23:59:59+03:00');
function plural(n){const a=n%10,b=n%100;return a===1&&b!==11?'день':a>=2&&a<=4&&(b<12||b>14)?'дня':'дней'}
const dleft=Math.max(0,Math.ceil((end-Date.now())/864e5));
$$('[data-days]').forEach(b=>b.textContent=dleft+' '+plural(dleft));

/* Подбор пакета SMB: объём 100/150/200/250 по большему из устройств и ящиков */
const pc=$('#pc');
if(pc){
  const mb=$('#mb'),crate=$('#crate'),note=$('#note');let last='';
  const add=(k,b,s)=>{let m=crate.querySelector('[data-k="'+k+'"]');
    if(!m){m=document.createElement('div');m.className='mod';m.dataset.k=k;m.innerHTML='<b></b><span></span>';crate.appendChild(m)}
    m.querySelector('b').textContent=b;m.querySelector('span').textContent=s};
  function calc(){const n=+pc.value,m=+mb.value,need=Math.max(n,m);$('#pcv').textContent=n;$('#mbv').textContent=m;
    const fv=($('input[name=fwv]:checked')||{}).value||'Виртуальный',fm=($('input[name=fwm]:checked')||{}).value||'GW-1010';
    const tier=[100,150,200,250].find(t=>t>=need);
    if(!tier){crate.innerHTML='';$('#tierttl').textContent='Больше 250 — отдельные лицензии';
      note.textContent='Пакеты SMB рассчитаны на объёмы до 250. Соберём решение из отдельных лицензий: MaxPatrol EPP до 499 агентов, PT Email Gateway до 500 ящиков, XSpider PRO по числу IP.';
      last='Устройств: '+n+', ящиков: '+m+'. Нужны отдельные лицензии.';return}
    $('#tierttl').textContent='Пакет объёмом '+tier;
    add('epp','MaxPatrol EPP',tier+' агентов');add('mail','PT Email Gateway',tier+' почтовых ящиков');add('xs','XSpider PRO','Pentest на '+tier+' IP');
    add('fw','PT NGFW '+fm,fv==='ПАК'?'программно-аппаратный комплекс':'виртуальный шлюз');add('mg','Управление и поддержка NGFW','система управления, сертификат техподдержки');
    note.textContent=need<tier?'Объём пакета округлён вверх до '+tier+'. Состав пакета фиксированный, все лицензии на 1 год.':'Все лицензии на 1 год, состав пакета фиксированный.';
    last='Пакет SMB объёмом '+tier+' (устройств: '+n+', ящиков: '+m+'), NGFW '+fm+', '+fv.toLowerCase()}
  [pc,mb].forEach(i=>i.addEventListener('input',calc));$$('#fwopt input').forEach(i=>i.addEventListener('change',calc));calc();
  $('#recbtn').addEventListener('click',e=>{e.preventDefault();if($('#nodes'))$('#nodes').value=pc.value;prefill('pack',last)});
}


/* ===== Движение и графика (GSAP 3 + ScrollTrigger) =====
   Правила: появление — ease-out (power3.out), падение — ускорение (power2.in), прокрутка — scrub без easing.
   Анимируем только transform и opacity. При prefers-reduced-motion всё отключается. */
const RM=reduce;
let mx=0,my=0;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
/* 1. Расшифровка заголовков: буквы проявляются в случайном порядке */
const GL='АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789#%&<>/=+';
function scramble(el){if(RM||el.dataset.done)return;const t=el.textContent;if(!t.trim()||el.children.length)return;el.dataset.done=1;
  el.setAttribute('aria-label',t);const n=t.length,order=[...Array(n).keys()].sort(()=>Math.random()-.5),pos=new Array(n).fill(false);
  const dur=Math.min(900,300+n*12),t0=performance.now();
  (function f(now){const k=Math.floor(Math.min(1,(now-t0)/dur)*n);for(let i=0;i<k;i++)pos[order[i]]=true;
    let o='';for(let i=0;i<n;i++){const c=t[i];o+=pos[i]||c===' '||c==='\n'?c:GL[Math.random()*GL.length|0]}
    el.textContent=o;if(k<n)requestAnimationFrame(f);else el.textContent=t})(t0)}
/* 6. PT MAZE: код приложения превращается в нечитаемый — обфускация */
const HEX='0123456789abcdef{}();=<>/*+-_$';
function mazes(){document.querySelectorAll('canvas.maze').forEach(cv=>{if(cv._on)return;cv._on=1;
  const ctx=cv.getContext('2d'),dpr=Math.min(2,devicePixelRatio||1);let W,H,cols,rows,grid,cs;
  const mini=cv.hasAttribute('data-mini');
  function size(){const r=cv.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    cs=mini?9:13;cols=Math.floor(W/cs);rows=Math.floor(H/(cs*1.25));grid=[...Array(cols*rows)].map(()=>({c:HEX[Math.random()*HEX.length|0],o:0}))}
  size();addEventListener('resize',size);
  let t=0;
  function draw(){if(cv.closest('.view')&&cv.closest('.view').hidden){requestAnimationFrame(draw);return}
    t+=RM?0:1;ctx.fillStyle='#0B0B0D';ctx.fillRect(0,0,W,H);
    const pw=mini?W*.36:W*.46,ph=mini?H*.86:H*.84,px=(W-pw)/2,py=(H-ph)/2,rad=mini?10:28;
    const scan=py+((t*(mini?.6:1.1))%(ph+80))-40;
    ctx.font='500 '+(cs-1)+'px JetBrains Mono, monospace';ctx.textBaseline='top';
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const g=grid[y*cols+x],X=x*cs,Y=y*cs*1.25;
      const inside=X>px+4&&X<px+pw-cs&&Y>py+18&&Y<py+ph-24;if(!inside)continue;
      if(Math.random()<.02)g.c=HEX[Math.random()*HEX.length|0];
      if(Y<scan){ctx.fillStyle='rgba(255,40,40,.85)';ctx.fillRect(X+1,Y+2,cs-3,cs-3)}
      else{ctx.fillStyle=Math.abs(Y-scan)<cs*2?'#fff':'#5C6370';ctx.fillText(g.c,X,Y)}}
    ctx.strokeStyle='#C9CED8';ctx.lineWidth=mini?1.5:2;ctx.beginPath();ctx.roundRect(px,py,pw,ph,rad);ctx.stroke();
    ctx.fillStyle='#FF0000';ctx.fillRect(px+4,scan,pw-8,2);
    requestAnimationFrame(draw)}
  draw()})}
/* 7. «Живые» рендеры: картинка режется на мягкие полосы вдоль потока,
   каждая полоса покачивается со своей фазой, по глянцу пробегает блик, курсор даёт параллакс.
   Работает с любым рендером на чёрном фоне. */
function renders(){document.querySelectorAll('canvas.render').forEach(cv=>{if(cv._r)return;cv._r=1;
  const img=new Image();img.crossOrigin='anonymous';img.onload=()=>start(cv,img);img.src=cv.dataset.render})}
function start(cv,img){
  const ctx=cv.getContext('2d'),[ax,ay]=(cv.dataset.axis||'0.8,0.6').split(',').map(Number),L=Math.hypot(ax,ay),dx=ax/L,dy=ay/L,nx=-dy,ny=dx;
  const N=+cv.dataset.bands||8,W=img.naturalWidth,H=img.naturalHeight;
  // проекции углов на ось потока
  const us=[[0,0],[W,0],[0,H],[W,H]].map(([x,y])=>x*dx+y*dy),u0=Math.min(...us),u1=Math.max(...us),step=(u1-u0)/(N-1);
  const base=document.createElement('canvas');base.width=W;base.height=H;const bc=base.getContext('2d');bc.drawImage(img,0,0);
  const src=bc.getImageData(0,0,W,H).data,bands=[];
  for(let i=0;i<N;i++){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),id=x.createImageData(W,H),d=id.data,ci=u0+i*step;
    for(let y=0;y<H;y++)for(let X=0;X<W;X++){const k=(y*W+X)*4,u=X*dx+y*dy,w=Math.max(0,1-Math.abs(u-ci)/step);if(!w)continue;
      d[k]=src[k]*w;d[k+1]=src[k+1]*w;d[k+2]=src[k+2]*w;d[k+3]=255}
    x.putImageData(id,0,0);bands.push(c)}
  const sw=document.createElement('canvas'),sx=sw.getContext('2d');
  let cw,ch,dpr,sc,ox,oy;
  function size(){const r=cv.getBoundingClientRect();dpr=Math.min(2,devicePixelRatio||1);cw=Math.max(1,r.width);ch=Math.max(1,r.height||r.width*H/W);
    cv.width=cw*dpr;cv.height=ch*dpr;sw.width=cv.width;sw.height=cv.height;sc=Math.max(cw/W,ch/H)*1.06;ox=cv.dataset.fit==='bleed'?(cw-W*sc)*0.85:(cw-W*sc)/2;oy=(ch-H*sc)/2}
  size();addEventListener('resize',size);
  const t0=performance.now();let px=0,py=0;
  (function frame(now){const v=cv.closest('.view');if(v&&v.hidden){requestAnimationFrame(frame);return}
    const r=cv.getBoundingClientRect();if(r.bottom<-50||r.top>innerHeight+50){requestAnimationFrame(frame);return}
    const t=RM?0:(now-t0)/1000;px+=(mx-px)*.06;py+=(my-py)*.06;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,cw,ch);
    ctx.globalCompositeOperation='lighter';
    bands.forEach((b,i)=>{const ph=t*1.1-i*.75,a=RM?0:5.5*Math.sin(ph),depth=(i-(N-1)/2)/(N-1);
      const ex=nx*a+dx*a*.35+px*26*depth,ey=ny*a+dy*a*.35+py*18*depth;ctx.drawImage(b,ox+ex,oy+ey,W*sc,H*sc)});
    if(!RM){// блик: узкая полоса бежит вдоль потока, светит только там, где есть глянец
      const p=((t*.18)%1.6-.3),cxp=ox+(u0+(u1-u0)*p)*dx*sc,cyp=oy+(u0+(u1-u0)*p)*dy*sc;
      sx.setTransform(dpr,0,0,dpr,0,0);sx.globalCompositeOperation='source-over';sx.clearRect(0,0,cw,ch);
      const g=sx.createLinearGradient(cxp-dx*90,cyp-dy*90,cxp+dx*90,cyp+dy*90);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');
      sx.fillStyle=g;sx.fillRect(0,0,cw,ch);sx.globalCompositeOperation='source-in';sx.drawImage(base,ox,oy,W*sc,H*sc);
      ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.6;ctx.drawImage(sw,0,0,cw,ch);ctx.globalAlpha=1}
    requestAnimationFrame(frame)})(t0)}


const G=window.gsap,ST=window.ScrollTrigger;
if(G&&ST)G.registerPlugin(ST);
let routeT=0;

/* Первый экран страницы: крошки, подпись, текст, кнопки, шильдик и рендер появляются по очереди */
function intro(view){view=view||document.querySelector('.pw');if(!G||RM||!view)return;view=document;
  const st=view.querySelector('.stage');if(!st)return;
  const tl=G.timeline({defaults:{ease:'power3.out',duration:.8}});
  const bits=[...st.querySelectorAll('.crumbs,.eyebrow,.lead,.ctas,.plate')];
  tl.from(bits,{y:18,opacity:0,stagger:.08,clearProps:'transform,opacity'},.15);
  const art=st.querySelector('.art.bleed canvas, .art canvas, .art img');
  if(art)tl.from(art,{opacity:0,scale:1.06,duration:1.4,ease:'power2.out',clearProps:'opacity,scale'},0)}

function armView(){const v=document.querySelector('.view:not([hidden])');
  /* h1 без «расшифровки»: у PT заголовки просто появляются */
  mazes();renders();intro(v);routeT=performance.now();
  if(ST)requestAnimationFrame(()=>ST.refresh())}

function setupMotion(){if(!G||!ST)return;
 G.matchMedia().add('(prefers-reduced-motion: no-preference)',()=>{

  /* Карточки, плитки, шаги: всплывают группами, когда доходят до экрана. Видимые при открытии страницы не трогаем */
  ST.batch('.tasks>a,.feats>div,.steps:not(.pics)>li,.steps.pics>li,.posts>a,.index>a,.unit,.prow,.also>a,.faq details,.models figure,.media-pic,.plate-wide,.say-stats>div',{
    start:'top 90%',once:true,
    onEnter:b=>{if(performance.now()-routeT<400)return;
      G.from(b,{y:28,opacity:0,duration:.7,ease:'power3.out',stagger:.07,overwrite:true,clearProps:'transform,opacity'})}});

  /* Счётчики 18% и 54% */
  document.querySelectorAll('[data-count]').forEach(el=>ST.create({trigger:el,start:'top 85%',once:true,
    onEnter:()=>G.from(el,{textContent:0,duration:1.4,ease:'power2.out',snap:{textContent:1}})}));

  /* Абзац «загорается» по словам при прокрутке */
  const say=document.querySelector('[data-say]');
  if(say){say.innerHTML=say.textContent.trim().split(/\s+/).map(w=>'<span class="w">'+w+'</span>').join(' ');
    G.fromTo(say.querySelectorAll('.w'),{color:'#9FA9B8'},{color:'#212121',ease:'none',stagger:.1,
      scrollTrigger:{trigger:say,start:'top 78%',end:'bottom 45%',scrub:1}})}

  /* Рендеры на тёмных экранах уходят вверх медленнее страницы — глубина */
  document.querySelectorAll('.art.bleed').forEach(a=>G.to(a,{yPercent:14,ease:'none',
    scrollTrigger:{trigger:a.closest('section'),start:'top top',end:'bottom top',scrub:true}}));

  /* Путь PROWAY: линия рисуется прокруткой, плитки встают по одной */
  const way=document.querySelector('[data-way]');
  if(way){const tiles=way.querySelectorAll('.wtile'),fg=way.querySelector('.fg');
    const tl=G.timeline({scrollTrigger:{trigger:way,start:'top 75%',end:'bottom 55%',scrub:1}});
    fg.setAttribute('stroke-dasharray','1 1');tl.fromTo(fg,{attr:{'stroke-dashoffset':1}},{attr:{'stroke-dashoffset':0},ease:'none',duration:1},0);
    tiles.forEach((t,i)=>tl.fromTo(t,{rotationX:78,backgroundColor:'#212121'},{rotationX:0,backgroundColor:'#1F6FD1',duration:.16,ease:'back.out(1.7)'},i*.2))}

  /* Цепочка домино: импульс атаки → плитки падают с ускорением; во втором ряду плитка PT держит удар */
  const chain=document.querySelector('[data-chain]');
  if(chain){const rows=[...chain.querySelectorAll('.tiles')];
    rows.forEach(r=>{if(!r.querySelector('.impulse')){const d=document.createElement('span');d.className='impulse';d.setAttribute('aria-hidden','true');r.appendChild(d)}});
    const tl=G.timeline({paused:true,repeat:-1,repeatDelay:1.2});
    const play=(row,hold)=>{const slabs=[...row.querySelectorAll('.slab')],imp=row.querySelector('.impulse');
      const s0=slabs[0].getBoundingClientRect(),rr=row.getBoundingClientRect();
      tl.fromTo(imp,{x:-40,opacity:0},{x:s0.left-rr.left-14,opacity:1,duration:.55,ease:'power2.in'});
      tl.to(imp,{opacity:0,duration:.15},'>');
      if(!hold){slabs.forEach((s,i)=>tl.to(s,{rotation:i===slabs.length-1?88:58,duration:.42,ease:'power2.in',transformOrigin:'100% 100%'},i?'<0.26':'<'))}
      else{const stop=row.querySelector('.stop .slab');
        tl.to(slabs[0],{rotation:30,duration:.32,ease:'power2.in',transformOrigin:'100% 100%'},'<');
        tl.to(stop,{rotation:7,duration:.1,ease:'power2.out',transformOrigin:'100% 100%'},'>');
        tl.to(stop,{rotation:0,duration:.9,ease:'elastic.out(1,0.35)'},'>');
        tl.fromTo(stop,{boxShadow:'0 0 0 2px #FF0000, 0 0 24px rgba(255,0,0,.45)'},{boxShadow:'0 0 0 2px #FF0000, 0 0 52px rgba(255,0,0,.95)',duration:.25,yoyo:true,repeat:1},'<')}
      return slabs};
    let built=false;const build=()=>{if(built)return;built=true;
      const a=play(rows[0],false);tl.addLabel('second','+=.5');const b=play(rows[1],true);
      tl.to({}, {duration:1.4});
      tl.to([...a,...b],{rotation:0,duration:.5,ease:'power3.out',stagger:{each:.06,from:'end'}})};
    ST.create({trigger:chain,start:'top 70%',end:'bottom 20%',
      onEnter:()=>{build();tl.play()},onEnterBack:()=>{build();tl.play()},onLeave:()=>tl.pause(),onLeaveBack:()=>tl.pause()})}

  /* Плитки защиты: блок закрепляется, прокрутка листает пять продуктов (как предмет на SharpLink) */
  const reel=document.querySelector('[data-reel]');
  if(reel){const mm2=G.matchMedia();
    mm2.add('(min-width: 961px)',()=>{
      const imgs=[...reel.querySelectorAll('.reel-stage img')],lis=[...reel.querySelectorAll('.reel-steps li')],bar=reel.querySelector('.reel-bar i'),n=imgs.length;
      G.set(imgs,{opacity:0,scale:1.12,rotation:-4});G.set(imgs[0],{opacity:1,scale:1,rotation:0});
      const tl=G.timeline({defaults:{ease:'power2.inOut'},scrollTrigger:{trigger:reel,start:'top top',end:'+='+(n*90)+'%',pin:reel.querySelector('.reel-pin'),scrub:1,anticipatePin:1,
        snap:{snapTo:1/(n-1),duration:{min:.2,max:.6},ease:'power1.inOut'},
        onUpdate:s=>{const k=Math.round(s.progress*(n-1));lis.forEach((li,i)=>li.classList.toggle('on',i===k))}}});
      tl.to(bar,{scaleX:1,ease:'none',duration:n-1},0);
      for(let i=1;i<n;i++){tl.to(imgs[i-1],{opacity:0,scale:.9,rotation:5,yPercent:-6,duration:.6},i-1+.2)
        .to(imgs[i],{opacity:1,scale:1,rotation:0,yPercent:0,duration:.6},i-1+.35)}
      lis[0].classList.add('on');
      return()=>{G.set(imgs,{clearProps:'all'});lis.forEach(l=>l.classList.remove('on'))}});
  }

  /* Заголовки разделов: слова выезжают из-под маски, один раз */
  document.querySelectorAll('h2.h2').forEach(h=>{if(h.closest('.stage')&&!h.closest('.reel'))return;
    const t=h.textContent.trim();h.setAttribute('aria-label',t);
    h.innerHTML=t.split(/\s+/).map(w=>'<span class="wm" aria-hidden="true"><span class="wi">'+w+'</span></span>').join(' ');
    ST.create({trigger:h,start:'top 88%',once:true,onEnter:()=>{if(performance.now()-routeT<400)return;
      G.from(h.querySelectorAll('.wi'),{yPercent:115,duration:.85,ease:'power4.out',stagger:.045})}})});

  /* Большое слово в подвале: буквы поднимаются из-под линии */
  const gw=document.querySelector('[data-giant]');
  if(gw){gw.querySelectorAll('span').forEach(sp=>{sp.innerHTML=[...sp.textContent].map(c=>c===' '?'<b class="gl">&nbsp;</b>':'<b class="gl">'+c+'</b>').join('')});
    ST.create({trigger:gw,start:'top 95%',once:true,onEnter:()=>G.from(gw.querySelectorAll('.gl'),{yPercent:105,duration:1,ease:'power4.out',stagger:.035})})}

 })}
setupMotion();

/* Плавная прокрутка (Lenis) в связке со ScrollTrigger */
if(window.Lenis&&G&&ST&&!RM){const lenis=new Lenis({duration:1.1,easing:t=>1-Math.pow(1-t,4),smoothWheel:true});
  lenis.on('scroll',ST.update);G.ticker.add(t=>lenis.raf(t*1000));G.ticker.lagSmoothing(0);window.__lenis=lenis;
  document.addEventListener('click',e=>{const a=e.target.closest('a[href="#zayavka"],a[href="#sravnenie"],a[href="#podbor"]');if(a){e.preventDefault();lenis.scrollTo(a.getAttribute('href'),{offset:-70})}},true)}

/* Подсветка карточек под курсором (как на Raycast) */
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  document.addEventListener('pointermove',e=>{const c=e.target.closest('.glow');if(!c)return;const r=c.getBoundingClientRect();
    c.style.setProperty('--gx',(e.clientX-r.left)+'px');c.style.setProperty('--gy',(e.clientY-r.top)+'px')},{passive:true})}
document.querySelectorAll('.tasks>a,.unit,.also>a,.index>a,.feats>div,.posts>a,.reel-steps li').forEach(el=>el.classList.add('glow'));
setTimeout(armView,30);

/* Копирование почты */
const cp=$('#copy');
if(cp)cp.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('security@proway.tech');cp.textContent='Адрес скопирован'}catch(_){const r=document.createRange();r.selectNodeContents($('#mail'));const s=getSelection();s.removeAllRanges();s.addRange(r);cp.textContent='Адрес выделен, нажмите Ctrl+C'}});

/* Форма (в прототипе не отправляется) */
const f=$('#f');
const MSG={'f-name':'Укажите имя, чтобы специалист знал, к кому обращаться.','f-co':'Укажите компанию — от неё зависит состав предложения.','f-mail':'Укажите рабочую почту, на неё придёт предложение.','f-agree':'Без согласия на обработку данных мы не сможем ответить на запрос.'};
if(f)Object.keys(MSG).forEach(id=>{const el=document.getElementById(id);if(!el)return;
  const chk=()=>{el.setCustomValidity('');if(!el.validity.valid){el.setCustomValidity(id==='f-mail'&&el.value?'Проверьте адрес почты: в нём должен быть знак @ и домен.':MSG[id])}};
  el.addEventListener('invalid',chk);el.addEventListener('input',()=>el.setCustomValidity(''));el.addEventListener('change',()=>el.setCustomValidity(''))});
if(f)f.addEventListener('submit',e=>{e.preventDefault();if(!f.checkValidity()){f.reportValidity();return}
  f.innerHTML='<div class="done">Запрос отправлен. Специалист PROWAY ответит в течение рабочего дня на указанную почту.</div>'});
})();
