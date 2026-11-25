export const WORKOUT_PRESETS = {
  cardio: [
    { key: 'running', name: '跑步', desc: '操场 / 跑步机慢跑或节奏跑', met: { low: 6.5, medium: 8.3, high: 10.5 } },
    { key: 'brisk_walk', name: '快走', desc: '5-6.5 km/h 健步走', met: { low: 3.3, medium: 4.3, high: 5.3 } },
    { key: 'incline_walk', name: '爬坡走', desc: '坡度 8-12 燃脂爬坡', met: { low: 5.0, medium: 6.5, high: 8.2 } },
    { key: 'jump_rope', name: '跳绳', desc: '高效有氧燃脂跳绳', met: { low: 8.0, medium: 10.0, high: 12.3 } },
    { key: 'cycling', name: '室内单车/骑行', desc: '动感单车或户外骑行', met: { low: 4.8, medium: 7.0, high: 9.8 } },
    { key: 'swimming', name: '游泳', desc: '蛙泳 / 自由泳持续游', met: { low: 5.8, medium: 7.5, high: 9.8 } },
    { key: 'elliptical', name: '椭圆机', desc: '低冲击全身协调有氧', met: { low: 4.5, medium: 5.8, high: 7.5 } },
    { key: 'rowing', name: '划船机', desc: '全身动员高燃划船', met: { low: 4.8, medium: 7.0, high: 8.8 } },
    { key: 'hiit', name: 'HIIT燃脂', desc: '高强度间歇心肺训练', met: { low: 6.5, medium: 8.5, high: 10.5 } },
    { key: 'badminton', name: '羽毛球', desc: '单双打实战球类运动', met: { low: 4.5, medium: 6.0, high: 7.5 } },
    { key: 'pamela', name: '帕梅拉有氧操', desc: '居家无器械跟练有氧', met: { low: 5.0, medium: 6.8, high: 8.5 } }
  ],
  anaerobic: [
    { key: 'machines', name: '综合器械力量', desc: '健身房固定器械抗阻', met: { low: 3.5, medium: 5.0, high: 6.5 } },
    { key: 'dumbbell', name: '哑铃塑形', desc: '自由重量全身塑形', met: { low: 3.8, medium: 5.2, high: 6.8 } },
    { key: 'core', name: '徒手核心/腹肌', desc: '卷腹 / 平板支撑专项', met: { low: 3.0, medium: 4.0, high: 5.2 } },
    { key: 'lower_body', name: '下肢大肌群(深蹲/硬拉)', desc: '臀腿高消耗复合动作', met: { low: 4.5, medium: 6.0, high: 7.5 } },
    { key: 'upper_body', name: '上肢推拉训练', desc: '胸背肩臂分化训练', met: { low: 3.5, medium: 4.8, high: 6.2 } },
    { key: 'pilates', name: '普拉提', desc: '体态控制与核心稳定', met: { low: 2.8, medium: 3.8, high: 4.8 } },
    { key: 'band', name: '弹力带训练', desc: '居家低门槛抗阻塑形', met: { low: 3.0, medium: 4.2, high: 5.5 } }
  ]
};

export const INTENSITY_OPTIONS = [
  { key: 'low', label: '低强度', short: '低' },
  { key: 'medium', label: '中强度', short: '中' },
  { key: 'high', label: '高强度', short: '高' }
];

export const MEAL_SECTIONS = [
  { key: 'breakfast', label: '早餐', emoji: '🌅', hint: '优质蛋白 + 慢碳' },
  { key: 'lunch', label: '午餐', emoji: '☀️', hint: '营养均衡七分饱' },
  { key: 'dinner', label: '晚餐', emoji: '🌙', hint: '清淡低油少负担' },
  { key: 'snack', label: '加餐', emoji: '🍎', hint: '科学抗饿补充' }
];

export const SLEEP_TAG_OPTIONS = ['入睡快', '深度好', '起夜', '熬夜', '精力充沛', '多梦'];

export const SLEEP_QUALITY_LABELS = {
  1: '很差',
  2: '较差',
  3: '一般',
  4: '良好',
  5: '极佳'
};
