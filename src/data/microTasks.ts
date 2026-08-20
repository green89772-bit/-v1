import { MicroTask } from '../types';

export const PRESET_MICRO_TASKS: MicroTask[] = [
  // 10% Energy Tasks
  {
    id: 'task-10-1',
    title: '閉眼深呼吸 3 次',
    description: '吸氣時感受空氣進入胸腔，吐氣時讓肩頸自然下沉。不用做任何多餘動作。',
    category: 'somatic',
    energyReq: 10,
    iconName: 'wind'
  },
  {
    id: 'task-10-2',
    title: '掌心發熱溫敷雙眼',
    description: '快速搓揉雙手掌心 10 秒，感覺溫熱後輕輕覆蓋在雙眼上，放空 30 秒。',
    category: 'sensory',
    energyReq: 10,
    iconName: 'eye'
  },
  {
    id: 'task-10-3',
    title: '靜觀一個光影角落 30 秒',
    description: '將目光停留在窗外或室內某個隨意的物件上，不作評價，只是單純觀察。',
    category: 'sensory',
    energyReq: 10,
    iconName: 'sun'
  },

  // 30% Energy Tasks
  {
    id: 'task-30-1',
    title: '去洗一個馬克杯',
    description: '走到水槽前，仔細感受清水流過手指的溫度與陶瓷的觸感，把杯子洗乾淨。',
    category: 'somatic',
    energyReq: 30,
    iconName: 'cup-soda'
  },
  {
    id: 'task-30-2',
    title: '倒一杯溫水並緩慢飲用',
    description: '倒一杯溫開水，坐下來一口一口慢慢喝，感受暖流進入身體的真實體感。',
    category: 'care',
    energyReq: 30,
    iconName: 'droplet'
  },
  {
    id: 'task-30-3',
    title: '站起來擴胸伸展 1 分鐘',
    description: '站起身，雙手向後拉展開胸廓，轉動肩頸三次，釋放身體囤積的壓力。',
    category: 'somatic',
    energyReq: 30,
    iconName: 'activity'
  },

  // 50% Energy Tasks
  {
    id: 'task-50-1',
    title: '擦拭乾淨桌面一小角',
    description: '拿起抹布或紙巾，只擦乾淨滑鼠鍵盤周圍或一小塊桌面，重獲微小的實體控制感。',
    category: 'care',
    energyReq: 50,
    iconName: 'sparkles'
  },
  {
    id: 'task-50-2',
    title: '去窗邊吹風或看遠方 2 分鐘',
    description: '打開窗戶，感受微風吹拂皮膚，讓眼睛凝視最遠處的建築或天空樹木。',
    category: 'sensory',
    energyReq: 50,
    iconName: 'cloud-sun'
  },
  {
    id: 'task-50-3',
    title: '給植物澆水或摸摸葉片',
    description: '如果身邊有植物，輕輕摸摸葉片的紋理或澆一小杯水；若沒有，用溫水洗個臉。',
    category: 'sensory',
    energyReq: 50,
    iconName: 'leaf'
  }
];
