/**
 * startDate（"YYYY-MM-DD"）に days 日加算した日付文字列を返す（UTC 基準）
 */
export function addDays(startDate: string, days: number): string {
  const [year, month, day] = startDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
