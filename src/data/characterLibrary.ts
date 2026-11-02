import type { PersonalityTrait } from '../types';
import { TRAIT_LABELS } from '../types';

/**
 * 角色画像知识库
 * 为每个世界观提供多维度的角色素材库，通过动态组合确保每个角色独特
 */

interface NamePool {
  surname: string[];
  given: string[];
}

interface AppearancePool {
  face: string[];      // 脸型
  eyes: string[];      // 眼睛
  hair: string[];      // 发型发色
  skin: string[];      // 肤色肤质
  bearing: string[];   // 气质体态
}

interface BackgroundPool {
  origin: string[];    // 出身
  experience: string[]; // 经历
  skill: string[];     // 特长/技能
  goal: string[];      // 目标
  secret: string[];    // 秘密
}

interface CharacterLibrary {
  names: NamePool;
  appearances: AppearancePool;
  backgrounds: BackgroundPool;
  tagsByTrait: Record<PersonalityTrait, string[]>;
}

const PALACE_LIBRARY: CharacterLibrary = {
  names: {
    surname: ['沈', '苏', '顾', '林', '萧', '叶', '楚', '宋', '温', '柳', '慕容', '上官', '纳兰'],
    given: ['婉宁', '清漪', '锦书', '若雪', '云裳', '未央', '惊鸿', '明月', '韶华', '凝香', '书瑶', '语嫣', '静姝'],
  },
  appearances: {
    face: ['鹅蛋脸，线条柔和', '瓜子脸，下颌精致', '圆脸，娇憨可爱', '方脸，端庄大气', '心形脸，明艳动人'],
    eyes: ['丹凤眼，眼尾微挑，顾盼生辉', '桃花眼，含情脉脉', '杏眼，清澈明亮', '柳叶眼，细长妩媚', '瑞凤眼，威严庄重'],
    hair: ['乌黑长发挽成堕马髻，插金步摇', '青丝如瀑，半挽半垂', '双丫髻，活泼灵动', '高鬟望仙髻，华贵端庄', '螺髻，清雅脱俗'],
    skin: ['肤若凝脂，白璧无瑕', '肌肤胜雪，吹弹可破', '蜜色肌肤，健康透亮', '莹白如玉，微微泛粉'],
    bearing: ['身姿挺拔，气度从容', '仪态优雅，气质沉稳', '英姿勃发，气度不凡', '雍容大气，举止端庄', '清秀温婉，气质亲和'],
  },
  backgrounds: {
    origin: ['六品文官之女，家族中落被迫入宫', '将门虎女，为家族联姻入宫', '商贾之女，买入宫中成了宫女', '罪臣之女，没入宫中为奴', '太医之女，精通药理', '异国公主，和亲入宫', '书香门第，选秀入宫', '宫女出身，被皇上意外看中'],
    experience: ['曾在冷宫住过三年，看透人心', '一手好棋，曾赢过太后', '救过一位神秘贵人', '在宫外有一段不为人知的恋情', '曾被人陷害毁容，后恢复', '精通毒术，暗中自保', '在寺庙寄养过，懂得佛法'],
    skill: ['一手好字，堪比大家', '琴艺精湛，一曲动心', '舞技超群，惊为天人', '医术高明，能治疑难杂症', '精通香料，能调配秘香', '过目不忘，博闻强识', '武功高强，深藏不露'],
    goal: ['为家族复仇', '登上皇后之位', '保护心爱的人', '在宫中安稳度日', '查清母亲死因', '扶持儿子登基', '寻找出宫的机会'],
    secret: ['私藏了先帝的遗诏', '与宫外的故人仍有联系', '身世另有隐情', '身上有前朝皇室血脉', '暗中养了一批死士', '一直在给冷宫的废后送药'],
  },
  tagsByTrait: {
    cautious: ['谨慎隐忍', '步步为营', '明哲保身', '静观其变', '韬光养晦', '察言观色'],
    decisive: ['果断强势', '雷厉风行', '杀伐决断', '说一不二', '当机立断', '铁腕手段'],
    scheming: ['心机深沉', '善于布局', '运筹帷幄', '深谋远虑', '工于心计', '暗藏锋芒'],
    kind: ['善良单纯', '心怀慈悲', '温柔体贴', '重情重义', '纯真无邪', '以德报怨'],
    ambitious: ['野心勃勃', '不甘人后', '志在巅峰', '步步登高', '权势滔天', '睥睨天下'],
    loyal: ['重情重义', '忠贞不渝', '知恩图报', '誓死相随', '情深义重', '不离不弃'],
  },
};

const APOCALYPSE_LIBRARY: CharacterLibrary = {
  names: {
    surname: ['陆', '陈', '林', '江', '苏', '秦', '叶', '顾', '韩', '沈', '周', '吴'],
    given: ['远', '川', '霆', '修', '珩', '屿', '澈', '骁', '煜', '辰', '野', '锋'],
  },
  appearances: {
    face: ['轮廓分明，下颌线硬朗', '清瘦苍白，颧骨突出', '国字脸，饱经风霜', '娃娃脸，与末世格格不入', '刀削般的脸庞，冷峻'],
    eyes: ['眼神锐利如鹰', '布满血丝，充满警惕', '眼神涣散，经历过太多', '眼神坚定，透着希望', '眼神阴郁，藏着秘密'],
    hair: ['短发利落，沾着灰尘', '长发凌乱，用布条扎起', '寸头，方便行动', '半长头发，遮住一只眼', '乱糟糟的卷发'],
    skin: ['古铜色皮肤，满是疤痕', '苍白消瘦，营养不良', '小麦色，肌肉线条明显', '皮肤粗糙，布满老茧'],
    bearing: ['身形矫健，行动敏捷', '弓背警惕，随时准备逃跑', '挺拔如松，有军人气质', '瘦弱但眼神凶狠', '沉稳老练，不怒自威'],
  },
  backgrounds: {
    origin: ['普通大学生，丧尸爆发时被困宿舍', '退伍军人，有实战经验', '医生，懂得急救', '混混，末世前就混迹街头', '研究员，了解病毒内幕', '运动员，身体素质极佳', '厨师，懂得寻找食物', '警察，有武器和战术'],
    experience: ['亲眼看着家人变异', '曾被幸存者背叛过', '在丧尸群中杀出过一条血路', '救过一个小女孩，一直带着她', '被咬过但奇迹般没有变异', '曾是某个幸存者基地的首领，被推翻', '在地下掩体躲了三个月'],
    skill: ['格斗术，近战无敌', '枪法精准，百步穿杨', '医术，能处理伤口', '机械改装，能造武器', '追踪侦查，善于潜行', '野外生存，能找到食物水源', '谈判专家，能化解冲突'],
    goal: ['找到解药拯救世界', '找到失散的家人', '建立一个安全的幸存者基地', '保护身边的人活到最后', '复仇，找到害死家人的人', '找到传说中的安全区', '让自己活得有尊严'],
    secret: ['其实是病毒免疫者', '身上带着实验病毒的样本', '害死过同伴才能活到现在', '知道丧尸爆发的真相', '私藏了大量物资', '曾经是军方实验体'],
  },
  tagsByTrait: {
    cautious: ['谨小慎微', '步步为营', '居安思危', '未雨绸缪', '瞻前顾后', '稳扎稳打'],
    decisive: ['果断勇敢', '雷厉风行', '杀伐决断', '一往无前', '当机立断', '破釜沉舟'],
    scheming: ['心机深沉', '善于算计', '老谋深算', '暗藏祸心', '不择手段', '诡计多端'],
    kind: ['心地善良', '心怀悲悯', '温柔守护', '重情重义', '舍己为人', '仁心仁术'],
    ambitious: ['野心勃勃', '不甘平庸', '志在四方', '强权在握', '逐鹿天下', '野心家'],
    loyal: ['重情重义', '忠贞不二', '生死与共', '肝胆相照', '同生共死', '不离不弃'],
  },
};

const CULTIVATION_LIBRARY: CharacterLibrary = {
  names: {
    surname: ['叶', '林', '萧', '楚', '苏', '顾', '秦', '姜', '白', '墨', '南宫', '东方', '轩辕'],
    given: ['尘', '凡', '轩', '澈', '珩', '修', '渊', '辰', '惊鸿', '凌云', '长生', '问天', '无忌'],
  },
  appearances: {
    face: ['面如冠玉，眉目如画', '剑眉星目，英气逼人', '清隽出尘，遗世独立', '冷峻孤傲，拒人千里', '温润如玉，亲和近人'],
    eyes: ['星眸璀璨，透着坚毅', '凤眼微眯，深不可测', '眼眸如墨，波澜不惊', '桃花眼，风流倜傥', '眼神澄澈，不染尘埃'],
    hair: ['墨发如瀑，用玉冠束起', '青丝半挽，洒脱不羁', '白发如霜，气质出尘', '长发披肩，邪魅狂狷', '短发利落，干练清爽'],
    skin: ['肤白胜雪，冰肌玉骨', '古铜色肌肤，阳光健康', '苍白病态，阴气森森', '小麦色，英气勃勃'],
    bearing: ['身姿挺拔，如劲松挺立', '飘然若仙，不食人间烟火', '慵懒随性，漫不经心', '威严凛然，气势磅礴', '清冷淡然，与世无争'],
  },
  backgrounds: {
    origin: ['五灵根废柴，被分到杂役峰', '天纵奇才，宗门少主', '散修出身，无依无靠', '上古世家传人，背负家族使命', '凡人飞升，根基不稳', '魔修转世，被正道追杀', '妖族混血，身份尴尬', '丹师世家，炼丹天赋异禀'],
    experience: ['误入上古秘境，得到传承', '被师父陷害，逐出师门', '渡劫失败，修为尽失后重修', '曾是魔道巨擘，转世重修', '救下过一条真龙，结下善缘', '在禁地被困百年，悟出大道', '亲手杀死了入魔的挚友'],
    skill: ['炼丹术，丹到病除', '阵法造诣，能布绝世大阵', '剑道通神，一剑破万法', '炼器大师，能造仙器', '精通符箓，画符如神', '御兽术，万兽臣服', '推演天机，洞悉因果'],
    goal: ['飞升成仙，证得大道', '为师父报仇雪恨', '保护心爱的道侣', '重振家族荣光', '寻找失踪的师尊', '打破天道束缚', '求证长生不老'],
    secret: ['身怀混沌灵根，被天道忌惮', '是某位大帝的转世', '掌握着成仙的秘密', '体内封印着上古大妖', '其实是魔界派来的卧底', '得到了时间法则的碎片'],
  },
  tagsByTrait: {
    cautious: ['坚韧不拔', '步步为营', '稳扎稳打', '静观其变', '韬光养晦', '厚积薄发'],
    decisive: ['果断勇敢', '一剑破局', '当机立断', '破釜沉舟', '一往无前', '杀伐决断'],
    scheming: ['深谋远虑', '善于布局', '运筹帷幄', '心机深沉', '暗藏锋芒', '老谋深算'],
    kind: ['善良正直', '心怀苍生', '仁心仁术', '重情重义', '慈悲为怀', '侠骨柔肠'],
    ambitious: ['野心勃勃', '志在大道', '不甘平庸', '逐鹿天下', '睥睨众生', '问鼎苍穹'],
    loyal: ['重情重义', '至死不渝', '肝胆相照', '生死相随', '情深义重', '一诺千金'],
  },
};

export const CHARACTER_LIBRARIES: Record<string, CharacterLibrary> = {
  palace: PALACE_LIBRARY,
  apocalypse: APOCALYPSE_LIBRARY,
  cultivation: CULTIVATION_LIBRARY,
};

/**
 * 从数组中随机取一个元素
 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 从数组中随机取 n 个不重复元素
 */
function pickMany<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/**
 * 生成动态角色画像
 * 根据世界观和性格特质，从知识库中动态组合，确保每个角色独特
 */
export function generateDynamicCharacterPortrait(
  worldviewId: string,
  profile: { primaryTrait: PersonalityTrait; secondaryTrait: PersonalityTrait },
): {
  name: string;
  appearance: string;
  background: string;
  personalityTags: string[];
} {
  const lib = CHARACTER_LIBRARIES[worldviewId] ?? CULTIVATION_LIBRARY;

  // 名字：姓 + 名 随机组合
  const name = `${pick(lib.names.surname)}${pick(lib.names.given)}`;

  // 外貌：各维度随机组合
  const appearance =
    `${pick(lib.appearances.face)}，${pick(lib.appearances.eyes)}，` +
    `${pick(lib.appearances.hair)}，${pick(lib.appearances.skin)}，` +
    `${pick(lib.appearances.bearing)}`;

  // 背景：出身 + 经历 + 技能 + 目标 + 秘密 动态组合
  const backgroundParts = [
    pick(lib.backgrounds.origin),
    pick(lib.backgrounds.experience),
    `特长：${pick(lib.backgrounds.skill)}`,
    `目标：${pick(lib.backgrounds.goal)}`,
  ];
  // 30% 概率加入秘密，增加独特性
  if (Math.random() < 0.3) {
    backgroundParts.push(`隐藏秘密：${pick(lib.backgrounds.secret)}`);
  }
  const background = backgroundParts.join('。');

  // 性格标签：从主特质和次特质的标签池中取
  const primaryTags = lib.tagsByTrait[profile.primaryTrait] ?? [];
  const secondaryTags = lib.tagsByTrait[profile.secondaryTrait] ?? [];
  const otherTraits = (Object.keys(lib.tagsByTrait) as PersonalityTrait[])
    .filter((t) => t !== profile.primaryTrait && t !== profile.secondaryTrait);
  const otherTag = pick(lib.tagsByTrait[pick(otherTraits)]) ;

  const tags = [
    pick(primaryTags),
    pick(secondaryTags),
    pickMany([...primaryTags, ...secondaryTags], 1)[0],
    otherTag,
  ].filter((t, i, arr) => t && arr.indexOf(t) === i).slice(0, 4);

  return {
    name,
    appearance,
    background,
    personalityTags: tags.length >= 2 ? tags : ['坚韧不拔', '深谋远虑'],
  };
}

/**
 * 获取特质的中文标签
 */
export function getTraitLabel(trait: PersonalityTrait): string {
  return TRAIT_LABELS[trait] ?? trait;
}
