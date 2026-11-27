import { CycleSettingsCard } from '../components/CycleSettingsCard.jsx';
import { DisciplineProgressCard } from '../components/DisciplineProgressCard.jsx';
import { TrainingPlanCard } from '../components/TrainingPlanCard.jsx';

export function PlanningPage({ data, settings, targets, todayStr, trainingPlan, dailyQuote, onUpdateSettings, onUpdateTrainingPlan, showToast }) {
  return (
    <div className="px-4 pt-3 pb-6 space-y-4">
      <header className="pt-1">
        <h1 className="text-[21px] font-bold tracking-tight text-slate-900">规划</h1>
      </header>
      {dailyQuote && (
        <figure className="px-3 py-3.5">
          <figcaption className="mb-1.5 text-[11px] font-medium text-slate-500">每日鼓励</figcaption>
          <blockquote className="break-words text-sm leading-relaxed text-slate-700">{dailyQuote}</blockquote>
        </figure>
      )}
      <DisciplineProgressCard data={data} targets={targets} todayStr={todayStr} />
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
