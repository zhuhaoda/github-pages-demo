/* Optional enhancement of the static paper, using only package-relative assets. */
(() => {
  const root=document.documentElement, zh=root.lang.startsWith('zh'), theme=document.querySelector('[data-theme-toggle]');
  const scheme=window.matchMedia('(prefers-color-scheme: dark)');
  let saved=null;try {saved=localStorage.getItem('fast-livo-rs:theme');} catch {}
  function apply(value){
    root.dataset.theme=value;
    theme?.setAttribute('aria-pressed',String(value==='dark'));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',value==='dark'?'#0d1015':'#f5f5f7');
  }
  apply(saved==='dark'||saved==='light'?saved:(scheme.matches?'dark':'light'));
  theme?.addEventListener('click',()=>{
    saved=root.dataset.theme==='dark'?'light':'dark';apply(saved);
    try {localStorage.setItem('fast-livo-rs:theme',saved);} catch {}
  });
  scheme.addEventListener?.('change',()=>{if(!saved)apply(scheme.matches?'dark':'light');});
  const language=document.querySelector('[data-lang-link]');
  language?.addEventListener('click',()=>{language.search=location.search;language.hash=location.hash;});
  const fig=document.getElementById('map-comparison'), map=fig.querySelector('[data-compare]');
  const choices=[...fig.querySelectorAll('[data-scene-select]')];
  const catalogue=new Map(choices.map(b=>[b.dataset.sceneSelect,b]));
  const statusMap=document.getElementById('map-status');
  let ticket=0;
  function prepareImage(key,method,button) {
    const path='assets/maps/'+key+'-'+method, d=button.dataset, im=new Image();
    im.dataset.method=method;im.width=Number(d.width);im.height=Number(d.height);im.decoding='async';im.draggable=false;
    im.alt=(method==='rs'?'FAST-LIVO-RS':'FAST-LIVO2')+' — '+d.alternative;
    im.sizes='(min-width: 1200px) 1110px, 94vw';im.srcset=path+'-640.webp 640w, '+path+'-1120.webp 1120w';im.src=path+'-1120.webp';
    return im.decode().then(()=>im);
  }
  function sceneURL(key,goToMaps=false){
    const u=new URL(location.href);
    if(key==='jt-o3')u.searchParams.delete('scene');else u.searchParams.set('scene',key);
    if(goToMaps)u.hash='maps';
    if(u.href!==location.href)history.replaceState(null,'',u);
  }
  async function selectScene(key,updateURL=true) {
    const turn=++ticket, button=catalogue.get(key);
    if(!button)return;
    if(fig.dataset.scene===key){fig.removeAttribute('aria-busy');statusMap.textContent='';if(updateURL)sceneURL(key,true);return;}
    fig.setAttribute('aria-busy','true');
    try {
      const [rs,fast]=await Promise.all(['rs','fast'].map(m=>prepareImage(key,m,button)));
      if(turn!==ticket)return;
      const d=button.dataset;
      // One commit: old pair remains in place until both same-camera images decode.
      for(const [method,im] of [['rs',rs],['fast',fast]]){
        fig.querySelector('img[data-method="'+method+'"]').replaceWith(im);
        fig.querySelector('a[data-original="'+method+'"]').href='assets/maps/'+key+'-'+method+'.png';
      }
      fig.dataset.scene=key;map.style.aspectRatio=d.width+' / '+d.visibleHeight;
      map.querySelector('input').setAttribute('aria-label',key.toUpperCase()+(zh?' 图片分界':' comparison divider'));
      for(const b of choices)b.setAttribute('aria-pressed',String(b===button));
      fig.removeAttribute('aria-busy');statusMap.textContent=key.toUpperCase();
      if(updateURL)sceneURL(key,true);
    }catch{
      if(turn!==ticket)return;fig.removeAttribute('aria-busy');
      statusMap.textContent=zh?'序列未能载入，保留上一组。':'Sequence unavailable; the previous pair is still displayed.';
      sceneURL(fig.dataset.scene,location.hash==='#maps');
    }
  }
  for(const b of choices)b.addEventListener('click',()=>selectScene(b.dataset.sceneSelect));
  function readRoute(){
    const u=new URL(location.href),old=u.hash.slice(1),legacy=catalogue.has(old);
    const key=legacy?old:u.searchParams.get('scene');
    if(legacy){sceneURL(key,true);requestAnimationFrame(()=>document.getElementById('maps').scrollIntoView());}
    if(old==='overview'||old==='reconstruction'){
      const id=old==='overview'?'abstract':'results';u.hash=id;history.replaceState(null,'',u);
      requestAnimationFrame(()=>document.getElementById(id).scrollIntoView());
    }
    if(catalogue.has(key))selectScene(key,false);else if(key!==null){sceneURL('jt-o3');selectScene('jt-o3',false);}
  }
  readRoute();window.addEventListener('popstate',readRoute);
  // Both frames keep their native geometry. Only the clipping edge of the RS layer moves.
  for(const box of document.querySelectorAll('[data-compare]')){
    const range=box.querySelector('[data-compare-range]');
    if(!range)continue;
    const draw=()=>{
      const p=range.valueAsNumber;
      box.style.setProperty('--split',p+'%');
      range.setAttribute('aria-valuetext',zh?`左图 FAST-LIVO-RS ${p}%，右图 FAST-LIVO2 ${100-p}%`:`FAST-LIVO-RS ${p}% on the left, FAST-LIVO2 ${100-p}% on the right`);
    };
    const point=x=>{
      const b=box.getBoundingClientRect();
      if(b.width){range.value=String(Math.round(100*Math.max(0,Math.min(1,(x-b.left)/b.width))));draw();}
    };
    let pointer=null,originX=0,originY=0,touchDrag=false;
    range.addEventListener('input',draw); // Native arrow keys, Home/End, AT actions.
    // A native range changes its value on touchstart on some mobile browsers,
    // even for vertical scrolling. The viewport owns gestures; the range owns keyboard/AT.
    box.addEventListener('pointerdown',e=>{
      if(!e.isPrimary||e.button!==0||pointer!==null)return;
      if(e.pointerType!=='touch'){e.preventDefault();range.focus({preventScroll:true});}
      pointer=e.pointerId;originX=e.clientX;originY=e.clientY;touchDrag=false;
      box.setPointerCapture(pointer);
      if(e.pointerType!=='touch')point(e.clientX);
    });
    box.addEventListener('pointermove',e=>{
      if(e.pointerId!==pointer)return;
      if(e.pointerType==='touch'&&!touchDrag){
        const dx=Math.abs(e.clientX-originX),dy=Math.abs(e.clientY-originY);
        if(dx<3||dx<dy)return;
        touchDrag=true;
      }
      point(e.clientX);
    });
    box.addEventListener('pointerup',e=>{
      if(e.pointerId!==pointer)return;
      if(e.pointerType!=='touch'||touchDrag||Math.abs(e.clientY-originY)<5)point(e.clientX);
      pointer=null;
      if(box.hasPointerCapture(e.pointerId))box.releasePointerCapture(e.pointerId);
    });
    for(const kind of ['pointercancel','lostpointercapture'])box.addEventListener(kind,e=>{if(e.pointerId===pointer)pointer=null;});
    draw();range.hidden=false;box.dataset.ready='';
  }
  const video=document.getElementById('paper-video'),play=document.getElementById('film-play'),filmStatus=document.getElementById('film-status');
  if(video&&play){
    const filmURL=video.querySelector('source').src;
    let pending=false, blobURL=null;
    play.hidden=false;
    play.addEventListener('click',async()=>{
      if(pending)return;pending=true;play.disabled=true;
      try{
        if(!video.hasAttribute('src')){
          filmStatus.textContent=zh?'正在打开视频…':'Opening film…';
          if(location.protocol==='http:'||location.protocol==='https:'){
            // Keep streaming on Range-capable hosting. The local workbench returns
            // the whole MP4 for ranges, so reuse that response as a seekable blob.
            const probe=await fetch(filmURL,{headers:{Range:'bytes=0-0'}});
            if(probe.status===206){await probe.body?.cancel();video.src=filmURL;}
            else if(probe.ok){blobURL=URL.createObjectURL(await probe.blob());video.src=blobURL;}
            else throw Error('HTTP '+probe.status);
          }else video.src=filmURL;
        }
        await video.play();play.hidden=true;filmStatus.textContent='';
      }catch{
        // Direct native controls remain available if a browser disallows deferred play.
        if (!video.hasAttribute('src')) video.src=filmURL;
        play.hidden=true;filmStatus.textContent=zh?'请使用播放器的播放按钮。':'Use the player controls to start the film.';
      }finally{pending=false;play.disabled=false;}
    });
    video.addEventListener('playing',()=>{play.hidden=true;filmStatus.textContent='';});
    window.addEventListener('pagehide',e=>{if(blobURL&&!e.persisted)URL.revokeObjectURL(blobURL);});
  }
  const button=document.querySelector('[data-copy-cite]'), code=document.getElementById('bibtex'), status=document.getElementById('copy-status');
  if(!button||!code)return;
  button.hidden=false;let timer;
  button.addEventListener('click',async()=>{
    let copied=false;
    try {await navigator.clipboard.writeText(code.textContent);copied=true;} catch {
      const sel=window.getSelection(),range=document.createRange();
      range.selectNodeContents(code);sel.removeAllRanges();sel.addRange(range);
      try {copied=document.execCommand('copy');} catch {}
      if(!copied)code.parentElement.focus({preventScroll:true});
    }
    const msg=copied?(zh?'已复制':'Copied'):(zh?'已选中，请复制':'Selected — copy manually');
    button.querySelector('span').textContent=msg;status.textContent=msg;
    clearTimeout(timer);timer=setTimeout(()=>{button.querySelector('span').textContent=zh?'复制':'Copy';status.textContent='';},2400);
  });
})();
