import { EXTRA_FOOD_CATEGORIES, EXTRA_FOODS } from './expandedFoodLibrary.js';

export const FOOD_CATEGORIES = [
  '全部',
  ...EXTRA_FOOD_CATEGORIES,
  '主食谷物',
  '肉蛋禽',
  '水产海鲜',
  '豆奶乳品',
  '蔬菜菌菇',
  '水果',
  '坚果零食',
  '饮品',
  '轻食外食',
  '自定义'
];

const ORIGINAL_FOODS = [
  // -------------------- 主食谷物 (18 items) --------------------
  { id: 'f_s01', name: '米饭(熟)', category: '主食谷物', kcalPer100g: 116, protein: 2.6, carbs: 25.9, fat: 0.3, unitName: '碗', unitGrams: 150, keywords: 'mifan baimifan rice 大米饭' },
  { id: 'f_s02', name: '杂粮饭(熟)', category: '主食谷物', kcalPer100g: 124, protein: 3.3, carbs: 26.5, fat: 0.7, unitName: '碗', unitGrams: 150, keywords: 'zaliangfan culiang 五谷饭' },
  { id: 'f_s03', name: '糙米饭(熟)', category: '主食谷物', kcalPer100g: 111, protein: 2.6, carbs: 23.0, fat: 0.9, unitName: '碗', unitGrams: 150, keywords: 'caomifan brown rice' },
  { id: 'f_s04', name: '小米粥', category: '主食谷物', kcalPer100g: 46, protein: 1.4, carbs: 8.4, fat: 0.7, unitName: '碗', unitGrams: 250, keywords: 'xiaomizhou porridge 粥' },
  { id: 'f_s05', name: '燕麦片(干)', category: '主食谷物', kcalPer100g: 377, protein: 13.5, carbs: 66.0, fat: 6.7, unitName: '勺', unitGrams: 35, keywords: 'yanmaipian oats 麦片' },
  { id: 'f_s06', name: '即食燕麦片', category: '主食谷物', kcalPer100g: 367, protein: 12.8, carbs: 67.2, fat: 6.0, unitName: '袋', unitGrams: 40, keywords: 'jishiyanmai instant oats 快熟燕麦' },
  { id: 'f_s07', name: '全麦吐司', category: '主食谷物', kcalPer100g: 246, protein: 8.8, carbs: 43.5, fat: 3.4, unitName: '片', unitGrams: 40, keywords: 'quanmaitusi bread 面包' },
  { id: 'f_s08', name: '白吐司', category: '主食谷物', kcalPer100g: 266, protein: 8.2, carbs: 49.4, fat: 3.6, unitName: '片', unitGrams: 38, keywords: 'baitusi toast 面包片' },
  { id: 'f_s09', name: '全麦贝果', category: '主食谷物', kcalPer100g: 250, protein: 9.8, carbs: 48.0, fat: 1.8, unitName: '个', unitGrams: 95, keywords: 'quanmaibeiguo bagel 贝果' },
  { id: 'f_s10', name: '馒头', category: '主食谷物', kcalPer100g: 223, protein: 7.0, carbs: 47.0, fat: 1.1, unitName: '个', unitGrams: 100, keywords: 'mantou 馍' },
  { id: 'f_s11', name: '花卷', category: '主食谷物', kcalPer100g: 214, protein: 6.4, carbs: 45.2, fat: 1.4, unitName: '个', unitGrams: 90, keywords: 'huajuan 葱油花卷' },
  { id: 'f_s12', name: '蒸红薯', category: '主食谷物', kcalPer100g: 86, protein: 1.6, carbs: 20.1, fat: 0.2, unitName: '个', unitGrams: 150, keywords: 'hongshu digua sweet potato 地瓜 番薯' },
  { id: 'f_s13', name: '蒸紫薯', category: '主食谷物', kcalPer100g: 82, protein: 1.8, carbs: 19.2, fat: 0.2, unitName: '个', unitGrams: 140, keywords: 'zishu purple sweet potato' },
  { id: 'f_s14', name: '甜玉米(带棒/粒)', category: '主食谷物', kcalPer100g: 106, protein: 3.8, carbs: 22.8, fat: 1.2, unitName: '根', unitGrams: 160, keywords: 'tianyumi corn 煮玉米 棒子' },
  { id: 'f_s15', name: '蒸土豆', category: '主食谷物', kcalPer100g: 77, protein: 2.0, carbs: 17.2, fat: 0.1, unitName: '拳头', unitGrams: 150, keywords: 'tudou potato 马铃薯' },
  { id: 'f_s16', name: '煮荞麦面(熟)', category: '主食谷物', kcalPer100g: 108, protein: 5.1, carbs: 21.4, fat: 0.3, unitName: '碗', unitGrams: 180, keywords: 'qiaomaimian soba 面条' },
  { id: 'f_s17', name: '煮意大利面(熟)', category: '主食谷物', kcalPer100g: 131, protein: 5.0, carbs: 25.0, fat: 1.1, unitName: '碗', unitGrams: 180, keywords: 'yidalimian pasta 意面' },
  { id: 'f_s18', name: '山药(蒸)', category: '主食谷物', kcalPer100g: 57, protein: 1.9, carbs: 12.4, fat: 0.2, unitName: '段', unitGrams: 120, keywords: 'shanyao 铁棍山药' },

  // -------------------- 肉蛋禽 (15 items) --------------------
  { id: 'f_m01', name: '水煮蛋', category: '肉蛋禽', kcalPer100g: 144, protein: 13.3, carbs: 2.8, fat: 8.8, unitName: '个', unitGrams: 50, keywords: 'shuizhudan jidan egg 鸡蛋' },
  { id: 'f_m02', name: '煎鸡蛋(少油)', category: '肉蛋禽', kcalPer100g: 196, protein: 13.6, carbs: 1.1, fat: 15.0, unitName: '个', unitGrams: 55, keywords: 'jianjidan hebaodan 荷包蛋' },
  { id: 'f_m03', name: '茶叶蛋', category: '肉蛋禽', kcalPer100g: 151, protein: 13.5, carbs: 2.0, fat: 9.8, unitName: '个', unitGrams: 52, keywords: 'chayedan 卤蛋' },
  { id: 'f_m04', name: '蛋白(纯蛋清)', category: '肉蛋禽', kcalPer100g: 52, protein: 11.6, carbs: 1.0, fat: 0.2, unitName: '个', unitGrams: 33, keywords: 'danbai danqing egg white 鸡蛋清' },
  { id: 'f_m05', name: '鸡胸肉(熟)', category: '肉蛋禽', kcalPer100g: 133, protein: 24.6, carbs: 0.5, fat: 2.5, unitName: '块', unitGrams: 120, keywords: 'jixiongrou chicken breast 鸡肉' },
  { id: 'f_m06', name: '去皮鸡腿肉(熟)', category: '肉蛋禽', kcalPer100g: 152, protein: 21.8, carbs: 0.2, fat: 6.5, unitName: '个', unitGrams: 110, keywords: 'jituirou chicken thigh 鸡腿' },
  { id: 'f_m07', name: '烤鸡胸肉(即食)', category: '肉蛋禽', kcalPer100g: 122, protein: 23.5, carbs: 2.2, fat: 2.0, unitName: '袋', unitGrams: 100, keywords: 'kaojixiong jishi 即食鸡胸' },
  { id: 'f_m08', name: '瘦牛肉(卤/煮)', category: '肉蛋禽', kcalPer100g: 145, protein: 26.5, carbs: 1.0, fat: 3.8, unitName: '份', unitGrams: 100, keywords: 'shouniurou luniurou beef 酱牛肉' },
  { id: 'f_m09', name: '牛排(西冷/菲力煎)', category: '肉蛋禽', kcalPer100g: 178, protein: 25.0, carbs: 0.0, fat: 8.5, unitName: '块', unitGrams: 150, keywords: 'niupai steak 西冷 菲力' },
  { id: 'f_m10', name: '猪里脊肉(熟)', category: '肉蛋禽', kcalPer100g: 143, protein: 21.0, carbs: 0.5, fat: 6.0, unitName: '份', unitGrams: 100, keywords: 'zhuliji pork tenderloin 里脊' },
  { id: 'f_m11', name: '瘦猪肉(熟)', category: '肉蛋禽', kcalPer100g: 165, protein: 20.3, carbs: 0.4, fat: 9.0, unitName: '份', unitGrams: 100, keywords: 'shouzhurou pork 猪肉' },
  { id: 'f_m12', name: '羊肉(瘦)', category: '肉蛋禽', kcalPer100g: 158, protein: 20.5, carbs: 0.0, fat: 8.2, unitName: '份', unitGrams: 100, keywords: 'yangrou lamb 羊腿肉' },
  { id: 'f_m13', name: '鸭胸肉(去皮)', category: '肉蛋禽', kcalPer100g: 136, protein: 20.0, carbs: 0.0, fat: 5.8, unitName: '块', unitGrams: 100, keywords: 'yaxiongrou duck 鸭肉' },
  { id: 'f_m14', name: '低脂鸡肉肠', category: '肉蛋禽', kcalPer100g: 135, protein: 16.5, carbs: 6.0, fat: 4.5, unitName: '根', unitGrams: 50, keywords: 'jirouchang sausage 鸡胸肉肠' },
  { id: 'f_m15', name: '火鸡胸肉片', category: '肉蛋禽', kcalPer100g: 112, protein: 22.4, carbs: 1.5, fat: 1.6, unitName: '份', unitGrams: 80, keywords: 'huoji turkey 火鸡肉' },

  // -------------------- 水产海鲜 (10 items) --------------------
  { id: 'f_sf01', name: '去壳虾仁(熟)', category: '水产海鲜', kcalPer100g: 93, protein: 18.6, carbs: 0.8, fat: 1.1, unitName: '份', unitGrams: 100, keywords: 'xiaren shrimp 虾' },
  { id: 'f_sf02', name: '基围虾(白灼)', category: '水产海鲜', kcalPer100g: 99, protein: 20.2, carbs: 0.5, fat: 1.4, unitName: '份', unitGrams: 120, keywords: 'jiweixia baizhuoxia 对虾' },
  { id: 'f_sf03', name: '三文鱼(生/煎)', category: '水产海鲜', kcalPer100g: 146, protein: 20.4, carbs: 0.0, fat: 6.8, unitName: '块', unitGrams: 120, keywords: 'sanwenyu salmon 刺身' },
  { id: 'f_sf04', name: '巴沙鱼柳', category: '水产海鲜', kcalPer100g: 88, protein: 16.8, carbs: 0.0, fat: 2.0, unitName: '片', unitGrams: 150, keywords: 'bashayu basa 鱼柳' },
  { id: 'f_sf05', name: '鳕鱼', category: '水产海鲜', kcalPer100g: 85, protein: 18.5, carbs: 0.0, fat: 0.8, unitName: '块', unitGrams: 120, keywords: 'xueyu cod 银鳕鱼' },
  { id: 'f_sf06', name: '清蒸鲈鱼', category: '水产海鲜', kcalPer100g: 105, protein: 18.6, carbs: 0.5, fat: 3.1, unitName: '份', unitGrams: 150, keywords: 'luyu seabass 蒸鱼' },
  { id: 'f_sf07', name: '龙利鱼', category: '水产海鲜', kcalPer100g: 95, protein: 18.2, carbs: 0.0, fat: 2.1, unitName: '片', unitGrams: 150, keywords: 'longliyu sole fish' },
  { id: 'f_sf08', name: '水浸金枪鱼罐头', category: '水产海鲜', kcalPer100g: 108, protein: 23.6, carbs: 0.0, fat: 1.0, unitName: '罐', unitGrams: 130, keywords: 'jinqiangyu tuna 吞拿鱼' },
  { id: 'f_sf09', name: '鱿鱼/花枝(熟)', category: '水产海鲜', kcalPer100g: 92, protein: 16.5, carbs: 3.1, fat: 1.4, unitName: '份', unitGrams: 100, keywords: 'youyu huazhi squid 墨鱼' },
  { id: 'f_sf10', name: '蛤蜊/花甲肉', category: '水产海鲜', kcalPer100g: 74, protein: 12.8, carbs: 2.6, fat: 1.0, unitName: '份', unitGrams: 100, keywords: 'geli huajia clam 贝壳' },

  // -------------------- 豆奶乳品 (11 items) --------------------
  { id: 'f_d01', name: '纯牛奶(全脂)', category: '豆奶乳品', kcalPer100g: 62, protein: 3.2, carbs: 4.8, fat: 3.5, unitName: '盒', unitGrams: 250, keywords: 'chunniunai milk 牛奶' },
  { id: 'f_d02', name: '脱脂纯牛奶', category: '豆奶乳品', kcalPer100g: 35, protein: 3.3, carbs: 5.0, fat: 0.1, unitName: '盒', unitGrams: 250, keywords: 'tuozhiniunai skim milk' },
  { id: 'f_d03', name: '低脂纯牛奶', category: '豆奶乳品', kcalPer100g: 46, protein: 3.2, carbs: 4.9, fat: 1.5, unitName: '盒', unitGrams: 250, keywords: 'dizhiniunai low fat milk' },
  { id: 'f_d04', name: '无糖原味酸奶', category: '豆奶乳品', kcalPer100g: 68, protein: 3.8, carbs: 5.2, fat: 3.5, unitName: '杯', unitGrams: 135, keywords: 'suannai yogurt 酸奶' },
  { id: 'f_d05', name: '无糖希腊酸奶', category: '豆奶乳品', kcalPer100g: 78, protein: 9.0, carbs: 4.0, fat: 2.5, unitName: '盒', unitGrams: 100, keywords: 'xilasuannai greek yogurt 冷萃酸奶' },
  { id: 'f_d06', name: '无糖纯豆浆', category: '豆奶乳品', kcalPer100g: 31, protein: 3.0, carbs: 1.2, fat: 1.6, unitName: '杯', unitGrams: 250, keywords: 'doujiang soymilk 豆奶' },
  { id: 'f_d07', name: '北豆腐(老豆腐)', category: '豆奶乳品', kcalPer100g: 98, protein: 11.2, carbs: 2.8, fat: 4.8, unitName: '块', unitGrams: 150, keywords: 'beidoufu laodoufu tofu 卤水豆腐' },
  { id: 'f_d08', name: '嫩豆腐(内酯豆腐)', category: '豆奶乳品', kcalPer100g: 50, protein: 5.0, carbs: 1.9, fat: 2.5, unitName: '盒', unitGrams: 200, keywords: 'nendoufu neizhidoufu 南豆腐' },
  { id: 'f_d09', name: '五香豆腐干', category: '豆奶乳品', kcalPer100g: 140, protein: 16.2, carbs: 10.5, fat: 3.8, unitName: '块', unitGrams: 50, keywords: 'doufugan dougan 豆干' },
  { id: 'f_d10', name: '腐竹(水发)', category: '豆奶乳品', kcalPer100g: 165, protein: 15.8, carbs: 7.5, fat: 8.2, unitName: '份', unitGrams: 100, keywords: 'fuzhu 豆皮' },
  { id: 'f_d11', name: '低脂奶酪片', category: '豆奶乳品', kcalPer100g: 215, protein: 19.0, carbs: 5.0, fat: 13.0, unitName: '片', unitGrams: 20, keywords: 'nailao cheese 芝士片' },

  // -------------------- 蔬菜菌菇 (16 items) --------------------
  { id: 'f_v01', name: '西兰花', category: '蔬菜菌菇', kcalPer100g: 34, protein: 3.7, carbs: 4.3, fat: 0.6, unitName: '份', unitGrams: 150, keywords: 'xilanhua broccoli 花椰菜' },
  { id: 'f_v02', name: '生菜/球生菜', category: '蔬菜菌菇', kcalPer100g: 15, protein: 1.3, carbs: 2.2, fat: 0.2, unitName: '盘', unitGrams: 150, keywords: 'shengcai lettuce 沙拉菜' },
  { id: 'f_v03', name: '黄瓜', category: '蔬菜菌菇', kcalPer100g: 16, protein: 0.8, carbs: 2.9, fat: 0.2, unitName: '根', unitGrams: 180, keywords: 'huanggua cucumber 青瓜' },
  { id: 'f_v04', name: '番茄', category: '蔬菜菌菇', kcalPer100g: 19, protein: 0.9, carbs: 3.9, fat: 0.2, unitName: '个', unitGrams: 180, keywords: 'fanqie xihongshi tomato 西红柿' },
  { id: 'f_v05', name: '圣女果', category: '蔬菜菌菇', kcalPer100g: 22, protein: 0.9, carbs: 4.6, fat: 0.2, unitName: '把', unitGrams: 120, keywords: 'shengnvguo xiaofanqie 小番茄' },
  { id: 'f_v06', name: '菠菜', category: '蔬菜菌菇', kcalPer100g: 24, protein: 2.6, carbs: 3.6, fat: 0.3, unitName: '盘', unitGrams: 150, keywords: 'bocai spinach' },
  { id: 'f_v07', name: '油麦菜', category: '蔬菜菌菇', kcalPer100g: 17, protein: 1.4, carbs: 2.5, fat: 0.3, unitName: '盘', unitGrams: 150, keywords: 'youmaicai 青菜' },
  { id: 'f_v08', name: '娃娃菜', category: '蔬菜菌菇', kcalPer100g: 13, protein: 1.2, carbs: 2.1, fat: 0.1, unitName: '颗', unitGrams: 180, keywords: 'wawacai 小白菜' },
  { id: 'f_v09', name: '大白菜', category: '蔬菜菌菇', kcalPer100g: 17, protein: 1.5, carbs: 3.2, fat: 0.1, unitName: '盘', unitGrams: 200, keywords: 'dabaicai cabbage 白菜' },
  { id: 'f_v10', name: '上海青/油菜', category: '蔬菜菌菇', kcalPer100g: 15, protein: 1.8, carbs: 2.3, fat: 0.2, unitName: '盘', unitGrams: 150, keywords: 'shanghaiqing youcai 小油菜' },
  { id: 'f_v11', name: '芦笋', category: '蔬菜菌菇', kcalPer100g: 22, protein: 2.2, carbs: 3.9, fat: 0.1, unitName: '份', unitGrams: 120, keywords: 'lusun asparagus' },
  { id: 'f_v12', name: '冬瓜', category: '蔬菜菌菇', kcalPer100g: 12, protein: 0.4, carbs: 2.6, fat: 0.1, unitName: '份', unitGrams: 200, keywords: 'donggua winter melon' },
  { id: 'f_v13', name: '胡萝卜', category: '蔬菜菌菇', kcalPer100g: 39, protein: 1.0, carbs: 8.8, fat: 0.2, unitName: '根', unitGrams: 120, keywords: 'huluobo carrot 红萝卜' },
  { id: 'f_v14', name: '金针菇', category: '蔬菜菌菇', kcalPer100g: 32, protein: 2.4, carbs: 6.0, fat: 0.4, unitName: '把', unitGrams: 100, keywords: 'jinzhengu enoki 蘑菇' },
  { id: 'f_v15', name: '香菇', category: '蔬菜菌菇', kcalPer100g: 26, protein: 2.2, carbs: 5.2, fat: 0.3, unitName: '份', unitGrams: 100, keywords: 'xianggu shiitake 鲜香菇' },
  { id: 'f_v16', name: '杏鲍菇', category: '蔬菜菌菇', kcalPer100g: 35, protein: 2.5, carbs: 6.5, fat: 0.2, unitName: '根', unitGrams: 120, keywords: 'xingbaogu mushroom 菌菇' },

  // -------------------- 水果 (14 items) --------------------
  { id: 'f_fr01', name: '苹果', category: '水果', kcalPer100g: 53, protein: 0.3, carbs: 13.7, fat: 0.2, unitName: '个', unitGrams: 180, keywords: 'pingguo apple 红富士' },
  { id: 'f_fr02', name: '香蕉', category: '水果', kcalPer100g: 89, protein: 1.1, carbs: 22.8, fat: 0.3, unitName: '根', unitGrams: 120, keywords: 'xiangjiao banana' },
  { id: 'f_fr03', name: '蓝莓', category: '水果', kcalPer100g: 57, protein: 0.7, carbs: 14.5, fat: 0.3, unitName: '盒', unitGrams: 125, keywords: 'lanmei blueberry' },
  { id: 'f_fr04', name: '草莓', category: '水果', kcalPer100g: 32, protein: 0.7, carbs: 7.7, fat: 0.3, unitName: '份', unitGrams: 150, keywords: 'caomei strawberry' },
  { id: 'f_fr05', name: '红心火龙果', category: '水果', kcalPer100g: 55, protein: 1.1, carbs: 13.3, fat: 0.2, unitName: '半个', unitGrams: 180, keywords: 'huolongguo dragonfruit 火龙果' },
  { id: 'f_fr06', name: '猕猴桃', category: '水果', kcalPer100g: 61, protein: 1.1, carbs: 14.5, fat: 0.5, unitName: '个', unitGrams: 90, keywords: 'mihoutao qiyiguo kiwi 奇异果' },
  { id: 'f_fr07', name: '橙子', category: '水果', kcalPer100g: 47, protein: 0.9, carbs: 11.8, fat: 0.2, unitName: '个', unitGrams: 180, keywords: 'chengzi orange 脐橙' },
  { id: 'f_fr08', name: '西柚/柚子', category: '水果', kcalPer100g: 42, protein: 0.8, carbs: 10.2, fat: 0.2, unitName: '瓣', unitGrams: 100, keywords: 'xiyou youzi grapefruit 红柚' },
  { id: 'f_fr09', name: '西瓜', category: '水果', kcalPer100g: 30, protein: 0.6, carbs: 7.5, fat: 0.1, unitName: '块', unitGrams: 250, keywords: 'xigua watermelon' },
  { id: 'f_fr10', name: '阳光玫瑰葡萄', category: '水果', kcalPer100g: 69, protein: 0.6, carbs: 17.5, fat: 0.2, unitName: '把', unitGrams: 120, keywords: 'putao yangguangmeigui grape 青提' },
  { id: 'f_fr11', name: '牛油果', category: '水果', kcalPer100g: 160, protein: 2.0, carbs: 8.5, fat: 14.7, unitName: '半个', unitGrams: 75, keywords: 'niuyouguo avocado 鳄梨' },
  { id: 'f_fr12', name: '梨', category: '水果', kcalPer100g: 51, protein: 0.4, carbs: 13.3, fat: 0.2, unitName: '个', unitGrams: 200, keywords: 'li pear 香梨 雪梨' },
  { id: 'f_fr13', name: '桃子', category: '水果', kcalPer100g: 42, protein: 0.9, carbs: 10.1, fat: 0.1, unitName: '个', unitGrams: 180, keywords: 'taozi peach 水蜜桃 油桃' },
  { id: 'f_fr14', name: '小番茄/车厘子', category: '水果', kcalPer100g: 58, protein: 1.1, carbs: 14.2, fat: 0.3, unitName: '把', unitGrams: 100, keywords: 'chelizi yingtao cherry 樱桃' },

  // -------------------- 坚果零食 (10 items) --------------------
  { id: 'f_n01', name: '原味巴旦木', category: '坚果零食', kcalPer100g: 579, protein: 21.2, carbs: 21.6, fat: 49.9, unitName: '把', unitGrams: 20, keywords: 'badanmu xingren almond 扁桃仁' },
  { id: 'f_n02', name: '核桃仁', category: '坚果零食', kcalPer100g: 654, protein: 15.2, carbs: 13.7, fat: 65.2, unitName: '把', unitGrams: 20, keywords: 'hetao walnut 核桃' },
  { id: 'f_n03', name: '腰果', category: '坚果零食', kcalPer100g: 553, protein: 18.2, carbs: 30.2, fat: 43.8, unitName: '把', unitGrams: 20, keywords: 'yaoguo cashew' },
  { id: 'f_n04', name: '花生(水煮)', category: '坚果零食', kcalPer100g: 318, protein: 13.5, carbs: 21.3, fat: 22.0, unitName: '把', unitGrams: 30, keywords: 'huasheng peanut 水煮花生' },
  { id: 'f_n05', name: '南瓜子仁', category: '坚果零食', kcalPer100g: 559, protein: 30.2, carbs: 10.7, fat: 49.0, unitName: '把', unitGrams: 20, keywords: 'nanguazi pumpkin seed' },
  { id: 'f_n06', name: '黑巧克力(85%)', category: '坚果零食', kcalPer100g: 580, protein: 9.5, carbs: 22.0, fat: 48.0, unitName: '块', unitGrams: 10, keywords: 'heiqiaokeli dark chocolate 黑巧' },
  { id: 'f_n07', name: '牛奶榛果巧克力', category: '坚果零食', kcalPer100g: 545, protein: 7.2, carbs: 52.0, fat: 33.5, unitName: '块', unitGrams: 15, keywords: 'qiaokeli chocolate 零食' },
  { id: 'f_n08', name: '全麦苏打饼干', category: '坚果零食', kcalPer100g: 428, protein: 9.5, carbs: 68.0, fat: 12.5, unitName: '包', unitGrams: 25, keywords: 'sudabinggan cracker 饼干' },
  { id: 'f_n09', name: '低脂魔芋爽', category: '坚果零食', kcalPer100g: 125, protein: 1.5, carbs: 12.0, fat: 7.5, unitName: '袋', unitGrams: 18, keywords: 'moyushuang konjac 魔芋' },
  { id: 'f_n10', name: '海苔(即食)', category: '坚果零食', kcalPer100g: 310, protein: 32.0, carbs: 35.0, fat: 4.5, unitName: '包', unitGrams: 5, keywords: 'haitai seaweed 紫菜' },

  // -------------------- 饮品 (9 items) --------------------
  { id: 'f_dr01', name: '冰美式(无糖)', category: '饮品', kcalPer100g: 2, protein: 0.1, carbs: 0.3, fat: 0.0, unitName: '杯', unitGrams: 350, keywords: 'bingmeishi americano coffee 咖啡 黑咖啡' },
  { id: 'f_dr02', name: '热美式(无糖)', category: '饮品', kcalPer100g: 2, protein: 0.1, carbs: 0.3, fat: 0.0, unitName: '杯', unitGrams: 300, keywords: 'remeishi americano coffee 热咖啡' },
  { id: 'f_dr03', name: '冰拿铁(全脂无糖)', category: '饮品', kcalPer100g: 45, protein: 2.5, carbs: 3.8, fat: 2.2, unitName: '杯', unitGrams: 350, keywords: 'bingnatie latte 拿铁 咖啡' },
  { id: 'f_dr04', name: '冰拿铁(脱脂/燕麦奶无糖)', category: '饮品', kcalPer100g: 30, protein: 1.8, carbs: 4.2, fat: 0.7, unitName: '杯', unitGrams: 350, keywords: 'yanmainatie oat latte 脱脂拿铁' },
  { id: 'f_dr05', name: '无糖乌龙茶/绿茶', category: '饮品', kcalPer100g: 0, protein: 0.0, carbs: 0.0, fat: 0.0, unitName: '瓶', unitGrams: 500, keywords: 'wulongcha lvcha tea 东方树叶 三得利' },
  { id: 'f_dr06', name: '气泡水/零度可乐', category: '饮品', kcalPer100g: 0, protein: 0.0, carbs: 0.0, fat: 0.0, unitName: '罐', unitGrams: 330, keywords: 'qipaoshui kele zero cola 无糖可乐' },
  { id: 'f_dr07', name: '乳清蛋白粉(1勺)', category: '饮品', kcalPer100g: 380, protein: 78.0, carbs: 8.0, fat: 4.5, unitName: '勺', unitGrams: 30, keywords: 'danbaifen whey protein 蛋白粉' },
  { id: 'f_dr08', name: '椰子水(无糖)', category: '饮品', kcalPer100g: 19, protein: 0.2, carbs: 4.5, fat: 0.0, unitName: '盒', unitGrams: 330, keywords: 'yezishui coconut water 椰青' },
  { id: 'f_dr09', name: '柠檬水(无糖)', category: '饮品', kcalPer100g: 6, protein: 0.1, carbs: 1.5, fat: 0.0, unitName: '杯', unitGrams: 500, keywords: 'ningmengshui lemon water' },

  // -------------------- 轻食外食 (10 items) --------------------
  { id: 'f_o01', name: '便利店金枪鱼/鸡肉饭团', category: '轻食外食', kcalPer100g: 185, protein: 6.2, carbs: 32.0, fat: 3.5, unitName: '个', unitGrams: 110, keywords: 'fantuan 711 luosen 全家 罗森' },
  { id: 'f_o02', name: '全麦鸡胸肉三明治', category: '轻食外食', kcalPer100g: 198, protein: 12.5, carbs: 24.0, fat: 5.5, unitName: '个', unitGrams: 145, keywords: 'sanmingzhi sandwich 便利店三明治' },
  { id: 'f_o03', name: '鸡胸肉凯撒沙拉(少酱)', category: '轻食外食', kcalPer100g: 98, protein: 10.5, carbs: 6.8, fat: 3.2, unitName: '盒', unitGrams: 260, keywords: 'shala salad 轻食沙拉 减脂餐' },
  { id: 'f_o04', name: '赛百味6寸火鸡/鸡胸潜艇堡', category: '轻食外食', kcalPer100g: 148, protein: 9.2, carbs: 21.5, fat: 2.5, unitName: '个', unitGrams: 220, keywords: 'saibaiwei subway 潜艇堡' },
  { id: 'f_o05', name: '关东煮白萝卜', category: '轻食外食', kcalPer100g: 22, protein: 0.7, carbs: 4.5, fat: 0.1, unitName: '块', unitGrams: 90, keywords: 'guandongzhu luobo 便利店' },
  { id: 'f_o06', name: '关东煮魔芋丝', category: '轻食外食', kcalPer100g: 14, protein: 0.2, carbs: 3.2, fat: 0.1, unitName: '串', unitGrams: 70, keywords: 'guandongzhu moyusi 魔芋结' },
  { id: 'f_o07', name: '关东煮海带结', category: '轻食外食', kcalPer100g: 20, protein: 1.1, carbs: 3.8, fat: 0.1, unitName: '串', unitGrams: 60, keywords: 'guandongzhu haidai 昆布' },
  { id: 'f_o08', name: '关东煮鸡肉丸', category: '轻食外食', kcalPer100g: 142, protein: 12.8, carbs: 9.5, fat: 5.8, unitName: '串', unitGrams: 75, keywords: 'guandongzhu jirouwan 肉丸' },
  { id: 'f_o09', name: '牛肉荞麦冷面', category: '轻食外食', kcalPer100g: 122, protein: 7.4, carbs: 19.5, fat: 1.8, unitName: '碗', unitGrams: 340, keywords: 'lengmian qiaomai 荞麦面' },
  { id: 'f_o10', name: '清汤麻辣烫(素菜+牛肉标准份)', category: '轻食外食', kcalPer100g: 78, protein: 6.2, carbs: 6.5, fat: 3.0, unitName: '碗', unitGrams: 500, keywords: 'malatang qingtang 冒菜 外卖' }
];

const nameKey = (name) => name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();

function mergeFoodLibrary() {
  const foodsByName = new Map(ORIGINAL_FOODS.map((food) => [nameKey(food.name), food]));

  for (const { kcal, unit, aliases, ...food } of EXTRA_FOODS) {
    const key = nameKey(food.name);
    const existing = foodsByName.get(key);
    if (!existing) {
      foodsByName.set(key, { ...food, kcalPer100g: kcal, unitName: unit, keywords: aliases });
      continue;
    }

    // Keep the stored identity and nutrition for names already in the original catalog.
    const additionalCategories = new Set(existing.additionalCategories);
    if (food.category !== existing.category) additionalCategories.add(food.category);
    foodsByName.set(key, {
      ...existing,
      keywords: [existing.keywords, aliases].filter(Boolean).join(' '),
      additionalCategories: [...additionalCategories]
    });
  }

  return [...foodsByName.values()];
}

export const BUILTIN_FOODS = mergeFoodLibrary();
