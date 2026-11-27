import { Capacitor, CapacitorHttp } from '@capacitor/core';

export const AI_PROVIDER_PRESETS = [
  {
    id: 'deepseek',
    label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-flash', label: 'V4.1 Flash (deepseek-flash)' },
      { id: 'deepseek-v4-pro', label: 'V4 Pro (deepseek-v4-pro)' },
    ],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o-mini', label: 'gpt-4o-mini' },
      { id: 'gpt-4.1-mini', label: 'gpt-4.1-mini' },
      { id: 'gpt-4o', label: 'gpt-4o' },
    ],
  },
  {
    id: 'qwen',
    label: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen-plus', label: 'qwen-plus' },
      { id: 'qwen-turbo', label: 'qwen-turbo' },
    ],
  },
  {
    id: 'zhipu',
    label: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'glm-4-flash', label: 'glm-4-flash' },
      { id: 'glm-4-plus', label: 'glm-4-plus' },
    ],
  },
  {
    id: 'moonshot',
    label: 'Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: [{ id: 'moonshot-v1-8k', label: 'moonshot-v1-8k' }],
  },
  {
    id: 'gemini',
    label: 'Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    models: [
      { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash' },
      { id: 'gemini-2.0-flash', label: 'gemini-2.0-flash' },
    ],
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'deepseek/deepseek-v4.1-flash', label: 'DeepSeek V4.1 Flash' },
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o mini' },
      { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    ],
  },
  {
    id: 'custom',
    label: '自定义',
    baseUrl: '',
    models: [],
  },
];

export const DEFAULT_AI_CONFIG = {
  enabled: false,
  providerId: 'deepseek',
  baseUrl: 'https://api.deepseek.com/v1',
  apiKey: '',
  apiKeysByProvider: {},
  model: 'deepseek-flash',
};

// 兼容 /v1、/v3、/v4 及 /v1beta/openai 等多版本接口路径
function buildChatEndpoint(baseUrl = '') {
  if (!baseUrl.trim()) return null;

  let endpoint;
  try {
    endpoint = new URL(baseUrl.trim());
  } catch {
    throw new Error('API Base URL 格式有误');
  }
  if (!['https:', 'http:'].includes(endpoint.protocol) || endpoint.username || endpoint.password) {
    throw new Error('请输入有效的 HTTP 或 HTTPS 接口地址');
  }
  const path = endpoint.pathname.replace(/\/+$/, '');
  if (path.endsWith('/chat/completions')) {
    endpoint.pathname = path;
  } else {
    const version = /\/v\d+(beta)?(\/openai)?$/i.test(path) ? '' : '/v1';
    endpoint.pathname = `${path}${version}/chat/completions`;
  }
  endpoint.hash = '';
  return endpoint;
}

// 兼容原生 iOS（CapacitorHttp 绕过 CORS）与浏览器预览的统一请求
async function callChatCompletion(aiConfig, messages, { temperature = 0.5, maxTokens = 400 } = {}) {
  const endpoint = buildChatEndpoint(aiConfig?.baseUrl);
  const apiKey = aiConfig?.apiKey?.trim();
  const model = aiConfig?.model?.trim();

  if (!endpoint || !apiKey || !model) {
    throw new Error('请先在「设置」中完善 AI 接口配置');
  }
  const url = endpoint.href;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const payload = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  // DeepSeek 官方 V4.1 Flash / V4 Pro 默认开启思考模式，轻任务关闭思考以提速并避免 max_tokens 耗尽返回空正文
  if (endpoint.hostname === 'api.deepseek.com' && /^deepseek-(flash|v4-pro)/i.test(model)) {
    payload.thinking = { type: 'disabled' };
  }

  let data;
  if (Capacitor.isNativePlatform()) {
    const res = await CapacitorHttp.post({
      url,
      headers,
      data: payload,
      connectTimeout: 15000,
      readTimeout: 25000,
    });
    if (res.status < 200 || res.status >= 300) {
      const errMsg = typeof res.data === 'string' ? res.data : res.data?.error?.message;
      throw new Error(formatApiError(res.status, errMsg, apiKey));
    }
    data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
  } else {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: globalThis.AbortSignal?.timeout?.(25000),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(formatApiError(res.status, json?.error?.message, apiKey));
    }
    data = json;
  }

  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('模型未返回有效内容');
  return content;
}

function formatApiError(status, detail, apiKey) {
  const message = typeof detail === 'string' ? detail.replaceAll(apiKey, '••••').trim().slice(0, 160) : '';
  return message ? `请求失败 (${status}) · ${message}` : `请求失败 (${status})`;
}

// 1. 设置页：测试连接
export async function testAiConnection(aiConfig) {
  await callChatCompletion(
    aiConfig,
    [{ role: 'user', content: '回复OK' }],
    { temperature: 0, maxTokens: 10 }
  );
  return true;
}

// 2. 概况页：克制的今日饮食与睡眠简评
export async function fetchDailyBrief(aiConfig, context) {
  const prompt = `
你是一个极简、克制的健康数据摘要器。根据以下今日数据输出一段简评：
- 自律目标：${context.goalLabel}（目标热量 ${context.targetCalories} kcal）
- 今日饮食：已摄入 ${context.intakeKcal} kcal，训练消耗 ${context.burnedKcal} kcal，净热量 ${context.netKcal} kcal
- 三大营养素：蛋白 ${context.protein}/${context.targetProtein}g，碳水 ${context.carbs}/${context.targetCarbs}g，脂肪 ${context.fat}/${context.targetFat}g
- 今日登记睡眠：${context.sleepHours ? `${context.sleepHours} 小时（目标 ${context.targetSleep} 小时）` : '暂未记录'}

严格要求：
1. 字数控制在 45~65 字以内，纯文本单段，不要用标题、列表或 Emoji。
2. 语气平静客观，不打招呼、不喊口号。
3. 精准点出今日饮食/营养素核心状态与睡眠影响，给出 1 条具体可执行微调。`.trim();

  return callChatCompletion(
    aiConfig,
    [{ role: 'user', content: prompt }],
    { temperature: 0.4, maxTokens: 150 }
  );
}

// 3. 记录页：AI 热量估算器（强制结构化 JSON）
export async function estimateFoodCalories(aiConfig, userText) {
  const systemPrompt = `你是精准的营养师与中餐热量估算引擎。将用户的自然语言饮食描述拆解为食物列表并估算克数与营养素。
只输出合法的 JSON 数组，不要包含任何解释、前后缀或 Markdown 代码块。
格式：[{"name":"食物名称","grams":150,"kcal":260,"protein":18,"carbs":25,"fat":9}]
要求：所有数值为保留整数或一位小数的数字，无法识别时返回空数组 []。`;

  const raw = await callChatCompletion(
    aiConfig,
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userText.trim() },
    ],
    { temperature: 0.2, maxTokens: 500 }
  );

  // 兜底剥离可能附带的 ```json 包裹
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('未能解析出食物估算结果，请换个说法重试');

  let parsed;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    throw new Error('未能解析出食物估算结果，请重试');
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('未识别到具体食物，请补充名称或份量');
  }

  const items = parsed.filter((item) => typeof item?.name === 'string' && item.name.trim());
  if (!items.length) throw new Error('未识别到具体食物，请补充名称或份量');

  return items.map((item, idx) => ({
    tempId: `${Date.now()}_${idx}`,
    name: item.name.trim(),
    grams: Math.max(1, Math.round(nonnegativeNumber(item.grams, 100))),
    kcal: Math.round(nonnegativeNumber(item.kcal)),
    protein: Number(nonnegativeNumber(item.protein).toFixed(1)),
    carbs: Number(nonnegativeNumber(item.carbs).toFixed(1)),
    fat: Number(nonnegativeNumber(item.fat).toFixed(1)),
  }));
}

function nonnegativeNumber(value, fallback = 0) {
  const number = Number(value ?? fallback);
  return number >= 0 && number <= Number.MAX_SAFE_INTEGER ? number : fallback;
}

// 4. 规划页：每日一句鼓励
export async function fetchDailyQuote(aiConfig, context) {
  const prompt = `今天是「${context.planName}」第 ${context.currentDay}/${context.totalDays} 天，当前目标为${context.goalLabel}，今日训练安排是「${context.todayTrainingText}」，已连续达标 ${context.streakDays} 天。
请写一句今日自律短语：
1. 严格 25 字以内，纯文本，不加引号、不加署名、不带 Emoji。
2. 风格克制沉静、有节奏感，拒绝浮夸鸡汤和感叹号堆砌。`.trim();

  const text = await callChatCompletion(
    aiConfig,
    [{ role: 'user', content: prompt }],
    { temperature: 0.7, maxTokens: 80 }
  );
  return text.replace(/^[“"「『]+|[”"」』]+$/g, '').trim();
}
