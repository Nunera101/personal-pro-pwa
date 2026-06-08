// utils: manipulação de strings

const mojibakeReplacements = [
  ["\u00e2\u20ac\u00a2", "\u2022"],  // bullet •
  ["\u00c2\u20ac\u00a2", "\u2022"],  // bullet variante
  ["\u00c2\u00b7", "\u00b7"],  // middle dot ·
  ["\u00e2\u20ac\u201c", "\u2013"],  // en dash –
  ["\u00e2\u20ac\u201d", "\u2014"],  // em dash —
  ["\u00e2\u20ac\u00a6", "\u2026"],  // ellipsis …
  ["\u00e2\u20ac\u02dc", "\u2018"],  // aspas simples esq
  ["\u00e2\u20ac\u2122", "\u2019"],  // aspas simples dir
  ["\u00e2\u20ac\u0153", "\u201c"],  // aspas duplas esq
  ["\u00e2\u20ac\u009d", "\u201d"],  // aspas duplas dir
  ["\u00e2\u2020\u2018", "\u2191"],  // seta cima ↑
  ["\u00e2\u2020\u201c", "\u2193"],  // seta baixo ↓
  ["\u00c3\u2021", "\u00c7"],  // Ç (0x87->U+2021)
  ["\u00c3\u00a7", "\u00e7"],  // ç
  ["\u00c3\u0192", "\u00c3"],  // Ã (0x83->U+0192)
  ["\u00c3\u00a3", "\u00e3"],  // ã
  ["\u00c3\u2022", "\u00d5"],  // Õ (0x95->U+2022)
  ["\u00c3\u00b5", "\u00f5"],  // õ
  ["\u00c3\u0081", "\u00c1"],  // Á (0x81)
  ["\u00c3\u00a1", "\u00e1"],  // á
  ["\u00c3\u2030", "\u00c9"],  // É (0x89->U+2030)
  ["\u00c3\u00a9", "\u00e9"],  // é
  ["\u00c3\u0160", "\u00ca"],  // Ê (0x8A->U+0160)
  ["\u00c3\u00aa", "\u00ea"],  // ê
  ["\u00c3\u008d", "\u00cd"],  // Í (0x8D)
  ["\u00c3\u00ad", "\u00ed"],  // í
  ["\u00c3\u201c", "\u00d3"],  // Ó (0x93->U+201C)
  ["\u00c3\u00b3", "\u00f3"],  // ó
  ["\u00c3\u201d", "\u00d4"],  // Ô (0x94->U+201D)
  ["\u00c3\u00b4", "\u00f4"],  // ô
  ["\u00c3\u0161", "\u00da"],  // Ú (0x9A->U+0161)
  ["\u00c3\u00ba", "\u00fa"],  // ú
  ["\u00c3\u201a", "\u00c2"],  // Â (0x82->U+201A)
  ["\u00c3\u00a2", "\u00e2"],  // â
  ["\u00c3\u00a0", "\u00e0"],  // à (0xA0 NBSP)
];

export function fixMojibake(value) {
  let output = String(value ?? "");
  mojibakeReplacements.forEach(([from, to]) => {
    output = output.split(from).join(to);
  });
  return output;
}

export function escapeHtml(value) {
  return fixMojibake(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function scrubVisibleText(root = document.body) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const fixed = fixMojibake(node.nodeValue || "");
    if (fixed !== node.nodeValue) node.nodeValue = fixed;
  });
  root.querySelectorAll?.("[placeholder], [aria-label], [title], input:not([type='hidden']), textarea, option").forEach((element) => {
    ["placeholder", "aria-label", "title"].forEach((attr) => {
      if (!element.hasAttribute?.(attr)) return;
      const current = element.getAttribute(attr) || "";
      const fixed = fixMojibake(current);
      if (fixed !== current) element.setAttribute(attr, fixed);
    });
    if (element.matches("input:not([type='hidden']), textarea")) {
      const fixed = fixMojibake(element.value || "");
      if (fixed !== element.value) element.value = fixed;
    }
  });
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function normalizeStringList(value) {
  const raw = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(raw.map((item) => String(item || "").trim()).filter(Boolean))];
}

export function normalizeFilterText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function shortName(name = "") {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function initialsFromName(name = "") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (parts.length ? `${parts[0][0] || ""}${parts[1]?.[0] || ""}` : "AS").toUpperCase();
}
