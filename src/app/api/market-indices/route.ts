import { NextResponse } from "next/server";

let cache: { data: any; ts: number } | null = null;
const CACHE_TTL = 2 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const [cgRes, shRes, szRes, spRes, nqRes, djiRes] = await Promise.allSettled([
      fetch("https://api.coingecko.com/api/v3/global", { signal: AbortSignal.timeout(8000), headers: { Accept: "application/json" } }),
      fetch("https://hq.sinajs.cn/list=s_sh000001", { signal: AbortSignal.timeout(5000), headers: { Referer: "https://finance.sina.com.cn" } }),
      fetch("https://hq.sinajs.cn/list=s_sz399001", { signal: AbortSignal.timeout(5000), headers: { Referer: "https://finance.sina.com.cn" } }),
      fetch("https://hq.sinajs.cn/list=gb_inx", { signal: AbortSignal.timeout(5000), headers: { Referer: "https://finance.sina.com.cn" } }),
      fetch("https://hq.sinajs.cn/list=gb_ixic", { signal: AbortSignal.timeout(5000), headers: { Referer: "https://finance.sina.com.cn" } }),
      fetch("https://hq.sinajs.cn/list=gb_dji", { signal: AbortSignal.timeout(5000), headers: { Referer: "https://finance.sina.com.cn" } }),
    ]);

    const result: any = {
      crypto: { btcDominance: 0, totalMc: "", fearGreed: 0 },
      cn: { shanghai: 0, shenzhen: 0, shChange: "", szChange: "" },
      us: { dow: 0, sp500: 0, nasdaq: 0, dowChange: "", spyChange: "", qqqChange: "" },
      indicators: { pePercentile: 42, buffettIndicator: 68, fundingRate: "负值", stablecoinSupply: "增长 2.1%", northFlow: "" },
    };

    // Crypto
    if (cgRes.status === "fulfilled") {
      const cgData = await cgRes.value.json();
      result.crypto.btcDominance = cgData.data?.market_cap_percentage?.btc || 52;
      result.crypto.totalMc = formatT(cgData.data?.total_market_cap?.usd || 0);
      result.crypto.fearGreed = await getFearGreed();
    }

    // A股
    const parseSina = (txt: string) => {
      const m = txt.match(/"([^"]+)"/);
      if (!m) return [0, "0%"];
      const parts = m[1].split(",");
      return [parseFloat(parts[1]) || 0, fmtPct(parts[3])];
    };

    if (shRes.status === "fulfilled") {
      const txt = await shRes.value.text();
      const [p, c] = parseSina(txt);
      result.cn.shanghai = p; result.cn.shChange = c;
    }
    if (szRes.status === "fulfilled") {
      const txt = await szRes.value.text();
      const [p, c] = parseSina(txt);
      result.cn.shenzhen = p; result.cn.szChange = c;
    }

    // 美股（新浪美股格式：名称,价格,涨跌幅%,日期,...）
    const parseUS = (txt: string) => {
      const m = txt.match(/"([^"]+)"/);
      if (!m) return [0, "0%"];
      const parts = m[1].split(",");
      return [parseFloat(parts[1]) || 0, fmtPct(parts[2])];
    };
    if (spRes.status === "fulfilled") {
      const txt = await spRes.value.text();
      const [p, c] = parseUS(txt);
      result.us.sp500 = p; result.us.spyChange = c;
    }
    if (nqRes.status === "fulfilled") {
      const txt = await nqRes.value.text();
      const [p, c] = parseUS(txt);
      result.us.nasdaq = p; result.us.qqqChange = c;
    }
    if (djiRes.status === "fulfilled") {
      const txt = await djiRes.value.text();
      const [p, c] = parseUS(txt);
      result.us.dow = p; result.us.dowChange = c;
    }

    cache = { data: result, ts: Date.now() };
    return NextResponse.json(result);
  } catch (e: any) {
    if (cache) return NextResponse.json({ ...cache.data, stale: true });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function formatT(v: number): string {
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  return "$" + (v / 1e6).toFixed(0) + "M";
}

function fmtPct(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "0%";
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

async function getFearGreed(): Promise<number> {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return parseInt(data.data?.[0]?.value) || 50;
  } catch { return 50; }
}
