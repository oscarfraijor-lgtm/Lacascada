// Port fiel a JS de scripts/prospect-enrich.py (Windsurf), version para UN solo website
// (no batch por CSV). Mismo UA, mismos paths, mismas regex y mismo scoring/tiers para que
// los resultados sean comparables con el motor Python original.
//
// Gotchas de la migracion:
// - Los `finditer` de Python se vuelven regex con flag "g" + matchAll en JS.
// - RX_B2B_ACRO se queda SIN flag "i" a proposito (case-sensitive): bajo case-insensitive,
//   "OEM"/"ODM" hacen match dentro de JS minificado ("autoEmail" -> oEm) y de ids base64
//   ("...E3ODMy..." -> ODM), penalizando de mas a marcas DTC limpias. El resto de regex SI
//   lleva flag "i".

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15";
const TIMEOUT_MS = 10000;
const PATHS = ["", "/about", "/pages/about", "/about-us", "/our-story", "/nosotros", "/contacto"];

// Senales de plataforma / DTC / B2B / redes (mismas que el Python, con las mismas notas)
const RX_SHOPIFY = /cdn\.shopify\.com|Shopify\.theme|shopify-section|\/cdn\/shop\//i;
const RX_WOO = /woocommerce|wp-content\/plugins\/woocommerce/i;
const RX_BIGCOMMERCE = /bigcommerce\.com|cdn\d+\.bigcommerce/i;
const RX_MAGENTO = /magento|\/static\/version\d+\/frontend/i;
const RX_SQUARESPACE = /squarespace\.com|static\.squarespace/i;
const RX_WIX = /wix\.com|wixstatic/i;
const RX_ADD_TO_CART =
  /add[\s_-]?to[\s_-]?cart|add[\s_-]?to[\s_-]?bag|buy[\s_-]?now|agregar[\s_-]?al[\s_-]?carrito|comprar[\s_-]?ahora/i;
const RX_PRICE = /(\$\s?\d+(?:[.,]\d{2})?|USD\s?\d|MXN\s?\d|\d+\s?pesos)/i;
const RX_NEWSLETTER = /newsletter|subscribe|sign[\s_-]?up|suscr[ií]bete/i;
// B2B tells partidos en dos: las FRASES multi-caracter son seguras bajo /i; los acronimos
// sueltos NO. Ver nota arriba del archivo.
const RX_B2B_PHRASE =
  /\b(private[\s_-]label|contract[\s_-]manufactur|white[\s_-]label|formulati(?:on|ng)[\s_-]services|custom[\s_-]formulati|co[\s_-]?manufactur|fillin[g]?[\s_-]services|R&D[\s_-]services|maquila)\b/i;
const RX_B2B_ACRO = /\b(OEM|ODM)\b/; // case-sensitive a proposito
const RX_TIKTOK_SHOP = /tiktok[\s_-]?shop|shop\.tiktok|tiktokshop/i;
const RX_AMAZON =
  /amazon\.com\/(stores|shops|s\?k=|gp\/aag\/main)|amazon\.com\/[A-Za-z0-9\-]+\/dp\/|amazon\.com\.mx\//i;
const RX_INSTAGRAM = /instagram\.com\/([A-Za-z0-9_.]{2,30})/gi;
const RX_TIKTOK = /tiktok\.com\/@?([A-Za-z0-9_.]{2,30})/gi;
const RX_YOUTUBE = /youtube\.com\/(c\/|user\/|@|channel\/)([A-Za-z0-9_\-.]+)/gi;

// EXTRA (no esta en el Python): titulo y meta description del primer HTML cargado, para
// darle contexto al modelo.
const RX_TITLE = /<title[^>]*>([^<]*)<\/title>/i;
const RX_META_DESCRIPTION =
  /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>|<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i;

function detectPlatform(html) {
  if (RX_SHOPIFY.test(html)) return "shopify";
  if (RX_WOO.test(html)) return "woocommerce";
  if (RX_BIGCOMMERCE.test(html)) return "bigcommerce";
  if (RX_MAGENTO.test(html)) return "magento";
  if (RX_SQUARESPACE.test(html)) return "squarespace";
  if (RX_WIX.test(html)) return "wix";
  return "";
}

function detectHandles(html) {
  const igs = new Set([...html.matchAll(RX_INSTAGRAM)].map((m) => m[1]));
  const tts = new Set([...html.matchAll(RX_TIKTOK)].map((m) => m[1]));
  const yts = new Set([...html.matchAll(RX_YOUTUBE)].map((m) => m[2]));
  const noise = new Set(["explore", "p", "reel", "tag", "directory", "tv", "discover"]);
  for (const n of noise) {
    igs.delete(n);
    tts.delete(n);
  }
  const pick = (s) => (s.size ? [...s].sort((a, b) => a.length - b.length)[0] : "");
  return { ig: pick(igs), tt: pick(tts), yt: pick(yts) };
}

function amazonUrl(html) {
  const m = RX_AMAZON.exec(html);
  return m ? m[0] : "";
}

function extractSiteTitle(html) {
  const m = RX_TITLE.exec(html);
  return m ? m[1].trim() : "";
}

function extractMetaDescription(html) {
  const m = RX_META_DESCRIPTION.exec(html);
  if (!m) return "";
  return (m[1] || m[2] || "").trim();
}

// fetch con timeout de 10s. Si ok && content-type incluye text/html: devuelve el texto
// recortado a 500000 chars. Cualquier error o status != 200: devuelve "".
async function fetchPage(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "text/html" },
      // redirect: "follow" es el default de fetch, se deja explicito por claridad
      redirect: "follow",
    });
    if (r.ok && (r.headers.get("content-type") || "").includes("text/html")) {
      const text = await r.text();
      return text.slice(0, 500000);
    }
    return "";
  } catch {
    return "";
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Investiga un website y devuelve senales de plataforma DTC/B2B, redes sociales,
 * presencia de TikTok Shop, y un score/tier interno. Espejo de process() en
 * scripts/prospect-enrich.py pero para un solo sitio (no batch CSV).
 *
 * @param {string} website - website del prospecto (con o sin esquema)
 * @param {{seedIg?: string, seedTiktok?: string}} seeds - handles que ya dio el prospecto
 */
export async function enrichWebsite(website, seeds = {}) {
  const site = (website || "").trim();
  if (!site) {
    return { website: site, reachable: false, platform: "", score: 0, tier: "D", signals: ["no_website"] };
  }

  const base = site.startsWith("http") ? site : `https://${site}`;
  let origin;
  try {
    const parsed = new URL(base);
    origin = `${parsed.protocol}//${parsed.host}`;
  } catch {
    return { website: site, reachable: false, platform: "", score: 0, tier: "D", signals: ["unreachable"] };
  }

  let htmlCombined = "";
  const fetchedPaths = [];
  let siteTitle = "";
  let metaDescription = "";

  for (const p of PATHS) {
    const u = p ? origin + p : base;
    const html = await fetchPage(u);
    if (html) {
      if (!htmlCombined) {
        // Primer HTML que carga: de aqui sacamos title y meta description
        siteTitle = extractSiteTitle(html);
        metaDescription = extractMetaDescription(html);
      }
      htmlCombined += html;
      fetchedPaths.push(p || "/");
    }
    if (htmlCombined.length > 700000) break;
  }

  if (!htmlCombined) {
    return { website: site, reachable: false, platform: "", score: 0, tier: "D", signals: ["unreachable"] };
  }

  const platform = detectPlatform(htmlCombined);
  const handles = detectHandles(htmlCombined);
  // honor los handles seed si el scrape no los encontro
  const ig = handles.ig || (seeds.seedIg || "").replace(/^@/, "").trim();
  const tt = handles.tt || (seeds.seedTiktok || "").replace(/^@/, "").trim();
  const yt = handles.yt;
  const amzn = amazonUrl(htmlCombined);
  const hasCart = RX_ADD_TO_CART.test(htmlCombined);
  const hasPrice = RX_PRICE.test(htmlCombined);
  const hasNewsletter = RX_NEWSLETTER.test(htmlCombined);
  const isB2b = RX_B2B_PHRASE.test(htmlCombined) || RX_B2B_ACRO.test(htmlCombined);
  const hasTtShop = RX_TIKTOK_SHOP.test(htmlCombined);

  let score = 0;
  const signals = [];
  if (["shopify", "woocommerce", "bigcommerce", "magento"].includes(platform)) {
    score += 3;
    signals.push(`ecom:${platform}`);
  } else if (platform) {
    score += 1;
    signals.push(`site:${platform}`);
  }
  if (hasCart) {
    score += 2;
    signals.push("add_to_cart");
  }
  if (hasPrice) {
    score += 1;
    signals.push("price");
  }
  if (hasNewsletter) {
    score += 1;
    signals.push("newsletter");
  }
  if (ig) {
    score += 1;
    signals.push(`ig:@${ig}`);
  }
  if (tt) {
    score += 3;
    signals.push(`tt:@${tt}`);
  }
  if (hasTtShop) {
    score += 4;
    signals.push("tt_shop_present");
  }
  if (amzn) {
    score += 2;
    signals.push("amazon");
  }
  if (yt) {
    score += 1;
    signals.push(`yt:@${yt}`);
  }
  if (isB2b) {
    score -= 5;
    signals.push("B2B_signal");
  }

  let tier;
  if (hasTtShop) {
    tier = "A+"; // ya esta en TTS -> jugada de optimizar/crecer
  } else if (isB2b && score < 4) {
    tier = "D";
  } else if (score >= 8 && tt) {
    tier = "A";
  } else if (score >= 6) {
    tier = "B";
  } else if (score >= 3) {
    tier = "C";
  } else {
    tier = "D";
  }

  return {
    website: site,
    reachable: true,
    platform,
    instagram: ig,
    tiktok: tt,
    youtube: yt,
    amazon_url: amzn,
    has_cart: hasCart,
    has_price: hasPrice,
    has_newsletter: hasNewsletter,
    is_b2b: isB2b,
    has_tt_shop: hasTtShop,
    site_title: siteTitle,
    meta_description: metaDescription,
    fetched_paths: fetchedPaths,
    score,
    tier,
    signals,
  };
}
