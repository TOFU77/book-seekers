import type { BookTag, ShelfId } from '../../types.js';
import { SHELF_IDS } from '../shelves.js';

/**
 * 柊書房の蔵書。棚ごとに3〜5冊。全冊、実在する書物(『』付き)。
 *
 * 「一冊 = 一つの観念(themes)」で、実書の核心を一行(gist)に凝縮したものが、
 * 討論で切ったときの文言の素になる。各棚は観念を重複して持つ。
 * 二冊選べば、その棚の急所は概ね覆える。
 *
 * 出自は二系統:
 *   千夜千冊から選んだもの(主に古典・人文)
 *   その概念を最初に世に出した、あるいは最も広めた定番書(行動経済学・組織論など)
 *
 * 保守の指針:
 *   ここでは shelf を書かず、棚ごとの配列にまとめる。
 *   末尾で SHELF_IDS を辿って shelf を注入し、従来どおりの平坦な BOOKS/LIBRARY に落とす。
 *   → engine 側は BookTag[] と Map しか見ないので、影響は無い。
 *   威力3は稀少に保つ(1周で読めるのは数冊)。
 */

/** 棚を書く前の種。末尾で shelf を注入する。 */
type BookSeed = Omit<BookTag, 'shelf'>;

const SHELF_BOOKS: Record<ShelfId, BookSeed[]> = {
  // ── 人心の棚 心理学・精神医学 ──
  jinshin: [
    {
      id: 'jinshin-moral-licensing',
      title: '『ずる――噓とごまかしの行動経済学』',
      power: 2,
      themes: ['kyokai', 'dairi'],
      gist: '少しだけ良いことをした人間ほど、その後の小さな不正に手を染めやすくなる',
    },
    {
      id: 'jinshin-dissonance',
      title: '『認知的不協和の理論』',
      power: 2,
      themes: ['bunrui', 'kokuhaku'],
      gist: '行いと信条が食い違うとき、人は行いではなく信条のほうを書き換える',
    },
    {
      id: 'jinshin-gestalt',
      title: '『ゲシュタルト心理学の原理』',
      power: 2,
      themes: ['bunrui', 'kyokai'],
      gist: '人はばらばらの断片を、勝手にひとつの形へ括って見てしまう',
    },
    {
      id: 'jinshin-jung',
      title: '『心理学と錬金術』',
      power: 2,
      themes: ['kokuhaku', 'dairi'],
      gist: '言葉にできない衝動を、人は像に託して外へ映し出す',
    },
    {
      id: 'jinshin-self-brain',
      title: '『自我と脳』',
      power: 1,
      themes: ['dairi', 'bunrui'],
      gist: '私が決めているのか、脳が決めたのを私が引き受けているだけなのか',
    },
  ],

  // ── 世間の棚 社会学・組織論 ──
  seken: [
    {
      id: 'seken-normalization',
      title: '『チャレンジャー号 打ち上げ決定の内幕』',
      power: 2,
      themes: ['kyokai', 'keisho'],
      gist: '小さな逸脱が咎められずに繰り返されるうち、それはいつしか手順の一部になる',
    },
    {
      id: 'seken-defensive-routine',
      title: '『組織の罠』',
      power: 3,
      themes: ['dairi', 'kokuhaku'],
      gist: '組織は学べない理由を自分で作り、それを話題にすること自体を禁じる',
    },
    {
      id: 'seken-stigma',
      title: '『スティグマの社会学』',
      power: 2,
      themes: ['kyokai', 'kokuhaku'],
      gist: '烙印を押された者は、その印を隠すか、進んで名乗るかを迫られる',
    },
    {
      id: 'seken-community',
      title: '『コミュニティ』',
      power: 2,
      themes: ['kyokai', 'dairi'],
      gist: '安全のために輪を閉じるほど、自由は誰かに預けられていく',
    },
    {
      id: 'seken-bureaucracy',
      title: '『官僚国家の崩壊』',
      power: 2,
      themes: ['dairi', 'keisho'],
      gist: '専門家に任せ続けた社会は、任せたことすら忘れてしまう',
    },
  ],

  // ── 土地の棚 民俗学・地方史・地理 ──
  tochi: [
    {
      id: 'tochi-gift-manners',
      title: '『贈与交換の人類学』',
      power: 2,
      themes: ['kokan', 'kenri'],
      gist: '何を、いつ、誰に贈るかは、土地ごとに厳密な文法を持っている',
    },
    {
      id: 'tochi-ko-kumi',
      title: '『日本の祭り』',
      power: 1,
      themes: ['keisho', 'kokan'],
      gist: '祭りを支える講の金と労力は、記録に残らない貸し借りで巡っている',
    },
    {
      id: 'tochi-forgotten',
      title: '『忘れられた日本人』',
      power: 2,
      themes: ['keisho', 'kokan'],
      gist: '寄合は多数決ではなく、皆が得心するまでの貸し借りで決まった',
    },
    {
      id: 'tochi-book-of-dead',
      title: '『死者の書』',
      power: 3,
      themes: ['keisho', 'kenri'],
      gist: '死者の声を継ぐ者だけが、その土地の正統を名乗れた',
    },
    {
      id: 'tochi-fudo',
      title: '『風土』',
      power: 1,
      themes: ['kenri', 'keisho'],
      gist: '土地の気候が、そこに住む者の作法と序列まで決めている',
    },
  ],

  // ── 物語の棚 文学・修辞・ナラティヴ心理学 ──
  monogatari: [
    {
      id: 'monogatari-excuse-types',
      title: '『なぜあの人はあやまちを認めないのか』',
      power: 2,
      themes: ['kokuhaku', 'bunrui'],
      gist: '人は誤りを認めるのではなく、誤りのほうを記憶から都合よく編集する',
    },
    {
      id: 'monogatari-tragedy',
      title: '『詩学』',
      power: 3,
      themes: ['keisho', 'kenri'],
      gist: '主人公が自らの美点によって滅ぶという筋書きを、この一冊が最初に見抜いた',
    },
    {
      id: 'monogatari-genji',
      title: '『源氏物語』',
      power: 3,
      themes: ['keisho', 'kokuhaku'],
      gist: '語られぬ心の機微こそが、千年のあいだ物語を動かしてきた',
    },
    {
      id: 'monogatari-rhetoric',
      title: '『レトリック』',
      power: 2,
      themes: ['bunrui', 'kenri'],
      gist: '同じ事実も、言い回し次第で正義にも罪にもなる',
    },
  ],

  // ── 趣味の棚 美学・意匠・映画・芸能 ──
  shumi: [
    {
      id: 'shumi-design-fashion',
      title: '『モードの迷宮』',
      power: 1,
      themes: ['keisho', 'shisen'],
      gist: 'いつ作られたものかは、飾りの形のほうが先に語ってしまう',
    },
    {
      id: 'shumi-composition',
      title: '『写真論』',
      power: 2,
      themes: ['shisen', 'kiroku'],
      gist: '写真に撮られた瞬間、その人はすでに見られ方を選んでいる',
    },
    {
      id: 'shumi-araki',
      title: '『写真ノ話』',
      power: 1,
      themes: ['shisen', 'kiroku'],
      gist: 'シャッターを切った瞬間、そこにあった時間が固定される',
    },
    {
      id: 'shumi-design-skeleton',
      title: '『デザインの骨格』',
      power: 2,
      themes: ['keisho', 'shisen'],
      gist: '形は、それが作られた時代の思想を黙って晒す',
    },
  ],

  // ── 数字の棚 統計・確率 ──
  suji: [
    {
      id: 'suji-benford',
      title: '『統計でウソをつく法』',
      power: 3,
      themes: ['kiroku', 'bunrui'],
      gist: '作られた数字は、自然に集まった数字とは違う顔つきをしている',
    },
    {
      id: 'suji-sampling-bias',
      title: '『「社会調査」のウソ』',
      power: 2,
      themes: ['shisen', 'kajo'],
      gist: '誰を数えなかったかが、出てきた答えのほうを決めている',
    },
    {
      id: 'suji-accidental',
      title: '『偶然の科学』',
      power: 2,
      themes: ['kajo', 'kiroku'],
      gist: '後から見れば必然に見えることの多くは、偶然の積み重なりにすぎない',
    },
    {
      id: 'suji-probability',
      title: '『確率で言えば』',
      power: 2,
      themes: ['bunrui', 'shisen'],
      gist: '大きな数の中では、ありえない一致のほうが、むしろ必ず起きる',
    },
  ],

  // ── 物証の棚 化学・物理・生物 ──
  busshou: [
    {
      id: 'busshou-ink-aging',
      title: '『元素周期表』',
      power: 2,
      themes: ['kiroku', 'keisho'],
      gist: '物質はそれぞれの尺度で古びる。書かれた時期は、紙と染料が覚えている',
    },
    {
      id: 'busshou-sound-distance',
      title: '『世界の不思議な音』',
      power: 1,
      themes: ['shisen', 'kyokai'],
      gist: 'その位置から、その音は本当に聞こえる距離だったのか',
    },
    {
      id: 'busshou-genes',
      title: '『やわらかな遺伝子』',
      power: 2,
      themes: ['keisho', 'kyokai'],
      gist: '生まれか育ちかの線は、思うよりずっと曖昧に引かれている',
    },
    {
      id: 'busshou-chemistry',
      title: '『化学の学校』',
      power: 1,
      themes: ['shisen', 'kiroku'],
      gist: '見えない変化も、色や匂いが先に告げている',
    },
  ],

  // ── 技芸の棚 技術・実務・生活知 ──
  gigei: [
    {
      id: 'gigei-stocktaking',
      title: '『帳簿の世界史』',
      power: 2,
      themes: ['kiroku', 'kajo'],
      gist: '数を合わせる作業には、必ず時代と人ごとの癖と手順がある',
    },
    {
      id: 'gigei-printing',
      title: '『印刷革命』',
      power: 1,
      themes: ['kajo', 'kiroku'],
      gist: '刷られた部数と綴じられた部数は、しばしば一致しない',
    },
    {
      id: 'gigei-carpenter-tools',
      title: '『大工道具の歴史』',
      power: 2,
      themes: ['kiroku', 'kajo'],
      gist: '道具の摩耗は、使い手の癖と手順を正直に記録している',
    },
    {
      id: 'gigei-zen-motorcycle',
      title: '『禅とオートバイ修理技術』',
      power: 2,
      themes: ['kajo', 'kiroku'],
      gist: '良い仕事とは、足すことではなく、余計を削ぎ落とすことだ',
    },
  ],

  // ── 勘定の棚 経済・会計・監査 ──
  kanjo: [
    {
      id: 'kanjo-principal-agent',
      title: '『近代株式会社と私有財産』',
      power: 3,
      themes: ['dairi', 'kenri'],
      gist: '任された者の利益と、任せた者の利益は、そもそも一致しない',
    },
    {
      id: 'kanjo-sunk-cost',
      title: '『行動経済学の逆襲』',
      power: 1,
      themes: ['kajo', 'kokan'],
      gist: 'すでに失ったものが、これからの判断のほうを歪めてしまう',
    },
    {
      id: 'kanjo-gift',
      title: '『贈与論』',
      power: 3,
      themes: ['kokan', 'kenri'],
      gist: '見返りを期待しないという建前こそが、人と人を強く縛る',
    },
    {
      id: 'kanjo-money',
      title: '『貨幣論』',
      power: 2,
      themes: ['kokan', 'dairi'],
      gist: '貨幣とは、他人への信頼を数で書いた証文にすぎない',
    },
    {
      id: 'kanjo-human-economy',
      title: '『人間の経済』',
      power: 2,
      themes: ['kajo', 'dairi'],
      gist: '値のつかないものを勘定から外すと、社会は静かに痩せていく',
    },
  ],

  // ── 理法の棚 法学・制度・行政 ──
  riho: [
    {
      id: 'riho-interpretation',
      title: '『法の帝国』',
      power: 2,
      themes: ['kenri', 'bunrui'],
      gist: '同じ条文が、読む者の物語の描き方によって別の意味を持つ',
    },
    {
      id: 'riho-whistleblowing',
      title: '『シークレット――ペンタゴン・ペーパーズ』',
      power: 2,
      themes: ['kokuhaku', 'dairi'],
      gist: '告発者は、告発した瞬間に組織の外側に置かれる',
    },
    {
      id: 'riho-imitation',
      title: '『模倣の法則』',
      power: 2,
      themes: ['kenri', 'bunrui'],
      gist: '法は上から下へ模倣される。真似られるうちに、正しさの顔をする',
    },
    {
      id: 'riho-archaeology',
      title: '『知の考古学』',
      power: 3,
      themes: ['kenri', 'kokuhaku'],
      gist: '何を語ってよいかを決める見えない規則が、時代ごとにある',
    },
  ],

  // ── 言葉の棚 言語学・記号論 ──
  kotoba: [
    {
      id: 'kotoba-euphemism',
      title: '『思考する言語』',
      power: 2,
      themes: ['kyokai', 'bunrui'],
      gist: '言い換えられた言葉は、何を守るために言い換えられたのかを教えてくれる',
    },
    {
      id: 'kotoba-honorifics',
      title: '『敬語はこわくない』',
      power: 1,
      themes: ['kenri', 'shisen'],
      gist: '誰が誰にどう話すかで、序列は残らず露出する',
    },
    {
      id: 'kotoba-untranslatable',
      title: '『翻訳できない世界のことば』',
      power: 1,
      themes: ['bunrui', 'kyokai'],
      gist: 'ある言語にしかない語は、その土地にしかない心の区切りを示す',
    },
    {
      id: 'kotoba-naming-mind',
      title: '『心を名づけること』',
      power: 2,
      themes: ['bunrui', 'kenri'],
      gist: '心の働きに名前がつくと、その名前のほうが心を作りはじめる',
    },
    {
      id: 'kotoba-language-world',
      title: '『言語が違えば、世界も違って見えるわけ』',
      power: 2,
      themes: ['kyokai', 'shisen'],
      gist: '言葉の区切りが違えば、同じ空の色さえ違って見える',
    },
  ],

  // ── 編集の棚(奥) 編集工学・メディア論・出版史・書誌学 ──
  henshu: [
    {
      id: 'henshu-subject-retreat',
      title: '『日本語の作文技術』',
      power: 3,
      themes: ['dairi', 'kokuhaku'],
      gist: '「そうなった」と書かれた文からは、誰がやったのかが静かに消えている',
    },
    {
      id: 'henshu-omissions',
      title: '『知の編集工学』',
      power: 2,
      themes: ['kiroku', 'kajo'],
      gist: '並べ方は、並べなかったもののほうによって決まっている',
    },
    {
      id: 'henshu-memory-book',
      title: '『記憶術と書物』',
      power: 2,
      themes: ['kiroku', 'kokuhaku'],
      gist: '書物が記憶を肩代わりした分だけ、人は覚えることをやめた',
    },
  ],

  // ── 来歴の棚(奥) 科学史・科学哲学 ──
  raireki: [
    {
      id: 'raireki-paradigm',
      title: '『科学革命の構造』',
      power: 3,
      themes: ['bunrui', 'kenri'],
      gist: '何が問題であるかは、その時代の枠組みのほうが先に決めている',
    },
    {
      id: 'raireki-pseudo-science',
      title: '『推測と反駁』',
      power: 2,
      themes: ['kenri', 'kyokai'],
      gist: '科学の正しさを掲げるものと、科学の身ぶりを借りるものは、まるで違う',
    },
    {
      id: 'raireki-tacit',
      title: '『暗黙知の次元』',
      power: 3,
      themes: ['bunrui', 'kyokai'],
      gist: '人は語れる以上のことを知っている。その知は分類の枠からはみ出す',
    },
  ],

  // ── 沈黙の棚(奥) 語られぬこと・余白・間 ──
  chinmoku: [
    {
      id: 'chinmoku-unspoken',
      title: '『苦海浄土』',
      power: 3,
      themes: ['kokuhaku', 'kiroku'],
      gist: '記録に無いということは、無かったということではない',
    },
    {
      id: 'chinmoku-tacit-consent',
      title: '『「空気」の研究』',
      power: 2,
      themes: ['kokuhaku', 'kyokai'],
      gist: '誰も言わないという形で、全員が同意していることがある',
    },
    {
      id: 'chinmoku-negative-capability',
      title: '『ネガティブ・ケイパビリティ』',
      power: 2,
      themes: ['kokuhaku', 'kyokai'],
      gist: 'わからないまま留まる力が、性急な線引きを思いとどまらせる',
    },
  ],
};

/** 棚ごとの種に shelf を注入して、従来どおりの平坦な一覧に落とす。 */
export const BOOKS: BookTag[] = SHELF_IDS.flatMap((shelf) =>
  SHELF_BOOKS[shelf].map((seed) => ({ ...seed, shelf })),
);

/** id から引くための索引。 */
export const LIBRARY: Map<string, BookTag> = new Map(BOOKS.map((b) => [b.id, b]));

export function book(id: string): BookTag {
  const found = LIBRARY.get(id);
  if (!found) throw new Error(`蔵書が見つからない: ${id}`);
  return found;
}
