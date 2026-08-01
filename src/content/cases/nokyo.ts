import type { Case } from '../../types.js';

/**
 * 事件「直売所の棚」
 *
 * 農協・直売所の古参が、新規就農者の野菜を棚の隅に追いやる。
 * 「順番」「秩序」を盾にする世話役を、権威と境界の主題で崩す。
 * 鍵になる棚: 勘定(棚割)・数字(売上)・世間。
 */
export const NOKYO: Case = {
  id: 'nokyo',
  title: '直売所の棚',
  hook: '農産物直売所で、新規就農した若者の野菜だけが、いつも棚の隅か、そもそも並ばない。' +
    '出荷の順番を握る古参が横槍を入れている、と若者本人がこぼした。',
  voices: [
    { who: '若手農家', line: '品質で落とされるなら諦めます。でも、そうじゃないんです。' },
    { who: '直売所のパート', line: '棚の割り振り、あの人の一存なんですよ。誰も逆らえない。' },
    { who: '別の古参農家', line: '順番ってもんがある。新参がいきなり一等地に並べたら、示しがつかんだろう。' },
    { who: '室田本人', line: 'わしは組合の秩序を守っとるだけだ。長年出してきた者が優先されて、何が悪い。' },
  ],
  layers: [
    {
      depth: 1,
      title: '出荷組合の世話役',
      turns: 8,
      epigraph: {
        text: 'その席が正しいのか、その席に座る人が正しいのか。',
        source: '権威と正統',
      },
      resolution: [
        '室田は棚の割り振りを譲るとは言わなかった。',
        'ただ、出荷記録を突き合わせると、彼が「秩序」と呼んでいたものは、彼一人が決めた順番でしかなかった。',
        '順番には根拠が要る。根拠のない順番は、秩序ではなく、ただの好き嫌いだ。',
      ],
      failure: [
        '「若い者は待つということを知らん」と室田は言った。',
        '待つことに理由があるかを問う前に、待てと言われると、問いのほうが無礼になる。',
      ],
      opponent: {
        name: '室田',
        role: '直売所出荷組合 世話役',
        justification:
          '長く組合を支えてきた者が良い棚に並ぶのは当たり前だ。' +
          '新しく入った者が同じ顔をしていたら、真面目に続けてきた者が報われん。' +
          '順番を守るのは、組合を守ることだ。',
        triggers: [
          '長年の貢献を「既得権」と呼ばれるとき',
          '新参と同じ扱いにされるとき',
          '組合の秩序を古臭いと言われるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 22,
        // 摩擦点: 分類と名づけ(等級と格付け、根拠のない序列)
        weakThemes: ['bunrui', 'kiroku'],
        resistantShelves: ['seken'],
      },
      psych: {
        kind: 'shinri',
        hardness: 32,
        // 摩擦点: 境界と逸脱(古参と新参、誰が線を引くのか)
        weakThemes: ['kyokai', 'kenri'],
        resistantShelves: ['tochi'],
      },
      notebook: [
        { id: 'n-tana', label: '棚割りの割当表', kind: 'shoko', certainty: 3, shelf: 'kanjo' },
        { id: 'n-shukka', label: '出荷記録と品質等級', kind: 'shoko', certainty: 3, shelf: 'suji' },
        { id: 'n-part', label: '「あの人の一存」と言うパート', kind: 'shogen', certainty: 2, shelf: 'seken' },
        { id: 'n-kisoku', label: '組合の出荷規約', kind: 'shoko', certainty: 2, shelf: 'riho' },
        { id: 'n-uriage', label: '隅に置かれた棚の売上データ', kind: 'dogu', certainty: 1, shelf: 'suji' },
        { id: 'n-kensaku', label: '検索で出た他産地の直売所運営例', kind: 'sokuseki', certainty: 2, shelf: 'seken' },
      ],
      days: 4,
      locations: [
        { id: 'chokubaijo', label: '直売所の事務室', kind: 'kiroku', yields: ['n-tana', 'n-kisoku'], insight: 0 },
        { id: 'souko', label: '出荷倉庫', kind: 'genba', yields: ['n-shukka', 'n-uriage'], insight: 0 },
        { id: 'part', label: '直売所のパート', kind: 'hito', yields: ['n-part', 'n-kensaku'], insight: 2 },
        { id: 'murota', label: '室田本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'senou',
    },
  ],
};
