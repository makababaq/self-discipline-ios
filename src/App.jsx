import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardList, LayoutGrid, Settings } from 'lucide-react';
import { BottomSheet } from './components/CommonUI.jsx';
import { AddFoodBottomSheet, AddWorkoutBottomSheet, CustomFoodBottomSheet, ImportJsonSheet } from './components/Modals.jsx';
import { BUILTIN_FOODS } from './data/foodCatalog.js';
import { createSeedData } from './data/seedData.js';
import { OverviewPage } from './pages/OverviewPage.jsx';
import { RecordPage } from './pages/RecordPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { initNativeUI, storageService, triggerLightHaptic } from './services/storageService.js';
import { diffDays, formatDurationShort, getCurrentTimeStr, toLocalDateStr, uid } from './utils/dateAndCalc.js';

export default function App() {
  const [initialData, setInitialData] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const loadData = useCallback(async () => {
    setLoadFailed(false);
    try {
      setInitialData(await storageService.loadAsync());
    } catch (error) {
      console.error('本地数据读取失败', error);
      setLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    void loadData();
    void initNativeUI();
  }, [loadData]);

  return initialData ? (
    <Tracker initialData={initialData} />
  ) : (
    <div className="app-viewport flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-600">
      <p role={loadFailed ? 'alert' : 'status'}>{loadFailed ? '无法读取本地数据，请重试。' : '正在读取本地数据…'}</p>
      {loadFailed && (
        <button className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white" onClick={loadData}>
          重新读取
        </button>
      )}
    </div>
  );
}

function Tracker({ initialData }) {
  const [data, setData] = useState(initialData);
  const [todayStr, setTodayStr] = useState(toLocalDateStr);

  // 三大核心 Tab 与记录子页签
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'record' | 'settings'
  const [recordSubTab, setRecordSubTab] = useState('meals'); // 'meals' | 'water' | 'workout' | 'sleepWeight'
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [toast, setToast] = useState(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saveAttempt, setSaveAttempt] = useState(0);
  const lastSaved = useRef(initialData);

  // 各类底部弹窗开关
  const [foodSheetMeal, setFoodSheetMeal] = useState(null);
  const [workoutSheetType, setWorkoutSheetType] = useState(null);
  const [showCustomFoodSheet, setShowCustomFoodSheet] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    if (lastSaved.current === data) return;

    let active = true;
    storageService.saveAsync(data).then(
      () => {
        if (!active) return;
        lastSaved.current = data;
        setSaveFailed(false);
      },
      (error) => {
        if (!active) return;
        console.error('本地数据保存失败', error);
        setSaveFailed(true);
      }
    );
    return () => { active = false; };
  }, [data, saveAttempt]);

  useEffect(() => {
    let timer;
    const refreshToday = () => {
      const now = new Date();
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const today = toLocalDateStr(now);
      setTodayStr(today);
      clearTimeout(timer);
      timer = setTimeout(refreshToday, nextDay - now);
    };
    refreshToday();
    document.addEventListener('visibilitychange', refreshToday);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', refreshToday);
    };
  }, []);

  // 轻提示控制器
  const toastRef = useRef(null);
  useEffect(() => () => clearTimeout(toastRef.current), []);
  const showToast = (message, type = 'success') => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ message, type });
    toastRef.current = setTimeout(() => setToast(null), 2200);
  };

  // 合并内置 113 种食物与自定义食物
  const allFoods = useMemo(() => {
    const customMarked = data.customFoods.map((f) => ({ ...f, isCustom: true }));
    return [...customMarked, ...BUILTIN_FOODS];
  }, [data.customFoods]);

  // 概况页派生统计
  const overviewStats = useMemo(() => {
    const { settings, mealLogs, waterLogs, workoutLogs, sleepLogs, weightLogs } = data;

    // 1. 自律倒计时
    const totalDays = Math.max(1, diffDays(settings.cycleStartDate, settings.cycleEndDate) + 1);
    const rawElapsed = diffDays(settings.cycleStartDate, todayStr) + 1;
    const elapsedDays = Math.max(0, Math.min(totalDays, rawElapsed));
    const remainingDays = Math.max(0, diffDays(todayStr, settings.cycleEndDate));
    const cyclePercent = Math.round((elapsedDays / totalDays) * 100);

    // 2. 今日净热量
    const todayIntake = mealLogs.filter((m) => m.date === todayStr).reduce((s, m) => s + m.calories, 0);
    const todayBurned = workoutLogs.filter((w) => w.date === todayStr).reduce((s, w) => s + w.caloriesBurned, 0);
    const netCalories = todayIntake - todayBurned;

    // 3. 今日饮水
    const todayWater = waterLogs.filter((w) => w.date === todayStr).reduce((s, w) => s + w.ml, 0);
    const waterPercent = Math.min(100, Math.round((todayWater / Math.max(1, settings.dailyWaterGoalMl)) * 100));

    // 4. 上一日睡眠（优先取今日起床主睡眠，否则取最近一次主睡眠）
    const mainSleeps = sleepLogs.filter((s) => !s.isNap);
    const lastSleep =
      mainSleeps.find((s) => s.date === todayStr) ||
      [...mainSleeps].sort((a, b) => b.date.localeCompare(a.date))[0] ||
      null;

    // 5. 最新体重与较前一次变化值 delta
    const sortedWeights = [...weightLogs].sort((a, b) => b.date.localeCompare(a.date));
    const latestWeight = sortedWeights[0]?.weightKg ?? settings.currentWeightKg;
    const prevWeight = sortedWeights[1]?.weightKg ?? latestWeight;
    const weightDelta = Number((latestWeight - prevWeight).toFixed(1));

    return {
      totalDays,
      elapsedDays,
      remainingDays,
      cyclePercent,
      todayIntake,
      todayBurned,
      netCalories,
      todayWater,
      waterPercent,
      lastSleep,
      latestWeight,
      weightDelta
    };
  }, [data, todayStr]);

  // 快捷页面跳转
  const jumpToRecord = (subTab, date = todayStr) => {
    setSelectedDate(date);
    setRecordSubTab(subTab);
    setActiveTab('record');
  };

  // ---- CRUD 操作 ----
  const addWaterLog = (ml, label = '饮水记录', targetDate = selectedDate) => {
    const val = parseInt(ml, 10);
    if (!val || val <= 0) return;
    setData((prev) => ({
      ...prev,
      waterLogs: [{ id: uid('w'), date: targetDate, ml: val, time: getCurrentTimeStr(), label }, ...prev.waterLogs]
    }));
    void triggerLightHaptic();
    showToast(`已记录饮水 +${val}ml`);
  };

  const deleteWaterLog = (id) => {
    setData((prev) => ({ ...prev, waterLogs: prev.waterLogs.filter((w) => w.id !== id) }));
    showToast('已删除饮水记录');
  };

  const addMealLog = (entry) => {
    setData((prev) => ({ ...prev, mealLogs: [...prev.mealLogs, { ...entry, id: uid('m') }] }));
    void triggerLightHaptic();
    showToast(`已添加 ${entry.name} (${entry.calories} kcal)`);
  };

  const deleteMealLog = (id) => {
    setData((prev) => ({ ...prev, mealLogs: prev.mealLogs.filter((m) => m.id !== id) }));
    showToast('已移除饮食记录');
  };

  const addWorkoutLog = (entry) => {
    setData((prev) => ({ ...prev, workoutLogs: [{ ...entry, id: uid('wk') }, ...prev.workoutLogs] }));
    showToast(`已记录 ${entry.name} (-${entry.caloriesBurned} kcal)`);
  };

  const deleteWorkoutLog = (id) => {
    setData((prev) => ({ ...prev, workoutLogs: prev.workoutLogs.filter((w) => w.id !== id) }));
    showToast('已删除训练记录');
  };

  const saveSleepLog = (entry) => {
    setData((prev) => {
      // 同日同类型主睡眠去重覆盖，午睡允许并存
      const rest = entry.isNap
        ? prev.sleepLogs
        : prev.sleepLogs.filter((s) => !(s.date === entry.date && !s.isNap));
      return { ...prev, sleepLogs: [{ ...entry, id: uid('sl') }, ...rest] };
    });
    showToast(`已保存睡眠 ${formatDurationShort(entry.durationMin)}`);
  };

  const deleteSleepLog = (id) => {
    setData((prev) => ({ ...prev, sleepLogs: prev.sleepLogs.filter((s) => s.id !== id) }));
    showToast('已删除睡眠记录');
  };

  const saveWeightLog = (weightVal, tag) => {
    const val = Number(parseFloat(weightVal).toFixed(1));
    if (isNaN(val) || val < 25 || val > 250) {
      showToast('请输入有效体重 (25~250 kg)', 'error');
      return;
    }
    setData((prev) => {
      const rest = prev.weightLogs.filter((w) => w.date !== selectedDate);
      const nextLogs = [
        ...rest,
        { id: uid('wt'), date: selectedDate, weightKg: val, tag, time: getCurrentTimeStr() }
      ];
      const latest = [...nextLogs].sort((a, b) => b.date.localeCompare(a.date))[0];
      return {
        ...prev,
        weightLogs: nextLogs,
        settings: { ...prev.settings, currentWeightKg: latest ? latest.weightKg : val }
      };
    });
    showToast(`已记录体重 ${val.toFixed(1)} kg`);
  };

  const deleteWeightLog = (id) => {
    setData((prev) => ({ ...prev, weightLogs: prev.weightLogs.filter((w) => w.id !== id) }));
    showToast('已删除体重记录');
  };

  const addCustomFood = (food) => {
    const created = { ...food, id: uid('cf'), isCustom: true };
    setData((prev) => ({ ...prev, customFoods: [created, ...prev.customFoods] }));
    showToast(`已新增自定义食物「${created.name}」`);
    return created;
  };

  const deleteCustomFood = (id) => {
    setData((prev) => ({ ...prev, customFoods: prev.customFoods.filter((f) => f.id !== id) }));
    showToast('已删除自定义食物');
  };

  const updateSettings = (patch) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  };

  // ---- JSON 导入/导出/复制/重置 ----
  const handleDownloadJSON = async () => {
    try {
      const result = await storageService.exportBackup(data, todayStr);
      if (result === 'downloaded') showToast('已下载 JSON 备份文件');
    } catch (error) {
      if (error?.message === 'Share canceled') return;
      console.error('JSON 备份导出失败', error);
      showToast('无法导出 JSON 备份，可尝试复制备份', 'error');
    }
  };

  const handleCopyJSON = async () => {
    try {
      await storageService.copyBackup(data);
      showToast('已复制 JSON 备份到剪贴板');
    } catch {
      showToast('当前环境不支持剪贴板复制', 'error');
    }
  };

  const handleImportJSON = (raw) => {
    try {
      setData(storageService.parseBackup(raw));
      setShowImportModal(false);
      showToast('本地数据恢复成功');
    } catch {
      showToast('JSON 格式有误，请检查备份内容', 'error');
    }
  };

  const handleReset = () => {
    setData(createSeedData());
    setSelectedDate(todayStr);
    setShowResetModal(false);
    showToast('已恢复初始设置并清空记录');
  };

  return (
    <div className="app-viewport relative flex h-full w-full flex-col overflow-hidden bg-[#F7F8FA] text-slate-900 select-none">
      {/* 顶部浮动轻提示 Toast */}
      {toast && (
        <div role="status" className="app-toast absolute left-1/2 -translate-x-1/2 z-[60] pointer-events-none w-[86%] max-w-[330px] flex justify-center">
          <div
            className={`px-4 py-2.5 rounded-full shadow-lg backdrop-blur-xl flex items-center gap-2 text-[12px] font-semibold border animate-fadeIn ${
              toast.type === 'error'
                ? 'bg-rose-600/95 text-white border-rose-400/30'
                : 'bg-slate-900/90 text-white border-white/10'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-200" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span className="truncate">{toast.message}</span>
          </div>
        </div>
      )}

      {saveFailed && (
        <div role="alert" className="flex shrink-0 items-center justify-between gap-2 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-800">
          <span>记录尚未保存，请在退出前重试。</span>
          <button className="shrink-0 rounded-lg bg-rose-100 px-3 py-2 font-semibold" onClick={() => setSaveAttempt((attempt) => attempt + 1)}>
            重试保存
          </button>
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-none no-scrollbar pb-4">
        {activeTab === 'overview' && (
          <OverviewPage
            todayStr={todayStr}
            settings={data.settings}
            stats={overviewStats}
            onQuickWater={(ml) => addWaterLog(ml, `快捷饮水 +${ml}ml`, todayStr)}
            onJumpRecord={jumpToRecord}
            onJumpSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'record' && (
          <RecordPage
            todayStr={todayStr}
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            subTab={recordSubTab}
            onChangeSubTab={setRecordSubTab}
            data={data}
            onOpenFoodSheet={(mealType) => setFoodSheetMeal(mealType)}
            onDeleteMeal={deleteMealLog}
            onAddWater={(ml, label) => addWaterLog(ml, label, selectedDate)}
            onDeleteWater={deleteWaterLog}
            onOpenWorkoutSheet={(type) => setWorkoutSheetType(type)}
            onDeleteWorkout={deleteWorkoutLog}
            onSaveSleep={saveSleepLog}
            onDeleteSleep={deleteSleepLog}
            onSaveWeight={saveWeightLog}
            onDeleteWeight={deleteWeightLog}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            settings={data.settings}
            todayStr={todayStr}
            customFoods={data.customFoods}
            builtinCount={BUILTIN_FOODS.length}
            onUpdateSettings={updateSettings}
            onOpenAddFood={() => setShowCustomFoodSheet(true)}
            onDeleteCustomFood={deleteCustomFood}
            onDownloadJSON={handleDownloadJSON}
            onCopyJSON={handleCopyJSON}
            onOpenImport={() => setShowImportModal(true)}
            onOpenReset={() => setShowResetModal(true)}
            showToast={showToast}
          />
        )}
      </main>

      {/* 底部 3-Tab iOS 毛玻璃导航栏 */}
      <nav
        aria-label="主导航"
        className="app-navigation shrink-0 z-30 bg-white/[0.88] backdrop-blur-xl border-t border-slate-200/70"
      >
        <div className="grid grid-cols-3 px-4 pt-2 pb-1">
          {[
            { id: 'overview', label: '概况', icon: LayoutGrid },
            { id: 'record', label: '记录', icon: ClipboardList },
            { id: 'settings', label: '设置', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (!active) void triggerLightHaptic();
                }}
                className="flex flex-col items-center justify-center py-0.5 gap-1 active:scale-95 transition-transform"
              >
                <div
                  className={`px-4 py-1 rounded-full transition-colors ${
                    active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-[19px] h-[19px] stroke-[2.1]" />
                </div>
                <span className={`text-[10px] font-semibold ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ==== 弹窗 1：113+ 常见食物搜索 + 克数/份量双模式换算 ==== */}
      <AddFoodBottomSheet
        open={Boolean(foodSheetMeal)}
        mealType={foodSheetMeal}
        selectedDate={selectedDate}
        allFoods={allFoods}
        onClose={() => setFoodSheetMeal(null)}
        onAddMeal={(entry) => {
          addMealLog(entry);
          setFoodSheetMeal(null);
        }}
        onOpenCreateCustom={() => {
          setFoodSheetMeal(null);
          setShowCustomFoodSheet(true);
        }}
      />

      {/* ==== 弹窗 2：有氧/无氧训练 MET 计算 ==== */}
      <AddWorkoutBottomSheet
        open={Boolean(workoutSheetType)}
        initialType={workoutSheetType || 'cardio'}
        selectedDate={selectedDate}
        currentWeightKg={data.settings.currentWeightKg}
        onClose={() => setWorkoutSheetType(null)}
        onAddWorkout={(entry) => {
          addWorkoutLog(entry);
          setWorkoutSheetType(null);
        }}
      />

      {/* ==== 弹窗 3：自定义食物新增 ==== */}
      <CustomFoodBottomSheet
        open={showCustomFoodSheet}
        onClose={() => setShowCustomFoodSheet(false)}
        onSave={(food) => {
          addCustomFood(food);
          setShowCustomFoodSheet(false);
        }}
      />

      {/* ==== 弹窗 4：JSON 备份恢复 ==== */}
      <ImportJsonSheet
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportJSON}
      />

      {/* 重置本地数据确认 */}
      <BottomSheet
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="重置本地数据？"
        subtitle="清空全部记录与自定义食物，并恢复初始目标设置"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-slate-600 leading-relaxed bg-rose-50/70 border border-rose-100 rounded-2xl p-3.5">
            重置操作仅影响本设备本地存储。如果您已经录入了真实健康数据，建议先点击「导出 JSON 备份」妥善保存。
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowResetModal(false)}
              className="py-3 rounded-2xl bg-slate-100 text-slate-700 text-sm font-semibold active:scale-[0.98] transition"
            >
              取消
            </button>
            <button
              onClick={handleReset}
              className="py-3 rounded-2xl bg-rose-600 text-white text-sm font-semibold shadow-sm active:scale-[0.98] transition"
            >
              确认重置
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
