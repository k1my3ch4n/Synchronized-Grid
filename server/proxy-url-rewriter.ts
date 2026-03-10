import { PROXY_PATH } from "./proxy-constants";

function proxyUrl(value: string, baseUrl: string): string {
  // Skip non-HTTP schemes and fragments
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

// Rewrite src, href, action attributes
function rewriteAttributes(html: string, baseUrl: string): string {
  return html
    .replace(
      /(\b(?:src|href|action|poster))\s*=\s*"([^"]*?)"/gi,
      (match, attr, url) => {
        const rewritten = proxyUrl(url.trim(), baseUrl);
        return `${attr}="${rewritten}"`;
      },
    )
    .replace(
      /(\b(?:src|href|action|poster))\s*=\s*'([^']*?)'/gi,
      (match, attr, url) => {
        const rewritten = proxyUrl(url.trim(), baseUrl);
        return `${attr}='${rewritten}'`;
      },
    );
}

// Rewrite srcset attribute
function rewriteSrcset(html: string, baseUrl: string): string {
  return html.replace(/srcset\s*=\s*"([^"]+)"/gi, (match, srcset) => {
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

// Rewrite url() in CSS (inline styles and style tags)
function rewriteCssUrls(content: string, baseUrl: string): string {
  return content.replace(
    /url\(\s*["']?([^"')]+?)["']?\s*\)/gi,
    (match, url) => {
      const rewritten = proxyUrl(url.trim(), baseUrl);
      return `url("${rewritten}")`;
    },
  );
}

const BRIDGE_SCRIPT = `<script data-proxy-bridge>
(function(){
  var lastScrollY = -1;
  function onScroll(){
    if(window.scrollY !== lastScrollY){
      lastScrollY = window.scrollY;
      window.parent.postMessage({
        type:'proxy:scroll',
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
      width:document.documentElement.scrollWidth,
      height:document.documentElement.scrollHeight
    },'*');
  }).observe(document.documentElement);
  window.addEventListener('load',onScroll);
})();
</script>`;

export function rewriteHtml(html: string, baseUrl: string): string {
  const origin = new URL(baseUrl).origin;

  // Rewrite URLs in attributes
  let result = rewriteAttributes(html, baseUrl);
  result = rewriteSrcset(result, baseUrl);

  // Rewrite inline style url()
  result = result.replace(
    /style\s*=\s*"([^"]*)"/gi,
    (match, style) => `style="${rewriteCssUrls(style, baseUrl)}"`,
  );

  // Rewrite <style> tag contents
  result = result.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (match, open, css, close) =>
      `${open}${rewriteCssUrls(css, baseUrl)}${close}`,
  );

  // Insert <base> tag after <head> for any URLs the regex misses
  const baseTag = `<base href="${origin}/">`;
  if (/<head[^>]*>/i.test(result)) {
    result = result.replace(/(<head[^>]*>)/i, `$1${baseTag}`);
  } else {
    result = baseTag + result;
  }

  // Inject bridge script before </head> or </body>
  if (/<\/head>/i.test(result)) {
    result = result.replace(/<\/head>/i, `${BRIDGE_SCRIPT}</head>`);
  } else if (/<\/body>/i.test(result)) {
    result = result.replace(/<\/body>/i, `${BRIDGE_SCRIPT}</body>`);
  } else {
    result += BRIDGE_SCRIPT;
  }

  return result;
}

export function rewriteCss(css: string, baseUrl: string): string {
  return rewriteCssUrls(css, baseUrl);
}
