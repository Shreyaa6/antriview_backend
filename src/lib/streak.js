function isSameDay(a, b) {
  return a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();
}

function isYesterday(date, today) {
  const y = new Date(today);
  y.setUTCDate(today.getUTCDate() - 1);
  return isSameDay(date, y);
}

export function computeStreak(currentStreak, lastSessionDate) {
  const today = new Date();
  if (!lastSessionDate) return 1;
  const last = new Date(lastSessionDate);
  if (isSameDay(last, today)) return Math.max(currentStreak, 1);
  if (isYesterday(last, today)) return currentStreak + 1;
  return 1;
}
