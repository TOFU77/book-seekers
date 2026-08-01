import type { Case } from '../../types.js';

/**
 * 事件「回覧板」
 *
 * 移住者一家を、班長が回覧板やゴミ集積所から静かに外している。
 * 「向こうがまだこちらに来ていないだけ」という境界の物語を、
 * 会費という交換の事実で崩す。鍵になる棚: 勘定(会費)・理法・世間。
 */
export const KAIRAN: Case = {
  id: 'kairan',
  title: '回覧板',
  hook: '二年前に町へ移り住んだ一家に、いつからか回覧板が回ってこない。' +
    'ゴミ集積所も「あそこは使うな」と言われたという。班長がわざと外している、と噂が立っている。',
  voices: [
    { who: '移住者の妻', line: '私たち、何か失礼をしたんでしょうか。誰も教えてくれないんです。' },
    { who: '隣の主婦', line: '班長さんがね……回す順番から、あの家だけ抜いてるのよ。見て見ぬふり。' },
    { who: '町内会の会計', line: '会費はちゃんと納めてもらってますよ。それは、はい。' },
    { who: '越智本人', line: '順番も作法も知らん人に、無理に合わせろとは言えんでしょう。こっちにはこっちのやり方がある。' },
  ],
  layers: [
    {
      depth: 1,
      title: '班長の線引き',
      turns: 8,
      epigraph: {
        text: '線はどこに引かれ、誰が引き、いつ引き直されたのか。',
        source: '境界と逸脱',
      },
      resolution: [
        '越智は「これまで通りにする」とは言わなかった。',
        'ただ、会費の受領簿にその家の名がきちんと並んでいるのを見せられて、言葉が続かなくなった。',
        '会費を受け取る輪と、回覧板を回す輪は、同じ輪のはずだった。片方だけ線を引けば、それはもう作法ではない。',
      ],
      failure: [
        '「無理に仲良くする必要はないでしょう」と越智は言った。',
        '仲の良し悪しの話にすり替えられると、仕組みの話をしていたこちらが、心の狭い人間に見えてくる。',
      ],
      opponent: {
        name: '越智',
        role: '町内会 班長',
        justification:
          'よそから来た人は、この町のやり方を知らない。知らない人を無理に輪に入れても、かえって角が立つ。' +
          '線を引いているのではなく、向こうがまだこちら側に来ていないだけだ。',
        triggers: [
          '「排除だ」と名指しされるとき',
          '町のやり方を古いと言われるとき',
          '会費を払っている事実を突きつけられるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 20,
        // 摩擦点: 交換と贈与(会費を払った=輪の一員という対価)
        weakThemes: ['kokan', 'kiroku'],
        resistantShelves: ['tochi'],
      },
      psych: {
        kind: 'shinri',
        hardness: 30,
        weakThemes: ['kyokai', 'kokan'],
        resistantShelves: ['seken'],
      },
      notebook: [
        { id: 'k-kaihi', label: '会費の受領簿', kind: 'shoko', certainty: 3, shelf: 'kanjo' },
        { id: 'k-junban', label: '回覧板の回付順の控え', kind: 'shoko', certainty: 3, shelf: 'seken' },
        { id: 'k-tonari', label: '「順番から抜いている」と言う隣人', kind: 'shogen', certainty: 2, shelf: 'seken' },
        { id: 'k-gomi', label: 'ゴミ集積所の利用ルール', kind: 'shoko', certainty: 1, shelf: 'tochi' },
        { id: 'k-kaisoku', label: '町内会規約の入会条項', kind: 'dogu', certainty: 2, shelf: 'riho' },
        { id: 'k-kensaku', label: '検索で出た自治会加入をめぐる判例', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 4,
      locations: [
        { id: 'kaikan', label: '町内会館', kind: 'kiroku', yields: ['k-kaihi', 'k-kaisoku'], insight: 0 },
        { id: 'shuseki', label: 'ゴミ集積所', kind: 'genba', yields: ['k-gomi', 'k-junban'], insight: 0 },
        { id: 'tonari', label: '隣の主婦', kind: 'hito', yields: ['k-tonari', 'k-kensaku'], insight: 2 },
        { id: 'ochi', label: '越智本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'senou',
    },
  ],
};
