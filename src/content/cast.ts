import type { Character, CharacterId } from '../types.js';

/**
 * 幼馴染5人。
 *
 * 京極堂シリーズの役割原型のみを借り、キャラクターは写していない(著作権への配慮)。
 * 舞台は2020年代の衰退した地方都市。5人とも緩やかに沈んでいく職業に就いている。
 *
 * 上層(人物票)は自由記述で描写を担い、下層(気質四軸)が機構を駆動する。
 */
export const CAST: Record<CharacterId, Character> = {
  hiiragi: {
    id: 'hiiragi',
    name: '柊 律',
    reading: 'ひいらぎ りつ',
    trade: '古書店「柊書房」店主',
    archetype: '知識役。拠点の主。動かないが、持ち込まれたものの意味を決める',
    anchors: [
      '客が話し終わるまで本を閉じない',
      '値札を指で撫でる',
      '断言の前に一拍置く',
    ],
    virtues: ['該博', '偏屈', '待ち'],
    subjects: [
      '知っていることと役に立つことの隔たり',
      '人が自分に語る物語を、どこまで剥がしてよいのか',
      '店を続けることそのものの意味',
    ],
    triggers: [
      '知識が実務の役に立たないと言われるとき',
      '読まずに要約で足りるとされるとき',
      '誰かが自分の来歴を偽るとき',
    ],
    speech: '「……いや、それはね。そういう話ではないんですよ」',
    temperament: { source: -2, grasp: -1, approach: 1, resolve: -1 },
    goodShelves: ['henshu', 'raireki', 'kotoba'],
    weakShelf: 'gigei',
  },

  mochizuki: {
    id: 'mochizuki',
    name: '望月 遥',
    reading: 'もちづき はるか',
    trade: '出版社の外部校正者(在宅)',
    archetype: '記録役。語り手。自信がなく、しかし誰よりも気づいている',
    anchors: [
      '相手の言い直しを必ず覚えている',
      '指先で行を追う癖',
      '言いかけて飲み込む',
    ],
    virtues: ['逡巡', '精度', '引け目'],
    subjects: [
      '気づいてしまったことに責任はあるのか',
      '正しさを指摘することと、人を傷つけることの区別',
      '自分の仕事が誰の目にも触れないこと',
    ],
    triggers: [
      '「細かいことだ」と切り捨てられるとき',
      '誰かが言い淀んだのを、周囲が聞き流すとき',
      '自分の指摘が的中したと言われるとき(喜べない)',
    ],
    speech: '「あの……たぶん、違うと思うんですけど、たぶんです」',
    temperament: { source: -1, grasp: 2, approach: 2, resolve: 2 },
    goodShelves: ['monogatari', 'chinmoku', 'jinshin'],
    weakShelf: 'kanjo',
  },

  makabe: {
    id: 'makabe',
    name: '真壁 隼',
    reading: 'まかべ はやと',
    trade: '金属加工の町工場を継いだ三代目',
    archetype: '行動役。直進する。考える前に現場へ行っている',
    anchors: [
      '話しながら手が何かを触っている',
      '相手の目を見て黙らない',
      '帰り際に一つ余計なことを言う',
    ],
    virtues: ['実効', '直情', '手癖'],
    subjects: [
      '手を動かさない人間の言うことをどこまで信じるか',
      '継いだものを続けることと、変えることの両立',
      '怒りを抑えることは正しいのか',
    ],
    triggers: [
      '現場を知らない人間が段取りを語るとき',
      '職人の仕事が「単純作業」と呼ばれるとき',
      '話し合いを続けることで結論が先送りされるとき',
    ],
    speech: '「で、それ誰が実際にやったんだ。名前は」',
    temperament: { source: 1, grasp: -2, approach: -2, resolve: -2 },
    goodShelves: ['gigei', 'busshou', 'suji'],
    weakShelf: 'monogatari',
  },

  senou: {
    id: 'senou',
    name: '瀬能 佐和',
    reading: 'せのう さわ',
    trade: '信用金庫の渉外担当。町の商店を毎日回る',
    archetype: '取材役。町中を歩き、誰の懐具合も知っている。だから最も動けない',
    anchors: [
      '名刺入れを開けずに相手の肩書きを言う',
      '立ち話を五分で切り上げる',
      '数字だけは手帳に書く',
    ],
    virtues: ['顔繋ぎ', '算盤', '板挟み'],
    subjects: [
      '知ってしまった相手と、明日も取引を続けられるか',
      '信用とは何を担保にしているのか',
      '町の中で生きることと、町を見限ること',
    ],
    triggers: [
      '「よそ者だから言える」という物言い',
      '帳簿の辻褄が合わないのを見過ごせと言われるとき',
      '自分の仕事が金貸しと同じだと言われるとき',
    ],
    speech: '「うん、まあ……それ、私の口からは言えないやつなんだけどね」',
    temperament: { source: 2, grasp: -1, approach: -1, resolve: 1 },
    goodShelves: ['kanjo', 'seken', 'riho'],
    weakShelf: 'chinmoku',
  },

  asakura: {
    id: 'asakura',
    name: '朝倉 灯',
    reading: 'あさくら あかり',
    trade: '町の写真館。証明写真から祭礼の記録まで撮る',
    archetype: '直感役。理屈でなく「見えて」しまう。ただし説明はできない',
    anchors: [
      '人の顔を正面から見過ぎる',
      '話の途中で急に窓の外を見る',
      '撮った写真を見せる前に自分で長く見る',
    ],
    virtues: ['眼', '頓着のなさ', '断言'],
    subjects: [
      '見えてしまったものを言葉にする義務があるのか',
      '写真に写るものと、その人が見せたいものの差',
      '記録すること自体が誰かを縛るのではないか',
    ],
    triggers: [
      '「写真は嘘をつかない」と言われるとき',
      '昔の写真を捨てろと言われるとき',
      '自分の直感を根拠を出せと詰められるとき',
    ],
    speech: '「あの人、去年の秋から笑い方が変わってるよ。写真見ればわかる」',
    // 軸4が0(中庸)。深掘り分岐の事実上のキャスティングボート。
    temperament: { source: 1, grasp: 1, approach: 1, resolve: 0 },
    goodShelves: ['shumi', 'tochi', 'jinshin'],
    weakShelf: 'riho',
  },
};

export const CAST_IDS = Object.keys(CAST) as CharacterId[];

// ─────────────────────────────────────────────
// ペアの化学反応
// ─────────────────────────────────────────────

export type AxisId = 'source' | 'grasp' | 'approach' | 'resolve';

export const AXIS_LABELS: Record<AxisId, { minus: string; plus: string; note: string }> = {
  source:   { minus: '書物',     plus: '足',     note: 'どこから知を得るか' },
  grasp:    { minus: '理屈',     plus: '気配',   note: 'どう理解するか' },
  approach: { minus: '踏み込み', plus: '見守り', note: '人にどう接するか' },
  resolve:  { minus: '暴く',     plus: '収める', note: '決着に何を望むか' },
};

export const AXIS_IDS: AxisId[] = ['source', 'grasp', 'approach', 'resolve'];

export interface PairChemistry {
  /** 同極の軸数。深いが狭い情報が返る。 */
  resonance: number;
  /** 異極の軸数。浅いが広い網になる。 */
  friction: number;
  /** どちらとも言えない(片方が中庸)軸数。 */
  neutral: number;
  /**
   * 軸1(書物⇄足)で異極か。
   * これが真のペアだけが「定礎」の材料 — 本と領収書の両方 — を持ち帰る。
   */
  bringsFoundation: boolean;
  /** 同極だった軸 */
  resonantAxes: AxisId[];
  /** 異極だった軸 */
  frictionAxes: AxisId[];
}

/**
 * ペアの化学反応を判定する。
 *
 *   同極ペア = 共鳴 … 深いが狭い。一つの筋を掘り下げた濃い情報
 *   異極ペア = 反発 … 浅いが広い。噛み合わないぶん拾う網が広い
 */
export function pairChemistry(a: CharacterId, b: CharacterId): PairChemistry {
  const ta = CAST[a].temperament;
  const tb = CAST[b].temperament;

  const resonantAxes: AxisId[] = [];
  const frictionAxes: AxisId[] = [];
  let neutral = 0;

  for (const axis of AXIS_IDS) {
    const va = ta[axis];
    const vb = tb[axis];
    if (va === 0 || vb === 0) {
      neutral += 1;
    } else if (Math.sign(va) === Math.sign(vb)) {
      resonantAxes.push(axis);
    } else {
      frictionAxes.push(axis);
    }
  }

  return {
    resonance: resonantAxes.length,
    friction: frictionAxes.length,
    neutral,
    bringsFoundation: frictionAxes.includes('source'),
    resonantAxes,
    frictionAxes,
  };
}

/** 全ペアの組み合わせ(10通り)。 */
export function allPairs(): Array<[CharacterId, CharacterId]> {
  const pairs: Array<[CharacterId, CharacterId]> = [];
  for (let i = 0; i < CAST_IDS.length; i++) {
    for (let j = i + 1; j < CAST_IDS.length; j++) {
      pairs.push([CAST_IDS[i]!, CAST_IDS[j]!]);
    }
  }
  return pairs;
}
