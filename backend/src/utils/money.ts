// Round to 2dp the same way the prototype's POS.format.money did, avoiding
// binary float artifacts like 19.999999999999996.
export function round2(amount: number): number {
  return Math.round((Number(amount) || 0) * 100) / 100;
}
