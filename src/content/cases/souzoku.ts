import type { Case } from '../../types.js';

/**
 * 事件「実家の鍵」
 *
 * 層2まで。介護を担った長男の囲い込みを崩すと、その奥に、
 * 家督の慣わしと、誰も口にしなかった生前の一枚の畑が出てくる。
 * 層2では奥の棚（沈黙・来歴）を読んでいないと崩せない。
 * 鍵になる棚: 層1=理法・勘定・物語 / 層2=沈黙・来歴・土地。
 */
export const SOUZOKU: Case = {
  id: 'souzoku',
  title: '実家の鍵',
  hook: '亡くなった親の空き家を、同居して介護していた長男が、他の兄妹に断りなく鍵を替え、位牌と権利証を持ち出した。' +
    '「面倒を見たのは自分だ」と譲らない、と親戚がサロンに持ち込んだ。',
  voices: [
    { who: '次女', line: '介護を任せきりにした私たちも悪い。でも、家まで一人のものにするのは違う。' },
    { who: '近所の民生委員', line: 'あそこの長男さん、本当によう世話しとったよ。それは、みんな見とる。' },
    { who: '司法書士', line: '権利証を持っていても、それだけで相続が決まるわけじゃないんですがね。' },
    { who: '相沢本人', line: '十年、親父の下の世話までしたのは俺だ。お前らは盆と正月に顔を出しただけだろう。' },
  ],
  layers: [
    {
      depth: 1,
      title: '長男の囲い込み',
      turns: 8,
      epigraph: {
        text: '受け継いだものを守った者は、いつしかそれを自分の報酬と勘定する。',
        source: '継承と所有',
      },
      resolution: [
        '相沢は鍵を返すとは言わなかった。',
        'ただ、介護の日々を綴った古い日記を出したとき、そこにあったのは報酬の要求ではなく、疲れた一人の人間の記録だった。',
        '面倒を見たことは本物だ。だが、労いは相続とは別の勘定だ。二つを混ぜたまま、彼は一人で背負い続けていた。',
      ],
      failure: [
        '「じゃあ十年、誰が親父を看たんだよ」と相沢は言った。',
        'その問いに黙ってしまえば、家を分けろというこちらの言い分は、薄情な取り分の話になる。',
      ],
      opponent: {
        name: '相沢',
        role: '故人の長男',
        justification:
          '十年、親の介護を一人で背負ってきた。他の兄妹は金も手も出さなかった。' +
          'その家を自分が受け取って、どこが不当だというんだ。',
        triggers: [
          '介護の労を数えられないとき',
          '「法律では」で片付けられるとき',
          '家を独り占めだと責められるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 22,
        // 摩擦点: 権威と正統(誰が家を継ぐ正統性を持つのか)
        weakThemes: ['kenri', 'kiroku'],
        resistantShelves: ['riho'],
      },
      psych: {
        kind: 'shinri',
        hardness: 32,
        weakThemes: ['keisho', 'kokan'],
        resistantShelves: ['jinshin'],
      },
      notebook: [
        { id: 'sz-toki', label: '書き換えられた鍵の交換伝票', kind: 'shoko', certainty: 2, shelf: 'gigei' },
        { id: 'sz-kenri', label: '持ち出された権利証の写し', kind: 'shoko', certainty: 3, shelf: 'riho' },
        { id: 'sz-nikki', label: '介護の日々の日記', kind: 'dogu', certainty: 2, shelf: 'monogatari' },
        { id: 'sz-minsei', label: '「よう世話しとった」と言う民生委員', kind: 'shogen', certainty: 1, shelf: 'seken' },
        { id: 'sz-kaigo', label: '介護サービスの利用記録', kind: 'shoko', certainty: 2, shelf: 'kanjo' },
        { id: 'sz-kensaku', label: '検索で出た法定相続分の基礎', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 4,
      locations: [
        { id: 'jikka', label: '空き家になった実家', kind: 'genba', yields: ['sz-toki', 'sz-nikki'], insight: 1 },
        { id: 'shihoshoshi', label: '司法書士の事務所', kind: 'kiroku', yields: ['sz-kenri', 'sz-kensaku'], insight: 0 },
        { id: 'minsei', label: '近所の民生委員', kind: 'hito', yields: ['sz-minsei', 'sz-kaigo'], insight: 2 },
        { id: 'aizawa', label: '相沢本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'senou',
      holds: 'mochizuki',
    },
    {
      depth: 2,
      title: '書かれなかった約束',
      turns: 10,
      epigraph: {
        text: '語られなかったことは、なかったことになるのか。それとも、守られたのか。',
        source: '沈黙と告白',
      },
      resolution: [
        '総一は「家のやり方」を繰り返し、そして言い淀んだ。',
        '淀んだのは、十五年前に一枚の畑が誰の名義に移ったかを、静かに並べられたときだった。',
        '語られなかった約束は、守られていたのではなかった。ただ、口にすれば崩れるものを、誰も口にしなかっただけだ。',
      ],
      failure: [
        '「家を壊す気か」と総一は言った。',
        '家という言葉の前では、筋を通そうとするこちらのほうが、家を壊す側に立たされる。',
      ],
      opponent: {
        name: '総一',
        role: '相沢家 本家の伯父',
        justification:
          '家は長男が継ぐ。それがこの家のやり方だ。書いたものがなくとも、みなが分かっていたことだ。' +
          '今さら紙を持ち出して分けろというのは、家を壊すことだ。',
        triggers: [
          '家督の慣わしを時代遅れと言われるとき',
          '書かれていない約束を無効と切られるとき',
          '昔動かした土地のことを蒸し返されるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 35,
        // 摩擦点: 継承と断絶(書かれなかった約束は守られたのか)
        weakThemes: ['keisho', 'kiroku'],
        resistantShelves: ['riho', 'tochi'],
      },
      psych: {
        kind: 'shinri',
        hardness: 65,
        weakThemes: ['kokuhaku', 'keisho'],
        resistantShelves: ['seken', 'tochi'],
      },
      notebook: [
        { id: 'sz2-meigi', label: '十五年前の畑の名義変更', kind: 'shoko', certainty: 3, shelf: 'riho' },
        { id: 'sz2-tochi', label: '一族の土地の移り変わり図', kind: 'dogu', certainty: 2, shelf: 'tochi' },
        { id: 'sz2-mokuhi', label: '誰も口にしなかった生前の一言', kind: 'shogen', certainty: 2, shelf: 'chinmoku' },
        { id: 'sz2-koseki', label: '古い戸籍と分家の記録', kind: 'shoko', certainty: 2, shelf: 'raireki' },
        { id: 'sz2-shinseki', label: '「家は長男に、が筋」と言う親戚', kind: 'shogen', certainty: 1, shelf: 'seken' },
        { id: 'sz2-kensaku', label: '検索で出た生前贈与と特別受益', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 5,
      locations: [
        { id: 'honke', label: '本家の座敷', kind: 'kiroku', yields: ['sz2-tochi', 'sz2-mokuhi'], insight: 1 },
        { id: 'homukyoku', label: '法務局の登記', kind: 'kiroku', yields: ['sz2-meigi', 'sz2-koseki'], insight: 0 },
        { id: 'shinseki', label: '一族の親戚', kind: 'hito', yields: ['sz2-shinseki', 'sz2-kensaku'], insight: 2 },
        { id: 'soichi', label: '総一本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'senou',
    },
  ],
};
