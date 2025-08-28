import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

const CURRENCIES = [
  { code: "usd", symbol: "$" },
  { code: "inr", symbol: "₹" },
  { code: "eur", symbol: "€" },
];

const RANGES = [
  { label: "7D", value: "7" },
  { label: "30D", value: "30" },
  { label: "90D", value: "90" },
];

const DEFAULT_COIN = "bitcoin";

function formatCompact(n, symbol = "") {
  return symbol + new Intl.NumberFormat("en-US", { notation: "compact" }).format(n);
}

function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, deps);

  return { data, loading };
}

export default function CryptoDashboard() {
  const [currency, setCurrency] = useState("usd");
  const [coinId, setCoinId] = useState(DEFAULT_COIN);
  const [days, setDays] = useState("30");

  const chartUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}&interval=daily`;
  const { data: chart } = useFetch(chartUrl, [chartUrl]);

  const chartData = useMemo(() => {
    if (!chart?.prices) return [];
    return chart.prices.map(([t, p], i) => ({
      date: new Date(t).toLocaleDateString(),
      price: p,
      volume: chart.total_volumes[i][1],
    }));
  }, [chart]);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif", background: "#f5f6fa", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#2f3640" }}>Crypto Dashboard</h1>

      {/* Unified Controls */}
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "5px", marginBottom: "40px" }}>
        {/* Coins */}
        {["bitcoin", "ethereum", "dogecoin"].map(coin => (
          <button
            key={coin}
            onClick={() => setCoinId(coin)}
            style={{
              padding: "8px 16px",
              border: coinId === coin ? "2px solid #f0f3f5ff" : "1px solid #dcdde1",
              backgroundColor: coinId === coin ? "#6fabf5ff" : "#f5f6fa",
              fontWeight: "bold",
              cursor: "pointer",
              color: "#2f3640",
            }}
          >
            {coin.charAt(0).toUpperCase() + coin.slice(1)}
          </button>
        ))}

        {/* Currencies */}
        {CURRENCIES.map(c => (
          <button
            key={c.code}
            onClick={() => setCurrency(c.code)}
            style={{
              padding: "8px 16px",
              border: currency === c.code ? "2px solid #f2f5f7ff" : "1px solid #dcdde1",
              backgroundColor: currency === c.code ? "#74b9ff" : "#f5f6fa",
              fontWeight: "bold",
              cursor: "pointer",
              color: "#2f3640",
            }}
          >
            {c.code.toUpperCase()}
          </button>
        ))}

        {/* Ranges */}
        {RANGES.map(r => (
          <button
            key={r.value}
            onClick={() => setDays(r.value)}
            style={{
              padding: "8px 16px",
              border: days === r.value ? "2px solid #f5f8faff" : "1px solid #dcdde1",
              backgroundColor: days === r.value ? "#74b9ff" : "#f5f6fa",
              fontWeight: "bold",
              cursor: "pointer",
              color: "#2f3640",
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gap: "40px" }}>
        <div style={{ padding: "10px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h2 style={{ marginBottom: "20px", color: "#2f3640" }}>Price Trend</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={32} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#4cd137" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ padding: "20px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h2 style={{ marginBottom: "20px", color: "#2f3640" }}>Volume</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={32} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" fill="#487eb0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
