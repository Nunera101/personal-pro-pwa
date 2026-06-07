// utils: manipulação de datas

export function todayISO() {
  return toISODate(new Date());
}

export function toISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseISODate(isoDate) {
  const [year, month, day] = String(isoDate || todayISO()).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(isoDate, amount) {
  const date = parseISODate(isoDate);
  date.setDate(date.getDate() + amount);
  return toISODate(date);
}

export function addMonths(isoDate, amount) {
  const date = parseISODate(isoDate);
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  return toISODate(date);
}

export function startOfWeek(isoDate) {
  const date = parseISODate(isoDate);
  const diff = date.getDay() === 0 ? -6 : 1 - date.getDay();
  date.setDate(date.getDate() + diff);
  return toISODate(date);
}

export function startOfMonth(isoDate) {
  const date = parseISODate(isoDate);
  date.setDate(1);
  return toISODate(date);
}

export function monthLabel(isoDate) {
  return parseISODate(isoDate).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export function calendarMonthDays(isoDate) {
  const firstDay = startOfWeek(startOfMonth(isoDate));
  return Array.from({ length: 42 }, (_, index) => addDays(firstDay, index));
}

export function formatDate(isoDate) {
  return parseISODate(isoDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" });
}

export function formatLongDate(isoDate) {
  return parseISODate(isoDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", weekday: "long" });
}

export function formatShortDate(isoDate) {
  return parseISODate(isoDate).toLocaleDateString("pt-BR");
}

export function dayName(isoDate) {
  return parseISODate(isoDate).toLocaleDateString("pt-BR", { weekday: "long" });
}

export function isSameDay(isoDateTime, isoDate) {
  return String(isoDateTime || "").slice(0, 10) === isoDate;
}

export function daysBetween(startDate, endDate) {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  return Math.max(0, Math.round((end - start) / 86400000));
}
