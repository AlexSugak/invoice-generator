export const currencyFormatter = (currency?: string) => {
  const code = currency || 'USD';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 2,
  });
};

export function money(n: number) {
  if (!isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}
