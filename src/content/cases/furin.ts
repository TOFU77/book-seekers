import type { Case } from '../../types.js';

/**
 * 事件「二人の距離」
 *
 * 不倫の噂。崩す相手は当事者ではなく、噂の火元。
 * 一枚の写真に「そういう距離」という名前をつけた者を、
 * 見ることと名づけの主題で崩す。鍵になる棚: 趣味(写真)・人心・理法。
 */
export const FURIN: Case = {
  id: 'furin',
  title: '二人の距離',
  hook: '小学校のPTAで、役員の女性と別の保護者の男性が「できている」という噂。' +
    '発端は運動会で撮られた一枚の写真らしい、と常連が困り顔で持ち込んだ。',
  voices: [
    { who: '噂を聞いた保護者', line: '写真、見ました? あれはもう、そういう距離ですよ。' },
    { who: '当の女性の友人', line: 'あの二人、係が同じなだけ。でも、そう言っても誰も聞かない。' },
    { who: '写真を撮った父親', line: '撮っただけです。まさか、こんなことになるなんて。' },
    { who: '滝川本人', line: '火のない所に煙は立たないでしょう。私はただ、見たままを言っただけ。' },
  ],
  layers: [
    {
      depth: 1,
      title: '噂の火元',
      turns: 8,
      epigraph: {
        text: '名前が先につくと、事実のほうが後から呼び出される。',
        source: '分類と名づけ',
      },
      resolution: [
        '滝川は言葉を取り消しはしなかった。',
        'ただ、例の写真を並べたとき、同じ距離で写っている人が他に三人いることには、何も言えなくなった。',
        '一枚の写真は距離を写す。だが、その距離に名前をつけたのは、レンズではなく見た者のほうだった。',
      ],
      failure: [
        '「じゃあ、あの二人が潔白だと証明できるの?」と滝川は言った。',
        'ないことの証明を求められた時点で、こちらはもう同じ土俵に乗せられていた。',
      ],
      opponent: {
        name: '滝川',
        role: 'PTA 副会長',
        justification:
          '見た人が何人もいる。噂になるということは、何かあるということだ。' +
          '私はありもしないことを言ったわけじゃない。見えたものを見えたと言って、なぜ責められるのか。',
        triggers: [
          '見たままを言って責められるとき',
          '自分だけが悪者にされるとき',
          '「証拠がない」と一蹴されるとき',
        ],
      },
      logical: {
        kind: 'ronri',
        hardness: 20,
        // 摩擦点: 見ることと見られること(同じ距離に写る他の三人)
        weakThemes: ['shisen', 'bunrui'],
        resistantShelves: ['seken'],
      },
      psych: {
        kind: 'shinri',
        hardness: 30,
        // 摩擦点: 分類と名づけ(名前が先につき、事実が後から呼ばれる)
        weakThemes: ['bunrui', 'shisen'],
        resistantShelves: ['monogatari'],
      },
      notebook: [
        { id: 'f-shashin', label: '問題になった運動会の一枚', kind: 'dogu', certainty: 3, shelf: 'shumi' },
        { id: 'f-hoka', label: '同じ構図で写った別の三枚', kind: 'dogu', certainty: 2, shelf: 'shumi' },
        { id: 'f-kakari', label: 'PTAの係分担表', kind: 'shoko', certainty: 2, shelf: 'riho' },
        { id: 'f-tomo', label: '「係が同じなだけ」と言う友人', kind: 'shogen', certainty: 2, shelf: 'jinshin' },
        { id: 'f-line', label: '取り消された連絡網の書き込み', kind: 'shoko', certainty: 1, shelf: 'kotoba' },
        { id: 'f-kensaku', label: '検索で出た名誉毀損の成立要件', kind: 'sokuseki', certainty: 2, shelf: 'riho' },
      ],
      days: 4,
      locations: [
        { id: 'undokai', label: '運動会の写真データ', kind: 'genba', yields: ['f-shashin', 'f-hoka'], insight: 0 },
        { id: 'ptaroom', label: 'PTAの資料室', kind: 'kiroku', yields: ['f-kakari', 'f-kensaku'], insight: 0 },
        { id: 'tomodachi', label: '女性の友人', kind: 'hito', yields: ['f-tomo', 'f-line'], insight: 2 },
        { id: 'takigawa', label: '滝川本人', kind: 'honnin', yields: [], insight: 2 },
      ],
      pushes: 'asakura',
      holds: 'mochizuki',
    },
  ],
};
