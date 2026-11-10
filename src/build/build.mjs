/**
 * Build del portfolio (Node ≥ 18, nessuna dipendenza esterna).
 *
 *   npm run build   →  rigenera il sito statico in docs/
 *
 * Legge:   content/site.json · content/categories.json · content/tools.json · content/progetti/*.md
 *          src/styles/*.css · src/scripts/main.js · src/static/**
 * Scrive:  docs/ (sito pubblicabile con GitHub Pages) e CONTENUTI-DA-COMPLETARE.md
 */
import { readFile, writeFile, mkdir, readdir, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseFrontMatter, parseBlocks } from './markdown.mjs';
import { createRenderer, SECTIONS, isTodo } from './templates.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = {
  content: path.join(ROOT, 'content'),
  projects: path.join(ROOT, 'content', 'progetti'),
  styles: path.join(ROOT, 'src', 'styles'),
  scripts: path.join(ROOT, 'src', 'scripts'),
  static: path.join(ROOT, 'src', 'static'),
  out: path.join(ROOT, 'docs'),
};
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const normalize = (value) =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const slugify = (value) => normalize(value).replace(/\s+/g, '-');
const splitList = (value) =>
  value && !isTodo(value)
    ? value
        .split(/\s*[,·]\s*/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
const hash = (value) => createHash('sha256').update(value).digest('hex').slice(0, 10);

async function readJson(relative) {
  const file = path.join(ROOT, relative);
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    throw new Error(`${relative}: ${error.message}`);
  }
}

async function writeOut(relative, content) {
  const file = path.join(DIR.out, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

/* Contenuti ----------------------------------------------------------------- */

function splitSections(blocks, source) {
  const sections = {};
  const allowed = new Map(SECTIONS.map((section) => [section.id, section]));
  let current = null;
  for (const block of blocks) {
    if (block.type === 'heading' && block.level === 1) {
      throw new Error(`${source}: non usare titoli "# " nel testo: il titolo del progetto è nel front matter (title).`);
    }
    if (block.type === 'heading' && block.level === 2) {
      const id = normalize(block.text).replace(/^\d+\s*/, '');
      if (!allowed.has(id)) {
        throw new Error(
          `${source}: sezione "## ${block.text}" non riconosciuta. Sezioni ammesse: ${SECTIONS.map((s) => s.title).join(', ')}.`,
        );
      }
      current = id;
      sections[id] = sections[id] || [];
      continue;
    }
    if (!current) throw new Error(`${source}: c'è del testo prima della prima sezione "## …".`);
    sections[current].push(block);
  }
  return sections;
}

async function loadProjects(categories) {
  const files = (await readdir(DIR.projects)).filter((file) => file.endsWith('.md') && !file.startsWith('_')).sort();
  const projects = [];
  for (const file of files) {
    const source = `content/progetti/${file}`;
    const { data, body } = parseFrontMatter(await readFile(path.join(DIR.projects, file), 'utf8'), source);
    const slug = data.slug || file.replace(/\.md$/, '');
    if (!SLUG.test(slug)) throw new Error(`${source}: slug "${slug}" non valido (solo minuscole, numeri e trattini).`);
    if (!data.title) throw new Error(`${source}: il campo "title" è obbligatorio.`);
    const category = categories.find((cat) => cat.id === data.category);
    if (!category) {
      throw new Error(`${source}: categoria "${data.category}" inesistente. Valori ammessi: ${categories.map((c) => c.id).join(', ')}.`);
    }
    let blocks;
    try {
      blocks = parseBlocks(body);
    } catch (error) {
      throw new Error(`${source}: ${error.message}`);
    }
    projects.push({
      source,
      slug,
      title: data.title,
      titleLang: data.titleLang || '',
      category,
      order: Number.parseFloat(data.order) || 999,
      published: data.published !== 'false',
      featured: data.featured === 'true',
      role: data.role || '',
      scope: data.scope || '',
      summary: data.summary || 'TODO',
      technologies: splitList(data.technologies),
      competencies: splitList(data.competencies),
      related: splitList(data.related),
      omit: splitList(data.omit).map(normalize),
      sections: splitSections(blocks, source),
    });
  }
  const seen = new Set();
  for (const p of projects) {
    if (seen.has(p.slug)) throw new Error(`Slug duplicato: "${p.slug}".`);
    seen.add(p.slug);
  }
  const position = new Map(categories.map((cat, index) => [cat.id, index]));
  projects.sort(
    (a, b) => position.get(a.category.id) - position.get(b.category.id) || a.order - b.order || a.title.localeCompare(b.title, 'it'),
  );
  return projects;
}

/** Collega gli strumenti ai progetti pubblicati che li citano in "technologies". */
function linkTools(toolsData, projects) {
  const lookup = new Map();
  const groups = toolsData.groups.map((group) => ({
    ...group,
    tools: group.tools.map((entry) => {
      const tool = { ...entry, id: entry.id || slugify(entry.name), projects: [] };
      for (const key of [entry.name, ...(entry.aliases || [])]) lookup.set(normalize(key), tool);
      return tool;
    }),
  }));
  for (const p of projects) {
    p.techLinks = p.technologies.map((name) => ({ name, tool: lookup.get(normalize(name)) || null }));
    if (!p.published) continue;
    for (const { tool } of p.techLinks) if (tool && !tool.projects.includes(p)) tool.projects.push(p);
  }
  return groups;
}

/* File di servizio ------------------------------------------------------------ */

function sitemap(siteUrl, pages, today) {
  const urls = pages
    .map((page) => `  <url>\n    <loc>${siteUrl}/${page.path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generato da npm run build. Contiene solo le pagine senza segnaposto. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function robots(siteUrl) {
  return `# Generato da npm run build.
# Nota: i crawler leggono robots.txt solo alla radice del dominio
# (dominio personalizzato o sito utente username.github.io).
User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
}

function report({ pages, projects, today }) {
  const titles = new Map(projects.map((p) => [p.source, `${p.title}${p.published ? '' : ' (non pubblicato)'}`]));
  const order = ['content/site.json', 'content/categories.json', 'content/tools.json', ...projects.map((p) => p.source)];
  const labels = {
    'content/site.json': 'Impostazioni generali e contatti',
    'content/categories.json': 'Aree',
    'content/tools.json': 'Tools & Technologies',
  };
  const bySource = new Map();
  for (const page of pages) {
    if (page.file === '404.html') continue;
    for (const issue of page.issues) {
      const key = issue.source || 'altro';
      if (!bySource.has(key)) bySource.set(key, new Map());
      const id = `${issue.type}|${issue.where}`;
      if (!bySource.get(key).has(id)) bySource.get(key).set(id, issue);
    }
  }
  const lines = [
    '# Contenuti da completare',
    '',
    `Elenco generato automaticamente da \`npm run build\` il ${today}: si aggiorna a ogni build, non va modificato a mano.`,
    '',
    'Ogni voce indica il file da modificare. Le pagine che contengono ancora segnaposto o bozze vengono pubblicate con `noindex` e restano fuori da `sitemap.xml`.',
    '',
  ];
  let total = 0;
  for (const source of order) {
    const issues = bySource.get(source);
    if (!issues || !issues.size) continue;
    lines.push(`## ${labels[source] || titles.get(source) || source}`, '', `File: \`${source}\``, '');
    for (const issue of issues.values()) {
      total += 1;
      const kind = issue.type === 'draft' ? ' _(bozza da validare)_' : '';
      lines.push(`- [ ] **${issue.where}**${kind} — ${issue.text}`);
    }
    lines.push('');
  }
  if (!total) lines.push('Nessun contenuto da completare.', '');
  lines.push('## Stato di indicizzazione', '', '| Pagina | Stato |', '| --- | --- |');
  for (const page of pages) {
    if (page.file === '404.html') continue;
    lines.push(`| \`/${page.path}\` | ${page.indexable ? 'indicizzabile (in sitemap)' : 'noindex finché restano segnaposto'} |`);
  }
  lines.push('');
  return { text: lines.join('\n'), total };
}

/* Build ------------------------------------------------------------------------- */

async function main() {
  const started = Date.now();
  const site = await readJson('content/site.json');
  const categories = await readJson('content/categories.json');
  const toolsData = await readJson('content/tools.json');
  // Anteprima locale con un indirizzo diverso: SITE_URL=http://localhost:8080 npm run build
  if (process.env.SITE_URL) site.siteUrl = process.env.SITE_URL;

  if (!site.siteUrl || !/^https?:\/\//.test(site.siteUrl)) throw new Error('content/site.json: "siteUrl" deve essere un URL assoluto.');
  for (const cat of categories) if (!SLUG.test(cat.id)) throw new Error(`content/categories.json: id "${cat.id}" non valido.`);

  const projects = await loadProjects(categories);
  const toolGroups = linkTools(toolsData, projects);
  for (const p of projects) {
    for (const slug of p.related) if (!projects.some((other) => other.slug === slug)) throw new Error(`${p.source}: "related" cita un progetto inesistente → ${slug}`);
  }

  // Asset: CSS unico (concatenazione ordinata dei file in src/styles), JS e file statici.
  const cssFiles = (await readdir(DIR.styles)).filter((file) => file.endsWith('.css')).sort();
  const css = [
    '/* File generato da npm run build a partire da src/styles/: non modificarlo a mano. */',
    ...(await Promise.all(cssFiles.map((file) => readFile(path.join(DIR.styles, file), 'utf8')))),
  ].join('\n\n');
  const js = await readFile(path.join(DIR.scripts, 'main.js'), 'utf8');

  await rm(DIR.out, { recursive: true, force: true });
  await mkdir(DIR.out, { recursive: true });
  await cp(DIR.static, path.join(DIR.out, 'assets'), { recursive: true });
  await writeOut('assets/css/main.css', css);
  await writeOut('assets/js/main.js', js);
  await writeOut('.nojekyll', '');

  const renderer = createRenderer({ site, categories, projects, toolGroups, assets: { css: hash(css), js: hash(js) } });
  const pages = [
    renderer.home(),
    renderer.projectsIndex(),
    ...projects.filter((p) => p.published).map((p) => renderer.project(p)),
    renderer.tools(),
    renderer.notFound(),
  ];
  for (const page of pages) await writeOut(page.file, page.html);

  const siteUrl = site.siteUrl.replace(/\/+$/, '');
  const today = new Date().toISOString().slice(0, 10);
  const indexable = pages.filter((page) => page.indexable);
  await writeOut('sitemap.xml', sitemap(siteUrl, indexable, today));
  await writeOut('robots.txt', robots(siteUrl));
  const todo = report({ pages, projects, today });
  await writeFile(path.join(ROOT, 'CONTENUTI-DA-COMPLETARE.md'), todo.text);

  const unpublished = projects.filter((p) => !p.published).length;
  console.log(`✔ Sito generato in docs/ (${Date.now() - started} ms)`);
  console.log(`  ${pages.length - 1} pagine · ${indexable.length} indicizzabili · ${pages.length - 1 - indexable.length} con contenuti da completare (noindex)`);
  if (unpublished) console.log(`  ${unpublished} progetti con published: false (non pubblicati)`);
  console.log(`  ${todo.total} elementi da completare → CONTENUTI-DA-COMPLETARE.md`);
  const notes = [...new Set(renderer.warnings)];
  if (/USERNAME|REPOSITORY/.test(site.siteUrl)) {
    notes.push('"siteUrl" in content/site.json è ancora un segnaposto: canonical, Open Graph e sitemap useranno un indirizzo non valido.');
  }
  for (const note of notes) console.warn(`⚠ ${note}`);
}

main().catch((error) => {
  console.error(`✖ Build interrotta: ${error.message}`);
  process.exitCode = 1;
});
