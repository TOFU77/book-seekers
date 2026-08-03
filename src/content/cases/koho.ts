import type { Case } from '../../types.js';

/**
 * 事件4「広報の一枚」
 *
 * 奥の棚(編集)が主役になる事件。
 * 写真そのものは加工されていない。並べ方と説明文だけで事実が変えられている。
 *
 * 趣味の棚(写真・意匠)には耐性がある — 相手は写真の専門家だからである。
 * 「写真は嘘をつかない」を崩すのは、写真の知識ではなく編集の知識になる。
 */
export const KOHO: Case = {
  id: 'koho',
  title: '広報の一枚',
  hook: '市の広報誌に載った再開発地区の特集写真に、朝倉が引っかかっている。' +
    '「あの写真、撮った日が記事の日付と違う」。しかし加工の跡はないという。',
  voices: [
    { who: '広報課の嘱託職員', line: '写真は差し替えました。でも加工はしてません。それ、違う話ですよね？' },
    { who: '再開発地区の住民', line: '説明会でね、手は挙げたんですよ。広報には一行も載ってませんでしたけど。' },
    { who: '印刷所の職長', line: '校正紙は残してあります。あれ、うちが刷った版とは違うでしょう。' },
    { who: '梶本人', line: '見栄えのいい日の写真を選ぶ。それを操作と呼ぶなら、広報という仕事は成り立ちません。' },
  ],
  layers: [
    {
      depth: 1,
      title: '差し替えられた一枚',
      turns: 8,
      epigraph: {
        text: '写真は嘘をつかない。嘘をつくのは、写真を並べる人間のほうである。',
        source: '見せるための構図',
      },
      resolution: [
        '梶は「加工はしていない」と最後まで言った。それは事実だった。',
        '彼は一枚も加工していない。',
        'ただ、撮った日と載せた日のあいだにある半年を、誰にも見せなかっただけだ。',
        '朝倉は「やっぱり笑い方が違った」と、写真を裏返しながら言った。',
      ],
      failure: [
        '「見栄えのいい日の写真を選んで何が悪い」と梶は言った。',
        '選ぶことと欺くことの境目を、こちらも最後まで引けなかった。',
      ],
      opponent: {
        name: '梶',
        role: '市 広報課 主査',
        justification:
          '写真は一枚も加工していない。実際に撮ったものを、実際に使っただけだ。' +
          '見栄えのいい日の写真を選ぶのは、広報として当たり前のことではないか。',
        triggers: [
          '「写真は嘘をつかない」という前提を疑われるとき',
          '選ぶことを操作と呼ばれるとき',
          '自分の仕事が宣伝だと言われるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 20,
        // 摩擦点: 見ることと見られること(一枚の像は何を見せ、何を隠すか)
        weakThemes: ['shisen', 'kiroku'],
        resistantShelves: ['shumi'],
      },
      psych: {
        kind: 'shinri',
        hardness: 30,
        weakThemes: ['shisen', 'bunrui'],
        resistantShelves: ['shumi', 'busshou'],
      },
      notebook: [
        { id: 'k-hizuke', label: '写真の影の長さと季節の食い違い', kind: 'shoko', certainty: 3, shelf: 'busshou' },
        { id: 'k-genban', label: '広報課に残っていた元原稿', kind: 'shoko', certainty: 3, shelf: 'henshu' },
        { id: 'k-kanban', label: '写り込んだ古い看板', kind: 'dogu', certainty: 2, shelf: 'shumi' },
        { id: 'k-shokuin', label: '「あれは去年の分」と言う職員', kind: 'shogen', certainty: 2, shelf: 'seken' },
        { id: 'k-kensaku', label: '検索で出た広報誌の過去号', kind: 'sokuseki', certainty: 2, shelf: 'henshu' },
      ],
      days: 4,
      locations: [
        { id: 'kohoka', label: '広報課の棚', kind: 'kiroku', yields: ['k-genban', 'k-kensaku'], insight: 0 },
        { id: 'genbutsu', label: '写真の現物', kind: 'genba', yields: ['k-hizuke', 'k-kanban'], insight: 1 },
        { id: 'shokuin', label: '広報課の職員', kind: 'hito', yields: ['k-shokuin'], insight: 2 },
        { id: 'kaji', label: '梶本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'asakura',
      holds: 'mochizuki',
    },
    {
      depth: 2,
      title: '記事を通した課長',
      turns: 10,
      epigraph: {
        text: '省かれたものの目録は、決して印刷されない。',
        source: '省かれたものの目録',
      },
      resolution: [
        '室岡は、削った三行をそらで言えた。',
        '嘘は一つも書いていない、と彼は言った。それも事実だった。',
        '書かなかったことが嘘になるかどうかは、書かれなかった側にしか分からない。',
        '説明会で手を挙げた住民の名前は、どの号にも載っていなかった。',
      ],
      failure: [
        '「市民に不安を与えないのが広報の仕事だ」と室岡は言った。',
        '不安を与えないことと、知らせないことの違いを、こちらは示せなかった。',
      ],
      opponent: {
        name: '室岡',
        role: '市 広報課長',
        justification:
          '市民に不安を与えない書き方をするのが広報の仕事だ。' +
          '嘘は一つも書いていない。書かなかったことがあるだけで、' +
          'それは編集というものだろう。',
        triggers: [
          '書かなかったことを嘘と同じだと言われるとき',
          '編集を隠蔽と呼ばれるとき',
          '市民を守る立場を疑われるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 33,
        // 摩擦点: 沈黙と告白(写さなかった一枚が語ること)
        weakThemes: ['kokuhaku', 'kiroku'],
        resistantShelves: ['shumi', 'busshou'],
      },
      psych: {
        kind: 'shinri',
        // 「書かなかっただけ」を崩すには、沈黙と編集の棚が要る
        hardness: 70,
        weakThemes: ['kokuhaku', 'bunrui'],
        resistantShelves: ['shumi', 'jinshin', 'seken'],
      },
      notebook: [
        { id: 'k2-sakujo', label: '入稿後に削られた三行', kind: 'shoko', certainty: 3, shelf: 'henshu' },
        { id: 'k2-jumin', label: '説明会で出た質問の記録', kind: 'shoko', certainty: 2, shelf: 'chinmoku' },
        { id: 'k2-gyosha', label: '印刷所に残った校正紙', kind: 'shoko', certainty: 3, shelf: 'gigei' },
        { id: 'k2-moto', label: '「あれは上の判断」と言う元部下', kind: 'shogen', certainty: 2, shelf: 'kotoba' },
        { id: 'k2-kensaku', label: '検索で出た他市の同種事例', kind: 'sokuseki', certainty: 2, shelf: 'henshu' },
      ],
      days: 5,
      locations: [
        { id: 'nyuko', label: '入稿前の原稿', kind: 'kiroku', yields: ['k2-sakujo', 'k2-kensaku'], insight: 0 },
        { id: 'insatsujo', label: '印刷所', kind: 'genba', yields: ['k2-gyosha'], insight: 1 },
        { id: 'jumin', label: '説明会に出た住民', kind: 'hito', yields: ['k2-jumin'], insight: 2 },
        { id: 'motobuka', label: '元部下', kind: 'hito', yields: ['k2-moto'], insight: 2 },
        { id: 'murooka', label: '室岡本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'makabe',
      holds: 'senou',
    },
  ],
};
