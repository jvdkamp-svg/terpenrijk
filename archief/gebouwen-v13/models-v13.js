// ===== models.js — alle 3D-modellen: gebouwen per volk, natuur, schepen, onderdelen voor poppetjes =====
const MD={b:{}};
const STY=[
 {wall:5,wc:[.95,.93,.88],roof:8,rc:[1,1,1],frame:1,sh:[.22,.38,.28]},            // Fries: riet, wit pleisterwerk, vakwerk
 {wall:5,wc:[.96,.90,.76],roof:9,rc:[1,1,1],frame:0,sh:[.30,.40,.56],stone:1},     // Frankisch: dakpannen, licht
 {wall:5,wc:[.88,.72,.50],roof:8,rc:[.90,.84,.74],frame:1,sh:[.50,.20,.16]},       // Saksisch: warm pleister, riet
 {wall:6,wc:[.74,.62,.50],roof:1,rc:[.72,.86,.58],frame:0,sh:[.4,.3,.2],norse:1}   // Noors: langhuizen met grasdak
];
function gableRoof(b,w,d,y0,rh,o,S){const hx=w/2+o,hz=d/2+o,ye=y0-o*rh/(d/2),yr=y0+rh,rc=S.rc;
 b.lay(S.roof,S.roof===9?1.3:1.6,rc[0],rc[1],rc[2]);
 b.quad([-hx,ye,hz],[hx,ye,hz],[hx,yr,0],[-hx,yr,0]).quad([hx,ye,-hz],[-hx,ye,-hz],[-hx,yr,0],[hx,yr,0]);
 b.col(rc[0]*.55,rc[1]*.55,rc[2]*.55);
 b.quad([-hx,ye-.06,hz],[hx,ye-.06,hz],[hx,ye,hz],[-hx,ye,hz]).quad([hx,ye-.06,-hz],[-hx,ye-.06,-hz],[-hx,ye,-hz],[hx,ye,-hz]);
 b.lay(7,2,.8,.75,.7);for(const sx of[-1,1])for(const sz of[-1,1])b.beam([sx*hx,ye-.03,sz*hz],[sx*hx,yr-.01,0],.028);
 b.beam([-hx,yr,0],[hx,yr,0],.035);
 if(S.norse)for(const t of[.33,.66]){const y=lerp(ye,yr,t),z=lerp(hz,0,t);b.beam([-hx,y+.02,z],[hx,y+.02,z],.02).beam([-hx,y+.02,-z],[hx,y+.02,-z],.02)}}
function door(b,x,z,w,h){b.lay(7,2,.75,.7,.65).box(x,.1,z+.008,w+.07,h+.035,.03);b.lay(6,3,.5,.38,.28).box(x,.1,z+.02,w,h,.03)}
function win(b,x,y,z,w,h,S){b.lay(14,1,.10,.10,.14).box(x,y,z+.004,w,h,.025);b.lay(7,2,.75,.7,.65).box(x,y-.02,z+.012,w+.05,.02,.035);
 if(S.sh){b.lay(6,4,S.sh[0],S.sh[1],S.sh[2]);b.box(x-w*.8,y,z+.01,w*.5,h,.02).box(x+w*.8,y,z+.01,w*.5,h,.02)}}
function flag(b,x,z,h){b.lay(7,2,.8,.75,.7).beam([x,-.1,z],[x,h,z],.022,.014,5,true);b.team().quad([x,h-.27,z],[x+.36,h-.24,z+.02],[x+.36,h-.05,z+.02],[x,h-.02,z])}
function barrel(b,x,z){b.lay(6,4,.62,.5,.36).cyl(x,0,z,.07,.065,.17,8);b.lay(7,2,.3,.3,.32).cyl(x,.04,z,.074,.074,.02,8,false).cyl(x,.12,z,.072,.072,.02,8,false)}
function woodpile(b,x,z,n){b.lay(12,3,1,.95,.9);for(let i=0;i<n;i++){const r=i<3?0:1;b.beam([x-.17,.045+r*.075,z+(i%3-1)*.085+r*.04],[x+.17,.045+r*.075,z+(i%3-1)*.085+r*.04],.04,.04,6,true)}}
function pyr(b,x,y,z,w,d,h){const a=w/2,c=d/2,t=[x,y+h,z];b.tri([x-a,y,z+c],[x+a,y,z+c],t).tri([x+a,y,z+c],[x+a,y,z-c],t).tri([x+a,y,z-c],[x-a,y,z-c],t).tri([x-a,y,z-c],[x-a,y,z+c],t)}
function merlons(b,x,y,z,w,d,n,s){const m=n*2-1;for(let i=0;i<n;i++){const o=(i*2+.5)/m-.5;for(const k of[-1,1]){b.box(x+o*w,y,z+k*(d/2-s/2),w/m,s*1.4,s);if(d>.2)b.box(x+k*(w/2-s/2),y,z+o*d,s,s*1.4,d/m)}}}
// huis met nok langs x; voorkant = +z
function house(b,S,w,d,wh,rh,o){o=o||{};const y0=.1+wh,hx=w/2,hz=d/2,wc=S.wc;
 b.lay(21,2,.74,.72,.68).box(0,-.5,0,w+.1,.6,d+.1);
 if(S.stone&&o.base){b.lay(21,2,.9,.88,.84).box(0,.1,0,w+.02,wh*.45,d+.02)}
 b.lay(S.wall,1.5,wc[0],wc[1],wc[2]).box(0,.1,0,w,wh,d);
 b.tri([hx,y0,hz],[hx,y0,-hz],[hx,y0+rh,0]).tri([-hx,y0,-hz],[-hx,y0,hz],[-hx,y0+rh,0]);
 if(S.frame){b.lay(7,2,.88,.82,.76);for(const sx of[-1,1])for(const sz of[-1,1])b.box(sx*hx,.1,sz*hz,.075,wh,.075);
  for(const sz of[-1,1]){b.box(0,y0-.06,sz*hz,w+.05,.06,.06);b.box(0,.1+wh*.48,sz*(hz+.004),w,.04,.03);const n=Math.max(2,Math.round(w/.5));for(let i=1;i<n;i++)b.box(-hx+i*w/n,.1,sz*(hz+.004),.045,wh,.03)}
  for(const sx of[-1,1]){b.box(sx*(hx+.004),y0-.05,0,.03,.05,d);b.box(sx*(hx+.004),y0,0,.03,rh*.82,.045);b.box(sx*(hx+.004),y0+rh*.42,0,.03,.04,d*.5);b.box(sx*(hx+.004),.1,0,.03,wh,.045)}}
 if(S.norse){for(const sx of[-1,1]){const x=sx*(hx+.15);b.lay(7,2,.7,.62,.55).beam([x,y0+rh-.3,.24],[x,y0+rh+.24,-.14],.03).beam([x,y0+rh-.3,-.24],[x,y0+rh+.24,.14],.03)}
  const n=Math.floor(w/.34);for(let i=0;i<n;i++){const x=-hx+(i+.5)*w/n;if(o.doors&&o.doors.some(q=>q[0]===0&&Math.abs(q[1]-x)<.22))continue;
   if(i%2)b.team();else b.lay(6,3,.8,.7,.45);b.beam([x,.1+wh*.55,hz+.005],[x,.1+wh*.55,hz+.03],.085,.085,8,true);b.lay(21,1,.75,.75,.8).beam([x,.1+wh*.55,hz+.03],[x,.1+wh*.55,hz+.05],.028,.02,6,true)}}
 gableRoof(b,w,d,y0,rh,o.ov||.14,S);
 const face=(s,fn)=>{b.push().ry(s*PI/2);fn(s&1?hx:hz);b.pop()};
 (o.doors||[]).forEach(q=>face(q[0],z=>door(b,q[1],z,q[2]||.2,q[3]||Math.min(.36,wh-.04))));
 (o.wins||[]).forEach(q=>face(q[0],z=>win(b,q[1],q[2]||(.1+wh*.42),z,q[3]||.11,q[4]||.14,S)));
 if(o.chim){const cx=o.chim[0],cz=o.chim[1],cb=y0+rh*(1-Math.abs(cz)/(d/2))-.08;b.lay(4,3,1,1,1).box(cx,cb,cz,.15,y0+rh+.2-cb,.15);b.lay(21,2,.6,.6,.6).box(cx,y0+rh+.2,cz,.18,.03,.18);b.smoke=b.tp([cx,y0+rh+.26,cz])}}
MB.prototype.sph=function(x,y,z,rx,ry,rz,nu,nv,v0,v1){v0=v0||0;v1=v1===undefined?1:v1;const i0=this.n,s=this.us;
 for(let j=0;j<=nv;j++){const t=(v0+(v1-v0)*j/nv)*PI,cy=Math.cos(t),sr=Math.sin(t);for(let i=0;i<=nu;i++){const a=i/nu*TAU,cx=Math.cos(a)*sr,cz=Math.sin(a)*sr;this.vert([x+cx*rx,y+cy*ry,z+cz*rz],[cx/rx,cy/ry,cz/rz],i/nu*2*s,j/nv*s)}}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=i0+j*(nu+1)+i,b=a+nu+1;this.ix.push(a,a+1,b,a+1,b+1,b)}return this};
MB.prototype.tp=function(p){const m=this.M;return[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]]};
// romp van een schip langs z, boeg = +z
function hull(b,L,W,H,sh,N){N=N||8;const st=[];for(let i=0;i<=N;i++){const t=-1+2*i/N,a=Math.abs(t),w=Math.max(.012,W/2*Math.pow(1-Math.pow(a,2.3),.75));st.push([t*L/2,w,H+sh*Math.pow(a,2.6),w*.3])}
 for(let i=0;i<N;i++){const p=st[i],q=st[i+1],k=-.14;
  b.quad([q[3],k,q[0]],[p[3],k,p[0]],[p[1],p[2],p[0]],[q[1],q[2],q[0]]).quad([-p[3],k,p[0]],[-q[3],k,q[0]],[-q[1],q[2],q[0]],[-p[1],p[2],p[0]]);
  b.quad([-p[1],p[2]-.035,p[0]],[-q[1],q[2]-.035,q[0]],[q[1],q[2]-.035,q[0]],[p[1],p[2]-.035,p[0]])}
 return st}
function crewman(b,x,z,c){b.lay(14,1,c[0],c[1],c[2]).tbox(x,0,z,.075,.15,.055,.09,.06);b.lay(14,1,.86,.68,.54).blob(x,.19,z,.036,.04,.036,3,0)}

function buildModels(){
 let b;
 // --- onderdelen voor poppetjes (PART: kleur en laag per instance) ---
 b=new MB();b.part().box(0,0,0,1,1,1,true);MD.pBox=b.finish(true);
 // ronde onderdelen voor de poppetjes (eenheidsmaat, geschaald per instance)
 b=new MB();b.part().beam([0,0,0],[0,-1,0],.5,.4,8,true);MD.pLimb=b.finish(true);
 b=new MB();b.part().sph(0,.5,0,.5,.5,.5,12,8);MD.pHead=b.finish(true);
 b=new MB();b.part().sph(0,.5,0,.5,.5,.5,12,5,0,.52);MD.pHair=b.finish(true);
 b=new MB();b.part().sph(0,0,0,.5,.5,.5,10,6,.45,1);MD.pBeard=b.finish(true);
 b=new MB();b.part().beam([0,0,0],[0,1,0],.62,.42,12,true);MD.pRobe=b.finish(true);
 b=new MB();b.part().beam([0,-1,0],[0,0,0],.6,.46,12,true);MD.pSkirt=b.finish(true);
 b=new MB();b.part().beam([0,0,0],[0,.82,0],.4,.5,10,true).sph(0,.82,0,.5,.18,.5,10,4,0,.5);MD.pTorso=b.finish(true);
 b=new MB();b.part().sph(0,0,0,.5,.5,.5,8,5);MD.pBall=b.finish(true);
 // gereedschap en wapens: greep in de oorsprong, wijst langs +y
 const tool=(fn)=>{const m=new MB();m.lay(7,3,.95,.85,.7);fn(m);return m.finish(true)};
 const iron=m=>m.lay(21,1,.62,.64,.70);
 MD.axe=tool(m=>{m.beam([0,-.06,0],[0,.24,0],.011,.011,4,true);iron(m).tbox(.035,.17,0,.07,.06,.016,.05,.012)});
 MD.pick=tool(m=>{m.beam([0,-.06,0],[0,.26,0],.011,.011,4,true);iron(m).beam([-.09,.22,0],[.09,.22,0],.014,.006,4,true).beam([0,.22,0],[-.09,.215,0],.014,.006,4,true)});
 MD.hoe=tool(m=>{m.beam([0,-.1,0],[0,.3,0],.01,.01,4,true);iron(m).box(.03,.27,0,.07,.014,.05)});
 MD.hammer=tool(m=>{m.beam([0,-.05,0],[0,.2,0],.011,.011,4,true);iron(m).box(0,.17,0,.085,.045,.045)});
 // versie 13: musket (kolf + loop, langs +y) en kanonnen voor de Gouden Eeuw
 MD.musket=tool(m=>{m.lay(7,3,.45,.3,.18).tbox(0,-.2,0,.024,.16,.05,.02,.03).beam([0,-.05,.006],[0,.3,.006],.013,.011,5,true);iron(m).beam([0,.0,.016],[0,.5,.016],.009,.008,6,true).box(0,-.02,.004,.016,.04,.03)});
 {const k=new MB();k.lay(7,3,.5,.34,.2).box(0,.1,-.06,.13,.07,.42).box(0,.03,-.34,.07,.05,.24);for(const sx of[-1,1]){k.lay(7,3,.42,.28,.16).beam([sx*.085,.13,.04],[sx*.115,.13,.04],.13,.13,12,true);k.lay(21,1,.25,.25,.27).beam([sx*.075,.13,.04],[sx*.125,.13,.04],.03,.03,6,true)}
  k.lay(21,1,.2,.2,.22).beam([0,.2,-.16],[0,.25,.42],.05,.036,10,true).beam([0,.198,-.2],[0,.2,-.16],.03,.05,8,true);k.team().box(0,.17,-.07,.15,.012,.12);MD.kanon=k.finish(true)}
 {const k=new MB();k.lay(7,3,.48,.33,.2).box(0,0,0,.3,.13,.3).box(0,.13,0,.24,.04,.24);k.lay(21,1,.22,.22,.24).beam([0,.15,-.06],[0,.36,.12],.095,.085,12,true).beam([0,.36,.12],[0,.38,.135],.075,.08,12,true);
  k.lay(21,1,.3,.3,.32).box(-.12,.14,0,.03,.09,.06).box(.12,.14,0,.03,.09,.06);k.team().box(0,.04,.152,.24,.07,.01);MD.mortier=k.finish(true)}
 MD.spear=tool(m=>{m.beam([0,-.22,0],[0,.42,0],.01,.01,4,true);iron(m).beam([0,.42,0],[0,.52,0],.02,.001,4)});
 MD.sword=tool(m=>{m.beam([0,-.04,0],[0,.03,0],.012,.012,4,true);iron(m).box(0,.03,0,.07,.014,.02).tbox(0,.044,0,.028,.26,.01,.012,.006)});
 MD.bow=tool(m=>{for(let i=0;i<6;i++){const a0=-1+i/3,a1=-1+(i+1)/3;m.beam([.1*(1-a0*a0)-.1,a0*.2,0],[.1*(1-a1*a1)-.1,a1*.2,0],.009,.009,4)}m.lay(14,1,.9,.9,.85).beam([-.1,-.2,0],[-.1,.2,0],.003,.003,3)});
 MD.staff=tool(m=>{m.beam([0,-.24,0],[0,.36,0],.01,.01,4,true);m.lay(17,1,1.1,.95,.5).box(0,.36,0,.018,.1,.018).box(0,.4,0,.07,.018,.018)});
 b=new MB();b.lay(6,3,.55,.45,.32).beam([0,0,-.004],[0,0,.016],.104,.104,16,true);b.team().beam([0,0,.016],[0,0,.02],.098,.098,16,true);iron(b).beam([0,0,.02],[0,0,.045],.03,.014,10,true);MD.shield=b.finish(true);
 b=new MB();iron(b).cyl(0,-.005,0,.06,.06,.012,12,false).sph(0,0,0,.058,.075,.058,12,5,0,.5).box(0,-.05,.056,.013,.058,.008);b.lay(21,1,.5,.46,.38);for(let i=0;i<4;i++){const a=i*PI/2;b.beam([Math.cos(a)*.058,0,Math.sin(a)*.058],[0,.075,0],.006,.004,4)}MD.helm=b.finish(true);
 b=new MB();b.lay(17,3,1,.95,.8).blob(0,.06,0,.07,.075,.055,5,.15);MD.sack=b.finish(true);
 b=new MB();b.lay(12,3,1,.95,.9);for(let i=0;i<3;i++)b.beam([-.09,.03+(i===2?.05:0),(i-1)*.045+(i===2?.045:0)],[.09,.03+(i===2?.05:0),(i-1)*.045+(i===2?.045:0)],.026,.026,6,true);MD.logs=b.finish(true);
 // paard (romp, hals, hoofd, staart); benen via pLimb
 b=new MB();b.lay(23,2,.62,.46,.32).sph(0,.33,-.02,.125,.13,.27,14,8).sph(0,.35,.17,.115,.125,.12,10,6).sph(0,.34,-.2,.12,.125,.12,10,6)
  .beam([0,.37,.2],[0,.6,.34],.07,.045,10,true).beam([0,.62,.33],[0,.52,.48],.05,.03,10,true).sph(0,.6,.34,.05,.05,.05,8,5);
 b.col(.3,.22,.16).beam([.025,.65,.33],[.03,.7,.32],.012,.003,4,true).beam([-.025,.65,.33],[-.03,.7,.32],.012,.003,4,true);
 b.lay(17,1,.2,.15,.12).box(0,.4,.26,.022,.24,.13).beam([0,.4,-.3],[0,.18,-.38],.035,.016,6,true);
 b.lay(23,2,.4,.28,.2).box(0,.45,-.02,.17,.035,.2);b.team().box(0,.38,-.02,.262,.07,.2);MD.horse=b.finish(true);
 // schaap
 b=new MB();b.lay(14,2,.93,.91,.85).blob(0,.2,0,.105,.1,.16,7,.12).col(.2,.18,.17).tbox(0,.2,.15,.06,.075,.09,.05,.06);
 for(const sx of[-1,1])for(const sz of[-1,1])b.box(sx*.055,0,sz*.085,.025,.12,.025);b.team().box(0,.19,.125,.1,.1,.02);MD.sheep=b.finish();
 // pijl
 b=new MB();b.lay(7,3,1,.9,.75).beam([0,0,-.15],[0,0,.13],.006,.006,4);iron(b).beam([0,0,.13],[0,0,.17],.012,.001,4);b.lay(14,1,.9,.9,.85).quad([-.02,0,-.15],[.02,0,-.15],[.02,0,-.1],[-.02,0,-.1]);MD.arrow=b.finish(true);
 // vis
 b=new MB();b.lay(14,1,.5,.58,.62).tri([0,0,.12],[.035,0,0],[-.035,0,0]).tri([.035,0,0],[0,0,-.1],[-.035,0,0]).tri([0,0,-.09],[.03,0,-.15],[-.03,0,-.15]);MD.fish=b.finish(true);
 buildNature();buildShips();
 // steigers en puin per grootte
 MD.scaf=[];MD.rubble=[];
 for(let sz=1;sz<=3;sz++){b=new MB();b.lay(6,3,.86,.74,.52);const h=sz/2-.04,H=.55+sz*.22,n=sz;
  for(let i=0;i<=n;i++)for(const k of[-1,1]){const t=-h+i*2*h/n;b.beam([t,-.1,k*h],[t,H,k*h],.022,.02,4,true);if(i>0&&i<n)b.beam([k*h,-.1,t],[k*h,H,t],.022,.02,4,true)}
  for(const y of[H*.45,H*.9])for(const k of[-1,1]){b.beam([-h,y,k*h],[h,y,k*h],.016,.016,4).beam([k*h,y,-h],[k*h,y,h],.016,.016,4)}
  b.box(0,H*.45,h-.07,h*1.6,.02,.14).box(-h+.07,H*.9,0,.14,.02,h*1.5).beam([h,-.1,-h],[h-.3*sz,H*.45,-h],.016,.016,4);MD.scaf[sz]=b.finish(true);
  b=new MB();const r=RNG(40+sz);b.lay(2,2,.8,.76,.72).blob(0,-.02,0,sz*.46,.07,sz*.46,3,.15);
  for(let i=0;i<4+sz*4;i++){const x=(r()-.5)*sz*.8,z=(r()-.5)*sz*.8;if(r()<.55)b.lay(21,2,.7+r()*.2,.7,.66).rock(x,.04,z,.06+r()*.09,.05+r()*.05,.06+r()*.08,i+3);else{const a=r()*PI;b.lay(7,2,.5,.45,.4).beam([x,.04,z],[x+Math.cos(a)*.34,.05+r()*.12,z+Math.sin(a)*.34],.025,.025,4,true)}}
  MD.rubble[sz]=b.finish()}
 // molenwieken (draaien om z-as)
 b=new MB();for(let i=0;i<4;i++){b.push().rz(i*PI/2);b.lay(7,2,.8,.74,.66).beam([0,0,0],[0,.82,0],.018,.014,4,true);b.lay(14,2,.92,.9,.84).box(.075,.14,0,.13,.62,.008);
  b.lay(7,2,.8,.74,.66);for(let k=0;k<5;k++)b.box(.075,.16+k*.14,.006,.14,.012,.008);b.pop()}MD.blades=b.finish(true);
}

// ---------- natuur ----------
function leafCluster(b,c,ctr,s,r,tint){let nx=c[0]-ctr[0],ny=c[1]-ctr[1]+.4,nz=c[2]-ctr[2];const l=hyp(nx,ny,nz)||1,n=[nx/l,ny/l,nz/l],a0=r()*PI;
 for(let k=0;k<3;k++){const a=a0+k*PI/3+(r()-.5)*.3,t=(r()-.5)*1.1,ca=Math.cos(a),sa=Math.sin(a),st=Math.sin(t),ct=Math.cos(t),f=.86+r()*.28;
  const U=[ca*s,0,sa*s],V=[-sa*st*s,ct*s,ca*st*s];b.col(tint[0]*f,tint[1]*f,tint[2]*f);
  b.card([c[0]-U[0]-V[0],c[1]-U[1]-V[1],c[2]-U[2]-V[2]],[c[0]+U[0]-V[0],c[1]+U[1]-V[1],c[2]+U[2]-V[2]],[c[0]+U[0]+V[0],c[1]+U[1]+V[1],c[2]+U[2]+V[2]],[c[0]-U[0]+V[0],c[1]-U[1]+V[1],c[2]-U[2]+V[2]],n)}}
function broadleaf(seed,o){const b=new MB(),r=RNG(seed),H=o.h,R=o.r,tr=o.tr,bark=o.bark||[1,1,1];b.aoH=0;
 b.lay(12,2.5,bark[0],bark[1],bark[2]);
 b.beam([0,-.12,0],[0,.14,0],tr*1.75,tr*1.05,7).beam([0,.14,0],[.02,H*.42,(r()-.5)*.06],tr*1.05,tr*.8,7);
 if(o.birch){b.col(.16,.15,.14);for(let i=0;i<6;i++){const y=.16+r()*H*.5;b.beam([0,y,0],[0,y+.02+r()*.02,0],tr*1.04,tr*1.03,7)}b.col(bark[0],bark[1],bark[2])}
 const ctr=[0,H*.68,0],tips=[],nb=o.nb||5,top=[.02,H*.42,0];
 for(let i=0;i<nb;i++){const a=i/nb*TAU+r()*.7,el=.5+r()*.5,L=R*(.65+r()*.35),e=[top[0]+Math.cos(a)*L*Math.cos(el),top[1]+L*Math.sin(el)+H*.08,top[2]+Math.sin(a)*L*Math.cos(el)],m=[lerp(top[0],e[0],.5),lerp(top[1],e[1],.5)+.05,lerp(top[2],e[2],.5)];
  b.beam(top,m,tr*.5,tr*.34,5).beam(m,e,tr*.34,tr*.12,5);tips.push(e);
  for(let k=0;k<2;k++){const a2=a+(r()-.5)*1.8,L2=L*(.4+r()*.25),e2=[m[0]+Math.cos(a2)*L2,m[1]+L2*(.4+r()*.5),m[2]+Math.sin(a2)*L2];b.beam(m,e2,tr*.24,tr*.08,4);tips.push(e2)}}
 b.beam(top,[0,H*.86,0],tr*.6,tr*.12,5);tips.push([0,H*.9,0]);
 b.lay(18,1);const tint=o.tint;
 for(let i=0;i<5;i++)leafCluster(b,[(r()-.5)*R*.7,H*.62+(r()-.5)*H*.2,(r()-.5)*R*.7],ctr,o.cs*1.25,r,[tint[0]*.42,tint[1]*.45,tint[2]*.42]);
 const nc=o.nc||30;for(let i=0;i<nc;i++){let c;if(i<tips.length){c=tips[i]}else{const a=r()*TAU,e=Math.acos(1-2*r())-PI/2,k=.72+r()*.3;c=[Math.cos(a)*Math.cos(e)*R*k,ctr[1]+Math.sin(e)*H*.3*k+.04,Math.sin(a)*Math.cos(e)*R*k]}
  leafCluster(b,c,ctr,o.cs*(.85+r()*.35),r,tint)}
 return b.finish(true)}
function spruce(seed){const b=new MB(),r=RNG(seed),H=2.2+r()*.5;b.aoH=0;b.lay(12,2.5,.85,.8,.78).beam([0,-.1,0],[0,.1,0],.13,.085,6).beam([0,.1,0],[0,H,0],.085,.012,6);
 b.lay(19,1);const nw=10;for(let w=0;w<nw;w++){const t=w/(nw-1),y=.42+t*(H-.5),L=.78*(1-t*.86)+.1,n=w<7?6:5,a0=r()*TAU;
  for(let i=0;i<n;i++){const a=a0+i/n*TAU+(r()-.5)*.25,dx=Math.cos(a),dz=Math.sin(a),dr=.34+r()*.2,s=[dx*.03,y,dz*.03],e=[dx*L,y-L*dr,dz*L],px=-dz*L*.42,pz=dx*L*.42,f=.82+r()*.3;
   b.col(f*.95,f,f*.95).card([s[0]-px*.5,s[1],s[2]-pz*.5],[e[0]-px,e[1],e[2]-pz],[e[0]+px,e[1],e[2]+pz],[s[0]+px*.5,s[1],s[2]+pz*.5],[dx*.45,.85,dz*.45]);
   const q=L*.26;b.col(f*.7,f*.76,f*.72).card([s[0],s[1]+q*.3,s[2]],[e[0],e[1]+q*.3,e[2]],[e[0],e[1]-q,e[2]],[s[0],s[1]-q,s[2]],[dx*.8,.5,dz*.8])}}
 return b.finish(true)}
function pine(seed){const b=new MB(),r=RNG(seed),H=2.1+r()*.5;b.aoH=0;const lean=(r()-.5)*.3,p1=[lean*.3,H*.4,(r()-.5)*.08],p2=[lean*.8,H*.74,(r()-.5)*.1],p3=[lean,H,0];
 b.lay(12,2.5,.9,.78,.7).beam([0,-.1,0],[0,.12,0],.14,.09,6).beam([0,.12,0],p1,.09,.075,6);b.col(1.25,.86,.62).beam(p1,p2,.075,.058,6).beam(p2,p3,.058,.02,6);
 const tips=[p3];for(let i=0;i<6;i++){const a=i/6*TAU+r()*.8,L=.38+r()*.34,y0=H*(.7+r()*.22),s=[lerp(p2[0],p3[0],.5),y0,0],e=[s[0]+Math.cos(a)*L,y0+.08+r()*.16,Math.sin(a)*L];b.beam(s,e,.03,.012,4);tips.push(e)}
 b.beam(p1,[p1[0]+.25,p1[1]+.08,.1],.02,.006,4);
 b.lay(19,1);for(const c of tips){const n=7,a0=r()*TAU;for(let i=0;i<n;i++){const a=a0+i/n*TAU,L=.36+r()*.14,dx=Math.cos(a),dz=Math.sin(a),up=(r()-.3)*.22,e=[c[0]+dx*L,c[1]+up,c[2]+dz*L],px=-dz*L*.5,pz=dx*L*.5,f=.9+r()*.3;
   b.col(f*.82,f*1.0,f*.9).card([c[0]-px*.4,c[1],c[2]-pz*.4],[e[0]-px,e[1],e[2]-pz],[e[0]+px,e[1],e[2]+pz],[c[0]+px*.4,c[1],c[2]+pz*.4],[dx*.3,.95,dz*.3])}}
 return b.finish(true)}
function buildNature(){let b;
 const oak={h:1.95,r:.78,tr:.105,cs:.33,tint:[.92,1,.86],nc:30},beech={h:2.15,r:.7,tr:.09,cs:.31,tint:[1.05,1.08,.8],nc:30,bark:[1.1,1.1,1.12]},
  small={h:1.4,r:.52,tr:.065,cs:.27,tint:[1,1.05,.82],nc:20,nb:4},birch={h:1.9,r:.5,tr:.055,cs:.24,tint:[1.18,1.22,.78],nc:24,nb:4,bark:[2.4,2.4,2.35],birch:1};
 MD.tree=[broadleaf(11,oak),broadleaf(12,oak),broadleaf(13,beech),broadleaf(14,small),broadleaf(15,small),broadleaf(16,birch),broadleaf(17,birch),spruce(18),spruce(19),pine(20),pine(21)];
 b=new MB();b.lay(12,2.5,1,1,1).beam([0,-.1,0],[0,.13,0],.16,.1,7);b.lay(6,4,1.25,1.1,.85).beam([0,.13,0],[0,.131,0],.1,.1,7,true);MD.stump=b.finish();
 b=new MB();b.lay(12,2.5,1,1,1).beam([0,-.1,0],[0,.13,0],.16,.1,7);b.lay(6,4,1.25,1.1,.85).beam([0,.13,0],[0,.131,0],.1,.1,7,true);
 b.lay(12,2.5,1,1,1).beam([.16,.09,.05],[1.2,.07,.3],.095,.05,7,true).beam([.6,.09,.17],[.75,.3,-.05],.03,.01,4).beam([.9,.08,.24],[1.02,.26,.42],.025,.01,4);MD.felled=b.finish();
 b=new MB();b.lay(12,2.5,.9,.9,.88).beam([-.45,.07,-.1],[.5,.06,.12],.08,.05,7,true).beam([-.2,.08,-.04],[-.3,.26,.1],.022,.008,4);b.lay(13,2,.7,.9,.6).blob(.1,.1,.03,.12,.03,.09,4,.2);MD.fallen=b.finish();
 MD.rockD=[];for(let i=0;i<3;i++){b=new MB();b.lay(11,1.6,.95,.95,.95).rock(0,.04,0,.13+i*.04,.09+i*.03,.11+i*.03,60+i);if(i)b.rock(.14,.02,.08,.07,.05,.06,70+i);MD.rockD[i]=b.finish()}
 MD.gold=[];MD.stone=[];for(let i=0;i<2;i++){const r=RNG(80+i);
  b=new MB();b.lay(11,1.5,.82,.8,.78).rock(-.12,.1,.05,.3,.22,.26,81+i).rock(.2,.06,-.1,.22,.16,.2,83+i);
  b.lay(11,1,1.42,1.08,.4);for(let k=0;k<9;k++)b.rock((r()-.5)*.6,.1+r()*.2,(r()-.5)*.5,.045+r()*.05,.04+r()*.04,.045+r()*.04,90+k);MD.gold[i]=b.finish();
  b=new MB();b.lay(11,1.5,1.12,1.12,1.14).rock(-.1,.12,.02,.3,.26,.27,85+i).rock(.22,.08,.1,.2,.19,.2,87+i).rock(.06,.05,-.24,.17,.13,.15,89+i);
  b.lay(21,1.5,1.05,1.05,1.05).box(.3,0,-.2,.16,.1,.12).box(-.32,0,.26,.14,.09,.11);MD.stone[i]=b.finish()}
 const bush=(seed,s,n,tint,berry)=>{const m=new MB(),r=RNG(seed);m.aoH=0;m.lay(12,3,.8,.75,.7);for(let i=0;i<3;i++){const a=r()*TAU;m.beam([0,-.05,0],[Math.cos(a)*s*.5,s*.6,Math.sin(a)*s*.5],.018,.006,4)}
  m.lay(18,1);const ctr=[0,s*.4,0];for(let i=0;i<n;i++){const a=r()*TAU,d=r()*s*.75;leafCluster(m,[Math.cos(a)*d,s*(.32+r()*.45),Math.sin(a)*d],ctr,s*.52,r,tint)}
  if(berry){m.lay(14,1,.75,.1,.14);for(let i=0;i<16;i++){const a=r()*TAU,d=s*(.35+r()*.5),y=s*(.3+r()*.55);m.rock(Math.cos(a)*d,y,Math.sin(a)*d,.022,.022,.022,i+1)}}return m.finish(true)};
 MD.berry=bush(101,.36,7,[.78,.95,.7],1);
 // rode bestrosjes voor de 3D-bessenstruik (die zelf alleen groen blad heeft)
 {const r=RNG(207);b=new MB();for(let k=0;k<22;k++){const th=r()*TAU,ph=.25+r()*1.05,cx=Math.cos(th)*Math.sin(ph)*.44,cy=.08+Math.cos(ph)*.5,cz=Math.sin(th)*Math.sin(ph)*.44;b.col(.72+r()*.2,.06,.08);for(let j=0;j<3;j++)b.sph(cx+(r()-.5)*.06,cy+(r()-.5)*.05,cz+(r()-.5)*.06,.032,.032,.032,6,4)}MD.berries=b.finish(true)}MD.shrub=[bush(102,.26,5,[.9,.98,.72]),bush(103,.2,4,[1.05,1.02,.7])];
 const tuft=(seed,n,s,tint,fl)=>{const m=new MB(),r=RNG(seed);m.aoH=0;m.lay(20,1);for(let i=0;i<n;i++){const x=(r()-.5)*.3,z=(r()-.5)*.3,a=r()*PI,w=s*(.5+r()*.3),h=s*(.8+r()*.5),ca=Math.cos(a)*w,sa=Math.sin(a)*w,f=.85+r()*.3;
   m.col(tint[0]*f,tint[1]*f,tint[2]*f).card([x-ca,-.02,z-sa],[x+ca,-.02,z+sa],[x+ca,h,z+sa],[x-ca,h,z-sa],[0,1,0])}
  if(fl){m.lay(14,1);for(let i=0;i<7;i++){const x=(r()-.5)*.36,z=(r()-.5)*.36,y=s*(.55+r()*.4),c=fl[i%fl.length];m.col(c[0],c[1],c[2]).rock(x,y,z,.02,.014,.02,i+2)}}return m.finish(true)};
 MD.tuft=[tuft(111,4,.2,[1,1,1]),tuft(112,5,.26,[1.1,1.05,.85])];MD.flower=[tuft(113,3,.16,[1,1,1],[[.95,.9,.3],[.95,.95,.95]]),tuft(114,3,.16,[1,1,1],[[.75,.3,.6],[.4,.45,.9]])];
 // graan op de akker (2x2), wuivend
 b=new MB();b.aoH=0;const r=RNG(121);b.lay(20,1);for(let row=0;row<7;row++)for(let i=0;i<7;i++){const x=-.84+i*.28+(r()-.5)*.08,z=-.84+row*.28+(r()-.5)*.05,a=(r()-.5)*.8,w=.17,h=.3+r()*.1,ca=Math.cos(a)*w,sa=Math.sin(a)*w,f=.9+r()*.25;
  b.col(1.35*f,1.12*f,.6*f).card([x-ca,.04,z-sa],[x+ca,.04,z+sa],[x+ca,h,z+sa],[x-ca,h,z-sa],[0,1,0]).card([x-sa,.04,z+ca],[x+sa,.04,z-ca],[x+sa,h,z-ca],[x-sa,h,z+ca],[0,1,0])}MD.grain=b.finish(true);
}

// ---------- schepen ----------
function buildShips(){let b,st;
 // vissersboot
 b=new MB();b.aoH=0;b.lay(6,3,.7,.56,.4);hull(b,1.0,.36,.12,.08,6);b.lay(7,2,.8,.74,.66).beam([0,.05,.05],[0,.62,.05],.016,.012,5,true).beam([-.16,.5,.05],[.16,.5,.05],.01,.01,4);
 b.lay(14,2,.9,.87,.78).quad([-.15,.17,.06],[.15,.17,.06],[.15,.49,.07],[-.15,.49,.07]);b.team().quad([0,.6,.05],[.14,.58,.05],[.14,.54,.05],[0,.55,.05]);
 b.lay(17,3,.75,.7,.55).blob(0,.11,-.25,.09,.05,.11,5,.2);crewman(b,0,-.08,[.5,.42,.32]);MD.shFish=b.finish(true);
 // oorlogsschip (westers)
 b=new MB();b.aoH=0;b.lay(6,3,.62,.48,.34);hull(b,1.7,.56,.2,.1,8);b.lay(6,3,.72,.58,.42).box(0,.2,-.6,.36,.16,.34).box(0,.2,.62,.3,.13,.26);
 b.lay(7,2,.7,.64,.56);merlons(b,0,.36,-.6,.36,.34,3,.045);b.beam([0,.1,0],[0,1.05,0],.026,.018,6,true).beam([-.36,.86,0],[.36,.86,0],.014,.014,4);
 b.team().quad([-.34,.3,.03],[.34,.3,.03],[.34,.85,.01],[-.34,.85,.01]);b.lay(14,2,.92,.9,.82).quad([-.34,.48,.035],[.34,.48,.035],[.34,.62,.03],[-.34,.62,.03]);
 b.team().quad([0,1.03,0],[.2,1.0,0],[.2,.94,0],[0,.95,0]);crewman(b,-.1,.2,[.45,.4,.36]);crewman(b,.1,-.25,[.5,.45,.3]);crewman(b,0,-.6+.0,[.4,.36,.4]);MD.shWar=b.finish(true);
 // langschip
 b=new MB();b.aoH=0;b.lay(6,3,.56,.42,.3);st=hull(b,1.9,.42,.13,.34,8);
 b.lay(7,2,.75,.66,.56).beam([0,.44,.93],[0,.74,.99],.03,.02,5).beam([0,.74,.99],[0,.82,.9],.02,.008,5,true).beam([0,.44,-.93],[0,.7,-1.0],.03,.012,5,true);
 for(let i=1;i<8;i++){const p=st[i];for(const k of[-1,1]){if(i%2)b.team();else b.lay(6,3,.9,.78,.4);b.push().tr(k*(p[1]+.012),p[2]+.01,p[0]).ry(k*PI/2).beam([0,0,0],[0,0,.014],.065,.065,8,true).pop()}}
 b.lay(7,2,.8,.74,.66).beam([0,.08,0],[0,.98,0],.022,.016,6,true).beam([-.4,.86,0],[.4,.86,0],.012,.012,4);
 for(let i=0;i<6;i++){const x0=-.39+i*.13;if(i%2)b.lay(14,2,.93,.9,.82);else b.team();b.quad([x0,.26,.03],[x0+.13,.26,.03],[x0+.13,.85,.01],[x0,.85,.01])}
 crewman(b,-.08,.3,[.4,.34,.3]);crewman(b,.08,-.3,[.44,.3,.26]);crewman(b,0,-.62,[.36,.36,.4]);MD.shLong=b.finish(true);
 // wrak
 b=new MB();b.aoH=0;b.push().rz(.5).rx(.25);b.lay(6,3,.42,.34,.26);hull(b,1.3,.46,.16,.1,6);b.lay(7,2,.6,.55,.5).beam([0,.1,0],[.2,.6,.1],.022,.016,5,true);b.pop();MD.wreck=b.finish(true);
}

// ---------- gebouwen ----------
function bMesh(type,st,v){const k=type+'_'+st+'_'+(v||0);if(MD.b[k])return MD.b[k];const b=new MB(),S=STY[st];
 const F={hoeve(){
   if(S.norse){house(b,S,2.6,1.25,.5,.72,{doors:[[0,0,.26,.38]],chim:[.6,-.1],ov:.16});b.lay(7,2,.7,.62,.55).box(0,.1,.75,.5,.03,.3);for(const k of[-1,1])b.beam([k*.22,.1,.88],[k*.22,.52,.88],.03,.03,5,true);}
   else{b.push().tr(.15,0,-.3);house(b,S,2.2,1.2,S===STY[2]?.4:.52,S===STY[2]?.95:.8,{doors:[[0,.55,.24,.36]],wins:[[0,-.2],[0,-.7],[1,0,.75]],chim:[-.5,-.1],base:1});b.pop();
    if(S.stone){b.lay(21,2,.95,.93,.88).box(-1.02,-.4,.55,.7,1.75,.7);b.col(.7,.68,.64);merlons(b,-1.02,1.35,.55,.76,.76,3,.07);b.lay(14,1,.1,.1,.14).box(-1.02,.8,.905,.08,.22,.02);b.lay(9,1.3,1,1,1);pyr(b,-1.02,1.35,.55,.5,.5,.5)}
    else{b.push().tr(-.65,0,.55).ry(-PI/2);house(b,S,1.05,1.0,.42,.6,{doors:[[1,0,.22,.34]],wins:[[0,-.1]]});b.pop()}}
   flag(b,1.2,1.05,1.5);barrel(b,.75,1.0);barrel(b,.92,.95);woodpile(b,.2,1.12,5)},
  huis(){if(S.norse)house(b,S,1.35,.95,.4,.5,{doors:[[0,.2,.2,.32]],ov:.12});
   else house(b,S,1.4,1.05,.42,.55,{doors:[[0,.3]],wins:[[0,-.3],[1,0,.6]],chim:v?null:[-.35,-.1]});if(v)woodpile(b,-.2,.72,4);else barrel(b,-.5,.66)},
  akker(){b.lay(15,2,1,1,1).box(0,-.3,0,1.92,.34,1.92);b.lay(7,2,.8,.74,.66);for(const sx of[-1,1])for(const sz of[-1,1])b.beam([sx*.94,-.1,sz*.94],[sx*.94,.2,sz*.94],.022,.02,4,true);
   for(const k of[-1,1])b.beam([-.94,.14,k*.94],[.94,.14,k*.94],.012,.012,4).beam([k*.94,.14,-.94],[k*.94,.14,.6],.012,.012,4)},
  molen(){b.lay(21,2,.74,.72,.68).box(0,-.5,0,1.25,.62,1.25);const wc=S.wc;b.lay(S.norse?6:S.wall,1.5,wc[0],wc[1],wc[2]);
   const n=8,r0=.56,r1=.36,H=1.25;for(let i=0;i<n;i++){const a0=i/n*TAU+PI/8,a1=(i+1)/n*TAU+PI/8;b.quad([Math.cos(a0)*r0,.1,-Math.sin(a0)*r0],[Math.cos(a1)*r0,.1,-Math.sin(a1)*r0],[Math.cos(a1)*r1,H,-Math.sin(a1)*r1],[Math.cos(a0)*r1,H,-Math.sin(a0)*r1])}
   b.lay(7,2,.8,.74,.66).cyl(0,.72,0,.5,.5,.03,8,false);b.lay(S.roof===9?10:S.roof,1.6,S.rc[0],S.rc[1],S.rc[2]).cyl(0,H,0,.42,.03,.42,8,true);
   door(b,0,.535,.2,.34);win(b,0,.85,.44,.09,.12,{});b.lay(7,2,.7,.64,.56).beam([0,1.36,.2],[0,1.4,.5],.035,.03,5,true);b.hub=[0,1.4,.5];barrel(b,.6,.6)},
  opslag(){b.lay(21,2,.74,.72,.68).box(0,-.5,0,1.7,.56,1.3);b.lay(7,2,.85,.78,.7);for(const sx of[-1,1])for(const sz of[-1,1])b.box(sx*.75,.06,sz*.55,.08,.6,.08);
   b.lay(6,2,.78,.66,.5).box(0,.06,-.58,1.5,.5,.04).box(-.77,.06,0,.04,.34,1.1);gableRoof(b,1.6,1.2,.66,.5,.16,S.norse?S:{roof:10,rc:[1,1,1]});
   woodpile(b,-.38,.1,5);woodpile(b,-.38,-.25,5);b.lay(21,1.5,1,1,1).box(.35,.06,-.25,.3,.16,.26).box(.42,.22,-.25,.16,.12,.2);b.lay(21,1,1.5,1.15,.3).rock(.4,.1,.22,.1,.08,.1,5).rock(.56,.08,.3,.07,.06,.07,6);barrel(b,.05,.3)},
  haven(){b.lay(7,2,.62,.56,.5);for(const x of[-.7,0,.7])for(const z of[.25,.85,1.4])b.beam([x,-.7,z],[x,.2,z],.05,.045,6,true);
   b.lay(6,2,.76,.64,.48).box(0,.1,.75,1.7,.05,1.5);b.push().tr(-.25,0,-.45);house(b,S,1.2,.8,.38,.42,{doors:[[0,.2,.22,.3]],wins:[[0,-.3]],ov:.12});b.pop();
   barrel(b,.62,-.3);b.lay(6,3,.7,.6,.44).box(.6,.15,.4,.24,.18,.24).box(.5,.15,.75,.2,.14,.2);b.lay(7,2,.8,.74,.66).beam([-.6,.15,1.0],[-.6,.62,1.0],.02,.02,4,true).beam([-.2,.15,1.0],[-.2,.62,1.0],.02,.02,4,true).beam([-.64,.6,1.0],[-.16,.6,1.0],.012,.012,4);
   b.lay(14,3,.6,.62,.56).quad([-.6,.25,1.0],[-.2,.25,1.0],[-.2,.6,1.0],[-.6,.6,1.0]);flag(b,.72,1.35,.95)},
  kazerne(){if(S.norse)house(b,S,2.5,1.4,.5,.9,{doors:[[0,0,.34,.42]],chim:[.7,0],ov:.2});
   else{b.push().tr(0,0,-.25);house(b,S,2.4,1.45,.58,.72,{doors:[[0,0,.34,.44]],wins:[[0,-.75],[0,.75],[1,0,.8]],chim:[.75,-.2],base:1});b.pop()}
   const z=S.norse?.95:.8;b.lay(7,2,.8,.74,.66).beam([-.95,0,z],[-.95,.4,z],.02,.02,4,true).beam([-.55,0,z],[-.55,.4,z],.02,.02,4,true).beam([-.98,.36,z],[-.52,.36,z],.014,.014,4);
   for(let i=0;i<4;i++){b.lay(7,3,.95,.85,.7).beam([-.9+i*.1,0,z+.1],[-.9+i*.1,.56,z-.02],.008,.008,4);b.lay(21,1,.62,.64,.7).beam([-.9+i*.1,.56,z-.02],[-.9+i*.1,.64,z-.035],.016,.001,4)}
   b.lay(17,3,.9,.8,.6).blob(.8,.32,z+.1,.09,.13,.07,3,.1);b.lay(7,2,.8,.74,.66).beam([.8,0,z+.1],[.8,.5,z+.1],.02,.02,4,true).beam([.62,.36,z+.1],[.98,.36,z+.1],.014,.014,4);
   b.team().quad([-.2,.75,z-.19+(S.norse?.0:0)],[.2,.75,z-.19],[.2,1.02,z-.19],[-.2,1.02,z-.19]);flag(b,1.25,1.1,1.45)},
  stal(){b.push().tr(0,0,-.35);house(b,S,2.5,1.2,.42,.62,{doors:[[0,-.6,.44,.36],[0,.6,.44,.36]],wins:[[1,0,.6]],base:1});b.pop();
   b.lay(7,2,.8,.74,.66);for(let i=0;i<6;i++)b.beam([-1.25+i*.5,-.1,1.15],[-1.25+i*.5,.3,1.15],.022,.02,4,true);for(const y of[.14,.26])b.beam([-1.25,y,1.15],[1.25,y,1.15],.013,.013,4);
   for(const k of[-1,1])for(const y of[.14,.26])b.beam([k*1.25,y,.3],[k*1.25,y,1.15],.013,.013,4);
   b.lay(17,2.5,1,1,1).box(.9,0,.55,.3,.2,.22).box(.95,.2,.55,.2,.16,.2).blob(-.9,.1,.6,.2,.14,.17,4,.15);b.lay(6,3,.6,.5,.38).box(0,0,.7,.4,.1,.16);b.lay(14,1,.2,.3,.36).box(0,.1,.7,.34,.005,.11);flag(b,1.3,-.9,1.3)},
  kerk(){if(S.norse){b.lay(21,2,.74,.72,.68).box(0,-.5,0,2.2,.6,1.5);const N={wall:6,wc:[.6,.5,.4],roof:10,rc:[.95,.9,.85],frame:0};
    house(b,N,2.1,1.4,.4,.5,{doors:[[1,0,.26,.34]],ov:.1});b.push().tr(0,.62,0);b.lay(6,1.5,.6,.5,.4).box(0,.1,0,1.4,.34,.8);gableRoof(b,1.4,.8,.44,.46,.1,N);b.pop();
    b.lay(6,1.5,.6,.5,.4).box(0,1.3,0,.4,.3,.4);b.lay(10,1.6,.95,.9,.85);pyr(b,0,1.6,0,.52,.52,.6);b.lay(7,2,.6,.55,.5).beam([0,2.2,0],[0,2.42,0],.012,.012,4,true).beam([-.07,2.34,0],[.07,2.34,0],.012,.012,4,true)}
   else{b.push().tr(.3,0,0);house(b,S,1.9,1.15,.72,.7,{wins:[[0,-.5,.34,.1,.3],[0,0,.34,.1,.3],[0,.5,.34,.1,.3]],base:1,ov:.1});b.pop();
    const wc=S.wc;b.lay(21,2,.74,.72,.68).box(-.95,-.5,0,.85,.6,.85);b.lay(S.stone?21:S.wall,1.5,S.stone?.95:wc[0],S.stone?.93:wc[1],S.stone?.88:wc[2]).box(-.95,.1,0,.74,1.55,.74);
    b.lay(7,2,.8,.74,.66).box(-.95,1.6,0,.8,.05,.8);b.lay(S.roof===8?10:S.roof,1.4,1,1,1);pyr(b,-.95,1.65,0,.86,.86,.85);
    b.lay(14,1,.1,.1,.14).box(-.95,1.2,.372,.12,.24,.02).box(-1.322,1.2,0,.02,.24,.12);b.push().tr(-.95,0,0).ry(-PI/2);door(b,0,.372,.26,.42);b.pop();door(b,-.95,.372,.26,.42);
    b.lay(21,1,1.4,1.15,.4).beam([-.95,2.5,0],[-.95,2.76,0],.014,.014,4,true).beam([-1.03,2.68,0],[-.87,2.68,0],.014,.014,4,true)}},
  toren(){b.lay(7,2,.82,.74,.62);for(const sx of[-1,1])for(const sz of[-1,1])b.beam([sx*.36,-.2,sz*.36],[sx*.27,1.0,sz*.27],.035,.03,5);
   for(const k of[-1,1]){b.beam([-.34,.1,k*.34],[.3,.62,k*.3],.016,.016,4).beam([k*.34,.1,.34],[k*.3,.62,-.3],.016,.016,4)}
   b.lay(6,2.5,.76,.64,.48).box(0,.98,0,.78,.05,.78);for(const k of[-1,1]){b.box(0,1.03,k*.37,.78,.2,.03);b.box(k*.37,1.03,0,.03,.2,.72)}
   b.lay(7,2,.82,.74,.62);for(const sx of[-1,1])for(const sz of[-1,1])b.beam([sx*.34,1.03,sz*.34],[sx*.34,1.42,sz*.34],.022,.022,4);
   b.lay(S.norse?1:10,1.6,S.norse?.72:1,S.norse?.86:1,S.norse?.58:1);pyr(b,0,1.42,0,.98,.98,.36);b.lay(7,2,.8,.7,.6);for(let i=0;i<7;i++)b.beam([.4,i*.15,.04],[.4,i*.15,.2],.01,.01,4);b.beam([.4,-.1,.04],[.33,1.0,.04],.012,.012,4).beam([.4,-.1,.2],[.33,1.0,.2],.012,.012,4);
   if(S.norse)for(const k of[-1,1]){b.team().push().tr(k*.13,1.14,.39).beam([0,0,0],[0,0,.014],.07,.07,8,true).pop()}flag(b,0,0,1.95)},
  lab(){ // laboratorium: bakstenen werkplaats, ronde stenen toren met koepelinstrument, kookketel met groene damp
   const L={wall:4,wc:[.92,.88,.84],roof:S.roof,rc:S.rc,frame:0,sh:[.28,.34,.4]};
   b.push().tr(-.28,0,-.12);house(b,L,1.3,1.15,.56,.5,{doors:[[0,.25,.2,.36]],wins:[[0,-.3,.36,.1,.13],[3,0,.36,.1,.13]],chim:[-.4,-.15],ov:.1});b.pop();
   b.lay(21,2,.95,.93,.88).cyl(.52,-.4,-.46,.34,.3,1.95,10,false);b.col(.8,.78,.74).cyl(.52,1.55,-.46,.36,.36,.06,10,false);
   b.lay(14,1,.14,.22,.18);for(let i=0;i<3;i++){const a=i*2.1+.4;b.push().tr(.52+Math.cos(a)*.3,0,-.46+Math.sin(a)*.3).ry(-a+PI/2).box(0,.95+i*.12,0,.08,.16,.02).pop()}
   b.lay(S.roof===9?9:10,1.3,1,1,1).cyl(.52,1.61,-.46,.4,.02,.42,10,true);
   b.lay(14,1,1.45,1.1,.42);const cx=.52,cy=2.18,cz=-.46,r=.15;b.beam([cx,2.03,cz],[cx,2.1,cz],.012,.012,5,true);
   for(let ring=0;ring<3;ring++)for(let i=0;i<10;i++){const a0=i/10*TAU,a1=(i+1)/10*TAU,P=a=>ring===0?[cx+Math.cos(a)*r,cy,cz+Math.sin(a)*r]:ring===1?[cx+Math.cos(a)*r,cy+Math.sin(a)*r,cz]:[cx,cy+Math.sin(a)*r,cz+Math.cos(a)*r];b.beam(P(a0),P(a1),.01,.01,4)}
   b.col(.9,.7,.3).blob(cx,cy-.03,cz,.04,.04,.04,2,0);
   // kookketel op drie poten met groen brouwsel
   const kx=.55,kz=.55;b.lay(7,2,.5,.45,.4);for(let i=0;i<3;i++){const a=i*TAU/3;b.beam([kx+Math.cos(a)*.17,-.05,kz+Math.sin(a)*.17],[kx,.42,kz],.012,.012,4)}
   b.lay(21,1,.28,.28,.3).cyl(kx,.14,kz,.1,.15,.17,10,false);b.lay(14,1,.35,1.25,.45).cyl(kx,.3,kz,.14,.14,.005,10,true);b.cauld=[kx,.34,kz];
   // tafel met flessen
   b.lay(6,3,.7,.55,.4).box(-.1,.28,.72,.5,.04,.2);for(const x of[-.3,.1])b.box(x,0,.72,.04,.28,.16);
   [[-.27,[.3,.6,1]],[-.17,[.9,.3,.3]],[-.06,[.4,1,.4]],[.05,[1,.85,.3]]].forEach(([x,c])=>{b.lay(14,1,c[0],c[1],c[2]).cyl(x,.32,.72,.032,.022,.08,6,true)});
   barrel(b,-.75,.72);flag(b,-.95,-.85,1.35)},
  storen(){b.lay(21,2,.8,.78,.74).tbox(0,-.5,0,.92,.62,.92,.84,.84);b.lay(21,2,.98,.96,.92).tbox(0,.12,0,.8,1.3,.8,.72,.72);b.col(.82,.8,.76).box(0,1.42,0,.84,.08,.84);
   b.col(.95,.93,.89);merlons(b,0,1.5,0,.84,.84,3,.08);b.lay(14,1,.08,.08,.1);for(let s=0;s<4;s++){b.push().ry(s*PI/2).box(0,.75,.385,.045,.24,.02).box(0,1.12,.37,.045,.18,.02).pop()}
   door(b,0,.4,.2,.32);flag(b,0,0,2.05)}};
 F[type]();const m=b.finish(type==='akker');m.smoke=b.smoke;m.hub=b.hub;m.cauld=b.cauld;return MD.b[k]=m}

// muurstukken per burenmasker (1=N(-z),2=O(+x),4=Z(+z),8=W(-x)); arm wordt langs +x gebouwd en gedraaid
function wallMesh(type,mask){const k=type+'_'+mask;if(MD.b[k])return MD.b[k];const b=new MB(),straight=mask===5||mask===10,r=RNG(mask*7+3);
 const rot=[PI/2,0,-PI/2,PI];
 if(type==='vmuur'){ // versterkte muur: hoger, dikker, donkerder graniet met steunberen en een loopgang
  for(let d=0;d<4;d++)if(mask&(1<<d)){b.push().ry(rot[d]);
   b.lay(21,2,.66,.65,.63).tbox(.25,-.5,0,.5,.66,.6,.5,.5);b.lay(21,2,.8,.79,.76).box(.25,.22,0,.5,.74,.44);b.col(.7,.69,.66).box(.25,.86,0,.5,.05,.52);
   b.col(.82,.81,.78);for(let i=0;i<2;i++)for(const s2 of[-1,1])b.box(.0625+i*.25,.93,s2*.22,.125,.16,.08);
   b.lay(21,2,.6,.59,.57);for(const s2 of[-1,1])b.tbox(.38,-.1,s2*.27,.12,.5,.1,.08,.05);b.pop()}
  if(!straight||!mask){b.lay(21,2,.66,.65,.63).tbox(0,-.5,0,.7,.66,.7,.62,.62);b.lay(21,2,.84,.83,.8).box(0,.26,0,.58,.9,.58);b.col(.7,.69,.66).box(0,1.02,0,.64,.06,.64);
   b.col(.82,.81,.78);for(const sx of[-1,1])for(const sz of[-1,1])b.box(sx*.25,1.09,sz*.25,.14,.18,.14);
   b.lay(14,1,.08,.08,.1);for(let d=0;d<4;d++)if(!(mask&(1<<d))){b.push().ry(rot[d]+PI/2).box(0,.55,.293,.04,.22,.02).pop()}}
 }else if(type==='muur'){
  for(let d=0;d<4;d++)if(mask&(1<<d)){b.push().ry(rot[d]);
   b.lay(21,2,.8,.78,.74).tbox(.25,-.5,0,.5,.62,.46,.5,.38);b.lay(21,2,.98,.96,.92).box(.25,.12,0,.5,.5,.34);b.col(.84,.82,.78).box(.25,.62,0,.5,.045,.42);
   b.col(.95,.93,.89);for(let i=0;i<2;i++)for(const s of[-1,1])b.box(.0625+i*.25,.665,s*.175,.125,.13,.07);b.pop()}
  if(!straight){b.lay(21,2,.8,.78,.74).tbox(0,-.5,0,.6,.62,.6,.52,.52);b.lay(21,2,1,.98,.94).box(0,.12,0,.48,.66,.48);b.col(.84,.82,.78).box(0,.78,0,.54,.05,.54);
   b.col(.95,.93,.89);for(const sx of[-1,1])for(const sz of[-1,1])b.box(sx*.21,.83,sz*.21,.12,.15,.12);
   b.lay(14,1,.08,.08,.1);for(let d=0;d<4;d++)if(!(mask&(1<<d))){b.push().ry(rot[d]+PI/2).box(0,.36,.233,.04,.2,.02).pop()}}
 }else{
  b.lay(2,2,.86,.8,.72);const stake=(x,z)=>{const h=.56+r()*.14,w=.045+r()*.014,tx=(r()-.5)*.03,tz=(r()-.5)*.03;b.lay(12,3,.95+r()*.2,.9,.85).beam([x,-.15,z],[x+tx,h,z+tz],w,w*.9,5).lay(6,4,1.1,1,.8).beam([x+tx,h,z+tz],[x+tx*1.2,h+.09,z+tz*1.2],w*.9,.004,5)};
  for(let d=0;d<4;d++)if(mask&(1<<d)){b.push().ry(rot[d]);b.lay(2,2,.86,.8,.72).tbox(.25,-.3,0,.5,.42,.5,.5,.26);for(let i=0;i<5;i++)stake(.05+i*.1,(r()-.5)*.02);
   b.lay(7,2,.8,.72,.62).beam([0,.2,-.06],[.5,.2,-.06],.016,.016,4).beam([0,.42,-.06],[.5,.42,-.06],.016,.016,4);b.pop()}
  if(!straight){b.lay(2,2,.86,.8,.72).tbox(0,-.3,0,.5,.42,.5,.3,.3);stake(0,0);if(!mask){stake(.09,.03);stake(-.09,-.03);stake(.02,.1);stake(-.03,-.1)}}
 }
 return MD.b[k]=b.finish()}
// poort: muur loopt langs x, doorgang langs z; v=1 open
function gateMesh(open){const k='poort_'+open;if(MD.b[k])return MD.b[k];const b=new MB();
 for(const s of[-1,1]){b.lay(21,2,.8,.78,.74).tbox(s*.37,-.5,0,.32,.62,.56,.28,.5);b.lay(21,2,1,.98,.94).box(s*.37,.12,0,.26,.92,.46);b.col(.84,.82,.78).box(s*.37,1.04,0,.3,.05,.5);
  b.col(.95,.93,.89);for(const sz of[-1,1])for(const sx of[-1,1])b.box(s*.37+sx*.095,1.09,sz*.19,.09,.13,.1);b.lay(14,1,.08,.08,.1);for(const sz of[-1,1])b.box(s*.37,.7,sz*.232,.04,.18,.02)}
 b.lay(21,2,.92,.9,.86).box(0,.66,0,.5,.3,.36);b.col(.8,.78,.74).box(0,.96,0,.5,.04,.4);b.col(.95,.93,.89);for(let i=0;i<2;i++)for(const s of[-1,1])b.box(-.0625-.0625+i*.25,1.0,s*.165,.125,.1,.07);
 b.lay(21,2,.75,.73,.7);for(const s of[-1,1])b.tri([s*.24,.5,.181],[s*.08,.66,.181],[s*.24,.66,.181]).tri([s*.24,.5,-.181],[s*.24,.66,-.181],[s*.08,.66,-.181]);
 const leaf=()=>{b.lay(6,4,.5,.4,.3).box(.12,0,0,.24,.62,.035);b.lay(21,1,.3,.3,.33).box(.12,.12,0,.245,.03,.045).box(.12,.42,0,.245,.03,.045);b.lay(21,1,.4,.4,.44).box(.2,.28,.022,.03,.03,.02)};
 for(const s of[-1,1]){b.push().tr(s*.24,0,0);if(s>0)b.ry(PI);if(open)b.ry(s>0?PI/2-.12:-PI/2+.12);leaf();b.pop()}
 return MD.b[k]=b.finish()}
