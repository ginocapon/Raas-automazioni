/**
 * Policy link bandi: vietati URL di aggregatori concorrenti; accettati solo host istituzionali plausibili.
 * Usato da scrape-bandi.js, verify-links-perplexity.js, validate-bandi-links-free.js
 *
 * Estendi AGGREGATOR_HOST_SUBSTRINGS se individui nuovi siti da cui non vogliamo link diretti.
 */

/** Sottostringhe nell'hostname (senza www.) — mai usare questi link come url_bando. */
const AGGREGATOR_HOST_SUBSTRINGS = [
  'europainnovazione.com'
];

function hostnameOf(url) {
  if (!url || typeof url !== 'string' || url === '#') return '';
  try {
    const u = url.startsWith('http') ? url : 'https://' + url;
    return new URL(u).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function isBlockedAggregatorHost(hostname) {
  if (!hostname) return false;
  const h = hostname.replace(/^www\./, '');
  return AGGREGATOR_HOST_SUBSTRINGS.some((s) => h.includes(s));
}

/**
 * Host considerato idoneo per un bando pubblicato (PA, UE, enti tipici, Camere di Commercio, regioni).
 */
function isAcceptableOfficialBandoHost(hostname) {
  if (!hostname) return false;
  const h = hostname.toLowerCase().replace(/^www\./, '');
  if (isBlockedAggregatorHost(h)) return false;

  if (h.endsWith('.gov.it')) return true;
  if (h.endsWith('.governo.it')) return true;
  if (h.endsWith('.europa.eu')) return true;
  if (h.endsWith('.edu.it')) return true;
  if (h.endsWith('.camcom.it')) return true;

  const exact = new Set([
    'invitalia.it',
    'inail.it',
    'inps.it',
    'simest.it',
    'ice.it',
    'sace.it',
    'unioncamere.it',
    'agenziaice.it',
    'mimit.gov.it',
    'mise.gov.it',
    'gse.it'
  ]);
  if (exact.has(h)) return true;

  if (/^regione\.[a-z0-9-]+\.it$/.test(h)) return true;
  if (h.endsWith('.regione.it')) return true;

  return false;
}

function isAcceptableOfficialBandoUrl(url) {
  return isAcceptableOfficialBandoHost(hostnameOf(url));
}

/** Azzera url_bando / url_domanda se puntano a aggregatori; marca per verifica. */
function sanitizeBandoRecord(b) {
  const out = { ...b };
  const hostBando = hostnameOf(out.url_bando);
  const hostDomanda = hostnameOf(out.url_domanda);
  if (hostBando && isBlockedAggregatorHost(hostBando)) {
    out.url_bando = null;
    out.needs_url_verification = true;
    out.link_verificato = false;
  }
  if (hostDomanda && isBlockedAggregatorHost(hostDomanda)) {
    out.url_domanda = null;
  }
  return out;
}

function sanitizeAllBandi(bandi) {
  return bandi.map(sanitizeBandoRecord);
}

module.exports = {
  hostnameOf,
  isBlockedAggregatorHost,
  isAcceptableOfficialBandoHost,
  isAcceptableOfficialBandoUrl,
  sanitizeBandoRecord,
  sanitizeAllBandi,
  AGGREGATOR_HOST_SUBSTRINGS
};
