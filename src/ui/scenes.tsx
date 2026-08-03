import { useState } from 'react';
import type { Case, CharacterId, Layer } from '../types.js';
import { BOOKS, LIBRARY } from '../content/books/index.js';
import { CAST } from '../content/cast.js';
import { SHELVES } from '../content/shelves.js';
import { THEMES } from '../content/themes.js';

/** 一座全体で持ち越せる冊数。 */
const CARRY_MAX = 5;

/** 五人が横に並んだ一枚絵。左から柊・望月・真壁・瀬能・朝倉。 */
export const PORTRAIT_ORDER: CharacterId[] = [
  'hiiragi', 'mochizuki', 'makabe', 'senou', 'asakura',
];
export function portraitStyle(who: CharacterId) {
  const i = PORTRAIT_ORDER.indexOf(who);
  return { backgroundPositionX: `${(i / (PORTRAIT_ORDER.length - 1)) * 100}%` };
}

/** 場面の切れ目。ゲームの側が次の場面を告げ、押して進む。 */
export function Curtain({ label, onGo }: { label: string; onGo: () => void }) {
  return (
    <div className="curtain" onClick={onGo}>
      <div className="cbox">
        <div className="clabel">{label}</div>
        <div className="ctap">画面をタップ</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// タイトル
// ─────────────────────────────────────────────

export function Title({
  cases,
  archive,
  onPick,
  narrow,
  onToggleWidth,
  gothic,
  onToggleFont,
  difficulty,
  onToggleDifficulty,
  unlocked,
  soloSolved,
  unlockAt,
  onHistory,
}: {
  cases: Case[];
  archive: string[];
  onPick: (caseIdx: number) => void;
  narrow: boolean;
  onToggleWidth: () => void;
  gothic: boolean;
  onToggleFont: () => void;
  difficulty: 'easy' | 'normal';
  onToggleDifficulty: () => void;
  unlocked: boolean;
  soloSolved: number;
  unlockAt: number;
  onHistory: () => void;
}) {
  const read = BOOKS.filter((b) => archive.includes(b.id));
  const byShelf = new Map<string, typeof read>();
  for (const b of read) {
    const l = byShelf.get(b.shelf);
    if (l) l.push(b); else byShelf.set(b.shelf, [b]);
  }

  // 一層完結を前半、多層を後半に。元の索引は onPick 用に保つ。
  const ordered = cases.map((c, i) => ({ c, i })).sort((a, b) => a.c.layers.length - b.c.layers.length);

  return (
    <div className="title">
      <div className="tbar">
        <h1>柊書房</h1>
        <button className="ghost" onClick={onHistory}>履歴</button>
        <button className="ghost" onClick={onToggleFont}>{gothic ? '明朝体' : 'ゴシック体'}</button>
        <button className="ghost" onClick={onToggleWidth}>{narrow ? 'PC表示' : 'スマホ表示'}</button>
        <button className="ghost" onClick={onToggleDifficulty}>
          難易度: {difficulty === 'easy' ? 'イージー' : 'ノーマル'}
        </button>
      </div>
      {difficulty === 'normal' && (
        <p className="lead soft">
          ノーマル: 書物カードには主題を出さない。何が刺さるかは、一行の要約から推理する。
        </p>
      )}

      <p className="lead">
        衰退していく地方都市の、潰れかけた古書店。
        ここに集まる五人の幼馴染が、町に持ち込まれる小さな醜聞を解いていく。
      </p>
      <p className="lead">
        武器は棚の本だけである。証拠を突きつけても、人は自分の物語を手放さない。
        離れた分野の本が同じことを言っていると気づいたときに、相手の言い分は崩れる。
      </p>
      <p className="lead">
        調べものは誰にでもできる。それを見識に変えるには、
        その本を読んだ人間が同席していなければならない。
      </p>

      <h2 className="sec">事件を選ぶ</h2>
      <div className="caselist">
        {ordered.map(({ c, i }) => {
          const locked = c.layers.length > 1 && !unlocked;
          return (
            <button key={c.id} className={`casecard${locked ? ' locked' : ''}`}
              onClick={() => onPick(i)} disabled={locked}>
              <div className="ct">{c.title}{locked && ' 🔒'}</div>
              <div className="cd">
                {locked
                  ? `一層の事件をあと${Math.max(0, unlockAt - soloSolved)}件解くと開く`
                  : c.hook}
              </div>
              <div className="cl">全{c.layers.length}層</div>
            </button>
          );
        })}
      </div>

      <h2 className="sec">これまでに読んだ本（{read.length} / {BOOKS.length}）</h2>
      {read.length === 0 && <p className="lead soft">まだ一冊も読み終えていない。</p>}
      <div className="archive">
        {[...byShelf.entries()].map(([shelf, list]) => (
          <div key={shelf} className="arow">
            <span className="as">{SHELVES[shelf as keyof typeof SHELVES].label}</span>
            {list.map((b) => (
              <span key={b.id} className="ab">
                {b.title}
                <span className="at">
                  {b.themes.map((t) => THEMES[t].label).join('・')}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// イントロ
// ─────────────────────────────────────────────

export function Intro({
  theCase,
  layer,
  voiceIdx,
}: {
  theCase: Case;
  layer: Layer;
  voiceIdx: number;
}) {
  const v = theCase.voices[voiceIdx % theCase.voices.length]!;
  return (
    <div className="intro">
      <h1 className="it">{theCase.title}</h1>
      <div className="il">層{layer.depth}「{layer.title}」</div>
      <blockquote className="epi big">
        {layer.epigraph.text}
        <cite>『{layer.epigraph.source}』</cite>
      </blockquote>
      <p className="hook">{theCase.hook}</p>
      <div className="voice">
        <div className="vw">{v.who}</div>
        <p className="vl">「{v.line}」</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// エピローグ
// ─────────────────────────────────────────────

export function Epilogue({
  layer,
  won,
  turns,
  hasDeeper,
  onDig,
  onClose,
}: {
  layer: Layer;
  won: boolean;
  turns: number;
  hasDeeper: boolean;
  onDig: () => void;
  onClose: () => void;
}) {
  const pushes = layer.pushes;
  const holds = layer.holds;
  return (
    <div className="epilogue">
      <div className="ehead">{won ? '容疑者は落ちた' : '崩しきれなかった'}</div>
      {won && <div className="eturns">{turns}手</div>}
      <blockquote className="epi big">
        {layer.epigraph.text}
        <cite>『{layer.epigraph.source}』</cite>
      </blockquote>
      <div className="emono">
        {(won ? layer.resolution : layer.failure).map((l, i) => <p key={i}>{l}</p>)}
      </div>

      {won && hasDeeper && pushes && holds ? (
        <>
          <h2 className="sec">まだ掘るか</h2>
          <div className="argue">
            <div className="side">
              <div className="portrait small" style={portraitStyle(pushes)} />
              <div className="sw">{CAST[pushes].name}</div>
              <p>「ここで終わりのはずがないだろう。上がいる」</p>
              <button className="go" onClick={onDig}>掘る</button>
            </div>
            <div className="side">
              <div className="portrait small" style={portraitStyle(holds)} />
              <div className="sw">{CAST[holds].name}</div>
              <p>「……もう、いいんじゃないですか。これ以上は、誰かの生活が壊れる」</p>
              <button className="go ghosty" onClick={onClose}>ここで収める</button>
            </div>
          </div>
        </>
      ) : (
        <div className="eend">
          <button className="go" onClick={onClose}>店へ戻る</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 読了の持ち越し — 次の周へ、五冊だけ
// ─────────────────────────────────────────────

export function CarryPick({
  read,
  onDone,
}: {
  read: Partial<Record<CharacterId, string[]>>;
  onDone: (sel: Partial<Record<CharacterId, string[]>>) => void;
}) {
  // 同じ本を二人が読んでいても、持ち越しは一冊。最初に読んだ者を持ち主とする。
  const owner = new Map<string, CharacterId>();
  const byWho = new Map<CharacterId, string[]>();
  for (const [who, ids] of Object.entries(read) as Array<[CharacterId, string[]]>) {
    for (const id of ids ?? []) {
      if (owner.has(id) || !LIBRARY.get(id)) continue;
      owner.set(id, who);
      const l = byWho.get(who);
      if (l) l.push(id); else byWho.set(who, [id]);
    }
  }

  const [sel, setSel] = useState<Set<string>>(() => new Set());
  const toggle = (id: string) =>
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else if (n.size < CARRY_MAX) n.add(id);
      return n;
    });
  const finish = () => {
    const out: Partial<Record<CharacterId, string[]>> = {};
    for (const id of sel) {
      const w = owner.get(id)!;
      (out[w] ??= []).push(id);
    }
    onDone(out);
  };

  const empty = owner.size === 0;

  return (
    <div className="carry">
      <h1 className="it">持ち越す本を選ぶ</h1>
      <p className="lead">
        今回の周で読んだ本のうち、<b>{CARRY_MAX}冊まで</b>を次の事件へ持ち越せる。
        どれだけ読んでも、棚に残せるのはこれだけ。何を手元に置くかが、次の周の入り口になる。
      </p>
      <p className="lead soft">選んだ {sel.size} / {CARRY_MAX} 冊</p>

      {empty && <p className="lead soft">持ち越せる本がない。</p>}

      {[...byWho.entries()].map(([who, ids]) => (
        <div className="shelfgroup" key={who}>
          <div className="name">{CAST[who].name}が読んだ</div>
          <div className="cards">
            {ids.map((id) => {
              const b = LIBRARY.get(id)!;
              const on = sel.has(id);
              const full = !on && sel.size >= CARRY_MAX;
              return (
                <button key={id}
                  className={`card d-${SHELVES[b.shelf].division} q${b.power}${on ? ' on' : ''}`}
                  onClick={() => toggle(id)} disabled={full}>
                  <span className="lamp" />
                  <div className="title">{b.title}</div>
                  <div className="meta">
                    {SHELVES[b.shelf].label} ／ 威力{b.power}
                  </div>
                  <div className="themes">
                    {b.themes.map((t) => <span key={t} className="th">{THEMES[t].label}</span>)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="eend">
        <button className="go" onClick={finish}>
          {empty ? '店へ戻る' : `この${sel.size}冊で店へ戻る`}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 解決の履歴
// ─────────────────────────────────────────────

interface SolveRow {
  count: number;
  lastTurns: number;
  lastRead: string[];
}

export function HistoryScreen({
  cases,
  history,
  onReset,
  onBack,
}: {
  cases: Case[];
  history: Record<string, SolveRow>;
  onReset: () => void;
  onBack: () => void;
}) {
  const solved = cases.filter((c) => (history[c.id]?.count ?? 0) > 0);
  return (
    <div className="history">
      <div className="tbar">
        <h1>解決の記録</h1>
        <button className="ghost" onClick={onBack}>戻る</button>
      </div>

      {solved.length === 0 && <p className="lead">まだ一件も解決していない。</p>}

      <div className="hlist">
        {cases.map((c) => {
          const r = history[c.id];
          if (!r) return null;
          return (
            <div key={c.id} className="hrow">
              <div className="ht">
                {c.title}<span className="hlayer">全{c.layers.length}層</span>
              </div>
              <div className="hmeta">
                解決 {r.count}回 ／ 最新の問答 {r.lastTurns}手
              </div>
              <div className="hread">
                最新の解決時に読んでいた本：{r.lastRead.length ? r.lastRead.join('、') : '—'}
              </div>
            </div>
          );
        })}
      </div>

      {solved.length > 0 && (
        <div className="eend">
          <button className="go ghosty" onClick={onReset}>解決履歴をリセット</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// エンディング（三層の事件を解決したとき）
// ─────────────────────────────────────────────

export function Ending({
  theCase,
  onClose,
}: {
  theCase: Case;
  onClose: () => void;
}) {
  return (
    <div className="ending">
      <h1 className="et">柊書房、その後</h1>
      <div className="emono">
        <p>
          事件が片づいても、町が上向くわけではない。
          駅前のシャッターは相変わらず下りたままで、店の売り上げも大して変わらない。
        </p>
        <p>
          ただ、噂を持ち込む客の口ぶりが少し変わった。
          「柊さんとこに相談すると、話がほどける」——そう言って、また別の面倒事が持ち込まれる。
        </p>
        <p>
          五人は今日も、閉店後の店に集まっている。
          真壁は現場の泥を落とさないまま椅子に座り、瀬能は帳面を睨み、
          望月は誰かの言い淀みを覚えていて、朝倉は撮ったばかりの写真を一人で長く見ている。
          柊は、客が話し終わるまで本を閉じない。
        </p>
        <p className="esoft">
          読んだものが、いつか誰かの役に立つ。
          その順番が逆でないことを、この店だけは知っている。
        </p>
      </div>
      <div className="eend">
        <button className="go" onClick={onClose}>店へ戻る</button>
      </div>
      <p className="lead soft" style={{ marginTop: '18px' }}>
        （{theCase.title} を最後まで崩した）
      </p>
    </div>
  );
}
