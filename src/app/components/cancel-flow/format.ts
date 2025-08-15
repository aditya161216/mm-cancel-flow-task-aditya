export function formatCents(c: number) {
  return `$${(c / 100).toFixed(2)}`;
}