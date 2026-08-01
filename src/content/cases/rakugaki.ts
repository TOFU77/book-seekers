import type { Case } from '../../types.js';

/**
 * 事件「壁の落書き」
 *
 * 商店街の落書きを、自治会長が特定の高校生の仕業と決めつける。
 * 「見れば分かる」という思い込みを、記録と見ることの主題で崩す。
 * 鍵になる棚: 理法(勤務記録)・物証(塗料)・趣味(写真)。
 */
export const RAKUGAKI: Case = {
  id: 'rakugaki',
  title: '壁の落書き',
  hook: 'シャッター商店街の閉店した店の壁に、大きな落書き。' +
    '自治会長が「いつも夜に集まっているあの高校生だ」と決めつけ、警察に届けると息巻いている。',
  voices: [
    { who: '名指しされた高校生', line: 'あの夜、俺バイトだったんですけど。誰も信じてくれない。' },
    { who: '商店街の店主', line: 'まあ、あの子らが騒がしいのは本当だからねえ。疑われても仕方ない面はある。' },
    { who: '自治会の若手', line: '会長、昔からあの家の子を目の敵にしてるんですよ。' },
    { who: '木戸本人', line: '最近の若い者を見ていれば分かる。証拠なんぞ、後からいくらでも出てくる。' },
  ],
  layers: [
    {
      depth: 1,
      title: '自治会長の決めつけ',
      turns: 8,
      epigraph: {
        text: '見えていると信じるとき、人は見ていないものまで見てしまう。',
        source: '見ることと見られること',
      },
      resolution: [
        '木戸は決めつけを撤回しなかった。',
        'ただ、少年のバイト先の勤務記録と、落書きの塗料が乾く時間を並べたとき、彼の「見れば分かる」は宙に浮いた。',
        '見てきた年月は本物だ。だが、見てきたことと、見えていることは、同じではなかった。',
      ],
      failure: [
        '「じゃあ他に誰がやるって言うんだ」と木戸は言った。',
        '他にいない、を根拠にされると、いない誰かを探すこちらのほうが分が悪くなる。',
      ],
      opponent: {
        name: '木戸',
        role: '商店街自治会長',
        justification:
          'あの年頃の子が夜中に集まって、ろくなことをするわけがない。' +
          '長年この町を見てきた自分の目は確かだ。誰がやったかなど、見ていれば分かる。',
        triggers: [
          '自分の見立てを「思い込み」と言われるとき',
          '昔の若い者と今を一緒にするなと返されるとき',
          '長年の経験を根拠にならないと切られるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 20,
        // 摩擦点: 見ることと見られること(その時刻、その場所で見えたか)
        weakThemes: ['shisen', 'kiroku'],
        resistantShelves: ['jinshin'],
      },
      psych: {
        kind: 'shinri',
        hardness: 30,
        // 摩擦点: 継承と断絶(昔の若い者と今を同じ目で見る)
        weakThemes: ['keisho', 'shisen'],
        resistantShelves: ['seken'],
      },
      notebook: [
        { id: 'r-baito', label: '少年のバイト先の勤務記録', kind: 'shoko', certainty: 3, shelf: 'riho' },
        { id: 'r-toryo', label: '落書きの塗料と乾燥時間', kind: 'shoko', certainty: 2, shelf: 'busshou' },
        { id: 'r-shashin', label: '朝倉が撮った落書きの時系列', kind: 'dogu', certainty: 3, shelf: 'shumi' },
        { id: 'r-wakate', label: '「昔から目の敵」と言う若手', kind: 'shogen', certainty: 1, shelf: 'seken' },
        { id: 'r-shikaku', label: '商店街の防犯カメラの死角図', kind: 'dogu', certainty: 2, shelf: 'gigei' },
        { id: 'r-kensaku', label: '検索で出た器物損壊の立件例', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 4,
      locations: [
        { id: 'kabe', label: '落書きの壁', kind: 'genba', yields: ['r-toryo', 'r-shashin'], insight: 0 },
        { id: 'jichikai', label: '自治会の事務所', kind: 'kiroku', yields: ['r-shikaku', 'r-kensaku'], insight: 0 },
        { id: 'wakate', label: '自治会の若手', kind: 'hito', yields: ['r-wakate', 'r-baito'], insight: 2 },
        { id: 'kido', label: '木戸本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'asakura',
      holds: 'mochizuki',
    },
  ],
};
