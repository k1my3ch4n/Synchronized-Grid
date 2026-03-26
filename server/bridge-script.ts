export const BRIDGE_SCRIPT = `<script data-proxy-bridge>
(function(){
  // Patch history API — proxied pages run on localhost but try to push original-origin URLs
  var origPushState = history.pushState;
  var origReplaceState = history.replaceState;
  function patchUrl(url){
    if(!url) return url;
    try {
      var u = new URL(url, location.href);
      if(u.origin !== location.origin){
        return u.pathname + u.search + u.hash;
      }
    } catch(e){}
    return url;
  }
  history.pushState = function(state, title, url){
    return origPushState.call(this, state, title, patchUrl(url));
  };
  history.replaceState = function(state, title, url){
    return origReplaceState.call(this, state, title, patchUrl(url));
  };

  // Patch fetch & XHR to route relative requests through proxy
  var BASE_URL = document.querySelector('meta[name="proxy-base-url"]');
  var proxyBase = BASE_URL ? BASE_URL.getAttribute('content') : '';

  if(proxyBase){
    var origFetch = window.fetch;
    window.fetch = function(input, init){
      if(typeof input === 'string' && input.startsWith('/') && !input.startsWith('/api/proxy')){
        input = '/api/proxy?url=' + encodeURIComponent(proxyBase + input);
      }
      return origFetch.call(this, input, init);
    };

    var origXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url){
      if(typeof url === 'string' && url.startsWith('/') && !url.startsWith('/api/proxy')){
        url = '/api/proxy?url=' + encodeURIComponent(proxyBase + url);
      }
      return origXhrOpen.apply(this, arguments);
    };

    // Patch dynamic script/link insertion
    var origCreateElement = document.createElement;
    document.createElement = function(tag){
      var el = origCreateElement.call(this, tag);
      if(tag.toLowerCase() === 'script' || tag.toLowerCase() === 'link'){
        var origSetAttr = el.setAttribute.bind(el);
        el.setAttribute = function(name, value){
          if((name === 'src' || name === 'href') && typeof value === 'string' && value.startsWith('/') && !value.startsWith('/api/proxy')){
            value = '/api/proxy?url=' + encodeURIComponent(proxyBase + value);
          }
          return origSetAttr(name, value);
        };
      }
      return el;
    };
  }

  var frameId = null;
  var programmatic = false;
  var lastScrollY = -1;

  window.addEventListener('message',function(e){
    var d = e.data;
    if(!d) return;
    if(d.type==='proxy:init'){
      frameId = d.frameId;
    }
    if(d.type==='proxy:scrollTo'){
      var max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if(max <= 0) return;
      programmatic = true;
      window.scrollTo({top:d.ratio * max,behavior:'instant'});
      requestAnimationFrame(function(){ programmatic = false; });
    }
  });

  function onScroll(){
    if(programmatic) return;
    if(window.scrollY !== lastScrollY){
      lastScrollY = window.scrollY;
      window.parent.postMessage({
        type:'proxy:scroll',
        frameId:frameId,
        scrollX:window.scrollX,
        scrollY:window.scrollY,
        scrollHeight:document.documentElement.scrollHeight,
        clientHeight:document.documentElement.clientHeight
      },'*');
    }
  }

  window.addEventListener('scroll',onScroll,{passive:true});
  new ResizeObserver(function(){
    window.parent.postMessage({
      type:'proxy:resize',
      frameId:frameId,
      width:document.documentElement.scrollWidth,
      height:document.documentElement.scrollHeight
    },'*');
  }).observe(document.documentElement);
  window.addEventListener('load',onScroll);
})();
</script>`;
