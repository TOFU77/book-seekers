import type { Case } from '../../types.js';

/**
 * 事件3「祭りの積立」
 *
 * 変化球。相手が**土地の慣習で武装している**ため、
 * 普段は心理の壁に効く民俗学(土地の棚)が通じない。
 *
 * 「昔からこうしてきた」を崩すには、継承の話ではなく
 * 記録の話(数字・編集)で入る必要がある。棚の選び方が試される。
 */
export const TSUMITATE: Case = {
  id: 'tsumitate',
  title: '祭りの積立',
  hook: '東町内会の秋祭りの積立金が、今年になって急に足りないという話が出ている。' +
    '会計を三十年やっている老人は「毎年こうしてきた」の一点張りだという。',
  voices: [
    { who: '町内会の新しい役員', line: '帳面を見せてくださいと言ったら、若い者には分からんと言われまして。' },
    { who: '直会に出た主婦', line: 'あの晩、十二人しかいなかったわよ。三十人分の酒って、どこへ行ったのかしらね。' },
    { who: '前の会長', line: '飯塚さんがいなかったら、祭り自体がとっくに無くなってますよ。' },
    { who: '飯塚本人', line: '領収書の出ない金が要るんだ。それを分かる者が、もう誰もおらん。' },
  ],
  layers: [
    {
      depth: 1,
      title: '合わない帳面',
      turns: 8,
      epigraph: {
        text: '三十年続いたということは、三十年ぶん疑われずに済んだ、というだけである。',
        source: '逸脱の常態化',
      },
      resolution: [
        '飯塚は帳面を閉じて、去年の祭りの写真を長く見ていた。',
        '領収書の出ない金が要る、というのは本当だった。',
        '本当のことを言い続けてさえいれば、嘘をつかずに済むと思っていたのだろう。',
        '足りなかったのは正直さではなく、書き方のほうだった。',
      ],
      failure: [
        '「毎年こうしてきた」と飯塚は言った。それ以上は何も言わなかった。',
        '三十年を一度の座談で崩そうというのが、そもそも無理だったのかもしれない。',
      ],
      opponent: {
        name: '飯塚',
        role: '東町内会 会計(三十年目)',
        justification:
          '祭りの金は、領収書の出ないところにこそ要る。' +
          '直会の酒も、手伝いへの心づけも、帳面には書けない。' +
          '三十年、誰にも文句を言われずにやってきた。',
        triggers: [
          '長年の慣習を杜撰さと呼ばれるとき',
          '記録に残らない仕事を無かったことにされるとき',
          '若い者に手順を教えろと言われるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 22,
        // 摩擦点: 過剰と欠乏(集めすぎた金の使い道)
        weakThemes: ['kajo', 'kiroku'],
        resistantShelves: ['tochi'],
      },
      psych: {
        kind: 'shinri',
        hardness: 32,
        // 「昔から続いてきた」という継承の物語。継承と断絶が急所。
        weakThemes: ['keisho', 'kiroku'],
        // 土地の慣習を持ち出されると、民俗学はむしろ相手の武器になる
        resistantShelves: ['tochi', 'seken'],
      },
      notebook: [
        { id: 't-chomen', label: '桁の揃いすぎた出金欄', kind: 'shoko', certainty: 3, shelf: 'suji' },
        { id: 't-ryoshu', label: '同じ筆跡の領収書三枚', kind: 'shoko', certainty: 3, shelf: 'busshou' },
        { id: 't-naorai', label: '直会の実際の参加人数', kind: 'shogen', certainty: 2, shelf: 'seken' },
        { id: 't-kaiho', label: '町内会報の決算報告', kind: 'shoko', certainty: 2, shelf: 'henshu' },
        { id: 't-shashin', label: '去年の祭りの写真', kind: 'dogu', certainty: 2, shelf: 'shumi' },
        { id: 't-kensaku', label: '検索で出た町内会費の判例', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 4,
      locations: [
        { id: 'choba', label: '町内会の帳場', kind: 'kiroku', yields: ['t-chomen', 't-ryoshu'], insight: 0 },
        { id: 'naorai', label: '直会に出た人たち', kind: 'hito', yields: ['t-naorai'], insight: 2 },
        { id: 'kominkan', label: '公民館の書棚', kind: 'kiroku', yields: ['t-kaiho', 't-kensaku'], insight: 0 },
        { id: 'matsuri', label: '去年の祭りの記録', kind: 'genba', yields: ['t-shashin'], insight: 1 },
        { id: 'iizuka', label: '飯塚本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'asakura',
    },
    {
      depth: 2,
      title: '黙認していた歴代の役員',
      turns: 10,
      epigraph: {
        text: '誰も言わなかったことは、全員が言わないと決めたことである。',
        source: '沈黙の合意',
      },
      resolution: [
        '役員会は、誰ひとり飯塚を責めなかった。',
        '責めれば、自分たちが三十年のあいだ何をしていたかを、言わねばならなくなる。',
        '帳簿の穴より、議事録の空白のほうが大きかった。',
      ],
      failure: [
        '「誰も損をしていない」と役員会は言った。',
        '損をした人間の名前を、こちらは一つも挙げられなかった。',
      ],
      opponent: {
        name: '東町内会 役員会',
        role: '歴代の会長たち',
        justification:
          '飯塚さんに任せておけば祭りは回った。' +
          '細かいことを言い出せば、やる人間がいなくなる。' +
          '誰も損をしていないのだから、これでよかったのだ。',
        triggers: [
          '全員が知っていたことを指摘されるとき',
          '「誰も損をしていない」が崩されるとき',
          '次の代に引き継げないと言われるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 32,
        // 摩擦点: 代理と信任(積立を一人で采配する正当性)
        weakThemes: ['dairi', 'kiroku'],
        resistantShelves: ['suji', 'tochi'],
      },
      psych: {
        kind: 'shinri',
        hardness: 68,
        // 誰も言わないという形の合意。沈黙の棚が要る。
        weakThemes: ['kokuhaku', 'keisho'],
        resistantShelves: ['tochi', 'seken', 'jinshin'],
      },
      notebook: [
        { id: 't2-giji', label: '議題に上がらなかった十年分', kind: 'shoko', certainty: 3, shelf: 'chinmoku' },
        { id: 't2-inkan', label: '同じ日に押された歴代の印', kind: 'shoko', certainty: 2, shelf: 'busshou' },
        { id: 't2-motoyakuin', label: '「気づいてはいた」と言う元役員', kind: 'shogen', certainty: 3, shelf: 'chinmoku' },
        { id: 't2-kaikei', label: '引継書の存在しない引継ぎ', kind: 'shoko', certainty: 2, shelf: 'henshu' },
        { id: 't2-kensaku', label: '検索で出た自治会会計の指針', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 5,
      locations: [
        { id: 'junen', label: '十年分の議事録', kind: 'kiroku', yields: ['t2-giji', 't2-kaikei'], insight: 1 },
        { id: 'rekidai', label: '歴代の役員', kind: 'hito', yields: ['t2-motoyakuin'], insight: 2 },
        { id: 'hikitsugi', label: '引継ぎの書類箱', kind: 'kiroku', yields: ['t2-inkan', 't2-kensaku'], insight: 0 },
        { id: 'yakuinkai', label: '役員会', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'senou',
      holds: 'mochizuki',
    },
  ],
};
