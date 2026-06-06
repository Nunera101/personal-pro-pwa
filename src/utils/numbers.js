// utils: manipulação de números e valores monetários

export function numberValue(value) {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(size < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

export function moneyValue(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const clean = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function currencyValue(value) {
  return moneyValue(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function currencyExact(value) {
  return moneyValue(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseWeight(value) {
  if (value === null || value === undefined || value === "") return NaN;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function formatWeight(value) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: Math.abs(value % 1) > 0 ? 1 : 0, maximumFractionDigits: 1 })} kg`;
}
