import type { Case } from '../../types.js';

/**
 * 事件5「信用の担保」
 *
 * 最大の事件。層3まで。組織的隠蔽に到達する。
 * 瀬能の勤め先が舞台であり、深掘りするほど彼女自身が追い詰められる。
 *
 * 層3の心理の壁は表の棚(勘定・理法・世間・人心)に耐性を持つ。
 * 奥の棚(編集・来歴・沈黙)なしでは事実上崩せない設計。
 */
export const SHINYO: Case = {
  id: 'shinyo',
  title: '信用の担保',
  hook: '潰れたはずの工務店に、去年また融資が下りている。' +
    '瀬能が持ち込んだ話だが、彼女自身が「これ、私が言ったことにしないで」と前置きした。',
  voices: [
    { who: '工務店の職人', line: 'あの融資が下りなかったら、俺ら十人、去年の暮れに終わってました。' },
    { who: '融資課の同僚', line: '藤沢が一人でやったことになってますけど、通したのは彼じゃないですよ。' },
    { who: '退職した理事', line: '……いや、その話は。もう時効でしょう。時効ですよね。' },
    { who: '瀬能 佐和', line: '私、明日もあそこに出勤するんだけどね。それだけは、忘れないでほしい。' },
  ],
  layers: [
    {
      depth: 1,
      title: '担当者の粉飾',
      turns: 8,
      epigraph: {
        text: '任された者は、任せた者の利益のためには動かない。悪意がなくとも、そうなる。',
        source: 'プリンシパル・エージェント問題',
      },
      resolution: [
        '藤沢は、工務店の職人十人の名前を、一人も間違えずに言えた。',
        '数字を作ったことは認めた。間違っていたとは、最後まで言わなかった。',
        '瀬能はその間、一言も発しなかった。二つ隣の席の男だった。',
      ],
      failure: [
        '「あそこで貸さなければ十人が職を失っていた」と藤沢は言った。',
        '失われなかった十人の職を、こちらは否定できなかった。',
      ],
      opponent: {
        name: '藤沢',
        role: '常北信用金庫 融資課 担当',
        justification:
          '数字を少し良く見せただけで、会社は現に今も回っている。' +
          'あそこで貸さなければ十人が職を失っていた。' +
          '書類の体裁を整えるのは、貸すと決めた後の作業に過ぎない。',
        triggers: [
          '目の前の十人より書類が大事だと言われるとき',
          '自分の判断を独断だと言われるとき',
          '数字を作ったことを詐欺と呼ばれるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 22,
        // 摩擦点: 分類と名づけ(担保と粉飾の線引き)
        weakThemes: ['bunrui', 'kiroku'],
        resistantShelves: ['kanjo'],
      },
      psych: {
        kind: 'shinri',
        hardness: 30,
        weakThemes: ['dairi', 'kajo'],
        resistantShelves: ['kanjo', 'riho'],
      },
      notebook: [
        { id: 'y-shihyo', label: '不自然に丸い自己資本比率', kind: 'shoko', certainty: 3, shelf: 'suji' },
        { id: 'y-tanpo', label: '評価額の書き換えられた担保', kind: 'shoko', certainty: 3, shelf: 'kanjo' },
        { id: 'y-komuten', label: '工務店の職人の証言', kind: 'shogen', certainty: 2, shelf: 'gigei' },
        { id: 'y-hyoka', label: '土地の実勢価格', kind: 'shoko', certainty: 2, shelf: 'tochi' },
        { id: 'y-kensaku', label: '検索で出た粉飾決算の手口', kind: 'sokuseki', certainty: 2, shelf: 'kanjo' },
      ],
      days: 4,
      locations: [
        { id: 'yushika', label: '融資課の書類', kind: 'kiroku', yields: ['y-shihyo', 'y-tanpo'], insight: 0 },
        { id: 'komuten', label: '工務店の現場', kind: 'genba', yields: ['y-komuten'], insight: 1 },
        { id: 'toki', label: '土地の登記と相場', kind: 'kiroku', yields: ['y-hyoka', 'y-kensaku'], insight: 0 },
        { id: 'fujisawa', label: '藤沢本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'senou',
    },
    {
      depth: 2,
      title: '通した課長',
      turns: 10,
      epigraph: {
        text: '基準は、それを作った者の都合を、事実の顔をして語る。',
        source: 'パラダイム論',
      },
      resolution: [
        '大久保は、本部の基準が現実に合っていないと言った。その通りだった。',
        'ただ、合わないと知りながら通した判子は、藤沢のものではなく彼のものだった。',
        '地域のため、という言葉は、誰の名前も背負っていない。',
      ],
      failure: [
        '「基準どおりなら、この町に貸せる会社は一つも残らない」と大久保は言った。',
        '残らせるための嘘を、どう咎めればよいのか分からなかった。',
      ],
      opponent: {
        name: '大久保',
        role: '常北信用金庫 融資課長',
        justification:
          '地域金融機関の役割は、数字が足りない相手にこそ貸すことだ。' +
          '本部の基準どおりにやっていたら、この町に貸せる会社は一つも残らない。' +
          '基準のほうが現実に合っていない。',
        triggers: [
          '地域のためという言葉を疑われるとき',
          '本部の基準を守れと言われるとき',
          '部下に責任を負わせたと言われるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 35,
        // 摩擦点: 代理と信任(預金者の金を誰の裁量で動かしたか)
        weakThemes: ['dairi', 'kiroku'],
        resistantShelves: ['kanjo', 'suji'],
      },
      psych: {
        kind: 'shinri',
        hardness: 68,
        weakThemes: ['dairi', 'kenri'],
        resistantShelves: ['kanjo', 'riho', 'seken'],
      },
      notebook: [
        { id: 'y2-ringi', label: '差し替えられた稟議書', kind: 'shoko', certainty: 3, shelf: 'henshu' },
        { id: 'y2-kessai', label: '決裁印の順序の逆転', kind: 'shoko', certainty: 3, shelf: 'riho' },
        { id: 'y2-doryo', label: '「あれは通せと言われた」と言う同僚', kind: 'shogen', certainty: 2, shelf: 'kotoba' },
        { id: 'y2-kensa', label: '内部監査で触れられなかった項目', kind: 'shoko', certainty: 3, shelf: 'chinmoku' },
        { id: 'y2-kensaku', label: '検索で出た金融庁の監督指針', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 5,
      locations: [
        { id: 'ringitsuzuri', label: '稟議書の綴り', kind: 'kiroku', yields: ['y2-ringi', 'y2-kessai'], insight: 0 },
        { id: 'yushidoryo', label: '融資課の同僚', kind: 'hito', yields: ['y2-doryo'], insight: 2 },
        { id: 'kansa', label: '内部監査の報告', kind: 'kiroku', yields: ['y2-kensa', 'y2-kensaku'], insight: 1 },
        { id: 'okubo', label: '大久保本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'senou',
    },
    {
      depth: 3,
      title: '基準そのものを守る側',
      turns: 12,
      epigraph: {
        text: '記録に無いということは、無かったということではない。',
        source: '語られなかったことの重み',
      },
      resolution: [
        '理事会は、制度としては正しく機能してきたと言った。',
        '議事録は一頁だけ白かった。',
        '白い頁は何も語らない。語らないことによって、そこに何かがあったことだけを語る。',
        '帰り道、瀬能は「明日も同じ職場に行くんだけどね」と言って笑った。柊は何も言わなかった。',
      ],
      failure: [
        '「守るべきものの順序を間違えてはいけない」と理事会は言った。',
        '順序を決めているのが誰なのかを、こちらは最後まで言い当てられなかった。',
      ],
      opponent: {
        name: '常北信用金庫 理事会',
        role: '制度を庇う側',
        justification:
          '個別の案件に問題があったとしても、制度としては正しく機能してきた。' +
          '一件を騒ぎ立てて信用が揺らげば、預金者と地域全体が損をする。' +
          '守るべきものの順序を間違えてはいけない。',
        triggers: [
          '制度が守っているものの中身を問われるとき',
          '何を書かなかったかを指摘されるとき',
          '正しさの基準そのものの出所を問われるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 55,
        // 摩擦点: 沈黙と告白(誰も口にしなかった含み損)
        weakThemes: ['kokuhaku', 'kiroku'],
        resistantShelves: ['kanjo', 'suji', 'riho'],
      },
      psych: {
        kind: 'shinri',
        hardness: 100,
        // 沈黙と正統性。奥の棚なしでは届かない。
        weakThemes: ['kokuhaku', 'kenri'],
        resistantShelves: ['kanjo', 'riho', 'seken', 'jinshin'],
      },
      notebook: [
        { id: 'y3-giji', label: '理事会議事録の空白の一頁', kind: 'shoko', certainty: 3, shelf: 'chinmoku' },
        { id: 'y3-kitei', label: '三年前に改定された内規', kind: 'shoko', certainty: 3, shelf: 'raireki' },
        { id: 'y3-hokoku', label: '本部への報告書と現場の帳票の差', kind: 'shoko', certainty: 3, shelf: 'henshu' },
        { id: 'y3-taishoku', label: '退職した理事の言い淀み', kind: 'shogen', certainty: 2, shelf: 'chinmoku' },
        { id: 'y3-shiryo', label: '創立五十年史の記述', kind: 'dogu', certainty: 2, shelf: 'raireki' },
        { id: 'y3-kensaku', label: '検索で出た他信金の破綻事例', kind: 'sokuseki', certainty: 2, shelf: 'kanjo' },
      ],
      days: 6,
      locations: [
        { id: 'rijigiji', label: '理事会議事録', kind: 'kiroku', yields: ['y3-giji', 'y3-hokoku'], insight: 1 },
        { id: 'naiki', label: '内規の改定履歴', kind: 'kiroku', yields: ['y3-kitei', 'y3-kensaku'], insight: 0 },
        { id: 'taishokuriji', label: '退職した理事', kind: 'hito', yields: ['y3-taishoku'], insight: 2 },
        { id: 'gojunenshi', label: '創立五十年史', kind: 'kiroku', yields: ['y3-shiryo'], insight: 1 },
        { id: 'rijikai', label: '理事会', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'senou',
    },
  ],
};
