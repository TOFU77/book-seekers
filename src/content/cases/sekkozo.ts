import type { Case } from '../../types.js';

/**
 * 事件1「消えた石膏像」
 *
 * 最小の事件。層1のみで完結する。数時間で終わる想定。
 * 鍵になる棚: 技芸(帳合と棚卸)・勘定・人心。奥の棚は不要。
 *
 * 相手は「自分は立て替えてきた」という代理の物語で自分を許している。
 */
export const SEKKOZO: Case = {
  id: 'sekkozo',
  title: '消えた石膏像',
  hook: '市立第二中学校の美術室から、備品の石膏像が何体か消えている。' +
    '生徒が「先生の車に積んであるのを見た」と言っているらしい、と常連客が持ち込んだ。',
  voices: [
    { who: '美術部の三年生', line: '沢渡先生、絵の具はいつも自分で買ってきてくれるんです。それは本当です。' },
    { who: '事務室の職員', line: '備品って、壊れたことにすれば台帳から消せるんですよ。誰も見ませんから。' },
    { who: '同じ学年の教師', line: '正直に言うとね、あの人が一番まじめですよ。それが問題なんじゃないですか。' },
    { who: '沢渡本人', line: 'あなた方は、私が何をもらったかは数えるんですね。何を出したかは数えないのに。' },
  ],
  layers: [
    {
      depth: 1,
      title: '美術教師の持ち出し',
      turns: 8,
      epigraph: {
        text: '善い行いは、それをした本人の中に、目に見えない貸方の欄をつくる。',
        source: 'モラル・ライセンシング',
      },
      resolution: [
        '沢渡は、石膏像を返すとは言わなかった。',
        'ただ、立て替えた画材の領収書を、三年分まとめて机の抽斗から出してきた。',
        '数えられていなかったのは、持ち出された備品の数ではない。この人が黙って払ってきた額のほうだ。',
        'どちらも帳簿には載らない。載らないものを数える仕組みを、学校は持っていなかった。',
      ],
      failure: [
        '沢渡は最後まで「差し引きこちらが損をしている」と言い続けた。',
        '崩しきれなかったのは、それが半分は本当だったからだ。',
      ],
      opponent: {
        name: '沢渡',
        role: '第二中学校 美術科教諭',
        justification:
          '画材も額縁も、足りない分はずっと自分の給料から出してきた。' +
          '予算で買えないものを自分で立て替えてきたのだから、' +
          '古くなった備品を少し引き取ったところで、差し引きこちらが損をしている。',
        triggers: [
          '自分の持ち出しが誰にも数えられていないと感じるとき',
          '「規則だから」で片付けられるとき',
          '生徒のためにやったのだと否定されるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 20,
        // 摩擦点: 過剰と欠乏(足りないから取るのか、有り余るから引き取るのか)
        weakThemes: ['kajo', 'kiroku'],
        resistantShelves: ['gigei'],
      },
      psych: {
        kind: 'shinri',
        hardness: 30,
        weakThemes: ['dairi', 'kajo'],
        resistantShelves: ['riho'],
      },
      notebook: [
        { id: 's-daicho', label: '備品台帳の飛んだ整理番号', kind: 'shoko', certainty: 3, shelf: 'gigei' },
        { id: 's-kagi', label: '美術室の鍵の貸出記録', kind: 'shoko', certainty: 2, shelf: 'riho' },
        { id: 's-seito', label: '「先生の車に積んでた」と言う生徒', kind: 'shogen', certainty: 2, shelf: 'jinshin' },
        { id: 's-yosan', label: '昨年度の予算執行表', kind: 'shoko', certainty: 2, shelf: 'kanjo' },
        { id: 's-shashin', label: '三年前の展示風景の写真', kind: 'dogu', certainty: 1, shelf: 'shumi' },
        { id: 's-kensaku', label: '検索で出た同種の処分事例', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 4,
      locations: [
        { id: 'junbishitsu', label: '美術準備室', kind: 'genba', yields: ['s-daicho', 's-shashin'], insight: 0 },
        { id: 'jimushitsu', label: '学校の事務室', kind: 'kiroku', yields: ['s-kagi', 's-yosan', 's-kensaku'], insight: 0 },
        { id: 'seito', label: '美術部の生徒', kind: 'hito', yields: ['s-seito'], insight: 2 },
        { id: 'sawatari', label: '沢渡本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'mochizuki',
    },
  ],
};
