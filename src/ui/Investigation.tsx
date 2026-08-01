import { useMemo, useState } from 'react';
import type { CharacterId, Layer } from '../types.js';
import { CAST, CAST_IDS, pairChemistry, AXIS_LABELS } from '../content/cast.js';
import { SHELVES } from '../content/shelves.js';
import { THEMES } from '../content/themes.js';
import {
  isOpen,
  remainingYields,
  runDay,
  type DayPlan,
  type InvestigationState,
} from '../engine/investigate.js';
import { dayRng, unreadBooksFor } from './setup.js';

const LOC_KIND: Record<string, string> = {
  kiroku: '記録', hito: '人', genba: '現場', honnin: '本人',
};

type Slot = 0 | 1 | 2 | null; // 0=一組目 1=二組目 2=店番

/** その人の気質を一行で。誰を組ませるかの判断材料になる。 */
function traits(who: CharacterId): string {
  const t = CAST[who].temperament;
  const out: string[] = [];
  for (const [k, v] of Object.entries(t) as Array<[keyof typeof t, number]>) {
    if (v === 0) continue;
    const l = AXIS_LABELS[k];
    out.push(`${v < 0 ? l.minus : l.plus}${Math.abs(v) === 2 ? '◎' : ''}`);
  }
  return out.join('・');
}

export default function Investigation({
  layer,
  state,
  seed,
  onAdvance,
  onFinish,
}: {
  layer: Layer;
  state: InvestigationState;
  seed: string;
  onAdvance: (next: InvestigationState, dayLog: string[], speaker: CharacterId) => void;
  onFinish: () => void;
}) {
  const [slots, setSlots] = useState<Record<CharacterId, Slot>>(
    () => Object.fromEntries(CAST_IDS.map((c) => [c, null])) as Record<CharacterId, Slot>,
  );
  const [where, setWhere] = useState<[string | null, string | null]>([null, null]);
  const [readBook, setReadBook] = useState<string | null>(null);

  const dayNo = layer.days - state.daysLeft + 1;
  const inSlot = (s: Slot) => CAST_IDS.filter((c) => slots[c] === s);
  const pairA = inSlot(0);
  const pairB = inSlot(1);
  const keeper = inSlot(2)[0];

  const open = layer.locations.filter((l) => isOpen(state, l.id));

  function cycle(who: CharacterId) {
    setSlots((prev) => {
      const cur = prev[who];
      const order: Slot[] = [0, 1, 2, null];
      let next: Slot = order[(order.indexOf(cur) + 1) % order.length]!;
      // 定員: 組は2人まで、店番は1人まで
      for (let i = 0; i < 4; i++) {
        const count = CAST_IDS.filter((c) => c !== who && prev[c] === next).length;
        const cap = next === 2 ? 1 : next === null ? 99 : 2;
        if (count < cap) break;
        next = order[(order.indexOf(next) + 1) % order.length]!;
      }
      return { ...prev, [who]: next };
    });
  }

  const candidates = useMemo(
    () => (keeper ? unreadBooksFor(state, keeper) : []),
    [state, keeper],
  );

  const canGo =
    (pairA.length === 2 && where[0]) || (pairB.length === 2 && where[1]) || Boolean(keeper && readBook);

  function endDay() {
    const dispatches: DayPlan['dispatches'] = [];
    if (pairA.length === 2 && where[0]) {
      dispatches.push({ pair: [pairA[0]!, pairA[1]!], location: where[0] });
    }
    if (pairB.length === 2 && where[1]) {
      dispatches.push({ pair: [pairB[0]!, pairB[1]!], location: where[1] });
    }
    const plan: DayPlan = {
      dispatches,
      ...(keeper && readBook ? { reader: { who: keeper, book: readBook } } : {}),
    };
    const before = state.log.length;
    const next = runDay(state, plan, dayRng(seed, dayNo));
    // その日の報告は、出向いた者のうち一人が口にする
    const speaker = dispatches[0]?.pair[0] ?? keeper ?? CAST_IDS[0]!;
    onAdvance(next, next.log.slice(before), speaker);
    // 采配は前日のまま保持する。変えたいときだけ押せばいい。
    // ただし口を閉ざした場所は行き先から外す。読んだ本は消費したので選び直す。
    setWhere((w) => [
      w[0] && isOpen(next, w[0]) ? w[0] : null,
      w[1] && isOpen(next, w[1]) ? w[1] : null,
    ]);
    setReadBook(null);
  }

  const weakPool = [...new Set([...layer.psych.weakThemes, ...layer.logical.weakThemes])];

  return (
    <div className="invest">
      <div className="istatus">
        <span className="day">{state.daysLeft > 0 ? `${dayNo}日目` : '捜査終了'}</span>
        <span>／ 残り{state.daysLeft}日</span>
        <span>／ 手帳 {state.notebook.length}</span>
        <span>／ 人物の理解 {state.insight}</span>
        <span className="weak">
          ／ 急所 {state.knownWeak.length}/{weakPool.length}
          {state.knownWeak.length > 0 &&
            `（${state.knownWeak.map((t) => THEMES[t].label).join('・')}）`}
        </span>
        {state.daysLeft === 0 && (
          <button className="go small" onClick={onFinish}>問答へ</button>
        )}
      </div>

      {state.daysLeft > 0 && (
        <>
          <h2 className="sec">采配 — 名前を押すと 一組目 → 二組目 → 店番 と移る</h2>
          <div className="crew">
            {CAST_IDS.map((c) => (
              <button key={c} className={`member s${slots[c] ?? 'x'}`} onClick={() => cycle(c)}>
                <span className="badge">
                  {slots[c] === 0 ? '一' : slots[c] === 1 ? '二' : slots[c] === 2 ? '店' : '　'}
                </span>
                <span className="nm">{CAST[c].name}</span>
                <span className="tr">{traits(c)}</span>
              </button>
            ))}
          </div>

          <div className="teams">
            {[0, 1].map((i) => {
              const pair = i === 0 ? pairA : pairB;
              const chem = pair.length === 2 ? pairChemistry(pair[0]!, pair[1]!) : null;
              return (
                <div className="team" key={i}>
                  <div className="th2">{i === 0 ? '一組目' : '二組目'}</div>
                  <div className="who">
                    {pair.length ? pair.map((c) => CAST[c].name).join(' と ') : '— 未編成'}
                  </div>
                  {chem && (
                    <div className="chem">
                      {chem.resonance > chem.friction ? '共鳴（深く狭く）' : chem.friction > chem.resonance ? '反発（浅く広く）' : '拮抗'}
                      {chem.bringsFoundation && <b> ／ 定礎材料が揃う</b>}
                    </div>
                  )}
                  <div className="spots">
                    {open.map((l) => (
                      <button key={l.id}
                        className={`spot${where[i] === l.id ? ' on' : ''}`}
                        onClick={() => setWhere((w) => {
                          const n: [string | null, string | null] = [w[0], w[1]];
                          n[i] = w[i] === l.id ? null : l.id;
                          return n;
                        })}>
                        {l.label}
                        <span className="k">
                          {LOC_KIND[l.kind]}
                          {remainingYields(state, l).length > 0 ? ' ・物あり' : ' ・物なし'}
                          {l.insight > 0 && ' ・人が見える'}
                        </span>
                      </button>
                    ))}
                    {open.length === 0 && <div className="k">どこも口を開いてくれない。</div>}
                  </div>
                </div>
              );
            })}

            <div className="team">
              <div className="th2">店番（積読を崩す）</div>
              <div className="who">{keeper ? CAST[keeper].name : '— 未指定'}</div>
              <div className="spots">
                {keeper && candidates.slice(0, 8).map((b) => (
                  <button key={b.id} className={`spot${readBook === b.id ? ' on' : ''}`}
                    onClick={() => setReadBook(readBook === b.id ? null : b.id)}>
                    {b.title}
                    <span className="k">
                      {SHELVES[b.shelf].label} 威力{b.power} ／{' '}
                      {b.themes.map((t) => (
                        <span key={t} className={state.knownWeak.includes(t) ? 'th weak' : 'th'}>
                          {THEMES[t].label}
                        </span>
                      ))}
                    </span>
                  </button>
                ))}
                {keeper && candidates.length === 0 && <div className="k">読める本がもう無い。</div>}
                {!keeper && <div className="k">誰か一人を店に残すと、積読を一冊崩せる。</div>}
              </div>
            </div>
          </div>

          <div className="act">
            <div className="read">
              一組は二人。行き先を選ぶと出せる。店番は一人だけ。
            </div>
            <button className="go" onClick={endDay} disabled={!canGo}>一日を終える</button>
          </div>
        </>
      )}
    </div>
  );
}
