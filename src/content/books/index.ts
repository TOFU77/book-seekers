import type { BookTag } from '../../types.js';

/**
 * 柊書房の初期蔵書。棚ごとに2冊ずつ、計28冊。
 *
 * 一冊 = 一つの概念。表題はそのまま討論で切ったときの文言の核になる。
 * 威力3は稀少で、1周では数冊しか読了できない想定。
 */
export const BOOKS: BookTag[] = [
  // ── 人心の棚 ──
  {
    id: 'jinshin-moral-licensing',
    title: 'モラル・ライセンシング',
    shelf: 'jinshin',
    power: 2,
    themes: ['kyokai', 'dairi'],
    gist: '善い行いをした者は、そのぶん後の逸脱を自分に許す',
  },
  {
    id: 'jinshin-dissonance',
    title: '認知的不協和',
    shelf: 'jinshin',
    power: 2,
    themes: ['bunrui', 'kokuhaku'],
    gist: '行いと信条が食い違うとき、人は行いではなく信条のほうを書き換える',
  },

  // ── 世間の棚 ──
  {
    id: 'seken-normalization',
    title: '逸脱の常態化',
    shelf: 'seken',
    power: 2,
    themes: ['kyokai', 'keisho'],
    gist: '小さな違反が繰り返されるうち、誰もそれを違反と呼ばなくなる',
  },
  {
    id: 'seken-defensive-routine',
    title: '組織的防衛ルーティン',
    shelf: 'seken',
    power: 3,
    themes: ['dairi', 'kokuhaku'],
    gist: '組織は学べない理由を自分で作り、それを話題にすること自体を禁じる',
  },

  // ── 土地の棚 ──
  {
    id: 'tochi-gift-manners',
    title: '贈答の作法',
    shelf: 'tochi',
    power: 2,
    themes: ['kokan', 'kenri'],
    gist: '何を、いつ、誰に贈るかは、土地ごとに厳密に決まっている',
  },
  {
    id: 'tochi-ko-kumi',
    title: '講と組',
    shelf: 'tochi',
    power: 1,
    themes: ['keisho', 'kokan'],
    gist: '金と労力を融通し合う、記録に残らない小さな共同体の仕組み',
  },

  // ── 物語の棚 ──
  {
    id: 'monogatari-excuse-types',
    title: '言い訳の類型',
    shelf: 'monogatari',
    power: 2,
    themes: ['kokuhaku', 'bunrui'],
    gist: '人が自分を許すときの語り口には、限られた型しかない',
  },
  {
    id: 'monogatari-tragedy',
    title: '悲劇の構造',
    shelf: 'monogatari',
    power: 3,
    themes: ['keisho', 'kenri'],
    gist: '主人公が自らの美点によって滅ぶという筋書き',
  },

  // ── 趣味の棚 ──
  {
    id: 'shumi-design-fashion',
    title: '意匠の流行',
    shelf: 'shumi',
    power: 1,
    themes: ['keisho', 'shisen'],
    gist: 'いつ作られたものかは、飾りの形が語ってしまう',
  },
  {
    id: 'shumi-composition',
    title: '見せるための構図',
    shelf: 'shumi',
    power: 2,
    themes: ['shisen', 'kiroku'],
    gist: '写真に人が写るとき、その人は既に見られ方を選んでいる',
  },

  // ── 数字の棚 ──
  {
    id: 'suji-benford',
    title: 'ベンフォードの法則',
    shelf: 'suji',
    power: 3,
    themes: ['kiroku', 'bunrui'],
    gist: '自然に集まった数字の先頭桁には偏りがある。作られた数字にはそれがない',
  },
  {
    id: 'suji-sampling-bias',
    title: '標本の偏り',
    shelf: 'suji',
    power: 2,
    themes: ['shisen', 'kajo'],
    gist: '誰を数えなかったかが、答えのほうを決めている',
  },

  // ── 物証の棚 ──
  {
    id: 'busshou-ink-aging',
    title: 'インクの経年',
    shelf: 'busshou',
    power: 2,
    themes: ['kiroku', 'keisho'],
    gist: '書かれた時期は、紙と染料が覚えている',
  },
  {
    id: 'busshou-sound-distance',
    title: '音の伝わる距離',
    shelf: 'busshou',
    power: 1,
    themes: ['shisen', 'kyokai'],
    gist: 'その位置から、その音は本当に聞こえたのか',
  },

  // ── 技芸の棚 ──
  {
    id: 'gigei-stocktaking',
    title: '帳合と棚卸',
    shelf: 'gigei',
    power: 2,
    themes: ['kiroku', 'kajo'],
    gist: '物の数を合わせる作業には、必ず人ごとの癖と手順がある',
  },
  {
    id: 'gigei-printing',
    title: '印刷と製本',
    shelf: 'gigei',
    power: 1,
    themes: ['kajo', 'kiroku'],
    gist: '刷られた部数と綴じられた部数は、しばしば一致しない',
  },

  // ── 勘定の棚 ──
  {
    id: 'kanjo-principal-agent',
    title: 'プリンシパル・エージェント問題',
    shelf: 'kanjo',
    power: 3,
    themes: ['dairi', 'kenri'],
    gist: '任された者の利益と、任せた者の利益は、そもそも一致しない',
  },
  {
    id: 'kanjo-sunk-cost',
    title: 'サンクコスト',
    shelf: 'kanjo',
    power: 1,
    themes: ['kajo', 'kokan'],
    gist: 'すでに失ったものが、これからの判断を歪める',
  },

  // ── 理法の棚 ──
  {
    id: 'riho-interpretation',
    title: '規程の解釈',
    shelf: 'riho',
    power: 2,
    themes: ['kenri', 'bunrui'],
    gist: '同じ条文が、立場によって別の意味を持つ',
  },
  {
    id: 'riho-whistleblowing',
    title: '内部通報の構造',
    shelf: 'riho',
    power: 2,
    themes: ['kokuhaku', 'dairi'],
    gist: '告発者は、告発した瞬間に組織の外側に置かれる',
  },

  // ── 言葉の棚 ──
  {
    id: 'kotoba-euphemism',
    title: '婉曲表現',
    shelf: 'kotoba',
    power: 2,
    themes: ['kyokai', 'bunrui'],
    gist: '言い換えられた言葉は、何を守るために言い換えられたのか',
  },
  {
    id: 'kotoba-honorifics',
    title: '敬語の距離',
    shelf: 'kotoba',
    power: 1,
    themes: ['kenri', 'shisen'],
    gist: '誰が誰にどう話すかで、序列は残らず露出する',
  },

  // ── 編集の棚(奥) ──
  {
    id: 'henshu-subject-retreat',
    title: '主語の後退',
    shelf: 'henshu',
    power: 3,
    themes: ['dairi', 'kokuhaku'],
    gist: '「そうなった」と書かれた文からは、誰がやったのかが消えている',
  },
  {
    id: 'henshu-omissions',
    title: '省かれたものの目録',
    shelf: 'henshu',
    power: 2,
    themes: ['kiroku', 'kajo'],
    gist: '並べ方は、並べなかったもののほうによって決まっている',
  },

  // ── 来歴の棚(奥) ──
  {
    id: 'raireki-paradigm',
    title: 'パラダイム論',
    shelf: 'raireki',
    power: 3,
    themes: ['bunrui', 'kenri'],
    gist: '何が問題であるかは、その時代の枠組みのほうが決めている',
  },
  {
    id: 'raireki-pseudo-science',
    title: '疑似科学と科学メタファー',
    shelf: 'raireki',
    power: 2,
    themes: ['kenri', 'kyokai'],
    gist: '科学の正しさを掲げるものと、科学の視点を借りるものは、まるで違う',
  },

  // ── 沈黙の棚(奥) ──
  {
    id: 'chinmoku-unspoken',
    title: '語られなかったことの重み',
    shelf: 'chinmoku',
    power: 3,
    themes: ['kokuhaku', 'kiroku'],
    gist: '記録に無いということは、無かったということではない',
  },
  {
    id: 'chinmoku-tacit-consent',
    title: '沈黙の合意',
    shelf: 'chinmoku',
    power: 2,
    themes: ['kokuhaku', 'kyokai'],
    gist: '誰も言わないという形で、全員が同意していることがある',
  },
];

/** id から引くための索引。 */
export const LIBRARY: Map<string, BookTag> = new Map(BOOKS.map((b) => [b.id, b]));

export function book(id: string): BookTag {
  const found = LIBRARY.get(id);
  if (!found) throw new Error(`蔵書が見つからない: ${id}`);
  return found;
}
