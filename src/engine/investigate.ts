import type {
  CharacterId,
  Layer,
  Location,
  NotebookTag,
  ShelfId,
  ThemeId,
} from '../types.js';
import { CAST, pairChemistry } from '../content/cast.js';
import { SHELVES } from '../content/shelves.js';
import { THEMES } from '../content/themes.js';
import type { Rng } from './rng.js';

/**
 * 捜査フェーズ。
 *
 * 模擬対局で分かったこと: **討論の最中に相手を学ぶ時間は無い。**
 * よって捜査が生むべきものは証拠だけではない。相手の反応トリガー —
 * すなわち討論での急所 — を、ここで掴んでおかなければならない。
 *
 * 捜査は四つのものを同時に奪い合う。日数は限られている。
 *   1. 手帳タグ   … 定礎の材料。これが無いと討論が始まらない
 *   2. 人物の理解 … 座談で反応トリガーに変わる
 *   3. 読了       … 店に残った者が積読を崩す
 *   4. 相手の警戒 … 踏み込みすぎると、その場所が閉じる
 *
 * 気質四軸が、ここで全部仕事をする。
 *   軸1 書物⇄足     … 異極のペアだけが、本と領収書の両方を持ち帰る
 *   軸2 理屈⇄気配   … 気配寄りが居ると人物の理解が進む
 *   軸3 踏み込み⇄見守り … 踏み込みは速いが警戒を招く
 *   軸4 暴く⇄収める … 層の深掘り分岐で効く(討論の後)
 */

export const INVESTIGATION_TUNING = {
  /** ここまで警戒が上がると、その場所は口を閉ざす。 */
  guardLimit: 3,
  /** 人物の理解がこれだけ積み上がるごとに、反応トリガーが一つ判明する。 */
  insightPerTrigger: 3,
  /** 弱点主題が出揃った後、さらにこれだけ積むと耐性棚が一つ判明する。 */
  insightPerResistance: 4,
  /** 同じ場所を再訪したときの実入りの落ち方。 */
  revisitPenalty: 1,

  /**
   * 手応えの揺らぎ。
   *
   * 捜査は思いどおりには進まない。ただし**揺らぎは必ず本人の口から表明される**ので、
   * プレイヤーは運と自分の判断を切り分けられる。
   *
   * 軸3(踏み込み⇄見守り)がここで危険度の性格になる。
   *   踏み込み … 速いが当たり外れが大きい
   *   見守り   … 空振りが少ない
   */
  missBase: 0.25,
  hitBase: 0.2,
  /** 踏み込み一人につき、当たりも空振りも増える。 */
  pushSwing: 0.1,
  /** 見守り一人につき、空振りが減る。 */
  holdSteady: 0.1,
} as const;

/** その日の手応え。 */
export type Feel = 'atari' | 'nami' | 'karaburi';

export const FEEL_LINES: Record<Feel, string> = {
  atari: '手応えがある',
  nami: 'まあ、こんなところだろう',
  karaburi: '今日は空振りだ',
};

export interface InvestigationState {
  layer: Layer;
  daysLeft: number;
  /** 集まった手帳タグ。 */
  notebook: NotebookTag[];
  /** 相手の人物像への理解の蓄積。 */
  insight: number;
  /** 判明した反応トリガー(討論での弱点主題)。 */
  knownWeak: ThemeId[];
  /** 判明した耐性棚。 */
  knownResistant: ShelfId[];
  /** 誰が何を読了しているか。 */
  read: Partial<Record<CharacterId, string[]>>;
  /** 場所ごとの警戒。 */
  guard: Record<string, number>;
  /** 場所ごとの訪問回数。 */
  visits: Record<string, number>;
  log: string[];
}

/** 一日の采配。 */
export interface DayPlan {
  /** 派遣するペアと行き先。同じ人物を二度使うことはできない。 */
  dispatches: Array<{ pair: [CharacterId, CharacterId]; location: string }>;
  /** 店に残って積読を崩す者と、その一冊。 */
  reader?: { who: CharacterId; book: string };
}

export function startInvestigation(
  layer: Layer,
  read: Partial<Record<CharacterId, string[]>>,
): InvestigationState {
  return {
    layer,
    daysLeft: layer.days,
    notebook: [],
    insight: 0,
    knownWeak: [],
    knownResistant: [],
    read: { ...read },
    guard: {},
    visits: {},
    log: [],
  };
}

/** その場所がまだ口を開くか。 */
export function isOpen(state: InvestigationState, locationId: string): boolean {
  return (state.guard[locationId] ?? 0) < INVESTIGATION_TUNING.guardLimit;
}

/** まだ取っていない手帳タグ。 */
export function remainingYields(state: InvestigationState, loc: Location): NotebookTag[] {
  const taken = new Set(state.notebook.map((n) => n.id));
  return loc.yields
    .filter((id) => !taken.has(id))
    .map((id) => state.layer.notebook.find((n) => n.id === id))
    .filter((n): n is NotebookTag => n !== undefined);
}

/** 一組の派遣が持ち帰るものを見積もる。 */
export function dispatchYield(
  state: InvestigationState,
  pair: [CharacterId, CharacterId],
  loc: Location,
  rng: Rng,
): {
  tags: NotebookTag[];
  insight: number;
  guard: number;
  feel: Feel;
  notes: string[];
} {
  const [a, b] = pair;
  const chem = pairChemistry(a, b);
  const ta = CAST[a].temperament;
  const tb = CAST[b].temperament;
  const notes: string[] = [];
  const T = INVESTIGATION_TUNING;

  // ── 何冊ぶん持ち帰れるか ──
  let count = 1;
  if (chem.friction >= 3) {
    count += 1;
    notes.push('噛み合わないぶん、拾う網が広かった');
  }
  if (chem.bringsFoundation) {
    count += 1;
    notes.push('片方が書き物を、片方が人を当たった');
  }
  const push = [ta, tb].filter((t) => t.approach < 0).length;
  const hold = [ta, tb].filter((t) => t.approach > 0).length;
  if (push >= 1) {
    count += 1;
    notes.push('踏み込んで、早く引き出した');
  }
  count -= (state.visits[loc.id] ?? 0) * T.revisitPenalty;

  // ── 手応え ──
  // 踏み込むほど当たりも空振りも増え、見守るほど空振りが減る。
  const miss = Math.min(0.6, Math.max(0.05, T.missBase + T.pushSwing * push - T.holdSteady * hold));
  const hit = Math.min(0.6, Math.max(0.05, T.hitBase + T.pushSwing * push));
  const roll = rng.next();
  const feel: Feel = roll < miss ? 'karaburi' : roll < miss + hit ? 'atari' : 'nami';
  if (feel === 'atari') count += 1;
  if (feel === 'karaburi') count -= 1;

  count = Math.max(0, count);

  // ── 確度 ──
  const deepen = chem.resonance >= 3 ? 1 : 0;
  if (deepen) notes.push('二人の見方が揃って、深いところまで聞けた');

  const available = remainingYields(state, loc);
  const tags = available.slice(0, count).map((n) =>
    deepen && n.certainty < 3 ? { ...n, certainty: (n.certainty + 1) as 1 | 2 | 3 } : n,
  );

  // ── 人物の理解 ──
  // 空振りでも、人となりだけは見えることがある。
  const sense = [ta, tb].filter((t) => t.grasp > 0).length;
  const insight = loc.insight > 0 ? loc.insight + sense : 0;
  if (sense >= 1 && loc.insight > 0) notes.push('相手の様子から、人となりが見えた');

  return { tags, insight, guard: push, feel, notes };
}

/**
 * 座談。その日持ち帰ったものを突き合わせ、人物像を結ぶ。
 * 反応トリガー(弱点主題)は、ここでしか判明しない。
 */
function salon(state: InvestigationState): InvestigationState {
  const weakPool = [
    ...new Set([...state.layer.psych.weakThemes, ...state.layer.logical.weakThemes]),
  ];
  const knownWeak = [...state.knownWeak];
  const knownResistant = [...state.knownResistant];
  const log = [...state.log];

  const { insightPerTrigger, insightPerResistance } = INVESTIGATION_TUNING;

  while (knownWeak.length < weakPool.length) {
    const need = (knownWeak.length + 1) * insightPerTrigger;
    if (state.insight < need) break;
    const next = weakPool[knownWeak.length]!;
    knownWeak.push(next);
    log.push(`座談 — 相手は「${THEMES[next].label}」に耐えられない`);
  }

  const resistPool = [
    ...new Set([...state.layer.psych.resistantShelves, ...state.layer.logical.resistantShelves]),
  ];
  const base = weakPool.length * insightPerTrigger;
  while (knownResistant.length < resistPool.length) {
    const need = base + (knownResistant.length + 1) * insightPerResistance;
    if (state.insight < need) break;
    const shelf = resistPool[knownResistant.length]!;
    knownResistant.push(shelf);
    log.push(`座談 — 相手は${SHELVES[shelf].label}を既に読み込んでいる`);
  }

  return { ...state, knownWeak, knownResistant, log };
}

/** 一日を進める。状態は変更せず、新しい状態を返す。 */
export function runDay(state: InvestigationState, plan: DayPlan, rng: Rng): InvestigationState {
  if (state.daysLeft <= 0) return state;

  const notebook = [...state.notebook];
  const guard = { ...state.guard };
  const visits = { ...state.visits };
  const read: Partial<Record<CharacterId, string[]>> = { ...state.read };
  const log = [...state.log];
  let insight = state.insight;

  const used = new Set<CharacterId>();

  for (const { pair, location } of plan.dispatches) {
    const loc = state.layer.locations.find((l) => l.id === location);
    if (!loc) continue;
    if (pair.some((p) => used.has(p))) continue;
    if (!isOpen(state, location)) {
      log.push(`${loc.label} — もう口を開いてもらえない`);
      continue;
    }
    pair.forEach((p) => used.add(p));

    const y = dispatchYield({ ...state, notebook, guard, visits }, pair, loc, rng);
    notebook.push(...y.tags);
    insight += y.insight;
    guard[location] = (guard[location] ?? 0) + y.guard;
    visits[location] = (visits[location] ?? 0) + 1;

    const who = `${CAST[pair[0]].name}と${CAST[pair[1]].name}`;
    log.push(
      y.tags.length > 0
        ? `${who} → ${loc.label}: ${y.tags.map((t) => t.label).join('、')}`
        : `${who} → ${loc.label}: 収穫なし`,
    );
    // 揺らぎは必ず本人の口から表明する。運と判断を切り分けられるようにするため。
    log.push(`  「${FEEL_LINES[y.feel]}」`);
    for (const n of y.notes) log.push(`  ・${n}`);

    // 先の見通しも本人が言う。もう一度行くべきかの判断材料になる。
    const left = remainingYields({ ...state, notebook, guard, visits }, loc).length;
    if ((guard[location] ?? 0) >= INVESTIGATION_TUNING.guardLimit) {
      log.push('  ・「もう相手にしてもらえないだろうな」');
    } else if (left > 0) {
      log.push('  ・「まだ何か出そうだ」');
    } else if (loc.insight > 0) {
      log.push('  ・「これ以上は、物は出ない。人を見るだけだ」');
    } else {
      log.push('  ・「ここはもう空だ」');
    }
  }

  if (plan.reader && !used.has(plan.reader.who)) {
    const list = read[plan.reader.who] ?? [];
    if (!list.includes(plan.reader.book)) {
      read[plan.reader.who] = [...list, plan.reader.book];
      log.push(`${CAST[plan.reader.who].name}は店に残って一冊読んだ`);
    }
  }

  return salon({
    ...state,
    daysLeft: state.daysLeft - 1,
    notebook,
    insight,
    read,
    guard,
    visits,
    log,
  });
}
