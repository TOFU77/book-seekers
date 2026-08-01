import type { CharacterId, SalonEmotion, SalonEvent, SalonEventKind } from '../types.js';
import { CAST_IDS } from './cast.js';
import { SHELVES } from './shelves.js';
import { THEMES } from './themes.js';

/**
 * 座談の掛け合い。
 *
 * engine(investigate.ts)は「その日何が起きたか」だけを SalonEvent として返す。
 * 誰が、どんな感情で、何と言うかは、ここが決める。
 * engine はこのファイルを知らない — 依存は content → types のみで、
 * engine → content の向きは発生しない。
 *
 * 一往復(口火 → 受け)だけを返す。喋りすぎると軽くなるので、
 * 一日に起きたことのうち最も重要な一件だけを取り上げる
 * (優先度は engine 側で events の並びに反映済み)。
 */

/** 配列からランダムに一つ選ぶ関数。呼び出し側の Rng.pick をそのまま渡せる。 */
export type Picker = <T>(items: readonly T[]) => T;

type Role = 'lead' | 'follow';

/** イベントの種類ごとに、口火を切る感情と、それを受ける感情。 */
const EVENT_SCRIPT: Record<SalonEventKind, { lead: SalonEmotion; follow: SalonEmotion }> = {
  // 急所が見えた — 「そこを突ける」という意欲と、「それでいいのか」という葛藤の対
  weak: { lead: 'iyoku', follow: 'kattou' },
  // 耐性が見えた — 「もう固めている」という驚きと、その用意深さへの共感の対
  resist: { lead: 'odoroki', follow: 'kyoukan' },
  // 手応えの良い日が続いた — 驚きから、勢いに乗る意欲へ
  atari: { lead: 'odoroki', follow: 'iyoku' },
  // 空振りの日が続いた — 困惑を、誰かが意欲で押し返す
  stuck: { lead: 'konwaku', follow: 'iyoku' },
};

/** 各人がどの感情の口火・受けに向いているか。気質(temperament)を言葉にした重み。 */
const AFFINITY: Record<CharacterId, Partial<Record<SalonEmotion, number>>> = {
  hiiragi:   { iyoku: 1, kattou: 2, kyoukan: 1, konwaku: 1 },
  mochizuki: { kattou: 2, odoroki: 1, kyoukan: 2, konwaku: 2 },
  makabe:    { iyoku: 2, odoroki: 1, kattou: 0, konwaku: 0 },
  senou:     { iyoku: 1, kattou: 1, odoroki: 1, kyoukan: 1, konwaku: 2 },
  asakura:   { odoroki: 2, kyoukan: 2, iyoku: 1, kattou: 1, konwaku: 1 },
};

/**
 * {theme}/{shelf} を差し込むテンプレート。
 * 人物 × イベント種別 × 役割(口火/受け)ごとに、その場面専用の言い回しを持つ。
 * 同じ「驚き」でも、耐性判明への驚きと大当たりへの驚きは中身が違うので、
 * 感情だけでなく場面(kind)でも分けてある。
 */
const LINES: Record<CharacterId, Record<SalonEventKind, Partial<Record<Role, string[]>>>> = {
  hiiragi: {
    weak: {
      lead: [
        '「……{theme}か。もう、逃げ場はないでしょうね」',
        '「本を読めば、大抵のことは見えてくるものです」',
      ],
      follow: [
        '「……いや、それはね。突く前に、少し考えたほうがいい」',
        '「知ることと、裁くことは、同じではないんですよ」',
      ],
    },
    resist: {
      lead: ['「……これは、思ったより根が深い」'],
      follow: ['「わからなくはないんですよ、その気持ちは」'],
    },
    atari: {
      lead: ['「……今日はまた、随分と早く運んでくれましたね」'],
      follow: ['「……いや、それはね。運も実力のうちと言うでしょう」'],
    },
    stuck: {
      lead: ['「……今日は、収穫がなかったようですね」'],
      follow: ['「急ぐと、見えるものも見えなくなる。焦ることはありません」'],
    },
  },
  mochizuki: {
    weak: {
      lead: ['「あの……ここ、ちゃんと詰めれば、通ると思います」'],
      follow: [
        '「でも……ここまでやったら、あの人、後戻りできなくなりますよね」',
        '「正しさを指摘するのと、人を追い詰めるのは、違う気がして……」',
      ],
    },
    resist: {
      lead: [
        '「え……そこ、もう読み込まれてるんですか。早いですね」',
        '「あの、それ……思ったより、用意周到です」',
      ],
      follow: [
        '「その言い淀み方、わかる気がします。……たぶん、ですけど」',
        '「あの……私も、似たようなことで黙ったことがあります」',
      ],
    },
    atari: {
      lead: ['「あ……今日、思ったよりたくさん持ち帰ってきましたね」'],
      follow: ['「あの、こういう日は、油断しないほうがいいと思います、たぶん」'],
    },
    stuck: {
      lead: [
        '「うーん……何にも引っかからない日って、ありますよね」',
        '「あの、今日は、ちょっと空振りが続いてます……」',
      ],
      follow: ['「でも、まだ日はありますから……たぶん、大丈夫です」'],
    },
  },
  makabe: {
    weak: {
      lead: [
        '「{theme}だろ。そこ突けばいい、迷うことねえよ」',
        '「よし、名前は割れてる。あとはぶつけるだけだ」',
      ],
      follow: ['「……いや、待て。それでも、確かめてからだ」'],
    },
    resist: {
      lead: ['「マジかよ。{shelf}まで読んでやがる」', '「あの野郎、そこまで手を回してたのか」'],
      follow: ['「……まあ、必死だったんだろうよ、それは」'],
    },
    atari: {
      lead: ['「よし来た。今日はツイてるな」'],
      follow: ['「ツキだろうが何だろうが、持ち帰ったもんは本物だ」'],
    },
    stuck: {
      lead: ['「くそ、今日はどこ行っても駄目だったな」'],
      follow: ['「駄目なら場所変えりゃいいだろ。同じとこ突いてても仕方ねえ」'],
    },
  },
  senou: {
    weak: {
      lead: ['「うん、まあ……ここまで来たら、私も腹くくるよ」'],
      follow: [
        '「これ、突いたらこの町での商売、続けられるのかな、あの人」',
        '「うーん……正しいのはわかるけど、後味は悪いね、これ」',
      ],
    },
    resist: {
      lead: ['「え、もうそこ固めてるの。……甘くないね」'],
      follow: [
        '「わかるよ、それ。私も似たようなこと、しょっちゅうやってる」',
        '「うん、まあ……それ、私の口からは言えないやつなんだけどね」',
      ],
    },
    atari: {
      lead: ['「今日は、思ったより話が転がったね」'],
      follow: ['「うん、まあ……こういう日はこういう日で、油断は禁物だけどね」'],
    },
    stuck: {
      lead: ['「うーん……ここ数日、めぼしい話が出てこないね」'],
      follow: ['「うん、まあ……そういう日もあるよ。次、行こう」'],
    },
  },
  asakura: {
    weak: {
      lead: ['「うん、そこだね。私にもそう見えてた」'],
      follow: ['「……でも、それ言ったら、あの人の顔、変わっちゃうよ」'],
    },
    resist: {
      lead: [
        '「あ、もうそこ読んでる。……写真に出てた、その気配だ」',
        '「へえ。{shelf}、ね。目つきで、なんとなく分かってた」',
      ],
      follow: ['「わかるよ。あの目、知ってる」', '「うん……あの人、去年の秋から、笑い方が変わってるんだよね」'],
    },
    atari: {
      lead: ['「あ、今日は当たりだ。顔見てわかったよ」'],
      follow: ['「うん。こういう日は、大体そう」'],
    },
    stuck: {
      lead: ['「うーん、今日は何も見えなかったな」'],
      follow: ['「まあ、見えない日もあるよ。無理に見ようとしなくていい」'],
    },
  },
};

function fill(template: string, event: SalonEvent): string {
  return template
    .replace('{theme}', event.theme ? THEMES[event.theme].label : '')
    .replace('{shelf}', event.shelf ? SHELVES[event.shelf].label : '');
}

/** その感情に、誰が最も向いているか。出向いた者は少し口を開きやすい。 */
function pickSpeaker(
  emotion: SalonEmotion,
  excluding: CharacterId[],
  dayActors: CharacterId[],
  pick: Picker,
): CharacterId {
  const candidates = CAST_IDS.filter((c) => !excluding.includes(c));
  const scored = candidates.map((c) => ({
    who: c,
    score: (AFFINITY[c][emotion] ?? 0) + (dayActors.includes(c) ? 1 : 0),
  }));
  const max = Math.max(...scored.map((s) => s.score));
  const top = scored.filter((s) => s.score === max).map((s) => s.who);
  return pick(top);
}

function lineFor(who: CharacterId, kind: SalonEventKind, role: Role, event: SalonEvent, pick: Picker): string {
  const pool = LINES[who][kind][role] ?? ['……'];
  return fill(pick(pool), event);
}

export interface SalonLine {
  who: CharacterId;
  emotion: SalonEmotion;
  line: string;
}

/**
 * その日の座談を、一往復の掛け合いにする。
 * イベントが無ければ空配列(座談は毎日起きるわけではない)。
 * 複数起きた日は、events[0](engine 側で優先順に並べてある)だけを取り上げる。
 */
export function voiceSalon(
  events: SalonEvent[],
  dayActors: CharacterId[],
  pick: Picker,
): SalonLine[] {
  if (events.length === 0) return [];
  const event = events[0]!;
  const script = EVENT_SCRIPT[event.kind];

  const lead = pickSpeaker(script.lead, [], dayActors, pick);
  const follow = pickSpeaker(script.follow, [lead], dayActors, pick);

  return [
    { who: lead, emotion: script.lead, line: lineFor(lead, event.kind, 'lead', event, pick) },
    { who: follow, emotion: script.follow, line: lineFor(follow, event.kind, 'follow', event, pick) },
  ];
}
