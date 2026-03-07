export function formatHourHelsinki(value: string): string {
  return new Intl.DateTimeFormat('fi-FI', {
    timeZone: 'Europe/Helsinki',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .format(new Date(value))
    .replace('.', ':');
}
