/** 将 Date 转为本地 YYYY-MM-DD */
export const toLocalDateStr = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** 将 YYYY-MM-DD 解析为本地 Date */
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/** 日期增减天数 */
export const addDays = (dateStr, delta) => {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + delta);
  return toLocalDateStr(d);
};

/** 计算两个 YYYY-MM-DD 之间相差的天数 (end - start) */
export const diffDays = (startStr, endStr) => {
  const a = parseLocalDate(startStr);
  const b = parseLocalDate(endStr);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
};

/** 格式化中文日期头部，例如 "11月25日 · 周三" */
export const formatChineseHeaderDate = (dateStr) => {
  const d = parseLocalDate(dateStr);
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 · ${weekDays[d.getDay()]}`;
};

/** 当前本地时间 HH:mm */
export const getCurrentTimeStr = (now = new Date()) => {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

/** 跨午夜睡眠时长计算（分钟） */
export const calcSleepMinutes = (bedtime, wakeTime) => {
  if (!bedtime || !wakeTime) return 0;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  const start = bh * 60 + bm;
  const end = wh * 60 + wm;
  return end >= start ? end - start : 1440 - start + end;
};

/** 格式化睡眠分钟为 "7h 40m" */
export const formatDurationShort = (totalMin) => {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/** 格式化睡眠分钟为 "7小时40分" */
export const formatDurationCN = (totalMin) => {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}分钟`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分`;
};

/** 轻量唯一 ID 生成器 */
export const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
