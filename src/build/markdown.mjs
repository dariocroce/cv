/**
 * Parser Markdown minimale per i contenuti del portfolio (nessuna dipendenza).
 *
 * Supporta:
 *   - front matter "chiave: valore" tra due righe "---" (le righe che iniziano con # sono commenti)
 *   - titoli: ## sezione, ### gruppo di attività, #### sottotitolo
 *   - paragrafi, elenchi puntati (- …) e numerati (1. …), citazioni (> …)
 *   - immagini su una riga: ![testo alternativo](assets/img/… "didascalia")
 *   - blocchi ```flow e ```structure per i diagrammi di processo
 *   - inline: **grassetto**, *corsivo*, `codice`, [testo](url), [testo](project:slug), [testo](tool:id)
 *   - paragrafi speciali: "TODO: …" (segnaposto) e "BOZZA: …" (testo da validare)
 *   - commenti <!-- … --> (ignorati)
 */

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Legge il front matter e restituisce { data, body }. */
export function parseFrontMatter(source, file) {
  const text = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const match = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(text);
  if (!match) throw new Error(`${file}: manca il front matter iniziale (blocco tra due righe ---).`);
  const data = {};
  match[1].split('\n').forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    const colon = line.indexOf(':');
    if (colon < 1) throw new Error(`${file}: riga ${index + 2} del front matter non valida → "${line}"`);
    data[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  });
  return { data, body: text.slice(match[0].length) };
}

const LIST_ITEM = /^\s*[-*]\s+/;
const ORDERED_ITEM = /^\s*\d+[.)]\s+/;
const RULE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const STARTS_BLOCK = /^(?:#{1,6}\s|```|>)/;

/** Divide il testo Markdown in blocchi. */
export function parseBlocks(markdown) {
  const lines = markdown
    .replace(/\r\n?/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .split('\n');
  const blocks = [];
  let i = 0;

  const collectList = (pattern) => {
    const items = [];
    while (i < lines.length && pattern.test(lines[i])) {
      let item = lines[i].replace(pattern, '');
      i += 1;
      while (
        i < lines.length &&
        /^\s{2,}\S/.test(lines[i]) &&
        !LIST_ITEM.test(lines[i]) &&
        !ORDERED_ITEM.test(lines[i])
      ) {
        item += ` ${lines[i].trim()}`;
        i += 1;
      }
      items.push(item.trim());
    }
    return items;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = /^```\s*([\w-]*)\s*$/.exec(line);
    if (fence) {
      const buffer = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      if (i >= lines.length) throw new Error('blocco ``` non chiuso');
      i += 1;
      blocks.push({ type: 'fence', lang: fence[1].toLowerCase(), text: buffer.join('\n') });
      continue;
    }

    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2].trim() });
      i += 1;
      continue;
    }

    if (RULE.test(line)) {
      i += 1;
      continue;
    }

    if (LIST_ITEM.test(line)) {
      blocks.push({ type: 'ul', items: collectList(LIST_ITEM) });
      continue;
    }

    if (ORDERED_ITEM.test(line)) {
      blocks.push({ type: 'ol', items: collectList(ORDERED_ITEM) });
      continue;
    }

    if (/^>/.test(line)) {
      const buffer = [];
      while (i < lines.length && /^>/.test(lines[i])) {
        buffer.push(lines[i].replace(/^>\s?/, '').trim());
        i += 1;
      }
      blocks.push({ type: 'quote', text: buffer.join(' ').trim() });
      continue;
    }

    const buffer = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !STARTS_BLOCK.test(lines[i]) &&
      !LIST_ITEM.test(lines[i]) &&
      !ORDERED_ITEM.test(lines[i]) &&
      !RULE.test(lines[i])
    ) {
      buffer.push(lines[i].trim());
      i += 1;
    }
    if (!buffer.length) {
      buffer.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: 'p', text: buffer.join(' ') });
  }

  return blocks;
}

/** Converte la formattazione inline in HTML (il testo viene sempre "escapato"). */
export function renderInline(text, resolveHref = (href) => href) {
  const codes = [];
  let out = String(text ?? '').replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });
  out = out.replace(/(\p{L})'(?=\p{L})/gu, '$1’'); // apostrofo tipografico: dell'esperienza → dell’esperienza
  out = escapeHtml(out);
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_, label, href) => `<a href="${escapeHtml(resolveHref(decodeEntities(href)))}">${label}</a>`,
  );
  out = out.replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^\w*])\*(?=\S)(.+?)(?<=\S)\*(?![\w*])/g, '$1<em>$2</em>');
  out = out.replace(/\u0000(\d+)\u0000/g, (_, n) => `<code>${escapeHtml(codes[Number(n)])}</code>`);
  return out;
}

/**
 * Diagrammi: una riga per elemento.
 *   caption: Didascalia del diagramma
 *   base: Base comune (solo per ```structure)
 *   - Etichetta | nota facoltativa
 *   [ Etichetta del gruppo        ← apre un gruppo (solo per ```flow)
 *   ]                             ← chiude il gruppo
 */
export function parseDiagram(text) {
  const diagram = { caption: '', base: '', items: [] };
  let group = null;
  text.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    let match;
    if ((match = /^caption:\s*(.+)$/i.exec(line))) {
      diagram.caption = match[1].trim();
      return;
    }
    if ((match = /^base:\s*(.+)$/i.exec(line))) {
      diagram.base = match[1].trim();
      return;
    }
    if ((match = /^\[\s*(.+)$/.exec(line))) {
      group = { type: 'group', label: match[1].trim(), items: [] };
      diagram.items.push(group);
      return;
    }
    if (line === ']') {
      group = null;
      return;
    }
    if ((match = /^[-*]\s+(.+)$/.exec(line))) {
      const [label, ...note] = match[1].split('|');
      const step = { type: 'step', label: label.trim(), note: note.join('|').trim() };
      (group ? group.items : diagram.items).push(step);
      return;
    }
    throw new Error(`riga non riconosciuta nel diagramma → "${line}"`);
  });
  if (!diagram.items.length) throw new Error('diagramma vuoto');
  return diagram;
}
