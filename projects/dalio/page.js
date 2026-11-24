import {CloudView,decode} from './cloud.js';
import {MAP_APPEARANCE} from './appearance.js';

const $=id=>document.getElementById(id);
// Honor old bookmarks without starting the retired playback or waiting for a map.
if(location.hash==='#point-batches')location.replace('#accuracy');
const film=$('project-film'),play=$('film-play');
play.hidden=false;
play.addEventListener('click',async()=>{try{await film.play();}catch{film.controls=true;play.hidden=true;film.focus();}});
film.addEventListener('play',()=>{play.hidden=true;});
film.addEventListener('pause',()=>{play.hidden=false;});

const picker=$('scene'),status=$('load-state'),layers=[...document.querySelectorAll('[data-level]')];
const explorer=$('explorer');
const zh=document.documentElement.lang.toLowerCase().startsWith('zh');
const messages=zh?{
  noCanvas:'当前浏览器无法显示三维地图。',
  loading:'正在加载点云…',
  failed:'地图加载失败，请刷新页面重试。',
  noCatalog:'无法加载地图目录，请刷新页面重试。',
  noLayers:'所有图层均已隐藏。请选择下方的图层以显示点云。'
}:{
  noCanvas:'The 3D view is unavailable in this browser.',
  loading:'Loading point set…',
  failed:'This map could not be loaded. Please reload the page.',
  noCatalog:'The maps could not be opened. Please reload the page.',
  noLayers:'All layers are hidden. Select a layer below.'
};
explorer.style.setProperty('--map-background',MAP_APPEARANCE.background);
MAP_APPEARANCE.colors.forEach((color,i)=>explorer.style.setProperty('--level-'+i,color));
let viewer=null,scenes=[],pending=null;
function inform(message){status.textContent=message;status.hidden=!message;}
function onCamera(v){
  const top=Math.abs(v.pitch-Math.PI/2)<.001;
  $('overhead').setAttribute('aria-pressed',String(top));$('oblique').setAttribute('aria-pressed',String(!top));
}
function address(id,anchor=''){
  const url=new URL(location.href);url.searchParams.set('scene',id);
  if(anchor)url.hash=anchor;
  history.replaceState(null,'',url);
  window.dispatchEvent(new Event('dalio:routechange'));
}
function layerControls(s,ready){
  layers.forEach((box,i)=>{
    const size=s.edges[i];box.checked=true;box.disabled=!ready||!s.depthCounts[i];
    box.parentElement.hidden=size==null;
    if(size!=null)box.parentElement.querySelector('.edge').textContent=size+' m';
  });
}
async function load(id){
  const s=scenes.find(item=>item.id===id);if(!s)return;
  pending?.abort();const request=new AbortController();pending=request;
  picker.value=id;viewer?.clear();layerControls(s,false);
  if(!viewer){inform(messages.noCanvas);return;}
  inform(messages.loading);
  try{
    if(!/^maps\/[A-Za-z0-9_-]+\/preview\.bin$/.test(s.preview))throw Error('Invalid local preview.');
    const r=await fetch(s.preview,{signal:request.signal});if(!r.ok)throw Error('Could not load points.');
    const data=decode(await r.arrayBuffer(),s.shown,'depth');
    if(pending!==request)return;
    viewer.set(data,s);layerControls(s,true);inform('');
  }catch(error){
    if(error.name!=='AbortError'&&pending===request)inform(messages.failed);
  }
}
async function init(){
  try{viewer=new CloudView($('cloud'),onCamera);}catch(error){console.warn('Map canvas unavailable',error);}
  try{
    const r=await fetch('data/maps.json',{cache:'no-cache'});if(!r.ok)throw Error('catalog');
    const catalog=await r.json();scenes=catalog.scenes;
    if(!scenes.length)throw Error('empty');
    picker.replaceChildren(...scenes.map(s=>new Option(s.name,s.id)));picker.disabled=false;
    const requested=new URL(location.href).searchParams.get('scene');
    const selected=scenes.find(s=>s.id===requested)||scenes.find(s=>s.id===catalog.default)||scenes[0];
    if(requested!==null&&requested!==selected.id)address(selected.id);
    await load(selected.id);
  }catch{inform(messages.noCatalog);}
}
picker.addEventListener('change',()=>{address(picker.value,'maps');load(picker.value);});
for(const box of layers)box.addEventListener('change',()=>{
  if(!viewer)return;viewer.visibility[Number(box.dataset.level)]=box.checked;viewer.schedule();
  inform(layers.some(b=>b.checked&&!b.disabled&&!b.parentElement.hidden)?'':messages.noLayers);
});
$('zoom-in').onclick=()=>viewer?.magnify(1.3);$('zoom-out').onclick=()=>viewer?.magnify(1/1.3);
$('reset').onclick=()=>viewer?.reset();$('oblique').onclick=()=>viewer?.reset();$('overhead').onclick=()=>viewer?.reset(true);
init();
