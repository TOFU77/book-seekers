import type { Case } from '../../types.js';

/**
 * 事件「河原の煙」
 *
 * 河川敷のバーベキュー客に苦情を連発する焼き鳥屋。だが自身の煙も同じ。
 * 「片方は商売、片方は迷惑」という分類の物語を、同じ煙という境界で崩す。
 * 鍵になる棚: 理法(苦情記録)・技芸(営業)・物証(風向き)。
 */
export const KAWARA: Case = {
  id: 'kawara',
  title: '河原の煙',
  hook: '河川敷でバーベキューをする若いグループへ、近くの焼き鳥屋が「煙い、臭い」と役所に苦情を連発している。' +
    'ところが、その焼き鳥屋自身の煙も相当なものだ、と近所が苦笑いで持ち込んだ。',
  voices: [
    { who: 'BBQグループの一人', line: '僕らだけ何回も注意されて。あの店の煙は、いいんですか。' },
    { who: '河原の常連釣り人', line: 'どっちも煙いよ。ただ、片方だけが役所に電話してるだけでね。' },
    { who: '商店会の役員', line: 'あの店も昔は河原で商売しとったんだ。人のことは言えんよ。' },
    { who: '藤井本人', line: 'うちは客商売だ。あいつらは遊びだろう。同じ煙でも、意味が違う。' },
  ],
  layers: [
    {
      depth: 1,
      title: '焼き鳥屋の苦情',
      turns: 8,
      epigraph: {
        text: '同じものが、名前を変えるだけで、迷惑にも生業にもなる。',
        source: '分類と名づけ',
      },
      resolution: [
        '藤井は苦情をやめるとは言わなかった。',
        'ただ、役所に残った通報記録が、日付も時間も自分の店の営業中に集中していることを見せられて、口をつぐんだ。',
        '煙に生業と遊びの区別はない。区別をつけていたのは煙ではなく、電話をかける指のほうだった。',
      ],
      failure: [
        '「商売の苦労も知らんくせに」と藤井は言った。',
        '苦労を持ち出されると、煙の話をしていたはずが、こちらが商売を軽んじる人間にされてしまう。',
      ],
      opponent: {
        name: '藤井',
        role: '焼き鳥「とり藤」店主',
        justification:
          'こちらは生業として煙を出している。向こうは遊びで河原を汚しているだけだ。' +
          '同じように見えて、片方は町の商売、片方はただの迷惑だ。一緒にされては困る。',
        triggers: [
          '自分の商売を「ただの煙」と同一視されるとき',
          '昔の自分の商売を持ち出されるとき',
          '苦情の偏りを指摘されるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 22,
        // 摩擦点: 過剰と欠乏(受忍限度を超えるのはどちらの煙か)
        weakThemes: ['kajo', 'kiroku'],
        resistantShelves: ['seken'],
      },
      psych: {
        kind: 'shinri',
        hardness: 32,
        weakThemes: ['bunrui', 'kyokai'],
        resistantShelves: ['gigei'],
      },
      notebook: [
        { id: 'w-tsuho', label: '役所の苦情通報記録', kind: 'shoko', certainty: 3, shelf: 'riho' },
        { id: 'w-eigyo', label: '焼き鳥屋の営業時間表', kind: 'shoko', certainty: 2, shelf: 'gigei' },
        { id: 'w-tsuri', label: '「どっちも煙い」と言う釣り人', kind: 'shogen', certainty: 1, shelf: 'tochi' },
        { id: 'w-mukashi', label: '店が昔河原で商売した記録', kind: 'dogu', certainty: 2, shelf: 'tochi' },
        { id: 'w-fuko', label: '風向きと煙の流れの図', kind: 'dogu', certainty: 2, shelf: 'busshou' },
        { id: 'w-kensaku', label: '検索で出た煙害の受忍限度の基準', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 4,
      locations: [
        { id: 'yakusho', label: '役所の生活環境課', kind: 'kiroku', yields: ['w-tsuho', 'w-kensaku'], insight: 0 },
        { id: 'kasenjiki', label: '河川敷', kind: 'genba', yields: ['w-fuko', 'w-tsuri'], insight: 1 },
        { id: 'shotenkai', label: '商店会の役員', kind: 'hito', yields: ['w-mukashi', 'w-eigyo'], insight: 2 },
        { id: 'fujii', label: '藤井本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'mochizuki',
    },
  ],
};
