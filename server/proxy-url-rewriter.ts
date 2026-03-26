import { PROXY_PATH } from "./proxy-constants";
import { BRIDGE_SCRIPT } from "./bridge-script";

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

  // 5. Restore <script> blocks — rewrite src attribute on the opening tag only
  safe = safe.replace(/<!--__SCRIPT_(\d+)__-->/g, (_match, idx) => {
    const script = scripts[parseInt(idx)];
    return script.replace(
      /(<script[^>]*?\bsrc\s*=\s*)(["'])([^"']*?)\2/i,
      (_m: string, prefix: string, quote: string, url: string) => {
        const rewritten = proxyUrl(url.trim(), baseUrl);
        return `${prefix}${quote}${rewritten}${quote}`;
      },
    );
  });

  // 6. Inject base-url meta tag and bridge script
  const origin = new URL(baseUrl).origin;
  const metaTag = `<meta name="proxy-base-url" content="${origin}">`;

  if (/<\/head>/i.test(safe)) {
    safe = safe.replace(/<\/head>/i, `${metaTag}${BRIDGE_SCRIPT}</head>`);
  } else if (/<\/body>/i.test(safe)) {
    safe = safe.replace(/<\/body>/i, `${metaTag}${BRIDGE_SCRIPT}</body>`);
  } else {
    safe += metaTag + BRIDGE_SCRIPT;
  }

  return safe;
}

export function rewriteCss(css: string, baseUrl: string): string {
  return rewriteCssUrls(css, baseUrl);
}
