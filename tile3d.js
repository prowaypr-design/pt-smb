/* Плитка PT как настоящая 3D-модель на WebGL2 без библиотек.
   Корпус: скруглённый квадрат с толщиной и фаской. Лицо и тыл: текстура с картинки продукта
   (с обеих сторон логотип читается правильно). Боковины: красный лак с бликами студийного света. */
(function(){
const V3={sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm:a=>{const l=Math.hypot(...a);return a.map(v=>v/l)},dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
const M4={
  id:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  mul(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o},
  T:(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],
  S:(x,y,z)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1],
  Rx(a){const c=Math.cos(a),s=Math.sin(a);return [1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]},
  Ry(a){const c=Math.cos(a),s=Math.sin(a);return [c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]},
  Rz(a){const c=Math.cos(a),s=Math.sin(a);return [c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]},
  persp(f,asp,n,fa){const t=1/Math.tan(f/2);return [t/asp,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0]},
  look(e,c,u){const z=V3.norm(V3.sub(e,c)),x=V3.norm(V3.cross(u,z)),y=V3.cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V3.dot(x,e),-V3.dot(y,e),-V3.dot(z,e),1]},
  chain(...m){return m.reduce((a,b)=>M4.mul(a,b))}
};

/* Контур: скруглённый квадрат (по желанию повёрнутый на 45°, как ромб PT). Габарит по осям = 1. */
function outline(shape){
  const P=[],N=[],seg=18;
  let h,R,rot=0;
  if(shape==='diamond'){R=.075;h=(.5-R)/Math.SQRT2+R;rot=Math.PI/4}else{R=.14;h=.5}
  const cs=[[1,1],[-1,1],[-1,-1],[1,-1]];
  cs.forEach(([sx,sy],ci)=>{const cx=sx*(h-R),cy=sy*(h-R),a0=ci*Math.PI/2;
    for(let k=0;k<=seg;k++){const a=a0+k/seg*Math.PI/2,nx=Math.cos(a),ny=Math.sin(a);P.push([cx+R*nx,cy+R*ny]);N.push([nx,ny])}});
  const cr=Math.cos(rot),sr=Math.sin(rot);
  return {P:P.map(([x,y])=>[x*cr-y*sr,x*sr+y*cr]),N:N.map(([x,y])=>[x*cr-y*sr,x*sr+y*cr])};
}
function buildTile(shape,th=.15,bev=.042){
  const {P,N}=outline(shape),n=P.length,v=[],idx=[],BS=9;
  const push=(x,y,z,nx,ny,nz,u,w,m)=>{v.push(x,y,z,nx,ny,nz,u,w,m);return v.length/9-1};
  const zf=th/2;
  // кольца: передняя фаска, боковина, задняя фаска
  const rings=[];
  for(let k=BS;k>=0;k--){const a=k/BS*Math.PI/2;rings.push({off:bev*(1-Math.cos(a)),z:zf-bev+bev*Math.sin(a),nc:Math.cos(a),nz:Math.sin(a)})}
  for(let k=0;k<=BS;k++){const a=k/BS*Math.PI/2;rings.push({off:bev*(1-Math.cos(a)),z:-(zf-bev)-bev*Math.sin(a),nc:Math.cos(a),nz:-Math.sin(a)})}
  const ringStart=[];
  rings.forEach(r=>{ringStart.push(v.length/9);for(let i=0;i<n;i++){const [x,y]=P[i],[nx,ny]=N[i];const px=x-nx*r.off,py=y-ny*r.off;
    push(px,py,r.z,nx*r.nc,ny*r.nc,r.nz,r.z>0?px+.5:.5-px,.5-py,r.z>0?(r.nz>.7?0:2):(r.nz<-.7?1:2))}});
  for(let r=0;r<rings.length-1;r++)for(let i=0;i<n;i++){const a=ringStart[r]+i,b=ringStart[r]+(i+1)%n,c=ringStart[r+1]+i,d=ringStart[r+1]+(i+1)%n;idx.push(a,c,b,b,c,d)}
  // крышки
  const cap=(z,front)=>{const c=push(0,0,z,0,0,front?1:-1,.5,.5,front?0:1),s=v.length/9;
    for(let i=0;i<n;i++){const [x,y]=P[i],[nx,ny]=N[i],px=x-nx*bev,py=y-ny*bev;push(px,py,z,0,0,front?1:-1,front?px+.5:.5-px,.5-py,front?0:1)}
    for(let i=0;i<n;i++){const a=s+i,b=s+(i+1)%n;front?idx.push(c,a,b):idx.push(c,b,a)}};
  cap(zf,true);cap(-zf,false);
  return {v:new Float32Array(v),i:new Uint32Array(idx)};
}

function buildSlice(shape,y0,y1,th=.15){
  const {P,N}=outline(shape);let poly=P.map((p,i)=>({x:p[0],y:p[1],nx:N[i][0],ny:N[i][1],c:0}));
  const clip=(pl,yc,keepAbove)=>{const o=[];for(let i=0;i<pl.length;i++){const a=pl[i],b=pl[(i+1)%pl.length];
    const ia=keepAbove?a.y>=yc:a.y<=yc,ib=keepAbove?b.y>=yc:b.y<=yc;if(ia)o.push(a);
    if(ia!==ib){const t=(yc-a.y)/(b.y-a.y);let nx=a.nx+(b.nx-a.nx)*t,ny=a.ny+(b.ny-a.ny)*t;const l=Math.hypot(nx,ny)||1;o.push({x:a.x+(b.x-a.x)*t,y:yc,nx:nx/l,ny:ny/l,c:keepAbove?-1:1})}}return o};
  poly=clip(clip(poly,y0,true),y1,false);
  const v=[],idx=[],zf=th/2,push=(x,y,z,nx,ny,nz,m)=>{v.push(x,y,z,nx,ny,nz,z>0?x+.5:.5-x,.5-y,m);return v.length/9-1},n=poly.length;
  for(let i=0;i<n;i++){const a=poly[i],b=poly[(i+1)%n];
    const flat=Math.abs(a.y-b.y)<1e-6&&(Math.abs(a.y-y0)<1e-6||Math.abs(a.y-y1)<1e-6)&&a.c!==0&&b.c!==0||(Math.abs(a.y-b.y)<1e-6&&(Math.abs(a.y-y0)<1e-6||Math.abs(a.y-y1)<1e-6));
    let na=[a.nx,a.ny],nb=[b.nx,b.ny];if(flat){const s=Math.abs(a.y-y0)<1e-6?-1:1;na=nb=[0,s]}
    const i0=push(a.x,a.y,zf,na[0],na[1],0,2),i1=push(b.x,b.y,zf,nb[0],nb[1],0,2),i2=push(a.x,a.y,-zf,na[0],na[1],0,2),i3=push(b.x,b.y,-zf,nb[0],nb[1],0,2);idx.push(i0,i2,i1,i1,i2,i3)}
  const cx=poly.reduce((s,p)=>s+p.x,0)/n,cy=poly.reduce((s,p)=>s+p.y,0)/n;
  [[zf,1,0],[-zf,-1,1]].forEach(([z,nz,m])=>{const c=push(cx,cy,z,0,0,nz,m),st=v.length/9;poly.forEach(p=>push(p.x,p.y,z,0,0,nz,m));
    for(let i=0;i<n;i++){const a=st+i,b=st+(i+1)%n;idx.push(c,a,b)}});
  return {v:new Float32Array(v),i:new Uint32Array(idx)};
}
const VS=`#version 300 es
layout(location=0)in vec3 p;layout(location=1)in vec3 n;layout(location=2)in vec2 uv;layout(location=3)in float m;
uniform mat4 uM,uVP;out vec3 vP,vN;out vec2 vUV;flat out int vM;out vec3 vT,vB;
void main(){vec4 w=uM*vec4(p,1.);vP=w.xyz;vN=mat3(uM)*n;vUV=uv;vM=int(m+.5);vT=mat3(uM)*vec3(1,0,0);vB=mat3(uM)*vec3(0,1,0);gl_Position=uVP*w;}`;
const FS=`#version 300 es
precision highp float;in vec3 vP,vN;in vec2 vUV;flat in int vM;in vec3 vT,vB;
uniform sampler2D uTex;uniform vec3 uCam;uniform float uGlow;uniform vec3 uSide;uniform vec4 uSolid;uniform vec4 uFog;uniform vec2 uFogR;out vec4 o;
float lum(vec2 t){vec3 c=texture(uTex,t).rgb;return dot(c,vec3(.3,.59,.11));}
vec3 env(vec3 r){ // студия: широкий софтбокс сверху, полоса справа, тёмный пол
  float top=smoothstep(.15,.75,r.y);float strip=smoothstep(.55,.9,r.x)*smoothstep(-.5,.2,r.y);float low=smoothstep(-.1,-.6,r.y);
  return vec3(.08,.02,.03)+vec3(1.,.82,.82)*top*.9+vec3(1.,.9,.9)*strip*.8-vec3(.05)*low;}
void main(){
  vec3 N=normalize(vN),V=normalize(uCam-vP);if(!gl_FrontFacing)N=-N;
  vec3 L1=normalize(vec3(-.45,.85,.55)),L2=normalize(vec3(.8,.25,-.4));
  vec3 col;
  if(vM<2){
    vec2 t=vUV;vec3 alb=mix(texture(uTex,t).rgb,uSolid.rgb,uSolid.a);
    float e=1./512.,hx=lum(t+vec2(e,0))-lum(t-vec2(e,0)),hy=lum(t-vec2(0,e))-lum(t+vec2(0,e));
    vec3 T=normalize(vT)*(vM==0?1.:-1.),B=normalize(vB);
    vec3 Np=normalize(N-(T*hx+B*hy)*2.2*(1.-uSolid.a));
    float d=max(dot(Np,L1),0.);vec3 H=normalize(L1+V);float sp=pow(max(dot(Np,H),0.),70.);
    float fr=pow(1.-max(dot(N,V),0.),3.);
    vec3 R=reflect(-V,Np);float coat=.04+.6*pow(1.-max(dot(N,V),0.),5.);
    float soft=smoothstep(.55,.95,dot(R,normalize(vec3(-.35,.8,.5))));
    float envN=smoothstep(.2,.8,R.y)*.9+smoothstep(.6,.9,R.x)*.6;
    col=alb*(.68+.3*d)+vec3(1.)*(sp*.35+soft*.06)+vec3(1.)*envN*coat*.14;
  }else{
    vec3 base=uSide;float d=max(dot(N,L1),0.),d2=max(dot(N,L2),0.);
    vec3 R=reflect(-V,N);vec3 H=normalize(L1+V);float sp=pow(max(dot(N,H),0.),90.);
    float fr=.35+.65*pow(1.-max(dot(N,V),0.),2.);
    col=base*(.2+.55*d+.35*d2)+base*env(R)*1.3*fr+vec3(1.,.8,.8)*sp*.85+env(R)*.06*fr;
  }
  col+=vec3(1.,.1,.08)*uGlow*.35;
  float dist=length(uCam-vP);float fg=smoothstep(uFogR.x,uFogR.y,dist)*uFog.a;col=mix(col,uFog.rgb,fg);
  o=vec4(col,1.);
}`;
const BVS=`#version 300 es
layout(location=0)in vec2 q;uniform mat4 uVP;uniform vec3 uC;uniform vec2 uS;uniform vec3 uRt,uUp;out vec2 vq;
void main(){vq=q;vec3 w=uC+uRt*q.x*uS.x+uUp*q.y*uS.y;gl_Position=uVP*vec4(w,1.);}`;
const BFS=`#version 300 es
precision highp float;in vec2 vq;uniform float uA;out vec4 o;
void main(){float d=length(vq);float a=uA*exp(-d*d*3.2)*(1.-smoothstep(.8,1.,d));o=vec4(0.,0.,0.,a);}`;
const SVS=`#version 300 es
layout(location=0)in vec2 q;uniform mat4 uVP;uniform vec4 uR;out vec2 vq;
void main(){vq=q;vec3 w=vec3(uR.x+q.x*uR.z*.5,0.,uR.y+q.y*uR.w*.5);gl_Position=uVP*vec4(w,1.);}`;
const SFS=`#version 300 es
precision highp float;in vec2 vq;uniform float uA;out vec4 o;
void main(){float d=max(abs(vq.x),abs(vq.y));float a=uA*(1.-smoothstep(.35,1.,d));o=vec4(0.,0.,0.,a);}`;

function prog(gl,vs,fs){const p=gl.createProgram();[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]].forEach(([t,s])=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(sh);gl.attachShader(p,sh)});gl.linkProgram(p);return p}

class Stage{
  constructor(canvas,textures){
    const gl=this.gl=canvas.getContext('webgl2',{antialias:true,premultipliedAlpha:true,alpha:true,preserveDrawingBuffer:true});
    if(!gl)throw new Error('no webgl2');
    this.c=canvas;this.p=prog(gl,VS,FS);this.bp=prog(gl,BVS,BFS);this.fog=[1,1,1,0];this.fogR=[5,14];this.sp=prog(gl,SVS,SFS);this.meshes={};this.tex={};
    ['square','diamond'].forEach(s=>{const m=buildTile(s),vao=gl.createVertexArray();gl.bindVertexArray(vao);
      const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,m.v,gl.STATIC_DRAW);
      [[0,3,0],[1,3,12],[2,2,24],[3,1,32]].forEach(([l,s2,o])=>{gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,s2,gl.FLOAT,false,36,o)});
      const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,m.i,gl.STATIC_DRAW);this.meshes[s]={vao,n:m.i.length}});
    const q=gl.createVertexArray();gl.bindVertexArray(q);const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);this.quad=q;
    this.ready=Promise.all(Object.entries(textures).map(([k,src])=>new Promise(r=>{const im=new Image();im.onload=()=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      const ext=gl.getExtension('EXT_texture_filter_anisotropic');if(ext)gl.texParameterf(gl.TEXTURE_2D,ext.TEXTURE_MAX_ANISOTROPY_EXT,8);this.tex[k]=t;r()};im.src=src})));
  }
  mesh(key,build){if(!this.meshes[key]){const gl=this.gl,m=build(),vao=gl.createVertexArray();gl.bindVertexArray(vao);
      const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,m.v,gl.STATIC_DRAW);
      [[0,3,0],[1,3,12],[2,2,24],[3,1,32]].forEach(([l,s2,o])=>{gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,s2,gl.FLOAT,false,36,o)});
      const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,m.i,gl.STATIC_DRAW);this.meshes[key]={vao,n:m.i.length}}return key}
  resize(){const d=Math.min(2,devicePixelRatio||1),r=this.c.getBoundingClientRect();this.c.width=Math.round(r.width*d);this.c.height=Math.round(r.height*d);this.asp=r.width/Math.max(1,r.height)}
  /* items: [{tex,shape,M,glow}], shadows: [{x,z,w,d,a}] */
  draw(cam,items,shadows){const gl=this.gl;gl.viewport(0,0,this.c.width,this.c.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const VP=M4.mul(M4.persp(cam.fov,this.asp,.1,50),M4.look(cam.eye,cam.at,[0,1,0]));
    if(shadows&&shadows.length){gl.useProgram(this.sp);gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindVertexArray(this.quad);
      gl.uniformMatrix4fv(gl.getUniformLocation(this.sp,'uVP'),false,VP);
      shadows.forEach(s=>{gl.uniform4f(gl.getUniformLocation(this.sp,'uR'),s.x,s.z,s.w,s.d);gl.uniform1f(gl.getUniformLocation(this.sp,'uA'),s.a);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)})}
    if(cam.blobs&&cam.blobs.length){const V=M4.look(cam.eye,cam.at,[0,1,0]),rt=[V[0],V[4],V[8]],up=[V[1],V[5],V[9]];
      gl.useProgram(this.bp);gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindVertexArray(this.quad);
      const L=n=>gl.getUniformLocation(this.bp,n);gl.uniformMatrix4fv(L('uVP'),false,VP);gl.uniform3fv(L('uRt'),rt);gl.uniform3fv(L('uUp'),up);
      cam.blobs.forEach(b=>{gl.uniform3fv(L('uC'),b.c);gl.uniform2f(L('uS'),b.w,b.h);gl.uniform1f(L('uA'),b.a);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)})}
    gl.useProgram(this.p);gl.enable(gl.DEPTH_TEST);gl.uniform4fv(gl.getUniformLocation(this.p,'uFog'),this.fog);gl.uniform2fv(gl.getUniformLocation(this.p,'uFogR'),this.fogR);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.p,'uVP'),false,VP);gl.uniform3fv(gl.getUniformLocation(this.p,'uCam'),cam.eye);
    items.forEach(it=>{const m=this.meshes[it.mesh||it.shape];gl.bindVertexArray(m.vao);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.tex[it.tex]);
      gl.uniform1i(gl.getUniformLocation(this.p,'uTex'),0);gl.uniformMatrix4fv(gl.getUniformLocation(this.p,'uM'),false,it.M);gl.uniform1f(gl.getUniformLocation(this.p,'uGlow'),it.glow||0);gl.uniform3fv(gl.getUniformLocation(this.p,'uSide'),it.side||[.56,.025,.045]);gl.uniform4fv(gl.getUniformLocation(this.p,'uSolid'),it.solid||[0,0,0,0]);
      gl.drawElements(gl.TRIANGLES,m.n,gl.UNSIGNED_INT,0)})}
}
window.Tile3D={Stage,M4,buildSlice};
})();
