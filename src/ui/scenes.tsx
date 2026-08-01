import type { Case, CharacterId, Layer } from '../types.js';
import { BOOKS } from '../content/books/index.js';
import { CAST } from '../content/cast.js';
import { SHELVES } from '../content/shelves.js';
import { THEMES } from '../content/themes.js';

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
}: {
  cases: Case[];
  archive: string[];
  onPick: (caseIdx: number) => void;
  narrow: boolean;
  onToggleWidth: () => void;
}) {
  const read = BOOKS.filter((b) => archive.includes(b.id));
  const byShelf = new Map<string, typeof read>();
  for (const b of read) {
    const l = byShelf.get(b.shelf);
    if (l) l.push(b); else byShelf.set(b.shelf, [b]);
  }

  return (
    <div className="title">
      <div className="tbar">
        <h1>柊書房</h1>
        <button className="ghost" onClick={onToggleWidth}>{narrow ? 'PC表示' : 'スマホ表示'}</button>
      </div>

      <p className="lead">
        衰退していく地方都市の、潰れかけた古書店。
        ここに集まる五人の幼馴染が、町に持ち込まれる小さな醜聞を解いていく。
      </p>
      <p className="lead">
        武器は棚の本だけである。証拠を突きつけても、人は自分の物語を手放さない。
        <b>離れた分野の本が同じことを言っていると気づいたときだけ</b>、相手の言い分は崩れる。
      </p>
      <p className="lead soft">
        調べものは誰にでもできる。だが調べたものを見識に変えるには、
        それを読んだ人間が同席していなければならない。
      </p>

      <h2 className="sec">事件を選ぶ</h2>
      <div className="caselist">
        {cases.map((c, i) => (
          <button key={c.id} className="casecard" onClick={() => onPick(i)}>
            <div className="ct">{c.title}</div>
            <div className="cd">{c.hook}</div>
            <div className="cl">全{c.layers.length}層</div>
          </button>
        ))}
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
