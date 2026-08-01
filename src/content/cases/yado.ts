import type { Case } from '../../types.js';

/**
 * 事件「宿の評判」
 *
 * 客足の落ちた旅館の若旦那が、口コミを自作自演。
 * 「宣伝と嘘に線などない」という分類の物語を、
 * 投稿時刻とアクセス記録で崩す。鍵になる棚: 数字・技芸・言葉。
 */
export const YADO: Case = {
  id: 'yado',
  title: '宿の評判',
  hook: '客足の落ちた温泉旅館で、ネットの口コミに不自然な絶賛が並び始めた。' +
    '逆に、通りの向かいの新しい宿には、身に覚えのない酷評が続いている。若旦那が裏で書き分けているらしい、と仲居がこぼした。',
  voices: [
    { who: '仲居', line: '若旦那、パソコンの前で夜中まで。お客さんの名前で書いてるみたいで。' },
    { who: '向かいの宿の主人', line: 'うちの悪口、泊まってもいない人が書くんですよ。誰の仕業かは、まあ。' },
    { who: '観光協会の人', line: 'どこもやってることでしょう、と言えばそれまでですが……。' },
    { who: '梶原本人', line: '宣伝の何が悪い。生き残るために必死なだけだ。どこの宿もやっていることだ。' },
  ],
  layers: [
    {
      depth: 1,
      title: '若旦那の自作自演',
      turns: 8,
      epigraph: {
        text: '宣伝と嘘の間に線を引かない者は、いつか自分の宿さえ信じられなくなる。',
        source: '分類と名づけ',
      },
      resolution: [
        '梶原は書き込みを消すとは言わなかった。',
        'ただ、絶賛の口コミの投稿時刻が、どれも自分の宿の帳場のパソコンが動いていた時間と重なっていることを見せられて、手が止まった。',
        '宣伝と嘘に線がないなら、良い評判もいつか嘘になる。彼が最後まで手放したくなかったのは、その線のほうだった。',
      ],
      failure: [
        '「きれいごとで宿が続くかよ」と梶原は言った。',
        'きれいごとと言われてしまうと、正しさを説くこちらが、商売を知らない甘い人間に見えてくる。',
      ],
      opponent: {
        name: '梶原',
        role: '旅館「月ヶ瀬」若旦那',
        justification:
          '客が減れば宿は潰れる。少し評判を作ることの何が悪い。宣伝と嘘の間に、はっきりした線などない。' +
          '生き残るために皆やっていることだ。',
        triggers: [
          '宣伝を嘘と呼ばれるとき',
          '「皆やっている」を否定されるとき',
          '宿を潰す気かと問い返せなくされるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 22,
        // 摩擦点: 見ることと見られること(評判という見られ方を作る)
        weakThemes: ['shisen', 'kiroku'],
        resistantShelves: ['shumi'],
      },
      psych: {
        kind: 'shinri',
        hardness: 32,
        weakThemes: ['bunrui', 'kokuhaku'],
        resistantShelves: ['seken'],
      },
      notebook: [
        { id: 'y-kuchikomi', label: '不自然な絶賛の投稿時刻一覧', kind: 'shoko', certainty: 3, shelf: 'suji' },
        { id: 'y-log', label: '帳場のパソコンのアクセス記録', kind: 'shoko', certainty: 3, shelf: 'gigei' },
        { id: 'y-mukai', label: '向かいの宿への酷評の文面', kind: 'dogu', certainty: 2, shelf: 'kotoba' },
        { id: 'y-nakai', label: '「夜中まで書いていた」と言う仲居', kind: 'shogen', certainty: 2, shelf: 'jinshin' },
        { id: 'y-bunmen', label: '複数の口コミに共通する言い回し', kind: 'dogu', certainty: 2, shelf: 'kotoba' },
        { id: 'y-kensaku', label: '検索で出たステマ規制の考え方', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 4,
      locations: [
        { id: 'choba', label: '旅館の帳場', kind: 'genba', yields: ['y-log', 'y-kuchikomi'], insight: 0 },
        { id: 'mukai', label: '向かいの宿', kind: 'hito', yields: ['y-mukai', 'y-bunmen'], insight: 1 },
        { id: 'nakai', label: '旅館の仲居', kind: 'hito', yields: ['y-nakai', 'y-kensaku'], insight: 2 },
        { id: 'kajiwara', label: '梶原本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'asakura',
      holds: 'mochizuki',
    },
  ],
};
