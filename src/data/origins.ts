import type { OriginBackground, TalentCard, WorldviewId } from '../types';

/**
 * 出身设定数据（混合模式：先天随机 + 后天选择）
 *
 * 设计原则（基于全网调研结论）：
 * 1. 出身背景：随机生成，可 reroll，覆盖不同起点，集数加成有正有负
 * 2. 天赋词条：10 选 3 随机抽取，可换一组，正负面词条并存，参考《人生重开模拟器》
 * 3. 性格倾向：玩家主动选择，作为初始倾向但不锁死后续走向
 */

// ==================== 深宫风云（palace）====================

const PALACE_BACKGROUNDS: OriginBackground[] = [
  {
    id: 'palace-medic',
    name: '太医院学徒',
    description: '出身杏林世家，自幼识得百草，入宫后在太医院当差。懂药理是你的护身符，也是别人觊觎的把柄。',
    episodeBonus: 2,
  },
  {
    id: 'palace-maid',
    name: '浣衣局宫人',
    description: '家道中落被采选入宫，从最底层的浣衣局做起。无依无靠，但也因此没人把你放在眼里。',
    episodeBonus: -2,
  },
  {
    id: 'palace-noble',
    name: '世家嫡脉',
    description: '父亲官至三品，你以世家嫡脉的身份入宫，起点就比别人高。但家族的荣耀，也成了你的枷锁。',
    episodeBonus: 4,
  },
  {
    id: 'palace-criminal',
    name: '罪臣之后',
    description: '父亲获罪被斩，你被没入宫中为奴。人人避之不及，但你心里清楚，这份屈辱迟早要讨回来。',
    episodeBonus: -4,
  },
  {
    id: 'palace-merchant',
    name: '商贾之后',
    description: '父亲是江南首富，花了大价钱把你送进宫。宫里人看不起商人出身，但你的银钱足以打通不少关节。',
    episodeBonus: 1,
  },
  {
    id: 'palace-dancer',
    name: '教坊司伶人',
    description: '你因才情出众被选入教坊司，一曲动京华。才情是你的武器，也是招来祸患的根源。',
    episodeBonus: 1,
  },
  {
    id: 'palace-princess-maid',
    name: '公主伴读',
    description: '你是长公主的伴读，自幼在宫中长大，深谙后宫生存之道。公主的庇护是你的靠山，也是你站队的标志。',
    episodeBonus: 3,
  },
  {
    id: 'palace-tribute',
    name: '异国质子',
    description: '你是藩属国送来的质子，在这陌生的皇宫里举目无亲。异国的容貌让你格外引人注目，也让你成为众矢之的。',
    episodeBonus: -1,
  },
  {
    id: 'palace-cook',
    name: '御膳房厨子',
    description: '你在御膳房当差，一手好厨艺深得贵人赏识。拿捏住别人的胃口，有时候比拿捏住人心更管用。',
    episodeBonus: 0,
  },
  {
    id: 'palace-eunuch-child',
    name: '太监义子',
    description: '你是掌印太监的义子，在宫里算有几分体面。但太监的权势来得快去得也快，你得学会给自己留后路。',
    episodeBonus: 2,
  },
  {
    id: 'palace-nanny-child',
    name: '乳母之后',
    description: '你母亲是皇子的乳母，你自幼随母亲入宫。你和皇子一起长大，这份情分是别人求不来的，也是别人忌惮的。',
    episodeBonus: 2,
  },
  {
    id: 'palace-sinner',
    name: '辛者库罪奴',
    description: '你被罚入辛者库为奴，做着最下贱的苦役。在这里活着就是胜利，而你心里藏着一个不为人知的秘密。',
    episodeBonus: -3,
  },
  {
    id: 'palace-guardsman',
    name: '禁军之后',
    description: '你父亲是禁军统领，你自幼耳濡目染，懂得一些拳脚功夫。在深宫之中，能保护自己的不只是心机。',
    episodeBonus: 2,
  },
  {
    id: 'palace-calligrapher',
    name: '翰林书吏',
    description: '你是翰林院的书吏，写得一手好字，也看过太多机密奏折。知道得太多，有时候是福，有时候是祸。',
    episodeBonus: 1,
  },
  {
    id: 'palace-astrologer',
    name: '钦天监监生',
    description: '你精通星象占卜，能从星辰运行中窥探天机。宫里人敬畏你，也忌惮你，因为你知道他们的命数。',
    episodeBonus: 2,
  },
  {
    id: 'palace-seamstress',
    name: '尚衣局裁作',
    description: '你在尚衣局当差，精于裁制冠服，一针一线都关乎贵人的颜面。你能从衣裳的细节里看出宫里的风向变化。',
    episodeBonus: 0,
  },
  {
    id: 'palace-priestess',
    name: '祭祀神官',
    description: '你负责宫中祭祀大典，能与「先祖」沟通。这份神秘的身份让你在宫中地位特殊，也让你成为各方拉拢的对象。',
    episodeBonus: 1,
  },
  {
    id: 'palace-adoptive',
    name: '冷宫养子',
    description: '你被一位失势的妃嫔收养，从小在冷宫中长大。你懂得察言观色，也懂得在夹缝中求生。',
    episodeBonus: -1,
  },
  {
    id: 'palace-doctor-child',
    name: '御医之后',
    description: '你父亲是太医院院判，你自幼随父习医。你的医术在宫里是救命的本事，但也可能成为害人的工具。',
    episodeBonus: 3,
  },
  {
    id: 'palace-scholar',
    name: '新科进士',
    description: '你十年寒窗终于金榜题名，被选入翰林院。才华是你在宫中立足的根本，但文人相轻，你也成了别人的眼中钉。',
    episodeBonus: 2,
  },
  {
    id: 'palace-military',
    name: '羽林卫校尉',
    description: '你出身武勋世家，年纪轻轻就做到了羽林卫校尉。你负责宫中宿卫，手中握有兵权，也成了各方拉拢的对象。',
    episodeBonus: 3,
  },
  {
    id: 'palace-eunuch',
    name: '净身内侍',
    description: '你自幼净身入宫，从最低等的洒扫太监做起。你失去了男儿的根本，却也因此比任何人都更懂得宫里的规矩。',
    episodeBonus: -2,
  },
  {
    id: 'palace-clansman',
    name: '宗室子弟',
    description: '你是皇室旁支的宗室子弟，身份尊贵却也尴尬。你有皇室血脉，却也因此被皇帝暗中忌惮。',
    episodeBonus: 1,
  },
];

const PALACE_TALENTS: TalentCard[] = [
  // 正面天赋
  { id: 'p-t1', name: '过目不忘', description: '读过的医书典籍倒背如流', rarity: 'epic', episodeBonus: 3 },
  { id: 'p-t2', name: '心思缜密', description: '总能察觉别人忽略的细节', rarity: 'rare', episodeBonus: 2 },
  { id: 'p-t3', name: '仪表堂堂', description: '相貌英挺，气度不凡', rarity: 'legendary', episodeBonus: 4 },
  { id: 'p-t4', name: '玲珑七窍', description: '善于察言观色，洞悉人心', rarity: 'epic', episodeBonus: 3 },
  { id: 'p-t5', name: '福星高照', description: '运气总是比别人好一点点', rarity: 'rare', episodeBonus: 2 },
  { id: 'p-t6', name: '六艺精通', description: '礼乐射御书数皆有造诣', rarity: 'common', episodeBonus: 1 },
  { id: 'p-t7', name: '武学天赋', description: '身轻体健，有习武的底子', rarity: 'rare', episodeBonus: 2 },
  { id: 'p-t8', name: '父族显赫', description: '父族在朝中根基深厚', rarity: 'epic', episodeBonus: 3 },
  { id: 'p-t15', name: '辩才无碍', description: '能言善辩，巧舌如簧', rarity: 'epic', episodeBonus: 3 },
  { id: 'p-t16', name: '刀笔精通', description: '擅长书写奏章，文笔犀利', rarity: 'rare', episodeBonus: 2 },
  { id: 'p-t17', name: '城府深沉', description: '喜怒不形于色，心思难测', rarity: 'legendary', episodeBonus: 4 },
  // 负面天赋
  { id: 'p-t9', name: '体弱多病', description: '先天不足，时常需要调养', rarity: 'common', episodeBonus: -3 },
  { id: 'p-t10', name: '容貌平平', description: '相貌普通，难以引人注目', rarity: 'common', episodeBonus: -1 },
  { id: 'p-t11', name: '口无遮拦', description: '心直口快，容易得罪人', rarity: 'rare', episodeBonus: -2 },
  { id: 'p-t12', name: '优柔寡断', description: '遇事难决，常错失良机', rarity: 'common', episodeBonus: -2 },
  { id: 'p-t13', name: '名声不佳', description: '入宫前就有些不好的传闻', rarity: 'rare', episodeBonus: -3 },
  { id: 'p-t14', name: '体弱心善', description: '见不得别人受苦，容易心软', rarity: 'common', episodeBonus: -1 },
];

// ==================== 末日求生（apocalypse）====================

const APOCALYPSE_BACKGROUNDS: OriginBackground[] = [
  {
    id: 'apo-student',
    name: '大学生',
    description: '丧尸爆发时你正在宿舍，室友已经变异。你赤手空拳，只有一身书本知识和一部快没电的手机。',
    episodeBonus: -1,
  },
  {
    id: 'apo-doctor',
    name: '急诊科医生',
    description: '你在医院见证了第一波感染，懂急救和药理，这在末世是最值钱的本事。',
    episodeBonus: 3,
  },
  {
    id: 'apo-soldier',
    name: '退伍军人',
    description: '你曾在部队服役，身手矫健，熟悉武器和战术。但战争的创伤，让你有时会在夜里惊醒。',
    episodeBonus: 4,
  },
  {
    id: 'apo-civilian',
    name: '普通上班族',
    description: '你只是个朝九晚五的社畜，末日来临前最大的烦恼是KPI。没有特长，但你有强烈的求生欲。',
    episodeBonus: -2,
  },
  {
    id: 'apo-prepper',
    name: '末日生存狂',
    description: '你早就预言了这一天，地下室里囤满了物资和武器。别人嘲笑你多年，现在轮到你笑了。',
    episodeBonus: 2,
  },
  {
    id: 'apo-firefighter',
    name: '消防员',
    description: '你习惯了在灾难中救人，体能和勇气都是顶尖的。但这一次，你救的可能只有自己。',
    episodeBonus: 3,
  },
  {
    id: 'apo-nurse',
    name: 'ICU护士',
    description: '你在重症监护室工作，见惯了生死。你知道怎么处理伤口、怎么用药，这些知识在末世比金子还贵。',
    episodeBonus: 2,
  },
  {
    id: 'apo-rider',
    name: '外卖骑手',
    description: '你熟悉这座城市的每一条小巷，骑着电动车穿梭在楼宇之间。路熟、车快、能挨饿，这就是你的生存资本。',
    episodeBonus: 1,
  },
  {
    id: 'apo-coach',
    name: '健身房教练',
    description: '你一身腱子肉，力气大得能一拳放倒一个丧尸。但光有蛮力在末世可不够，你还得学会动脑子。',
    episodeBonus: 1,
  },
  {
    id: 'apo-streamer',
    name: '户外主播',
    description: '你常年在野外直播，懂求生、会找水源、能辨方向。你的粉丝早就散了，但你学到的本事还在。',
    episodeBonus: 2,
  },
  {
    id: 'apo-hacker',
    name: '程序员',
    description: '你是个黑客，能黑进任何系统。末世里网络基本瘫痪，但你懂电子设备、会修无线电，这让你成了香饽饽。',
    episodeBonus: 0,
  },
  {
    id: 'apo-store-owner',
    name: '便利店店长',
    description: '你守着一家小便利店，里面有食物、水和日用品。但你也知道，这些东西撑不了多久，而且会引来觊觎。',
    episodeBonus: 1,
  },
  {
    id: 'apo-farmer',
    name: '农场主',
    description: '你在郊区有一个小农场，有地、有粮、有工具。末世里能种出粮食的人，就是最有底气的人。',
    episodeBonus: 3,
  },
  {
    id: 'apo-hunter',
    name: '老猎人',
    description: '你在山里打了半辈子猎，追踪、设陷阱、用弓都是好手。丧尸在你眼里，不过是另一种猎物。',
    episodeBonus: 3,
  },
  {
    id: 'apo-engineer',
    name: '土木工程师',
    description: '你懂建筑结构，会设计防御工事。在末世里，一堵结实的墙比十把枪都管用。',
    episodeBonus: 2,
  },
  {
    id: 'apo-chemist',
    name: '化学老师',
    description: '你懂化学，能自制消毒剂、燃烧弹，甚至简易炸药。知识就是力量，在末世更是如此。',
    episodeBonus: 2,
  },
  {
    id: 'apo-pilot',
    name: '直升机飞行员',
    description: '你会开直升机，这在末世是最稀缺的技能之一。但你也知道，没有燃料，飞机就是一堆废铁。',
    episodeBonus: 4,
  },
  {
    id: 'apo-detective',
    name: '刑警',
    description: '你是个老刑警，观察力和判断力都是顶尖的。在末世里，人心比丧尸更可怕，而你最擅长看穿人心。',
    episodeBonus: 2,
  },
  {
    id: 'apo-yoga',
    name: '瑜伽教练',
    description: '你身体柔韧、平衡感极佳，还懂冥想减压。在高压的末世里，保持冷静和灵活就是你最大的优势。',
    episodeBonus: 0,
  },
  {
    id: 'apo-boxer',
    name: '职业拳击手',
    description: '你曾是职业拳王，拳头上的功夫是你最硬的底气。近战搏杀无人能敌，但你也知道，双拳难敌四手。',
    episodeBonus: 3,
  },
  {
    id: 'apo-special-forces',
    name: '特种兵',
    description: '你是退役特种兵，精通格斗、射击、爆破、野外生存。你的一身本事在末世就是最强的护身符。',
    episodeBonus: 5,
  },
  {
    id: 'apo-smuggler',
    name: '地下走私贩',
    description: '你常年游走在灰色地带，道上的门路比谁都熟。末世里物资流通全靠你这样的人，你也因此成了各方争抢的对象。',
    episodeBonus: 1,
  },
];

const APOCALYPSE_TALENTS: TalentCard[] = [
  // 正面天赋
  { id: 'a-t1', name: '野外生存', description: '懂得觅食、取水、搭建庇护所', rarity: 'epic', episodeBonus: 3 },
  { id: 'a-t2', name: '急救精通', description: '会处理伤口和常见病症', rarity: 'rare', episodeBonus: 2 },
  { id: 'a-t3', name: '力大无穷', description: '身体素质远超常人', rarity: 'legendary', episodeBonus: 4 },
  { id: 'a-t4', name: '百步穿杨', description: '投掷和射击精准度极高', rarity: 'epic', episodeBonus: 3 },
  { id: 'a-t5', name: '听觉敏锐', description: '能提前察觉丧尸靠近', rarity: 'rare', episodeBonus: 2 },
  { id: 'a-t6', name: '物资囤积', description: '末日来临前就准备了充足补给', rarity: 'rare', episodeBonus: 3 },
  { id: 'a-t7', name: '机械精通', description: '会修车、修发电机、改武器', rarity: 'epic', episodeBonus: 3 },
  { id: 'a-t8', name: '领袖气质', description: '天生能让别人信服和追随', rarity: 'legendary', episodeBonus: 4 },
  { id: 'a-t15', name: '近战搏杀', description: '近身格斗能力顶尖', rarity: 'epic', episodeBonus: 3 },
  { id: 'a-t16', name: '胆识过人', description: '临危不乱，越是危险越冷静', rarity: 'rare', episodeBonus: 2 },
  { id: 'a-t17', name: '人脉广阔', description: '道上黑白两道都有人脉', rarity: 'rare', episodeBonus: 3 },
  // 负面天赋
  { id: 'a-t9', name: '体弱多病', description: '需要定期服药，药在末世是奢侈品', rarity: 'rare', episodeBonus: -3 },
  { id: 'a-t10', name: '深度近视', description: '没了眼镜几乎寸步难行', rarity: 'common', episodeBonus: -2 },
  { id: 'a-t11', name: '胆小如鼠', description: '遇事容易惊慌失措', rarity: 'common', episodeBonus: -2 },
  { id: 'a-t12', name: '社交恐惧', description: '难以与人建立信任关系', rarity: 'common', episodeBonus: -1 },
  { id: 'a-t13', name: '旧伤缠身', description: '身上有旧伤，剧烈运动就会发作', rarity: 'rare', episodeBonus: -2 },
  { id: 'a-t14', name: '方向感差', description: '经常迷路，在末世这很致命', rarity: 'common', episodeBonus: -1 },
];

// ==================== 修仙问道（cultivation）====================

const CULTIVATION_BACKGROUNDS: OriginBackground[] = [
  {
    id: 'cul-mortal',
    name: '凡间少年',
    description: '你只是个普通山村少年，机缘巧合下踏上修仙路。没有宗门背景，全凭一腔孤勇。',
    episodeBonus: -2,
  },
  {
    id: 'cul-sect',
    name: '宗门世家',
    description: '你出生修仙世家，自幼在宗门长大，资源和人脉都比散修强得多。但家族的期望，也是你的压力。',
    episodeBonus: 4,
  },
  {
    id: 'cul-orphan',
    name: '孤儿散修',
    description: '自幼父母双亡，被一位游方道人收留，传了些基础功法便不知所踪。你独自一人，在修仙界摸爬滚打。',
    episodeBonus: -3,
  },
  {
    id: 'cul-scholar',
    name: '读书人',
    description: '你曾是寒窗苦读的书生，屡试不第后转而修仙。虽然修为起步晚，但你的悟性和心性远超同辈。',
    episodeBonus: 1,
  },
  {
    id: 'cul-royal',
    name: '皇室后裔',
    description: '你是凡间王朝的皇子，因身具灵根被宗门破格收录。凡间的权势在修仙界不值一提，但你的城府远超同龄人。',
    episodeBonus: 2,
  },
  {
    id: 'cul-herbalist',
    name: '药农之子',
    description: '你世代以采药为生，识得天下灵草。虽然修为平平，但在炼丹一道上有着得天独厚的优势。',
    episodeBonus: 1,
  },
  {
    id: 'cul-blacksmith',
    name: '铁匠之后',
    description: '你在铁匠铺长大，从小与炉火为伴。你的身体比寻常修士更坚韧，对炼器之道也有着天然的领悟。',
    episodeBonus: 0,
  },
  {
    id: 'cul-courtesan',
    name: '清客书生',
    description: '你曾是游走于权贵之门的清客，琴棋书画样样精通，也见惯了人情冷暖。一个偶然的机会让你踏上修仙路，你的才情和心机在修仙界依然是利器。',
    episodeBonus: 1,
  },
  {
    id: 'cul-escort',
    name: '镖局少主',
    description: '你是江湖镖局的少主，自幼习武，走南闯北。虽然修为不高，但你的江湖阅历和武艺让你在同阶中罕有敌手。',
    episodeBonus: 0,
  },
  {
    id: 'cul-prince',
    name: '落难皇子',
    description: '你曾是凡间王朝的皇子，国破家亡后被一位修仙者所救。你失去了一切，但也因此了无牵挂，修行之心比任何人都坚定。',
    episodeBonus: -1,
  },
  {
    id: 'cul-bandit',
    name: '山贼头目',
    description: '你占山为王多年，杀人越货无恶不作。一次劫镖中你抢到了一本修仙功法，从此踏上一条不同的路。',
    episodeBonus: -2,
  },
  {
    id: 'cul-monk',
    name: '佛家弟子',
    description: '你自幼在佛门长大，修的是禅武合一。虽然道家修士看不起佛门功法，但你的心性和肉身都远超同辈。',
    episodeBonus: 2,
  },
  {
    id: 'cul-merchant',
    name: '商号少东家',
    description: '你是修仙界最大商号的少东家，富可敌国。灵石、丹药、法宝，你想买什么就买什么，但你的修为全靠砸钱堆出来。',
    episodeBonus: 3,
  },
  {
    id: 'cul-fisher',
    name: '渔家少年',
    description: '你在海边长大，水性极佳。一个偶然的机会你在海底发现了一处洞府，从此踏上修仙路。你的水性在水战中无人能敌。',
    episodeBonus: 0,
  },
  {
    id: 'cul-hunter',
    name: '猎户之子',
    description: '你世代以打猎为生，箭术精准，追踪能力一流。虽然没有灵根，但你意外获得了一本体修功法，走上了以力证道之路。',
    episodeBonus: 1,
  },
  {
    id: 'cul-servant',
    name: '宗门杂役',
    description: '你是青云宗最底层的杂役弟子，每天干着劈柴挑水的活。但你利用一切机会偷偷修炼，期待有朝一日能一飞冲天。',
    episodeBonus: -1,
  },
  {
    id: 'cul-artisan',
    name: '符师学徒',
    description: '你是一位老符师的学徒，画符天赋极高。虽然修为不高，但你画出的符箓连金丹真人都抢着要。',
    episodeBonus: 2,
  },
  {
    id: 'cul-prophet',
    name: '占卜师',
    description: '你天生灵觉敏锐，能隐约感知到未来的片段。这份能力让你在修仙界屡获机缘，但也让你看到了太多不该看的东西。',
    episodeBonus: 2,
  },
  {
    id: 'cul-swordsman',
    name: '江湖剑客',
    description: '你是凡间赫赫有名的剑客，一剑霜寒十四州。你不屑于修仙界的繁文缛节，只相信手中的剑。你的剑意，连修士都要忌惮三分。',
    episodeBonus: 1,
  },
  {
    id: 'cul-general',
    name: '沙场将军',
    description: '你曾是凡间王朝的大将军，统率千军万马，战功赫赫。一次边境大战中你意外觉醒灵根，从此放下兵符，踏上修仙之路。你的统御之才在修仙界依然有用。',
    episodeBonus: 2,
  },
  {
    id: 'cul-assassin',
    name: '影阁杀手',
    description: '你曾是凡间第一杀手组织影阁的王牌，杀人于无形。你厌倦了刀口舔血的日子，偶然得到一本修仙功法后金盆洗手。你的潜行和暗杀之术，在修仙界依然致命。',
    episodeBonus: 1,
  },
  {
    id: 'cul-hermit',
    name: '隐世道人',
    description: '你自幼被一位隐世高人收为弟子，在深山之中修炼了三十年。你不懂人情世故，修为却远超同辈。下山历练的你，对这个世界充满了好奇。',
    episodeBonus: 3,
  },
];

const CULTIVATION_TALENTS: TalentCard[] = [
  // 正面天赋
  { id: 'c-t1', name: '天灵根', description: '单属性天灵根，修炼速度一日千里', rarity: 'legendary', episodeBonus: 5 },
  { id: 'c-t2', name: '双灵根', description: '双属性灵根，资质上等', rarity: 'epic', episodeBonus: 3 },
  { id: 'c-t3', name: '天生道体', description: '身体天生契合大道，修炼事半功倍', rarity: 'legendary', episodeBonus: 4 },
  { id: 'c-t4', name: '过目不忘', description: '功法秘籍看一遍就能记住', rarity: 'epic', episodeBonus: 3 },
  { id: 'c-t5', name: '剑心通明', description: '对剑道有天然的领悟力', rarity: 'epic', episodeBonus: 3 },
  { id: 'c-t6', name: '丹道天赋', description: '炼丹时成功率远高于常人', rarity: 'rare', episodeBonus: 2 },
  { id: 'c-t7', name: '气运加身', description: '总能在险境中遇到机缘', rarity: 'rare', episodeBonus: 2 },
  { id: 'c-t8', name: '心境通透', description: '不易走火入魔，心魔难侵', rarity: 'rare', episodeBonus: 2 },
  { id: 'c-t15', name: '天生神力', description: '肉身力量远超同阶修士', rarity: 'epic', episodeBonus: 3 },
  { id: 'c-t16', name: '阵道天赋', description: '对阵法有天然的领悟力', rarity: 'epic', episodeBonus: 3 },
  { id: 'c-t17', name: '统御之才', description: '天生能让修士追随和信服', rarity: 'rare', episodeBonus: 2 },
  // 负面天赋
  { id: 'c-t9', name: '五灵根', description: '五行俱全却样样平庸，修炼进境极慢', rarity: 'common', episodeBonus: -4 },
  { id: 'c-t10', name: '四灵根', description: '四属性灵根，资质下等', rarity: 'common', episodeBonus: -2 },
  { id: 'c-t11', name: '魔根深种', description: '心中藏有魔气，随时可能入魔', rarity: 'rare', episodeBonus: -3 },
  { id: 'c-t12', name: '经脉堵塞', description: '经脉先天不畅，吸收灵气困难', rarity: 'rare', episodeBonus: -3 },
  { id: 'c-t13', name: '凡心难断', description: '执念太重，难以突破心境', rarity: 'common', episodeBonus: -2 },
  { id: 'c-t14', name: '体质孱弱', description: '承受不住太强的功法反噬', rarity: 'common', episodeBonus: -2 },
];

// 按世界观导出
export const ORIGINS: Record<WorldviewId, { backgrounds: OriginBackground[]; talents: TalentCard[] }> = {
  palace: { backgrounds: PALACE_BACKGROUNDS, talents: PALACE_TALENTS },
  apocalypse: { backgrounds: APOCALYPSE_BACKGROUNDS, talents: APOCALYPSE_TALENTS },
  cultivation: { backgrounds: CULTIVATION_BACKGROUNDS, talents: CULTIVATION_TALENTS },
};

export function getOriginData(worldviewId: WorldviewId) {
  return ORIGINS[worldviewId];
}

/**
 * 从天赋池中随机抽取 10 张（保证稀有度分布合理）
 * 参考《人生重开模拟器》的十连抽机制
 */
export function rollTalents(pool: TalentCard[], count = 10): TalentCard[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * 随机选择一个出身背景
 */
export function rollBackground(pool: OriginBackground[]): OriginBackground {
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/**
 * 稀有度颜色映射
 */
export const RARITY_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  common: { color: '#6b7280', bg: '#f3f4f6', label: '凡品' },
  rare: { color: '#2563eb', bg: '#dbeafe', label: '良品' },
  epic: { color: '#9333ea', bg: '#f3e8ff', label: '珍品' },
  legendary: { color: '#d97706', bg: '#fef3c7', label: '仙品' },
};
