import { NextResponse } from "next/server";

const COIN_IDS: Record<string, string> = {
  btc: "bitcoin",
  eth: "ethereum",
  sol: "solana",
  doge: "dogecoin",
};

let cache: { key: string; data: any; ts: number } | null = null;
const CACHE_TTL = 3 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coin = (searchParams.get("coin") || "btc").toLowerCase();
  const coinId = COIN_IDS[coin];
  if (!coinId) return NextResponse.json({ error: `Unsupported coin: ${coin}` }, { status: 400 });

  const cacheKey = `price_${coin}`;
  if (cache && cache.key === cacheKey && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) throw new Error(`CG ${res.status}`);

    const raw = await res.json();
    const points: { t: number; p: number }[] = (raw.prices || []).map(
      ([ts, p]: [number, number]) => ({ t: Math.floor(ts / 60000) * 60000, p: Math.round(p) })
    );
    const seen = new Set<number>();
    const deduped = points.filter(pt => { if (seen.has(pt.t)) return false; seen.add(pt.t); return true; });

    const result = { points: deduped, current: deduped[deduped.length - 1]?.p || 0, coin };
    cache = { key: cacheKey, data: result, ts: Date.now() };
    return NextResponse.json(result);
  } catch (e: any) {
    if (cache && cache.key === cacheKey) return NextResponse.json({ ...cache.data, stale: true });
    return NextResponse.json({ points: [], current: 0, coin, error: e.message });
  }
}
