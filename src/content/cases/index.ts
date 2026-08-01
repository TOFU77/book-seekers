import type { Case } from '../../types.js';
import { SEKKOZO } from './sekkozo.js';
import { SEIBO } from './seibo.js';
import { TSUMITATE } from './tsumitate.js';
import { KOHO } from './koho.js';
import { SHINYO } from './shinyo.js';

/**
 * 手書きの事件5本。
 *
 * それぞれ鍵になる棚が違うように作ってある:
 *   消えた石膏像 … 技芸・勘定・人心。奥の棚は不要
 *   歳暮の行方   … 勘定・土地。層2で分類の物語を崩す
 *   祭りの積立   … 土地の棚が耐性になる変化球
 *   広報の一枚   … 編集の棚が主役。趣味の棚には耐性
 *   信用の担保   … 層3。奥の棚なしでは崩せない
 */
export const CASES: Case[] = [SEKKOZO, SEIBO, TSUMITATE, KOHO, SHINYO];

export { SEKKOZO, SEIBO, TSUMITATE, KOHO, SHINYO };
