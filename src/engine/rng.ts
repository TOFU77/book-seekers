/**
 * 決定論的乱数。
 *
 * Math.random() を使わないのは、同じ種(seed)から同じ町・同じ事件を
 * 再現できるようにするため。不具合が再現でき、「この種の事件が面白かった」を
 * 共有でき、同じ事件を違う手でもう一度解ける。
 */

export interface Rng {
  /** 0 以上 1 未満 */
  next(): number;
  /** min 以上 max 以下の整数 */
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  /** 元の配列は変更しない */
  shuffle<T>(items: readonly T[]): T[];
}

/** 文字列の種を 32bit 整数に潰す(FNV-1a)。 */
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32。小さく、速く、質は十分。 */
export function createRng(seed: string | number): Rng {
  let state = (typeof seed === 'string' ? hashSeed(seed) : seed >>> 0) || 1;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    pick(items) {
      if (items.length === 0) throw new Error('pick: 空の配列');
      return items[Math.floor(next() * items.length)]!;
    },
    shuffle(items) {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j]!, out[i]!];
      }
      return out;
    },
  };
}
