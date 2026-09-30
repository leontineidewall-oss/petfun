// shared helpers for the api functions (files starting with _ are not routes on Vercel)
const UA = "petfun (+https://github.com/leontineidewall-oss/petfun)";
const SOL = "So11111111111111111111111111111111111111112";

function n(v) { var x = Number(v); return isFinite(x) ? x : null; }
function tx(t) { return t ? (Number(t.buys) || 0) + (Number(t.sells) || 0) : 0; }

async function getJson(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept": "application/json" } });
  if (!r.ok) throw new Error(url + " " + r.status);
  return r.json();
}

// the coin's pump.fun pool (bonding curve or PumpSwap, SOL-quoted) with the most 24h volume, trimmed; null if none
function trim(pairs, ca) {
  const pump = (Array.isArray(pairs) ? pairs : []).filter(function (p) {
    return p && (p.dexId === "pumpfun" || p.dexId === "pumpswap") && p.baseToken && p.baseToken.address === ca && p.quoteToken && p.quoteToken.address === SOL;
  }).sort(function (a, b) { return ((b.volume && b.volume.h24) || 0) - ((a.volume && a.volume.h24) || 0); });
  if (!pump.length) return null;
  const p = pump[0];
  const pu = n(p.priceUsd), pn = n(p.priceNative);
  const v = p.volume || {}, t = p.txns || {};
  return {
    ca: ca,
    name: String(p.baseToken.name || "").slice(0, 60),
    symbol: String(p.baseToken.symbol || "").slice(0, 16),
    dex: p.dexId,
    url: p.url || ("https://dexscreener.com/solana/" + ca),
    solUsd: pu && pn ? pu / pn : null,
    marketCapUsd: n(p.marketCap != null ? p.marketCap : p.fdv),
    volumeUsd: { m5: n(v.m5), h1: n(v.h1), h6: n(v.h6), h24: n(v.h24) },
    txns: { m5: tx(t.m5), h1: tx(t.h1), h6: tx(t.h6), h24: tx(t.h24) },
    createdAt: n(p.pairCreatedAt),
    fetchedAt: new Date().toISOString()
  };
}

// pump.fun mints that just got a DexScreener profile or boost
async function freshMints() {
  const got = await Promise.allSettled([
    getJson("https://api.dexscreener.com/token-profiles/latest/v1"),
    getJson("https://api.dexscreener.com/token-boosts/latest/v1"),
    getJson("https://api.dexscreener.com/token-boosts/top/v1")
  ]);
  const seen = {}, cas = [];
  got.forEach(function (g) {
    if (g.status !== "fulfilled" || !Array.isArray(g.value)) return;
    g.value.forEach(function (t) {
      var a = t && t.tokenAddress;
      if (t && t.chainId === "solana" && typeof a === "string" && /pump$/.test(a) && !seen[a]) { seen[a] = 1; cas.push(a); }
    });
  });
  return cas;
}

module.exports = { UA: UA, SOL: SOL, getJson: getJson, trim: trim, freshMints: freshMints };
