/* Три блока главной (3D-плитки, по макетам Ольги): цепочка атаки, как продукты работают вместе, путь к защите */
(()=>{
const {Stage,M4}=Tile3D,PI=Math.PI;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
const easeIn=u=>u*u*u,eio=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const DARK=[.24,.25,.29,1],DARK_S=[.1,.1,.12],FROST=[.84,.87,.92,1],FROST_S=[.66,.7,.78],RED_S=[.56,.025,.045];

/* Мир: 5 колонок с шагом 1 по оси x, пол y=0. Камера почти ортографическая, колонки совпадают с подписями */
const BETA=.55,GAP=1/Math.cos(BETA),H=.92*GAP,TH=.15*H,A=-PI/2;   // камера смотрит слева-спереди под углом BETA                    // высота плитки, толщина, поворот лицом к зрителю
const FOOT=TH;
const REST=Math.asin(clamp((GAP-FOOT)/H,0,1));   // угол, на котором плитка ложится на соседнюю
function camFor(st){const fov=.07,asp=st.asp||4,hw=5.8/asp,d=hw/(2*Math.tan(fov/2)),at=[0,hw*.5-.2,0],el=.07;
  return {fov,eye:[at[0]-Math.sin(BETA)*d*Math.cos(el),at[1]+Math.sin(el)*d,Math.cos(BETA)*d*Math.cos(el)],at}}
function tileM(i,ang){const x=(i-2)*GAP-.22,px=x+FOOT/2;
  return M4.chain(M4.T(px,0,0),M4.Rz(-ang),M4.T(-px,0,0),M4.T(x,H/2,0),M4.Ry(A),M4.S(H,H,H))}
function shadow(i,ang){const ext=H*Math.sin(ang);return {x:(i-2)*GAP-.22+ext/2,z:0,w:TH+.3+ext,d:H*.95,a:.2}}

function makeRow(id,draw){const row=document.getElementById(id),cv=row.querySelector('canvas'),st=new Stage(cv,TEX),spans=[...row.querySelectorAll('.bcols span')];return {row,st,spans,draw}}

/* Ряд 1: цепочка падает до конца, упавшие плитки «заражаются» красным */
function row1(R,p,t){const items=[],sh=[],c=p*5.6;
  for(let i=0;i<5;i++){const u=clamp(c-i);let a=REST*easeIn(u);
    if(i===4)a=1.25*easeIn(u);
    if(u>=1&&!reduce){const b=(c-i-1);a+=.035*Math.exp(-b*6)*Math.sin(b*18)}
    const inf=clamp((c-i-.6)*1.5);
    items.push({tex:'pt',shape:'square',solid:DARK,side:[lerp(DARK_S[0],.42,inf),lerp(DARK_S[1],.03,inf),lerp(DARK_S[2],.05,inf)],glow:inf*.55,M:tileM(i,a)});
    sh.push(shadow(i,a));R.spans[i].classList.toggle('on',u>.55)}
  R.st.draw(camFor(R.st),items,sh);R.row.classList.toggle('live',c>0)}

/* Ряд 2: письмо падает на плитку PT Email Gateway, она держит удар, остальные стоят */
function row2(R,p,t){const items=[],sh=[],c=p*5.6-.6;
  const u0=clamp(c),a0=REST*easeIn(u0);
  let wob=0,glow=0;if(c>1){const b=c-1;wob=reduce?0:.07*Math.exp(-b*3.5)*Math.sin(b*16);glow=Math.exp(-b*1.2)*.9+.25}
  items.push({tex:'pt',shape:'square',solid:DARK,side:DARK_S,M:tileM(0,a0+(c>1?wob*.6:0))});sh.push(shadow(0,a0));
  items.push({tex:'email',shape:'square',side:RED_S,glow,M:tileM(1,Math.max(0,wob))});sh.push(shadow(1,0));
  for(let i=2;i<5;i++){items.push({tex:'pt',shape:'square',solid:FROST,side:FROST_S,M:tileM(i,0)});sh.push(shadow(i,0))}
  R.st.draw(camFor(R.st),items,sh);
  R.spans.forEach((s,i)=>s.classList.toggle('on',i===0?u0>.55:c>1.15+(i-1)*.25));R.row.classList.toggle('live',c>0)}

const sec=document.getElementById('chain'),ROWS=[makeRow('r1',row1),makeRow('r2',row2)];
function prog(){const r=sec.getBoundingClientRect(),h=sec.offsetHeight-innerHeight;return clamp(-r.top/Math.max(1,h))}
function frame(ms){const p=prog(),t=ms/1000;
  ROWS[0].draw(ROWS[0],clamp(p/.55),t);ROWS[1].draw(ROWS[1],clamp((p-.45)/.5),t)}
Promise.all(ROWS.map(R=>R.st.ready)).then(()=>{const rs=()=>ROWS.forEach(R=>R.st.resize());rs();addEventListener('resize',rs);
    const io=new IntersectionObserver(es=>{vis=es[0].isIntersecting},{rootMargin:'100px'});let vis=true;io.observe(sec);
  (function loop(n){if(vis&&!window.__hold)frame(n);requestAnimationFrame(loop)})(0)});

})();
(()=>{
const {Stage,M4}=Tile3D,PI=Math.PI,TAU=PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
const eo=u=>1-Math.pow(1-u,3),eio=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2,back=u=>{const c=1.5;return 1+(c+1)*Math.pow(u-1,3)+c*Math.pow(u-1,2)};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,narrow=()=>innerWidth<820;
const FROST=[.97,.975,.99,1],FROST_S=[.72,.75,.82],DARK=[.2,.21,.25,1],DARK_S=[.3,.02,.04];

const sec=document.getElementById('tog'),cv=sec.querySelector('canvas'),lis=[...sec.querySelectorAll('.bsteps li')],tags=[...sec.querySelectorAll('.btag')];
const st=new Stage(cv,TEX);st.fog=[0,0,0,.45];st.fogR=[10,16];

/* Мир (вид сверху-спереди): слева два входа — Интернет и Почта, справа офис */
const LI=-1.05,LM=1.05,X0=-3.7,GX=-1.05,OX=1.85,XS=[3.75,.8,0];
const PCS=[[-.8,-.85],[0,-.85],[.8,-.85],[-.8,.85],[0,.85],[.8,.85]];
const laneZ=(z,x)=>x<.3?z:z*(1-eio(clamp((x-.3)/.8))*.2);
function cam(){return narrow()?{fov:.36,eye:[.35,6.2,8.4],at:[.35,-.1,.35]}:{fov:.36,eye:[.35,6.2,8.4],at:[.35,-.1,.35]}}
function project(VP,p){const x=VP[0]*p[0]+VP[4]*p[1]+VP[8]*p[2]+VP[12],y=VP[1]*p[0]+VP[5]*p[1]+VP[9]*p[2]+VP[13],w=VP[3]*p[0]+VP[7]*p[1]+VP[11]*p[2]+VP[15];return [x/w*.5+.5,1-(y/w*.5+.5)]}

function frame(ms){const t=reduce?0:ms/1000,items=[],sh=[];
  let p;if(narrow()){const r=sec.getBoundingClientRect();p=clamp((innerHeight*.8-r.top)/(innerHeight*1.4))}
  else{const r=sec.getBoundingClientRect(),h=sec.offsetHeight-innerHeight;p=clamp(-r.top/Math.max(1,h)*1.1)}
  if(reduce)p=1;
  // продукт k приземляется на отрезке прокрутки
  const land=[0,1,2,3].map(k=>clamp((p-.08-k*.2)/.12));
  const on=land.map(u=>u>=1);
  lis.forEach((li,k)=>li.classList.toggle('on',land[k]>.5));

  // дорожки входов из ромбов PT
  [LI,LM].forEach(z=>{const N=24;for(let k=0;k<N;k++){const x=lerp(X0,OX-1.25,k/(N-1)),s=.17;items.push({tex:'pt',shape:'diamond',M:M4.chain(M4.T(x,.01,laneZ(z,x)),M4.Rx(-PI/2),M4.S(s,s,s))})}});

  // офис: шесть плиток-компьютеров; заражение зависит от того, сколько входов закрыто
  const leak=on[0]&&on[1]?0:(on[0]||on[1]?.5:1);           // сколько угроз проходит внутрь
  const cure=on[2]?1:0;
  const scanX=on[3]?X0+((t*.3)%1.6)/1.6*(OX+1.2-X0):-9;
  PCS.forEach(([dx,dz],k)=>{const x=OX+dx,z=dz;
    const pulse=Math.max(0,Math.sin(t*2.2-k*.9));
    const inf=reduce?0:leak*(1-cure)*(.55+.45*pulse);
    const ring=cure?Math.exp(-Math.pow(((t*.7-Math.hypot(dx,dz)*.6)%1.4+1.4)%1.4-.25,2)*28)*.8:0;
    const flagged=on[3]&&k===5?clamp((scanX-(OX+.8))*3)*Math.max(0,Math.sin(PI*(((t*.3)%1.6)/1.6)))*1.4:0;
    const lit=Math.exp(-Math.pow((x-scanX)/.25,2))*.6;
    items.push({tex:'pt',shape:'square',solid:FROST,side:[lerp(FROST_S[0],.56,Math.max(inf,ring,flagged>0?1:0)),lerp(FROST_S[1],.03,Math.max(inf,ring)),lerp(FROST_S[2],.05,Math.max(inf,ring))],
      glow:inf*.5+ring*.35+flagged*.6+lit,M:M4.chain(M4.T(x,.28,z),M4.Ry(-.25),M4.S(.55,.55,.55))});
    sh.push({x:x+.03,z:z+.1,w:.6,d:.28,a:.15})});

  // угрозы на входах: тёмные плитки идут к офису; закрытый вход их останавливает
  const W=[0,0];
  [[LI,0,[0,.5]],[LM,1,[.25,.75]]].forEach(([z,gi,offs])=>offs.forEach(o=>{
    const d=((t/5.2+o)%1+1)%1,x=lerp(X0,OX-1.15,d);if(reduce)return;
    let px=x,py=.2,pz=laneZ(z,x),s=.26,alpha=1;
    if(on[gi]&&x>GX-.35){const k=clamp((x-(GX-.35))/1.2);
      if(gi===0){px=GX-.35-k*.9;py=.2+Math.sin(PI*Math.min(1,k*1.4))*.6-k*k*.4;pz=z-k*.9;s*=1-k*.7}
      else{px=GX-.35-k*.2;pz=z+k*1.15;py=.2+Math.sin(PI*k)*.45}
      W[gi]=Math.max(W[gi],Math.sin(PI*clamp(k*1.6)));if(gi===0&&k>.85)return}
    items.push({tex:'pt',shape:'square',solid:DARK,side:DARK_S,glow:.55,M:M4.chain(M4.T(px,py,pz),M4.Ry(-.3+d*3),M4.S(s,s,s))})}));
  // карантин почты
  if(on[1])for(let k=0;k<3;k++)items.push({tex:'pt',shape:'square',solid:DARK,side:DARK_S,glow:.2,M:M4.chain(M4.T(GX-.55,.03+k*.05,LM+1.2),M4.Ry(.25*k),M4.Rx(-PI/2),M4.S(.24,.24,.24))});

  // продукты: падают сверху и встают на место
  const prod=(k,tex,pos,s,yaw)=>{const u=land[k];if(u<=0)return;const q=reduce?1:back(u),bob=u>=1?Math.sin(t*1.3+k)*.03:0;
    const y=lerp(pos[1]+3.2,pos[1],eo(u))+bob,spin=(1-eo(u))*2.2;
    items.push({tex,shape:'square',glow:u<1?.3:(k===3?.25:0),M:M4.chain(M4.T(pos[0],y,pos[2]),M4.Ry(yaw+spin),M4.Rx(k===3?.35:0),M4.S(s*q,s*q,s*q))});
    sh.push({x:pos[0]+.05,z:pos[2]+.1,w:s*1.1,d:s*.5,a:.2*eo(u)})};
  prod(0,'ngfw',[GX,.55,LI],1.0,-.3);
  prod(1,'email',[GX,.55,LM],1.0,-.3);
  prod(2,'epp',[OX,.5,0],.8,-.25);
  prod(3,'xspider',XS,.8,-.2);
  if(on[3]&&scanX>-5)items.push({tex:'pt',shape:'square',solid:[1,.25,.25,1],side:[1,.1,.1],glow:1.2,M:M4.chain(M4.T(scanX,.03,0),M4.Rx(-PI/2),M4.S(.035,2.9,.02))});

  const C=cam();st.draw(C,items,sh);
  // подписи
  const VP=M4.mul(M4.persp(C.fov,st.asp||2,.1,50),M4.look(C.eye,C.at,[0,1,0])),Wd=cv.clientWidth,Hd=cv.clientHeight;
  const P={inet:[X0+.35,0,LI-.42],mail:[X0+.35,0,LM+.5],office:[OX,0,1.65],w1:[GX-.9,0,LI-.9],w2:[GX-.55,0,LM+1.65],w4:[XS[0],0,.95]};
  tags.forEach(el=>{const pp=project(VP,P[el.dataset.at]);el.style.transform=`translate(${pp[0]*Wd}px,${pp[1]*Hd}px) translate(-50%,-50%)`});
  const tg=k=>tags.find(e=>e.dataset.at===k);
  tg('w1').classList.toggle('on',W[0]>.2);tg('w2').classList.toggle('on',W[1]>.2);
  tg('w4').classList.toggle('on',on[3]&&Math.sin(PI*(((t*.35)%1.6)/1.6))>.4);
}
let vis=true;new IntersectionObserver(es=>vis=es[0].isIntersecting,{rootMargin:'150px'}).observe(sec);
st.ready.then(()=>{st.resize();addEventListener('resize',()=>st.resize());  (function loop(n){if(vis&&!window.__hold)frame(n);requestAnimationFrame(loop)})(0)});

})();
(()=>{
const {Stage,M4}=Tile3D,PI=Math.PI,TAU=PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
const eo=u=>1-Math.pow(1-u,3),back=u=>{const c=1.6;return 1+(c+1)*Math.pow(u-1,3)+c*Math.pow(u-1,2)};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow=()=>innerWidth<820;

/* Лица плиток шагов 1–4: красный лак и белая «стеклянная» цифра, рисуются в браузере */
function numberFace(n){const S=1024,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');
  let g=x.createLinearGradient(0,0,S,S);g.addColorStop(0,'#D8121F');g.addColorStop(.55,'#A00A14');g.addColorStop(1,'#6E0109');x.fillStyle=g;x.fillRect(0,0,S,S);
  g=x.createRadialGradient(S*.25,S*.18,0,S*.25,S*.18,S*.7);g.addColorStop(0,'rgba(255,120,120,.35)');g.addColorStop(1,'rgba(255,120,120,0)');x.fillStyle=g;x.fillRect(0,0,S,S);
  x.strokeStyle='rgba(255,170,170,.55)';x.lineWidth=14;x.beginPath();x.roundRect(46,46,S-92,S-92,120);x.stroke();
  x.font='600 600px Montserrat, system-ui, sans-serif';x.textAlign='center';x.textBaseline='middle';
  x.fillStyle='rgba(60,0,4,.55)';x.fillText(n,S/2+18,S/2+48);
  g=x.createLinearGradient(0,S*.2,0,S*.85);g.addColorStop(0,'#FFFFFF');g.addColorStop(1,'#D9DEE6');x.fillStyle=g;x.fillText(n,S/2,S/2+30);
  x.lineWidth=6;x.strokeStyle='rgba(255,255,255,.9)';x.strokeText(n,S/2,S/2+30);
  return c.toDataURL('image/jpeg',.9)}

const sec=document.getElementById('way'),cv=sec.querySelector('canvas'),lis=[...sec.querySelectorAll('.bsteps li')];
let st,ready=false;
(document.fonts?document.fonts.load('600 100px Montserrat'):Promise.resolve()).catch(()=>{}).then(()=>{
  const tex={pt:TEX.pt,n1:numberFace('1'),n2:numberFace('2'),n3:numberFace('3'),n4:numberFace('4')};
  st=new Stage(cv,tex);st.fog=[0,0,0,.5];st.fogR=[16,26];
  return st.ready}).then(()=>{ready=true;st.resize();addEventListener('resize',()=>st.resize());
  let wv=true;new IntersectionObserver(es=>wv=es[0].isIntersecting,{rootMargin:'150px'}).observe(sec);addEventListener('hashchange',()=>setTimeout(()=>st.resize(),60));(function loop(n){if(wv&&!window.__hold&&sec.offsetParent)frame(n);requestAnimationFrame(loop)})(0)});

/* Мир: колонки шагов по x с шагом GAP, пол y=0. Камера почти ортографическая, сверху-спереди */
function cam(){const asp=st.asp||4,cols=narrow()?5.4:5,hw=cols*1.16/asp,fov=.07,d=hw/(2*Math.tan(fov/2)),el=.46,at=[0,.5,0];
  return {fov,eye:[0,at[1]+Math.sin(el)*d,Math.cos(el)*d],at,cols}}
const pathZ=x=>.32*Math.sin(x*1.35+.6),pathY=0;
function frame(ms){if(!ready)return;const t=ms/1000,c=cam();st.fog=[0,0,0,narrow()?0:.5];
  let p;if(narrow()){const r=sec.getBoundingClientRect();p=clamp((innerHeight*.75-r.top)/(innerHeight*.9))}
  else{const r=sec.getBoundingClientRect(),h=sec.offsetHeight-innerHeight;p=clamp(-r.top/Math.max(1,h)*1.15)}
  if(reduce)p=1;
  const items=[],GAP=1,X0=-2.75,X1=2.75,head=lerp(X0,X1,p);
  // дорожка: мелкие ромбы PT выкладываются вслед за «головой»
  const NP=34;
  for(let k=0;k<NP;k++){const x=lerp(X0,X1,k/(NP-1)),u=clamp((head-x)/.35+1);if(u<=0)continue;
    const z=pathZ(x),drop=(1-eo(u))*.9,s=.2*eo(Math.min(1,u*1.4));
    items.push({tex:'pt',shape:'diamond',M:M4.chain(M4.T(x,.02+drop,z),M4.Ry(Math.atan(.32*1.35*Math.cos(x*1.35+.6))),M4.Rx(-PI/2+.0),M4.Rz(PI/4*0),M4.S(s,s,s))})}
  // плитки шагов: лежат лицом вниз, встают, когда к ним приходит дорожка
  for(let i=0;i<5;i++){const x=(i-2)*GAP-.13,z=pathZ(x),u=clamp((head-x+.15)/.5),k=reduce?1:back(u);
    const ang=lerp(-PI/2+.06,0,k),H=i===4?.74:.62,y=H/2*Math.cos(-ang)+.0,bob=u>=1?Math.sin(t*1.4+i)*.015:0;
    const pivot=M4.chain(M4.T(x,0,z-0),M4.Rx(ang),M4.T(0,H/2+bob,0));
    items.push({tex:i===4?'pt':'n'+(i+1),shape:i===4?'diamond':'square',glow:u>0&&u<1?.0:(u>=1?Math.max(0,.6-(head-x-.35)*.9):0),
      M:M4.chain(pivot,M4.Ry(-.18),M4.S(H,H,H))});
    lis[i].classList.toggle('on',u>.5)}
  // мягкие тени на полу
  const sh=[];for(let i=0;i<5;i++){const x=(i-2)*GAP-.13;sh.push({x:x+.05,z:pathZ(x)+.12,w:.75,d:.45,a:.18})}
  st.draw(c,items,sh);
}

})();