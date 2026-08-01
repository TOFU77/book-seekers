import { useMemo, useState } from 'react';
import type { BookTag, CharacterId, Layer } from '../types.js';
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

// 0=一組目 1=二組目 'keeper'=店番(初期値)。未選択の者は店番になる。
type Slot = 0 | 1 | 'keeper';

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
  onGiveUp,
}: {
  layer: Layer;
  state: InvestigationState;
  seed: string;
  onAdvance: (next: InvestigationState, dayLog: string[], speaker: CharacterId) => void;
  onFinish: () => void;
  onGiveUp: () => void;
}) {
  const [slots, setSlots] = useState<Record<CharacterId, Slot>>(
    () => Object.fromEntries(CAST_IDS.map((c) => [c, 'keeper'])) as Record<CharacterId, Slot>,
  );
  const [where, setWhere] = useState<[string | null, string | null]>([null, null]);
  const [readBook, setReadBook] = useState<string | null>(null);

  const dayNo = layer.days - state.daysLeft + 1;
  const inSlot = (s: Slot) => CAST_IDS.filter((c) => slots[c] === s);
  const teamA = inSlot(0);
  const teamB = inSlot(1);
  const keepers = inSlot('keeper');

  const open = layer.locations.filter((l) => isOpen(state, l.id));

  function cycle(who: CharacterId) {
    setSlots((prev) => {
      const order: Slot[] = ['keeper', 0, 1];
      const cur = prev[who];
      let next: Slot = order[(order.indexOf(cur) + 1) % order.length]!;
      // 組は2人まで。埋まっていたら次の状態へ送る。店番に定員は無い。
      for (let i = 0; i < 3; i++) {
        const count = CAST_IDS.filter((c) => c !== who && prev[c] === next).length;
        if (next === 'keeper' || count < 2) break;
        next = order[(order.indexOf(next) + 1) % order.length]!;
      }
      return { ...prev, [who]: next };
    });
  }

  // 店番全員の「まだ読める本」の和集合。誰が読むかも控えておく。
  const { candidateBooks, readerByBook } = useMemo(() => {
    const readerByBook = new Map<string, CharacterId>();
    const candidateBooks: BookTag[] = [];
    for (const k of keepers) {
      for (const b of unreadBooksFor(state, k)) {
        if (!readerByBook.has(b.id)) {
          readerByBook.set(b.id, k);
          candidateBooks.push(b);
        }
      }
    }
    return { candidateBooks, readerByBook };
  }, [state, keepers.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const reader = readBook && readerByBook.has(readBook)
    ? { who: readerByBook.get(readBook)!, book: readBook }
    : null;

  const canGo =
    Boolean(teamA.length && where[0]) ||
    Boolean(teamB.length && where[1]) ||
    Boolean(reader);

  function endDay() {
    const dispatches: DayPlan['dispatches'] = [];
    if (teamA.length && where[0]) dispatches.push({ members: teamA, location: where[0] });
    if (teamB.length && where[1]) dispatches.push({ members: teamB, location: where[1] });
    const plan: DayPlan = {
      dispatches,
      ...(reader ? { reader } : {}),
    };
    const before = state.log.length;
    const next = runDay(state, plan, dayRng(seed, dayNo));
    // その日の報告は、出向いた者のうち一人が口にする
    const speaker = dispatches[0]?.members[0] ?? reader?.who ?? CAST_IDS[0]!;
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
        <button className="ghost giveup" onClick={onGiveUp}>諦める</button>
        {state.daysLeft === 0 && (
          <button className="go small" onClick={onFinish}>問答へ</button>
        )}
      </div>

      {state.daysLeft > 0 && (
        <>
          <h2 className="sec">采配 — 名前を押すと 店番 → 一組目 → 二組目 と回る（初期は全員が店番）</h2>
          <div className="crew">
            {CAST_IDS.map((c) => (
              <button key={c} className={`member s${slots[c]}`} onClick={() => cycle(c)}>
                <span className="badge">
                  {slots[c] === 0 ? '一' : slots[c] === 1 ? '二' : '店'}
                </span>
                <span className="nm">{CAST[c].name}</span>
                <span className="tr">{traits(c)}</span>
              </button>
            ))}
          </div>

          <div className="teams">
            {[0, 1].map((i) => {
              const team = i === 0 ? teamA : teamB;
              const chem = team.length === 2 ? pairChemistry(team[0]!, team[1]!) : null;
              return (
                <div className="team" key={i}>
                  <div className="th2">{i === 0 ? '一組目' : '二組目'}</div>
                  <div className="who">
                    {team.length ? team.map((c) => CAST[c].name).join(' と ') : '— 未編成'}
                  </div>
                  {team.length === 1 && <div className="chem">単独（拾う網は狭い）</div>}
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
              <div className="th2">店番（積読を一冊だけ崩す）</div>
              <div className="who">
                {keepers.length ? keepers.map((c) => CAST[c].name).join('・') : '— なし'}
              </div>
              <div className="spots">
                {keepers.length > 0 && candidateBooks.slice(0, 12).map((b) => (
                  <button key={b.id} className={`spot${readBook === b.id ? ' on' : ''}`}
                    onClick={() => setReadBook(readBook === b.id ? null : b.id)}>
                    {b.title}
                    <span className="k">
                      {CAST[readerByBook.get(b.id)!].name}が読む ／ {SHELVES[b.shelf].label} 威力{b.power} ／{' '}
                      {b.themes.map((t) => (
                        <span key={t} className={state.knownWeak.includes(t) ? 'th weak' : 'th'}>
                          {THEMES[t].label}
                        </span>
                      ))}
                    </span>
                  </button>
                ))}
                {keepers.length > 0 && candidateBooks.length === 0 && <div className="k">店番の読める本がもう無い。</div>}
                {keepers.length === 0 && <div className="k">全員を組に出すと、この日は本を読めない。</div>}
              </div>
            </div>
          </div>

          <div className="act">
            <div className="read">
              組は一人でも出せる（二人だと化学反応が起きる）。店番は何人いてもよいが、崩せるのは一冊。
            </div>
            <button className="go" onClick={endDay} disabled={!canGo}>一日を終える</button>
          </div>
        </>
      )}
    </div>
  );
}
