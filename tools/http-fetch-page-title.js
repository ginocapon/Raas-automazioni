/**
 * Scarica l'inizio di una pagina HTML e estrae <title> (segue redirect).
 * Uso interno per coerenza titolo bando vs pagina.
 */

const https = require('https');
const http = require('http');

const MAX_BYTES = 200000;

function fetchPageTitle(urlString, maxRedirects = 5) {
  return new Promise((resolve) => {
    if (maxRedirects < 0) return resolve(null);
    let u;
    try {
      u = new URL(urlString);
    } catch {
      return resolve(null);
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return resolve(null);

    const lib = u.protocol === 'https:' ? https : http;
    const opts = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method: 'GET',
      timeout: 18000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; RaaS-Bandi-Coherence/1.0; +https://www.raasautomazioni.it) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8'
      }
    };

    const req = lib.request(opts, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let next;
        try {
          next = new URL(res.headers.location, urlString).href;
        } catch {
          res.resume();
          return resolve(null);
        }
        res.resume();
        return resolve(fetchPageTitle(next, maxRedirects - 1));
      }

      if (res.statusCode < 200 || res.statusCode >= 400) {
        res.resume();
        return resolve(null);
      }

      let buf = '';
      let total = 0;
      let settled = false;

      function finish() {
        if (settled) return;
        settled = true;
        const m = buf.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (!m) return resolve(null);
        const raw = m[1].replace(/\s+/g, ' ').trim();
        const decoded = raw
          .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
          .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        resolve(decoded.slice(0, 500) || null);
      }

      res.on('data', (chunk) => {
        if (settled) return;
        if (buf.length >= MAX_BYTES) return finish();
        buf += chunk.toString('utf8');
        total += chunk.length;
        const lower = buf.toLowerCase();
        if (lower.includes('</title>') || total >= MAX_BYTES) {
          res.destroy();
          finish();
        }
      });
      res.on('end', () => {
        if (!settled) finish();
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

module.exports = { fetchPageTitle };
