// GET /api/nursery -> up to 12 live pump.fun coins (fresh DexScreener profiles/boosts), each with its pool data
const { getJson, trim, freshMints } = require("./_pump.js");

module.exports = async function handler(req, res) {
  try {
    const cas = (await freshMints()).slice(0, 30);
    if (!cas.length) throw new Error("no fresh mints");
    const pairs = await getJson("https://api.dexscreener.com/tokens/v1/solana/" + cas.join(","));
    const coins = [];
    cas.forEach(function (ca) { var c = trim(pairs, ca); if (c && c.volumeUsd.h24 != null) coins.push(c); });
    if (!coins.length) throw new Error("no pools");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ coins: coins.slice(0, 12), fetchedAt: new Date().toISOString() });
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: "upstream", detail: String((e && e.message) || e) });
  }
};
