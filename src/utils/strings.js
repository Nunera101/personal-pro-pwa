// utils: manipulação de strings

const mojibakeReplacements = [
  ["\u00c2\u20ac\u00a2", "â€¢"],
  ["\u00e2\u20ac\u00a2", "â€¢"],
  ["\u00c2\u00b7", "Â·"],
  ["\u00e2\u20ac\u201c", "-"],
  ["\u00e2\u20ac\u201d", "-"],
  ["\u00e2\u20ac\u00a6", "..."],
  ["\u00e2\u20ac\u02dc", "'"],
  ["\u00e2\u20ac\u2122", "'"],
  ["\u00e2\u20ac\u0153", "\""],
  ["\u00e2\u20ac\u009d", "\""],
  ["\u00c3\u0087", "Ã‡"],
  ["\u00c3\u00a7", "Ã§"],
  ["\u00c3\u0083", "Ãƒ"],
  ["\u00c3\u00a3", "Ã£"],
  ["\u00c3\u0095", "Ã•"],
  ["\u00c3\u00b5", "Ãµ"],
  ["\u00c3\u0081", "Ã"],
  ["\u00c3\u00a1", "Ã¡"],
  ["\u00c3\u0089", "Ã‰"],
  ["\u00c3\u00a9", "Ã©"],
  ["\u00c3\u008a", "ÃŠ"],
  ["\u00c3\u00aa", "Ãª"],
  ["\u00c3\u008d", "Ã"],
  ["\u00c3\u00ad", "Ã­"],
  ["\u00c3\u0093", "Ã“"],
  ["\u00c3\u00b3", "Ã³"],
  ["\u00c3\u0094", "Ã”"],
  ["\u00c3\u00b4", "Ã´"],
  ["\u00c3\u009a", "Ãš"],
  ["\u00c3\u00ba", "Ãº"],
  ["\u00c3\u0082", "Ã‚"],
  ["\u00c3\u00a2", "Ã¢"]
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
    .replace(/Ã§/g, "c")
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