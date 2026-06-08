"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY_KEY = "user_api_key";
const STORAGE_MODEL_KEY = "user_api_model";
const STORAGE_URL_KEY = "user_api_url";
const STORAGE_FETCH_KEY = "auto_fetch_enabled";

const MODEL_OPTIONS = [
  { id: "deepseek-chat", name: "DeepSeek Chat（快速）" },
  { id: "deepseek-reasoner", name: "DeepSeek Reasoner（深度）" },
  { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash" },
];

export default function ProfilePage() {
  const [apiKey, setApiKey] = useState("sk-c5504559d7fb4804a05a68ae132a98e1");
  const [apiModel, setApiModel] = useState("deepseek-v4-flash");
  const [apiUrl, setApiUrl] = useState("https://api.deepseek.com/chat/completions");
  const [fetchEnabled, setFetchEnabled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [reprocessResult, setReprocessResult] = useState("");

  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY_KEY);
    const storedModel = localStorage.getItem(STORAGE_MODEL_KEY);
    const storedUrl = localStorage.getItem(STORAGE_URL_KEY);
    const storedFetch = localStorage.getItem(STORAGE_FETCH_KEY);
    if (storedKey) setApiKey(storedKey);
    if (storedModel) setApiModel(storedModel);
    if (storedUrl) setApiUrl(storedUrl);
    setFetchEnabled(storedFetch === "true");
  }, []);

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY_KEY, apiKey);
    localStorage.setItem(STORAGE_MODEL_KEY, apiModel);
    localStorage.setItem(STORAGE_URL_KEY, apiUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleAutoFetch = async () => {
    const next = !fetchEnabled;
    setFetchEnabled(next);
    localStorage.setItem(STORAGE_FETCH_KEY, next ? "true" : "false");
    if (next) {
      await fetch("/api/scheduler", { method: "POST", body: JSON.stringify({ action: "start" }) });
    } else {
      await fetch("/api/scheduler", { method: "POST", body: JSON.stringify({ action: "stop" }) });
    }
  };

  const handleReprocess = async () => {
    if (!apiKey) return;
    setReprocessing(true);
    setReprocessResult("");
    try {
      const params = new URLSearchParams({ reprocess: "true", key: apiKey, model: apiModel, url: apiUrl });
      const res = await fetch(`/api/fetch?${params}`);
      const data = await res.json();
      setReprocessResult(`已处理 ${data.reprocessed}/${data.total} 条`);
    } catch (e: any) {
      setReprocessResult("请求失败: " + e.message);
    } finally {
      setReprocessing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <header className="h-16 flex items-center px-8 border-b shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(8,12,26,0.4)", backdropFilter: "blur(16px)" }}
      >
        <h1 className="text-lg font-bold">👤 我的</h1>
      </header>

      <div className="px-8 py-6 max-w-[900px] mx-auto w-full">
        <div className="glass rounded-2xl p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #7c5cfc, #2dd4bf)" }}
          >G</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Guo Wei</h2>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Pro 会员</p>
          </div>
        </div>

        {/* 自动抓取开关 */}
        <div className="glass rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">📡 自动抓取</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">启用后自动抓取所有活跃信息源</p>
              <p className="text-xs mt-0.5 text-dim">关闭后需手动触发抓取（GET /api/fetch?source=xxx）</p>
            </div>
            <button onClick={toggleAutoFetch}
              className="relative w-12 h-6 rounded-full transition-all cursor-pointer"
              style={{ background: fetchEnabled ? "#7c5cfc" : "rgba(255,255,255,0.15)" }}
            >
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: fetchEnabled ? "calc(100% - 22px)" : "2px" }} />
            </button>
          </div>
        </div>

        {/* API 配置 */}
        <div className="glass rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">🤖 AI 解码配置</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block text-dim">API Key</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "rgba(255,255,255,0.85)", outline: "none" }} />
              <p className="text-[10px] mt-1 text-tertiary">支持 DeepSeek / OpenAI 兼容 API</p>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block text-dim">模型</label>
              <select value={apiModel} onChange={(e) => setApiModel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "rgba(255,255,255,0.85)", outline: "none" }}>
                {MODEL_OPTIONS.map((m) => (<option key={m.id} value={m.id} style={{ background: "#0d1128" }}>{m.name}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block text-dim">API 地址</label>
              <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.deepseek.com/chat/completions"
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "rgba(255,255,255,0.85)", outline: "none" }} />
              <p className="text-[10px] mt-1 text-tertiary">兼容 OpenAI 格式的 API 端点</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={saveConfig}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
                style={{ background: "linear-gradient(135deg, #7c5cfc, #a78bfa)" }}>
                {saved ? "✅ 已保存" : "保存配置"}
              </button>
              <button onClick={handleReprocess}
                disabled={reprocessing || !apiKey}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40"
                style={{ background: "rgba(45,212,191,0.12)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.15)" }}>
                {reprocessing ? "⏳ 处理中..." : "🔄 重新解码"}
              </button>
            </div>
            {reprocessResult && <p className="text-xs text-dim mt-1">{reprocessResult}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
