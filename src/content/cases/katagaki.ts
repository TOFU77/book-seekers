import type { Case } from '../../types.js';

/**
 * 事件「肩書きの棚卸し」
 *
 * 週刊誌ネタ寄りの変化球。町の名医の経歴に、無い学位が混じっている。
 * 「実務で貢献してきた、紙が何だ」という権威の物語を、
 * 席と人の区別、そして書き換えられた記録で崩す。
 * 鍵になる棚: 言葉(食い違い)・数字(診療実績)・世間。
 */
export const KATAGAKI: Case = {
  id: 'katagaki',
  title: '肩書きの棚卸し',
  hook: '町の名士として通る医院長の経歴に、実は無い学位が混じっている——そんな話が、講演会の刷り物をきっかけに囁かれ始めた。' +
    '「実務で貢献してきた、紙が何だ」と本人は意に介さない、と常連が声をひそめた。',
  voices: [
    { who: '医院の元事務員', line: '先生の経歴書、年によって少しずつ違うんですよ。気づいてましたけど。' },
    { who: '講演を頼んだ商工会', line: '立派な先生ですよ。今さら経歴がどうこう、と言われてもねえ。' },
    { who: '同業の医師', line: '腕は確かだ。だからこそ、嘘をつく必要なんてなかったはずなんだが。' },
    { who: '寺尾本人', line: '三十年、この町の患者を診てきた。紙切れの学位より、その事実のほうが重い。' },
  ],
  layers: [
    {
      depth: 1,
      title: '名医の経歴',
      turns: 8,
      epigraph: {
        text: 'その人が正しいのか、その肩書きが正しいのか。',
        source: '権威と正統',
      },
      resolution: [
        '寺尾は経歴の訂正には応じなかった。',
        'ただ、年ごとに書き換えられた経歴書を横に並べられたとき、どれが本当の自分だったのかを、自分でも言えなくなった。',
        '腕は本物だった。だからこそ、肩書きを盛った一手が、その本物までも疑わしくしてしまった。',
      ],
      failure: [
        '「では、私の診てきた患者に同じことを言えるか」と寺尾は言った。',
        '患者を引き合いに出されると、経歴を問うていたこちらが、人の恩を仇で返す側に立たされる。',
      ],
      opponent: {
        name: '寺尾',
        role: '寺尾医院 院長',
        justification:
          '三十年、休みなくこの町の医療を支えてきた。学位の一つや二つ、経歴の見栄えのために盛ったところで、' +
          '実際にやってきたことの価値は変わらない。人ではなく肩書きばかりを見る方がどうかしている。',
        triggers: [
          '実務の功を「それとこれとは別」と切られるとき',
          '経歴の食い違いを並べられるとき',
          '患者を診てきた事実を軽んじられると感じるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 22,
        // 摩擦点: 分類と名づけ(肩書きという名と、実の食い違い)
        weakThemes: ['bunrui', 'kiroku'],
        resistantShelves: ['seken'],
      },
      psych: {
        kind: 'shinri',
        hardness: 32,
        weakThemes: ['kenri', 'bunrui'],
        resistantShelves: ['jinshin'],
      },
      notebook: [
        { id: 'kg-keireki', label: '年ごとに違う経歴書', kind: 'shoko', certainty: 3, shelf: 'kotoba' },
        { id: 'kg-gakui', label: '検索で出た学位授与記録の不在', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
        { id: 'kg-jimu', label: '「年によって違う」と言う元事務員', kind: 'shogen', certainty: 2, shelf: 'jinshin' },
        { id: 'kg-koenkai', label: '講演会の刷り物の肩書き', kind: 'dogu', certainty: 2, shelf: 'kotoba' },
        { id: 'kg-doui', label: '「盛る必要はなかった」と言う同業医', kind: 'shogen', certainty: 1, shelf: 'seken' },
        { id: 'kg-karte', label: '長年の診療実績の記録', kind: 'shoko', certainty: 2, shelf: 'suji' },
      ],
      days: 4,
      locations: [
        { id: 'shokokai', label: '商工会の資料室', kind: 'kiroku', yields: ['kg-koenkai', 'kg-gakui'], insight: 0 },
        { id: 'iin', label: '医院の事務', kind: 'kiroku', yields: ['kg-keireki', 'kg-karte'], insight: 0 },
        { id: 'jimuin', label: '医院の元事務員', kind: 'hito', yields: ['kg-jimu', 'kg-doui'], insight: 2 },
        { id: 'terao', label: '寺尾本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'senou',
    },
  ],
};
