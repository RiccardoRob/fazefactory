// Fazefactory revamp mark. A star in space: poke it, hold it, drag it, throw it. It always comes home.
(()=>{
const F=1.618,CY=F**5,$=i=>document.getElementById(i),M=Math,
// entanglement: both stars share the class .star and receive the very same state every frame
ST=[...document.querySelectorAll('.star')],U=ST.map(s=>[...s.querySelectorAll('use')]),
BIG=$('m'),SMALL=$('b'),
// centres of the pieces (for the hover magnet)
C=[[265,330],[283,306],[358,151],[292,253],[171,331],[302,203]],
cl=x=>x<0?0:x>1?1:x,sm=x=>x*x*(3-2*x),
// Itten RYB primaries in OKLCH, so hues travel cleanly round the wheel
P=[[.5891,.2219,.4572],[.8465,.1731,1.5967],[.4683,.1836,-1.6858]],
g=c=>255*cl(c<=.0031308?12.92*c:1.055*c**(1/2.4)-.055)|0,
rgb=([L,c,h])=>{const a=c*M.cos(h),b=c*M.sin(h),l=(L+.3963*a+.2158*b)**3,m=(L-.1056*a-.0639*b)**3,s=(L-.0895*a-1.2915*b)**3;
 return`rgb(${g(4.0767*l-3.3077*m+.2310*s)},${g(-1.2684*l+2.6098*m-.3413*s)},${g(-.0042*l-.7034*m+1.7076*s)})`},
wheel=p=>{p=(p%3+3)%3;const i=p|0,k=sm(cl((p-i-.15)/.7)),a=P[i],b=P[(i+1)%3];let d=b[2]-a[2];d>M.PI?d-=2*M.PI:d<-M.PI&&(d+=2*M.PI);
 return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+d*k]},
// cosmological redshift: the farther the star, the more its light slides toward red and dims
red=([L,c,h],z)=>{const k=1-1/z;let d=P[0][2]-h;d>M.PI?d-=2*M.PI:d<-M.PI&&(d+=2*M.PI);return[L*(1-.28*k),c,h+d*k*.85]},
// magnet: on hover each piece leans toward the pointer on its own soft spring
G=C.map((_,i)=>({x:0,y:0,r:0,vx:0,vy:0,vr:0,k:38+i*9,c:7+i*.6})),

/* Ambient motions, picked at random between rests. None of them bends the logo:
   the mark only moves or changes distance, as a body in space does. */
FX={
 Orbit:{d:F**3,f(e){const v=M.sin(M.PI*e/F**3),w=2*M.PI*e/F**2;return{x:16*M.cos(w)*v,y:9*M.sin(w)*v}}},   // a small elliptical orbit
 Pulsar:{d:F,f(e){return{z:1+.0618*M.sin(2*M.PI*e/F*2)**2}}}                                           // two beats, nearer and farther
},
NAMES=Object.keys(FX),

/* ---- physics ----
   Space has no air, so the only friction is Hubble friction: in an expanding universe a moving body
   loses momentum at the rate of the Hubble parameter. Planck 2018 gives h = 0.674 (H0 = 67.4 km/s/Mpc);
   read here, for fun, as 0.674 per second. The same constant drives the hold-to-recede: a held star
   recedes by Hubble's law, its distance growing as e^(H·t), so the longer you hold, the faster it goes. */
H=.674,
POKE=1.1618,        // a single click sends it 16.18% farther away (φ/10, the golden step)
FAR=F**5,           // the deepest it can go: φ⁵ times its distance, about a tenth of its size
REST=.618,          // rebound off the edge of the field keeps 1/φ of the speed
TILT=23.44,         // it never turns over: the tilt is capped at Earth's axial tilt, 23.44°
HOME=2.2,HD=2*M.sqrt(2.2)*.8,          // the pull home: a soft, slightly underdamped spring
DRAG=140,DD=2*M.sqrt(140)*.6;           // the finger: a soft spring between pointer and star
const S={x:0,y:0,vx:0,vy:0,a:0,va:0,z:1,vz:0,zt:1,drag:!1,hold:!1,ht:0,minT:0,tx:0,ty:0},hist=[];
let box={x0:0,x1:0,y0:0,y1:0},home=[0,0],KS=1,STW=1,STH=1;

// the field: 79% of the screen, centred; the star's body stays inside it
function field(){const t=BIG.style.transform;BIG.style.transform='';const r=BIG.getBoundingClientRect();BIG.style.transform=t;
 const cx=r.left+r.width/2,cy=r.top+r.height/2,rad=r.width*.46,W=innerWidth,Hh=innerHeight;home=[cx,cy];KS=r.width/470;STW=r.width*446/470;STH=r.height*432/455;   // the star's own width and height in px
 box={x0:M.min(0,W*.105+rad-cx),x1:M.max(0,W*.895-rad-cx),y0:M.min(0,Hh*.105+rad-cy),y1:M.max(0,Hh*.895-rad-cy)}}
addEventListener('resize',field);

/* ---- 3D ground ----
   The scene pans the opposite way to the pointer: wider and quicker across (horizontal), shorter and slower
   up and down (vertical), in the ratio φ. It follows on a spring whose damping ratio is Ω_Λ = 0.685, the dark
   energy share of the universe (Planck 2018): just under critical, so it glides, overshoots a hair and settles. */
const SN=$('sn'),PN={x:0,y:0,vx:0,vy:0,tx:0,ty:0},ZL=.685,WX=2.6,WY=2.6/F;

/* ---- the sky over Milan ----
   The ground is the celestial sphere as seen from Milan (45.46° N, 9.19° E) at this very moment: the
   sky turns with the real sidereal time, one turn every 23 h 56 min. We face south, looking up 30°, set
   back from the centre by φ⁻¹ of the radius with a wide lens (focal φ⁻² of the screen), so the far
   wall bends round the star like a dome and sits well behind it.
   · Grid: the astronomers' own. 24 hour circles of right ascension (one every 15°: the page's 12
     columns on the half we face) and parallels of declination every 15°. They converge on the poles.
   · Stars: the 1,627 brightest (Hipparcos, to magnitude 5, in /sky.json) at their true places, sized
     and lit by magnitude (a soft halo round those brighter than 1.6), tinted by colour index. Those below Milan's horizon are dimmed.
   · Expansion: as the star recedes (Hubble), the sphere grows with ln of its distance and its light
     shifts to the red, the same redshift as the star's.
   The pointer moves the camera (±φ⁻⁴ of the radius) and turns it (±φ²°), against the pointer, on the
   same Ω_Λ spring as the scene: the near wall slides more than the far one, as in a real room.
   Everything is projected in JS onto one full-screen canvas: every frame while it moves, otherwise only
   when the sky has turned (every few seconds). Lines go in 5 depth bands, stars in 50 light buckets. */
const SP=$('sph'),SX=SP.getContext('2d'),D=M.PI/180,SCAM=1/F,SPAR=F**-4,SNEAR=.08,SB=5,
 LAT=45.4642*D,LON=9.19,ALT0=30*D,sL=M.sin(LAT),cL=M.cos(LAT),sA=M.sin(ALT0),cA=M.cos(ALT0),
 // star look by magnitude (≤1, ≤2, ≤3, ≤4, ≤5) and colour by B−V (blue-white … orange)
 SMA=[1,.9,.72,.52,.36],SCO=[[200,215,255],[235,240,255],[255,250,240],[255,232,205],[255,208,165]];
let spW=0,spH=0,spKey='',spLST=-9,SKY=[],SKG=[],SKS=null;
fetch('/sky.json').then(r=>r.json()).then(j=>{SKY=j.stars;spLST=-9}).catch(()=>{});
// equatorial (ra, dec) → camera frame [x right (west), y up, z forward (south, raised 30°)] + altitude sine
function eq2cam(ra,de,lst){const H=lst-ra,cd=M.cos(de),X=cd*M.cos(H),Y=cd*M.sin(H),Z=M.sin(de),
 s=X*sL-Z*cL,zen=X*cL+Z*sL;return[Y,-s*sA+zen*cA,s*cA+zen*sA,zen]}
function skyBuild(lst){
 const line=(N,f)=>{const L=new Float32Array((N+1)*3);for(let k=0;k<=N;k++){const[ra,de]=f(k/N),v=eq2cam(ra,de,lst);L[k*3]=v[0];L[k*3+1]=v[1];L[k*3+2]=v[2]}return L};
 SKG=[];
 for(let h=0;h<24;h++)SKG.push(line(72,t=>[h*15*D,(t*180-90)*D]));                  // hour circles
 for(let d=-75;d<=75;d+=15)SKG.push(line(144,t=>[t*2*M.PI,d*D]));                    // parallels
 const N=SKY.length/4;SKS=new Float32Array(N*5);
 for(let i=0;i<N;i++){const v=eq2cam(SKY[i*4]/10*D,SKY[i*4+1]/10*D,lst),m=SKY[i*4+2]/10,bv=SKY[i*4+3]/10;
  SKS[i*5]=v[0];SKS[i*5+1]=v[1];SKS[i*5+2]=v[2];SKS[i*5+4]=.62+M.max(0,3.3-m)*.55;   // radius: Sirius 3.2 px … faint .62
  SKS[i*5+3]=(v[3]<0?25:0)+M.min(4,M.max(0,bv<0?0:bv<.3?1:bv<.6?2:bv<1?3:4))*5+M.min(4,M.max(0,M.ceil(m)-1))}}   // light bucket
function spSize(){SP.width=spW=innerWidth;SP.height=spH=innerHeight;spKey=''}   // 1 px per CSS px: at this faintness retina can't tell
spSize();addEventListener('resize',spSize);
function sphere(dt){
 // local sidereal time in Milan (radians), from the Julian date
 const lst=((280.46061837+360.98564736629*(Date.now()/864e5+2440587.5-2451545)+LON)%360)*D;
 if(M.abs(lst-spLST)>2e-4){spLST=lst;skyBuild(lst);spKey=''}      // about every 3 s of real sky
 const RX=innerWidth*.05,ux=PN.x/RX,uy=PN.y/RX,camX=-ux*SPAR,camY=uy*SPAR,yaw=ux*F*F*D,pit=uy*F*F*D,
  R=1+M.log(M.max(1,S.z))/F/F,rk=1-1/M.max(1,S.z),                  // expansion and redshift, from the star's distance
  key=n(yaw*1e3)+'|'+n(pit*1e3)+'|'+n(camX*1e3)+'|'+n(camY*1e3)+'|'+n(R*1e3)+'|'+spLST;
 if(key===spKey)return;spKey=key;
 const cy=M.cos(yaw),sy=M.sin(yaw),cp=M.cos(pit),sp=M.sin(pit),f=M.max(spW,spH)*.382,ox=spW/2,oy=spH/2,zn=R-SCAM,zf=R+SCAM;
 let X=0,Y=0,Z=0;
 const P=(x,y,z)=>{const x1=x*cy+z*sy,z1=-x*sy+z*cy;Z=(y*sp+z1*cp)*R+SCAM;X=ox+f*(x1*R-camX)/Z;Y=oy-f*((y*cp-z1*sp)*R-camY)/Z},
  path=L=>{let px=0,py=0,pz=-1;for(let k=0;k<L.length;k+=3){P(L[k],L[k+1],L[k+2]);
   if(Z>SNEAR&&pz>SNEAR){const Q=B[M.min(SB-1,M.max(0,((Z+pz)/2-zn)/(zf-zn)*SB|0))];Q.moveTo(px,py);Q.lineTo(X,Y)}px=X;py=Y;pz=Z}},
  rs=c=>c.map((v,i)=>n(v+([255,96,80][i]-v)*rk*.7)|0).join(','),   // redshift: toward a deep red
  B=Array.from({length:SB},()=>new Path2D()),ST=Array.from({length:50},()=>new Path2D()),GL=new Path2D();
 for(const L of SKG)path(L);
 if(SKS)for(let i=0;i<SKS.length;i+=5){P(SKS[i],SKS[i+1],SKS[i+2]);
  if(Z<SNEAR||X<-4||Y<-4||X>spW+4||Y>spH+4)continue;
  const b=SKS[i+3],r=SKS[i+4],Q=ST[b];Q.moveTo(X+r,Y);Q.arc(X,Y,r,0,2*M.PI);
  if(r>1.9&&b<25){GL.moveTo(X+r*3.2,Y);GL.arc(X,Y,r*3.2,0,2*M.PI)}}                 // a soft halo round the brightest
 SX.clearRect(0,0,spW,spH);SX.lineWidth=1;const lc=rs([255,255,255]);
 for(let b=0;b<SB;b++){SX.strokeStyle=`rgba(${lc},${n((.13-b*.018)*1e3)/1e3})`;SX.stroke(B[b])}
 SX.fillStyle=`rgba(${rs([235,240,255])},.07)`;SX.fill(GL);
 for(let b=0;b<50;b++){SX.fillStyle=`rgba(${rs(SCO[(b%25)/5|0])},${n(SMA[b%5]*(b<25?1:.35)*1e3)/1e3})`;SX.fill(ST[b])}}
addEventListener('pointermove',e=>{const RX=innerWidth*.05,RY=RX/F;
 PN.tx=-(e.clientX/innerWidth*2-1)*RX;PN.ty=-(e.clientY/innerHeight*2-1)*RY});
document.addEventListener('pointerleave',()=>{PN.tx=PN.ty=0});
function pan(dt){
 PN.vx+=(WX*WX*(PN.tx-PN.x)-2*ZL*WX*PN.vx)*dt;PN.x+=PN.vx*dt;
 PN.vy+=(WY*WY*(PN.ty-PN.y)-2*ZL*WY*PN.vy)*dt;PN.y+=PN.vy*dt;
 const RX=innerWidth*.05,t=`translate3d(${n(PN.x)}px,${n(PN.y)}px,0) rotateY(${n(PN.x/RX*3)}deg) rotateX(${n(-PN.y/RX*F*2)}deg)`;
 if(W.get('pan')!==t){W.set('pan',t);SN.style.transform=t}}

let ptr=null,last=performance.now(),ct=0,cur='Rest',dur=1,el=0,lastC='';
function next(){if(cur!='Rest'){cur='Rest';dur=.618+M.random()*F}
 else{const o=NAMES.filter(n=>n!=next.prev);cur=next.prev=o[M.random()*o.length|0];dur=FX[cur].d}
 el=0;ticks()}

// hover magnet on both stars (they share one viewBox)
const br=document.querySelector('.tl');
ST.forEach(s=>{
 s.addEventListener('pointermove',e=>{const q=new DOMPoint(e.clientX,e.clientY).matrixTransform(s.getScreenCTM().inverse());ptr=[q.x,q.y]});
 s.addEventListener('pointerleave',()=>ptr=null)});
SMALL.onclick=()=>br.classList.toggle('open');

// press: the star starts to recede; move: it becomes a drag; release: throw (if moving) and come home
BIG.addEventListener('pointerdown',e=>{e.preventDefault();try{BIG.setPointerCapture(e.pointerId)}catch(_){}S.hold=!0;S.ht=0;S.minT=.236;S.sx=e.clientX;S.sy=e.clientY;
 S.gx=e.clientX-(home[0]+S.x);S.gy=e.clientY-(home[1]+S.y);S.tx=S.x;S.ty=S.y;hist.length=0;document.body.classList.add('grab')});
// moves and releases are heard on the whole window, not only on the star: as the star recedes it slips
// out from under the pointer, and some browsers (Safari) don't keep pointer capture on SVG.
addEventListener('pointermove',e=>{if(!S.hold&&!S.drag)return;if(e.buttons===0)return release();
 if(!S.drag&&M.hypot(e.clientX-S.sx,e.clientY-S.sy)>6){S.drag=!0;S.hold=!1}
 S.tx=e.clientX-home[0]-S.gx;S.ty=e.clientY-home[1]-S.gy;
 hist.push([performance.now(),e.clientX,e.clientY]);while(hist.length>1&&hist[0][0]<performance.now()-90)hist.shift()});
function release(){if(!S.hold&&!S.drag)return;document.body.classList.remove('grab');
 if(S.drag&&hist.length>1){const[a,b]=[hist[0],hist[hist.length-1]],t=M.max(.016,(b[0]-a[0])/1000);
  let vx=(b[1]-a[1])/t,vy=(b[2]-a[2])/t;const v=M.hypot(vx,vy),mx=3200;if(v>mx){vx*=mx/v;vy*=mx/v}
  S.vx=vx;S.vy=vy;S.va+=(S.gx*vy-S.gy*vx)/(S.gx*S.gx+S.gy*S.gy+3e4)*23}       // spin from where you held it
 S.drag=!1;S.hold=!1}
for(const ev of['pointerup','pointercancel','blur'])addEventListener(ev,release);
BIG.addEventListener('lostpointercapture',release);document.addEventListener('visibilitychange',release);

function step(st){
 // distance (z): held → recede by Hubble's law; released → glide back to 1
 if(S.hold)S.ht+=st;
 S.minT=M.max(0,S.minT-st);
 S.zt=S.hold||S.minT>0?M.min(FAR,POKE*M.exp(H*S.ht*F)):1;
 const wz=S.hold||S.minT>0?7:3.2;S.vz+=(wz*wz*(S.zt-S.z)-2*wz*.8*S.vz)*st;S.z+=S.vz*st;
 // position: the finger while dragging, otherwise free flight with Hubble friction and the pull home
 if(S.drag){S.vx+=(DRAG*(S.tx-S.x)-DD*S.vx)*st;S.vy+=(DRAG*(S.ty-S.y)-DD*S.vy)*st}
 else{S.vx+=(-HOME*S.x-HD*S.vx)*st;S.vy+=(-HOME*S.y-HD*S.vy)*st;
  S.va+=(-HOME*S.a-HD*S.va)*st}                 // and turns upright again
 const f=M.exp(-H*st);S.vx*=f;S.vy*=f;S.va*=f;
 S.x+=S.vx*st;S.y+=S.vy*st;S.a+=S.va*st;
 // the edge of the field: a clean rebound with 1/φ of the speed, and a little spin from the graze
 if(S.x<box.x0||S.x>box.x1){S.x=M.min(box.x1,M.max(box.x0,S.x));S.vx*=-REST;S.va+=S.vy*.08*(S.x>0?1:-1)}
 if(S.y<box.y0||S.y>box.y1){S.y=M.min(box.y1,M.max(box.y0,S.y));S.vy*=-REST;S.va-=S.vx*.08*(S.y>0?1:-1)}
 if(M.abs(S.a)>TILT){S.a=M.sign(S.a)*TILT;S.va*=-REST}                         // a soft stop at the tilt limit
 G.forEach((m,i)=>{let tx=0,ty=0,tr=0;
  if(ptr&&!S.drag){const vx=ptr[0]-C[i][0],vy=ptr[1]-C[i][1],d=M.hypot(vx,vy)||1,pl=14*M.exp(-d/170);tx=vx/d*pl;ty=vy/d*pl;tr=tx*.15}
  for(const[k,v,q]of[['x','vx',tx],['y','vy',ty],['r','vr',tr]]){m[v]+=(m.k*(q-m[k])-m.c*m[v])*st;m[k]+=m[v]*st}})}

// ring chart: outer ring (thick, star colours) = length of the current motion; inner ring = time through it
const ARC=$('arc'),LEN=$('len'),CYR=$('cy'),TXR=$('tx');let SH=0;
function ticks(){SH=M.min(.873,dur/(F**3+1/F));LEN.style.strokeDasharray=SH+' 1';LEN.classList.toggle('rest',cur=='Rest')}

const W=new Map(),set=(el,k,v)=>{const id=el.id+k+(el.dataset.i||'');if(W.get(id)!==v){W.set(id,v);el.setAttribute(k,v)}},
 n=v=>M.round(v*100)/100,E=['s0','s1','s2','lg','r0','r1','w0','w1'].map($);
U.forEach((L,j)=>L.forEach((e,i)=>e.dataset.i=j+'_'+i));
const BG=$('bg').getContext('2d');BG.scale(2,2);                 // 96 px canvas, drawn in the 48 px units below
/* the cosmic microwave background: the faint mottling of the oldest light, as mapped by Planck (where h and
   Ω_Λ come from). Smooth value noise in 4 octaves, made once, laid over the ground in soft-light. */
const CMB=document.createElement('canvas');CMB.width=CMB.height=96;
{const c=CMB.getContext('2d'),im=c.createImageData(96,96),A=[];let s=20141;const rnd=()=>(s=s*16807%2147483647)/2147483647;
 for(let o=0;o<4;o++){const g=4<<o,v=[];for(let i=0;i<(g+1)*(g+1);i++)v.push(rnd()*2-1);A.push([g,v])}
 for(let y=0;y<96;y++)for(let x=0;x<96;x++){let t=0,w=1;
  for(const[g,v]of A){const fx=x/96*g,fy=y/96*g,i=fx|0,j=fy|0,u=sm(fx-i),q=sm(fy-j),k=j*(g+1)+i;
   t+=w*((v[k]*(1-u)+v[k+1]*u)*(1-q)+(v[k+g+1]*(1-u)+v[k+g+2]*u)*q);w*=.55}
  const p=(y*96+x)*4;im.data[p]=im.data[p+1]=im.data[p+2]=128+M.max(-127,M.min(127,t*90));im.data[p+3]=255}
 c.putImageData(im,0,0)}
function draw(){
 const r=cur=='Rest'?{}:FX[cur].f(el);
 C.forEach(([x,y],i)=>{const m=G[i],t=`translate(${n(m.x)} ${n(m.y)}) rotate(${n(m.r)} ${x} ${y})`;U.forEach(L=>set(L[i],'transform',t))});
 // the whole mark moves as one rigid body: position, distance (uniform scale), rotation. Never bent.
 const z=S.z*(r.z||1),sc=TY.k/z,rot=S.a,px=S.x+(r.x||0)+TY.dx,py=S.y+(r.y||0),
  tb=`translate3d(${n(px)}px,${n(py)}px,0) scale(${n(sc*1e3)/1e3}) rotate(${n(rot)}deg)`,ts=`scale(${n(1/z*1e3)/1e3}) rotate(${n(rot)}deg)`;
 if(W.get('big')!==tb){W.set('big',tb);BIG.style.transform=tb;SMALL.style.transform=ts}   // the small star is entangled
 VIS.x=px;VIS.y=py;VIS.s=sc;VIS.r=rot;                                       // what the waves copy
 // typed text rides beside the star: cap height = star height, same scale, same drift (no tilt)
 // five equidistant guides span the star (top to bottom, every quarter of its height); the capitals take
 // the middle three — cap top on guide 2, baseline on guide 4 — so the star stands one guide above and one
 // below the text and the pair share an optical centre line (not the line box, which carries descenders).
 // Horizontally, the gap from the star's right tip to the first letter's ink is one guide interval.
 if(TY.s){const f=STH/2/TY.cap,x=home[0]+px+(225*KS+STH/4+TY.lb*f)*sc,y=home[1]+py+(-2.5*KS-(TY.bl*f-TY.cap*f/2))*sc,
  tt=`translate3d(${n(x)}px,${n(y)}px,0) scale(${n(sc*1e3)/1e3})`;
  if(W.get('ty')!==tt){W.set('ty',tt);TYE.style.transform=tt;TYE.style.fontSize=n(f)+'px'}}
 const da=n(M.min(1,el/dur)*SH*1e3)/1e3+' 1';if(W.get('arc')!==da){W.set('arc',da);ARC.style.strokeDasharray=da}
 // colours repaint the star, ring and ground: 30 steps a second is already seamless for an 11 s cycle
 const key=(ct*30|0)+'|'+n(S.z);if(key===lastC)return;lastC=key;
 // colour: one turn of the RYB wheel every φ⁵ s; the mark's own light is redshifted by its distance
 const p=3*ct/CY,w0=wheel(p),w1=wheel(p+.35),w2=wheel(p+.8),an=n(360*ct/CY),
  c0=rgb(red(w0,S.z)),c1=rgb(red(w1,S.z)),c2=rgb(red(w2,S.z));
 set(E[0],'stop-color',c0);set(E[1],'stop-color',c1);set(E[2],'stop-color',c2);
 set(E[3],'gradientTransform',`rotate(${an} 257 255)`);set(E[4],'stop-color',c0);set(E[5],'stop-color',c2);
 E[6].style.background=c0;E[7].style.background=c2;
 // colour rings: the full cycle closes once every φ⁵ s; the hand-over ring fills once per pair of primaries
 const pc=((ct/CY)%1),pt=(p%1);
 CYR.style.strokeDasharray=n(M.max(.001,pc)*1e3)/1e3+' 1';
 TXR.style.strokeDasharray=n(M.max(.001,pt)*1e3)/1e3+' 1';TXR.style.stroke=c1;
 // ground: the mark's gradient inverted, as deep shades of the same hues (never a complement)
 const A2=(315-an)*M.PI/180,dx=M.sin(A2)*34,dy=-M.cos(A2)*34,gr=BG.createLinearGradient(24-dx,24-dy,24+dx,24+dy);
 gr.addColorStop(0,rgb([.3,.11,w2[2]]));gr.addColorStop(1,rgb([.24,.09,w0[2]]));BG.fillStyle=gr;BG.fillRect(0,0,48,48);
 BG.globalCompositeOperation='soft-light';BG.globalAlpha=.3;BG.drawImage(CMB,0,0,48,48);BG.globalCompositeOperation='source-over';BG.globalAlpha=1}

$('yr').textContent=new Date().getFullYear();   // copyright year keeps itself current
// label + headline in many languages, read from i18n.json (lang, label, two headline lines).
// The label is "revamping" in that language plus its heave-ho; the headline plays on "back in shape".
// A random pair fades in every `interval` s, never the same twice in a row. If the file can't be
// loaded, the page simply stays in English.
const HB=$('hb'),LB=$('lb'),HLE=$('hl'),I18N=fetch('/i18n.json').then(r=>r.json()).catch(()=>({}));
I18N.then(({languages:L,interval:iv=F**3,fade:fd=.618})=>{
 if(!L||L.length<2)return;HB.style.setProperty('--fd',fd+'s');let hi=0;
 (function swap(){setTimeout(()=>{HB.classList.add('out');setTimeout(()=>{let j;do j=M.random()*L.length|0;while(j==hi);hi=j;
  const x=L[j];HB.lang=x.lang;LB.textContent=x.label;HLE.replaceChildren(x.headline[0],document.createElement('br'),x.headline[1]||'');
  HB.classList.remove('out');swap()},fd*1000)},iv*1000)})()});
field();ticks();
/* ---- type to the star ----
   Typing on the keyboard writes white letters beside the star, in the headline face, with capitals half
   as tall as the star and centred on it. The longer the line, the smaller star and text become together, so the pair always
   fits the 79% field; the line stays centred and follows the star wherever it goes.
   Backspace deletes, Escape clears. */
const TYE=$('ty'),TYC=document.createElement('canvas').getContext('2d'),TY={s:'',k:1,dx:0,tk:1,tdx:0,cap:.72};
const TYF='Archivo,"Helvetica Neue",Helvetica,Arial,sans-serif',TYL={zh:'"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",',
 ja:'"Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP","Yu Gothic",',ko:'"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",'};
function tyLayout(){
 TYC.font='500 100px '+TYF;                                                            // guides always come from Archivo's capitals
 const mH=TYC.measureText('H'),fa=mH.fontBoundingBoxAscent||92,fd=mH.fontBoundingBoxDescent||24;
 TY.cap=(mH.actualBoundingBoxAscent||72)/100;
 const cj=TYL[TYE.lang]?.82:1;if(cj<1)TYC.font='500 100px '+TYL[TYE.lang]+TYF;                             // width in the face actually shown
 TY.lb=TY.s?(TYC.measureText(TY.s[0]).actualBoundingBoxLeft||0)/100*cj:0;                // side bearing of the first letter                                          // cap height, per px of size
 TY.bl=(1-(fa+fd)/100)/2+fa/100;                                                       // baseline from the top of a line-height:1 box
 TYE.style.setProperty('--cap',TY.cap);
 const f=STH/2/TY.cap,tw=TY.s?(TYC.measureText(TY.s).width/100*cj+.18)*f:0,gap=TY.s?STH/4:0,full=STW+gap+tw;
 TY.tk=M.min(1,innerWidth*.79/full);TY.tdx=-(gap+tw)/2*TY.tk}
// characters typed with AltGr / Option (@ # [ ] € … on Italian and other layouts) arrive with Alt, or
// Ctrl+Alt on Windows: those are let through; only real shortcuts (Cmd, or Ctrl without Alt) are left alone.
const TYT=$('tyt');
function tyShow(s){TY.s=s;TYT.textContent=s;tyLayout();
 // caret: shown and restarted on every key, hidden when the line is empty or after φ² s without typing
 TYE.classList.remove('on');clearTimeout(TY.t);
 if(s){void TYE.offsetWidth;TYE.classList.add('on');TY.t=setTimeout(()=>TYE.classList.remove('on'),F*F*1000)}}
addEventListener('keydown',e=>{if(e.metaKey||(e.ctrlKey&&!e.altKey&&!e.getModifierState('AltGraph')))return;
 let s=HI.on?'':TY.s;                                   // the visitor's first key replaces the greeting
 if(e.key==='Escape')s='';else if(e.key==='Backspace')s=s.slice(0,-1);
 else if(e.key.length===1&&s.length<48)s+=e.key;else return;
 e.preventDefault();hiStop();tyShow(s)});
addEventListener('resize',()=>setTimeout(tyLayout));document.fonts&&document.fonts.ready.then(tyLayout);   // re-measure once Archivo has loaded

/* ---- greeting ----
   On arrival the star says hello in the browser's language, typed beside it like a visitor would:
   letters land every φ⁻⁴–φ⁻² s (0.146–0.382 s, a human rhythm), the word rests φ³ s, then backspaces away
   at φ⁻⁵ s a letter. The first languages in the browser's list are tried in order, by their base code
   (it-IT → it); none of the 11 → English. Any key takes the line over at once. Reduced motion: the
   word simply appears and leaves. Screen readers are spared the letter-by-letter typing. */
const HI={on:!1,t:0};
function hiStop(){if(!HI.on)return;HI.on=!1;clearTimeout(HI.t);TYE.lang='';TYT.setAttribute('aria-live','polite')}
function hiPick(L){for(const t of navigator.languages||[navigator.language]){
  const x=L.find(l=>l.lang===String(t||'').toLowerCase().split('-')[0]);if(x&&x.greeting)return x}
 return L.find(l=>l.lang==='en'&&l.greeting)||{lang:'en',greeting:'Hello!'}}
function greet({lang,greeting}){if(TY.s)return;              // the visitor is already typing: stay quiet
 const ch=[...greeting],k=ch.length,at=(f,s)=>HI.t=setTimeout(f,s*1000);
 HI.on=!0;TYE.lang=lang;TYT.removeAttribute('aria-live');
 const end=()=>{hiStop();tyShow('')};
 if(still.matches){tyShow(greeting);at(end,F**4);return}
 let i=0;
 (function type(){if(i<k){tyShow(ch.slice(0,++i).join(''));at(type,F**-4+M.random()*(F**-2-F**-4))}
  else at(function erase(){if(--i>0){tyShow(ch.slice(0,i).join(''));at(erase,F**-5)}else end()},F**3)})()}
Promise.all([I18N,document.fonts?document.fonts.ready:0]).then(([{languages:L=[]}])=>{
 const x=hiPick(L);setTimeout(()=>greet(x),F*1000)});    // after φ s, once the page has settled

/* ---- live favicon ----
   The Fazefactory F, painted with the star's own gradient as it moves round the RYB wheel (entangled:
   same colours, same moment). Redrawn 4 times a second, only when the colour changed.
   favicon.svg carries the same transition for browsers without the page. */
const FC=document.createElement('canvas'),FX2=FC.getContext('2d'),FAV=$('fav'),FF=new Path2D('M94.3,483.6V28c0-5.1,4.2-9.3,9.3-9.3h304.1c5.1,0,9.3,4.2,9.3,9.3v78.4c0,5.1-4.2,9.3-9.3,9.3H224.1 c-5.1,0-9.3,4.2-9.3,9.3v89.6c0,5.1,4.2,9.3,9.3,9.3h165.1c5.1,0,9.3,4.2,9.3,9.3v73.8c0,5.1-4.2,9.3-9.3,9.3H224.1 c-5.1,0-9.3,4.2-9.3,9.3v158.2c0,5.1-4.2,9.3-9.3,9.3H103.5C98.4,492.9,94.3,488.7,94.3,483.6z');
FC.width=FC.height=64;let favK='';
setInterval(()=>{const p=3*ct/CY,a=rgb(red(wheel(p),S.z)),c=rgb(red(wheel(p+.8),S.z)),k=a+c;if(k===favK)return;favK=k;
 FX2.clearRect(0,0,64,64);FX2.save();FX2.scale(64/476,64/476);FX2.translate(-18,-18);   // F bbox, centred in a 476 square
 const gr=FX2.createLinearGradient(94,0,418,0);gr.addColorStop(0,a);gr.addColorStop(1,c);FX2.fillStyle=gr;
 FX2.fill(FF);FX2.restore();FAV.type='image/png';FAV.href=FC.toDataURL('image/png')},250);

/* ---- waves ----
   Like a pulsar, the star sends out its own shape as a thin outline.
   · Always, even floating at rest: an echo every φ⁻³ s (0.236 s), so a soft stack of outlines follows
     even the tiniest drift of the orbit and the pulsar beats.
   · In motion (flight, bounce, recede, return, orbit): an echo whenever the star has moved, scaled or
     turned enough since the last one, at most 30 a second. Echoes barely widen and fade in φ s, so the
     trail traces the star's real path. While dragging, echoes are spaced wider (that already reads well).
   Every wave keeps the exact position, size and tilt the star had when it left. */
const TR=$('tr'),WV=[],NS='http://www.w3.org/2000/svg',VIS={x:0,y:0,s:1,r:0};
for(let i=0;i<16;i++){const g=document.createElementNS(NS,'g');
 for(let j=0;j<6;j++){const u=document.createElementNS(NS,'use');u.setAttribute('href','#p'+j);g.appendChild(u)}
 TR.appendChild(g);WV.push({g,t:-1})}
let wk=0,wg=0,wl={x:0,y:0,s:1,r:0};
function emit(kind){const w=WV.reduce((a,b)=>b.t<0?b:a.t<0?a:b.t>a.t?b:a);
 Object.assign(w,{t:0,x:home[0]+VIS.x,y:home[1]+VIS.y,s:KS*VIS.s,r:VIS.r,
  life:F,grow:kind==2?.146:.09,op:kind==2?.3:.36});wl={...VIS}}
function waves(dt){
 wk+=dt;wg+=dt;
 const moved=M.hypot(VIS.x-wl.x,VIS.y-wl.y)+M.abs(VIS.s-wl.s)*KS*260+M.abs(VIS.r-wl.r)*1.6;
 if(moved>(S.drag?110:26)&&wg>1/30){emit(1);wk=0;wg=0}
 else if(wk>.236&&!S.drag){emit(2);wk=0;wg=0}
 for(const w of WV){if(w.t<0)continue;w.t+=dt/w.life;
  if(w.t>=1){w.t=-1;w.g.style.opacity=0;continue}
  const e=1-(1-w.t)**3;                                  // eases out: fast at first, then drifting
  w.g.setAttribute('transform',`translate(${n(w.x)} ${n(w.y)}) scale(${n(w.s*(1+w.grow*e)*1e3)/1e3}) rotate(${n(w.r)}) translate(-255 -257.5)`);
  w.g.style.opacity=n(w.op*(1-w.t)**1.5*1e3)/1e3}}

const still=matchMedia('(prefers-reduced-motion: reduce)');
(function loop(now){
 const dt=M.min(.1,(now-last)/1000);last=now;
 if(!still.matches){ct+=dt;el+=dt;if(el>=dur)next()}
 for(let h=dt;h>1e-6;h-=1/120)step(M.min(h,1/120));     // physics in fixed 1/120 s steps: smooth, stable, half the work
 if(!still.matches)waves(dt);
 {const q=1-M.exp(-dt*6.47);TY.k+=(TY.tk-TY.k)*q;TY.dx+=(TY.tdx-TY.dx)*q;}     // star and text glide to their new size
 if(!still.matches)pan(dt);
 sphere(dt);draw();requestAnimationFrame(loop)})(last);
})();
