import { CycleSettingsCard } from '../components/CycleSettingsCard.jsx';
import { TrainingPlanCard } from '../components/TrainingPlanCard.jsx';

export function PlanningPage({ settings, todayStr, trainingPlan, onUpdateSettings, onUpdateTrainingPlan, showToast }) {
  return (
    <div className="px-4 pt-3 pb-6 space-y-4">
      <header className="pt-1">
        <h1 className="text-[21px] font-bold tracking-tight text-slate-900">规划</h1>
      </header>
      <CycleSettingsCard
        settings={settings}
        todayStr={todayStr}
        onUpdateSettings={onUpdateSettings}
        showToast={showToast}
      />
      <TrainingPlanCard
        trainingPlan={trainingPlan}
        cycleStartDate={settings.cycleStartDate}
        todayStr={todayStr}
        onUpdateTrainingPlan={onUpdateTrainingPlan}
      />
    </div>
  );
}
