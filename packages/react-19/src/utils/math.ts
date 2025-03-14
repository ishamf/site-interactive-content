/**
 * mod function that always return a result with the sign of the divisor
 */
export function flMod(numer: number, divisor: number) {
  let r = numer % divisor;
  if ((r > 0 && divisor < 0) || (r < 0 && divisor > 0)) {
    r = r + divisor;
  }
  return r;
}
