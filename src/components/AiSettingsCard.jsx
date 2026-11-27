import { useId, useRef, useState } from 'react';
import { ChevronDown, Eye, EyeOff, Sparkles } from 'lucide-react';
import { AI_PROVIDER_PRESETS, testAiConnection } from '../utils/aiService.js';
import { haptic } from '../utils/haptics.js';

const fieldClass = 'w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none';

export function AiSettingsCard({ aiConfig, onUpdateAiConfig }) {
  const [showKey, setShowKey] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const requestVersion = useRef(0);
  const keyId = useId();
  const provider = AI_PROVIDER_PRESETS.find(({ id }) => id === aiConfig.providerId) ?? AI_PROVIDER_PRESETS[0];
  const isCustom = provider.id === 'custom';
  const presetModel = provider.models.some(({ id }) => id === aiConfig.model);

  function update(updater) {
    requestVersion.current += 1;
    setTesting(false);
    setTestResult(null);
    onUpdateAiConfig(updater);
  }

  function changeProvider(next) {
    if (next.id === aiConfig.providerId) return;
    update((previous) => {
      const apiKeysByProvider = { ...previous.apiKeysByProvider, [previous.providerId]: previous.apiKey };
      return {
        ...previous,
        providerId: next.id,
        baseUrl: next.baseUrl,
        model: next.models[0]?.id ?? '',
        apiKey: apiKeysByProvider[next.id] ?? '',
        apiKeysByProvider
      };
    });
    setShowKey(false);
    setAdvanced(false);
    void haptic.tap();
  }

  function editField(field, value) {
    update((previous) => ({ ...previous, [field]: value }));
  }

  function editKey(apiKey) {
    update((previous) => ({
      ...previous,
      apiKey,
      apiKeysByProvider: { ...previous.apiKeysByProvider, [previous.providerId]: apiKey }
    }));
  }

  async function testConnection() {
    if (document.activeElement instanceof HTMLInputElement) document.activeElement.blur();
    const version = ++requestVersion.current;
    setTesting(true);
    setTestResult(null);
    try {
      await testAiConnection(aiConfig);
      if (version === requestVersion.current) setTestResult({ success: true, text: '连接成功' });
    } catch (error) {
      if (version !== requestVersion.current) return;
      let message = error instanceof Error ? error.message : '请检查接口配置和网络';
      const key = aiConfig.apiKey.trim();
      if (key) message = message.split(key).join('••••');
      setTestResult({ success: false, text: `连接失败 · ${message}` });
    } finally {
      if (version === requestVersion.current) setTesting(false);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
          <Sparkles className="h-4 w-4 text-indigo-500" aria-hidden="true" />
          AI 助手配置
        </h2>
        <button
          type="button"
          role="switch"
          aria-label="启用 AI 辅助"
          aria-checked={aiConfig.enabled}
          onClick={() => {
            update((previous) => ({ ...previous, enabled: !previous.enabled }));
            void haptic.tap();
          }}
          className={`relative h-7 w-12 rounded-full transition-colors ${aiConfig.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
        >
          <span aria-hidden="true" className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${aiConfig.enabled ? 'translate-x-5' : ''}`} />
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">开启后，相关记录摘要与饮食估算内容会发送到所选服务商。</p>

      <div role="group" aria-label="AI 服务商" className="flex gap-2 overflow-x-auto overscroll-x-none no-scrollbar pb-1">
        {AI_PROVIDER_PRESETS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={provider.id === option.id}
            onClick={() => changeProvider(option)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
              provider.id === option.id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {!isCustom && (
        <div role="group" aria-label="模型预设" className="space-y-1">
          <span className="block text-xs font-semibold text-slate-600">模型</span>
          <div className="flex gap-2 overflow-x-auto overscroll-x-none no-scrollbar pb-1">
            {provider.models.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={aiConfig.model === id}
                onClick={() => {
                  if (aiConfig.model === id) return;
                  editField('model', id);
                  void haptic.tap();
                }}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                  aiConfig.model === id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {!presetModel && aiConfig.model && <p className="break-words text-[11px] text-slate-500">自定义模型 {aiConfig.model}</p>}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor={keyId} className="block text-xs font-semibold text-slate-600">API Key</label>
        <div className="relative">
          <input
            id={keyId}
            type={showKey ? 'text' : 'password'}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={aiConfig.apiKey}
            onChange={(event) => editKey(event.target.value)}
            className={`${fieldClass} pr-11`}
          />
          <button
            type="button"
            aria-label={showKey ? '隐藏 API Key' : '显示 API Key'}
            onClick={() => setShowKey((visible) => !visible)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500"
          >
            {showKey ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {!isCustom && (
        <button
          type="button"
          aria-expanded={advanced}
          onClick={() => setAdvanced((visible) => !visible)}
          className="flex items-center gap-1.5 py-1 text-xs font-semibold text-slate-600"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${advanced ? 'rotate-180' : ''}`} aria-hidden="true" />
          高级设置
        </button>
      )}
      {(isCustom || advanced) && (
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="block text-xs font-semibold text-slate-600">Base URL</span>
            <input
              type="url"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="https://example.com/v1"
              value={aiConfig.baseUrl}
              onChange={(event) => editField('baseUrl', event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="block text-xs font-semibold text-slate-600">自定义模型 ID</span>
            <input
              type="text"
              autoCapitalize="none"
              spellCheck={false}
              value={aiConfig.model}
              onChange={(event) => editField('model', event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
      )}

      <button
        type="button"
        onClick={() => void testConnection()}
        disabled={testing}
        className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-bold text-indigo-700 transition active:scale-[0.98] disabled:opacity-60"
      >
        {testing ? '正在测试连接…' : '测试连接'}
      </button>
      {testResult && (
        <p role={testResult.success ? 'status' : 'alert'} className={`break-words text-xs ${testResult.success ? 'text-emerald-700' : 'text-rose-600'}`}>
          {testResult.text}
        </p>
      )}
    </section>
  );
}
