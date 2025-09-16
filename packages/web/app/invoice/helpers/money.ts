export function money(n: number) {
    if (!isFinite(n)) return 0;
    return Math.round(n * 100) / 100;
  }