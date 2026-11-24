import {MAP_APPEARANCE} from './appearance.js';

// Native point previews: three little-endian floats and a true node depth (or 255 = unknown).
export function decode(buffer,n,mode){
  if(!Number.isSafeInteger(n)||n<1||buffer.byteLength!==n*13)throw Error('Incomplete point preview.');
  const v=new DataView(buffer), xyz=new Float32Array(n*3), level=new Uint8Array(n);
  for(let i=0;i<n;i++){
    const off=i*13;
    for(let j=0;j<3;j++){
      const value=v.getFloat32(off+j*4,true); if(!Number.isFinite(value))throw Error('Non-finite coordinate.');
      xyz[3*i+j]=value;
    }
    level[i]=v.getUint8(off+12);
    if(mode==='depth'?level[i]>2:mode==='multiplicity'?![1,5].includes(level[i]):mode!=='height'||level[i]!==255)throw Error('Unexpected point label.');
  }
  return {xyz,level};
}
export function fitBox(b){
  const center=b[0].map((v,i)=>(v+b[1][i])/2);
  return {center,radius:Math.max(0.1,Math.hypot(...b[1].map((v,i)=>v-center[i])))};
}
export function projectedFit(xyz,center,radius,yaw,pitch){
  const a=Math.cos(yaw), b=Math.sin(yaw), c=Math.cos(pitch), d=Math.sin(pitch);
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(let i=0;i<xyz.length;i+=3){
    const x=xyz[i]-center[0],y=xyz[i+1]-center[1],z=xyz[i+2]-center[2];
    const sx=a*x+b*y,sy=c*z-d*(-b*x+a*y);
    if(sx<minX)minX=sx;if(sx>maxX)maxX=sx;if(sy<minY)minY=sy;if(sy>maxY)maxY=sy;
  }
  const mx=(minX+maxX)/2,my=(minY+maxY)/2;
  return {center:[center[0]+mx*a+my*d*b,center[1]+mx*b-my*d*a,center[2]+my*c],
    ex:(maxX-minX)/(2*radius),ey:(maxY-minY)/(2*radius)};
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
function styleForDrawing({colors,background,pointSize}){
  const unit=hex=>rgb(hex).map(v=>v/255);
  return {colors:[...colors],background,pointSize,glColors:colors.map(unit),glBackground:unit(background)};
}
function shader(gl,type,src){
  const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);
  if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;
}
function setupGL(canvas){
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:false});
  if(!gl)return null;
  const vs=shader(gl,gl.VERTEX_SHADER,`
    precision highp float;attribute vec3 pos;attribute float cls;
    uniform vec3 center;uniform vec4 angles;uniform vec2 scale;uniform vec2 shift;
    uniform float radius;uniform float size;uniform float colorMode;uniform vec2 zRange;uniform vec3 visibility;
    uniform vec3 coarse;uniform vec3 mid;uniform vec3 fine;
    varying vec3 pointColor;
    void main(){
      vec3 p=(pos-center)/radius;float a=angles.x,b=angles.y,c=angles.z,d=angles.w;
      float right=a*p.x+b*p.y, forward=-b*p.x+a*p.y;
      float up=c*p.z-d*forward, toward=c*forward+d*p.z;
      gl_Position=vec4(vec2(right,up)*scale+shift,-toward*.48,1.0);
      float enabled=1.;
      if(colorMode<.5){
        pointColor=cls<.5?coarse:(cls<1.5?mid:fine);enabled=cls<.5?visibility.x:(cls<1.5?visibility.y:visibility.z);
      }else if(colorMode>1.5){
        pointColor=cls<2.?coarse:fine;enabled=cls<2.?visibility.x:visibility.z;
      }else{
        float t=clamp((pos.z-zRange.x)/max(zRange.y-zRange.x,.001),0.,1.);
        pointColor=mix(vec3(.24,.59,.72),vec3(.97,.84,.42),t);
      }
      gl_PointSize=size;if(enabled<.5)gl_Position=vec4(3.,3.,3.,1.);
    }`);
  const fs=shader(gl,gl.FRAGMENT_SHADER,`
    precision mediump float;varying vec3 pointColor;
    void main(){if(distance(gl_PointCoord,vec2(.5))>.52)discard;gl_FragColor=vec4(pointColor,1.0);}`);
  const prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);gl.enable(gl.DEPTH_TEST);
  const u=Object.fromEntries(['center','angles','scale','shift','radius','size','colorMode','zRange','visibility','coarse','mid','fine'].map(n=>[n,gl.getUniformLocation(prog,n)]));
  const attrs=[['pos',3,gl.FLOAT],['cls',1,gl.UNSIGNED_BYTE]].map(([name,n,t])=>{
    const b=gl.createBuffer();const idx=gl.getAttribLocation(prog,name);
    gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(idx);gl.vertexAttribPointer(idx,n,t,false,0,0);return b;
  });
  return {upload(data){[data.xyz,data.level].forEach((arr,i)=>{gl.bindBuffer(gl.ARRAY_BUFFER,attrs[i]);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);});},
    render(s,w,h,dpr){
      const {glBackground,glColors,pointSize}=s.appearance;
      gl.viewport(0,0,w,h);gl.clearColor(...glBackground,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);if(!s.data)return;
      gl.uniform3fv(u.center,s.center);gl.uniform4f(u.angles,Math.cos(s.yaw),Math.sin(s.yaw),Math.cos(s.pitch),Math.sin(s.pitch));
      gl.uniform2f(u.scale,s.scaleX,s.scaleY);gl.uniform2f(u.shift,s.panX,s.panY);
      gl.uniform1f(u.radius,s.radius);gl.uniform2f(u.zRange,s.bounds[0][2],s.bounds[1][2]);
      gl.uniform1f(u.size,pointSize*dpr);
      gl.uniform3fv(u.coarse,glColors[0]);gl.uniform3fv(u.mid,glColors[1]);gl.uniform3fv(u.fine,glColors[2]);
      gl.uniform1f(u.colorMode,s.mode==='depth'?0:(s.mode==='multiplicity'?2:1));gl.uniform3fv(u.visibility,s.visibility.map(Number));
      gl.drawArrays(gl.POINTS,0,s.data.level.length);
    }};
}
function softRenderer(canvas){
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw Error('This browser has no drawing canvas.');
  return {upload(){},render(s,w,h,dpr){
    const {colors,background,pointSize}=s.appearance;
    ctx.fillStyle=background;ctx.fillRect(0,0,w,h);if(!s.data)return;
    const {xyz,level}=s.data,[cx,cy,cz]=s.center;
    const cyaw=Math.cos(s.yaw),syaw=Math.sin(s.yaw),cp=Math.cos(s.pitch),sp=Math.sin(s.pitch);
    const sx=.5*w*s.scaleX/s.radius,sy=.5*h*s.scaleY/s.radius;
    const heightColors=Array.from({length:48},(_,i)=>{const t=i/47;return 'rgb('+[61+186*t,150+64*t,184-77*t].map(Math.round).join(',')+')';});
    const z0=s.bounds[0][2],zr=Math.max(.001,s.bounds[1][2]-z0);
    const size=pointSize*dpr,half=size/2;
    for(let i=0;i<level.length;i++){
      const k=s.mode==='multiplicity'?(level[i]===1?0:2):level[i];if(s.mode!=='height'&&!s.visibility[k])continue;
      const j=3*i, x=xyz[j]-cx,y=xyz[j+1]-cy,z=xyz[j+2]-cz;
      const rx=cyaw*x+syaw*y,fy=-syaw*x+cyaw*y;
      const px=(1+s.panX)*w*.5+rx*sx,py=(1-s.panY)*h*.5-(cp*z-sp*fy)*sy;
      if(px < -half||px>w+half||py < -half||py>h+half)continue;
      ctx.fillStyle=s.mode!=='height'?colors[k]:heightColors[clamp(Math.round(47*(xyz[j+2]-z0)/zr),0,47)];
      ctx.fillRect(Math.round(px-half),Math.round(py-half),size,size);
    }
  }};
}

export class CloudView{
  constructor(canvas,onChange=()=>{}){
    this.canvas=canvas;this.change=onChange;this.data=null;this.radius=1;this.center=[0,0,0];this.bounds=[[0,0,0],[1,1,1]];
    this.mode='depth';this.visibility=[true,true,true];this.active=new Map();this.pending=false;
    this.appearance=styleForDrawing(MAP_APPEARANCE);
    let gl=null;try{gl=setupGL(canvas);}catch(e){console.warn('3D acceleration unavailable',e);}
    if(!gl && canvas.getContext('2d')===null){const replacement=canvas.cloneNode();canvas.replaceWith(replacement);canvas=replacement;this.canvas=canvas;}
    this.renderer=gl||softRenderer(canvas);this.reset();
    this.ro=new ResizeObserver(()=>this.schedule());this.ro.observe(canvas);
    const pos=e=>[e.clientX,e.clientY];
    canvas.addEventListener('pointerdown',e=>{if(e.button>1)return;canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);this.active.set(e.pointerId,pos(e));});
    canvas.addEventListener('pointermove',e=>{
      if(!this.active.has(e.pointerId))return;
      const old=this.active.get(e.pointerId),nw=pos(e),dx=nw[0]-old[0],dy=nw[1]-old[1];
      if(this.active.size===2){
        const peer=[...this.active].find(([id])=>id!==e.pointerId)[1];
        const before=Math.hypot(old[0]-peer[0],old[1]-peer[1]),after=Math.hypot(nw[0]-peer[0],nw[1]-peer[1]);
        if(before>2&&after>2)this.zoom=clamp(this.zoom*after/before,.2,40);
        this.panX+=dx/canvas.clientWidth;this.panY-=dy/canvas.clientHeight;
      }else if(e.shiftKey||e.buttons===4){this.panX+=2*dx/canvas.clientWidth;this.panY-=2*dy/canvas.clientHeight;}
      else {this.yaw-=dx*.009;this.pitch=clamp(this.pitch+dy*.008,-1.55,Math.PI/2);}
      this.active.set(e.pointerId,nw);this.schedule();
    });
    for(const evt of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(evt,e=>this.active.delete(e.pointerId));
    canvas.addEventListener('wheel',e=>{e.preventDefault();this.magnify(Math.exp(-clamp(e.deltaY,-180,180)*.0035));},{passive:false});
    canvas.addEventListener('keydown',e=>{
      const f={ArrowLeft:()=>this.yaw+=.16,ArrowRight:()=>this.yaw-=.16,ArrowUp:()=>this.pitch=clamp(this.pitch+.13,-1.55,Math.PI/2),
        ArrowDown:()=>this.pitch=clamp(this.pitch-.13,-1.55,Math.PI/2),'+':()=>this.magnify(1.25),'=':()=>this.magnify(1.25),'-':()=>this.magnify(.8),r:()=>this.reset(),Home:()=>this.reset()};
      if(f[e.key]){e.preventDefault();f[e.key]();this.schedule();}
    });
  }
  clear(){this.data=null;this.schedule();}
  set(data,scene){const f=fitBox(scene.bounds);this.data=data;this.center=f.center;this.radius=f.radius;this.bounds=scene.bounds;this.mode=scene.color;this.visibility=[true,true,true];this.renderer.upload(data);this.reset();}
  reset(top=false){this.yaw=top?0:-.56;this.pitch=top?Math.PI/2:.67;this.panX=0;this.panY=0;this.zoom=1;
    if(this.data){const {center,radius}=fitBox(this.bounds);const f=projectedFit(this.data.xyz,center,radius,this.yaw,this.pitch);
      this.center=f.center;this.extentX=f.ex;this.extentY=f.ey;
    }else{this.extentX=1;this.extentY=1;}
    this.schedule();}
  magnify(f){this.zoom=clamp(this.zoom*f,.2,40);this.schedule();}
  schedule(){if(this.pending)return;this.pending=true;requestAnimationFrame(()=>{this.pending=false;this.render();});}
  render(){
    const canvas=this.canvas,w0=canvas.clientWidth,h0=canvas.clientHeight;if(!w0||!h0)return;
    const d=Math.min(window.devicePixelRatio||1,2),w=Math.round(w0*d),h=Math.round(h0*d);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    // Fit actual visible points at the preset orientation, not empty AABB corners.
    const aspect=w/h,base=.90/Math.max(.02,this.extentX/aspect,this.extentY);
    this.scaleY=base*this.zoom;this.scaleX=this.scaleY/aspect;
    this.renderer.render(this,w,h,d);this.change(this);
  }
}
