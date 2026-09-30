# pet.fun

Every coin hatches a pet. Creator fees are its food: every meal buys the coin back and burns it. Feed it and it grows (1 · 10 · 100 SOL eaten = egg, baby, grown). Skip a day and it dies.

pet.fun is not live. This site is a preview: paste any coin already on pump.fun and it shows the pet that coin would have, from its real trading data.

- `index.html` - the whole site, no build step.
- `api/coin.js` - reads the coin's pump.fun pool (bonding curve or PumpSwap) from DexScreener and caches it for 30s.
- `api/nursery.js` - the nursery: up to 12 pump.fun coins trending on DexScreener right now, with their pool data (one batched call, cached 60s).
- `api/_pump.js` - shared helpers (not a route).
- `og.jpg` - link preview.

"Fed in last 24h" is an estimate: 24h volume ÷ SOL price × the creator fee pump.fun charges at the coin's current market cap (0.30% on the curve; 0.95% down to 0.05% on PumpSwap, per https://pump.fun/docs/fees).
