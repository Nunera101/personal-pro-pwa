const fs = require('fs');
const path = require('path');

// --- Fix app.js ---
const appPath = path.join(__dirname, 'app.js');
let app = fs.readFileSync(appPath, 'utf8');

// 1. Replace mojibakeReplacements with correct mappings (using Unicode escapes to avoid encoding issues)
const oldReplacements = /const mojibakeReplacements = \[[\s\S]*?\];/;
// Build the replacement string safely using Unicode escapes for special chars
const newReplacementsStr = [
  // lowercase Portuguese chars
  ['\\u00c3\\u00a3', '\\u00e3'], // Ã£ → ã
  ['\\u00c3\\u00a7', '\\u00e7'], // Ã§ → ç
  ['\\u00c3\\u00b5', '\\u00f5'], // Ãµ → õ
  ['\\u00c3\\u00a1', '\\u00e1'], // Ã¡ → á
  ['\\u00c3\\u00a9', '\\u00e9'], // Ã© → é
  ['\\u00c3\\u00aa', '\\u00ea'], // Ãª → ê
  ['\\u00c3\\u00ad', '\\u00ed'], // Ã­ → í
  ['\\u00c3\\u00b3', '\\u00f3'], // Ã³ → ó
  ['\\u00c3\\u00b4', '\\u00f4'], // Ã´ → ô
  ['\\u00c3\\u00ba', '\\u00fa'], // Ãº → ú
  ['\\u00c3\\u00a2', '\\u00e2'], // Ã¢ → â
  ['\\u00c3\\u00a0', '\\u00e0'], // Ã  → à
  ['\\u00c3\\u00a8', '\\u00e8'], // Ã¨ → è
  ['\\u00c3\\u00b9', '\\u00f9'], // Ã¹ → ù
  // uppercase Portuguese chars
  ['\\u00c3\\u0087', '\\u00c7'], // Ã‡ → Ç (0x87 = C1 control or Windows-1252 ‡)
  ['\\u00c3\\u0083', '\\u00c3'], // Ãƒ → Ã (0x83 = Windows-1252 ƒ)
  ['\\u00c3\\u0095', '\\u00d5'], // Ã• → Õ
  ['\\u00c3\\u0081', '\\u00c1'], // Ã→Á
  ['\\u00c3\\u0089', '\\u00c9'], // Ã‰ → É (0x89 = Windows-1252 ‰)
  ['\\u00c3\\u008a', '\\u00ca'], // ÃŠ → Ê
  ['\\u00c3\\u008d', '\\u00cd'], // Ã → Í
  ['\\u00c3\\u0093', '\\u00d3'], // Ã" → Ó
  ['\\u00c3\\u0094', '\\u00d4'], // Ã" → Ô
  ['\\u00c3\\u009a', '\\u00da'], // Ãš → Ú (0x9A = Windows-1252 š)
  ['\\u00c3\\u0082', '\\u00c2'], // Ã‚ → Â
  // other common
  ['\\u00c2\\u00b7', '\\u00b7'], // Â· → · (middle dot)
  ['\\u00e2\\u20ac\\u00a2', '\\u2022'], // â€¢ → • (bullet, Windows-1252 0x80=€ 0xa2=¢)
  ['\\u00e2\\u20ac\\u201d', '\\u2014'], // â€" → — (em dash, 0x94=")
  ['\\u00e2\\u20ac\\u201c', '\\u2013'], // â€" → – (en dash, 0x93=")
  ['\\u00e2\\u20ac\\u00a6', '\\u2026'], // â€¦ → … (ellipsis)
  ['\\u00e2\\u20ac\\u0153', '\\u201c'], // â€œ → " (left dquote, 0x93)
  ['\\u00e2\\u20ac\\u009d', '\\u201d'], // â€→" (right dquote, 0x9d)
  ['\\u00e2\\u20ac\\u02dc', '\\u2018'], // â€˜ → ' (left squote)
  ['\\u00e2\\u20ac\\u2122', '\\u2019'], // â€™ → ' (right squote / apostrophe)
].map(([from, to]) => `    ["\\u${from.slice(2).replace(/\\u/g, '\\u').replace(/\\\\/g, '\\')}", "\\u${to.slice(2).replace(/\\u/g, '\\u').replace(/\\\\/g, '\\')}"]`);

// Actually let's just build the array more simply
const entries = [
  // [from_codepoints, to_codepoint]
  [[0xc3, 0xa3], [0xe3]],  // ã
  [[0xc3, 0xa7], [0xe7]],  // ç
  [[0xc3, 0xb5], [0xf5]],  // õ
  [[0xc3, 0xa1], [0xe1]],  // á
  [[0xc3, 0xa9], [0xe9]],  // é
  [[0xc3, 0xaa], [0xea]],  // ê
  [[0xc3, 0xad], [0xed]],  // í
  [[0xc3, 0xb3], [0xf3]],  // ó
  [[0xc3, 0xb4], [0xf4]],  // ô
  [[0xc3, 0xba], [0xfa]],  // ú
  [[0xc3, 0xa2], [0xe2]],  // â
  [[0xc3, 0xa0], [0xe0]],  // à
  [[0xc3, 0xa8], [0xe8]],  // è
  [[0xc3, 0xb9], [0xf9]],  // ù
  [[0xc3, 0x83], [0xc3]],  // Ã (capital, garbled as Ãƒ)
  [[0xc3, 0x87], [0xc7]],  // Ç
  [[0xc3, 0x95], [0xd5]],  // Õ
  [[0xc3, 0x81], [0xc1]],  // Á
  [[0xc3, 0x89], [0xc9]],  // É
  [[0xc3, 0x8a], [0xca]],  // Ê
  [[0xc3, 0x8d], [0xcd]],  // Í
  [[0xc3, 0x93], [0xd3]],  // Ó
  [[0xc3, 0x94], [0xd4]],  // Ô
  [[0xc3, 0x9a], [0xda]],  // Ú
  [[0xc3, 0x82], [0xc2]],  // Â
  [[0xc2, 0xb7], [0xb7]],  // · (middle dot)
];

const toUEsc = (cps) => cps.map(cp => `\\u${cp.toString(16).padStart(4, '0')}`).join('');

const replacementLines = entries.map(([from, to]) =>
  `    ["${toUEsc(from)}", "${toUEsc(to)}"]`
).join(',\n');

const newReplacements = `const mojibakeReplacements = [\n${replacementLines}\n  ]`;

const matched = oldReplacements.test(app);
if (matched) {
  app = app.replace(oldReplacements, newReplacements);
  console.log('mojibakeReplacements: REPLACED');
} else {
  console.log('mojibakeReplacements: NOT FOUND');
}

// 2. Wrap managerContent.innerHTML with fixMojibake
const r1 = 'elements.managerContent.innerHTML = (renderers[state.managerMenu] || renderManagerHomeV2)();';
const r1new = 'elements.managerContent.innerHTML = fixMojibake((renderers[state.managerMenu] || renderManagerHomeV2)());';
if (app.includes(r1)) { app = app.replace(r1, r1new); console.log('managerContent: wrapped'); }
else console.log('managerContent: already wrapped or not found');

// 3. Wrap studentContent.innerHTML (two places)
const r2 = 'elements.studentContent.innerHTML = renderStudentContractGate(blockingContract);';
const r2new = 'elements.studentContent.innerHTML = fixMojibake(renderStudentContractGate(blockingContract));';
if (app.includes(r2)) { app = app.replace(r2, r2new); console.log('studentContent (contract gate): wrapped'); }

const r3 = 'elements.studentContent.innerHTML = (renderers[state.studentMenu] || renderStudentToday)();';
const r3new = 'elements.studentContent.innerHTML = fixMojibake((renderers[state.studentMenu] || renderStudentToday)());';
if (app.includes(r3)) { app = app.replace(r3, r3new); console.log('studentContent (main): wrapped'); }

// 4. Wrap modalBody.innerHTML (only the one with `body` variable)
const r4 = 'elements.modalBody.innerHTML = body;';
const r4new = 'elements.modalBody.innerHTML = fixMojibake(body);';
if (app.includes(r4)) { app = app.replace(r4, r4new); console.log('modalBody: wrapped'); }

// 5. Fix hardcoded garbled source strings using Buffer replacement (safer)
// Map: garbled UTF-8 source bytes → correct UTF-8 bytes
// Each entry: garbled chars in source (stored as UTF-8 multi-byte) → correct char
// We work directly on the bytes to be safe
let buf = Buffer.from(app, 'utf8');
const fixes = [
  // [garbled_utf8_bytes, correct_utf8_bytes]
  // Ã£ (C3 83 C2 A3) → ã (C3 A3)
  [[0xC3,0x83,0xC2,0xA3], [0xC3,0xA3]],
  // Ã§ (C3 83 C2 A7) → ç (C3 A7)
  [[0xC3,0x83,0xC2,0xA7], [0xC3,0xA7]],
  // Ãµ (C3 83 C2 B5) → õ (C3 B5)
  [[0xC3,0x83,0xC2,0xB5], [0xC3,0xB5]],
  // Ã¡ (C3 83 C2 A1) → á (C3 A1)
  [[0xC3,0x83,0xC2,0xA1], [0xC3,0xA1]],
  // Ã© (C3 83 C2 A9) → é (C3 A9)
  [[0xC3,0x83,0xC2,0xA9], [0xC3,0xA9]],
  // Ãª (C3 83 C2 AA) → ê (C3 AA)
  [[0xC3,0x83,0xC2,0xAA], [0xC3,0xAA]],
  // Ã­ (C3 83 C2 AD) → í (C3 AD)
  [[0xC3,0x83,0xC2,0xAD], [0xC3,0xAD]],
  // Ã³ (C3 83 C2 B3) → ó (C3 B3)
  [[0xC3,0x83,0xC2,0xB3], [0xC3,0xB3]],
  // Ã´ (C3 83 C2 B4) → ô (C3 B4)
  [[0xC3,0x83,0xC2,0xB4], [0xC3,0xB4]],
  // Ãº (C3 83 C2 BA) → ú (C3 BA)
  [[0xC3,0x83,0xC2,0xBA], [0xC3,0xBA]],
  // Ã¢ (C3 83 C2 A2) → â (C3 A2)
  [[0xC3,0x83,0xC2,0xA2], [0xC3,0xA2]],
  // Â· (C2 82 C2 B7) → · (C2 B7)  -- middle dot
  [[0xC2,0x82,0xC2,0xB7], [0xC2,0xB7]],
  // Â (C2 82) alone before non-special → handled by Â· above; skip standalone to avoid corruption
];

function replaceBytes(buffer, fromBytes, toBytes) {
  const from = Buffer.from(fromBytes);
  const to = Buffer.from(toBytes);
  let result = buffer;
  let totalReplaced = 0;
  let idx = 0;
  while (true) {
    idx = result.indexOf(from, idx);
    if (idx === -1) break;
    result = Buffer.concat([result.slice(0, idx), to, result.slice(idx + from.length)]);
    idx += to.length;
    totalReplaced++;
  }
  return [result, totalReplaced];
}

let totalFixes = 0;
for (const [fromBytes, toBytes] of fixes) {
  const [newBuf, count] = replaceBytes(buf, fromBytes, toBytes);
  buf = newBuf;
  if (count > 0) {
    console.log(`  Fixed ${count} occurrences of [${fromBytes.map(b=>b.toString(16)).join(',')}]`);
    totalFixes += count;
  }
}
console.log(`Total byte-level fixes in app.js: ${totalFixes}`);

fs.writeFileSync(appPath, buf);
console.log('app.js saved. Size:', buf.length, 'bytes');

// --- Fix sw.js cache version ---
const swPath = path.join(__dirname, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
if (sw.includes('personal-pro-pwa-v53')) {
  sw = sw.split('personal-pro-pwa-v53').join('personal-pro-pwa-v54');
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('sw.js: v53 → v54');
}

// --- Fix index.html version ---
const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace('content="53"', 'content="54"');
html = html.replace('styles.css?v=53', 'styles.css?v=54');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('index.html: version updated to 54');

console.log('\n=== Done! ===');
