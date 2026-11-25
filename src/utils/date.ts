const pad = (n: number) => String(n).padStart(2, '0')

/** Formats a Date as a local-time `YYYY-MM-DD` string. */
export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayString(): string {
  return toDateString(new Date())
}

function parseDateString(value: string): Date {
  const [y = 0, m = 1, d = 1] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function shiftDate(value: string, days: number): string {
  const date = parseDateString(value)
  date.setDate(date.getDate() + days)
  return toDateString(date)
}

/** True when `value` (YYYY-MM-DD) is after today in local time. */
export function isFutureDate(value: string): boolean {
  return value > todayString()
}

export function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function formatDateLabel(value: string): string {
  const today = todayString()
  if (value === today) return 'Today'
  if (value === shiftDate(today, -1)) return 'Yesterday'
  if (value === shiftDate(today, 1)) return 'Tomorrow'
  return parseDateString(value).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}
