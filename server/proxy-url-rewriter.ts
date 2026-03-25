import { PROXY_PATH } from "./proxy-constants";

function proxyUrl(value: string, baseUrl: string): string {
  if (
    !value ||
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.startsWith("javascript:") ||
    value.startsWith("mailto:") ||
    value.startsWith("#")
  ) {
    return value;
  }

  let resolved: string;

  try {
    if (value.startsWith("//")) {
      resolved = "https:" + value;
    } else if (value.startsWith("http://") || value.startsWith("https://")) {
      resolved = value;
    } else {
      resolved = new URL(value, baseUrl).href;
    }
  } catch {
    return value;
  }

  return `${PROXY_PATH}?url=${encodeURIComponent(resolved)}`;
}

// Rewrite src, href, action, poster attributes
function rewriteAttributes(html: string, baseUrl: string): string {
  return html
    .replace(
      /(\b(?:src|href|action|poster))\s*=\s*"([^"]*?)"/gi,
      (_match, attr, url) => {
        const rewritten = proxyUrl(url.trim(), baseUrl);
        return `${attr}="${rewritten}"`;
      },
    )
    .replace(
      /(\b(?:src|href|action|poster))\s*=\s*'([^']*?)'/gi,
      (_match, attr, url) => {
        const rewritten = proxyUrl(url.trim(), baseUrl);
        return `${attr}='${rewritten}'`;
      },
    );
}

// Rewrite srcset attribute
function rewriteSrcset(html: string, baseUrl: string): string {
  return html.replace(/srcset\s*=\s*"([^"]+)"/gi, (_match, srcset) => {
    const rewritten = srcset
      .split(",")
      .map((entry: string) => {
        const parts = entry.trim().split(/\s+/);
        if (parts.length >= 1) {
          parts[0] = proxyUrl(parts[0], baseUrl);
        }
        return parts.join(" ");
      })
      .join(", ");
    return `srcset="${rewritten}"`;
  });
}

// Rewrite url() in CSS
function rewriteCssUrls(content: string, baseUrl: string): string {
  return content.replace(
    /url\(\s*["']?([^"')]+?)["']?\s*\)/gi,
    (_match, url) => {
      const rewritten = proxyUrl(url.trim(), baseUrl);
      return `url("${rewritten}")`;
    },
  );
}

const BRIDGE_SCRIPT = `<script data-proxy-bridge>
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

export function rewriteHtml(html: string, baseUrl: string): string {
  // 1. Protect <script> blocks — extract and replace with placeholders
  const scripts: string[] = [];
  let safe = html.replace(/(<script[\s>][\s\S]*?<\/script>)/gi, (match) => {
    scripts.push(match);
    return `<!--__SCRIPT_${scripts.length - 1}__-->`;
  });

  // 2. Rewrite URLs in safe (non-script) HTML only
  safe = rewriteAttributes(safe, baseUrl);
  safe = rewriteSrcset(safe, baseUrl);

  // 3. Rewrite inline style url()
  safe = safe.replace(
    /style\s*=\s*"([^"]*)"/gi,
    (_match, style) => `style="${rewriteCssUrls(style, baseUrl)}"`,
  );

  // 4. Rewrite <style> tag contents
  safe = safe.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (_match, open, css, close) =>
      `${open}${rewriteCssUrls(css, baseUrl)}${close}`,
  );

  // 5. Restore <script> blocks (untouched)
  safe = safe.replace(
    /<!--__SCRIPT_(\d+)__-->/g,
    (_match, idx) => scripts[parseInt(idx)],
  );

  // 6. Inject bridge script before </head> or </body>
  if (/<\/head>/i.test(safe)) {
    safe = safe.replace(/<\/head>/i, `${BRIDGE_SCRIPT}</head>`);
  } else if (/<\/body>/i.test(safe)) {
    safe = safe.replace(/<\/body>/i, `${BRIDGE_SCRIPT}</body>`);
  } else {
    safe += BRIDGE_SCRIPT;
  }

  return safe;
}

export function rewriteCss(css: string, baseUrl: string): string {
  return rewriteCssUrls(css, baseUrl);
}
