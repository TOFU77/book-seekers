import type { Case } from '../../types.js';

/**
 * 事件「宮の総代」
 *
 * お寺と神社の合同祭。賽銭と祭祀料を握った氏子総代を崩す。
 * 鍵になる棚: 勘定(出納)・理法(規約)・土地(民俗)。奥の棚は不要。
 *
 * 相手は「祭りを絶やさず守ってきた」という継承の物語で、
 * 守る者と持ち主の区別を曖昧にしている。
 */
export const TERAJINJA: Case = {
  id: 'terajinja',
  title: '宮の総代',
  hook: '町外れの八幡宮と隣の寺が合同で出す秋祭り。' +
    '賽銭と祭祀料の一部が総代の手元で止まっている、と若い神職見習いがサロンに漏らした。',
  voices: [
    { who: '神職見習い', line: 'お宮のお金のことは、総代さんに聞いてくれと言われます。ずっと、そうなんです。' },
    { who: '寺の副住職', line: 'うちと宮で折半のはずが、いつからか向こうが握ってましてね。角が立つから、誰も言わない。' },
    { who: '祭りの世話人', line: 'あの人がいなけりゃ、この祭りはとうに消えてた。それは本当なんだ。' },
    { who: '総代本人', line: '祭りを続けてきたのは誰だと思ってるんだ。帳面より先に、まず神輿を担いでみろ。' },
  ],
  layers: [
    {
      depth: 1,
      title: '氏子総代の預かり金',
      turns: 8,
      epigraph: {
        text: '受け継いだものを守る者は、いつしかそれを自分のものと取り違える。',
        source: '継承と所有',
      },
      resolution: [
        '総代は賽銭箱の鍵を返すとは言わなかった。',
        'ただ、三十年ぶんの祭りの出納を、誰にも見せずに一人で書いてきた古い帳面を出した。',
        '守ってきたことは本当だった。だが、守る者と持ち主は違う。その線を引かずに来たことだけが問題だった。',
      ],
      failure: [
        '「金の話にするな。信心の話だ」と総代は言い続けた。',
        '信心を持ち出されると、こちらの問いは急に不作法なものに見えてしまう。',
      ],
      opponent: {
        name: '総代',
        role: '八幡宮 氏子総代',
        justification:
          'この祭りを絶やさずに来たのは自分だ。宮の金を預かってきたのも、他に誰もやらなかったからだ。' +
          '守ってきた者が少しばかり采配を握って、何が悪い。',
        triggers: [
          '祭りを続けてきた功を数えられないとき',
          '信心を金勘定に置き換えられるとき',
          'よそ者に宮の作法を語られるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 22,
        // 摩擦点: 継承と断絶(守ってきた者と持ち主の区別)
        weakThemes: ['keisho', 'kiroku'],
        resistantShelves: ['tochi'],
      },
      psych: {
        kind: 'shinri',
        hardness: 32,
        // 摩擦点: 権威と正統(総代の席か、総代その人か)
        weakThemes: ['kenri', 'keisho'],
        resistantShelves: ['seken'],
      },
      notebook: [
        { id: 't-suito', label: '一人で書かれた祭礼出納帳', kind: 'shoko', certainty: 3, shelf: 'kanjo' },
        { id: 't-kagi', label: '賽銭箱の鍵の管理者名', kind: 'shoko', certainty: 2, shelf: 'riho' },
        { id: 't-tera', label: '寺と折半のはずの覚書', kind: 'shoko', certainty: 2, shelf: 'riho' },
        { id: 't-sewanin', label: '「あの人がいないと祭りは消えた」と言う世話人', kind: 'shogen', certainty: 1, shelf: 'tochi' },
        { id: 't-kuji', label: '氏子総代の選び方の口伝', kind: 'dogu', certainty: 1, shelf: 'tochi' },
        { id: 't-kensaku', label: '検索で出た宗教法人会計の通則', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 4,
      locations: [
        { id: 'shamusho', label: '宮の社務所', kind: 'kiroku', yields: ['t-suito', 't-kagi'], insight: 0 },
        { id: 'tera', label: '隣の寺', kind: 'kiroku', yields: ['t-tera', 't-kensaku'], insight: 1 },
        { id: 'sewanin', label: '祭りの世話人', kind: 'hito', yields: ['t-sewanin', 't-kuji'], insight: 2 },
        { id: 'sodai', label: '総代本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'senou',
    },
  ],
};
