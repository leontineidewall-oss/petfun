// GET /api/coin?ca=<mint> -> the coin's pump.fun pool (bonding curve or PumpSwap) from DexScreener, trimmed
const { getJson, trim } = require("./_pump.js");

module.exports = async function handler(req, res) {
  var ca = String((req.query && req.query.ca) || "").trim();
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(ca)) {
    res.status(400).json({ error: "bad address" });
    return;
  }
  try {
    const pairs = await getJson("https://api.dexscreener.com/tokens/v1/solana/" + ca);
    const c = trim(pairs, ca);
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    if (!c) { res.status(404).json({ error: "no pump.fun pool" }); return; }
    res.status(200).json(c);
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: "upstream", detail: String((e && e.message) || e) });
  }
};
