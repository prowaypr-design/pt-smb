/* 3D-плитки продуктов PT: сцены прокрутки (по products.html Ольги). Нужны tile3d.js и tex.js */
(function(){
const {Stage,M4,buildSlice}=Tile3D,TAU=Math.PI*2,PI=Math.PI;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
const ease=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2,eo=u=>1-Math.pow(1-u,3);
const reduceM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FROST=[.975,.98,.99,1],FROST_SIDE=[.78,.8,.85],RED_SIDE=[.56,.025,.045];
function sceneOf(sec,render){const cv=sec.querySelector('canvas'),st=new Stage(cv,SUBTEX(sec.dataset.scene)),lis=[...sec.querySelectorAll('.sc-steps li')];
  return {sec,cv,st,lis,render,p:0}}
const narrow=()=>innerWidth<820;
const cam=()=>narrow()?{fov:.62,eye:[0,.25,6.4],at:[0,.7,0]}:{fov:.5,eye:[0,.15,6.2],at:[-1.2,0,0]};

/* поворот, у которого локальная ось z смотрит вдоль f */
function basis(f,roll=0){let z=f.slice();let l=Math.hypot(...z);z=z.map(v=>v/l);let up=[0,1,0];
  let x=[up[1]*z[2]-up[2]*z[1],up[2]*z[0]-up[0]*z[2],up[0]*z[1]-up[1]*z[0]];l=Math.hypot(...x)||1;x=x.map(v=>v/l);
  const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
  return M4.mul([x[0],x[1],x[2],0,y[0],y[1],y[2],0,z[0],z[1],z[2],0,0,0,0,1],M4.Rz(roll))}
const smooth=(a,b,u)=>a+(b-a)*ease(clamp(u));
const sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mix3=(a,b,u)=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];

/* ---------- PT NGFW: одна плитка разворачивается в длинную ленту, лента змейкой летит из глубины ---------- */
function ribbonRaw(s,t){return [lerp(-2.8,1.7,s)+.3*Math.sin(TAU*s*1.2+t*.25),.65*Math.sin(TAU*s*1.05+.9)-.05+.12*Math.sin(t*.4),lerp(-7,.6,Math.pow(s,1.3))]}
let ARC=null;function arcTab(t){const n=200,pts=[],L=[0];for(let i=0;i<=n;i++)pts.push(ribbonRaw(i/n,t));for(let i=1;i<=n;i++)L.push(L[i-1]+Math.hypot(...sub3(pts[i],pts[i-1])));return {L,tot:L[n],n}}
function ribbon(u,t){const A=arcTab(t),target=clamp(u)*A.tot;let lo=0,hi=A.n;while(hi-lo>1){const m=(lo+hi)>>1;A.L[m]<target?lo=m:hi=m}
  const f=(target-A.L[lo])/Math.max(1e-6,A.L[hi]-A.L[lo]);return ribbonRaw((lo+f)/A.n,t)}
function ngfw(S,p,t){const st=S.st,items=[],N=20,camE=cam().eye;
  const unspool=ease(clamp((p-.1)/.5)),flow=reduceM?0:t*.025;
  const head=.62,tt=Math.floor(t*10)/10;
  for(let k=0;k<N;k++){
    const sK=((k/N)+flow)%1;
    const sp=lerp(head,sK,unspool);
    const nm=q=>narrow()?[q[0]*.5,q[1]*.6+1.55,q[2]]:q;
    const pos=nm(ribbon(sp,tt)),ahead=nm(ribbon(Math.min(1,sp+.008),tt)),tan=sub3(ahead,pos);
    const toCam=sub3(camE,pos);const f=mix3(tan.map(v=>v/Math.max(1e-6,Math.hypot(...tan))),toCam.map(v=>v/Math.hypot(...toCam)),.8);
    let sc=narrow()?.38:.5;
    if(p<.1){ if(k>0)continue; sc=.8 }
    const spinOne=p<.1?Math.sin(t*1.1)*.7:0;
    items.push({tex:'ngfw',shape:'square',M:M4.chain(M4.T(...pos),basis(f,Math.sin(sK*TAU*2+t*.3)*.3),M4.Ry(spinOne),M4.S(sc,sc,sc))})}
  drawS(st,items);
  return Math.min(S.lis.length-1,Math.floor(clamp((p-.05)/.85)*S.lis.length));
}

/* ---------- PT Email Gateway: плитки разматываются из одной и собираются во вращающееся кольцо ---------- */
function email(S,p,t){const st=S.st,items=[],N=14,R=narrow()?.68:.98;const off=narrow()?[0,.95,0]:[0,0,0];
  const u=clamp((p-.08)/.55),spin=reduceM?0:t*.22+clamp((p-.6)/.4)*1.2;
  const tilt=M4.chain(M4.T(...off),M4.Rx(.42+.12*Math.sin(t*.3)),M4.Ry(-.45+.2*Math.sin(t*.23)));
  for(let k=N-1;k>=0;k--){
    const uk=clamp(u*1.15-(k/N)*.15);
    const ang=-PI/2+spin*ease(clamp((p-.55)/.2))+(TAU*k/N)*ease(uk);
    const r=R*lerp(.55,1,ease(uk));
    const lift=(1-ease(uk))*-.0;
    const P=[Math.cos(ang)*r,Math.sin(ang)*r+lift,0];
    const sc=narrow()?.29:.4;
    items.push({tex:'email',shape:'square',M:M4.chain(tilt,M4.T(...P),M4.Rz(ang+PI/2),M4.Rx(-.42),M4.Ry(.3*Math.sin(ang*2+t*.6)),M4.S(sc,sc,sc))})}
  drawS(st,items);
  return Math.min(S.lis.length-1,Math.floor(clamp((p-.05)/.85)*S.lis.length));
}

/* ---------- MaxPatrol EPP: ряд плиток уходит вглубь, потом плитки взлетают и раскрываются цветком ---------- */
function epp(S,p,t){const st=S.st,items=[],N=9;const off=narrow()?[0,.9,0]:[0,0,0];
  const inRow=clamp(p/.3),toFlower=clamp((p-.35)/.35),turn=reduceM?0:t*.18+clamp((p-.7)/.3)*.9;
  for(let k=N-1;k>=0;k--){
    // поза 1: ряд, уходящий в глубину, плитки встают по очереди
    const ap=ease(clamp(inRow*1.6-k*.07));
    const row={pos:[-.9+k*.32,-.15+(1-ap)*-2.2,-k*.95+1],yaw:-1.05,pitch:0,roll:0,sc:.62};
    // поза 2: цветок — плитки веером вокруг центра
    const ph=TAU*k/N+turn;
    const FR=narrow()?.6:.86;const fl={pos:[Math.cos(ph)*FR,Math.sin(ph)*FR,Math.sin(ph*2+t*.5)*.08],yaw:.35*Math.cos(ph),pitch:.35*Math.sin(ph),roll:ph+PI/2,sc:narrow()?.4:.55};
    const v=ease(clamp(toFlower*1.4-k*.045));
    const pos=mix3(row.pos,fl.pos,v),arc=Math.sin(PI*v)*.9;pos[1]+=arc*.4;pos[2]+=arc*.6;
    const yaw=lerp(row.yaw,fl.yaw,v),pitch=lerp(row.pitch,fl.pitch,v),roll=lerp(row.roll,fl.roll,v),sc=lerp(row.sc,fl.sc,v);
    if(ap<=0.001&&v<=0)continue;
    items.push({tex:'epp',shape:'square',M:M4.chain(M4.T(off[0]+pos[0],off[1]+pos[1],off[2]+pos[2]),M4.Rz(roll*v),M4.Ry(yaw),M4.Rx(pitch),M4.S(sc,sc,sc))})}
  drawS(st,items);
  return Math.min(S.lis.length-1,Math.floor(clamp((p-.05)/.85)*S.lis.length));
}


/* ---------- XSpider PRO: плитки раскладываются спиралью, по ним проходит луч сканера ---------- */
function xspider(S,p,t){const st=S.st,items=[],N=24,GA=PI*(3-Math.sqrt(5));const off=narrow()?[0,1,0]:[0,0,0],k0=narrow()?.7:1;
  const grow=ease(clamp((p-.05)/.45)),beam=(reduceM?0:t*.9)+p*6,found=clamp((p-.55)/.3);
  const plane=M4.chain(M4.T(...off),M4.Rx(-.8),M4.Rz(t*.05));
  for(let i=0;i<N;i++){const r=.3*Math.sqrt(i+.5)*k0,a=i*GA;const vis=clamp(grow*N*1.15-i);if(vis<=0)continue;
    const rr=r*lerp(.3,1,ease(vis));
    let d=((beam-a)%TAU+TAU)%TAU;const hit=Math.exp(-d*2.4);           // луч только что прошёл
    const bad=i%9===4&&found>0,lift=hit*.22+(bad?found*.18:0);
    const P=M4.chain(plane,M4.T(Math.cos(a)*rr,Math.sin(a)*rr,lift));
    const sc=lerp(.2,.34,clamp(i/N))*k0*ease(vis);
    items.push({tex:'xspider',shape:'square',glow:bad?found*(.6+.4*Math.sin(t*4)):hit*.35,
      M:M4.chain(P,M4.Rz(a+PI/2),M4.Rx(PI/2*0+.0),M4.Ry(hit*PI*.9),M4.S(sc,sc,sc))})}
  const c=1.0*k0;items.push({tex:'xspider',shape:'square',M:M4.chain(M4.T(off[0],off[1]+.08+Math.sin(t*.8)*.04,.4),M4.Ry(-.3+Math.sin(t*.5)*.1),M4.Rx(-.15),M4.S(c*.55,c*.55,c*.55))});
  drawS(st,items);
  return Math.min(S.lis.length-1,Math.floor(clamp((p-.05)/.85)*S.lis.length));
}

/* ---------- PT MAZE: сетка плиток перемешивается ходами по 90°, как лабиринт, и собирается обратно ---------- */
const MZ=5,MOVES=[];(function(){let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  let grid=[];for(let y=0;y<MZ;y++)for(let x=0;x<MZ;x++)grid.push({x,y,r:0});
  const frames=[grid.map(g=>({...g}))];
  for(let s=0;s<8;s++){const row=rnd()<.5,idx=Math.floor(rnd()*MZ),dir=rnd()<.5?1:-1;
    grid=grid.map(g=>{const n={...g};if(row&&g.y===idx){n.x=(g.x+dir+MZ)%MZ;n.r=g.r+dir}else if(!row&&g.x===idx){n.y=(g.y+dir+MZ)%MZ;n.r=g.r-dir}return n});
    frames.push(grid.map(g=>({...g})))}
  MOVES.push(...frames)})();
function maze(S,p,t){const st=S.st,items=[];const off=narrow()?[0,1.05,0]:[0,0,0],g=narrow()?.36:.5;
  const F=MOVES.length-1;let q=clamp((p-.08)/.6)*F*2;if(q>F)q=2*F-q;           // туда и обратно: код запутывается и снова собирается
  const i=Math.min(F-1,Math.floor(q)),u=ease(clamp((q-i)*1.6-.3));
  const plane=M4.chain(M4.T(...off),M4.Rx(-.62+.05*Math.sin(t*.4)),M4.Ry(-.35+.08*Math.sin(t*.3)));
  MOVES[i].forEach((a,k)=>{const b=MOVES[i+1][k];
    let ax=a.x,bx=b.x,ay=a.y,by=b.y;if(Math.abs(bx-ax)>1)ax=bx-Math.sign(bx-ax);if(Math.abs(by-ay)>1)ay=by-Math.sign(by-ay);   // уход за край
    const x=lerp(ax,bx,u),y=lerp(ay,by,u),moving=(a.x!==b.x||a.y!==b.y),hop=moving?Math.sin(PI*u)*.55:0;
    const wrapFade=(Math.abs(b.x-a.x)>1||Math.abs(b.y-a.y)>1)?Math.abs(1-2*u):1;
    const sc=g*.74*(.3+.7*wrapFade);
    items.push({tex:'maze',shape:'square',M:M4.chain(plane,M4.T((x-(MZ-1)/2)*g,((MZ-1)/2-y)*g,hop),M4.Rz(-lerp(a.r,b.r,u)*PI/2),M4.S(sc,sc,sc))})});
  drawS(st,items);
  return Math.min(S.lis.length-1,Math.floor(clamp((p-.05)/.85)*S.lis.length));
}

/* ---------- PT: плитки слетаются и складываются в башню, башня закручивается спиралью и держит баланс ---------- */
const TOWER=['ngfw','email','epp','xspider','maze','pt'];
function ptStack(S,p,t){const st=S.st,items=[];const off=narrow()?[0,1.55,0]:[0,-.7,0],k0=narrow()?.56:1;
  const N=TOWER.length,build=clamp((p-.03)/.5),twist=ease(clamp((p-.55)/.35));
  for(let i=0;i<N;i++){const land=ease(clamp(build*N*1.05-i));if(land<=0)continue;
    const h=i*.46*k0,sway=Math.sin(t*.9+i*.35)*.03*(i/N);
    const ang=i*.42*twist+Math.sin(t*.35)*.2+i*.05;
    const r=twist*.22*k0;
    const from=[(i%2?1:-1)*2.6,h+2.2,-1.5];
    const to=[Math.cos(ang*1.3)*r+sway,h,Math.sin(ang*1.3)*r];
    const pos=mix3(from,to,land);
    const k=TOWER[i],sc=(k==='pt'?.78:.66)*k0;
    items.push({tex:k,shape:k==='pt'?'diamond':'square',glow:k==='pt'?.15*twist:0,
      M:M4.chain(M4.T(off[0]+pos[0],off[1]+pos[1],off[2]+pos[2]),M4.Ry(ang*.6-.5+(1-land)*2.5),M4.Rx(-PI/2+.62),M4.Rz((1-land)*1.5),M4.S(sc,sc,sc))})}
  drawS(st,items,{fov:.5,eye:narrow()?[0,2.0,6.8]:[0,1.7,6.6],at:narrow()?[0,1.45,0]:[-1.2,.25,0]});
  return Math.min(S.lis.length-1,Math.floor(clamp((p-.05)/.85)*S.lis.length));
}

function drawS(st,items,c){c=c||cam();const blobs=[];
  items.forEach(it=>{const M=it.M,sc=Math.hypot(M[0],M[1],M[2]);blobs.push({c:[M[12]+.06*sc,M[13]-.5*sc,M[14]-.35*sc],w:sc*1.05,h:sc*.55,a:.16})});
  st.draw(Object.assign({},c,{blobs}),items,[])}

/* ---- Подключение к сайту: секции [data-scene], только видимые, текстуры только нужные ---- */
const NEED={ngfw:['ngfw'],email:['email'],epp:['epp'],xspider:['xspider'],maze:['maze'],pt:['ngfw','email','epp','xspider','maze','pt']};
function SUBTEX(k){const o={};(NEED[k]||[k]).forEach(n=>o[n]=TEX[n]);return o}
const RENDER={ngfw,email,epp,xspider,maze,pt:ptStack};
const FOG={white:[[0,0,0,.6],[7,14]],frost:[[.067,.071,.086,.55],[6,11]]};
const SC=[];
document.querySelectorAll('[data-scene]').forEach(sec=>{try{const S=sceneOf(sec,RENDER[sec.dataset.scene]);const f=FOG[sec.classList.contains('frost')?'frost':'white'];S.st.fog=f[0];S.st.fogR=f[1];S.w=0;SC.push(S)}catch(e){sec.classList.add('no-gl')}});
function progress(S){const r=S.sec.getBoundingClientRect(),h=S.sec.offsetHeight-innerHeight;return clamp(-r.top/Math.max(1,h))}
function visible(S){if(!S.sec.offsetParent)return false;const r=S.sec.getBoundingClientRect();return r.bottom>-50&&r.top<innerHeight+50}
function frame(ms){const t=ms/1000;SC.forEach(S=>{if(!S.ok||!visible(S))return;
  const w=S.cv.clientWidth;if(w!==S.w){S.st.resize();S.w=w}
  S.p=progress(S);const k=S.render(S,S.p,t);S.lis.forEach((li,i)=>li.classList.toggle('on',i===k))})}
SC.forEach(S=>S.st.ready.then(()=>{S.ok=true}));
addEventListener('resize',()=>SC.forEach(S=>S.w=0));
(function loop(n){frame(n);requestAnimationFrame(loop)})(0);
})();
