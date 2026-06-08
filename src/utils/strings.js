// utils: manipulação de strings

const mojibakeReplacements = [
  // 3-byte: caracteres especiais/pontuacao (bytes 0x80-0x9F via Windows-1252)
  ["â€¢", "•"],  // â€¢  → •
  ["Â€¢", "•"],  // Â€¢  → • (variante)
  ["Â·",       "·"],  // Â·   → ·
  ["â€“", "–"],  // â€"  → – (en dash)
  ["â€”", "—"],  // â€"  → — (em dash)
  ["â€¦", "…"],  // â€¦  → …
  ["â€˜", "‘"],  // â€˜  → '
  ["â€™", "’"],  // â€™  → '
  ["â€œ", "“"],  // â€œ  → "
  ["â€", "”"],  // â€   → "
  // Setas — 0x86→U+2020 (†), 0x91→U+2018 ('), 0x93→U+201C (")
  ["â†‘", "↑"],  // â†'  → ↑
  ["â†“", "↓"],  // â†"  → ↓
  // 2-byte UTF-8 com byte 0x80-0x9F (Windows-1252):
  ["Ã‡", "Ç"],  // Ã‡  → Ç  (0x87→U+2021 ‡)
  ["Ã§", "ç"],  // Ã§  → ç
  ["Ãƒ", "Ã"],  // Ãƒ  → Ã  (0x83→U+0192 ƒ)
  ["Ã£", "ã"],  // Ã£  → ã
  ["Ã•", "Õ"],  // Ã•  → Õ  (0x95→U+2022 •)
  ["Ãµ", "õ"],  // Ãµ  → õ
  ["Ã", "Á"],  // Ã   → Á  (0x81 igual W1252)
  ["Ã¡", "á"],  // Ã¡  → á
  ["Ã‰", "É"],  // Ã‰  → É  (0x89→U+2030 ‰)
  ["Ã©", "é"],  // Ã©  → é
  ["ÃŠ", "Ê"],  // ÃŠ  → Ê  (0x8A→U+0160 Š)
  ["Ãª", "ê"],  // Ãª  → ê
  ["Ã", "Í"],  // Ã   → Í  (0x8D igual W1252)
  ["Ã­", "í"],  // Ã­  → í
  ["Ã“", "Ó"],  // Ã"  → Ó  (0x93→U+201C ")
  ["Ã³", "ó"],  // Ã³  → ó
  ["Ã”", "Ô"],  // Ã"  → Ô  (0x94→U+201D ")
  ["Ã´", "ô"],  // Ã´  → ô
  ["Ãš", "Ú"],  // Ãš  → Ú  (0x9A→U+0161 š)
  ["Ãº", "ú"],  // Ãº  → ú
  ["Ã‚", "Â"],  // Ã‚  → Â  (0x82→U+201A ‚)
  ["Ã¢", "â"],  // Ã¢  → â
  ["Ã ", "à"],  // Ã   → à  (0xA0 NBSP)
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
    .replace(/[\u0300-\u036f]/g, "")
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