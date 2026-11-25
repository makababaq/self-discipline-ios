import { useMemo } from 'react';
import { X } from 'lucide-react';
import { prepareWeightTrend } from '../utils/weightTrend.js';

/** 概况页净热量环形进度图 */
export const CalorieRing = ({ net, goal }) => {
  const size = 108;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeGoal = Math.max(goal, 1);
  const progress = Math.max(0, Math.min(net / safeGoal, 1));
  const offset = circumference * (1 - progress);
  const remaining = safeGoal - net;
  const isOver = remaining < 0;
  const strokeColor = isOver ? '#F43F5E' : net / safeGoal > 0.88 ? '#F59E0B' : '#F97316';

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#FFF1E6" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        <span className="text-[10px] font-medium text-slate-400">{isOver ? '已超出' : '还可摄入'}</span>
        <span
          className={`text-[18px] font-extrabold tabular-nums leading-tight mt-0.5 ${
            isOver ? 'text-rose-500' : 'text-slate-900'
          }`}
        >
          {Math.abs(remaining)}
        </span>
        <span className="text-[9px] font-medium text-slate-400">kcal</span>
      </div>
    </div>
  );
};

function smoothWeightPath(points) {
  return points.map(({ x, y }, index) => {
    if (index === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    const previous = points[index - 1];
    const midX = ((previous.x + x) / 2).toFixed(1);
    return `C ${midX} ${previous.y.toFixed(1)} ${midX} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

/** 体重趋势响应式 SVG 折线图 */
export const WeightSparkline = ({ logs, targetWeight }) => {
  const sorted = useMemo(() => prepareWeightTrend(logs).slice(-10), [logs]);

  if (sorted.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
        记录体重后将自动生成趋势曲线
      </div>
    );
  }

  const width = 320;
  const height = 118;
  const padX = 18;
  const padY = 20;

  const vals = sorted.flatMap(({ weightKg, averageKg }) => [weightKg, averageKg]);
  const bounds = targetWeight ? [...vals, targetWeight] : vals;
  const minV = Math.min(...bounds) - 0.5;
  const maxV = Math.max(...bounds) + 0.5;
  const span = Math.max(maxV - minV, 1);

  const getX = (i) => (sorted.length === 1 ? width / 2 : padX + (i / (sorted.length - 1)) * (width - padX * 2));
  const getY = (v) => height - padY - ((v - minV) / span) * (height - padY * 2);

  const pts = sorted.map((item, idx) => ({
    x: getX(idx),
    y: getY(item.weightKg),
    averageY: getY(item.averageKg),
    val: item.weightKg,
    label: item.date.slice(5)
  }));

  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const averageD = pts.length > 1 ? smoothWeightPath(pts.map(({ x, averageY }) => ({ x, y: averageY }))) : '';
  const areaD =
    pts.length > 1
      ? `${lineD} L ${pts[pts.length - 1].x.toFixed(1)} ${height - 8} L ${pts[0].x.toFixed(1)} ${height - 8} Z`
      : '';
  const targetY = targetWeight ? getY(targetWeight) : null;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 text-[10px] text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span aria-hidden="true" className={pts.length > 1 ? 'w-3.5 border-t-2 border-indigo-500' : 'h-1.5 w-1.5 rounded-full bg-indigo-500'} />
          每日体重
        </span>
        {averageD && (
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="w-3.5 border-t-2 border-dashed border-slate-500" />
            7日均值
          </span>
        )}
        <span className="ml-auto font-semibold tabular-nums">7日均重 {sorted[sorted.length - 1].averageKg.toFixed(1)} kg</span>
      </div>
      <svg role="img" aria-label="体重趋势" viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
        <defs>
          <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {targetY !== null && (
          <g>
            <line
              x1={padX}
              y1={targetY}
              x2={width - padX}
              y2={targetY}
              stroke="#A5B4FC"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <text
              x={width - padX}
              y={Math.max(12, targetY - 5)}
              textAnchor="end"
              className="fill-indigo-400 text-[9px] font-semibold tabular-nums"
            >
              目标 {targetWeight.toFixed(1)}kg
            </text>
          </g>
        )}

        {areaD && <path d={areaD} fill="url(#weightFill)" />}
        {pts.length > 1 && (
          <path d={lineD} fill="none" stroke="#6366F1" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {averageD && (
          <path d={averageD} fill="none" stroke="#64748B" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
        )}

        {pts.map((p, i) => {
          const isFirst = i === 0;
          const isLast = i === pts.length - 1;
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isLast ? 4.5 : 3}
                fill={isLast ? '#6366F1' : '#FFFFFF'}
                stroke="#6366F1"
                strokeWidth="2"
              />
              {(isFirst || isLast) && (
                <text
                  x={p.x}
                  y={p.y - 9}
                  textAnchor={isFirst && !isLast ? 'start' : isLast && !isFirst ? 'end' : 'middle'}
                  className="fill-slate-700 text-[10px] font-bold tabular-nums"
                >
                  {p.val.toFixed(1)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className={`flex px-3 text-[10px] text-slate-400 tabular-nums -mt-1 ${pts.length > 1 ? 'justify-between' : 'justify-center'}`}>
        <span>{pts[0].label}</span>
        {pts.length > 2 && <span>近 {pts.length} 次趋势</span>}
        {pts.length > 1 && <span>{pts[pts.length - 1].label}</span>}
      </div>
    </div>
  );
};

/** 贴合 iPhone 视口的 iOS BottomSheet 弹窗 */
export const BottomSheet = ({
  open, onClose, title, subtitle, children, bodyClassName = 'px-5 py-4 pb-8',
  layerClassName = 'z-50', inactive = false
}) => {
  if (!open) return null;
  return (
    <div
      className={`absolute inset-0 flex flex-col justify-end ${layerClassName}`}
      inert={inactive ? '' : undefined}
      aria-hidden={inactive || undefined}
      style={{
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fadeIn" onClick={onClose} />
      <div
        className="relative z-10 bg-white rounded-t-[28px] shadow-2xl flex flex-col animate-slideUp overflow-hidden"
        role="dialog"
        aria-modal={inactive ? undefined : true}
        aria-label={title}
        style={{
          maxHeight: 'min(89%, calc(100% - env(safe-area-inset-top, 0px) - 8px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100 shrink-0">
          <div className="min-w-0 pr-2">
            <h3 className="text-[16px] font-bold text-slate-900 truncate">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 active:scale-95 transition shrink-0"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className={`min-h-0 overflow-y-auto overscroll-none no-scrollbar flex-1 ${bodyClassName}`}>{children}</div>
      </div>
    </div>
  );
};
