/**
 * 共通の型定義。
 *
 * 企画上の用語との対応:
 *   書架 = 店の棚にある知識タグ(周回を跨いで残る)
 *   手帳 = 捜査で持ち帰る証拠・証言・道具・即席タグ(事件ごとにリセット)
 *   壁   = 崩す対象。論理の壁(アリバイ)と心理の壁(自己正当化)の二重構造
 */

// ─────────────────────────────────────────────
// 棚
// ─────────────────────────────────────────────

/** 区分。IV は「奥の棚」＝店主の私架で、知そのものを扱うメタな知。 */
export type DivisionId = 'I' | 'II' | 'III' | 'IV';

export type ShelfId =
  // 区分I 人を読む
  | 'jinshin'    // 人心の棚 — 心理学・精神医学
  | 'seken'      // 世間の棚 — 社会学・組織論
  | 'tochi'      // 土地の棚 — 民俗学・地方史・地理
  | 'monogatari' // 物語の棚 — 文学・修辞・ナラティヴ心理学
  | 'shumi'      // 趣味の棚 — 美学・意匠・映画・芸能
  // 区分II 世界を測る
  | 'suji'       // 数字の棚 — 統計・確率
  | 'busshou'    // 物証の棚 — 化学・物理・生物
  | 'gigei'      // 技芸の棚 — 技術・実務・生活知
  // 区分III 仕組みを解く
  | 'kanjo'      // 勘定の棚 — 経済・会計・監査
  | 'riho'       // 理法の棚 — 法学・制度・行政
  | 'kotoba'     // 言葉の棚 — 言語学・記号論
  // 区分IV 奥の棚
  | 'henshu'     // 編集の棚 — 編集工学・メディア論・出版史・書誌学
  | 'raireki'    // 来歴の棚 — 科学史・科学哲学
  | 'chinmoku';  // 沈黙の棚 — 語られぬこと・余白・間

export interface Shelf {
  id: ShelfId;
  /** 表示名。例: 「人心の棚」 */
  label: string;
  division: DivisionId;
  /** 領域の説明。例: 「心理学・精神医学」 */
  field: string;
}

// ─────────────────────────────────────────────
// 主題
// ─────────────────────────────────────────────

/**
 * 主題。棚をまたぐシナジー(「意外な照射角」)の成立条件。
 *
 * 離れた棚の本どうしが同じ主題を共有しているときにだけ、棚またぎが発火する。
 * 距離が遠いだけの寄せ集めは何も生まない。つまり主題は、
 * この書店の概念上の索引にあたる。
 */
export type ThemeId =
  | 'dairi'      // 代理と信任
  | 'kyokai'     // 境界と逸脱
  | 'kiroku'     // 記録と忘却
  | 'kokan'      // 交換と贈与
  | 'kenri'      // 権威と正統
  | 'bunrui'     // 分類と名づけ
  | 'shisen'     // 見ることと見られること
  | 'keisho'     // 継承と断絶
  | 'kajo'       // 過剰と欠乏
  | 'kokuhaku';  // 沈黙と告白

export interface Theme {
  id: ThemeId;
  label: string;
  /** その主題が問うていること。犯人の自己正当化と接続する手がかりになる。 */
  note: string;
}

// ─────────────────────────────────────────────
// 書架(知識タグ)
// ─────────────────────────────────────────────

/** 威力・確度は 1〜3。3は稀少で、1周では数冊しか手に入らない想定。 */
export type Rank = 1 | 2 | 3;

export interface BookTag {
  id: string;
  /** 蔵書としての表題。ゲーム画面にはこれが出る。 */
  title: string;
  shelf: ShelfId;
  power: Rank;
  themes: ThemeId[];
  /** 一行の内容説明。討論で切ったときの文言の素になる。 */
  gist: string;
}

// ─────────────────────────────────────────────
// 手帳(証拠タグ)
// ─────────────────────────────────────────────

/**
 * 手帳タグの種別。
 *
 * 'sokuseki'(即席)は検索・生成AIで得たもの。捜査の進行には使えるが、
 * 討論では単独で定礎を作れない。その分野の棚を読了している幼馴染が
 * 同席していて初めて見識に変わる。
 */
export type NotebookKind = 'shoko' | 'shogen' | 'dogu' | 'sokuseki';

export interface NotebookTag {
  id: string;
  label: string;
  kind: NotebookKind;
  certainty: Rank;
  /**
   * どの分野に属する事実か。
   * 即席タグでは、この棚の読了者が同席していないと定礎が成立しない。
   */
  shelf: ShelfId;
  /** 誰が持ち帰ったか。 */
  broughtBy?: CharacterId;
}

// ─────────────────────────────────────────────
// 人物
// ─────────────────────────────────────────────

export type CharacterId = 'hiiragi' | 'mochizuki' | 'makabe' | 'senou' | 'asakura';

/**
 * 気質四軸。-2 〜 +2 の五段階。0 は中庸。
 * 善悪ではなく、どちらの極も遊べる振れ幅として定義する。
 */
export interface Temperament {
  /** 知の入手先: -2 書物 ⇄ +2 足 */
  source: -2 | -1 | 0 | 1 | 2;
  /** 理解の仕方: -2 理屈 ⇄ +2 気配 */
  grasp: -2 | -1 | 0 | 1 | 2;
  /** 人への接し方: -2 踏み込み ⇄ +2 見守り */
  approach: -2 | -1 | 0 | 1 | 2;
  /** 決着の望み: -2 暴く ⇄ +2 収める */
  resolve: -2 | -1 | 0 | 1 | 2;
}

export interface Character {
  id: CharacterId;
  name: string;
  reading: string;
  /** 生業。得意な棚が自然に決まるように選んである。 */
  trade: string;
  /** 制作上のメモ。ゲーム内には出さない。 */
  archetype: string;
  /** 所作の癖 3つ */
  anchors: string[];
  /** 自由記述の徳目 3語 */
  virtues: string[];
  /** その人が抱えている問い 3つ */
  subjects: string[];
  /** 理性を保留して情動で動く条件 3つ */
  triggers: string[];
  speech: string;
  temperament: Temperament;
  goodShelves: ShelfId[];
  weakShelf: ShelfId;
}

// ─────────────────────────────────────────────
// 壁と討論
// ─────────────────────────────────────────────

export type WallKind = 'ronri' | 'shinri';

export interface Wall {
  kind: WallKind;
  /**
   * 堅さ。層1で30前後、層2で60前後、層3で100前後を想定。
   * 良い一手で壁の半分弱、3手前後で決着する釣り合いにしてある。
   */
  hardness: number;
  /**
   * 弱点主題。相手の反応トリガーに対応する。
   * ここに触れる論述は大きく効く。
   */
  weakThemes: ThemeId[];
  /**
   * 耐性のある棚。相手が既に「調べればわかること」で武装している領域。
   * 検索・AI万能説へのアンチテーゼをここで機構化する。
   */
  resistantShelves: ShelfId[];
}

/** 一回の論述。手帳1枚が必須(定礎)、書架は1〜3枚。 */
export interface Argument {
  notebook: NotebookTag;
  books: BookTag[];
}

// ─────────────────────────────────────────────
// 事件
// ─────────────────────────────────────────────

/** 対峙する相手。層が深まるごとに交代する。 */
export interface Opponent {
  name: string;
  role: string;
  /** 自己正当化の語り。これが心理の壁の中身。 */
  justification: string;
  /** 反応トリガー。壁の弱点主題と対応させる。 */
  triggers: string[];
}

/** 捜査に出向く先の性質。 */
export type LocationKind =
  | 'kiroku'  // 帳場・書庫。記録が出る
  | 'hito'    // 関係者。証言が出る
  | 'genba'   // 現場。物証が出る
  | 'honnin'; // 本人。実入りは大きいが警戒される

export interface Location {
  id: string;
  label: string;
  kind: LocationKind;
  /** ここで手に入る手帳タグのid(その層の notebook を参照する)。 */
  yields: string[];
  /**
   * 相手の人物像にどれだけ迫れるか(0〜2)。
   * 座談で積み上がると、相手の反応トリガーが判明する。
   */
  insight: number;
}

/**
 * 事件の一層。
 *
 * 論理の壁と心理の壁の両方を、共通の手数の中で崩す。
 * どちらを先に攻めるか、手数をどう割り振るかがプレイヤーの判断になる。
 */
export interface Layer {
  depth: 1 | 2 | 3;
  title: string;
  opponent: Opponent;
  logical: Wall;
  psych: Wall;
  /** この層の捜査で入手しうる手帳タグ。 */
  notebook: NotebookTag[];
  /** 捜査で出向ける先。 */
  locations: Location[];
  /** 捜査に使える日数。 */
  days: number;
  /** 討論に使える手数。 */
  turns: number;
  /**
   * 層の冒頭に置く一節。店の蔵書からの引用という体裁を取る。
   * 実在の書物は引かない — 引くのは、この店の棚にある本だけである。
   */
  epigraph: { text: string; source: string };
  /** 崩したときの結び。クリアの報酬はこの文章である。 */
  resolution: string[];
  /** 崩せなかったときの結び。 */
  failure: string[];
  /** 次の層へ進むかの分岐で、掘れと言う者／止めろと言う者。 */
  pushes?: CharacterId;
  holds?: CharacterId;
}

export interface Case {
  id: string;
  title: string;
  /** 発端。サロンに持ち込まれる噂。 */
  hook: string;
  /**
   * 事件関係者のひとこと。イントロでひとつだけ無作為に選ばれる。
   * 誰の声が耳に残ったかで、その周の入り方が変わる。
   */
  voices: Array<{ who: string; line: string }>;
  layers: Layer[];
}

/** 討論の場の状態。 */
export interface DebateContext {
  wall: Wall;
  /** 同席している幼馴染。 */
  present: CharacterId[];
  /** 誰がどの蔵書を読了しているか。 */
  read: Partial<Record<CharacterId, string[]>>;
  /** 棚ごとの「慣れ」。同じ棚を繰り返すほど相手が慣れて効かなくなる。 */
  fatigue: Partial<Record<ShelfId, number>>;
  /**
   * 手帳タグごとの「手の内」。
   * 一度突きつけた証拠は、二度目には驚かれない。
   * これが無いと、証拠を一つだけ持って討論に臨んでも勝ててしまう。
   */
  shown?: Partial<Record<string, number>>;
  /** 蔵書の索引。読了判定で棚を引くのに使う。 */
  library: Map<string, BookTag>;
}

/** 論述の評価結果。 */
export interface ArgumentResult {
  /** 定礎が成立したか。false なら damage は 0。 */
  ok: boolean;
  /** 不成立の理由。プレイヤーに見せる。 */
  reason?: string;
  damage: number;
  breakdown: {
    /** 書架の合計(精読の逓減と棚の慣れを適用済み) */
    shelfSum: number;
    /** 手帳の確度 */
    notebookValue: number;
    base: number;
    /** 結合倍率(精読 or 棚またぎ) */
    combination: number;
    /** 適合倍率(弱点主題 or 耐性棚) */
    fit: number;
    /** 発火した結合の種類 */
    kind: 'tanpin' | 'seidoku' | 'tanamatagi' | 'yoseatsume';
    /** 棚またぎが成立した場合の共有主題 */
    sharedThemes: ThemeId[];
    /** 棚またぎの最大距離 */
    maxDistance: number;
    /** 即席タグを見識に変えた同席者。engine は表示名を知らないので id で返す。 */
    interpreter?: CharacterId;
    notes: string[];
  };
}
