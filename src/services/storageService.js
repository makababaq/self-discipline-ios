import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { createAiCache, createSeedData, DATA_VERSION } from '../data/seedData.js';
import { DEFAULT_AI_CONFIG } from '../utils/aiService.js';
import { DEFAULT_PROFILE, GOAL_PRESETS } from '../utils/calorieCalc.js';
import { createTrainingPlan } from '../utils/trainingPlan.js';

export const STORAGE_KEY = 'discipline_ios_tracker_v2';

const isText = (value) => typeof value === 'string';
const isNonEmptyText = (value) => isText(value) && value.trim().length > 0;
const isNumber = Number.isFinite;
const isPositive = (value) => isNumber(value) && value > 0;
const isDate = (value) => isText(value) && /^\d{4,}-\d{2}-\d{2}$/.test(value);
const isBoolean = (value) => typeof value === 'boolean';
const isTextList = (value) => Array.isArray(value) && value.every(isText);
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const settingsFields = {
  cycleName: isText,
  cycleStartDate: isDate,
  cycleTotalDays: isNumber,
  cycleEndDate: isDate,
  targetWeightKg: isNumber,
  dailySleepGoalHours: isNumber
};

const profileFields = {
  gender: (value) => value === 'male' || value === 'female',
  height: isPositive,
  age: isPositive,
  referenceWeight: isPositive,
  activityLevel: (value) => value === 1.2 || value === 1.35,
  goalType: (value) => isText(value) && Object.prototype.hasOwnProperty.call(GOAL_PRESETS, value)
};

const datedLogFields = { id: isText, date: isDate };
const macroFields = { protein: isNumber, carbs: isNumber, fat: isNumber };
const collectionFields = {
  customFoods: {
    id: isText, name: isText, category: isText, kcalPer100g: isNumber,
    unitName: isText, unitGrams: isNumber, keywords: isText, ...macroFields
  },
  mealLogs: {
    ...datedLogFields, mealType: isText, foodId: isText, name: isText, grams: isNumber,
    portionText: isText, calories: isNumber, time: isText, ...macroFields
  },
  waterLogs: { ...datedLogFields, ml: isNumber, time: isText, label: isText },
  workoutLogs: {
    ...datedLogFields, category: isText, presetKey: isText, name: isText, durationMin: isNumber,
    intensity: isText, met: isNumber, caloriesBurned: isNumber, time: isText
  },
  sleepLogs: {
    ...datedLogFields, bedtime: isText, wakeTime: isText, durationMin: isNumber,
    isNap: isBoolean, quality: isNumber, tags: isTextList
  },
  weightLogs: { ...datedLogFields, weightKg: isNumber, tag: isText, time: isText }
};

function hasFields(value, fields) {
  return isObject(value) && Object.entries(fields).every(([key, check]) => check(value[key]));
}

function isTrainingPlan(value) {
  if (!isObject(value) || !Array.isArray(value.days) || value.days.length === 0 || !Number.isSafeInteger(value.offsetDays)) {
    return false;
  }
  return value.days.every((day) =>
    isObject(day) && isNonEmptyText(day.id) && Array.isArray(day.parts) && day.parts.length > 0 &&
    day.parts.every(isNonEmptyText) && new Set(day.parts).size === day.parts.length
  ) && new Set(value.days.map(({ id }) => id)).size === value.days.length;
}

function normalizeAiConfig(value) {
  const config = isObject(value) ? value : {};
  const apiKeysByProvider = isObject(config.apiKeysByProvider)
    ? Object.fromEntries(Object.entries(config.apiKeysByProvider).filter(([id, key]) => id.trim() && isText(key)))
    : {};

  return {
    enabled: config.enabled === true && isText(config.baseUrl) && isText(config.model),
    providerId: isNonEmptyText(config.providerId) ? config.providerId : DEFAULT_AI_CONFIG.providerId,
    baseUrl: isText(config.baseUrl) ? config.baseUrl : DEFAULT_AI_CONFIG.baseUrl,
    apiKey: isText(config.apiKey) ? config.apiKey : '',
    apiKeysByProvider,
    model: isText(config.model) ? config.model : DEFAULT_AI_CONFIG.model
  };
}

function normalizeAiCache(value) {
  const cache = createAiCache();
  const { dailyBrief, dailyQuote } = isObject(value) ? value : {};
  if (hasFields(dailyBrief, { date: isDate, fingerprint: isText, text: isText })) {
    cache.dailyBrief = { date: dailyBrief.date, fingerprint: dailyBrief.fingerprint, text: dailyBrief.text };
  }
  if (hasFields(dailyQuote, { date: isDate, text: isText })) {
    cache.dailyQuote = { date: dailyQuote.date, text: dailyQuote.text };
  }
  return cache;
}

function serializeBackup(data) {
  const { enabled, providerId, baseUrl, model } = normalizeAiConfig(data.aiConfig);
  return JSON.stringify({ ...data, aiConfig: { enabled, providerId, baseUrl, model }, aiCache: normalizeAiCache(data.aiCache) }, null, 2);
}

function decodeBackup(raw) {
  const data = JSON.parse(raw.replace(/^\uFEFF/, ''));
  if (!isObject(data) || ![2, 3, 4, DATA_VERSION].includes(data.version) || !hasFields(data.settings, settingsFields)) {
    throw new Error('备份缺少有效的版本或设置');
  }

  for (const [key, fields] of Object.entries(collectionFields)) {
    if (!Array.isArray(data[key]) || !data[key].every((entry) => hasFields(entry, fields))) {
      throw new Error(`备份记录无效 (${key})`);
    }
  }

  let settings = data.settings;
  if (data.version === 2) {
    const { currentWeightKg, dailyCalorieGoal, dailyWaterGoalMl, ...retainedSettings } = settings;
    settings = {
      ...retainedSettings,
      profile: {
        ...DEFAULT_PROFILE,
        referenceWeight: isPositive(currentWeightKg) ? currentWeightKg : DEFAULT_PROFILE.referenceWeight
      }
    };
  } else if (!hasFields(settings.profile, profileFields)) {
    throw new Error('备份缺少有效的个人资料');
  }

  const trainingPlan = data.version < 4 && data.trainingPlan === undefined
    ? createTrainingPlan()
    : data.trainingPlan;
  if (!isTrainingPlan(trainingPlan)) throw new Error('备份缺少有效的训练安排');

  return {
    data: {
      ...data,
      version: DATA_VERSION,
      settings,
      trainingPlan,
      aiConfig: normalizeAiConfig(data.aiConfig),
      aiCache: normalizeAiCache(data.aiCache)
    },
    migrated: data.version !== DATA_VERSION
  };
}

// Serialize hydration and saves so late native callbacks cannot overwrite newer records.
let pendingPersistence = Promise.resolve();

function queuePersistence(action) {
  const operation = pendingPersistence.then(action);
  pendingPersistence = operation.catch(() => {});
  return operation;
}

async function writeRaw(value) {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key: STORAGE_KEY, value });
  } else {
    window.localStorage.setItem(STORAGE_KEY, value);
  }
}

async function loadStored(raw, fromLegacyWebView = false) {
  const { data, migrated } = decodeBackup(raw);
  if (migrated || fromLegacyWebView) await writeRaw(JSON.stringify(data));
  return data;
}

export async function initNativeUI() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: Style.Light });
  } catch {
    // Status bar customization is optional on platforms that do not expose it.
  }
}

export const storageService = {
  parseBackup(raw, localData) {
    const { data } = decodeBackup(raw);
    // Keep the entire local connection together. A backup can contain a different endpoint.
    const aiConfig = localData
      ? normalizeAiConfig(localData.aiConfig)
      : { ...data.aiConfig, enabled: false, apiKey: '', apiKeysByProvider: {} };
    const aiCache = createAiCache();
    aiCache.dailyQuote = localData ? normalizeAiCache(localData.aiCache).dailyQuote : data.aiCache.dailyQuote;
    return { ...data, aiConfig, aiCache };
  },

  loadAsync() {
    return queuePersistence(async () => {
      if (Capacitor.isNativePlatform()) {
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        if (value !== null) return loadStored(value);

        // An earlier build may have saved to this app's WKWebView origin.
        let legacy = null;
        try {
          legacy = window.localStorage.getItem(STORAGE_KEY);
        } catch (error) {
          if (error?.name !== 'SecurityError') throw error;
        }
        if (legacy !== null) return loadStored(legacy, true);
      } else {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw !== null) return loadStored(raw);
      }

      const seed = createSeedData();
      await writeRaw(JSON.stringify(seed));
      return seed;
    });
  },

  async saveAsync(data) {
    const value = JSON.stringify(data);
    return queuePersistence(() => writeRaw(value));
  },

  async copyBackup(data) {
    const json = serializeBackup(data);
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(json);
        return;
      } catch {
        // Try selection-based copy when the context blocks async clipboard access.
      }
    }

    const previouslyFocused = document.activeElement;
    const field = document.createElement('textarea');
    field.value = json;
    field.readOnly = true;
    field.style.cssText = 'position: fixed; top: 0; left: 0; opacity: 0; pointer-events: none;';
    document.body.appendChild(field);

    try {
      field.focus({ preventScroll: true });
      field.select();
      field.setSelectionRange(0, json.length);
      if (!document.execCommand('copy')) throw new Error('无法复制 JSON 备份');
    } finally {
      field.remove();
      previouslyFocused?.focus({ preventScroll: true });
    }
  },

  async exportBackup(data, dateStr) {
    const fileName = `self-discipline-backup-${dateStr}.json`;
    const json = serializeBackup(data);
    if (Capacitor.isNativePlatform()) {
      const { uri } = await Filesystem.writeFile({
        path: fileName,
        data: json,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });
      await Share.share({ title: '自律日记本地数据备份', files: [uri] });
      return 'shared';
    }

    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    try {
      document.body.appendChild(anchor);
      anchor.click();
    } finally {
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    return 'downloaded';
  }
};
