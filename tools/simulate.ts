/**
 * 模擬対局。
 *
 *   npm run simulate
 *
 * 手書きの事件5本を、技量の違う5種類のプレイヤーに何度も解かせて、
 * 「何手で解けるか」「どの技量で失敗するか」を測る。
 *
 * 知りたいこと:
 *   - 手探りで学ぶプレイヤーが、5手前後で解けているか
 *   - 素直に強い本を出すだけのプレイヤーが、ちゃんと失敗するか
 *   - 事件ごとの難易度に、意図した差がついているか
 *   - 層3が、奥の棚なしでは本当に崩せないか
 */

import type {
  Argument,
  BookTag,
  CharacterId,
  Case,
  Layer,
  NotebookTag,
  ShelfId,
  ThemeId,
  Wall,
  WallKind,
} from '../src/types.js';
import { BOOKS, LIBRARY } from '../src/content/books/index.js';
import { CASES } from '../src/content/cases/index.js';
import { CAST, CAST_IDS } from '../src/content/cast.js';
import { SHELVES, isInnerShelf } from '../src/content/shelves.js';
import { THEMES } from '../src/content/themes.js';
import { createRng, type Rng } from '../src/engine/rng.js';
import { evaluateArgument } from '../src/engine/synergy.js';
import {
  availableBooks,
  contextFor,
  isWon,
  play,
  startDebate,
  type DebateState,
} from '../src/engine/debate.js';

const TRIALS = 200;

// ─────────────────────────────────────────────
// 手札を作る
// ─────────────────────────────────────────────

interface Hand {
  present: CharacterId[];
  read: Partial<Record<CharacterId, string[]>>;
}

/**
 * 同席者3人と、その読了状態を作る。
 *
 * 各人は得意な棚の本を優先して読んでいる(6冊中4冊)。
 * 奥の棚は層2以降でしか解放されないので、層1では読了から外す。
 */
/**
 * 持ち越しの選び方。
 *
 * 周回のはじめに、前回までに読んだ本のうち N 冊しか持ち越せない。
 * その N 冊を今回の相手に合わせて選べたかどうかが、この bias にあたる。
 */
type Bias = 'random' | 'good' | 'bad';

function buildHand(
  rng: Rng,
  layer: Layer,
  attendance?: CharacterId[],
  readCount = 5,
  bias: Bias = 'random',
): Hand {
  const present = attendance ?? rng.shuffle(CAST_IDS).slice(0, 3);
  const read: Partial<Record<CharacterId, string[]>> = {};
  const weak = new Set([...layer.logical.weakThemes, ...layer.psych.weakThemes]);

  /** 相手の急所に触れる本を優先する / 避ける / 気にしない */
  const order = (books: BookTag[]): BookTag[] => {
    const shuffled = rng.shuffle(books);
    if (bias === 'random') return shuffled;
    const hit = shuffled.filter((b) => b.themes.some((t) => weak.has(t)));
    const miss = shuffled.filter((b) => !b.themes.some((t) => weak.has(t)));
    return bias === 'good' ? [...hit, ...miss] : [...miss, ...hit];
  };

  const good狙い = Math.max(1, readCount - 1);
  for (const who of present) {
    const c = CAST[who];
    const good = BOOKS.filter((b) => c.goodShelves.includes(b.shelf));
    const other = BOOKS.filter(
      (b) => !c.goodShelves.includes(b.shelf) && b.shelf !== c.weakShelf,
    );
    const picked = [
      ...order(good).slice(0, good狙い),
      ...order(other).slice(0, readCount - good狙い),
    ];
    const usable = layer.depth >= 2 ? picked : picked.filter((b) => !isInnerShelf(b.shelf));
    read[who] = usable.map((b) => b.id);
  }
  return { present, read };
}

/**
 * 持ち越しを**一座全体で N 冊**に絞った手札を作る。
 *
 * 一人あたり N 冊にすると、五人居れば 5N 冊になってしまい制約にならない。
 * 「三人に一冊ずつ」「誰か一人に三冊」といった薄さで初めて効く。
 */
function buildCappedHand(rng: Rng, layer: Layer, total: number, bias: Bias): Hand {
  const present = rng.shuffle(CAST_IDS).slice(0, 3);
  const read: Partial<Record<CharacterId, string[]>> = {};
  for (const who of present) read[who] = [];

  const weak = new Set([...layer.logical.weakThemes, ...layer.psych.weakThemes]);
  const hits = (b: BookTag) => b.themes.some((t) => weak.has(t));

  // 同席者の得意な棚から選べる本
  type Candidate = { who: CharacterId; book: BookTag };
  const pool: Candidate[] = [];
  for (const who of present) {
    for (const b of BOOKS) {
      if (!CAST[who].goodShelves.includes(b.shelf)) continue;
      if (layer.depth < 2 && isInnerShelf(b.shelf)) continue;
      pool.push({ who, book: b });
    }
  }

  let ordered = rng.shuffle(pool);
  if (bias !== 'random') {
    const hit = ordered.filter((c) => hits(c.book));
    const miss = ordered.filter((c) => !hits(c.book));
    ordered = bias === 'good' ? [...hit, ...miss] : [...miss, ...hit];
  }

  const taken = new Set<string>();
  for (const c of ordered) {
    if (taken.size >= total) break;
    if (taken.has(c.book.id)) continue;
    taken.add(c.book.id);
    read[c.who]!.push(c.book.id);
  }
  return { present, read };
}

/** 手帳タグは、その層で入手しうるもののうち8割が手に入っている想定。 */
function buildNotebook(rng: Rng, layer: Layer): NotebookTag[] {
  const n = Math.max(3, Math.ceil(layer.notebook.length * 0.8));
  return rng.shuffle(layer.notebook).slice(0, n);
}

// ─────────────────────────────────────────────
// 手の候補を作る
// ─────────────────────────────────────────────

function bookCombos(books: BookTag[]): BookTag[][] {
  const out: BookTag[][] = [];
  const n = books.length;
  for (let i = 0; i < n; i++) {
    out.push([books[i]!]);
    for (let j = i + 1; j < n; j++) {
      out.push([books[i]!, books[j]!]);
      for (let k = j + 1; k < n; k++) {
        out.push([books[i]!, books[j]!, books[k]!]);
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────
// プレイヤーの技量
// ─────────────────────────────────────────────

interface Move {
  target: WallKind;
  arg: Argument;
}

interface Beliefs {
  weak: Set<ThemeId>;
  notWeak: Set<ThemeId>;
  resistant: Set<ShelfId>;
  notResistant: Set<ShelfId>;
}

function newBeliefs(): Beliefs {
  return { weak: new Set(), notWeak: new Set(), resistant: new Set(), notResistant: new Set() };
}

type Policy = {
  name: string;
  /** 手を選ぶ。null なら投了。 */
  choose(
    state: DebateState,
    notebooks: NotebookTag[],
    combos: BookTag[][],
    beliefs: Beliefs,
    rng: Rng,
  ): Move | null;
  /** 打った結果から学ぶ。 */
  learn?(move: Move, notes: string[], beliefs: Beliefs): void;
};

/** 相手の弱点も耐性も知らないものとして仮定した壁。 */
function blindWall(real: Wall): Wall {
  return { kind: real.kind, hardness: real.hardness, weakThemes: [], resistantShelves: [] };
}

/** 信じている情報で組み立てた壁。 */
function believedWall(real: Wall, b: Beliefs): Wall {
  return {
    kind: real.kind,
    hardness: real.hardness,
    weakThemes: [...b.weak],
    resistantShelves: [...b.resistant],
  };
}

/**
 * 与えられた壁の見立てのもとで最善の手を探す。
 * 「残りを超える分は無駄」なので min(崩し値, 残り) を最大化する。
 */
function bestMove(
  state: DebateState,
  notebooks: NotebookTag[],
  combos: BookTag[][],
  wallFor: (real: Wall, kind: WallKind) => Wall,
): Move | null {
  let best: Move | null = null;
  let bestScore = -1;

  for (const target of ['ronri', 'shinri'] as WallKind[]) {
    if (state.remaining[target] <= 0) continue;
    const realCtx = contextFor(state, target);
    const assumed = wallFor(realCtx.wall, target);
    const ctx = { ...realCtx, wall: assumed };

    for (const notebook of notebooks) {
      for (const books of combos) {
        const r = evaluateArgument({ notebook, books }, ctx);
        if (!r.ok) continue;
        const useful = Math.min(r.damage, state.remaining[target]);
        // 同じ有効打なら、無駄撃ちの少ないほうを選ぶ
        const score = useful * 1000 - r.damage;
        if (score > bestScore) {
          bestScore = score;
          best = { target, arg: { notebook, books } };
        }
      }
    }
  }
  return best;
}

const POLICIES: Policy[] = [
  {
    name: '手当たり次第',
    choose(state, notebooks, combos, _b, rng) {
      const open = (['ronri', 'shinri'] as WallKind[]).filter((k) => state.remaining[k] > 0);
      if (open.length === 0) return null;
      return {
        target: rng.pick(open),
        arg: { notebook: rng.pick(notebooks), books: rng.pick(combos) },
      };
    },
  },

  {
    name: '素直(強い本を単品で)',
    choose(state, notebooks, _combos, _b, _rng) {
      const open = (['ronri', 'shinri'] as WallKind[]).filter((k) => state.remaining[k] > 0);
      if (open.length === 0) return null;
      const target = open.reduce((a, b) => (state.remaining[a] >= state.remaining[b] ? a : b));
      const books = availableBooks(state);
      // いちばん強い本を出す。効かなくなってきたら(慣れが進んだら)別の本に替える。
      // 主題も棚の距離も考えない。
      const effective = (b: BookTag) => b.power / (1 + 0.3 * (state.fatigue[b.shelf] ?? 0));
      const book = [...books].sort((x, y) => effective(y) - effective(x))[0];
      if (!book) return null;
      const notebook = [...notebooks].sort((x, y) => y.certainty - x.certainty)[0]!;
      return { target, arg: { notebook, books: [book] } };
    },
  },

  {
    name: '主題を読む(相手は未知)',
    choose(state, notebooks, combos) {
      return bestMove(state, notebooks, combos, (real) => blindWall(real));
    },
  },

  {
    name: '手探りから学ぶ',
    choose(state, notebooks, combos, beliefs) {
      return bestMove(state, notebooks, combos, (real) => believedWall(real, beliefs));
    },
    learn(move, notes, beliefs) {
      const themes = new Set(move.arg.books.flatMap((b) => b.themes));
      const shelves = new Set(move.arg.books.map((b) => b.shelf));
      const hitWeak = notes.some((n) => n.includes('触れられたくない'));
      const resisted = notes.some((n) => n.includes('既にその程度は調べている'));

      if (hitWeak) {
        // 弱点はこの中にある。既に候補があるなら絞り込む。
        if (beliefs.weak.size === 0) {
          for (const t of themes) if (!beliefs.notWeak.has(t)) beliefs.weak.add(t);
        } else {
          for (const t of [...beliefs.weak]) if (!themes.has(t)) beliefs.weak.delete(t);
        }
      } else {
        for (const t of themes) {
          beliefs.notWeak.add(t);
          beliefs.weak.delete(t);
        }
      }

      // 耐性の判定は「使った棚がすべて耐性」のときだけ出るので、
      // 単一の棚で出たときにだけ確実に断定できる。
      if (resisted) {
        if (shelves.size === 1) for (const s of shelves) beliefs.resistant.add(s);
        else for (const s of shelves) if (!beliefs.notResistant.has(s)) beliefs.resistant.add(s);
      } else if (shelves.size === 1) {
        for (const s of shelves) {
          beliefs.notResistant.add(s);
          beliefs.resistant.delete(s);
        }
      }
    },
  },

  {
    name: '完全情報(上限)',
    choose(state, notebooks, combos) {
      return bestMove(state, notebooks, combos, (real) => real);
    },
  },
];

// ─────────────────────────────────────────────
// 一局を回す
// ─────────────────────────────────────────────

interface Outcome {
  won: boolean;
  turns: number;
  /** 不成立(定礎の失敗)で潰した手数 */
  wasted: number;
}

function runDebate(layer: Layer, hand: Hand, notebooks: NotebookTag[], policy: Policy, rng: Rng): Outcome {
  let state = startDebate(layer, hand.present, hand.read, LIBRARY);
  const combos = bookCombos(availableBooks(state));
  const beliefs = newBeliefs();
  let wasted = 0;

  if (combos.length === 0) return { won: false, turns: 0, wasted: 0 };

  while (!isWon(state) && state.turnsLeft > 0) {
    const move = policy.choose(state, notebooks, combos, beliefs, rng);
    if (!move) break;
    const { state: next, result } = play(state, move.target, move.arg);
    if (!result.ok) wasted += 1;
    policy.learn?.(move, result.breakdown.notes, beliefs);
    state = next;
  }

  return { won: isWon(state), turns: layer.turns - state.turnsLeft, wasted };
}

// ─────────────────────────────────────────────
// 集計
// ─────────────────────────────────────────────

interface Stats {
  winRate: number;
  avgTurns: number;
  medianTurns: number;
  avgWasted: number;
}

function summarize(outcomes: Outcome[]): Stats {
  const wins = outcomes.filter((o) => o.won);
  const turns = wins.map((o) => o.turns).sort((a, b) => a - b);
  return {
    winRate: outcomes.length ? wins.length / outcomes.length : 0,
    avgTurns: turns.length ? turns.reduce((a, b) => a + b, 0) / turns.length : NaN,
    medianTurns: turns.length ? turns[Math.floor(turns.length / 2)]! : NaN,
    avgWasted: outcomes.length
      ? outcomes.reduce((a, o) => a + o.wasted, 0) / outcomes.length
      : 0,
  };
}

const pct = (x: number) => `${Math.round(x * 100)}%`.padStart(4, ' ');
const num = (x: number) => (Number.isNaN(x) ? '  — ' : x.toFixed(1).padStart(4, ' '));

function runLayer(c: Case, layer: Layer, attendance?: CharacterId[]): void {
  const label = `${c.title} / 層${layer.depth}「${layer.title}」`;
  const walls = `論理${layer.logical.hardness} 心理${layer.psych.hardness} 手数${layer.turns}`;
  console.log(`\n  ${label}   [${walls}]`);
  console.log(`  ${'技量'.padEnd(22, ' ')} 勝率  平均手数 中央値  無駄打ち`);

  for (const policy of POLICIES) {
    const outcomes: Outcome[] = [];
    for (let t = 0; t < TRIALS; t++) {
      const rng = createRng(`${c.id}-${layer.depth}-${policy.name}-${t}`);
      const hand = buildHand(rng, layer, attendance);
      const notebooks = buildNotebook(rng, layer);
      outcomes.push(runDebate(layer, hand, notebooks, policy, rng));
    }
    const s = summarize(outcomes);
    console.log(
      `  ${policy.name.padEnd(24, ' ')}${pct(s.winRate)}   ${num(s.avgTurns)}    ${num(s.medianTurns)}   ${num(s.avgWasted)}`,
    );
  }
}

// ─────────────────────────────────────────────

console.log('═'.repeat(72));
console.log(`  模擬対局  ${TRIALS}回 × 5技量 × 全層`);
console.log('═'.repeat(72));

const started = Date.now();

for (const c of CASES) {
  console.log(`\n${'─'.repeat(72)}`);
  console.log(`【${c.title}】`);
  for (const layer of c.layers) runLayer(c, layer);
}

// ── 層3を、奥の棚を読める者が居ない編成で試す ──
console.log(`\n${'─'.repeat(72)}`);
console.log('【検証】層3に、奥の棚を読める者(柊・望月)抜きで挑む');
const shinyo = CASES.find((c) => c.id === 'shinyo')!;
const layer3 = shinyo.layers.find((l) => l.depth === 3)!;
runLayer(shinyo, layer3, ['makabe', 'senou', 'asakura']);

console.log(`\n${'─'.repeat(72)}`);
console.log('【検証】層3に、柊と望月を同席させて挑む');
runLayer(shinyo, layer3, ['hiiragi', 'mochizuki', 'senou']);

// ── 周回による成長 ──
console.log(`\n${'─'.repeat(72)}`);
console.log('【検証】蔵書が育つと事件はどう変わるか — 各人の読了冊数を変えて層1を解く');
console.log('  (技量は「手探りから学ぶ」で固定)');
{
  const learner = POLICIES.find((p) => p.name === '手探りから学ぶ')!;
  const header = ['読了'].concat(CASES.map((c) => c.title.slice(0, 5).padStart(6, ' ')));
  console.log(`\n  ${header[0]}  ${header.slice(1).join('  ')}`);
  for (const readCount of [2, 3, 4, 5, 6]) {
    const cells: string[] = [];
    for (const c of CASES) {
      const layer = c.layers[0]!;
      const outcomes: Outcome[] = [];
      for (let t = 0; t < TRIALS; t++) {
        const rng = createRng(`grow-${c.id}-${readCount}-${t}`);
        const hand = buildHand(rng, layer, undefined, readCount);
        const notebooks = buildNotebook(rng, layer);
        outcomes.push(runDebate(layer, hand, notebooks, learner, rng));
      }
      const s = summarize(outcomes);
      const turns = Number.isNaN(s.avgTurns) ? ' — ' : s.avgTurns.toFixed(1);
      cells.push(`${pct(s.winRate)}/${turns}`.padStart(8, ' '));
    }
    console.log(`  ${String(readCount).padStart(2, ' ')}冊  ${cells.join('  ')}`);
  }
  console.log('\n  各欄は 勝率/平均手数。層1の手数は8。');
}

// ── 持ち越し上限と、その選び方 ──
console.log(`\n${'─'.repeat(72)}`);
console.log('【検証】持ち越し上限N冊 — 「たくさん読む」から「何を選ぶか」へ');
console.log('  周回のはじめに、前回までの読了からN冊しか持ち越せないとする。');
console.log('  そのN冊を今回の相手に合わせて選べたかどうかで比べる。');
{
  const learner = POLICIES.find((p) => p.name === '手探りから学ぶ')!;
  const rows: Array<[string, number, Bias]> = [
    ['潤沢(15冊相当)', 15, 'random'],
    ['全体9冊・行き当たり', 9, 'random'],
    ['全体6冊・行き当たり', 6, 'random'],
    ['全体6冊・選べた', 6, 'good'],
    ['全体6冊・外した', 6, 'bad'],
    ['全体3冊・行き当たり', 3, 'random'],
    ['全体3冊・選べた', 3, 'good'],
    ['全体3冊・外した', 3, 'bad'],
  ];
  console.log('  ※ 一人あたりではなく一座全体でN冊。各事件の最深層で測る。');
  console.log(
    `\n  ${'持ち越し'.padEnd(22, ' ')}${CASES.map((c) => `${c.title.slice(0, 4)}層${c.layers.length}`.padStart(11, ' ')).join('')}`,
  );
  for (const [label, total, bias] of rows) {
    const cells: string[] = [];
    for (const c of CASES) {
      const layer = c.layers[c.layers.length - 1]!;
      const outcomes: Outcome[] = [];
      for (let t = 0; t < TRIALS; t++) {
        const rng = createRng(`carry-${c.id}-${total}-${bias}-${t}`);
        const hand = buildCappedHand(rng, layer, total, bias);
        const notebooks = buildNotebook(rng, layer);
        outcomes.push(runDebate(layer, hand, notebooks, learner, rng));
      }
      const s = summarize(outcomes);
      const turns = Number.isNaN(s.avgTurns) ? ' — ' : s.avgTurns.toFixed(1);
      cells.push(`${pct(s.winRate)}/${turns}`.padStart(11, ' '));
    }
    console.log(`  ${label.padEnd(24, ' ')}${cells.join('')}`);
  }
  console.log('\n  各欄は 勝率/平均手数(技量は「手探りから学ぶ」で固定)。');
  console.log('  周回の手応えは勝率よりも「手数が縮むこと」に現れる。');
}

// ── 主題の分布 ──
console.log(`\n${'─'.repeat(72)}`);
console.log('【点検】主題の分布 — 偏ると、狙わずに当たってしまう主題ができる');
const counts = new Map<ThemeId, number>();
for (const b of BOOKS) for (const t of b.themes) counts.set(t, (counts.get(t) ?? 0) + 1);
const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
console.log(
  '  ' + sorted.map(([t, n]) => `${THEMES[t].label}${n}`).join(' / '),
);

console.log(`\n所要 ${((Date.now() - started) / 1000).toFixed(1)}秒`);
console.log(
  `\n蔵書 ${BOOKS.length}冊 / 棚 ${Object.keys(SHELVES).length} / 事件 ${CASES.length}本\n`,
);
