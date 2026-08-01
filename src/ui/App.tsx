import { useState } from 'react';
import type {
  Argument, ArgumentResult, BookTag, CharacterId, ShelfId, ThemeId, WallKind,
} from '../types.js';
import { CASES } from '../content/cases/index.js';
import { SHELVES } from '../content/shelves.js';
import { THEMES } from '../content/themes.js';
import { CAST, CAST_IDS } from '../content/cast.js';
import { evaluateArgument, sharedThemes } from '../engine/synergy.js';
import { contextFor, isWon, play } from '../engine/debate.js';
import type { InvestigationState } from '../engine/investigate.js';
import { newInvestigation, readersOf, toDebate, type Session } from './setup.js';
import Investigation from './Investigation.js';
import { CarryPick, Curtain, Epilogue, Intro, Title, portraitStyle } from './scenes.js';

const KIND_LABEL: Record<string, string> = {
  shoko: '証拠', shogen: '証言', dogu: '道具', sokuseki: '即席',
};
const COMBO_LABEL: Record<string, string> = {
  tanpin: '単品', seidoku: '精読', tanamatagi: '棚またぎ', yoseatsume: '寄せ集め',
};

const ARCHIVE_KEY = 'hiiragi.read';
function loadArchive(): string[] {
  try { const v = JSON.parse(localStorage.getItem(ARCHIVE_KEY) ?? '[]'); return Array.isArray(v) ? v : []; }
  catch { return []; }
}
function addToArchive(ids: string[]): string[] {
  const merged = [...new Set([...loadArchive(), ...ids])];
  try { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(merged)); } catch { /* 保存できなくても遊べる */ }
  return merged;
}

const CARRY_KEY = 'hiiragi.carry';
type Carry = Partial<Record<CharacterId, string[]>>;
function loadCarry(): Carry | null {
  try {
    const v = JSON.parse(localStorage.getItem(CARRY_KEY) ?? 'null');
    return v && typeof v === 'object' ? (v as Carry) : null;
  } catch { return null; }
}
function saveCarry(c: Carry) {
  try { localStorage.setItem(CARRY_KEY, JSON.stringify(c)); } catch { /* 保存できなくても遊べる */ }
}

type Scene = 'title' | 'intro' | 'invest' | 'debate' | 'epilogue' | 'carry';

function Themes({ themes, weak, shared }: { themes: ThemeId[]; weak: ThemeId[]; shared: ThemeId[] }) {
  return (
    <div className="themes">
      {themes.map((t) => (
        <span key={t} className={`th${weak.includes(t) ? ' weak' : ''}${shared.includes(t) ? ' shared' : ''}`}>
          {THEMES[t].label}
        </span>
      ))}
    </div>
  );
}

interface Flash {
  result: ArgumentResult; speaker: CharacterId; target: WallKind; before: number; after: number;
}

export default function App() {
  const [scene, setScene] = useState<Scene>('title');
  const [curtain, setCurtain] = useState<{ label: string; go: () => void } | null>(null);
  const [narrow, setNarrow] = useState(false);
  const [gothic, setGothic] = useState(false);
  const [archive, setArchive] = useState<string[]>(() => loadArchive());
  const [carry, setCarry] = useState<Carry | null>(() => loadCarry());

  const [caseIdx, setCaseIdx] = useState(0);
  const [layerIdx, setLayerIdx] = useState(0);
  const [seed, setSeed] = useState(() => String(Date.now()));

  const [inv, setInv] = useState<InvestigationState | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [dayReport, setDayReport] = useState<{ lines: string[]; who: CharacterId } | null>(null);

  const [target, setTarget] = useState<WallKind>('shinri');
  const [pickedNote, setPickedNote] = useState<string | null>(null);
  const [pickedBooks, setPickedBooks] = useState<string[]>([]);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [peek, setPeek] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const theCase = CASES[caseIdx]!;
  const layer = theCase.layers[Math.min(layerIdx, theCase.layers.length - 1)]!;
  const runKey = `${theCase.id}-${layerIdx}-${seed}`;

  const appClass = `app${narrow ? ' narrow' : ''}${gothic ? ' gothic' : ''}`;
  const toggleFont = () => setGothic((v) => !v);

  function veil(label: string, go: () => void) { setCurtain({ label, go }); }

  function beginCase(i: number) {
    setCaseIdx(i); setLayerIdx(0); setSeed(String(Date.now()));
    veil('イントロへ', () => setScene('intro'));
  }

  function beginInvestigation(depthIdx: number, carried?: Carry) {
    const l = theCase.layers[depthIdx]!;
    setLayerIdx(depthIdx);
    setInv(newInvestigation(l, `${theCase.id}-${depthIdx}-${seed}`, carried));
    setSession(null); setDayReport(null);
    setPickedNote(null); setPickedBooks([]); setFlash(null); setTarget('shinri');
    setPeek(false); setConfirm(false);
  }

  function toTitle() {
    setInv(null); setSession(null); setScene('title');
  }

  // ══ タイトル ══
  if (scene === 'title') {
    return (
      <div className={appClass}>
        <div className="scroll">
          <Title cases={CASES} archive={archive} onPick={beginCase}
            narrow={narrow} onToggleWidth={() => setNarrow((v) => !v)}
            gothic={gothic} onToggleFont={toggleFont} />
        </div>
        {curtain && <Curtain label={curtain.label} onGo={() => { const g = curtain.go; setCurtain(null); g(); }} />}
      </div>
    );
  }

  // ══ イントロ ══
  if (scene === 'intro') {
    return (
      <div className={appClass}>
        <div className="scroll">
          <Intro theCase={theCase} layer={layer} voiceIdx={Number(seed) % theCase.voices.length} />
          <div className="eend">
            <button className="go" onClick={() =>
              veil('捜査パートへ', () => { beginInvestigation(layerIdx, carry ?? undefined); setScene('invest'); })}>
              話を聞きに行く
            </button>
          </div>
        </div>
        {curtain && <Curtain label={curtain.label} onGo={() => { const g = curtain.go; setCurtain(null); g(); }} />}
      </div>
    );
  }

  // ══ 捜査 ══
  if (scene === 'invest' && inv) {
    return (
      <div className={appClass}>
        <div className="stage">
          <div className="bar">
            <h1>捜査</h1>
            <span className="sub">{theCase.title}／層{layer.depth}「{layer.title}」</span>
            <button className="ghost" onClick={toggleFont}>{gothic ? '明朝' : 'ゴシック'}</button>
            <span className="turns"><b>{inv.daysLeft}</b> 日</span>
          </div>
          <details className="suspect">
            <summary>
              <span className="who">{layer.opponent.name}</span>
              <span className="role">{layer.opponent.role}</span>
            </summary>
            <p>{layer.opponent.justification}</p>
          </details>
        </div>
        <div className="hand">
          <Investigation layer={layer} state={inv} seed={runKey}
            onAdvance={(next, lines, who) => { setInv(next); setDayReport({ lines, who }); }}
            onFinish={() => veil('問答パートへ', () => { setSession(toDebate(layer, inv)); setScene('debate'); })} />
          <div className="records">
            <details><summary>これまでの記録</summary>
              <div className="body">{inv.log.map((l, i) => <div key={i}>{l}</div>)}</div>
            </details>
          </div>
        </div>

        {dayReport && (
          <div className="overlay" onClick={() => setDayReport(null)}>
            <div className="panel finale">
              <div className="portrait" style={portraitStyle(dayReport.who)} />
              <div className="said">
                <div className="name">{CAST[dayReport.who].name}の報告</div>
                {dayReport.lines.map((l, i) => {
                  const salon = l.startsWith('座談');
                  const sub = l.startsWith(' ');
                  return (
                    <p className={`mono${salon ? ' salon' : ''}${sub ? ' sub' : ''}`} key={i}>{l.trim()}</p>
                  );
                })}
                <div className="tap">画面をタップで閉じる</div>
              </div>
            </div>
          </div>
        )}
        {curtain && <Curtain label={curtain.label} onGo={() => { const g = curtain.go; setCurtain(null); g(); }} />}
      </div>
    );
  }

  // ══ エピローグ ══
  if (scene === 'epilogue' && session) {
    const won = isWon(session.debate);
    const deeper = layerIdx + 1 < theCase.layers.length;
    return (
      <div className={appClass}>
        <div className="scroll">
          <Epilogue layer={layer} won={won} turns={layer.turns - session.debate.turnsLeft}
            hasDeeper={deeper}
            onDig={() => veil('捜査パートへ', () => {
              beginInvestigation(layerIdx + 1, session.investigation.read);
              setScene('invest');
            })}
            onClose={() => veil('店へ戻る', () => setScene('carry'))} />
        </div>
        {curtain && <Curtain label={curtain.label} onGo={() => { const g = curtain.go; setCurtain(null); g(); }} />}
      </div>
    );
  }

  // ══ 持ち越し ══
  if (scene === 'carry' && session) {
    return (
      <div className={appClass}>
        <div className="scroll">
          <CarryPick
            read={session.investigation.read}
            onDone={(sel) => { setCarry(sel); saveCarry(sel); veil('柊書房へ', toTitle); }}
          />
        </div>
        {curtain && <Curtain label={curtain.label} onGo={() => { const g = curtain.go; setCurtain(null); g(); }} />}
      </div>
    );
  }

  // ══ 問答 ══
  if (!session) { return <div className="app"><div className="scroll"><p className="lead">…</p></div></div>; }

  const { debate, investigation, notebook, books } = session;
  const knownWeak = investigation.knownWeak;
  const noteById = new Map(notebook.map((n) => [n.id, n]));
  const bookById = new Map(books.map((b) => [b.id, b]));
  const chosenBooks = pickedBooks.map((id) => bookById.get(id)!).filter(Boolean);
  const chosenNote = pickedNote ? noteById.get(pickedNote) : undefined;
  const shared = chosenBooks.length >= 2 ? sharedThemes(chosenBooks) : [];
  const argument: Argument | null =
    chosenNote && chosenBooks.length > 0 ? { notebook: chosenNote, books: chosenBooks } : null;
  const result = argument ? evaluateArgument(argument, contextFor(debate, target)) : null;
  const pending = result?.ok ? result.damage : 0;
  const over = isWon(debate) || debate.turnsLeft <= 0;
  const wall = (k: WallKind) => (k === 'ronri' ? layer.logical : layer.psych);
  const showPred = narrow || peek;

  const byShelf = (() => {
    const m = new Map<ShelfId, BookTag[]>();
    for (const b of books) { const l = m.get(b.shelf); if (l) l.push(b); else m.set(b.shelf, [b]); }
    return [...m.entries()].sort((a, b) => SHELVES[a[0]].division.localeCompare(SHELVES[b[0]].division));
  })();

  function toggleBook(id: string) {
    setPickedBooks((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]));
  }
  function speakerFor(bs: BookTag[]): CharacterId {
    const top = [...bs].sort((a, b) => b.power - a.power)[0];
    return (top ? readersOf(investigation, top.id)[0] : undefined) ?? CAST_IDS[0]!;
  }
  function commit() {
    if (!argument || !result?.ok) return;
    const before = debate.remaining[target];
    const next = play(debate, target, argument);
    setSession((s) => (s ? { ...s, debate: next.state } : s));
    setFlash({ result: next.result, speaker: speakerFor(chosenBooks), target, before, after: next.state.remaining[target] });
    setPickedNote(null); setPickedBooks([]);
    setConfirm(false); setPeek(false);
    const other: WallKind = target === 'ronri' ? 'shinri' : 'ronri';
    if (next.state.remaining[target] <= 0 && next.state.remaining[other] > 0) setTarget(other);
  }
  function onThrust() {
    if (!result?.ok) return;
    if (narrow) commit();
    else setConfirm(true);
  }
  function toEpilogue() {
    const ids: string[] = [];
    for (const w of CAST_IDS) ids.push(...(investigation.read[w] ?? []));
    setArchive(addToArchive(ids));
    veil('エピローグへ', () => setScene('epilogue'));
  }

  const predBody = (
    <>
      {result && !result.ok && <span className="bad">{result.reason}</span>}
      {result?.ok && (
        <>
          <span className="dmg">−{result.damage}</span>
          {COMBO_LABEL[result.breakdown.kind]}
          {result.breakdown.sharedThemes.length > 0 &&
            ` ／ 共有主題: ${result.breakdown.sharedThemes.map((t) => THEMES[t].label).join('・')}`}
          {result.breakdown.notes.map((n, i) => <div key={i}>・{n}</div>)}
        </>
      )}
    </>
  );

  return (
    <div className={`${appClass} play`}>
      <div className="arena">
        {/* ── 容疑者フレーム ── */}
        <div className="frame board">
          <div className="bar">
            <h1>問答</h1>
            <span className="sub">{layer.opponent.name}</span>
            <button className="ghost" onClick={toggleFont}>{gothic ? '明朝' : 'ゴシック'}</button>
            <span className="turns">残り <b>{debate.turnsLeft}</b> 手</span>
          </div>

          <details className="suspect" open>
            <summary>
              <span className="who">{layer.opponent.name}</span>
              <span className="role">{layer.opponent.role}</span>
            </summary>
            <p>{layer.opponent.justification}</p>
          </details>

          <div className="walls">
            {(['ronri', 'shinri'] as WallKind[]).map((k) => {
              const w = wall(k); const done = debate.remaining[k] <= 0; const cur = debate.remaining[k];
              const drop = k === target ? Math.min(pending, cur) : 0;
              const known = w.weakThemes.filter((t) => knownWeak.includes(t));
              return (
                <div key={k} className={`wall ${k}${done ? ' done' : ''}${k === target && !done ? ' aim' : ''}`}
                  onClick={() => !done && setTarget(k)}>
                  <div className="label">
                    <span>{k === 'ronri' ? '論理の壁' : '心理の壁'}</span>
                    <span className="num">
                      {done ? '崩れた' : <>{cur}{showPred && drop > 0 && <span className="drop"> → {Math.round((cur - drop) * 10) / 10}</span>} / {w.hardness}</>}
                    </span>
                  </div>
                  <div className="gauge">
                    {showPred && <i className="pre" style={{ width: `${Math.max(0, (cur / w.hardness) * 100)}%` }} />}
                    <i className="cur" style={{ width: `${Math.max(0, ((cur - (showPred ? drop : 0)) / w.hardness) * 100)}%` }} />
                  </div>
                  <div className="known">
                    {known.length > 0 ? `急所: ${known.map((t) => THEMES[t].label).join('・')}` : '急所はまだ見えない'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="act">
            <div className="read">
              {!argument && <>手帳を1つと、書架から1〜3冊を選ぶ。</>}
              {argument && !showPred && <span className="soft">「突きつける」に触れると、効き目が見える。</span>}
              {argument && showPred && predBody}
            </div>
            {over
              ? <button className="go" onClick={toEpilogue}>結末を見る</button>
              : <button className="go thrust" onClick={onThrust} disabled={!result?.ok}
                  onMouseEnter={() => setPeek(true)} onMouseLeave={() => setPeek(false)}
                  onFocus={() => setPeek(true)} onBlur={() => setPeek(false)}>
                  突きつける
                </button>}
          </div>

          <div className="records">
            <details open><summary>問答の記録</summary>
              <div className="body">
                {debate.log.length === 0 && <div>まだ何も言っていない。</div>}
                {[...debate.log].reverse().map((e, i) => (
                  <div className={`entry${e.ok ? '' : ' miss'}`} key={i}>
                    <span>{e.turn}手目 ／ {e.target === 'ronri' ? '論理' : '心理'} ／ {COMBO_LABEL[e.kind]}</span>
                    <span>{e.ok ? `−${e.damage}` : '不成立'}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>

        {/* ── 手帳フレーム ── */}
        <div className="frame notes">
          <h2 className="sec">手帳 — この事件の証拠</h2>
          <div className="cards">
            {notebook.map((n) => {
              const times = debate.shown[n.id] ?? 0;
              return (
                <button key={n.id} className={`card note q${n.certainty}${pickedNote === n.id ? ' on' : ''}`}
                  onClick={() => setPickedNote(pickedNote === n.id ? null : n.id)} disabled={over}>
                  <span className="lamp" />
                  <div className="title">{n.label}</div>
                  <div className="meta">
                    {KIND_LABEL[n.kind]} ／ 確度{n.certainty} ／ {SHELVES[n.shelf].label}
                    {times > 0 && <span className="used"> ／ {times}回出した</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 書架フレーム ── */}
        <div className="frame shelves">
          <h2 className="sec">書架 — 土台になる知識</h2>
          {byShelf.map(([shelf, list]) => (
            <div className="shelfgroup" key={shelf}>
              <div className="name">
                {SHELVES[shelf].label}
                {investigation.knownResistant.includes(shelf) && <span className="resist"> ／ 読み込まれている</span>}
              </div>
              <div className="cards">
                {list.map((b) => (
                  <button key={b.id} className={`card d-${SHELVES[b.shelf].division} q${b.power}${pickedBooks.includes(b.id) ? ' on' : ''}`}
                    onClick={() => toggleBook(b.id)} disabled={over}>
                    <span className="lamp" />
                    <div className="title">{b.title}</div>
                    <div className="meta">
                      威力{b.power} ／ {readersOf(investigation, b.id).map((w) => CAST[w].name).join('・')}
                      {(debate.fatigue[b.shelf] ?? 0) > 0 && <span className="used"> ／ この棚は{debate.fatigue[b.shelf]}回目</span>}
                    </div>
                    <Themes themes={b.themes} weak={knownWeak} shared={shared} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirm && result?.ok && (
        <div className="overlay" onClick={() => setConfirm(false)}>
          <div className="panel ask" onClick={(e) => e.stopPropagation()}>
            <div className="said">
              <div className="name">{target === 'ronri' ? '論理の壁' : '心理の壁'}に</div>
              <div className="big">−{result.damage}</div>
              <div className="line">
                {COMBO_LABEL[result.breakdown.kind]}
                {result.breakdown.sharedThemes.length > 0 &&
                  ` ／ 共有主題: ${result.breakdown.sharedThemes.map((t) => THEMES[t].label).join('・')}`}
              </div>
              {result.breakdown.notes.map((n, i) => <div className="line soft" key={i}>・{n}</div>)}
              <div className="askrow">
                <button className="go" onClick={commit}>突きつける</button>
                <button className="go ghosty" onClick={() => setConfirm(false)}>まだ</button>
              </div>
              <div className="tap">「まだ」で戻っても、選び直しに罰はない。</div>
            </div>
          </div>
        </div>
      )}

      {flash && (
        <div className="overlay" onClick={() => setFlash(null)}>
          <div className="panel">
            <div className="portrait" style={portraitStyle(flash.speaker)} />
            <div className="said">
              <div className="name">{CAST[flash.speaker].name}</div>
              <div className={`big${flash.result.damage === 0 ? ' zero' : ''}`}>
                {flash.result.ok ? `−${flash.result.damage}` : '通じない'}
              </div>
              {flash.result.ok ? (
                <>
                  <div className="line">
                    {COMBO_LABEL[flash.result.breakdown.kind]}
                    {flash.result.breakdown.sharedThemes.length > 0 &&
                      ` ／ 共有主題: ${flash.result.breakdown.sharedThemes.map((t) => THEMES[t].label).join('・')}`}
                  </div>
                  {flash.result.breakdown.notes.map((n, i) => <div className="line soft" key={i}>・{n}</div>)}
                </>
              ) : <div className="line">{flash.result.reason}</div>}
              <div className="wallnow">
                {flash.target === 'ronri' ? '論理の壁' : '心理の壁'} {flash.before} → <b>{flash.after}</b>
                {flash.after <= 0 && '　崩れた'}
              </div>
              <div className="tap">画面をタップで閉じる</div>
            </div>
          </div>
        </div>
      )}
      {curtain && <Curtain label={curtain.label} onGo={() => { const g = curtain.go; setCurtain(null); g(); }} />}
    </div>
  );
}
