import type {
  Argument,
  ArgumentResult,
  BookTag,
  CharacterId,
  DebateContext,
  Layer,
  ShelfId,
  WallKind,
} from '../types.js';
import { evaluateArgument } from './synergy.js';

/**
 * 討論の進行。
 *
 * 一つの層には論理の壁と心理の壁があり、**共通の手数**の中で両方を崩す。
 * どちらを先に攻めるか、手数をどう割り振るかがプレイヤーの判断になる。
 * 片方だけ崩しても決着しない — アリバイと自己正当化の両方が要る。
 */

export interface DebateState {
  layer: Layer;
  remaining: Record<WallKind, number>;
  turnsLeft: number;
  fatigue: Partial<Record<ShelfId, number>>;
  /** 手帳タグごとに、何度突きつけたか。 */
  shown: Partial<Record<string, number>>;
  present: CharacterId[];
  read: Partial<Record<CharacterId, string[]>>;
  library: Map<string, BookTag>;
  /** 何手目に何が起きたかの記録。 */
  log: DebateEntry[];
}

export interface DebateEntry {
  turn: number;
  target: WallKind;
  damage: number;
  ok: boolean;
  kind: ArgumentResult['breakdown']['kind'];
  reason?: string;
}

export function startDebate(
  layer: Layer,
  present: CharacterId[],
  read: Partial<Record<CharacterId, string[]>>,
  library: Map<string, BookTag>,
): DebateState {
  return {
    layer,
    remaining: { ronri: layer.logical.hardness, shinri: layer.psych.hardness },
    turnsLeft: layer.turns,
    fatigue: {},
    shown: {},
    present,
    read,
    library,
    log: [],
  };
}

/** 指定の壁に対する評価用の文脈を作る。 */
export function contextFor(state: DebateState, target: WallKind): DebateContext {
  return {
    wall: target === 'ronri' ? state.layer.logical : state.layer.psych,
    present: state.present,
    read: state.read,
    fatigue: state.fatigue,
    shown: state.shown,
    library: state.library,
  };
}

/** 一手を実際に打つ。状態は変更せず、新しい状態を返す。 */
export function play(
  state: DebateState,
  target: WallKind,
  arg: Argument,
): { state: DebateState; result: ArgumentResult } {
  const result = evaluateArgument(arg, contextFor(state, target));

  const fatigue = { ...state.fatigue };
  const shown = { ...state.shown };
  // 不成立の手も、口に出した以上は手数を消費する。棚の慣れだけは進まない。
  if (result.ok) {
    for (const shelf of new Set(arg.books.map((b) => b.shelf))) {
      fatigue[shelf] = (fatigue[shelf] ?? 0) + 1;
    }
    shown[arg.notebook.id] = (shown[arg.notebook.id] ?? 0) + 1;
  }

  const remaining = { ...state.remaining };
  remaining[target] = Math.max(0, Math.round((remaining[target] - result.damage) * 10) / 10);

  const entry: DebateEntry = {
    turn: state.layer.turns - state.turnsLeft + 1,
    target,
    damage: result.damage,
    ok: result.ok,
    kind: result.breakdown.kind,
    ...(result.reason ? { reason: result.reason } : {}),
  };

  return {
    state: {
      ...state,
      remaining,
      fatigue,
      shown,
      turnsLeft: state.turnsLeft - 1,
      log: [...state.log, entry],
    },
    result,
  };
}

export function isWon(state: DebateState): boolean {
  return state.remaining.ronri <= 0 && state.remaining.shinri <= 0;
}

export function isOver(state: DebateState): boolean {
  return isWon(state) || state.turnsLeft <= 0;
}

/** その層で使える書架タグ。同席者が読了しているものの重複を除いた集合。 */
export function availableBooks(state: DebateState): BookTag[] {
  const ids = new Set<string>();
  for (const who of state.present) {
    for (const id of state.read[who] ?? []) ids.add(id);
  }
  const books: BookTag[] = [];
  for (const id of ids) {
    const b = state.library.get(id);
    if (b) books.push(b);
  }
  return books;
}
