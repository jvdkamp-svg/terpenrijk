// ===== render.js — camera, terrein, water, schaduw, instances, poppetjes, deeltjes, overlay, minikaart =====
const R={view:M4.new(),proj:M4.new(),vp:M4.new(),ivp:M4.new(),lv:M4.new(),lp:M4.new(),svp:M4.new(),eye:[0,0,0],tgt:[0,0,0],sun:[-.341,.782,.521],camH:.2,w:1,h:1,scale:1,vr:[0,0,1,1],terr:null,fogT:0,pings:[],fx:[]};
const PT=[],TM=M4.new(),SKIN=[.86,.68,.54];let PA=1;
function initRender(){R.pI=mkProg(VS_I,FS_I);R.pS=mkProg(VS_I,FS_SH);R.pT=mkProg(VS_T,FS_T);R.pW=mkProg(VS_W,FS_W);R.pP=mkProg(VS_P,FS_P);
 for(const P of[R.pI,R.pS,R.pT,R.pW]){gl.useProgram(P.p);if(P.u.uTex)gl.uniform1i(P.u.uTex,0);if(P.u.uSh)gl.uniform1i(P.u.uSh,1);if(P.u.uFog)gl.uniform1i(P.u.uFog,2);if(P.u.uSplat)gl.uniform1i(P.u.uSplat,3);if(P.u.uForest)gl.uniform1i(P.u.uForest,6);if(P.u.uHgt)gl.uniform1i(P.u.uHgt,4)}
 R.shTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,R.shTex);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,2048,2048,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL);
 R.shFbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,R.shFbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,R.shTex,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 R.wVao=gl.createVertexArray();gl.bindVertexArray(R.wVao);let b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new F32([0,0,1,0,1,1,0,0,1,1,0,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 R.pVao=gl.createVertexArray();gl.bindVertexArray(R.pVao);b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new F32([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 R.pBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,R.pBuf);R.pData=new F32(700*8);gl.bufferData(gl.ARRAY_BUFFER,R.pData.byteLength,gl.DYNAMIC_DRAW);
 gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,32,0);gl.vertexAttribDivisor(1,1);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.FLOAT,false,32,16);gl.vertexAttribDivisor(2,1);gl.bindVertexArray(null);
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);initBModels();initGear()}
// terrein als hoogteraster (2 vertices per tegel) + data-texturen
function buildTerrainGPU(){const V=2*W+1,VH=2*H+1,h=M.hgt,v=new F32(V*VH*6);
 for(let j=0;j<VH;j++)for(let i=0;i<V;i++){const o=(j*V+i)*6,hl=h[j*V+Math.max(0,i-1)],hr=h[j*V+Math.min(V-1,i+1)],hu=h[Math.max(0,j-1)*V+i],hd=h[Math.min(VH-1,j+1)*V+i];
  let nx=(hl-hr),nz=(hu-hd),ny=1;const l=hyp(nx,ny,nz);v[o]=i/2;v[o+1]=h[j*V+i];v[o+2]=j/2;v[o+3]=nx/l;v[o+4]=ny/l;v[o+5]=nz/l}
 // in stukken van 16×16 tegels, per rij aaneengesloten: zo tekenen we alleen de stukken die in beeld zijn (ook op een enorme kaart)
 const CS=16,ncx=Math.ceil(W/CS),ncy=Math.ceil(H/CS),ix=new Uint32Array(2*W*2*H*6),ck=[];let p=0;
 for(let cy=0;cy<ncy;cy++)for(let cx=0;cx<ncx;cx++){const p0=p;for(let j=cy*CS*2;j<Math.min(2*H,(cy+1)*CS*2);j++)for(let i=cx*CS*2;i<Math.min(2*W,(cx+1)*CS*2);i++){const a=j*V+i;ix[p++]=a;ix[p++]=a+V;ix[p++]=a+1;ix[p++]=a+1;ix[p++]=a+V;ix[p++]=a+V+1}ck.push([p0,p-p0])}
 const T0=R.terr||{vao:gl.createVertexArray(),vb:gl.createBuffer(),eb:gl.createBuffer()};gl.bindVertexArray(T0.vao);gl.bindBuffer(gl.ARRAY_BUFFER,T0.vb);gl.bufferData(gl.ARRAY_BUFFER,v,gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,T0.eb);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,ix,gl.STATIC_DRAW);T0.cnt=ix.length;T0.ck=ck;T0.ncx=ncx;T0.ncy=ncy;T0.cs=CS;gl.bindVertexArray(null);R.terr=T0;
 if(R.fogTex){gl.deleteTexture(R.fogTex);gl.deleteTexture(R.hgtTex);gl.deleteTexture(R.splatTex)}
 R.fog=new F32(W*H);R.fogB=new U8(W*H);R.fogTex=mkTex(gl.R8,W,H,gl.RED,gl.UNSIGNED_BYTE,R.fogB,true);
 R.hgtTex=mkTex(gl.R16F,V,VH,gl.RED,gl.FLOAT,h,true);R.splatTex=mkTex(gl.RGBA8,2*W,2*H,gl.RGBA,gl.UNSIGNED_BYTE,M.splat,true);M.splatD=0;
 if(R.forTex)gl.deleteTexture(R.forTex);R.forB=new U8(W*H);R.forTex=mkTex(gl.R8,W,H,gl.RED,gl.UNSIGNED_BYTE,R.forB,true);forestMap();
 for(let i=0;i<W*H;i++)R.fog[i]=M.vis[i]?1:M.expl[i]?.55:0;R.fogT=1;R.mini=null;R.camH=hAt(G.cam.x,G.cam.y)}
// bosvloer: hoe dicht staan de bomen rond elke tegel (5×5, vervaagd); donker onder het bos
function forestMap(){if(!R.forB)return;const N=W*H,t=new F32(N),b=R.forB;for(let i=0;i<N;i++){const rid=M.resAt[i];if(rid){const e=byId.get(rid);if(e&&e.rt==='tree'&&!e.felled)t[i]=1}}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let s=0,n=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;const w=3-Math.max(Math.abs(dx),Math.abs(dy));s+=t[yy*W+xx]*w;n+=w}b[y*W+x]=clamp(sstep(.18,.62,s/n)*255,0,255)}
 gl.bindTexture(gl.TEXTURE_2D,R.forTex);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,W,H,gl.RED,gl.UNSIGNED_BYTE,b);R.forT=G.time}
function updFog(dt){R.fogT+=dt;if(R.fogT<.08)return;R.fogT=0;const f=R.fog,b=R.fogB,v=M.vis,e=M.expl;for(let i=0;i<f.length;i++){const t=v[i]?1:e[i]?.55:0;f[i]+=(t-f[i])*.3;b[i]=f[i]*255}
 gl.bindTexture(gl.TEXTURE_2D,R.fogTex);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,W,H,gl.RED,gl.UNSIGNED_BYTE,b)}
function resize(){const w=cv.clientWidth||innerWidth,h=cv.clientHeight||innerHeight,d=Math.min(devicePixelRatio||1,2)*R.scale,pw=Math.max(2,Math.round(w*d)),ph=Math.max(2,Math.round(h*d));
 if(cv.width!==pw||cv.height!==ph){cv.width=pw;cv.height=ph}const ov=R.ov,od=Math.min(devicePixelRatio||1,2);if(ov.width!==Math.round(w*od)||ov.height!==Math.round(h*od)){ov.width=Math.round(w*od);ov.height=Math.round(h*od)}R.w=w;R.h=h;R.od=od}
function camSetup(dt){const c=G.cam,asp=R.w/R.h,fov=30*PI/180,th=Math.tan(fov/2),tilt=52*PI/180;c.zoom=clamp(c.zoom,R.zmin||6,36);c.x=clamp(c.x,0,W*32);c.y=clamp(c.y,0,H*32);
 const d=asp>=1?c.zoom/(2*th):c.zoom/(2*th*asp),ht=Math.max(0,hAt(c.x,c.y));R.camH+=(ht-R.camH)*Math.min(1,dt*4);
 const x=c.x/32,z=c.y/32;R.tgt[0]=x;R.tgt[1]=R.camH;R.tgt[2]=z;R.eye[0]=x;R.eye[1]=R.camH+d*Math.sin(tilt);R.eye[2]=z+d*Math.cos(tilt);R.dist=d;
 M4.persp(R.proj,fov,asp,Math.max(.5,d*.25),d*3+30);M4.look(R.view,R.eye,R.tgt,[0,1,0]);M4.mul(R.vp,R.proj,R.view);M4.inv(R.ivp,R.vp);
 // zichtbaar stuk kaart
 let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const[sx,sy]of[[0,0],[R.w,0],[0,R.h],[R.w,R.h]]){const p=pick(sx,sy,true);x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
 R.vr=[clamp(Math.floor(x0/32)-3,0,W-1),clamp(Math.floor(y0/32)-3,0,H-1),clamp(Math.ceil(x1/32)+3,0,W-1),clamp(Math.ceil(y1/32)+5,0,H-1)];
 // schaduwkaart volgt het zichtbare stuk
 const rad=Math.ceil(hyp(x1-x0,y1-y0)/64+3),s=R.sun,cxw=(x0+x1)/64,czw=(y0+y1)/64;M4.look(R.lv,[cxw+s[0]*60,R.camH+s[1]*60,czw+s[2]*60],[cxw,R.camH,czw],[0,1,0]);
 const tx=2*rad/2048,lx=R.lv[12],ly=R.lv[13],ox=lx-Math.round(lx/tx)*tx,oy=ly-Math.round(ly/tx)*tx;M4.ortho(R.lp,-rad+ox,rad+ox,-rad+oy,rad+oy,1,130);M4.mul(R.svp,R.lp,R.lv)}
function pick(sx,sy,flat){const nx=sx/R.w*2-1,ny=1-sy/R.h*2,m=R.ivp;
 const un=z=>{const w=m[3]*nx+m[7]*ny+m[11]*z+m[15];return[(m[0]*nx+m[4]*ny+m[8]*z+m[12])/w,(m[1]*nx+m[5]*ny+m[9]*z+m[13])/w,(m[2]*nx+m[6]*ny+m[10]*z+m[14])/w]};
 const a=un(-1),b=un(1),dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];let h=R.camH,t=(h-a[1])/dy;if(!flat)for(let i=0;i<5;i++){h=Math.max(0,hAt((a[0]+dx*t)*32,(a[2]+dz*t)*32));t=(h-a[1])/dy}
 return[(a[0]+dx*t)*32,(a[2]+dz*t)*32,a,[dx,dy,dz]]}
function w2s(x,y,z){const m=R.vp,w=m[3]*x+m[7]*y+m[11]*z+m[15];return[((m[0]*x+m[4]*y+m[8]*z+m[12])/w*.5+.5)*R.w,(1-((m[1]*x+m[5]*y+m[9]*z+m[13])/w*.5+.5))*R.h]}
const inView=(x,y)=>{const tx=x>>5,ty=y>>5;return tx>=R.vr[0]&&tx<=R.vr[2]&&ty>=R.vr[1]&&ty<=R.vr[3]};
const seen=e=>G.reveal||allied(0,e.o)||M.vis[tileI(clamp(e.x,0,W*32-1),clamp(e.y,0,H*32-1))];

// ---------- deeltjes ----------
function puff(type,px,py,h,n){if(PT.length>650||!inView(px,py)||!M.vis[tileI(clamp(px,0,W*32-1),clamp(py,0,H*32-1))])return;const x=px/32,z=py/32,y=Math.max(0,hAt(px,py))+h;
 for(let i=0;i<n;i++){const a=rnd()*TAU,s=rnd();let p;
  if(type==='smoke')p={vx:.06+rnd()*.05,vy:.3+rnd()*.15,vz:-.03,l:2.6,s0:.07,s1:.3,c:[.62,.6,.58,.32],g:0};
  else if(type==='dust')p={vx:Math.cos(a)*.5*s,vy:.25+rnd()*.4,vz:Math.sin(a)*.5*s,l:1.4,s0:.14,s1:.5,c:[.62,.55,.44,.5],g:.2,j:.6};
  else if(type==='chip')p={vx:Math.cos(a)*.7,vy:.9+rnd()*.6,vz:Math.sin(a)*.7,l:.5,s0:.03,s1:.02,c:[.75,.6,.38,1],g:4};
  else if(type==='spark')p={vx:Math.cos(a)*.8,vy:.8+rnd()*.7,vz:Math.sin(a)*.8,l:.35,s0:.03,s1:.01,c:[1,.8,.3,-1],g:4};
  else if(type==='splash')p={vx:Math.cos(a)*.6*s,vy:.8+rnd()*.8,vz:Math.sin(a)*.6*s,l:.7,s0:.05,s1:.03,c:[.8,.88,.92,.7],g:3.5,j:.3};
  else if(type==='alch')p={vx:(rnd()-.5)*.08,vy:.25+rnd()*.2,vz:(rnd()-.5)*.08,l:1.6,s0:.05,s1:.16,c:[.45,1,.5,-.55],g:0,j:.15};
  else if(type==='holy')p={vx:Math.cos(a)*.12,vy:.3+rnd()*.3,vz:Math.sin(a)*.12,l:1,s0:.07,s1:.02,c:[1,.86,.4,-.8],g:0,j:.25};
  else p={vx:Math.cos(a)*.08,vy:.45+rnd()*.3,vz:Math.sin(a)*.08,l:.7,s0:.12,s1:.03,c:[1,.5,.12,-.8],g:0,j:.3};
  const j=p.j||.05;p.x=x+(rnd()-.5)*j;p.y=y+rnd()*.05;p.z=z+(rnd()-.5)*j;p.t=0;PT.push(p)}}

// ---------- instances verzamelen ----------
function inst(mesh,x,y,z,rot,sx,sy,sz,r,g,b,a,e0,e1,e2,e3){M4.id(TM);TM[12]=x;TM[13]=y;TM[14]=z;if(rot)M4.rotY(TM,rot);if(sx!==1||sy!==1||sz!==1)M4.scale(TM,sx,sy,sz);mesh.add(TM,r,g,b,a,e0,e1,e2,e3)}
function part(mesh,tx,ty,tz,rx,sx,sy,sz,c,lay,hl){const m=MS.push();M4.trans(m,tx,ty,tz);if(rx)M4.rotX(m,rx);M4.scale(m,sx,sy,sz);mesh.add(m,c[0],c[1],c[2],PA,0,hl,0,lay===undefined?14:lay);MS.pop()}
const PANTS=[.36,.29,.22],HAIR=[[.32,.21,.12],[.58,.44,.22],[.18,.14,.12],[.66,.54,.36]],MONK=[.42,.3,.2],WHITE=[.92,.9,.84],IRON=[.66,.67,.7],LEATH=[.5,.36,.24],WRAP=[.8,.74,.62],SHOE=[.36,.25,.16],DARK=[.08,.07,.07],BEIGE=[.82,.74,.6];
const LSK=5,LCL=14,LLE=23,LML=22;
// been met knie en schoen; hoek <0 = naar voren
// versie 13: echte verhoudingen — langere benen en armen, smaller lijf, kleiner hoofd (ongeveer 1 op 7)
function leg(sx,hip,ang,knee,cl,wr,hl){const m=MS.push();M4.trans(m,sx,hip,0);M4.rotX(m,ang);
 part(MD.pLimb,0,0,0,0,.054,.138,.058,cl,LCL,hl);M4.trans(m,0,-.13,0);M4.rotX(m,knee);
 part(MD.pLimb,0,0,0,0,.044,.126,.047,wr,LCL,hl);part(MD.pBox,0,-.13,.014,0,.045,.024,.078,SHOE,LLE,hl);MS.pop()}
// arm met elleboog en hand. Het gereedschap of wapen hangt als aparte laag aan het handpunt:
// tp = helling van het onderdeel ten opzichte van het lichaam (0 = recht omhoog, PI/2 = recht vooruit), ty = draaiing om de eigen as
function arm(sx,y,ang,elb,sl,hl,tool,tp,tc,ts,ty,extra){const m=MS.push();M4.trans(m,sx,y,0);M4.rotX(m,ang);
 part(MD.pLimb,0,0,0,0,.042,.112,.046,sl,LCL,hl);M4.trans(m,0,-.106,0);M4.rotX(m,elb);
 part(MD.pLimb,0,0,0,0,.036,.1,.04,sl,LCL,hl);part(MD.pBall,0,-.105,.004,0,.032,.036,.032,SKIN,LSK,hl);
 if(tool){const k=MS.push();M4.trans(k,0,-.105,.012);M4.rotX(k,tp-ang-elb);if(ty)M4.rotY(k,ty);if(ts&&ts!==1)M4.scale(k,ts,ts,ts);tool.add(k,tc[0],tc[1],tc[2],PA,0,hl,0,0);if(extra)extra(k);MS.pop()}MS.pop()}
const GOLDC=[.93,.7,.2],STONEC=[.4,.4,.42];
const mixf=(a,b,t)=>a+(b-a)*clamp(t,0,1),ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const hexc=h=>{const v=parseInt(h.slice(1),16);return[(v>>16&255)/255,(v>>8&255)/255,(v&255)/255]},ACC={};
const accent=o=>{const cv=o>=0&&G.civs[o]?G.civs[o].civ:'kust';return ACC[cv]||(ACC[cv]=hexc(BAL.beschavingen[cv].accent))};
const STEEL=[.6,.63,.68],WAM=[.8,.72,.56],FUR=[.45,.4,.34];
// ---------- uitrusting per eenheid: w = wapen (rechterhand), l = boog (linkerhand), sh = schild, hd = hoofd, bd = pantser, an = aanval ----------
const KIT={
 militie:{w:['w_knots','w_kzwaard'],an:'slag'},
 sword:{w:'w_zwaard',sh:'s_rond',hd:'h_nasal',bd:'mail',an:'slag'},
 lzwaard:{w:'w_lzwaard',sh:'s_groot',hd:'h_pot',bd:'mail',tab:1,an:'slag'},
 spear:{w:'w_speer',sh:'s_rond',hd:'h_nasal',an:'steek'},
 piek:{w:'w_piek',hd:'h_ketel',bd:'plaat',an:'steek',two:1},
 bow:{l:'w_boog',q:1,hd:'kap',an:'boog'},
 kboog:{w:'w_kruisboog',hd:'h_ketel',bd:'wam',an:'kruis'},
 arba:{w:'w_kruisboog',ws:1.18,hd:'h_ketel',bd:'wam',borst:1,an:'kruis'},
 skirm:{w:'w_spies',sh:'s_klein',hd:'muts',bd:'leer',an:'werp'},
 scout:{w:'w_sabel',hd:'muts',an:'slag'},
 lruiter:{w:'w_sabel',hd:'h_nasal',bd:'leer',an:'slag'},
 knight:{w:'w_lans',sh:'s_ridder',hd:'h_nasal',bd:'mail',an:'lans',kleed:1},
 draak:{w:'w_lans',sh:'s_ridder',hd:'h_pot',bd:'plaat',tab:1,pluim:1,an:'lans',kleed:2},
 zridder:{w:'w_lans',sh:'s_ridder',hd:'h_pot',bd:'plaat',tab:1,pluim:1,an:'lans',kleed:2},
 monk:{w:'w_staf'},
 bijl:{w:'w_werpbijl',sh:'s_rond',hd:'h_nasal',bd:'leer',cape:1,an:'werp'},
 lans:{w:'w_lans',ws:1.08,wimpel:1,sh:'s_ridder',hd:'h_ketel',bd:'mail',tab:2,an:'lans',kleed:1},
 lboog:{l:'w_lboog',q:1,hd:'kap',cape:1,an:'boog'},
 musket:{w:'w_musket',hd:'h_ketel',bd:'leer',tab:1,an:'kruis'},
 snaphaan:{w:'w_musket',ws:1.06,hd:'h_pot',bd:'mail',tab:1,borst:1,an:'kruis'},
 kuras:{w:'w_sabel',sh:'s_klein',hd:'h_pot',bd:'plaat',tab:1,pluim:1,an:'slag',kleed:1}};
const OLDW={w_musket:'musket',w_knots:'axe',w_kzwaard:'sword',w_zwaard:'sword',w_lzwaard:'sword',w_sabel:'sword',w_speer:'spear',w_piek:'spear',w_spies:'spear',w_lans:'spear',w_staf:'staff',w_werpbijl:'axe',w_boog:'bow',w_lboog:'bow',w_kruisboog:'bow',
 t_bijl:'axe',t_pik:'pick',t_schoffel:'hoe',t_hamer:'hammer',t_jspeer:'spear',t_mes:'sword'};
const G_=k=>k?GR[k]||MD[OLDW[k]]||null:null;
// gereedschap van een dorpeling bij zijn taak: [onderdeel, houding]
function vilJob(u){const r=u.tgt;if(u.st===4)return['t_hamer','bouw'];if(u.st===5)return['t_bijl','hak'];
 if(u.st===2||u.st===3){let g=u.st===2&&r&&!r.dead?(r.k==='b'?'akker':r.k==='u'?(r.t==='sheep'?'carcass':'jacht'):r.rt):u.grt;
  if(g==='sheep')g='carcass';if(g==='tree')return['t_bijl','hak'];if(g==='gold'||g==='stone')return['t_pik','hak'];if(g==='berry')return['t_mand','pluk'];if(g==='akker')return['t_schoffel','schoffel'];
  if(g==='jacht')return['t_jspeer','jacht'];if(g==='carcass')return[u.st===2&&r&&r.k==='u'?'t_mes':'t_mes','slacht']}
 return[null,'']}
// de lading die een dorpeling draagt: [onderdeel, plek] (schouder, of het mandje aan de arm)
function vilLoad(u){if(u.cn<1)return null;const k=u.ck,src=u.cs||u.grt;if(k==='w')return'c_hout';if(k==='s')return'c_steen';if(k==='g')return'c_goud';
 if(k==='f')return src==='berry'?'c_bes':src==='akker'?'c_graan':'c_vlees';return null}
function human(u,walk,act,c,hl,mnt){const t=u.t,vil=t==='vil',K=KIT[t]||{},d=UD[t],now=G.time,still=!u.mv,sw=now-(u.swing||-9);
 const job=vil?vilJob(u):null,jp=job?job[1]:'',work=vil&&still&&(u.st===2||u.st===4)&&u.tgt&&!u.tgt.dead;
 const kn=!mnt&&vil&&still&&((u.st===4&&u.kneel)||(u.st===2&&jp==='slacht'&&u.tgt&&u.tgt.k==='r')),hip=mnt?.16:kn?.15:.262,fem=u.fem&&vil,robe=!mnt&&(t==='monk'||fem),hr=HAIR[u.id&3];
 const cs=[c[0]*.6+.12,c[1]*.6+.11,c[2]*.6+.1],ac=d.uniek?accent(u.o):cs;
 let tun=t==='monk'?MONK:vil?VILC[(u.id>>1)%VILC.length]:cs,body=tun,blay=LCL,slv;
 if(K.bd==='mail'){body=IRON;blay=LML}else if(K.bd==='plaat'){body=STEEL;blay=LCL}else if(K.bd==='wam'){body=WAM;tun=WAM}else if(K.bd==='leer'){body=LEATH;blay=LLE}
 slv=K.bd==='plaat'?STEEL:K.bd==='mail'?IRON:[tun[0]*.88,tun[1]*.88,tun[2]*.88];const slay=K.bd==='mail'?LML:LCL;
 // ---- houding: armen (hoek, elleboog), helling van wapen of gereedschap, buiging van het bovenlijf ----
 let ra=-walk*.6,re=-.35,la=mnt?-.5:walk*.6,le=-.3,rp=.9,lp=.5,bend=0,rt=null,lt=null,rs=K.ws||1,ry=0,rex=null,lex=null,hideR=0;
 const fight=u.st===5&&still&&u.tgt&&!u.tgt.dead,cd=u.cd>0?u.cd:0;
 // aanloop naar de volgende slag (0..1) en de slag zelf (tijd sinds de klap)
 const pre=w=>fight&&cd<w?1-cd/w:0;
 if(vil){rt=G_(job[0]);const load=u.st!==4&&(u.st!==2||!still)?vilLoad(u):null,cap=capOf(u),big=u.cn>=cap*.75?1:.74;
  const wk=work?clamp((u.work||0)/(u.st===4?.7:.9),0,1):0,up=work?ease((wk-.25)/.75):0,hit=work&&sw<.16?sw/.16:work&&sw<.32?1:-1;
  if(jp==='hak'||jp==='bouw'){const lo=jp==='bouw'?-.75:job[0]==='t_pik'?-.8:-1.05,hi=jp==='bouw'?-2.05:-2.55,pl=jp==='bouw'?2.0:job[0]==='t_pik'?2.15:1.75;
   if(hit>=0){ra=mixf(hi,lo,hit);rp=mixf(-.45,pl,hit);re=-.25}else if(work){ra=mixf(lo+.15,hi,up);rp=mixf(pl-.5,-.45,up);re=mixf(-.5,-.9,up)}else{ra=-walk*.5-.1;re=-.6;rp=.55}
   if(work&&jp==='hak'){la=ra*.55;le=-.9;bend=.12+(hit>=0?.14*hit:0)}if(u.st===5&&!work){const k2=act;ra=-.3-k2*1.6;rp=.4+k2*1.2}}
  else if(jp==='pluk'){lt=G_(u.cn>=1?'c_bes':'t_mand')||rt;rt=null;const fill=u.cn>=1?(u.cn>=cap*.6?1:.82):1;lex=fill;la=-.55+walk*.15;le=-1.0;lp=0;
   if(work){bend=.5+.08*Math.sin(now*3+u.id);ra=-1.15+.45*Math.sin(now*6.5+u.id);re=-.35-.25*Math.sin(now*6.5+u.id+1)}}
  else if(jp==='schoffel'){if(work){const o=Math.sin(now*5+u.id);bend=.3;ra=-.75+.28*o;re=-.45;rp=2.2-.12*o;la=-1.05+.28*o;le=-.5}else{ra=-walk*.4-.15;re=-.5;rp=.25}}
  else if(jp==='jacht'){const th=now-(u.throwT||-9);if(th<.45){hideR=1;ra=mixf(-2.7,-.9,th/.16);re=-.4}else if(still&&cd<.75&&u.st===2){const k2=ease(1-cd/.75);ra=mixf(-.5,-2.75,k2);re=mixf(-.7,-1.1,k2);rp=mixf(1.1,1.62,k2)}else{ra=-.45-walk*.2;re=-.75;rp=1.15}}
  else if(jp==='slacht'){if(kn){bend=.55;const o=Math.sin(now*7+u.id);ra=-.95+.3*o;re=-.55-.2*o;rp=2.5;la=-1.0;le=-.6}else{ra=-walk*.5-.1;re=-.6;rp=1.9}}
  if(load&&load!=='c_bes'){// lading op de rechterschouder; het gereedschap gaat naar de linkerhand
   lt=rt;lp=.45;la=walk*.45-.05;le=-.35;rt=null;ra=-2.75;re=-1.75;rex=[G_(load)||(load==='c_hout'?MD.logs:MD.sack),big,load]}
  else if(load){lt=G_('c_bes');lex=big;if(jp!=='pluk'){rt=null;la=-.55+walk*.15;le=-1.0;lp=0}}}
 else if(K.an==='slag'||(!K.an&&K.w&&t!=='monk')){rt=G_(Array.isArray(K.w)?K.w[u.id&1]:K.w);const p=ease(pre(.5));ra=-walk*.6-.2;re=-.55;rp=mnt?.7:.95;
  if(sw<.16){ra=mixf(-2.5,-.75,sw/.16);rp=mixf(-.35,1.95,sw/.16);re=-.2}else if(sw<.42){const k2=(sw-.16)/.26;ra=mixf(-.75,-.2,k2);rp=mixf(1.95,.95,k2);re=mixf(-.2,-.55,k2)}
  else if(p>0){ra=mixf(ra,-2.5,p);rp=mixf(rp,-.35,p);re=mixf(-.55,-.9,p)}}
 else if(K.an==='steek'){rt=G_(K.w);const lv=fight||(u.st===5&&u.am)||sw<.6,p=ease(pre(.45));ra=-.3-walk*.15;re=-.65;rp=.22;
  if(lv){ra=.3;re=-1.25;rp=1.5}if(sw<.12){ra=mixf(.55,-1.05,sw/.12);re=mixf(-1.5,-.2,sw/.12);rp=1.52}else if(sw<.45){const k2=(sw-.12)/.33;ra=mixf(-1.05,.3,k2);re=mixf(-.2,-1.25,k2);rp=1.5}else if(p>0){ra=mixf(.3,.55,p);re=mixf(-1.25,-1.5,p)}
  if(K.two&&(lv||sw<.6)){la=ra*.35-.75;le=-.7}}
 else if(K.an==='lans'){rt=G_(K.w);const lv=u.st===5||sw<.7;ra=-.25;re=-.7;rp=.12;
  if(lv){ra=.25;re=-1.35;rp=1.48}if(sw<.14){ra=mixf(.25,-.6,sw/.14);re=mixf(-1.35,-.55,sw/.14)}else if(sw<.5){const k2=(sw-.14)/.36;ra=mixf(-.6,.25,k2);re=mixf(-.55,-1.35,k2)}
  if(K.wimpel)rex='wimpel'}
 else if(K.an==='boog'){lt=G_(K.l);const p=pre(.9),aim=fight||sw<.3;la=walk*.5-.1;le=-.5;lp=.18;ra=-walk*.5;re=-.4;
  if(aim){la=-1.5;le=-.05;lp=0;const dr=sw<.3?1-sw/.3*.4:ease((p-.25)/.6);ra=mixf(-1.4,-1.25,dr);re=mixf(-.25,-2.1,dr);
   if(p>.12&&sw>.3){const k=MS.push();M4.trans(k,-.085,hip+.19,mixf(.2,.1,dr));MD.arrow.add(k,1,1,1,PA,0,hl,0,0);MS.pop()}}}
 else if(K.an==='kruis'){rt=G_(K.w);ra=-.55-walk*.1;re=-.95;rp=.95;la=-.7;le=-1.0;
  if(fight||sw<.3){if(cd>.95&&sw>.3){// laden: kruisboog omlaag, de linkerhand spant de pees
    bend=.38;rp=2.85;ra=-.35;re=-.55;la=-.55+.3*Math.sin(now*9+u.id);le=-1.0}
   else{const k2=sw<.3?1:ease(1-cd/.95);ra=mixf(-.35,-1.2,k2);re=mixf(-.55,-.45,k2);rp=mixf(2.85,1.56,k2)+(sw<.12?-.18*(1-sw/.12):0);la=mixf(-.55,-1.3,k2);le=-.35;
    if(sw>.3&&k2>.3)rex='bout'}}}
 else if(K.an==='werp'){rt=G_(K.w);const p=ease(pre(.55));ra=-walk*.5-.25;re=-.6;rp=K.w==='w_spies'?.2:.7;
  if(sw<.5){hideR=sw>.05?1:0;ra=mixf(-2.7,-.8,sw/.14);re=-.3}else if(p>0){ra=mixf(ra,-2.7,p);re=mixf(-.6,-1.1,p);rp=mixf(rp,K.w==='w_spies'?1.55:-.3,p)}}
 else if(t==='monk'){rt=G_('w_staf');const pr=u.st===6||u.st===7;ra=-.4-(pr?.8:0)-walk*.15;re=-.5;rp=pr?.45:.12}
 // ---- benen of rok ----
 if(robe){part(MD.pRobe,0,0,0,0,.17,hip+.035,.135,tun,LCL,hl);for(const sx of[-1,1])part(MD.pBox,sx*.04,0,.03+walk*sx*.03,0,.05,.026,.08,SHOE,LLE,hl);
  if(fem)part(MD.pBox,0,.05,.083,0,.12,hip-.02,.012,BEIGE,LCL,hl)}
 else{const lw=K.bd==='plaat'?STEEL:WRAP,pc=K.bd==='plaat'||K.bd==='mail'?IRON:PANTS;
  if(mnt){leg(-.12,hip,-1.15,1.35,pc,lw,hl);leg(.12,hip,-1.15,1.35,pc,lw,hl)}
  else if(kn){leg(-.05,hip,-1.45,1.45,pc,lw,hl);leg(.05,hip,-.15,1.55,pc,lw,hl)}
  else{leg(-.045,hip,walk*.65,Math.max(0,walk)*.9+.05,pc,lw,hl);leg(.045,hip,-walk*.65,Math.max(0,-walk)*.9+.05,pc,lw,hl)}}
 if(!robe)part(MD.pSkirt,0,hip+.035,0,0,.178,mnt?.05:.11,.118,tun,LCL,hl);
 // ---- bovenlijf (buigt mee bij plukken, schoffelen en laden) ----
 const B=MS.push();if(bend){M4.trans(B,0,hip,0);M4.rotX(B,bend);M4.trans(B,0,-hip,0)}
 if(K.bd){part(MD.pTorso,0,hip-.005,0,0,.158,.222,.1,body,blay,hl);if(K.bd!=='leer')part(MD.pSkirt,0,hip+.035,0,0,.185,mnt?.04:.07,.122,body,blay,hl)}
 else part(MD.pTorso,0,hip-.005,0,0,.15,.222,.094,tun,LCL,hl);
 // dorpeling: duidelijk vlak in de spelerskleur — een vest (man) of een lijfje (vrouw) over het werkkleed, plus een sjerp
 if(vil){part(MD.pTorso,0,hip+.035,.003,0,.156,.15,.098,c,LCL,hl);part(MD.pBox,0,hip+.012,0,0,.162,.03,.104,[c[0]*.75,c[1]*.75,c[2]*.75],LCL,hl)}
 if(K.borst)part(MD.pTorso,0,hip+.045,.004,0,.164,.16,.106,STEEL,LCL,hl);
 if(K.tab){const tc=K.tab===2?ac:c;part(MD.pBox,0,hip-.07,.052,0,.105,.25,.012,tc,LCL,hl);part(MD.pBox,0,hip-.07,-.064,0,.105,.25,.012,tc,LCL,hl);part(MD.pBox,0,hip+.168,0,0,.125,.014,.125,tc,LCL,hl)}
 if(t!=='monk')part(MD.pBox,0,hip+.012,0,0,K.bd?.182:.172,.024,K.bd?.12:.112,K.bd==='leer'?DARK:LEATH,LLE,hl);else part(MD.pBox,0,hip+.012,0,0,.17,.02,.11,BEIGE,LCL,hl);
 if(t==='monk'){for(const sx of[-1,1])part(MD.pBox,sx*.035,hip-.05,.06,0,.026,.24,.012,cs,LCL,hl);part(MD.pBall,0,hip+.2,-.04,0,.12,.05,.05,MONK,LCL,hl)}
 if(K.cape){part(MD.pBox,0,hip-.06,-.075,0,.17,.25,.014,t==='bijl'?FUR:ac,LCL,hl);part(MD.pBall,0,hip+.185,-.02,0,.2,.05,.13,t==='bijl'?FUR:ac,LCL,hl)}
 if(K.q){const q=GR.w_koker,k=MS.push();M4.trans(k,.04,hip+.1,-.085);M4.rotZ(k,-.4);if(q)q.add(k,c[0],c[1],c[2],PA,0,hl,0,0);else{part(MD.pBox,0,-.08,0,0,.04,.17,.04,LEATH,LLE,hl);part(MD.pBox,0,.09,0,0,.05,.03,.045,WHITE,LCL,hl)}MS.pop()}
 // ---- hoofd ----
 const hd=hip+.228;{const H=MS.push();M4.trans(H,0,hd,0);M4.scale(H,.74,.74,.74);M4.trans(H,0,-hd,0)}part(MD.pLimb,0,hd+.015,0,0,.04,.03,.04,SKIN,LSK,hl);part(MD.pHead,0,hd,0,0,.098,.11,.1,SKIN,LSK,hl);
 part(MD.pBox,0,hd+.045,.045,0,.016,.024,.02,SKIN,LSK,hl);for(const sx of[-1,1])part(MD.pBox,sx*.021,hd+.064,.044,0,.012,.01,.008,DARK,LSK,hl);
 const beard=!fem&&(t==='monk'||((u.id*7)%3)!==0);if(beard&&K.hd!=='h_pot')part(MD.pBeard,0,hd+.05,.02,0,.088,.085,.075,hr,LCL,hl);
 if(fem){part(MD.pHair,0,hd-.004,-.004,0,.118,.126,.118,WHITE,LCL,hl);part(MD.pBox,0,hd-.03,-.052,0,.1,.1,.024,WHITE,LCL,hl)}
 else if(K.hd==='kap'){part(MD.pHair,0,hd-.006,-.006,0,.122,.13,.124,ac,LCL,hl);part(MD.pBall,0,hd+.012,-.01,0,.15,.04,.13,ac,LCL,hl)}
 else if(t==='monk'){part(MD.pHair,0,hd-.002,-.004,0,.106,.116,.108,hr,LCL,hl);part(MD.pBall,0,hd+.11,-.004,0,.07,.025,.07,SKIN,LSK,hl)}
 else if(K.hd==='muts')part(MD.pHair,0,hd+.004,-.004,0,.11,.12,.11,LEATH,LLE,hl);
 else if(K.hd){part(MD.pHair,0,hd-.01,-.008,0,.104,.112,.106,hr,LCL,hl);const hm=GR[K.hd],m=MS.push();
  if(hm){M4.trans(m,0,hd+HELMY[K.hd],0);hm.add(m,c[0],c[1],c[2],PA,0,hl,0,0)}else{M4.trans(m,0,hd+.07,0);MD.helm.add(m,1,1,1,PA,0,hl,0,0)}MS.pop();
  if(K.pluim)part(MD.pBox,0,hd+.125,-.03,-.3,.022,.075,.07,c,LCL,hl)}
 else part(MD.pHair,0,hd-.002,-.006,0,.106,.118,.108,hr,LCL,hl);
 MS.pop(); // einde kleiner hoofd
 // ---- armen met wapen, gereedschap en lading ----
 const sy=hip+.205;
 let lx=null;if(lt&&lt===GR.c_bes)lx=k=>{const z=lt.sz,n=lt.mn,y=n[1]+z[1]*.52;  // vol mandje: rode bessen bovenin
  for(let i=0;i<5;i++){const a=i*1.2566;part(MD.pBall,n[0]+z[0]*(.5+(i?.2*Math.cos(a):0)),y+(i?0:z[1]*.05),n[2]+z[2]*(.5+(i?.2*Math.sin(a):0)),0,z[0]*.3,z[0]*.26,z[0]*.3,i&1?[.62,.1,.2]:[.85,.13,.16],LCL,hl)}};
 arm(-.098,sy,la,le,slv,hl,lt,lp,c,typeof lex==='number'?lex:1,0,lx);
 let ex=null;if(rex==='wimpel')ex=k=>{const L=(GR.w_lans?GR.w_lans.mn[1]+GR.w_lans.sz[1]:.8)-.2,w=.03*Math.sin(now*6+u.id);part(MD.pBox,0,L,-.07+w,0,.008,.075,.13,ac,LCL,hl)};
 else if(rex==='bout')ex=k=>{const m=MS.push();M4.trans(m,0,.17,.012);M4.rotX(m,-PI/2);M4.scale(m,.7,.7,.62);MD.arrow.add(m,1,1,1,PA,0,hl,0,0);MS.pop()};
 arm(.098,sy,ra,re,slv,hl,hideR?null:rt,rp,c,rs,ry,ex);
 if(Array.isArray(rex)&&rex[0]){const k=MS.push(),s=rex[1],ld=rex[2];
  if(ld==='c_hout'){M4.trans(k,.095,sy+.022,-.02);M4.rotY(k,PI/2)}                        // bundel hout op de schouder
  else if(ld==='c_steen'||ld==='c_goud'){M4.trans(k,.05,sy-.085,-.105);M4.rotX(k,-.28)}    // zak over de schouder op de rug
  else if(ld==='c_graan'){M4.trans(k,.1,sy+.075,-.03);M4.rotX(k,-1.25)}                    // schoof over de schouder, aren naar achteren
  else{M4.trans(k,.1,sy+.085,-.01);M4.rotX(k,-1.35)}                                       // stuk vlees over de schouder
  M4.scale(k,s,s,s);rex[0].add(k,c[0],c[1],c[2],PA,0,hl,0,0);
  if((ld==='c_steen'||ld==='c_goud')&&rex[0].sz){const g=rex[0],z=g.sz,n=g.mn,gd=ld==='c_goud',cl=gd?GOLDC:STONEC;  // de zak is gevuld: brokken steen of goud bovenin
   part(MD.pBall,n[0]+z[0]*.5,n[1]+z[1]*.84,n[2]+z[2]*.5,0,z[0]*.62,z[1]*.3,z[2]*.62,cl,LCL,hl);part(MD.pBall,n[0]+z[0]*.36,n[1]+z[1]*.93,n[2]+z[2]*.56,0,z[0]*.3,z[1]*.24,z[2]*.3,gd?[1,.86,.4]:[.52,.52,.54],LCL,hl)}
  MS.pop()}
 // schild aan de linkerarm: blijft zichtbaar bij lopen en vechten
 if(K.sh){const sm=GR[K.sh],k=MS.push();M4.trans(k,-.15,hip+.105,.045);M4.rotY(k,-1.05);if(sm){sm.add(k,c[0],c[1],c[2],PA,0,hl,0,0);if(K.sh==='s_rond')part(MD.pBall,0,0,sm.mn[2]+sm.sz[2]+.004,0,.07,.07,.045,IRON,LML,hl)}else MD.shield.add(k,c[0],c[1],c[2],PA,0,hl,0,0);MS.pop()}
 if(u.relic&&!uModel('u_relik')){const k=MS.push();M4.trans(k,0,hip+.42,0);part(MD.pBox,0,0,0,0,.1,.08,.08,[.85,.68,.25],LCL,hl);MS.pop()}
 MS.pop()}
const VILC=[[.46,.36,.24],[.4,.38,.31],[.36,.38,.28],[.5,.44,.33]]; // werkkleding: bruin, grijs, groengrijs, vlas
const HELMY={h_nasal:.045,h_pot:-.012,h_ketel:.062};
// 3D-modellen (Higgsfield) voor schepen, belegeringswapens, handelskar en wild; anders de oude vormen
const UMOD={fish:['u_fish'],trans:['u_trans','u_tship'],tship:['u_tship','u_trans'],war:['u_war'],owar:['u_owar','u_war'],brand:['u_brand','u_war'],ramschip:['u_ramschip','u_brand','u_war'],galjoen:['u_galjoen','u_owar','u_war'],kaper:['u_kaper','u_owar','u_war'],
 fregat:['u_fregat','u_galjoen','u_owar','u_war'],oostind:['u_oostind','u_tship','u_trans'],veldkanon:['u_veldkanon'],mortier:['u_mortier'],ram:['u_ram'],cat:['u_cat'],kar:['u_kar'],hert:['u_hert'],zwijn:['u_zwijn']};
const USC={fregat:1.1,oostind:1.1,veldkanon:1,mortier:1,owar:1.12,kaper:1.0,hert:.6,zwijn:.72,ram:.82,cat:.82,kar:.85};
function drawModelUnit(u,m,dead){const d=UD[u.t],x=u.x/32,z=u.y/32,hl=u.flash>G.time?1:0,team=u.o>=0?u.o+1:0,sc=USC[u.t]||1;
 if(d.ship){const bob=Math.sin(G.time*1.7+u.id)*.014;addRM(m,x,-.06+bob,z,u.face-PI/2,sc,sc,hl,team);
  // SAM 3D laat dunne masten en zeilen weg: die krijgen transport- en handelsschepen hier, met het zeil in de spelerskleur
  if(u.t==='trans'||u.t==='tship'){const c=u.o>=0?CIVS[u.o].col:[.9,.88,.8],y0=-.06+bob+m.h*.55,sx=Math.sin(u.face),sz=Math.cos(u.face),mx=x-sx*.12,mz=z-sz*.12;
   inst(MD.pBox,mx,y0,mz,u.face,.06,1.1,.06,.42,.3,.2,1,0,hl,0,0);inst(MD.pBox,mx,y0+.98,mz,u.face,.9,.05,.05,.42,.3,.2,1,0,hl,0,0);
   const sw=Math.sin(G.time*1.1+u.id)*.03;inst(MD.pBox,mx+sx*(.05+sw),y0+.38,mz+sz*(.05+sw),u.face,.82,.6,.025,u.t==='tship'?.92:c[0]*.7+.25,u.t==='tship'?.88:c[1]*.7+.25,u.t==='tship'?.78:c[2]*.7+.25,1,0,hl,0,14);
   if(u.t==='tship')inst(MD.pBox,mx+sx*.07,y0+.55,mz+sz*.07,u.face,.84,.12,.03,c[0],c[1],c[2],1,0,hl,0,14);return}
  if(u.o>=0){const c=CIVS[u.o].col,h=m.h*sc;inst(MD.pBox,x,-.06+h+.04,z,u.face,.05,.12,.22,c[0],c[1],c[2],1,0,hl,0,14)}return}
 const ani=ANIMAL(u.t),y=hAt(u.x,u.y),bob=u.mv&&ani?Math.abs(Math.sin(u.anim*(u.t==='hert'?.38:.6)))*.018:0;addRM(m,x,y+bob,z,u.face-PI/2,sc,sc,hl,ani?animalEx(u,team):team);
 if(u.o>=0&&!ANIMAL(u.t)){const c=CIVS[u.o].col;inst(MD.pBox,x,y+m.h+.06,z,u.face,.04,.1,.18,c[0],c[1],c[2],1,0,hl,0,14)}}
function drawUnit(u,dead){const d=UD[u.t],x=u.x/32,z=u.y/32,c=u.o>=0?CIVS[u.o].col:[.62,.6,.56],hl=u.flash>G.time?1:0;
 if(!dead&&UMOD[u.t]){const m=uModel(...UMOD[u.t]);if(m){drawModelUnit(u,m,dead);return}}
 // schaap (versie 12.2): Higgsfield-model in twee varianten; een eigen schaap krijgt een verfmerk in de spelerskleur op de rug, zoals boeren dat doen
 if(!dead&&u.t==='sheep'){const m=uModel(u.id&1?'u_sheep1':'u_sheep0','u_sheep0');if(m){const y=hAt(u.x,u.y),bob=u.mv?Math.abs(Math.sin(u.anim*.52))*.012:0;addRM(m,x,y+bob,z,u.face-PI/2,1,1,hl,animalEx(u,-1));
  if(u.o>=0){const sx=Math.sin(u.face),sz=Math.cos(u.face);inst(MD.pBox,x-sx*.04,y+bob+m.h*.93,z-sz*.04,u.face,.15,.03,.13,c[0],c[1],c[2],1,0,hl,0,14)}return}}
 if(dead&&(d.ship||UMOD[u.t]))return;
 if(d.ship){const m=MS.reset();M4.trans(m,x,.035+Math.sin(G.time*1.7+u.id)*.014,z);M4.rotY(m,u.face);M4.rotZ(m,Math.sin(G.time*1.3+u.id)*.035);
  (u.t==='fish'?MD.shFish:CIVS[u.o].st===3?MD.shLong:MD.shWar).add(m,c[0],c[1],c[2],1,0,hl,0,0);return}
 const y=hAt(u.x,u.y);
 if(u.t==='veldkanon'||u.t==='mortier'){const m=MS.reset();M4.trans(m,x,y,z);M4.rotY(m,u.face);if(dead){M4.rotZ(m,.5);M4.trans(m,0,-.05,0)}M4.scale(m,1.25,1.25,1.25);(u.t==='mortier'?MD.mortier:MD.kanon).add(m,c[0],c[1],c[2],1,0,hl,0,0);return}
 if(u.t==='sheep'||u.t==='hert'||u.t==='zwijn'||((d.cls==='beleg'||d.handel)&&!d.ship)){const m=MS.reset();M4.trans(m,x,y+(u.mv?Math.abs(Math.sin(u.anim*1.4))*.03:0),z);M4.rotY(m,u.face);MD.sheep.add(m,c[0],c[1],c[2],1,0,hl,0,0);return}
 const m=MS.reset();M4.trans(m,x,y,z);M4.rotY(m,u.face);
 let fk=1;if(dead){fk=u.dT!==undefined?ease(clamp((G.time-u.dT)/.6,0,1)):1;if(d.horse){const hm=MS.push();M4.trans(hm,0,.02*fk,0);M4.rotZ(hm,fk*PI/2*(u.dir||1));M4.trans(hm,0,-.05*fk,0);{const bs=1.3;M4.scale(hm,bs,bs,bs)}const mul=[1,.72,1.25,.55][(u.hid||0)&3];MD.horse.add(hm,c[0],c[1],c[2],PA,0,hl,0,mul);MS.pop();M4.trans(m,.5*fk,0,0)}
  M4.trans(m,0,.06*fk,0);M4.rotX(m,-PI/2*fk)}{const bs=1.3*(d.groot||1);M4.scale(m,bs,bs,bs)}
 const walk=!dead&&u.mv?Math.sin(u.anim):0,sw=G.time-(u.swing||-9),act=!dead&&sw<.45?Math.sin(sw/.45*PI):0;
 if(d.horse&&!dead){const mul=[1,.72,1.25,.55][u.id&3],hc=[.62*mul,.46*mul,.32*mul];MD.horse.add(m,c[0],c[1],c[2],1,0,hl,0,mul);
  for(let i=0;i<4;i++){const k=MS.push();M4.trans(k,i&1?.06:-.06,.28,i&2?.2:-.2);M4.rotX(k,walk*.7*((i===0||i===3)?1:-1));part(MD.pLimb,0,0,0,0,.045,.15,.052,hc,LLE,hl);M4.trans(k,0,-.14,0);M4.rotX(k,Math.max(0,walk*((i===0||i===3)?-1:1))*.8);part(MD.pLimb,0,0,0,0,.034,.13,.038,hc,LLE,hl);part(MD.pBox,0,-.15,.004,0,.04,.03,.045,DARK,LLE,hl);MS.pop()}
  // paardenkleed in de spelerskleur: ridder een dek, zware ridder een volledig kleed met hals- en borststuk
  const kl=(KIT[u.t]||{}).kleed;if(kl){const c2=[c[0]*.82+.04,c[1]*.82+.04,c[2]*.82+.04],dn=kl>1?.2:.13;
   part(MD.pBall,0,.335,-.02,0,.285,.275,.6,c,LCL,hl);                                                        // dek over de romp
   for(const sx of[-1,1])part(MD.pBox,sx*.128,.335-dn,-.03,0,.022,dn,.44,c2,LCL,hl);                           // afhangende zijpanden
   part(MD.pBox,0,.335-dn*.8,.235,0,.24,dn*.8+.02,.03,c2,LCL,hl);                                              // borststuk
   if(kl>1){const k=MS.push();M4.trans(k,0,.4,.2);M4.rotX(k,.55);part(MD.pBall,0,.11,0,0,.17,.3,.15,c,LCL,hl);MS.pop();  // halskleed
    for(const sx of[-1,1])part(MD.pBox,sx*.13,.335-dn,-.03,0,.026,.03,.45,WHITE,LCL,hl);part(MD.pBox,0,.335-dn*.8,.24,0,.245,.03,.03,WHITE,LCL,hl)}}
  MS.push();M4.trans(MS.m,0,.33,-.02);human(u,0,act,c,hl,1);MS.pop()}
 else human(u,walk,act,c,hl,0)}
// gebouwen zonder eigen 3D-model lenen er één als de geschilderde atlas ontbreekt
const MESHALT={kanongieterij:'kazerne',handelskantoor:'opslag',bastion:'kerk',pmolen:'molen',houtkamp:'opslag',mijnkamp:'opslag',markt:'opslag',schietbaan:'kazerne',kasteel:'kerk',smederij:'opslag',universiteit:'lab',werkplaats:'kazerne'};
// houthakkerskamp: stapels stammen en een hakblok met bijl; mijnkamp: brokken steen en goud, zakken en een pikhouweel (allemaal 3D)
// versie 13: herkenbare gebouwen — eigen 3D-spullen per functie, vaandels in de spelerskleur en in de Gouden Eeuw trapgevels
const WOOD=[.5,.35,.21],DWOOD=[.36,.25,.15],HAY=[.86,.74,.38],STRAW=[.8,.68,.36],BRICK=[.58,.27,.18],LWD=7;
function bldProps(b,x,y,z,hl,age,bm){const t=b.t,d=BD[t],s=d.sz,c=CIVS[b.o].col,v=b.v|0,h=s/2,f=(dx,dz)=>{const X=x+dx,Z=z+dz;return[X,hAt(X*32,Z*32),Z]};MS.reset();
 if(bm&&bm.vc){if((t==='smederij'||t==='kanongieterij')&&Math.random()<.06)puff('smoke',(x-h*.3)*32,(z-h*.3)*32,bm.h+.1,1);return} // nieuwe Higgsfield-modellen hebben hun eigen spullen
 const post=(p,ht,r,cl)=>part(MD.pBox,p[0],p[1],p[2],0,r,ht,r,cl||WOOD,LWD,hl);
 const banner=(dx,dz,ht)=>{const p=f(dx,dz);post(p,ht,.04,DWOOD);const w=.025*Math.sin(G.time*2.2+b.id);part(MD.pBox,p[0]+.19,p[1]+ht-.46,p[2]+w,0,.36,.44,.015,c,LCL,hl);part(MD.pBox,p[0]+.19,p[1]+ht-.49,p[2]+w,0,.36,.035,.02,[c[0]*.6,c[1]*.6,c[2]*.6],LCL,hl)};
 if(t==='kazerne'){// wapenrek met speren, oefenpop en zandplaats
  let p=f(-h+.35,h-.15);part(MD.pBox,p[0]+.3,p[1]+.42,p[2],0,.75,.04,.05,WOOD,LWD,hl);part(MD.pBox,p[0]+.3,p[1]+.12,p[2],0,.75,.04,.05,WOOD,LWD,hl);post(p,.5,.05);post([p[0]+.6,p[1],p[2]],.5,.05);
  for(let k=0;k<5;k++){const m=MS.reset();M4.trans(m,p[0]+.05+k*.13,p[1]+.06,p[2]+.03);M4.rotX(m,-.16);M4.scale(m,1.25,1.25,1.25);(GR.w_speer||MD.spear).add(m,1,1,1,1,0,hl,0,0)}MS.reset();
  p=f(h-.55,h-.1);post(p,.55,.05);part(MD.pBox,p[0],p[1]+.42,p[2],0,.42,.04,.04,WOOD,LWD,hl);part(MD.pBall,p[0],p[1]+.36,p[2],0,.17,.24,.13,STRAW,LCL,hl);part(MD.pBall,p[0],p[1]+.55,p[2],0,.1,.1,.1,STRAW,LCL,hl);
  const sh=GR.s_rond;if(sh){const m=MS.reset();M4.trans(m,p[0]-.32,p[1]+.18,p[2]+.08);M4.rotX(m,-.3);M4.scale(m,1.6,1.6,1.6);sh.add(m,c[0],c[1],c[2],1,0,hl,0,0);MS.reset()}
  banner(h-.15,-h+.4,1.15)}
 else if(t==='schietbaan'){// schietschijven op ezels en strobalen
  for(const[dx,dz]of[[-h+.45,h-.05],[h-.5,h-.05]]){const p=f(dx,dz);part(MD.pBox,p[0],p[1],p[2]-.06,0,.06,.4,.06,WOOD,LWD,hl);part(MD.pBox,p[0],p[1]+.15,p[2]-.12,0,.34,.3,.24,STRAW,LCL,hl);
   for(const[r,cl]of[[.2,[.95,.93,.85]],[.14,[.85,.15,.12]],[.08,[.95,.93,.85]],[.035,[.85,.15,.12]]]){const m=MS.reset();M4.trans(m,p[0],p[1]+.32,p[2]+.01+(.2-r)*.06);M4.rotX(m,PI/2-.15);M4.scale(m,r,.02,r);MD.pLimb.add(m,cl[0],cl[1],cl[2],1,0,hl,0,LCL)}MS.reset()}
  for(const[dx,dz,a]of[[0,h-.2,0],[.38,h-.25,.3]]){const p=f(dx,dz);part(MD.pBox,p[0],p[1],p[2],0,.36,.2,.24,HAY,LCL,hl)}
  {const m=MS.reset(),p=f(-.1,h-.25);M4.trans(m,p[0],p[1]+.2,p[2]);M4.rotZ(m,.4);M4.scale(m,1.4,1.4,1.4);(GR.w_boog||MD.bow).add(m,1,1,1,1,0,hl,0,0);MS.reset()}
  banner(-h+.15,-h+.45,1.1)}
 else if(t==='stal'){// paarden aan een hek, hooi en een drinkbak
  const fp=f(0,h-.05);for(const dx of[-1.1,-.4,.4,1.1])post([x+dx,fp[1],fp[2]],.32,.045);part(MD.pBox,x,fp[1]+.22,fp[2],0,2.3,.035,.04,WOOD,LWD,hl);part(MD.pBox,x,fp[1]+.1,fp[2],0,2.3,.035,.04,WOOD,LWD,hl);
  for(const[dx,dz,a,mi]of[[-.6,h-.45,.15,0],[.55,h-.5,-.25,2]]){const p=f(dx,dz),m=MS.reset(),mul=[1,.72,1.25,.55][(v+mi)&3];M4.trans(m,p[0],p[1],p[2]);M4.rotY(m,PI/2+a);M4.scale(m,1.25,1.25,1.25);MD.horse.add(m,c[0],c[1],c[2],1,0,hl,0,mul);
   const hc=[.62*mul,.46*mul,.32*mul];for(let i=0;i<4;i++){const k=MS.push();M4.trans(k,i&1?.06:-.06,.28,i&2?.2:-.2);part(MD.pLimb,0,0,0,0,.045,.15,.052,hc,LLE,hl);M4.trans(k,0,-.14,0);part(MD.pLimb,0,0,0,0,.034,.13,.038,hc,LLE,hl);part(MD.pBox,0,-.15,.004,0,.04,.03,.045,DARK,LLE,hl);MS.pop()}MS.reset()}
  let p=f(h-.35,h-.4);part(MD.pBox,p[0],p[1],p[2],0,.3,.22,.3,HAY,LCL,hl);part(MD.pBall,p[0],p[1]+.22,p[2],0,.3,.14,.3,HAY,LCL,hl);
  p=f(-h+.4,h-.45);part(MD.pBox,p[0],p[1],p[2],0,.5,.14,.2,DWOOD,LWD,hl);part(MD.pBox,p[0],p[1]+.1,p[2],0,.44,.03,.14,[.25,.42,.5],LCL,hl);banner(h-.2,-h+.4,1.15)}
 else if(t==='smederij'){// aambeeld op een blok, vuurkorf; rook uit de schoorsteen
  const p=f(h-.35,h-.15);part(MD.pBox,p[0],p[1],p[2],0,.16,.16,.16,DWOOD,LWD,hl);part(MD.pBox,p[0],p[1]+.16,p[2],0,.24,.07,.1,[.24,.24,.27],LML,hl);part(MD.pBox,p[0]+.15,p[1]+.18,p[2],0,.08,.03,.06,[.24,.24,.27],LML,hl);
  const q=f(-h+.35,h-.15);part(MD.pBox,q[0],q[1],q[2],0,.28,.18,.28,[.42,.4,.38],LCL,hl);part(MD.pBall,q[0],q[1]+.2,q[2],0,.2,.06,.2,[1,.45,.12],LCL,2);
  if(Math.random()<.06){puff('smoke',(x-h*.4)*32,(z-h*.3)*32,(bm?bm.h:1)+.2,1)}if(Math.random()<.05)puff('spark',q[0]*32,q[2]*32,.25,1)}
 else if(t==='markt'||t==='handelskantoor'){// kraampjes met luifels in de spelerskleur en gestreept
  const n=t==='markt'?3:1;for(let k=0;k<n;k++){const p=f(-h+.55+k*((s-1.1)/Math.max(1,n-1)),h-.05);for(const sx of[-1,1])for(const sz of[-1,1])post([p[0]+sx*.25,p[1],p[2]+sz*.15],.38,.03);
   part(MD.pBox,p[0],p[1]+.15,p[2],0,.52,.06,.32,WOOD,LWD,hl);const cl=k&1?[.92,.88,.78]:c;{const m=MS.reset();M4.trans(m,p[0],p[1]+.42,p[2]+.02);M4.rotX(m,.25);part(MD.pBox,0,0,0,0,.62,.025,.4,cl,LCL,hl);MS.reset()}
   for(let j=0;j<3;j++)part(MD.pBall,p[0]-.15+j*.15,p[1]+.23,p[2],0,.1,.08,.1,j===0?[.85,.2,.15]:j===1?[.9,.75,.2]:[.4,.6,.2],LCL,hl)}}
 else if(t==='kanongieterij'){const p=f(h-.6,h-.2),m=MS.reset();M4.trans(m,p[0],p[1],p[2]);M4.rotY(m,.6);MD.kanon.add(m,c[0],c[1],c[2],1,0,hl,0,0);MS.reset();for(let k=0;k<3;k++)part(MD.pBall,x-h+.4+k*.12,f(0,0)[1]+.05,z+h-.2,0,.1,.1,.1,[.2,.2,.22],LML,hl);banner(-h+.15,-h+.4,1.2)}
 else if(t==='bastion'){for(const[dx,dz]of[[-h+.2,-h+.2],[h-.2,-h+.2],[-h+.2,h-.2],[h-.2,h-.2]]){const p=f(dx*.9,dz*.9),m=MS.reset();M4.trans(m,p[0],p[1]+(bm?bm.h*.45:.6),p[2]);M4.rotY(m,Math.atan2(dx,dz));MD.kanon.add(m,c[0],c[1],c[2],1,0,hl,0,0)}MS.reset();banner(0,0,(bm?bm.h:1)+.6)}
 else if(t==='kasteel'||t==='hoeve'||t==='kerk'||t==='universiteit')banner(-h+.15,h-.2,1.3);
 // Gouden Eeuw: trapgevel van baksteen met witte banden en luiken voor het hoofdgebouw
 if(age>=3&&bm&&bm.a!==3&&!d.wall&&!d.gate&&!d.field&&t!=='huis'&&t!=='bastion'&&t!=='molen'&&t!=='pmolen'){const gw=Math.min(1.5,s*.42),top=y+bm.h*.62,zf=z+Math.min(h*.55,.8);
  for(let k=0;k<5;k++){const w=gw*(1-k*.18),hh=.15;part(MD.pBox,x,top+k*hh,zf,0,w,hh,.1,BRICK,LCL,hl);part(MD.pBox,x,top+k*hh+hh-.02,zf+.005,0,w+.04,.025,.11,[.92,.9,.84],LCL,hl)}
  part(MD.pBox,x,top+5*.15,zf,0,gw*.18,.12,.1,BRICK,LCL,hl);
  for(const sx of[-1,1]){part(MD.pBox,x+sx*gw*.16,top+.12,zf+.055,0,.16,.22,.02,[.95,.94,.88],LCL,hl);part(MD.pBox,x+sx*gw*.16,top+.13,zf+.06,0,.11,.17,.02,[.16,.2,.24],LCL,hl);part(MD.pBox,x+sx*gw*.16+sx*.1,top+.13,zf+.06,0,.05,.18,.02,[.15,.42,.25],LCL,hl)}}
}
function campProps(b,x,y,z,hl){const wood=b.t==='houtkamp',v=b.v|0,f=(dx,dz)=>[x+dx,hAt((x+dx)*32,(z+dz)*32),z+dz];
 if(wood){for(const[dx,dz,r,k]of[[-.55,.95,1.57,0],[-.15,.98,1.57,1],[-.35,.98,1.57,2]]){const p=f(dx,dz);inst(MD.felled,p[0],p[1]+(k===2?.13:0),p[2],r+v*.1,.62,.62,.62,1,1,1,1,0,hl,0,.95)}
  const p=f(.62,.9);MS.reset();part(MD.pBall,p[0],p[1]+.05,p[2],0,.17,.13,.17,[.42,.3,.19],LLE,hl);
  if(GR.t_bijl){const m=MS.reset();M4.trans(m,p[0],p[1]+.17,p[2]);M4.rotZ(m,-.5);M4.rotX(m,.2);M4.scale(m,1.6,1.6,1.6);GR.t_bijl.add(m,1,1,1,1,0,hl,0,0)}}
 else{const rs=resModel('r_steen'),rg=resModel('r_goud');let p=f(-.55,.92);if(rs)addRM(rs,p[0],p[1]-.03,p[2],v*1.3,.58,.5,hl);p=f(.05,1.0);if(rg)addRM(rg,p[0],p[1]-.03,p[2],v*2.1+1,.46,.42,hl);
  for(const[dx,dz,g]of[[.55,.86,'c_goud'],[.72,.62,'c_steen']]){const q=f(dx,dz);if(GR[g]){const m=MS.reset();M4.trans(m,q[0],q[1],q[2]);M4.rotY(m,v+dx*3);M4.scale(m,2.2,2.2,2.2);GR[g].add(m,1,1,1,1,0,hl,0,0)}}
  const q=f(.35,.98);if(GR.t_pik){const m=MS.reset();M4.trans(m,q[0],q[1]+.04,q[2]);M4.rotZ(m,1.45);M4.rotY(m,.4);M4.scale(m,1.7,1.7,1.7);GR.t_pik.add(m,1,1,1,1,0,hl,0,0)}}}
function drawBld(b,dt){const d=BD[b.t],c=CIVS[b.o].col,x=b.x/32,z=b.y/32,y=b.by;let mesh,rot=0;
 if(d.wall)mesh=wallMesh(b.t,b.mask);else if(d.gate){mesh=gateMesh(b.open?1:0);rot=b.dir*PI/2}else{mesh=bMesh(MESHALT[b.t]||b.t,CIVS[b.o].st,b.v);if(d.coast)rot=b.dir*PI/2}
 const hl=b.flash>G.time?1:0,bm=d.wall||d.gate||d.field?null:bModel(b.t,cAge(b.o));
 if(bm){const fl=b.ageT?Math.max(0,1-(G.time-b.ageT)/1.5):0;
  if(b.bp<1){addBM(bm,x,y,z,c,1,hl,0,0,.08+b.bp*bm.h);inst(MD.scaf[d.sz],x,y,z,0,1,.35+.65*b.bp,1,1,1,1,1,0,0,0,0);return}
  const ag=cAge(b.o);addBM(bm,x,y,z,c,1,hl,(b.hp<b.mhp*.6?Math.min(1,1.15-b.hp/(b.mhp*.6)):0)+(ag>=3&&bm.a!==3?10:0),fl);if(b.t==='houtkamp'||b.t==='mijnkamp')campProps(b,x,y,z,hl);bldProps(b,x,y,z,hl,ag,bm);
  if(b.hp<b.mhp*.5&&rnd()<dt*5)puff('fire',b.x+(rnd()-.5)*d.sz*18,b.y+(rnd()-.5)*d.sz*18,.35+rnd()*.4,1);
  if(fl>0&&rnd()<dt*30)puff('spark',b.x+(rnd()-.5)*d.sz*30,b.y+(rnd()-.5)*d.sz*30,.3+rnd()*1.2,1);return}
 inst(mesh,x,y,z,rot,1,1,1,c[0],c[1],c[2],1,b.bp<1?.1+b.bp*mesh.h:0,hl,0,0);
 if(b.bp<1){inst(MD.scaf[d.sz],x,y,z,0,1,.35+.65*b.bp,1,1,1,1,1,0,0,0,0);return}
 if(mesh.hub){const m=MS.reset();M4.trans(m,x+mesh.hub[0],y+mesh.hub[1],z+mesh.hub[2]);M4.rotZ(m,G.time*.8);MD.blades.add(m,1,1,1,1,0,0,0,0)}
 if(d.field&&b.food>0)inst(MD.grain,x,y,z,0,1,.35+.65*b.food/300,1,1,1,1,1,0,0,1,0);
 if(mesh.cauld&&rnd()<dt*3)puff('alch',(x+mesh.cauld[0])*32,(z+mesh.cauld[2])*32,y+mesh.cauld[1]-Math.max(0,hAt(b.x,b.y)),1);
 if(mesh.smoke&&rnd()<dt*1.6)puff('smoke',(x+mesh.smoke[0])*32,(z+mesh.smoke[2])*32,y+mesh.smoke[1]-Math.max(0,hAt(b.x,b.y)),1);
 if(b.hp<b.mhp*.5&&!d.wall&&rnd()<dt*5)puff('fire',b.x+(rnd()-.5)*d.sz*18,b.y+(rnd()-.5)*d.sz*18,.35+rnd()*.4,1)}
// ---------- bomen (versie 12, Higgsfield): 6 soorten × 4 varianten, licht verschillend in grootte, kleur en draaiing ----------
const TSP=['eik','beuk','den','spar','berk','palm'],TOLD=[0,0,1,4,0,4,4,3,3,2,2],TSC=[1.05,1.1,1.2,1.2,1.0,1.1];
// boomsoort en variant: nieuwe kaarten coderen v = 100 + soort*4 + variant; oude saves krijgen een soort uit de oude boom en een variant uit de plek
const treeKind=(e,tx,ty)=>e.v>=100?[((e.v-100)>>2)%6,(e.v-100)&3]:[TOLD[e.v|0]|0,(hash2(tx,ty,23)*4)|0];
function drawTree(e,tx,ty,x,y,z,hs,h2,hl){const[sp,vr]=treeKind(e,tx,ty),rm=resModel('r_t_'+TSP[sp]+vr);if(!rm)return false;
 const ox=(hs-.5)*.62,oz=(h2-.5)*.62;
 if(e.felled){// gekapt: een stronk met een stapeltje hout dat kleiner wordt
  const px=x+ox*.5,pz=z+oz*.5,py=hAt(px*32,pz*32);inst(MD.stump,px,py,pz,hs*TAU,1.1,1.1,1.1,1,1,1,1,0,hl,0,0);
  if(GR.c_hout&&e.amt>0){const k=.35+.65*Math.min(1,e.amt/100);for(let j=0;j<(e.amt>45?2:1);j++){const m=MS.reset();M4.trans(m,px+.3-j*.12,py+j*.09,pz+.22-j*.05);M4.rotY(m,hs*6+j*1.3);M4.rotZ(m,PI/2);M4.scale(m,3.2*k,3.2*k,3.2*k);GR.c_hout.add(m,1,1,1,1,0,hl,0,0)}}return true}
 const s=(.86+h2*.3)*TSC[sp],k2=s*(.9+hs*.2),tint=-(.5+(hash2(tx,ty,31)-.5)*.9);addRM(rm,x+ox,y-.03,z+oz,hash2(tx,ty,17)*TAU,s,k2,hl?1:tint,-1);return true}
// welke 3D-grondstof hoort bij welke boomsoort (MD.tree-varianten: eik, eik, beuk, klein, klein, berk, berk, spar, spar, den, den)
const TREEM=['r_eik','r_eik','r_eik','r_berk','r_eik','r_berk','r_berk','r_spar','r_spar','r_den','r_den'],TREEH=[1,.95,1.05,.75,.7,1,.92,1,.9,1,.94];
function collect(dt){for(const m of MESHES)m.n=0;BM.q.length=0;clearRModels();const[x0,y0,x1,y1]=R.vr,t=G.time,ex=M.expl,far=G.cam.zoom>26?2:G.cam.zoom>17?1:0;
 for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const i=ty*W+tx;if(!ex[i])continue;const rid=M.resAt[i];
  if(rid){const e=byId.get(rid);if(e){const hs=hash2(tx,ty,5),h2=hash2(tx,ty,9),x=tx+.5,z=ty+.5,y=hAt(e.x,e.y),hl=e.flash>t?1:0;
    if(e.rt==='tree'&&drawTree(e,tx,ty,x,y,z,hs,h2,hl)){}
    else if(e.rt==='tree'){if(e.felled)inst(MD.felled,x,y,z,hs*TAU,1,1,1,1,1,1,1,0,hl,0,.9+h2*.2);else{const s=.84+h2*.36,rm=resModel(TREEM[e.v]);if(rm){const k=s*TREEH[e.v];addRM(rm,x+(hs-.5)*.3,y-.02,z+(h2-.5)*.3,hs*TAU,k,k*(.92+hs*.16),hl)}else inst(MD.tree[e.v],x+(hs-.5)*.3,y-.02,z+(h2-.5)*.3,hs*TAU,s,s*(.92+hs*.16),s,1,1,1,1,0,hl,1,.86+hs*.28)}}
    else if(e.rt==='berry'){const rm=resModel('r_bes'),k=.7+.3*Math.min(1,e.amt/125);if(rm){addRM(rm,x,y,z,hs*TAU,k,k,hl);inst(MD.berries,x,y,z,hs*TAU,k,k,k,1,1,1,1,0,hl,0,0)}else inst(MD.berry,x,y,z,hs*TAU,1.1,1.1,1.1,1,1,1,1,0,hl,.5,0)}
    else{const s=.72+.28*Math.min(1,e.amt/500),rm=resModel(e.rt==='gold'?'r_goud':'r_steen');if(rm)addRM(rm,x,y-.03,z,hs*TAU,s,s*(.75+.25*Math.min(1,e.amt/500)),hl);else inst((e.rt==='gold'?MD.gold:MD.stone)[e.v&1],x,y-.03,z,hs*TAU,s*1.15,s*1.15,s*1.15,1,1,1,1,0,hl,0,0)}}}
  const dc=M.deco[i];if(dc&&(far<1||dc[0]===0||dc[0]===4||(far<2&&dc[0]===1))){const px=(tx+dc[2])*32,py=(ty+dc[3])*32,y=hAt(px,py)-.01,s=dc[5],k=dc[0];
   inst(k===0?MD.rockD[dc[1]]:k===1?MD.shrub[dc[1]]:k===2?MD.tuft[dc[1]]:k===3?MD.flower[dc[1]]:MD.fallen,tx+dc[2],y,ty+dc[3],dc[4],s,s,s,1,1,1,1,0,0,k>0&&k<4?.7:0,.9+dc[2]*.25)}}
 for(const s of G.stumps)if(inView(s[0],s[1])&&ex[tileI(s[0],s[1])])inst(MD.stump,s[0]/32,hAt(s[0],s[1]),s[1]/32,0,1,1,1,1,1,1,1,0,0,0,0);
 for(const e of G.loose){if(e.dead||!inView(e.x,e.y)||!ex[tileI(e.x,e.y)])continue;
  if(e.rt==='fish'){for(let k=0;k<4;k++){const a=t*.7+k*1.6+e.id,r=.2+.1*Math.sin(t+k*2);inst(MD.fish,e.x/32+Math.cos(a)*r,.012+Math.sin(t*2+k)*.008,e.y/32+Math.sin(a)*r,-a+PI,1.5,1,1.5,1,1,1,1,0,e.flash>t?1:0,0,0)}if(rnd()<dt*.9)puff('splash',e.x+(rnd()-.5)*20,e.y+(rnd()-.5)*20,0,3)}
  else{const am=e.v===1?uModel('u_hert'):e.v===2?uModel('u_zwijn'):uModel('u_sheep0'),k=.6+.4*Math.min(1,e.amt/100);if(am){const fa=e.dT!==undefined?(t-e.dT)/.55:9;addRM(am,e.x/32,hAt(e.x,e.y),e.y/32,(e.f||0)-PI/2,1,1,e.flash>t?1:0,fa<1?animEx(0,4,fa):10)}else{const m=MS.reset();M4.trans(m,e.x/32,hAt(e.x,e.y)+.1,e.y/32);M4.rotZ(m,PI/2);MD.sheep.add(m,.55,.5,.45,1,0,e.flash>t?1:0,0,.8)}}}
 for(const b of G.blds)if(!b.dead&&inView(b.x,b.y)&&(G.reveal||ex[tileI(b.x,b.y)]))drawBld(b,dt);
 // Polderland: houten bruggen over de vaarten
 if(G.bridges)for(const q of G.bridges){const px=q[0]*32,py=q[1]*32;if(!inView(px,py)||!(G.reveal||ex[tileI(clamp(px,0,W*32-1),clamp(py,0,H*32-1))]))continue;const a=-q[2],L=6.6,ca=Math.cos(q[2]),sa=Math.sin(q[2]);
  inst(MD.pBox,q[0],.1,q[1],a,L,.06,2.7,.82,.62,.4,1,0,0,0,7);for(const s of[-1,1]){inst(MD.pBox,q[0]-sa*s*1.3,.2,q[1]+ca*s*1.3,a,L,.05,.07,.66,.48,.3,1,0,0,0,7);for(let k=-2;k<=2;k++)inst(MD.pBox,q[0]+ca*k*1.45-sa*s*1.3,.02,q[1]+sa*k*1.45+ca*s*1.3,a,.09,.2,.09,.38,.27,.16,1,0,0,0,7)}}
 for(const r of G.rubble)if(inView(r.x,r.y)&&ex[tileI(r.x,r.y)]){const a=clamp((70-(t-r.t))/8,0,1);if(r.sz)inst(MD.rubble[r.sz],r.x/32,hAt(r.x,r.y),r.y/32,0,1,1,1,1,1,1,a,0,0,0,0);else inst(MD.wreck,r.x/32,-.07-(t-r.t)*.002,r.y/32,r.f,1,1,1,.5,.5,.5,a,0,0,0,0)}
 const rlm=uModel('u_relik');
 for(const u of G.units)if(!u.dead&&!u.in&&inView(u.x,u.y)&&seen(u)){drawUnit(u);if(u.relic&&rlm)addRM(rlm,u.x/32,hAt(u.x,u.y)+.78,u.y/32,u.face,.8,.8,0,0)}
 for(const r of G.relics||[]){if(r.c||!inView(r.x,r.y)||!ex[tileI(r.x,r.y)])continue;const hl=r.flash>t?1:0;if(r.b){const b=byId.get(r.b);if(b&&rlm){const bm=bModel(b.t,cAge(b.o));addRM(rlm,r.x/32+.9,b.by+.02,r.y/32+.9,.6,.9,.9,hl,0)}continue}
  const y=hAt(r.x,r.y);if(rlm)addRM(rlm,r.x/32,y,r.y/32,.4,1,1,hl,0);else inst(MD.pBox,r.x/32,y+.06,r.y/32,0,.16,.12,.12,.85,.68,.25,1,0,hl,0,0);if(rnd()<dt*2)puff('holy',r.x,r.y,.3,1)}
 for(const c of G.corpses)if(inView(c.x,c.y)&&M.vis[tileI(c.x,c.y)]){PA=clamp((14-(t-c.t))/4,0,1);drawUnit({t:c.ty,o:c.o,x:c.x,y:c.y,face:c.f,fem:c.fem,id:c.id||7,hid:c.id||0,dT:c.t,dir:(c.id||1)&1?1:-1,st:0,cn:0},true);PA=1}
 for(const p of G.proj)if(inView(p.x,p.y)){const m=MS.reset(),k=Math.min(1,p.t/p.dur),y=Math.max(0,hAt(p.x,p.y))+p.z;if(p.k==='stone'){inst(MD.pBall,p.x/32,y,p.y/32,0,.13,.13,.13,.35,.33,.3,1,0,0,0,0);continue}if(p.k==='ball'){inst(MD.pBall,p.x/32,y,p.y/32,0,.035,.035,.035,.2,.2,.2,1,0,0,0,0);continue}
  M4.trans(m,p.x/32,y,p.y/32);M4.rotY(m,Math.atan2(p.ax-p.x0,p.ay-p.y0));if(p.k==='axe'){const g=GR.w_werpbijl||MD.axe;M4.rotX(m,p.t*14);M4.trans(m,0,-.08,0);g.add(m,1,1,1,1,0,0,0,0);continue}
  M4.rotX(m,-(.5-k)*1.1);if(p.k==='spear'||p.k==='jav'){const g=(p.k==='jav'?GR.w_spies:GR.t_jspeer)||MD.spear;M4.rotX(m,PI/2);M4.trans(m,0,-.12,0);g.add(m,1,1,1,1,0,0,0,0);continue}
  if(p.k==='bolt')M4.scale(m,.8,.8,.62);else if(p.big)M4.scale(m,1.5,1.5,1.5);MD.arrow.add(m,1,1,1,1,0,0,0,0)}
 if(PL)drawGhost()}
function drawGhost(){const t=PL.t,d=BD[t],c=CIVS[0].col;
 if(d.wall){for(const p of PL.line||[]){const ok=p[2];inst(wallMesh(t,p[3]||0),p[0]+.5,baseH(p[0],p[1],1),p[1]+.5,0,1,1,1,c[0],c[1],c[2],1,0,ok?2:3,0,0)}return}
 if(PL.tx===undefined)return;const x=PL.tx+d.sz/2,z=PL.ty+d.sz/2,y=baseH(PL.tx,PL.ty,d.sz);
 const gm=d.gate||d.field?null:bModel(t,cAge(0));if(gm){addBM(gm,x,y,z,c,.8,PL.ok?2:3,0,0);return}
 inst(d.gate?gateMesh(1):bMesh(MESHALT[t]||t,0,0),x,y,z,d.gate?(PL.dir||0)*PI/2:d.coast?Math.max(0,havenDir(PL.tx,PL.ty))*PI/2:0,1,1,1,c[0],c[1],c[2],1,0,PL.ok?2:3,0,0)}

// ---------- tekenen ----------
function bindCommon(P,vp){gl.useProgram(P.p);const u=P.u;gl.uniformMatrix4fv(u.uVP,false,vp);if(u.uSVP)gl.uniformMatrix4fv(u.uSVP,false,R.svp);if(u.uT)gl.uniform1f(u.uT,R.time);
 if(u.uSun)gl.uniform3fv(u.uSun,R.sun);if(u.uCam)gl.uniform3fv(u.uCam,R.eye);if(u.uMI)gl.uniform2f(u.uMI,1/W,1/H);if(u.uFD)gl.uniform2f(u.uFD,R.dist*1.15,1/(R.dist*2.2))}
function render(dt){resize();R.time=(R.time||0)+dt;camSetup(dt);if(R.skip)return;updFog(dt);
 if(M.splatD){M.splatD=0;setTex(R.splatTex,gl.RGBA8,2*W,2*H,gl.RGBA,gl.UNSIGNED_BYTE,M.splat)}
 collect(dt);for(const m of MESHES)m.upload();
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D_ARRAY,TEX);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,R.fogTex);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,R.splatTex);gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D,R.hgtTex);if(R.forTex){if(G.time-(R.forT||0)>12)forestMap();gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,R.forTex)}
 // schaduwpas
 gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,null);gl.bindFramebuffer(gl.FRAMEBUFFER,R.shFbo);gl.viewport(0,0,2048,2048);gl.depthMask(true);gl.clear(gl.DEPTH_BUFFER_BIT);gl.disable(gl.BLEND);
 gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(2.2,6);bindCommon(R.pS,R.svp);for(const m of MESHES)m.draw();drawBModels(true);drawRModels(true);gl.disable(gl.POLYGON_OFFSET_FILL);
 // hoofdpas
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cv.width,cv.height);gl.clearColor(.035,.04,.045,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.bindTexture(gl.TEXTURE_2D,R.shTex);
 bindCommon(R.pT,R.vp);if(R.pT.u.uVolc)gl.uniform1f(R.pT.u.uVolc,G.mapType==='vulkaan'?1:0);gl.bindVertexArray(R.terr.vao);{const T0=R.terr,cs=T0.cs,c0=clamp(Math.floor((R.vr[0]-4)/cs),0,T0.ncx-1),c1=clamp(Math.floor((R.vr[2]+4)/cs),0,T0.ncx-1),r0=clamp(Math.floor((R.vr[1]-6)/cs),0,T0.ncy-1),r1=clamp(Math.floor((R.vr[3]+4)/cs),0,T0.ncy-1);let tri=0;
  for(let cy=r0;cy<=r1;cy++){const a=T0.ck[cy*T0.ncx+c0],b=T0.ck[cy*T0.ncx+c1],n=b[0]+b[1]-a[0];gl.drawElements(gl.TRIANGLES,n,gl.UNSIGNED_INT,a[0]*4);tri+=n/3}R.terrTri=tri}
 bindCommon(R.pI,R.vp);for(const m of MESHES)m.draw();drawBModels(false);drawRModels(false);
 if(M.hasWater){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);bindCommon(R.pW,R.vp);gl.uniform2f(R.pW.u.uWH,W,H);gl.uniform4f(R.pW.u.uHS,1/(2*W+1),1/(2*H+1),0,0);gl.bindVertexArray(R.wVao);gl.drawArrays(gl.TRIANGLES,0,6)}
 // deeltjes
 let n=0;const pd=R.pData;for(let i=PT.length-1;i>=0;i--){const p=PT[i];p.t+=dt;if(p.t>=p.l){PT[i]=PT[PT.length-1];PT.pop();continue}p.vy-=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(n<700){const k=p.t/p.l,o=n++*8;pd[o]=p.x;pd[o+1]=p.y;pd[o+2]=p.z;pd[o+3]=lerp(p.s0,p.s1,k);pd[o+4]=p.c[0];pd[o+5]=p.c[1];pd[o+6]=p.c[2];pd[o+7]=p.c[3]*(1-k*k)}}
 if(n){gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.useProgram(R.pP.p);gl.uniformMatrix4fv(R.pP.u.uVP,false,R.vp);const v=R.view;gl.uniform3f(R.pP.u.uR,v[0],v[4],v[8]);gl.uniform3f(R.pP.u.uU,v[1],v[5],v[9]);
  gl.bindVertexArray(R.pVao);gl.bindBuffer(gl.ARRAY_BUFFER,R.pBuf);gl.bufferSubData(gl.ARRAY_BUFFER,0,pd,0,n*8);gl.drawArraysInstanced(gl.TRIANGLES,0,6,n)}
 gl.depthMask(true);gl.disable(gl.BLEND);gl.bindVertexArray(null);
 overlay();R.miniT=(R.miniT||0)+dt;if(R.miniT>.2){R.miniT=0;minimap()}}

// ---------- 2D-overlay: levensbalken, ringen, taaklijnen ----------
function overlay(){const c=R.oc,d=R.od,t=G.time;c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,R.w,R.h);const ppu=R.w/(G.cam.zoom*(R.w>=R.h?R.w/R.h:1));
 const bar=(x,y,w,f,col)=>{c.fillStyle='rgba(0,0,0,.6)';c.fillRect(x-w/2-1,y-1,w+2,5);c.fillStyle=col;c.fillRect(x-w/2,y,w*clamp(f,0,1),3)};
 const hpc=f=>f>.6?'#6fbf4a':f>.3?'#d9b233':'#d04a36';
 const ring=(e,col)=>{const s=w2s(e.x/32,e.k==='b'?e.by+.05:Math.max(0,hAt(e.x,e.y))+.03,e.y/32),r=(e.k==='b'?BD[e.t].sz*.62:e.k==='r'?.5:UD[e.t].ship?.6:UD[e.t].horse?.32:.24)*ppu;c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.ellipse(s[0],s[1],r,r*.79,0,0,TAU);c.stroke()};
 // effecten van tikken en opdrachten
 for(let i=R.fx.length-1;i>=0;i--){const f=R.fx[i],k=(performance.now()-f.t)/(f.k?520:300);if(k>=1){R.fx.splice(i,1);continue}const s=w2s(f.x/32,Math.max(0,hAt(f.x,f.y))+.03,f.y/32);
  if(f.k){const r=(.5-.3*k)*ppu;c.strokeStyle=(f.k===2?'rgba(230,80,60,':f.k===3?'rgba(240,200,90,':'rgba(120,220,110,')+(1-k)+')';c.lineWidth=3;c.beginPath();c.ellipse(s[0],s[1],r,r*.79,0,0,TAU);c.stroke();c.beginPath();c.ellipse(s[0],s[1],r*.35,r*.28,0,0,TAU);c.stroke()}
  else{const r=(.18+.2*k)*ppu;c.strokeStyle='rgba(255,255,255,'+.35*(1-k)+')';c.lineWidth=1.5;c.beginPath();c.ellipse(s[0],s[1],r,r*.79,0,0,TAU);c.stroke()}}
 for(const e of SEL){if(e.dead)continue;const own=e.o===0;ring(e,own?'rgba(140,235,120,.95)':e.k==='r'||e.o<0?'rgba(240,230,170,.9)':hostile(0,e.o)?'rgba(235,90,70,.95)':'rgba(240,220,120,.95)');
  if(own&&e.k==='u'){let tx,ty;const g=e.tgt||e.drop;if(e.st===3&&e.drop){tx=e.drop.x;ty=e.drop.y}else if(g&&!g.dead&&e.st>1){tx=g.x;ty=g.y}else if(e.st===1){tx=e.gx;ty=e.gy}
   if(tx!==undefined){const a=w2s(e.x/32,Math.max(0,hAt(e.x,e.y))+.05,e.y/32),b=w2s(tx/32,Math.max(0,hAt(tx,ty))+.05,ty/32);c.strokeStyle=e.st===5?'rgba(240,120,90,.75)':'rgba(240,225,150,.7)';c.lineWidth=1.5;c.setLineDash([5,5]);c.lineDashOffset=-t*18;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.setLineDash([])}}
  if(own&&e.k==='b'&&e.rally){const s=w2s(e.rally.x/32,Math.max(0,hAt(e.rally.x,e.rally.y)),e.rally.y/32);c.strokeStyle='#e9d8a0';c.lineWidth=2;c.beginPath();c.moveTo(s[0],s[1]);c.lineTo(s[0],s[1]-22);c.stroke();c.fillStyle=CIVS[0].hex;c.beginPath();c.moveTo(s[0],s[1]-22);c.lineTo(s[0]+13,s[1]-17);c.lineTo(s[0],s[1]-12);c.fill()}}
 const selSet=new Set(SEL);
 for(const u of G.units){if(u.dead||u.in||!inView(u.x,u.y)||!seen(u))continue;const sel=selSet.has(u);if(!sel&&u.hp>=u.mhp&&!(u.pray>0))continue;const s=w2s(u.x/32,Math.max(0,hAt(u.x,u.y))+(UD[u.t].horse?.85:UD[u.t].ship?.9:.68),u.y/32);
  bar(s[0],s[1],26,u.hp/u.mhp,hpc(u.hp/u.mhp));if(u.t==='monk'&&(sel||u.pray>0))bar(s[0],s[1]+5,26,u.pray>0?u.pray/4:u.faith,u.pray>0?'#fff2b0':'#7fb4e8')}
 for(const b of G.blds){if(b.dead||!inView(b.x,b.y)||!M.expl[tileI(b.x,b.y)])continue;const sel=selSet.has(b);if(!sel&&b.hp>=b.mhp&&b.bp>=1&&!b.q.length)continue;if(BD[b.t].wall&&!sel&&b.bp>=1&&b.hp>b.mhp*.6)continue;
  const s=w2s(b.x/32,b.by+(BD[b.t].wall?.9:1.2+BD[b.t].sz*.25),b.y/32),w=18+BD[b.t].sz*12;if(b.bp<1)bar(s[0],s[1],w,b.bp,'#e9d8a0');else{if(b.hp<b.mhp||sel)bar(s[0],s[1],w,b.hp/b.mhp,hpc(b.hp/b.mhp));if(b.o===0&&b.q.length)bar(s[0],s[1]+5,w,b.q[0].p,'#7fb4e8')}}
 if(BOX){c.strokeStyle='rgba(140,235,120,.9)';c.fillStyle='rgba(140,235,120,.12)';c.lineWidth=1.5;c.fillRect(BOX[0],BOX[1],BOX[2]-BOX[0],BOX[3]-BOX[1]);c.strokeRect(BOX[0],BOX[1],BOX[2]-BOX[0],BOX[3]-BOX[1])}}

// ---------- minikaart ----------
function minimap(){const mc=R.mc,S=R.ms;if(!R.mini){R.mini=document.createElement('canvas');R.mini.width=W;R.mini.height=H;R.miniI=R.mini.getContext('2d').createImageData(W,H);R.miniB=new U8(W*H*3);
  for(let i=0;i<W*H;i++){const x=i%W,y=(i/W)|0,h=hAt(x*32+16,y*32+16);let r,g,b;if(M.water[i]){const d=clamp(-M.sd[i]/4,0,1);r=40-d*18;g=84-d*30;b=104-d*24}else if(M.mtn[i]){const k=clamp(h/2.6,0,1);if(G.mapType==='vulkaan'){r=70+k*30;g=60+k*25;b=55+k*20}else r=g=b=110+k*90}else{const k=M.splat[((y*2)*2*W+x*2)*4+2]/255,n=hash2(x,y,3)*14;r=lerp(78,170,k)+n;g=lerp(104,156,k)+n;b=lerp(52,116,k)}
   R.miniB[i*3]=r;R.miniB[i*3+1]=g;R.miniB[i*3+2]=b}}
 const im=R.miniI.data,mb=R.miniB;for(let i=0;i<W*H;i++){const f=G.reveal?1:M.vis[i]?1:M.expl[i]?.55:0,o=i*4;let r=mb[i*3],g=mb[i*3+1],b=mb[i*3+2];const rid=R.mview===1?0:M.resAt[i];if(rid&&f){const e=byId.get(rid);if(e){if(e.rt==='tree'){r=44;g=70;b=36}else if(e.rt==='gold'){r=235;g=195;b=60}else if(e.rt==='stone'){r=165;g=165;b=170}else{r=170;g=60;b=80}}}
  im[o]=r*f;im[o+1]=g*f;im[o+2]=b*f;im[o+3]=255}
 R.mini.getContext('2d').putImageData(R.miniI,0,0);mc.setTransform(1,0,0,1,0,0);mc.imageSmoothingEnabled=false;mc.clearRect(0,0,S,S);mc.drawImage(R.mini,0,0,S,S);const k=S/(W*32);
 const mv=R.mview|0;for(const b of G.blds){if(b.dead||!(G.reveal||M.expl[tileI(b.x,b.y)]))continue;if(mv===1&&!(BD[b.t].train&&b.t!=='hoeve'&&b.t!=='haven'||BD[b.t].atk||BD[b.t].wall||b.t==='hoeve'))continue;if(mv===2&&(BD[b.t].wall||BD[b.t].atk&&b.t!=='hoeve'))continue;const s=Math.max(2,BD[b.t].sz*S/W);mc.fillStyle=CIVS[b.o].hex;mc.fillRect(b.x*k-s/2,b.y*k-s/2,s,s)}
 for(const r of G.relics||[]){if(r.c||!(G.reveal||M.expl[tileI(r.x,r.y)]))continue;mc.fillStyle='#ffe9a0';mc.fillRect(r.x*k-2.5,r.y*k-2.5,5,5);mc.strokeStyle='#5a3a10';mc.strokeRect(r.x*k-2.5,r.y*k-2.5,5,5)}
 for(const u of G.units){if(u.dead||u.in||!seen(u))continue;if(mv===1&&!UD[u.t].mil)continue;if(mv===2&&UD[u.t].mil&&u.o>=0)continue;mc.fillStyle=u.o<0?(u.t==='sheep'?'#fff':'#c9a77a'):CIVS[u.o].hex;const s=u.o===0?2.6:2.2;mc.fillRect(u.x*k-s/2,u.y*k-s/2,s,s)}
 mc.strokeStyle='#f3e6c0';mc.lineWidth=1;mc.beginPath();[[0,0],[R.w,0],[R.w,R.h],[0,R.h]].forEach((p,i)=>{const g=pick(p[0],p[1],true);if(i)mc.lineTo(g[0]*k,g[1]*k);else mc.moveTo(g[0]*k,g[1]*k)});mc.closePath();mc.stroke();
 const now=performance.now();for(let i=R.pings.length-1;i>=0;i--){const p=R.pings[i],a=(now-p.t)/6000;if(a>=1){R.pings.splice(i,1);continue}const r=3+((now-p.t)/600%1)*9;mc.strokeStyle='rgba(255,70,50,'+(1-a)+')';mc.lineWidth=2;mc.beginPath();mc.arc(p.x*k,p.y*k,r,0,TAU);mc.stroke()}}
function ping(x,y){R.pings.push({x,y,t:performance.now()})}
