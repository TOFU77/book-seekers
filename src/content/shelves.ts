import type { DivisionId, Shelf, ShelfId } from '../types.js';

export const DIVISIONS: Record<DivisionId, { label: string; note: string }> = {
  I: {
    label: '人を読む棚',
    note: '主に心理の壁に効く',
  },
  II: {
    label: '世界を測る棚',
    note: '主に論理の壁に効く',
  },
  III: {
    label: '仕組みを解く棚',
    note: '両方に効く',
  },
  IV: {
    label: '奥の棚',
    note: '店主の私架。知そのものを扱うメタな知。層2以降でのみ解放される',
  },
};

export const SHELVES: Record<ShelfId, Shelf> = {
  // ── 区分I 人を読む ──
  jinshin:    { id: 'jinshin',    label: '人心の棚',   division: 'I',   field: '心理学・精神医学' },
  seken:      { id: 'seken',      label: '世間の棚',   division: 'I',   field: '社会学・組織論' },
  tochi:      { id: 'tochi',      label: '土地の棚',   division: 'I',   field: '民俗学・地方史・地理' },
  monogatari: { id: 'monogatari', label: '物語の棚',   division: 'I',   field: '文学・修辞・ナラティヴ心理学' },
  shumi:      { id: 'shumi',      label: '趣味の棚',   division: 'I',   field: '美学・意匠・映画・芸能' },

  // ── 区分II 世界を測る ──
  suji:       { id: 'suji',       label: '数字の棚',   division: 'II',  field: '統計・確率' },
  busshou:    { id: 'busshou',    label: '物証の棚',   division: 'II',  field: '化学・物理・生物' },
  gigei:      { id: 'gigei',      label: '技芸の棚',   division: 'II',  field: '技術・実務・生活知' },

  // ── 区分III 仕組みを解く ──
  kanjo:      { id: 'kanjo',      label: '勘定の棚',   division: 'III', field: '経済・会計・監査' },
  riho:       { id: 'riho',       label: '理法の棚',   division: 'III', field: '法学・制度・行政' },
  kotoba:     { id: 'kotoba',     label: '言葉の棚',   division: 'III', field: '言語学・記号論' },

  // ── 区分IV 奥の棚 ──
  henshu:     { id: 'henshu',     label: '編集の棚',   division: 'IV',  field: '編集工学・メディア論・出版史・書誌学' },
  raireki:    { id: 'raireki',    label: '来歴の棚',   division: 'IV',  field: '科学史・科学哲学' },
  chinmoku:   { id: 'chinmoku',   label: '沈黙の棚',   division: 'IV',  field: '語られぬこと・余白・間' },
};

export const SHELF_IDS = Object.keys(SHELVES) as ShelfId[];

/** 奥の棚かどうか。層による解放判定に使う。 */
export function isInnerShelf(id: ShelfId): boolean {
  return SHELVES[id].division === 'IV';
}

/**
 * 棚と棚の距離。棚またぎシナジーの倍率を決める。
 *
 *   0 … 同じ棚          → 精読
 *   1 … 同じ区分の別の棚 → 隣接
 *   2 … 別の区分        → 棚またぎ
 *   3 … 片方が奥の棚    → 遠望
 *
 * 奥の棚どうしは同じ区分なので 1 になる。
 * 奥の棚の価値は「表の棚から遠い」ことにあり、奥どうしを重ねても遠くはならない。
 */
export function shelfDistance(a: ShelfId, b: ShelfId): 0 | 1 | 2 | 3 {
  if (a === b) return 0;
  const da = SHELVES[a].division;
  const db = SHELVES[b].division;
  if (da === db) return 1;
  if (da === 'IV' || db === 'IV') return 3;
  return 2;
}
