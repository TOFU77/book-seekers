import type {
  Argument,
  ArgumentResult,
  BookTag,
  CharacterId,
  DebateContext,
  ShelfId,
  ThemeId,
} from '../types.js';
import { SHELVES, shelfDistance } from '../content/shelves.js';

/**
 * シナジー判定。
 *
 * 核心規則: 壁は「書架の一冊 × 手帳の一葉」でしか崩れない。
 * 知識だけでも証拠だけでも崩れない。この非対称が捜査フェーズと
 * 討論フェーズを構造的に接続する。
 *
 * 数値はすべて TUNING に集めてある。バランス調整はここだけを触る。
 */

export const TUNING = {
  /** 同じ棚の2冊目以降にかかる逓減率。精読は深いが、重ねるほど効きが落ちる。 */
  seidokuDecay: 0.6,

  /** 全部同じ棚のときの結合倍率。 */
  seidokuBonus: 1.2,

  /**
   * 棚またぎの距離別倍率。
   * 共有する主題があるときにだけ発火する。距離だけの寄せ集めは何も生まない。
   *
   * 結合と適合は掛け合わさるため、倍率を大きく取ると一手で壁が落ちる。
   * 「良い一手で壁の半分」を上限の目安にして抑えてある。
   */
  tanamatagiByDistance: {
    1: 1.2, // 同じ区分の別の棚 — 隣接
    2: 1.35, // 別の区分 — 棚またぎ
    3: 1.6, // 片方が奥の棚 — 遠望
  } as Record<number, number>,

  /** 主題を共有しない複数冊。ただの寄せ集めで、何のシナジーも生まない。 */
  yoseatsume: 1.0,

  /**
   * 筋が通って急所に当たった。複数冊の**共有主題**が相手の弱点を突いている。
   *
   * 結合倍率(棚の遠さ)より適合倍率(相手の読み)のほうを大きく取ってある。
   * 逆にすると「棚の組み合わせを解くパズル」になり、
   * 相手が誰であるかが関係なくなる — ミステリーでなくなる。
   */
  weakThemeBonus: 2.2,

  /**
   * かすった。一冊の主題がたまたま急所に触れているが、筋にはなっていない。
   *
   * 何も考えずに強い本を出しているだけのプレイヤーにも、
   * 細い勝ち筋を残すための値。組み立てたプレイヤーとの差は開けたまま、
   * 「何をやっても全く削れない」体験にはしない。
   *
   * 1.7 では単品連打が棚またぎを上回ってしまい、組み立てる意欲を削いだ。
   * 困ったときの救済としては 1.5 で足りる。
   */
  grazeBonus: 1.5,

  /** 耐性棚だけで構成された論述。相手が既に「調べればわかること」で武装している。 */
  resistedPenalty: 0.3,

  /**
   * 通り一遍。急所をかすりもせず、組み合わせも成っていない論述。
   *
   * 本を一冊引いて証拠を添えただけでは、人の思い込みは動かない。
   * これがあることで「何を出しても少しずつ削れる」状態がなくなる。
   */
  toriippenPenalty: 0.65,

  /** 棚の慣れ。同じ棚を繰り返すほど相手が慣れる。 */
  fatigueRate: 0.3,

  /**
   * 手の内。一度突きつけた証拠は、二度目には驚かれない。
   * 棚の慣れより厳しくしてある — 証拠は本より一回性が強い。
   *
   * これが無いと、証拠を一つしか持たずに討論へ行っても勝ててしまい、
   * 捜査で証拠を集める意味が消える(通し検証で発覚した)。
   */
  shownRate: 0.6,

  /** 論述に使える書架タグの上限。 */
  maxBooks: 3,

  /**
   * 壁の種類による重み。企画上の「論理の壁は証拠で、心理の壁は知識で崩す」を
   * ここで機構にする。
   *
   *   論理の壁 … 手帳(証拠)が主。書架は補助にしかならない
   *   心理の壁 … 書架(知識)が主。手帳は定礎を成立させるために要る
   */
  wallWeights: {
    ronri: { books: 0.7, notebook: 2.0 },
    shinri: { books: 1.0, notebook: 1.0 },
  } as Record<'ronri' | 'shinri', { books: number; notebook: number }>,
} as const;

// ─────────────────────────────────────────────

/** 即席タグを見識に変えられる同席者が居るか。 */
export function findInterpreter(
  shelf: ShelfId,
  ctx: DebateContext,
): CharacterId | undefined {
  for (const who of ctx.present) {
    const readIds = ctx.read[who] ?? [];
    for (const bookId of readIds) {
      if (ctx.library.get(bookId)?.shelf === shelf) return who;
    }
  }
  return undefined;
}

/** すべての本が共有している主題。ひとつも無ければ棚またぎは発火しない。 */
export function sharedThemes(books: BookTag[]): ThemeId[] {
  if (books.length === 0) return [];
  const [first, ...rest] = books as [BookTag, ...BookTag[]];
  return first.themes.filter((t) => rest.every((b) => b.themes.includes(t)));
}

/** 棚ごとにまとめる。 */
function groupByShelf(books: BookTag[]): Map<ShelfId, BookTag[]> {
  const groups = new Map<ShelfId, BookTag[]>();
  for (const book of books) {
    const list = groups.get(book.shelf);
    if (list) list.push(book);
    else groups.set(book.shelf, [book]);
  }
  return groups;
}

/**
 * 一回の論述を評価する。
 *
 * 手順:
 *   1. 定礎チェック — 手帳が無い、または即席タグを読める者が同席していなければ不成立
 *   2. 書架の合計 — 棚ごとに精読の逓減をかけ、その棚の慣れで割る
 *   3. 結合倍率 — 単品 / 精読 / 棚またぎ / 寄せ集め
 *   4. 適合倍率 — 弱点主題に触れたか、耐性棚だけで固めていないか
 */
export function evaluateArgument(arg: Argument, ctx: DebateContext): ArgumentResult {
  const empty: ArgumentResult['breakdown'] = {
    shelfSum: 0,
    notebookValue: 0,
    base: 0,
    combination: 1,
    fit: 1,
    kind: 'tanpin',
    sharedThemes: [],
    maxDistance: 0,
    notes: [],
  };

  // ── 1. 定礎 ──
  if (arg.books.length === 0) {
    return {
      ok: false,
      reason: '書架の裏付けがない。証拠だけでは壁は崩れない',
      damage: 0,
      breakdown: empty,
    };
  }
  if (arg.books.length > TUNING.maxBooks) {
    return {
      ok: false,
      reason: `一度に開けるのは${TUNING.maxBooks}冊まで`,
      damage: 0,
      breakdown: empty,
    };
  }

  const notes: string[] = [];
  let interpreter: CharacterId | undefined;

  if (arg.notebook.kind === 'sokuseki') {
    interpreter = findInterpreter(arg.notebook.shelf, ctx);
    if (!interpreter) {
      return {
        ok: false,
        reason:
          `即席の調べものは、それだけでは見識にならない。` +
          `${SHELVES[arg.notebook.shelf].label}を読んだ者が同席していない`,
        damage: 0,
        breakdown: empty,
      };
    }
    notes.push('即席の調べものを、読んだ者が受け止めた');
  }

  // ── 2. 書架の合計 ──
  const groups = groupByShelf(arg.books);
  let shelfSum = 0;
  for (const [shelf, group] of groups) {
    const sorted = [...group].sort((a, b) => b.power - a.power);
    let groupSum = 0;
    sorted.forEach((book, i) => {
      groupSum += book.power * TUNING.seidokuDecay ** i;
    });
    const fatigue = ctx.fatigue[shelf] ?? 0;
    const worn = groupSum / (1 + TUNING.fatigueRate * fatigue);
    if (fatigue > 0) {
      notes.push(`${SHELVES[shelf].label}は${fatigue}回目 — 相手が慣れている`);
    }
    shelfSum += worn;
  }

  const weights = TUNING.wallWeights[ctx.wall.kind];
  const shownTimes = ctx.shown?.[arg.notebook.id] ?? 0;
  const notebookValue =
    Math.round((arg.notebook.certainty / (1 + TUNING.shownRate * shownTimes)) * 100) / 100;
  if (shownTimes > 0) {
    notes.push(`その証拠は${shownTimes}度目 — 相手はもう驚かない`);
  }
  const base =
    Math.round((shelfSum * weights.books + notebookValue * weights.notebook) * 100) / 100;

  // ── 3. 結合倍率 ──
  let combination = 1;
  let kind: ArgumentResult['breakdown']['kind'] = 'tanpin';
  let shared: ThemeId[] = [];
  let maxDistance = 0;

  if (arg.books.length === 1) {
    kind = 'tanpin';
  } else if (groups.size === 1) {
    kind = 'seidoku';
    combination = TUNING.seidokuBonus;
    shared = sharedThemes(arg.books);
    notes.push('精読 — 同じ棚を掘り下げた');
  } else {
    shared = sharedThemes(arg.books);
    for (const a of arg.books) {
      for (const b of arg.books) {
        maxDistance = Math.max(maxDistance, shelfDistance(a.shelf, b.shelf));
      }
    }
    if (shared.length === 0) {
      kind = 'yoseatsume';
      combination = TUNING.yoseatsume;
      notes.push('棚は違うが、繋がる主題がない — ただの寄せ集め');
    } else {
      kind = 'tanamatagi';
      combination = TUNING.tanamatagiByDistance[maxDistance] ?? 1;
      notes.push(
        maxDistance === 3
          ? '遠望 — 奥の棚から光が当たった'
          : maxDistance === 2
            ? '棚またぎ — 意外な照射角'
            : '隣接 — 近い棚どうしの補強',
      );
    }
  }

  // ── 4. 適合倍率 ──
  //
  // 三段階に分ける。
  //   筋が通った … 複数冊の**共有主題**が急所を突いている。狙って当てた一撃
  //   かすった   … どれか一冊の主題が急所に触れている。偶然でも少しは効く
  //   通り一遍   … かすりもせず、組み合わせも成っていない
  //
  // 「共有主題」と「どれか一冊の主題」を区別することが要になる。
  // これが無いと、手当たり次第に三冊積めば主題が六つ乗り、偶然当たってしまう。
  let fit = 1;
  const thread = new Set(arg.books.length === 1 ? arg.books[0]!.themes : shared);
  const anyTheme = new Set(arg.books.flatMap((b) => b.themes));
  const threadHit = ctx.wall.weakThemes.filter((t) => thread.has(t));
  const grazeHit = ctx.wall.weakThemes.filter((t) => anyTheme.has(t));

  if (threadHit.length > 0 && arg.books.length >= 2) {
    fit *= TUNING.weakThemeBonus;
    notes.push('筋が通った — 相手の触れられたくないところを、正面から突いた');
  } else if (arg.books.length === 1 && grazeHit.length > 0) {
    // 「かすった」は単品にだけ認める。
    // 複数冊にも認めると、三冊撒けば主題が六つ乗って必ず当たってしまい、
    // 何も考えないプレイのほうが素直なプレイより強くなる。
    fit *= TUNING.grazeBonus;
    notes.push('かすった — 相手が一瞬だけ言葉に詰まった');
  } else if (kind === 'tanpin' || kind === 'yoseatsume') {
    fit *= TUNING.toriippenPenalty;
    notes.push('通り一遍 — 相手は動じない');
  }

  const allResisted = arg.books.every((b) => ctx.wall.resistantShelves.includes(b.shelf));
  if (allResisted) {
    fit *= TUNING.resistedPenalty;
    notes.push('相手は既にその程度は調べている — 崩れない');
  }
  fit = Math.round(fit * 100) / 100;

  const damage = Math.round(base * combination * fit * 10) / 10;

  return {
    ok: true,
    damage,
    breakdown: {
      shelfSum: Math.round(shelfSum * 100) / 100,
      notebookValue,
      base: Math.round(base * 100) / 100,
      combination,
      fit,
      kind,
      sharedThemes: shared,
      maxDistance,
      ...(interpreter ? { interpreter } : {}),
      notes,
    },
  };
}

/** 討論の場で、その論述を実際に切ったあとの状態を返す(慣れを進める)。 */
export function applyArgument(arg: Argument, ctx: DebateContext): DebateContext {
  const fatigue = { ...ctx.fatigue };
  for (const shelf of new Set(arg.books.map((b) => b.shelf))) {
    fatigue[shelf] = (fatigue[shelf] ?? 0) + 1;
  }
  return { ...ctx, fatigue };
}
