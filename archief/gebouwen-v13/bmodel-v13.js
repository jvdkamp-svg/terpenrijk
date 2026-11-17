// ===== bmodel.js — 3D-gebouwen per tijdperk =====
// De ontwerpen zijn met Higgsfield getekend (GPT Image 2.6) en daarna met Higgsfield (SAM 3D) omgezet naar echte
// 3D-modellen met eigen textuur. blddata.js bevat de modellen (BLD_META, BLD_GEO) en de textuuratlas (BLD_TEX).
const BM={ready:0,t:{},q:[],ri:{},rn:{},max:1500};
const VS_BM=`#version 300 es
layout(location=0)in vec3 aP;layout(location=1)in vec3 aN;layout(location=2)in vec2 aT;
uniform mat4 uVP,uSVP;uniform vec3 uMn,uSz,uO;
out vec2 vT;out vec3 vW,vN;out vec4 vS;out float vY;flat out float vHl;
void main(){vec3 l=uMn+aP*uSz;vY=l.y;vHl=0.;vec3 w=l+uO;vT=aT;vN=aN;vW=w;vS=uSVP*vec4(w+aN*.04,1.);gl_Position=uVP*vec4(w,1.);}`;
const VS_BMI=`#version 300 es
layout(location=0)in vec3 aP;layout(location=1)in vec3 aN;layout(location=2)in vec4 aT;layout(location=3)in vec4 iA;layout(location=4)in vec4 iB;
uniform mat4 uVP,uSVP;uniform vec3 uMn,uSz;uniform vec4 uLeg;uniform vec3 uTeam[8];
out vec2 vT;out vec3 vW,vN,vVC;out vec4 vS;out float vY;flat out float vHl;flat out vec3 vTC;
void main(){float A=floor((iB.w+50.)/100.),ex=iB.w-100.*A,md=floor(A/64.+.001),ph=(A-64.*md)/64.*6.2832;float rl=step(9.5,ex),tm=ex-10.*rl;vec3 l=uMn+aP*uSz,nn=aN.xyz;
 // versie 13: dierenbewegingen (1 lopen, 2 grazen, 3 rondkijken, 4 neervallen); uLeg = pootlengte, kopgrens, nekhoogte, aan
 if(uLeg.w>.5&&md>.5){float H=uLeg.x;
  if(md<1.5){float wl=1.-smoothstep(H-.05,H+.02,aP.y),t=clamp((H-aP.y)/H,0.,1.),of=(aP.x>.45?0.:3.1416)+(aP.z>.5?3.1416:0.),sw=sin(ph+of),L=H*uSz.y;
   l.x+=sw*.5*L*t*wl;l.y+=max(0.,cos(ph+of))*.14*L*t*wl;}
  else if(md<3.5){float w=smoothstep(uLeg.y-.08,uLeg.y+.08,aP.x)*smoothstep(uLeg.z-.15,uLeg.z+.02,aP.y);vec2 pv=uMn.xy+vec2(uLeg.y,uLeg.z)*uSz.xy,dd=l.xy-pv;
   if(md<2.5){float a=.85*ph/6.2832,ca=cos(a),sa=sin(a);vec2 rr=vec2(dd.x*ca+dd.y*sa,-dd.x*sa+dd.y*ca);l.xy=mix(l.xy,pv+rr,w);}
   else l.z+=w*sin(ph)*.12*uSz.z;}
  else{float a=1.5708*clamp(ph/6.2832*1.016,0.,1.),zc=uMn.z+.5*uSz.z,dz=l.z-zc,yy=l.y-uMn.y;l=vec3(l.x,uMn.y+(dz+.5*uSz.z)*sin(a)+yy*cos(a),zc+dz*cos(a)-yy*sin(a));nn=vec3(nn.x,nn.y*cos(a)+nn.z*sin(a),nn.z*cos(a)-nn.y*sin(a));}}
 if(rl>.5){l=vec3(l.x,l.z-uMn.z,-l.y);nn=vec3(nn.x,nn.z,-nn.y);}
 l*=iB.xyx;float c=cos(iA.w),s=sin(iA.w);vec3 r=vec3(l.x*c+l.z*s,l.y,-l.x*s+l.z*c);vY=-1.;
 vTC=tm>.5?uTeam[int(tm+.5)-1]:tm<-.5?vec3(-2.):vec3(-1.);
 vec3 w=r+iA.xyz;vT=aT.xy;vVC=aT.rgb;vN=vec3(nn.x*c+nn.z*s,nn.y,-nn.x*s+nn.z*c);vW=w;vHl=iB.z;vS=uSVP*vec4(w+vN*.04,1.);gl_Position=uVP*vec4(w,1.);}`;
const FS_BM=`#version 300 es
precision highp float;precision highp sampler2DArray;uniform sampler2D uTex;uniform vec4 uCol,uFx;uniform float uVC;
${FCOM}
in vec2 vT;in vec3 vW,vN;in vec4 vS;in float vY;flat in float vHl;
#ifdef VC
in vec3 vVC;flat in vec3 vTC;
#endif
out vec4 o;
float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){if(vY>uFx.w)discard;
 float dth=fract(dot(floor(gl_FragCoord.xy),vec2(.5,.25)));if(uCol.a<.99&&dth>=uCol.a)discard;
 vec3 c=texture(uTex,vT).rgb;
#ifdef VC
 c=vVC;
#endif
float mx=max(c.r,c.g),k=smoothstep(.12,.32,(c.b-mx)/max(c.b,.02))*smoothstep(.06,.16,c.b);
 float l=c.b*.62+mx*.38;vec3 tcol=uCol.rgb;
#ifdef VC
 if(vTC.x>=0.)tcol=vTC;if(vTC.x<-1.5)k=0.;
#endif
 c=mix(c,tcol*clamp(l*1.7+.05,0.,1.5),k);
 float bk=step(9.5,uFx.y),dm=uFx.y-10.*bk;
 // Gouden Eeuw: lichte muren worden rode baksteen met witte voegen (daken, spelerskleur en donkere delen blijven)
 if(bk>.5){float sat=max(c.r,max(c.g,c.b))-min(c.r,min(c.g,c.b)),lw=dot(c,vec3(.33));float wall=smoothstep(.4,.55,lw)*(1.-smoothstep(.12,.22,sat))*(1.-k)*smoothstep(.35,.6,abs(normalize(vN).y-1.));
  vec2 bq=vec2((vW.x+vW.z)*9.,vW.y*18.);bq.x+=step(1.,mod(floor(bq.y),2.))*.5;vec2 fq=fract(bq);float mortar=step(.86,fq.y)+step(.92,fq.x);float hb=h3(vec3(floor(bq),3.));
  vec3 brick=mix(vec3(.55,.24,.15),vec3(.66,.33,.2),hb)*(.8+.4*lw);c=mix(c,mix(brick,vec3(.86,.83,.76),clamp(mortar,0.,1.)),wall);}
 if(dm>0.){float n=vn(vW*3.1)*.6+vn(vW*8.3)*.4,th=1.02-dm*.55;c*=mix(1.,.28,smoothstep(th,th+.3,n)*.85)*(1.-.12*dm);}
 c=pow(c,vec3(2.2));vec3 n=normalize(vN);float nl=max(dot(n,uSun),0.),sh=shadow(vS);
 c=mix(vec3(dot(c,vec3(.3,.59,.11))),c,.86);c*=SUN*(.36*nl*sh)+mix(GND,SKY,n.y*.5+.5)*1.15+.14+.1*sh;
 if(vHl<-.01){float tn=-vHl-.5;c*=1.+tn*.28;c.r*=1.+tn*.1;c.b*=1.-tn*.08;}
 float md=max(uFx.x,vHl);if(md>1.5)c=mix(c,md>2.5?vec3(.9,.12,.08):vec3(.2,.85,.25),.42);
 else if(md>.5)c+=vec3(.30,.26,.10)*(.5+.5*sin(uT*11.));
 c+=vec3(1.,.85,.5)*uFx.z*.5;
 o=vec4(fin(c,vW),1.);}`;
const FS_BMS=`#version 300 es
precision highp float;in float vY;in vec2 vT;in vec3 vW,vN,vVC;in vec4 vS;flat in float vHl;uniform vec4 uFx;out vec4 o;void main(){if(vY>uFx.w)discard;o=vec4(1.);}`;
function bmMesh(m,buf){const P=new Uint16Array(buf.buffer,m.o,m.nv*3),T=m.vc?new Uint8Array(buf.buffer,m.o+m.nv*6,m.nv*4):new Uint16Array(buf.buffer,m.o+m.nv*6,m.nv*2),I=new Uint16Array(buf.buffer,m.o+m.nv*(m.vc?10:10),m.ni);
  // normalen uit de driehoeken (gewogen naar oppervlak), per hoekpunt gemiddeld
  const N=new Float32Array(m.nv*3),s=m.sz,px=i=>P[i*3]/65535*s[0],py=i=>P[i*3+1]/65535*s[1],pz=i=>P[i*3+2]/65535*s[2];
  for(let i=0;i<m.ni;i+=3){const a=I[i],b=I[i+1],c=I[i+2],ux=px(b)-px(a),uy=py(b)-py(a),uz=pz(b)-pz(a),vx=px(c)-px(a),vy=py(c)-py(a),vz=pz(c)-pz(a),nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
   for(const k of[a,b,c]){N[k*3]+=nx;N[k*3+1]+=ny;N[k*3+2]+=nz}}
  const N8=new Int8Array(m.nv*4);for(let i=0;i<m.nv;i++){const x=N[i*3],y=N[i*3+1],z=N[i*3+2],l=Math.hypot(x,y,z)||1;N8[i*4]=x/l*127;N8[i*4+1]=y/l*127;N8[i*4+2]=z/l*127}
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);const mk=(d,loc,n,type,norm)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,d,gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,type,norm,0,0)};
  mk(P,0,3,gl.UNSIGNED_SHORT,true);mk(N8,1,4,gl.BYTE,true);if(m.vc)mk(T,2,4,gl.UNSIGNED_BYTE,true);else mk(T,2,2,gl.UNSIGNED_SHORT,true);
  let ib2=null;if(/^[ru]_/.test(m.t)){ib2=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib2);gl.bufferData(gl.ARRAY_BUFFER,BM.max*32,gl.DYNAMIC_DRAW);for(const[l,o]of[[3,0],[4,16]]){gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,4,gl.FLOAT,false,32,o);gl.vertexAttribDivisor(l,1)}}
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,I,gl.STATIC_DRAW);gl.bindVertexArray(null);
  const mo={leg:ALEG[m.t]||[0,0,0,0],vc:m.vc?1:0,a:m.a,vao,ni:m.ni,mn:m.mn,sz:m.sz,h:m.mn[1]+m.sz[1],ib:ib2,d:ib2?new Float32Array(BM.max*8):null,n:0};return mo}
function initBModels(){if(typeof BLD_GEO==='undefined')return;
 BM.p=mkProg(VS_BM,FS_BM);BM.pv=mkProg(VS_BM.replace('layout(location=2)in vec2 aT;','layout(location=2)in vec4 aT;').replace('out vec2 vT;','out vec2 vT;out vec3 vC;').replace('vT=aT;','vT=vec2(0.);vC=aT.rgb;'),FS_BM.replace('in vec2 vT;','in vec2 vT;in vec3 vC;').replace('vec3 c=texture(uTex,vT).rgb;','vec3 c=vC;'));BM.ps=mkProg(VS_BM,FS_BMS);BM.pi=mkProg(VS_BMI,FS_BM.replace('precision highp float;','#define VC\nprecision highp float;'));BM.pis=mkProg(VS_BMI,FS_BMS);
 for(const P of[BM.pi]){gl.useProgram(P.p);gl.uniform1i(P.u.uTex,5);if(P.u.uSh)gl.uniform1i(P.u.uSh,1);if(P.u.uFog)gl.uniform1i(P.u.uFog,2)}for(const P of[BM.p,BM.pv]){gl.useProgram(P.p);const u=P.u;if(u.uTex)gl.uniform1i(u.uTex,5);if(u.uSh)gl.uniform1i(u.uSh,1);if(u.uFog)gl.uniform1i(u.uFog,2)}
 const sets=[[BLD_GEO,BLD_META.m]];if(typeof B13_GEO!=='undefined')sets.push([B13_GEO,B13_META]);if(typeof RES_GEO!=='undefined')sets.push([RES_GEO,RES_META]);if(typeof UNI_GEO!=='undefined')sets.push([UNI_GEO,UNI_META]);if(typeof TREE_GEO!=='undefined')sets.push([TREE_GEO,TREE_META]);
 for(const[G64,MS0]of sets){const bin=atob(G64),buf=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)buf[i]=bin.charCodeAt(i);
 for(const m of MS0){const mo=bmMesh(m,buf);(BM.t[m.t]=BM.t[m.t]||[null,null,null])[m.a]=mo;if(mo.ib)(BM.rl=BM.rl||[]).push(mo)}}
 const im=new Image();im.onload=()=>{BM.tex=gl.createTexture();gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,BM.tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.activeTexture(gl.TEXTURE0);BM.ready=1};
 im.src=BLD_TEX;loadB13()}
function bmTex(im){const t=gl.createTexture();gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.activeTexture(gl.TEXTURE0);return t}
// versie 13.2: nieuwe Higgsfield-gebouwen met eigen textuuratlas, als losse bestanden in de app-versie (b13.bin + b13.webp); ontbreken ze, dan blijven de oude modellen
function loadB13(){if(typeof B13_URL==='undefined')return;
 Promise.all([fetch(B13_URL+'.bin').then(r=>{if(!r.ok)throw new Error('b13');return r.arrayBuffer()}),new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=B13_URL+'.webp'})]).then(([ab,im])=>{
  const dv=new DataView(ab),n=dv.getUint32(0,true),meta=JSON.parse(new TextDecoder().decode(new Uint8Array(ab,4,n))),buf=new Uint8Array(ab.byteLength-4-n);buf.set(new Uint8Array(ab,4+n));
  BM.tex2=bmTex(im);for(const m of meta){const mo=bmMesh(m,buf);mo.tx=m.vc?0:1;const old=BM.t[m.t]&&BM.t[m.t][m.a];(BM.t[m.t]=BM.t[m.t]||[null,null,null,null])[m.a]=mo;if(mo.ib){if(old&&BM.rl)BM.rl.splice(BM.rl.indexOf(old)>>>0,1);(BM.rl=BM.rl||[]).push(mo)}}BM.b13=meta.length}).catch(()=>{})}
// welk model hoort bij dit gebouw in dit tijdperk? (null = geen model, dan het oude eenvoudige 3D-model)
const BALIAS={kanongieterij:'werkplaats',handelskantoor:'smederij',bastion:'kasteel',pmolen:'molen'};
function bModel(t,age){if(!BM.ready)return null;if(BALIAS[t]&&!BM.t[t])t=BALIAS[t];if(t==='storen'){t='toren';age=Math.min(2,age+1)}if(t==='houtkamp'||t==='mijnkamp')t='opslag';/* de kampen bouwen voort op de opslag, met eigen 3D-spullen ervoor */const a=BM.t[t];if(!a)return null;
 for(let i=Math.min(age,3);i<4;i++)if(a[i])return a[i];for(let i=3;i>=0;i--)if(a[i])return a[i];return null}
// model in de tekenlijst: x,y,z = midden van het bouwvlak (tegels); clip = zichtbare hoogte (bouwfase)
function addBM(m,x,y,z,col,alpha,mode,dmg,flash,clip){BM.q.push([m,x,y,z,col[0],col[1],col[2],alpha,mode,dmg,flash,clip===undefined?1e9:clip])}
function drawBModels(shadowPass){if(!BM.ready||!BM.q.length)return;
 for(const vc of[0,1]){const P=shadowPass?BM.ps:vc?BM.pv:BM.p,u=P.u;let first=1,cur=null;
  for(const e of BM.q){const m=e[0];if(!!m.vc!==!!vc)continue;if(shadowPass&&e[7]<.99)continue;
   if(first){first=0;cur=null;if(shadowPass){gl.useProgram(P.p);gl.uniformMatrix4fv(u.uVP,false,R.svp)}else bindCommon(P,R.vp)}
   if(!shadowPass){const tx=m.tx?BM.tex2:BM.tex;if(tx!==cur){cur=tx;gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,tx);gl.activeTexture(gl.TEXTURE0)}}
   gl.uniform3f(u.uMn,m.mn[0],m.mn[1],m.mn[2]);gl.uniform3f(u.uSz,m.sz[0],m.sz[1],m.sz[2]);gl.uniform3f(u.uO,e[1],e[2],e[3]);
   if(u.uCol)gl.uniform4f(u.uCol,e[4],e[5],e[6],e[7]);gl.uniform4f(u.uFx,e[8],e[9],e[10],e[11]);gl.bindVertexArray(m.vao);gl.drawElements(gl.TRIANGLES,m.ni,gl.UNSIGNED_SHORT,0)}}
 gl.bindVertexArray(null)}
// grondstof als instance: x,y,z in tegels, draaiing, breedte- en hoogteschaal, markering
function resModel(k){return BM.ready&&BM.t[k]?BM.t[k][0]:null}
// ex: teamkleur (1-4, 0 = geen) + 10 om het model op zijn zij te leggen
// pootlengte, kopgrens (naar voren), nekhoogte, aan — gemeten aan de modellen (+x is de kop)
const ALEG={u_sheep0:[.3,.7,.55,1],u_sheep1:[.3,.7,.55,1],u_hert:[.42,.55,.62,1],u_zwijn:[.3,.74,.42,1]};
// animatiecode bovenop ex: modus 1 lopen, 2 grazen (fase = hoeveel), 3 rondkijken, 4 neervallen (fase = voortgang)
const animEx=(ex,md,f)=>ex+100*(md*64+(Math.floor(((f%1)+1)%1*64)&63));
function animalEx(u,ex){if(u.mv)return animEx(ex,1,u.anim*(u.t==='hert'?.19:u.t==='zwijn'?.3:.26));const g=Math.sin(G.time*.23+u.id*1.7);if(g>.15)return animEx(ex,2,Math.min(.99,(g-.15)*3)*(1+.04*Math.sin(G.time*5+u.id)));return animEx(ex,3,G.time*.12+u.id*.37)}
function addRM(m,x,y,z,rot,sw,sh,hl,ex){if(m.n>=BM.max)return;const o=m.n++*8,d=m.d;d[o]=x;d[o+1]=y;d[o+2]=z;d[o+3]=rot;d[o+4]=sw;d[o+5]=sh;d[o+6]=hl;d[o+7]=ex||0}
const uModel=(...ks)=>{if(!BM.ready)return null;for(const k of ks)if(BM.t[k])return BM.t[k][0];return null};
function drawRModels(shadowPass){if(!BM.ready||!BM.rl)return;const P=shadowPass?BM.pis:BM.pi,u=P.u;
 if(shadowPass){gl.useProgram(P.p);gl.uniformMatrix4fv(u.uVP,false,R.svp)}else{bindCommon(P,R.vp);gl.uniform4f(u.uCol,1,1,1,1);gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,BM.tex);gl.activeTexture(gl.TEXTURE0)}
 gl.uniform4f(u.uFx,0,0,0,1e9);if(u.uTeam){if(!BM.team){BM.team=new Float32Array(24);CIVS.forEach((c,i)=>{BM.team[i*3]=c.col[0];BM.team[i*3+1]=c.col[1];BM.team[i*3+2]=c.col[2]})}gl.uniform3fv(u.uTeam,BM.team)}
 for(const m of BM.rl){if(!m.n)continue;gl.uniform3f(u.uMn,m.mn[0],m.mn[1],m.mn[2]);if(u.uLeg)gl.uniform4f(u.uLeg,m.leg[0],m.leg[1],m.leg[2],m.leg[3]);gl.uniform3f(u.uSz,m.sz[0],m.sz[1],m.sz[2]);gl.bindVertexArray(m.vao);
  if(!m.up){m.up=1;gl.bindBuffer(gl.ARRAY_BUFFER,m.ib);gl.bufferSubData(gl.ARRAY_BUFFER,0,m.d,0,m.n*8)}gl.drawElementsInstanced(gl.TRIANGLES,m.ni,gl.UNSIGNED_SHORT,0,m.n)}
 gl.bindVertexArray(null)}
function clearRModels(){if(BM.rl)for(const m of BM.rl){m.n=0;m.up=0}}
