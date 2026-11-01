import type { Worldview } from '../types';

export const WORLDVIEWS: Worldview[] = [
  {
    id: 'palace',
    name: '深宫风云',
    tagline: '测测你在后宫能活几集',
    description: '波诡云谲的后宫之中，步步惊心。你能在这权力的游戏中存活多久？',
    coverEmoji: '🏯',
    accentColor: '#8B4513',
    bgGradient: 'from-amber-50 to-orange-100',
    episodeMax: 80,
    seasons: [
      { name: '一季·入宫', startEpisode: 1, endEpisode: 20 },
      { name: '二季·争宠', startEpisode: 21, endEpisode: 45 },
      { name: '三季·夺嫡', startEpisode: 46, endEpisode: 70 },
      { name: '四季·登顶', startEpisode: 71, endEpisode: 80 },
    ],
  },
  {
    id: 'apocalypse',
    name: '末日求生',
    tagline: '丧尸末世，你能活到第几集',
    description: '病毒肆虐，丧尸横行。在资源匮乏的末世，你的选择将决定生死。',
    coverEmoji: '🧟',
    accentColor: '#E94560',
    bgGradient: 'from-gray-100 to-slate-200',
    episodeMax: 24,
    seasons: [
      { name: '一季·骤变', startEpisode: 1, endEpisode: 8 },
      { name: '二季·求生', startEpisode: 9, endEpisode: 16 },
      { name: '三季·归途', startEpisode: 17, endEpisode: 24 },
    ],
  },
  {
    id: 'cultivation',
    name: '修仙问道',
    tagline: '测测你的修仙天赋与结局',
    description: '灵气复苏，宗门林立。你是平平无奇还是天选之子？一测便知。',
    coverEmoji: '⚔️',
    accentColor: '#2D6A4F',
    bgGradient: 'from-indigo-50 to-purple-100',
    episodeMax: 120,
    seasons: [
      { name: '一季·入世', startEpisode: 1, endEpisode: 30 },
      { name: '二季·筑基', startEpisode: 31, endEpisode: 60 },
      { name: '三季·问道', startEpisode: 61, endEpisode: 90 },
      { name: '四季·飞升', startEpisode: 91, endEpisode: 120 },
    ],
  },
];

export function getWorldview(id: string): Worldview | undefined {
  return WORLDVIEWS.find((w) => w.id === id);
}
