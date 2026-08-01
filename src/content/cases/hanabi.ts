import type { Case } from '../../types.js';

/**
 * 事件「花火の後」
 *
 * 花火大会翌朝のゴミの山。実行委員長は「見物人のマナー」と言うが、
 * 去年まであった清掃費が今年の会計から消えている。
 * 「委員会の責任ではない」という代理の物語を、預かり金の記録で崩す。
 * 鍵になる棚: 勘定(会計)・世間・土地。
 */
export const HANABI: Case = {
  id: 'hanabi',
  title: '花火の後',
  hook: '毎年恒例の川開き花火大会。翌朝の河川敷にゴミの山。' +
    '実行委員長は「見物人のマナーの問題」と繰り返すが、去年まであった清掃費が今年の会計から消えている、と信金の瀬能が気づいた。',
  voices: [
    { who: '清掃ボランティア', line: '今年は人手も袋も足りなくて。去年はちゃんと用意されてたのに。' },
    { who: '露店の組合員', line: '委員長、今年から清掃は"みんなの善意で"って言い出してね。' },
    { who: '前の実行委員長', line: '清掃費はな、寄付の中からちゃんと取ってあったんだ。無くなるはずがない。' },
    { who: '大槻本人', line: '片付けは見物客の良識の問題だ。委員会が客のマナーまで面倒を見る筋合いはない。' },
  ],
  layers: [
    {
      depth: 1,
      title: '実行委員長の言い分',
      turns: 8,
      epigraph: {
        text: '他人のために集めた金は、いつから自分の裁量になったのか。',
        source: '代理と信任',
      },
      resolution: [
        '大槻は会計の不備を認めはしなかった。',
        'ただ、去年まで「清掃費」として計上されていた額が、今年は費目ごと消えていることを、前の委員長の帳面と並べられて、黙り込んだ。',
        '委員会は寄付を預かる代理人だ。預かった金の使い道を一人で書き換えたなら、それはもう良識の話ではない。',
      ],
      failure: [
        '「ボランティアの善意にケチをつけるのか」と大槻は言った。',
        '善意を盾にされると、金の流れを問うていたこちらが、人の親切を疑う嫌な人間にされる。',
      ],
      opponent: {
        name: '大槻',
        role: '花火大会 実行委員長',
        justification:
          '花火を打ち上げるのが委員会の仕事だ。見物人が捨てたゴミまで、なぜ委員会が責めを負う。' +
          '清掃は本来、来た者一人ひとりの良識でやるべきものだ。',
        triggers: [
          '委員会の責任範囲を広く取られるとき',
          '消えた清掃費を問われるとき',
          '「善意で」と言った件を蒸し返されるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 22,
        // 摩擦点: 代理と信任(委員会は寄付を預かる代理人)
        weakThemes: ['dairi', 'kiroku'],
        resistantShelves: ['seken'],
      },
      psych: {
        kind: 'shinri',
        hardness: 32,
        // 摩擦点: 過剰と欠乏(足りなかった袋、消えた清掃費)
        weakThemes: ['kajo', 'dairi'],
        resistantShelves: ['tochi'],
      },
      notebook: [
        { id: 'h-kaikei', label: '今年度の大会会計書', kind: 'shoko', certainty: 3, shelf: 'kanjo' },
        { id: 'h-kyonen', label: '去年の清掃費の計上記録', kind: 'shoko', certainty: 3, shelf: 'kanjo' },
        { id: 'h-mae', label: '前委員長の引き継ぎ帳', kind: 'shoko', certainty: 2, shelf: 'seken' },
        { id: 'h-borantia', label: '「袋が足りなかった」と言うボランティア', kind: 'shogen', certainty: 1, shelf: 'seken' },
        { id: 'h-roten', label: '「善意でと言い出した」と言う露店組合員', kind: 'shogen', certainty: 2, shelf: 'tochi' },
        { id: 'h-kensaku', label: '検索で出た他の花火大会の清掃予算例', kind: 'sokuseki', certainty: 2, shelf: 'kanjo' },
      ],
      days: 4,
      locations: [
        { id: 'jimukyoku', label: '大会実行委員会の事務局', kind: 'kiroku', yields: ['h-kaikei', 'h-kyonen'], insight: 0 },
        { id: 'maeiin', label: '前の実行委員長', kind: 'hito', yields: ['h-mae', 'h-kensaku'], insight: 2 },
        { id: 'roten', label: '露店の組合員', kind: 'hito', yields: ['h-roten', 'h-borantia'], insight: 1 },
        { id: 'otsuki', label: '大槻本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'senou',
      holds: 'mochizuki',
    },
  ],
};
