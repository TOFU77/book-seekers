import type { BookTag, CharacterId, Layer, NotebookTag } from '../types.js';
import { BOOKS, LIBRARY } from '../content/books/index.js';
import { CAST, CAST_IDS } from '../content/cast.js';
import { isInnerShelf } from '../content/shelves.js';
import { createRng, type Rng } from '../engine/rng.js';
import { startDebate, type DebateState } from '../engine/debate.js';
import {
  isOpen,
  remainingYields,
  runDay,
  startInvestigation,
  type DayPlan,
  type InvestigationState,
} from '../engine/investigate.js';

/** 周回のはじめに持ち越せる知識タグ。一座全体で5冊。 */
export const CARRY_OVER = 5;

const BOOKISH: CharacterId[] = ['hiiragi', 'mochizuki'];
const LEGGY: CharacterId[] = ['makabe', 'senou', 'asakura'];

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

function unreadFor(state: InvestigationState, who: CharacterId): string | undefined {
  const done = new Set(state.read[who] ?? []);
  const cands = BOOKS.filter(
    (b) =>
      CAST[who].goodShelves.includes(b.shelf) &&
      !done.has(b.id) &&
      (state.layer.depth >= 2 || !isInnerShelf(b.shelf)),
  );
  const hit = cands.filter((b) => b.themes.some((t) => state.knownWeak.includes(t)));
  return (hit[0] ?? cands[0])?.id;
}

/**
 * 捜査を「筋を通す」采配で自動進行させる。
 *
 * 討論の手触りを先に確かめるための足場である。
 * 捜査の画面ができたら、ここはプレイヤーの采配に置き換わる。
 */
export function autoInvestigate(layer: Layer, seed: string): InvestigationState {
  const rng = createRng(seed);
  let inv = startInvestigation(layer, buildCarry(rng, layer));

  while (inv.daysLeft > 0) {
    const leg = rng.shuffle(LEGGY);
    const record = layer.locations
      .filter((l) => isOpen(inv, l.id) && (l.kind === 'kiroku' || l.kind === 'genba'))
      .sort((a, b) => remainingYields(inv, b).length - remainingYields(inv, a).length)[0];
    const people = layer.locations
      .filter((l) => isOpen(inv, l.id) && (l.kind === 'hito' || l.kind === 'honnin'))
      .sort((a, b) => {
        const d = remainingYields(inv, b).length - remainingYields(inv, a).length;
        return d !== 0 ? d : b.insight - a.insight;
      })[0];

    const dispatches: DayPlan['dispatches'] = [];
    if (record) dispatches.push({ members: [BOOKISH[0]!, leg[0]!], location: record.id });
    if (people) dispatches.push({ members: [BOOKISH[1]!, leg[1]!], location: people.id });

    const book = unreadFor(inv, leg[2]!);
    inv = runDay(inv, { dispatches, ...(book ? { reader: { who: leg[2]!, book } } : {}) }, rng);
  }
  return inv;
}

export interface Session {
  layer: Layer;
  investigation: InvestigationState;
  debate: DebateState;
  notebook: NotebookTag[];
  books: BookTag[];
}

/**
 * 捜査をプレイヤーが采配する場合の初期状態。持ち越し5冊だけを持って始める。
 * 層を掘り下げるときは、前の層で読んだものをそのまま引き継ぐ。
 */
export function newInvestigation(
  layer: Layer,
  seed: string,
  carried?: Partial<Record<CharacterId, string[]>>,
): InvestigationState {
  return startInvestigation(layer, carried ?? buildCarry(createRng(seed), layer));
}

/** その日の乱数。種から作るので、同じ捜査は同じように揺らぐ。 */
export function dayRng(seed: string, dayIndex: number) {
  return createRng(`${seed}-day${dayIndex}`);
}

/** 座談の掛け合いを選ぶ乱数。捜査本体の乱数消費に影響しないよう系列を分ける。 */
export function salonRng(seed: string, dayIndex: number) {
  return createRng(`${seed}-day${dayIndex}-salon`);
}

/** 捜査を終えて問答へ移る。 */
export function toDebate(layer: Layer, investigation: InvestigationState): Session {
  const debate = startDebate(layer, CAST_IDS.slice(), investigation.read, LIBRARY);
  const ids = new Set<string>();
  for (const who of CAST_IDS) for (const id of investigation.read[who] ?? []) ids.add(id);
  const books = [...ids].map((id) => LIBRARY.get(id)!).filter(Boolean);
  return { layer, investigation, debate, notebook: investigation.notebook, books };
}

/** 捜査を自動で進めて問答だけを遊ぶ場合。 */
export function newSession(layer: Layer, seed: string): Session {
  return toDebate(layer, autoInvestigate(layer, seed));
}

/** その人がまだ読んでいない、得意な棚の本。店番に読ませる候補。 */
export function unreadBooksFor(state: InvestigationState, who: CharacterId): BookTag[] {
  const done = new Set(state.read[who] ?? []);
  return BOOKS.filter(
    (b) =>
      CAST[who].goodShelves.includes(b.shelf) &&
      !done.has(b.id) &&
      (state.layer.depth >= 2 || !isInnerShelf(b.shelf)),
  );
}

/** その本を読んでいる者。討論の場で誰が口を開くかの表示に使う。 */
export function readersOf(inv: InvestigationState, bookId: string): CharacterId[] {
  return CAST_IDS.filter((who) => (inv.read[who] ?? []).includes(bookId));
}
