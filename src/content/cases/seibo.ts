import type { Case } from '../../types.js';

/**
 * 事件2「歳暮の行方」
 *
 * 標準形。層2まで。末端の係長を崩すと、その上の部長が出てくる。
 * 鍵になる棚: 勘定(代理と信任)・土地(贈答の作法)・世間。
 *
 * 層2の相手は「これは商習慣であって賄賂ではない」という
 * 分類の物語で武装している。勘定の棚には耐性を持つ。
 */
export const SEIBO: Case = {
  id: 'seibo',
  title: '歳暮の行方',
  hook: '市内の部品メーカー杉浦精機で、取引先からの歳暮が' +
    '資材課の一部の人間の家に直接届いているという話が、配送業者から漏れてきた。',
  voices: [
    { who: '配送業者の運転手', line: '会社宛と自宅宛、伝票の束が最初から分かれてるんですよ。うちは運ぶだけですけど。' },
    { who: '資材課の若手', line: '断り方を教わってないんです。断っていいのかも、わからなくて。' },
    { who: '取引先の営業', line: 'こっちも断られたら困りますよ。渡さない会社だけ発注が減るなんて、言われなくても分かる。' },
    { who: '木下本人', line: '角を立てずに済ませることの、何がいけないんですか。' },
  ],
  layers: [
    {
      depth: 1,
      title: '資材課係長の受け取り',
      turns: 8,
      epigraph: {
        text: '贈り物が贈り物であるためには、返礼を期待していないという嘘が要る。',
        source: '贈答の作法',
      },
      resolution: [
        '木下は箱を開けず、送り主の名前だけを読み上げた。二十年ぶんの名前だった。',
        '断れば角が立つ、と彼は言った。',
        '断らなかったことで立った角のほうを、この人はまだ見ていない。',
      ],
      failure: [
        '木下は「うちの課は昔からこうだ」と繰り返した。',
        '昔からそうであることが理由になる場所では、理由を問うこと自体が無作法になる。',
      ],
      opponent: {
        name: '木下',
        role: '杉浦精機 資材課係長',
        justification:
          '中元も歳暮も昔からのやり取りで、断るほうが角が立つ。' +
          '会社に届いたものを課で分けるのと、家に届いたものを自分で受け取るのと、' +
          '何がそんなに違うのか。',
        triggers: [
          '長年の付き合いを取引と呼ばれるとき',
          '断らなかったことを咎められるとき',
          '自分だけが名指しされるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 20,
        // 摩擦点: 境界と逸脱(会社宛と自宅宛、どこに線が引かれたか)
        weakThemes: ['kyokai', 'kiroku'],
        resistantShelves: ['gigei'],
      },
      psych: {
        kind: 'shinri',
        hardness: 30,
        weakThemes: ['kokan', 'kyokai'],
        resistantShelves: ['seken'],
      },
      notebook: [
        { id: 'b-haiso', label: '配送業者の伝票控え', kind: 'shoko', certainty: 3, shelf: 'gigei' },
        { id: 'b-jusho', label: '個人宅宛になった送り状', kind: 'shoko', certainty: 3, shelf: 'kanjo' },
        { id: 'b-doryo', label: '「うちの課は昔からああ」と言う同僚', kind: 'shogen', certainty: 1, shelf: 'seken' },
        { id: 'b-meibo', label: '取引先の贈答先名簿', kind: 'shoko', certainty: 2, shelf: 'kanjo' },
        { id: 'b-kensaku', label: '検索で出た贈収賄の線引き', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 4,
      locations: [
        { id: 'haiso', label: '配送業者の営業所', kind: 'kiroku', yields: ['b-haiso', 'b-jusho'], insight: 0 },
        { id: 'doryo', label: '資材課の同僚', kind: 'hito', yields: ['b-doryo', 'b-kensaku'], insight: 2 },
        { id: 'torihiki', label: '取引先の担当者', kind: 'hito', yields: ['b-meibo'], insight: 1 },
        { id: 'kinoshita', label: '木下本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'senou',
      holds: 'mochizuki',
    },
    {
      depth: 2,
      title: '部長の取り分',
      turns: 10,
      epigraph: {
        text: '同じものが、名前を変えるだけで、罪にも礼儀にもなる。',
        source: '規程の解釈',
      },
      resolution: [
        '杉浦は「商習慣だ」と言い続け、そして言葉に詰まった。',
        '詰まったのは、その商習慣がいつ誰によって始められたのかを問われたときだった。',
        '慣習には起源がある。起源があるということは、それを決めた人間がいたということだ。',
        '決められたものは、決め直すこともできる。彼が最も認めたくなかったのは、そこだったのだろう。',
      ],
      failure: [
        '「賄賂と呼ぶなら、この町の商売はすべて賄賂だ」と杉浦は言った。',
        'その通りかもしれない、と言い返せなかった時点で、こちらの負けだった。',
      ],
      opponent: {
        name: '杉浦',
        role: '杉浦精機 資材部長',
        justification:
          '商習慣というものがある。相手の顔を立てるために受け取るのであって、' +
          'それで発注先を変えたことは一度もない。' +
          '賄賂と呼ぶなら、この町の商売はすべて賄賂ということになる。',
        triggers: [
          '商習慣を賄賂と言い換えられるとき',
          '町の商売のやり方そのものを否定されるとき',
          '自分の判断が金で買われたと言われるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 35,
        // 摩擦点: 代理と信任(発注は誰の利益のための采配か)
        weakThemes: ['dairi', 'kiroku'],
        resistantShelves: ['kanjo', 'gigei'],
      },
      psych: {
        kind: 'shinri',
        hardness: 65,
        // 「これは贈与であって取引ではない」という分類の物語
        weakThemes: ['bunrui', 'dairi'],
        resistantShelves: ['seken', 'tochi'],
      },
      notebook: [
        { id: 'b2-hacchu', label: '発注単価の推移表', kind: 'shoko', certainty: 3, shelf: 'suji' },
        { id: 'b2-ringi', label: '決裁を通っていない稟議', kind: 'shoko', certainty: 2, shelf: 'riho' },
        { id: 'b2-kaigi', label: '議事録から消えた一社', kind: 'shoko', certainty: 3, shelf: 'henshu' },
        { id: 'b2-motoshain', label: '辞めた社員の口ごもり', kind: 'shogen', certainty: 2, shelf: 'chinmoku' },
        { id: 'b2-golf', label: 'ゴルフ場の予約記録', kind: 'dogu', certainty: 2, shelf: 'shumi' },
        { id: 'b2-kensaku', label: '検索で出た同業他社の摘発例', kind: 'sokuseki', certainty: 2, shelf: 'kanjo' },
      ],
      days: 5,
      locations: [
        { id: 'shoko', label: '資材部の書庫', kind: 'kiroku', yields: ['b2-hacchu', 'b2-ringi'], insight: 0 },
        { id: 'giji', label: '役員会の議事録', kind: 'kiroku', yields: ['b2-kaigi', 'b2-kensaku'], insight: 1 },
        { id: 'motoshain', label: '辞めた社員', kind: 'hito', yields: ['b2-motoshain'], insight: 2 },
        { id: 'golf', label: 'ゴルフ場', kind: 'genba', yields: ['b2-golf'], insight: 1 },
        { id: 'sugiura', label: '杉浦本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'senou',
    },
  ],
};
