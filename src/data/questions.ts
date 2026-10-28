import type { QuizQuestion, WorldviewId } from '../types';

// 深宫风云（宫斗）题库 - 10 道题
const PALACE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: '你刚入宫，同住的宫女偷走了你的玉镯，你会？',
    options: [
      { id: 'a', text: '忍气吞声，暗中观察她的靠山', trait: 'cautious' },
      { id: 'b', text: '当面质问，让她当众难堪', trait: 'decisive' },
      { id: 'c', text: '设局让她露出马脚，再一击致命', trait: 'scheming' },
      { id: 'd', text: '告诉掌事姑姑，按规矩处理', trait: 'kind' },
    ],
  },
  {
    id: 2,
    text: '皇后娘娘的茶里被人下了药，你恰好撞见，你会？',
    options: [
      { id: 'a', text: '装作没看见，多一事不如少一事', trait: 'cautious' },
      { id: 'b', text: '当众揭穿下毒者，博皇后信任', trait: 'decisive' },
      { id: 'c', text: '偷偷倒掉毒茶，敲诈下毒者', trait: 'scheming' },
      { id: 'd', text: '悄悄告诉皇后，提醒她小心', trait: 'kind' },
    ],
  },
  {
    id: 3,
    text: '皇上偶然注意到你，准备晋你的位分，但宠妃警告你别妄想，你会？',
    options: [
      { id: 'a', text: '婉拒圣意，明哲保身', trait: 'cautious' },
      { id: 'b', text: '欣然接受，正面刚宠妃', trait: 'ambitious' },
      { id: 'c', text: '表面推辞，私下找皇上哭诉宠妃欺压', trait: 'scheming' },
      { id: 'd', text: '接受但不张扬，暗中示好宠妃', trait: 'kind' },
    ],
  },
  {
    id: 4,
    text: '你的贴身宫女被发现是别人安插的眼线，你会？',
    options: [
      { id: 'a', text: '不动声色，给她传假消息', trait: 'scheming' },
      { id: 'b', text: '立刻杖毙，杀鸡儆猴', trait: 'decisive' },
      { id: 'c', text: '找借口把她打发走，不声张', trait: 'cautious' },
      { id: 'd', text: '念及旧情，放她出宫', trait: 'kind' },
    ],
  },
  {
    id: 5,
    text: '后宫选秀，新人中有一个酷似已故皇后，威胁到你的地位，你会？',
    options: [
      { id: 'a', text: '主动拉拢，结成同盟', trait: 'scheming' },
      { id: 'b', text: '处处刁难，打压她的气焰', trait: 'decisive' },
      { id: 'c', text: '静观其变，等她出错', trait: 'cautious' },
      { id: 'd', text: '真心相待，多个朋友多条路', trait: 'kind' },
    ],
  },
  {
    id: 6,
    text: '你怀孕的消息被泄露，当晚就有人送来可疑的安胎药，你会？',
    options: [
      { id: 'a', text: '假装喝下，暗中让太医查验', trait: 'scheming' },
      { id: 'b', text: '摔了药碗，去皇上面前告状', trait: 'decisive' },
      { id: 'c', text: '悄悄处理掉，谁也不告诉', trait: 'cautious' },
      { id: 'd', text: '相信送药的人，照常服用', trait: 'kind' },
    ],
  },
  {
    id: 7,
    text: '太后寿宴，有人陷害你偷了贡品，证据确凿，你会？',
    options: [
      { id: 'a', text: '冷静分析，找出证据漏洞反击', trait: 'scheming' },
      { id: 'b', text: '拒不认罪，要求当面对质', trait: 'decisive' },
      { id: 'c', text: '先认下，事后再翻案', trait: 'cautious' },
      { id: 'd', text: '哭诉冤屈，求太后明察', trait: 'kind' },
    ],
  },
  {
    id: 8,
    text: '你的好姐妹背叛了你，投靠了你的死对头，你会？',
    options: [
      { id: 'a', text: '假装不知情，利用她传递假情报', trait: 'scheming' },
      { id: 'b', text: '当众撕破脸，让所有人知道她的嘴脸', trait: 'decisive' },
      { id: 'c', text: '疏远她，不撕破脸也不再信任', trait: 'cautious' },
      { id: 'd', text: '找她谈心，想挽回这段情谊', trait: 'loyal' },
    ],
  },
  {
    id: 9,
    text: '朝中动荡，皇上有意立你的儿子为太子，但代价是你必须放弃家族，你会？',
    options: [
      { id: 'a', text: '答应，儿子的前途最重要', trait: 'ambitious' },
      { id: 'b', text: '拒绝，不能背叛家族', trait: 'loyal' },
      { id: 'c', text: '表面答应，暗中扶持家族势力', trait: 'scheming' },
      { id: 'd', text: '犹豫不决，想找两全之法', trait: 'cautious' },
    ],
  },
  {
    id: 10,
    text: '最终决战，你与最大对手正面交锋，你会？',
    options: [
      { id: 'a', text: '布下天罗地网，一击必杀', trait: 'scheming' },
      { id: 'b', text: '正面硬刚，靠实力碾压', trait: 'decisive' },
      { id: 'c', text: '隐忍不发，等她露出破绽', trait: 'cautious' },
      { id: 'd', text: '试图和解，化敌为友', trait: 'kind' },
    ],
  },
];

// 末日求生题库 - 10 道题
const APOCALYPSE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: '丧尸爆发第一天，你被困在宿舍，室友已经被咬伤，你会？',
    options: [
      { id: 'a', text: '趁他没完全变异，从窗户逃跑', trait: 'decisive' },
      { id: 'b', text: '把他锁在房间里，自己躲起来', trait: 'cautious' },
      { id: 'c', text: '尝试用绳子绑住他，看看能否恢复', trait: 'kind' },
      { id: 'd', text: '骗他开门然后偷袭', trait: 'scheming' },
    ],
  },
  {
    id: 2,
    text: '你找到了一个超市，但里面已经有一群幸存者占着，你会？',
    options: [
      { id: 'a', text: '直接冲进去抢物资', trait: 'decisive' },
      { id: 'b', text: '在外面观察，等他们离开再进去', trait: 'cautious' },
      { id: 'c', text: '假装弱者求收留，偷他们的物资', trait: 'scheming' },
      { id: 'd', text: '敲门请求加入，共享物资', trait: 'kind' },
    ],
  },
  {
    id: 3,
    text: '你的队伍里有人受伤发烧，可能会变异，你会？',
    options: [
      { id: 'a', text: '立刻把他赶出队伍', trait: 'decisive' },
      { id: 'b', text: '绑起来观察，变异了再处理', trait: 'cautious' },
      { id: 'c', text: '偷偷给他留物资，让他自己离开', trait: 'kind' },
      { id: 'd', text: '利用他吸引丧尸，自己逃跑', trait: 'scheming' },
    ],
  },
  {
    id: 4,
    text: '你发现军方的避难所，但只接收有技能的人，你会？',
    options: [
      { id: 'a', text: '如实说自己的能力', trait: 'kind' },
      { id: 'b', text: '夸大自己的技能，先进去再说', trait: 'scheming' },
      { id: 'c', text: '在门口观察，确认安全再进', trait: 'cautious' },
      { id: 'd', text: '不相信军方，自己另寻出路', trait: 'decisive' },
    ],
  },
  {
    id: 5,
    text: '半夜营地被丧尸围攻，你会？',
    options: [
      { id: 'a', text: '带头冲锋，打开缺口', trait: 'decisive' },
      { id: 'b', text: '坚守防线，等救援', trait: 'cautious' },
      { id: 'c', text: '趁乱拿上物资独自逃跑', trait: 'scheming' },
      { id: 'd', text: '留下来保护伤员', trait: 'loyal' },
    ],
  },
  {
    id: 6,
    text: '你遇到一个落单的小女孩，她的哭声可能引来丧尸，你会？',
    options: [
      { id: 'a', text: '捂住她的嘴带她一起走', trait: 'decisive' },
      { id: 'b', text: '给她食物让她安静，观察情况', trait: 'cautious' },
      { id: 'c', text: '假装没看见，自己走', trait: 'scheming' },
      { id: 'd', text: '带着她一起，想尽办法保护', trait: 'kind' },
    ],
  },
  {
    id: 7,
    text: '你发现了大量食物，但你的同伴不知道，你会？',
    options: [
      { id: 'a', text: '告诉同伴，公平分配', trait: 'kind' },
      { id: 'b', text: '自己偷偷藏一部分', trait: 'scheming' },
      { id: 'c', text: '全部拿走，不告诉任何人', trait: 'decisive' },
      { id: 'd', text: '先观察有没有陷阱再决定', trait: 'cautious' },
    ],
  },
  {
    id: 8,
    text: '有人告诉你有一个安全的幸存者基地，但需要走三天危险的路，你会？',
    options: [
      { id: 'a', text: '立刻出发，越早到越安全', trait: 'decisive' },
      { id: 'b', text: '先打听清楚是不是真的', trait: 'cautious' },
      { id: 'c', text: '让别人先走，自己跟着', trait: 'scheming' },
      { id: 'd', text: '留在原地，相信能找到更好的', trait: 'kind' },
    ],
  },
  {
    id: 9,
    text: '你的队伍首领变得越来越独裁，你会？',
    options: [
      { id: 'a', text: '联合其他人推翻他', trait: 'ambitious' },
      { id: 'b', text: '服从命令，明哲保身', trait: 'cautious' },
      { id: 'c', text: '暗中拉拢人心，等待时机', trait: 'scheming' },
      { id: 'd', text: '尝试和他沟通讲道理', trait: 'kind' },
    ],
  },
  {
    id: 10,
    text: '最后关头，只剩你和一个同伴，食物只够一个人活，你会？',
    options: [
      { id: 'a', text: '平分，一起活到最后一刻', trait: 'loyal' },
      { id: 'b', text: '抢过来，自己活下去', trait: 'decisive' },
      { id: 'c', text: '骗他吃下安眠药，自己拿走', trait: 'scheming' },
      { id: 'd', text: '让给他，自己面对死亡', trait: 'kind' },
    ],
  },
];

// 修仙问道题库 - 10 道题
const CULTIVATION_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: '你检测灵根，结果是五灵根（资质最差），你会？',
    options: [
      { id: 'a', text: '不服输，用十倍努力修炼', trait: 'decisive' },
      { id: 'b', text: '放弃修仙，做个普通人', trait: 'cautious' },
      { id: 'c', text: '找偏门功法，剑走偏锋', trait: 'scheming' },
      { id: 'd', text: '加入宗门，从杂役做起', trait: 'kind' },
    ],
  },
  {
    id: 2,
    text: '宗门大比，你遇到实力远超你的对手，你会？',
    options: [
      { id: 'a', text: '拼死一战，虽败犹荣', trait: 'decisive' },
      { id: 'b', text: '认输，保存实力', trait: 'cautious' },
      { id: 'c', text: '用阴招赢他', trait: 'scheming' },
      { id: 'd', text: '和他交朋友，学习经验', trait: 'kind' },
    ],
  },
  {
    id: 3,
    text: '你发现了一个上古秘境，但同门也知道了，你会？',
    options: [
      { id: 'a', text: '独自前往，独占机缘', trait: 'ambitious' },
      { id: 'b', text: '告诉宗门，组队探索', trait: 'cautious' },
      { id: 'c', text: '骗同门去错的地方，自己先到', trait: 'scheming' },
      { id: 'd', text: '和好友一起去，有福同享', trait: 'loyal' },
    ],
  },
  {
    id: 4,
    text: '你走火入魔的边缘，魔修诱惑你转修魔道，你会？',
    options: [
      { id: 'a', text: '咬牙坚持正道', trait: 'decisive' },
      { id: 'b', text: '先稳住，再想办法', trait: 'cautious' },
      { id: 'c', text: '假意入魔，伺机反扑', trait: 'scheming' },
      { id: 'd', text: '接受魔道力量，保住性命再说', trait: 'ambitious' },
    ],
  },
  {
    id: 5,
    text: '你的师父被陷害，要被逐出师门，你会？',
    options: [
      { id: 'a', text: '为师父鸣不平，对抗宗门', trait: 'loyal' },
      { id: 'b', text: '暗中调查真相，伺机翻案', trait: 'scheming' },
      { id: 'c', text: '明哲保身，和师父划清界限', trait: 'cautious' },
      { id: 'd', text: '和师父一起离开，另寻出路', trait: 'loyal' },
    ],
  },
  {
    id: 6,
    text: '你得到一株万年灵药，但服用就会树敌无数，你会？',
    options: [
      { id: 'a', text: '立刻服用，提升实力再说', trait: 'ambitious' },
      { id: 'b', text: '藏起来，等实力够了再用', trait: 'cautious' },
      { id: 'c', text: '卖掉换取资源，不惹麻烦', trait: 'scheming' },
      { id: 'd', text: '献给宗门，换取功劳', trait: 'kind' },
    ],
  },
  {
    id: 7,
    text: '渡劫失败的师兄求你帮他隐瞒，否则会被废修为，你会？',
    options: [
      { id: 'a', text: '帮他隐瞒，讲义气', trait: 'loyal' },
      { id: 'b', text: '劝他主动坦白', trait: 'kind' },
      { id: 'c', text: '以此要挟他为你办事', trait: 'scheming' },
      { id: 'd', text: '不管，装作不知道', trait: 'cautious' },
    ],
  },
  {
    id: 8,
    text: '魔修攻城，你的实力不够，你会？',
    options: [
      { id: 'a', text: '冲上去和魔修拼命', trait: 'decisive' },
      { id: 'b', text: '保护凡人撤退', trait: 'kind' },
      { id: 'c', text: '趁乱抢夺物资逃跑', trait: 'scheming' },
      { id: 'd', text: '找安全的地方躲起来', trait: 'cautious' },
    ],
  },
  {
    id: 9,
    text: '你发现了成仙的秘密，但需要献祭好友，你会？',
    options: [
      { id: 'a', text: '拒绝，成仙不如有情', trait: 'loyal' },
      { id: 'b', text: '寻找其他办法', trait: 'cautious' },
      { id: 'c', text: '为了大道，忍痛牺牲', trait: 'ambitious' },
      { id: 'd', text: '骗好友自愿献祭', trait: 'scheming' },
    ],
  },
  {
    id: 10,
    text: '飞升在即，你发现飞升后所有人都会忘记你，你会？',
    options: [
      { id: 'a', text: '毅然飞升，大道无情', trait: 'ambitious' },
      { id: 'b', text: '放弃飞升，留在人间', trait: 'loyal' },
      { id: 'c', text: '想办法让人记住自己', trait: 'scheming' },
      { id: 'd', text: '犹豫再三，错过飞升时机', trait: 'cautious' },
    ],
  },
];

export const QUESTIONS: Record<WorldviewId, QuizQuestion[]> = {
  palace: PALACE_QUESTIONS,
  apocalypse: APOCALYPSE_QUESTIONS,
  cultivation: CULTIVATION_QUESTIONS,
};

export function getQuestions(worldviewId: WorldviewId): QuizQuestion[] {
  return QUESTIONS[worldviewId] ?? [];
}
