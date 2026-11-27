import { useEffect, useRef, useState } from 'react';
import { fetchDailyBrief, fetchDailyQuote } from '../utils/aiService.js';
import { toLocalDateStr } from '../utils/dateAndCalc.js';
import { getDisciplineProgress } from '../utils/disciplineProgress.js';

export function useDailyAi({ data, todayStr, targets, stats, trainingToday, activeTab, setData }) {
  const { aiConfig, aiCache, settings } = data;
  const { dailyBrief, dailyQuote } = aiCache;
  const { todayIntake, todayBurned, netCalories, todayMeals, todayMacros, sleepMinutes } = stats;
  const visible = aiConfig.enabled && Boolean(aiConfig.apiKey.trim());
  const configured = visible && Boolean(aiConfig.baseUrl.trim() && aiConfig.model.trim());
  const hasBriefData = todayMeals.length > 0 || sleepMinutes > 0;
  const fingerprint = `${todayStr}|${todayIntake}|${todayMeals.length}|${Math.round(todayMacros.protein)}|${sleepMinutes}`;
  const cachedBrief = dailyBrief.date === todayStr && dailyBrief.fingerprint === fingerprint ? dailyBrief.text : '';

  const [briefLoading, setBriefLoading] = useState(false);
  const [briefFailed, setBriefFailed] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const refreshRequested = useRef(false);
  const briefContext = useRef(null);
  const quoteAttemptDate = useRef('');

  useEffect(() => {
    briefContext.current = {
      goalLabel: targets.goalLabel,
      targetCalories: targets.targetCalories,
      intakeKcal: todayIntake,
      burnedKcal: todayBurned,
      netKcal: netCalories,
      protein: Math.round(todayMacros.protein),
      carbs: Math.round(todayMacros.carbs),
      fat: Math.round(todayMacros.fat),
      targetProtein: targets.macros.protein,
      targetCarbs: targets.macros.carbs,
      targetFat: targets.macros.fat,
      sleepHours: Number((sleepMinutes / 60).toFixed(1)),
      targetSleep: settings.dailySleepGoalHours
    };
  }, [targets, todayIntake, todayBurned, netCalories, todayMacros, sleepMinutes, settings.dailySleepGoalHours]);

  useEffect(() => {
    const manual = refreshRequested.current;
    refreshRequested.current = false;
    setBriefFailed(false);
    if (!configured || !hasBriefData || (cachedBrief && !manual)) {
      setBriefLoading(false);
      return;
    }

    let active = true;
    setBriefLoading(true);
    const timer = setTimeout(async () => {
      try {
        const text = await fetchDailyBrief(aiConfig, briefContext.current);
        if (!active || toLocalDateStr() !== todayStr) return;
        setData((previous) => previous.aiConfig === aiConfig ? {
          ...previous,
          aiCache: { ...previous.aiCache, dailyBrief: { date: todayStr, fingerprint, text } }
        } : previous);
      } catch {
        if (active) setBriefFailed(true);
      } finally {
        if (active) setBriefLoading(false);
      }
    }, manual ? 0 : 1500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [aiConfig, configured, hasBriefData, cachedBrief, todayStr, fingerprint, refreshCount, setData]);

  useEffect(() => {
    if (activeTab !== 'planning' || !configured || dailyQuote.date === todayStr || quoteAttemptDate.current === todayStr) return;

    const { streak } = getDisciplineProgress(data, targets, todayStr);
    const todayTrainingText = trainingToday.day?.parts.join(' · ') || '周期尚未开始';
    // Reserve today's cache entry before starting the request, including when the provider fails.
    quoteAttemptDate.current = todayStr;
    setData((previous) => ({
      ...previous,
      aiCache: { ...previous.aiCache, dailyQuote: { date: todayStr, text: '' } }
    }));
    fetchDailyQuote(aiConfig, {
      planName: settings.cycleName || '自律计划',
      currentDay: stats.elapsedDays,
      totalDays: stats.totalDays,
      goalLabel: targets.goalLabel,
      todayTrainingText,
      streakDays: streak
    }).then((text) => {
      if (toLocalDateStr() !== todayStr) return;
      setData((previous) => (previous.aiConfig === aiConfig && previous.aiCache.dailyQuote.date === todayStr) ? {
        ...previous,
        aiCache: { ...previous.aiCache, dailyQuote: { date: todayStr, text } }
      } : previous);
    }).catch(() => {});
  }, [activeTab, aiConfig, configured, dailyQuote.date, data, settings.cycleName, stats.elapsedDays, stats.totalDays, todayStr, trainingToday, targets, setData]);

  return {
    brief: visible ? {
      hasData: hasBriefData,
      text: cachedBrief,
      loading: briefLoading,
      failed: briefFailed,
      canRefresh: configured && hasBriefData,
      onRefresh: () => {
        refreshRequested.current = true;
        setRefreshCount((count) => count + 1);
      }
    } : null,
    quote: visible && dailyQuote.date === todayStr ? dailyQuote.text : ''
  };
}
