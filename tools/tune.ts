/**
 * シナジーの数値を目で確かめるための道具。UIは無い。
 *
 *   npm run tune
 *
 * 見るべきこと:
 *   - 単品 → 精読 → 棚またぎ → 遠望 と、段が上がるにつれ手応えが増えているか
 *   - 主題を共有しない寄せ集めが、ちゃんと無駄に終わっているか
 *   - 即席タグが、読了者の同席なしでは弾かれているか
 *   - 良い一手で壁の半分弱が崩れ、3手前後で決着するか
 */

import type { Argument, DebateContext, NotebookTag, Wall } from '../src/types.js';
import { book, LIBRARY } from '../src/content/books/index.js';
import { SHELVES } from '../src/content/shelves.js';
import { THEMES } from '../src/content/themes.js';
import { CAST, allPairs, pairChemistry, AXIS_LABELS, AXIS_IDS } from '../src/content/cast.js';
import { applyArgument, evaluateArgument } from '../src/engine/synergy.js';

const line = (s = '') => console.log(s);
const rule = (t: string) => {
  line();
  line(`── ${t} ${'─'.repeat(Math.max(0, 60 - t.length))}`);
  line();
};

// ─────────────────────────────────────────────
// 幼馴染の気質とペアの化学反応
// ─────────────────────────────────────────────

rule('気質四軸');

for (const axis of AXIS_IDS) {
  const { minus, plus, note } = AXIS_LABELS[axis];
  const cells = Object.values(CAST)
    .map((c) => {
      const v = c.temperament[axis];
      const label = v === 0 ? '中庸' : v < 0 ? minus : plus;
      const mark = Math.abs(v) === 2 ? '◎' : Math.abs(v) === 1 ? '○' : '－';
      return `${c.name} ${label}${mark}`;
    })
    .join('  |  ');
  line(`${note}  (${minus} ⇄ ${plus})`);
  line(`  ${cells}`);
  line();
}

rule('ペアの化学反応(10通り)');

for (const [a, b] of allPairs()) {
  const chem = pairChemistry(a, b);
  const foundation = chem.bringsFoundation ? ' ★定礎材料' : '';
  const tag =
    chem.friction > chem.resonance
      ? '反発(浅く広く)'
      : chem.resonance > chem.friction
        ? '共鳴(深く狭く)'
        : '拮抗';
  line(
    `${CAST[a].name} × ${CAST[b].name}`.padEnd(16, ' ') +
      ` 共鳴${chem.resonance} 反発${chem.friction} 中庸${chem.neutral}  ${tag}${foundation}`,
  );
}

// ─────────────────────────────────────────────
// 壁
// ─────────────────────────────────────────────

/** 層1。備品を私的流用した教師の自己正当化。奥の棚はまだ解放されていない。 */
const wallL1: Wall = {
  kind: 'shinri',
  hardness: 30,
  // 「自分は組織のために立て替えてきた」という語りに触れる主題
  weakThemes: ['dairi', 'kokan'],
  // 相手が既に調べて武装している領域(規程は読み込んでいる)
  resistantShelves: ['riho'],
};

/** 層3。制度そのものを庇う上層部。奥の棚が解放されている。 */
const wallL3: Wall = {
  kind: 'shinri',
  hardness: 100,
  weakThemes: ['kokuhaku', 'kenri'],
  // 表の棚は一通り論破の準備ができている
  resistantShelves: ['riho', 'kanjo', 'seken'],
};

function ctx(wall: Wall, overrides: Partial<DebateContext> = {}): DebateContext {
  return {
    wall,
    present: ['hiiragi', 'senou'],
    read: {
      hiiragi: ['henshu-subject-retreat', 'raireki-paradigm', 'kotoba-euphemism'],
      senou: ['kanjo-principal-agent', 'seken-normalization', 'riho-interpretation'],
    },
    fatigue: {},
    library: LIBRARY,
    ...overrides,
  };
}

const evidence: NotebookTag = {
  id: 'n-receipt',
  label: '日付の飛んだ購買記録',
  kind: 'shoko',
  certainty: 2,
  shelf: 'kanjo',
};

const testimony: NotebookTag = {
  id: 'n-hearsay',
  label: '「みんなやっている」と言った職員',
  kind: 'shogen',
  certainty: 1,
  shelf: 'seken',
};

const instant: NotebookTag = {
  id: 'n-search',
  label: '検索で出てきた同種の事例',
  kind: 'sokuseki',
  certainty: 2,
  shelf: 'chinmoku',
};

function show(title: string, arg: Argument, context: DebateContext): void {
  const r = evaluateArgument(arg, context);
  const books = arg.books.map((b) => `${SHELVES[b.shelf].label}「${b.title}」`).join(' + ');
  line(`【${title}】`);
  line(`  手帳: ${arg.notebook.label} (確度${arg.notebook.certainty})`);
  line(`  書架: ${books}`);
  if (!r.ok) {
    line(`  → 不成立: ${r.reason}`);
    line();
    return;
  }
  const bd = r.breakdown;
  const kindLabel = {
    tanpin: '単品',
    seidoku: '精読',
    tanamatagi: `棚またぎ(距離${bd.maxDistance})`,
    yoseatsume: '寄せ集め',
  }[bd.kind];
  const themes = bd.sharedThemes.map((t) => THEMES[t].label).join('・');
  const pct = Math.round((r.damage / context.wall.hardness) * 100);
  line(
    `  → 崩し値 ${r.damage}  (壁${context.wall.hardness}の ${pct}%)   ` +
      `[${kindLabel}] 基礎${bd.base} × 結合${bd.combination} × 適合${bd.fit}` +
      (themes ? `   共有主題: ${themes}` : ''),
  );
  for (const note of bd.notes) line(`     ・${note}`);
  if (bd.interpreter) line(`     ・受け止めたのは ${CAST[bd.interpreter].name}`);
  line();
}

rule('層1 — 心理の壁 / 堅さ30 / 奥の棚は未解放');

show('単品', { notebook: evidence, books: [book('kanjo-principal-agent')] }, ctx(wallL1));

show(
  '精読 — 同じ棚を2冊',
  { notebook: evidence, books: [book('kanjo-principal-agent'), book('kanjo-sunk-cost')] },
  ctx(wallL1),
);

show(
  '寄せ集め — 棚は違うが主題が繋がらない',
  { notebook: evidence, books: [book('kanjo-sunk-cost'), book('busshou-sound-distance')] },
  ctx(wallL1),
);

show(
  '棚またぎ — 別の区分・共有主題「代理と信任」',
  {
    notebook: evidence,
    books: [book('kanjo-principal-agent'), book('seken-defensive-routine')],
  },
  ctx(wallL1),
);

show(
  '耐性棚だけで固めた — 相手は既に調べている',
  { notebook: evidence, books: [book('riho-interpretation'), book('riho-whistleblowing')] },
  ctx(wallL1),
);

rule('層3 — 心理の壁 / 堅さ100 / 表の棚には耐性、奥の棚が解放');

show(
  '表の棚だけで挑む — 通じない',
  {
    notebook: evidence,
    books: [book('kanjo-principal-agent'), book('seken-defensive-routine')],
  },
  ctx(wallL3),
);

show(
  '遠望 — 奥の棚から光を当てる',
  {
    notebook: evidence,
    books: [book('seken-defensive-routine'), book('henshu-subject-retreat')],
  },
  ctx(wallL3),
);

show(
  '遠望 三冊 — 完成した編成',
  {
    notebook: evidence,
    books: [
      book('seken-defensive-routine'),
      book('henshu-subject-retreat'),
      book('chinmoku-unspoken'),
    ],
  },
  ctx(wallL3),
);

rule('検索・AIの扱い');

show(
  '即席タグ — 沈黙の棚の読了者が居ない',
  { notebook: instant, books: [book('kanjo-principal-agent')] },
  ctx(wallL1),
);

show(
  '即席タグ — 望月(沈黙の棚を読了)が同席している',
  {
    notebook: instant,
    books: [book('seken-defensive-routine'), book('chinmoku-tacit-consent')],
  },
  ctx(wallL3, {
    present: ['hiiragi', 'senou', 'mochizuki'],
    read: {
      hiiragi: ['henshu-subject-retreat', 'raireki-paradigm'],
      senou: ['kanjo-principal-agent', 'seken-normalization'],
      mochizuki: ['chinmoku-tacit-consent', 'chinmoku-unspoken', 'monogatari-excuse-types'],
    },
  }),
);

rule('棚の慣れ — 同じ棚を繰り返した場合');

for (const n of [0, 1, 2, 3]) {
  const r = evaluateArgument(
    { notebook: testimony, books: [book('seken-defensive-routine')] },
    ctx(wallL1, { fatigue: { seken: n } }),
  );
  line(`  世間の棚 ${n + 1}回目 → 崩し値 ${r.damage}`);
}

rule('層1を実際に崩してみる — 手数の確認');

{
  let context = ctx(wallL1);
  let remaining = wallL1.hardness;
  const plays: Array<[string, Argument]> = [
    [
      '棚またぎ',
      { notebook: evidence, books: [book('kanjo-principal-agent'), book('seken-defensive-routine')] },
    ],
    ['精読', { notebook: testimony, books: [book('seken-normalization'), book('seken-defensive-routine')] }],
    ['単品', { notebook: evidence, books: [book('jinshin-moral-licensing')] }],
    ['単品', { notebook: testimony, books: [book('monogatari-excuse-types')] }],
  ];
  let turn = 0;
  for (const [label, arg] of plays) {
    if (remaining <= 0) break;
    turn += 1;
    const r = evaluateArgument(arg, context);
    remaining = Math.round((remaining - r.damage) * 10) / 10;
    line(`  ${turn}手目 ${label.padEnd(8, ' ')} 崩し値 ${String(r.damage).padStart(5, ' ')} → 残り ${remaining}`);
    context = applyArgument(arg, context);
  }
  line();
  line(remaining <= 0 ? `  → ${turn}手で決着` : `  → ${turn}手では崩れず、残り ${remaining}`);
}

line();
