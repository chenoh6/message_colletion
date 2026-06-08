// 重新处理币圈数据：给已有条目生成 AI 解读
import { readFileSync, writeFileSync } from 'fs';
import axios from 'axios';

const STORE_PATH = process.cwd() + '/data/store.json';
const API_KEY = process.env.DEEPSEEK_API_KEY;
if (!API_KEY) { console.error('Missing DEEPSEEK_API_KEY'); process.exit(1); }

// 读取 store
const raw = readFileSync(STORE_PATH, 'utf-8');
const store = JSON.parse(raw);
const entries = Object.values(store.entries);

// 只处理币圈且没有 aiSummary 的
const toProcess = entries.filter(e => e.category === 'crypto' && !e.aiSummary);
console.log(`Total: ${entries.length}, Crypto no-ai: ${toProcess.length}`);

// 逐条处理（只处理前 10 条避免超时）
const batch = toProcess.slice(0, 10);
let done = 0;

for (const entry of batch) {
  const text = (entry.contentText || entry.summary || entry.title).slice(0, 2000);
  const prompt = `你是一个信息解码大师。把以下信息拆解为三段式。

返回 JSON：
{
  "summary": "中文总结\\n\\n解码分析：\\n🔍 事实：...\\n💡 判断：...\\n🧭 行动：..."
}

标题：${entry.title}
正文：${text}`;

  try {
    const res = await axios.post('https://api.deepseek.com/chat/completions', {
      model: 'deepseek-chat',
      max_tokens: 600,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      timeout: 30000,
    });
    const result = res.data?.choices?.[0]?.message?.content;
    if (result) {
      const parsed = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}');
      entry.aiSummary = parsed.summary || entry.summary;
      entry.aiProcessedAt = new Date().toISOString();
      console.log(`✅ ${entry.title.slice(0, 50)}`);
      done++;
    }
  } catch (e) {
    console.error(`❌ ${entry.title.slice(0, 50)}: ${e.message}`);
  }
}

// 写回
store.entries = Object.fromEntries(entries.map(e => [e.id, e]));
writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
console.log(`\nDone. Processed ${done}/${batch.length} entries.`);
