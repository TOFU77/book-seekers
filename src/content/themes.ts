import type { Theme, ThemeId } from '../types.js';

/**
 * 主題は10種。棚をまたぐシナジーの成立条件であり、
 * 同時に犯人の自己正当化と接続する手がかりでもある。
 *
 * 増やしすぎると「どれかは必ず共有している」状態になり、
 * 棚またぎの成立が安くなる。10前後を上限とする。
 */
export const THEMES: Record<ThemeId, Theme> = {
  dairi: {
    id: 'dairi',
    label: '代理と信任',
    note: '他人のために動く者は、どこまで自分の裁量を許されるのか',
  },
  kyokai: {
    id: 'kyokai',
    label: '境界と逸脱',
    note: '線はどこに引かれ、誰が引き、いつ引き直されたのか',
  },
  kiroku: {
    id: 'kiroku',
    label: '記録と忘却',
    note: '残されたものと、残されなかったもののどちらが多いか',
  },
  kokan: {
    id: 'kokan',
    label: '交換と贈与',
    note: '見返りのある贈り物は、贈り物と呼べるのか',
  },
  kenri: {
    id: 'kenri',
    label: '権威と正統',
    note: 'その人が正しいのか、その席が正しいのか',
  },
  bunrui: {
    id: 'bunrui',
    label: '分類と名づけ',
    note: '名前が先にあったのか、事実が先にあったのか',
  },
  shisen: {
    id: 'shisen',
    label: '見ることと見られること',
    note: '見られていると知ったとき、人の振る舞いは何に変わるか',
  },
  keisho: {
    id: 'keisho',
    label: '継承と断絶',
    note: '受け継いだものを変えることは、裏切りなのか',
  },
  kajo: {
    id: 'kajo',
    label: '過剰と欠乏',
    note: '足りないから取るのか、有り余るから取るのか',
  },
  kokuhaku: {
    id: 'kokuhaku',
    label: '沈黙と告白',
    note: '語らないことは、嘘をつくこととどう違うのか',
  },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];
