import type { Case } from '../../types.js';
import { SEKKOZO } from './sekkozo.js';
import { SEIBO } from './seibo.js';
import { TSUMITATE } from './tsumitate.js';
import { KOHO } from './koho.js';
import { SHINYO } from './shinyo.js';
import { TERAJINJA } from './terajinja.js';
import { FURIN } from './furin.js';
import { NOKYO } from './nokyo.js';
import { RAKUGAKI } from './rakugaki.js';
import { KAIRAN } from './kairan.js';
import { KAWARA } from './kawara.js';
import { HANABI } from './hanabi.js';
import { YADO } from './yado.js';
import { KATAGAKI } from './katagaki.js';
import { SOUZOKU } from './souzoku.js';

/**
 * 手書きの事件。
 *
 * それぞれ鍵になる棚が違うように作ってある:
 *   消えた石膏像   … 技芸・勘定・人心。奥の棚は不要
 *   歳暮の行方     … 勘定・土地。層2で分類の物語を崩す
 *   祭りの積立     … 土地の棚が耐性になる変化球
 *   広報の一枚     … 編集の棚が主役。趣味の棚には耐性
 *   信用の担保     … 層3。奥の棚なしでは崩せない
 *
 * ── 身近な醜聞を増補(お金以外の出口を増やす) ──
 *   宮の総代       … 寺と神社。継承と権威。勘定・理法・土地
 *   二人の距離     … 不倫の噂。見ることと名づけ。趣味・人心
 *   直売所の棚     … 農協と若手。権威と境界。数字・勘定
 *   壁の落書き     … 若者への決めつけ。記録と視線。物証・理法
 *   回覧板         … 移住者への線引き。境界と交換。勘定・世間
 *   河原の煙       … BBQと焼き鳥。分類の物語。理法・物証
 *   花火の後       … 大会のゴミと会計。代理と信任。勘定
 *   宿の評判       … 口コミ自作自演。分類と告白。数字・言葉
 *   肩書きの棚卸し … 経歴詐称。席と人。言葉・世間
 *   実家の鍵       … 相続争い。層2で沈黙・来歴の奥の棚が効く
 */
export const CASES: Case[] = [
  SEKKOZO, SEIBO, TSUMITATE, KOHO, SHINYO,
  TERAJINJA, FURIN, NOKYO, RAKUGAKI, KAIRAN,
  KAWARA, HANABI, YADO, KATAGAKI, SOUZOKU,
];

export {
  SEKKOZO, SEIBO, TSUMITATE, KOHO, SHINYO,
  TERAJINJA, FURIN, NOKYO, RAKUGAKI, KAIRAN,
  KAWARA, HANABI, YADO, KATAGAKI, SOUZOKU,
};
