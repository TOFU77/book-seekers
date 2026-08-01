/**
 * 捜査から討論までの通し検証。
 *
 *   npm run fullcase
 *
 * 確かめたいこと:
 *   - 証拠ばかり集めて相手を見ないと、討論で本当に困るか
 *   - 逆に人ばかり当たって証拠が足りないと、定礎が組めずに困るか
 *   - 座談で反応トリガーが判明することが、討論の手数に効いているか
 *   - 持ち越し5冊(一座全体)で、事件は成立するか
 */

import type {
  Argument,
  BookTag,
  Case,
  CharacterId,
  DebateContext,
  Layer,
  NotebookTag,
  ShelfId,
  ThemeId,
  Wall,
  WallKind,
} from '../src/types.js';
import { BOOKS, LIBRARY } from '../src/content/books/index.js';
import { CASES } from '../src/content/cases/index.js';
import { CAST, CAST_IDS, pairChemistry } from '../src/content/cast.js';
import { isInnerShelf } from '../src/content/shelves.js';
import { createRng, type Rng } from '../src/engine/rng.js';
import { evaluateArgument } from '../src/engine/synergy.js';
import { availableBooks, contextFor, isWon, play, startDebate } from '../src/engine/debate.js';
import {
  isOpen,
  remainingYields,
  runDay,
  startInvestigation,
  type DayPlan,
  type InvestigationState,
} from '../src/engine/investigate.js';

const TRIALS = 150;
/** 周回のはじめに持ち越せる知識タグ。一座全体で5冊。 */
const CARRY_OVER = 5;

// ─────────────────────────────────────────────
// 持ち越し
// ─────────────────────────────────────────────

function buildCarry(rng: Rng, layer: Layer): Partial<Record<CharacterId, string[]>> {
  const read: Partial<Record<CharacterId, string[]>> = {};
  for (const who of CAST_IDS) read[who] = [];

  const pool: Array<{ who: CharacterId; book: BookTag }> = [];
  for (const who of CAST_IDS) {
    for (const b of BOOKS) {
      if (!CAST[who].goodShelves.includes(b.shelf)) continue;
      if (layer.depth < 2 && isInnerShelf(b.shelf)) continue;
      pool.push({ who, book: b });
    }
  }
  const taken = new Set<string>();
  for (const c of rng.shuffle(pool)) {
    if (taken.size >= CARRY_OVER) break;
    if (taken.has(c.book.id)) continue;
    taken.add(c.book.id);
    read[c.who]!.push(c.book.id);
  }
  return read;
}

/** その人がまだ読んでいない、得意な棚の本。 */
function unreadFor(
  state: InvestigationState,
  who: CharacterId,
  prefer: ThemeId[],
): string | undefined {
  const alreadyRead = new Set(state.read[who] ?? []);
  const candidates = BOOKS.filter(
    (b) =>
      CAST[who].goodShelves.includes(b.shelf) &&
      !alreadyRead.has(b.id) &&
      (state.layer.depth >= 2 || !isInnerShelf(b.shelf)),
  );
  if (candidates.length === 0) return undefined;
  const hit = candidates.filter((b) => b.themes.some((t) => prefer.includes(t)));
  return (hit[0] ?? candidates[0])!.id;
}

// ─────────────────────────────────────────────
// 捜査の采配
// ─────────────────────────────────────────────

type InvestPolicy = {
  name: string;
  plan(state: InvestigationState, rng: Rng): DayPlan;
};

const READERS = ['hiiragi', 'mochizuki'] as const;
const BOOKISH: CharacterId[] = ['hiiragi', 'mochizuki'];
const LEGGY: CharacterId[] = ['makabe', 'senou', 'asakura'];

function openLocations(state: InvestigationState, kinds: string[]) {
  return state.layer.locations.filter(
    (l) => isOpen(state, l.id) && kinds.includes(l.kind),
  );
}

/** 手帳タグがまだ残っている場所を優先する。 */
function bestRecordSpot(state: InvestigationState) {
  const spots = openLocations(state, ['kiroku', 'genba']);
  return spots.sort((a, b) => remainingYields(state, b).length - remainingYields(state, a).length)[0];
}

function bestPeopleSpot(state: InvestigationState) {
  const spots = openLocations(state, ['hito', 'honnin']);
  return spots.sort((a, b) => {
    const ry = remainingYields(state, b).length - remainingYields(state, a).length;
    return ry !== 0 ? ry : b.insight - a.insight;
  })[0];
}

const POLICIES: InvestPolicy[] = [
  {
    name: '行き当たりばったり',
    plan(state, rng) {
      const order = rng.shuffle(CAST_IDS);
      const open = state.layer.locations.filter((l) => isOpen(state, l.id));
      if (open.length === 0) return { dispatches: [] };
      return {
        dispatches: [
          { pair: [order[0]!, order[1]!], location: rng.pick(open).id },
          { pair: [order[2]!, order[3]!], location: rng.pick(open).id },
        ],
        reader: { who: order[4]!, book: unreadFor(state, order[4]!, []) ?? '' },
      };
    },
  },

  {
    name: '証拠ばかり集める',
    plan(state, rng) {
      const order = rng.shuffle(CAST_IDS);
      const spot = bestRecordSpot(state) ?? state.layer.locations[0]!;
      const spot2 = bestRecordSpot(state) ?? spot;
      return {
        dispatches: [
          { pair: [order[0]!, order[1]!], location: spot.id },
          { pair: [order[2]!, order[3]!], location: spot2.id },
        ],
        reader: { who: order[4]!, book: unreadFor(state, order[4]!, []) ?? '' },
      };
    },
  },

  {
    name: '人にばかり会う',
    plan(state, rng) {
      const order = rng.shuffle(CAST_IDS);
      const spot = bestPeopleSpot(state) ?? state.layer.locations[0]!;
      return {
        dispatches: [
          { pair: [order[0]!, order[1]!], location: spot.id },
          { pair: [order[2]!, order[3]!], location: spot.id },
        ],
        reader: { who: order[4]!, book: unreadFor(state, order[4]!, []) ?? '' },
      };
    },
  },

  {
    name: '筋を通す',
    plan(state, rng) {
      // 書物寄りと足寄りを組ませる(定礎材料が揃う)。
      // 記録の出る場所と、人となりの見える場所に一組ずつ送る。
      const leg = rng.shuffle(LEGGY);
      const pairA: [CharacterId, CharacterId] = [BOOKISH[0]!, leg[0]!];
      const pairB: [CharacterId, CharacterId] = [BOOKISH[1]!, leg[1]!];
      const reader = leg[2]!;

      const record = bestRecordSpot(state);
      const people = bestPeopleSpot(state);
      const dispatches: DayPlan['dispatches'] = [];
      if (record) dispatches.push({ pair: pairA, location: record.id });
      if (people) dispatches.push({ pair: pairB, location: people.id });

      // 座談で急所が判明していれば、その主題の本を読む
      const book = unreadFor(state, reader, state.knownWeak);
      return { dispatches, ...(book ? { reader: { who: reader, book } } : {}) };
    },
  },
];

// ─────────────────────────────────────────────
// 討論(捜査で掴んだ像を持って臨む)
// ─────────────────────────────────────────────

function believedWall(real: Wall, weak: ThemeId[], resistant: ShelfId[]): Wall {
  return {
    kind: real.kind,
    hardness: real.hardness,
    weakThemes: real.weakThemes.filter((t) => weak.includes(t)),
    resistantShelves: real.resistantShelves.filter((s) => resistant.includes(s)),
  };
}

function bestMove(
  state: ReturnType<typeof startDebate>,
  notebooks: NotebookTag[],
  combos: BookTag[][],
  weak: ThemeId[],
  resistant: ShelfId[],
): { target: WallKind; arg: Argument } | null {
  let best: { target: WallKind; arg: Argument } | null = null;
  let bestScore = -1;
  for (const target of ['ronri', 'shinri'] as WallKind[]) {
    if (state.remaining[target] <= 0) continue;
    const real = contextFor(state, target);
    const ctx: DebateContext = { ...real, wall: believedWall(real.wall, weak, resistant) };
    for (const notebook of notebooks) {
      for (const books of combos) {
        const r = evaluateArgument({ notebook, books }, ctx);
        if (!r.ok) continue;
        const score = Math.min(r.damage, state.remaining[target]) * 1000 - r.damage;
        if (score > bestScore) {
          bestScore = score;
          best = { target, arg: { notebook, books } };
        }
      }
    }
  }
  return best;
}

function bookCombos(books: BookTag[]): BookTag[][] {
  const out: BookTag[][] = [];
  for (let i = 0; i < books.length; i++) {
    out.push([books[i]!]);
    for (let j = i + 1; j < books.length; j++) {
      out.push([books[i]!, books[j]!]);
      for (let k = j + 1; k < books.length; k++) out.push([books[i]!, books[j]!, books[k]!]);
    }
  }
  return out;
}

// ─────────────────────────────────────────────

interface Result {
  tags: number;
  insight: number;
  knownWeak: number;
  weakTotal: number;
  won: boolean;
  turns: number;
}

function runOne(layer: Layer, policy: InvestPolicy, rng: Rng): Result {
  let inv = startInvestigation(layer, buildCarry(rng, layer));
  while (inv.daysLeft > 0) inv = runDay(inv, policy.plan(inv, rng), rng);

  const weakTotal = new Set([...layer.logical.weakThemes, ...layer.psych.weakThemes]).size;

  let st = startDebate(layer, CAST_IDS.slice(0, 5), inv.read, LIBRARY);
  const combos = bookCombos(availableBooks(st));
  const notebooks = inv.notebook;

  if (notebooks.length === 0 || combos.length === 0) {
    return { tags: 0, insight: inv.insight, knownWeak: inv.knownWeak.length, weakTotal, won: false, turns: 0 };
  }

  while (!isWon(st) && st.turnsLeft > 0) {
    const move = bestMove(st, notebooks, combos, inv.knownWeak, inv.knownResistant);
    if (!move) break;
    st = play(st, move.target, move.arg).state;
  }

  return {
    tags: notebooks.length,
    insight: inv.insight,
    knownWeak: inv.knownWeak.length,
    weakTotal,
    won: isWon(st),
    turns: layer.turns - st.turnsLeft,
  };
}

const pct = (x: number) => `${Math.round(x * 100)}%`.padStart(4, ' ');
const n1 = (x: number) => (Number.isNaN(x) ? '  — ' : x.toFixed(1).padStart(4, ' '));

console.log('═'.repeat(78));
console.log(`  捜査→討論 通し検証   ${TRIALS}回 / 持ち越し一座全体${CARRY_OVER}冊`);
console.log('═'.repeat(78));

for (const c of CASES) {
  console.log(`\n${'─'.repeat(78)}`);
  console.log(`【${c.title}】`);
  for (const layer of c.layers) {
    console.log(
      `\n  層${layer.depth}「${layer.title}」  捜査${layer.days}日 / 討論${layer.turns}手 / 手帳の候補${layer.notebook.length}`,
    );
    console.log(`  ${'捜査の采配'.padEnd(20, ' ')} 手帳  理解  急所判明   勝率  手数`);
    for (const p of POLICIES) {
      const rs: Result[] = [];
      for (let t = 0; t < TRIALS; t++) {
        rs.push(runOne(layer, p, createRng(`${c.id}-${layer.depth}-${p.name}-${t}`)));
      }
      const wins = rs.filter((r) => r.won);
      const avg = (f: (r: Result) => number) => rs.reduce((a, r) => a + f(r), 0) / rs.length;
      console.log(
        `  ${p.name.padEnd(22, ' ')}${n1(avg((r) => r.tags))}  ${n1(avg((r) => r.insight))}` +
          `   ${n1(avg((r) => r.knownWeak))}/${rs[0]!.weakTotal}` +
          `   ${pct(wins.length / rs.length)}  ` +
          `${wins.length ? n1(wins.reduce((a, r) => a + r.turns, 0) / wins.length) : '  — '}`,
      );
    }
  }
}

console.log(`\n${'─'.repeat(78)}`);
console.log('  手帳=集まった証拠の数 / 理解=人物理解の蓄積 / 急所判明=判明した弱点主題');
console.log('');
