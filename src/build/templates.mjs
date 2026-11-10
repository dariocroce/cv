/**
 * Template HTML del portfolio.
 * Ogni funzione restituisce HTML come stringa; build.mjs scrive i file in docs/.
 * Le pagine generate non vanno modificate a mano: si modificano i file in content/.
 */
import { escapeHtml as esc, renderInline, parseDiagram } from './markdown.mjs';

/** Struttura comune dei case study: ordine delle sezioni e testo guida dei segnaposto. */
export const SECTIONS = [
  { id: 'contesto', title: 'Contesto', hint: 'Qual era il contesto iniziale.' },
  { id: 'problema', title: 'Problema', hint: 'Quale problema o esigenza doveva essere affrontato.' },
  {
    id: 'ruolo',
    title: 'Ruolo',
    hint: 'Qual è stato concretamente il ruolo di Dario. Indicare solo ruoli e attività esplicitamente confermati.',
  },
  { id: 'approccio', title: 'Approccio', hint: 'Come è stato affrontato il problema.' },
  { id: 'soluzione', title: 'Soluzione', hint: 'Soluzione, processo, POC o implementazione realizzata.' },
  {
    id: 'risultato',
    title: 'Risultato',
    hint: 'Risultato ottenuto. Solo risultati documentati: nessuna metrica se non è stata fornita.',
  },
  { id: 'stack', title: 'Stack', hint: 'Tecnologie e strumenti effettivamente utilizzati.' },
];

export const isTodo = (value) => typeof value === 'string' && /^\s*TODO\b/i.test(value);
export const isDraft = (value) => typeof value === 'string' && /^\s*BOZZA\b/i.test(value);
const stripMarker = (value) => String(value).replace(/^\s*(?:TODO|BOZZA)\b:?\s*/i, '').trim();
const pad2 = (n) => String(n).padStart(2, '0');
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const langAttr = (lang) => (lang ? ` lang="${esc(lang)}"` : '');
/** Elenco con separatore "·" che non va mai a capo all'inizio di una riga. */
const dotted = (items) =>
  (Array.isArray(items) ? items : String(items).split('·'))
    .map((item) => esc(String(item).trim()))
    .filter(Boolean)
    .join('&nbsp;· ');
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/;
const SITE_SOURCE = 'content/site.json';
const CATEGORY_SOURCE = 'content/categories.json';
const TOOLS_SOURCE = 'content/tools.json';

export function createRenderer({ site, categories, projects, toolGroups, assets }) {
  const published = projects.filter((p) => p.published);
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const siteUrl = site.siteUrl.replace(/\/+$/, '');
  const basePath = new URL(`${siteUrl}/`).pathname;
  const toolCount = toolGroups.reduce((sum, group) => sum + group.tools.length, 0);
  const year = new Date().getFullYear();
  const warnings = [];

  /* Contesto di pagina e URL ------------------------------------------------ */

  function createContext(pagePath, { absolute = false } = {}) {
    const depth = pagePath.split('/').filter(Boolean).length;
    return { path: pagePath, rel: '../'.repeat(depth), absolute, issues: [] };
  }

  /** URL relativo alla pagina corrente: funziona su GitHub Pages con qualunque percorso base. */
  function href(ctx, target = '') {
    if (ctx.absolute) return `${basePath}${target}`;
    return `${ctx.rel}${target}` || './';
  }

  function resolveHref(ctx, value) {
    const raw = String(value).trim();
    if (/^(?:javascript|vbscript|data):/i.test(raw)) throw new Error(`link non ammesso → ${raw}`);
    const project = /^project:([a-z0-9-]+)(#[\w-]+)?$/.exec(raw);
    if (project) {
      const target = bySlug.get(project[1]);
      if (!target) throw new Error(`link a un progetto inesistente → ${raw}`);
      if (!target.published) {
        warnings.push(`Il link "${raw}" punta a un progetto non pubblicato: rimanda all'elenco progetti.`);
        return href(ctx, 'progetti/');
      }
      return href(ctx, `progetti/${target.slug}/`) + (project[2] || '');
    }
    const tool = /^tool:([a-z0-9-]+)$/.exec(raw);
    if (tool) return href(ctx, `strumenti/#tool-${tool[1]}`);
    if (/^assets\//.test(raw)) return href(ctx, raw);
    return raw;
  }

  const inline = (ctx, text) => renderInline(text, (value) => resolveHref(ctx, value));
  const catName = (cat) => (cat.lang ? `<span lang="${esc(cat.lang)}">${esc(cat.title)}</span>` : esc(cat.title));
  const projectName = (p) => (p.titleLang ? `<span lang="${esc(p.titleLang)}">${esc(p.title)}</span>` : esc(p.title));
  const projectHref = (ctx, p) => href(ctx, `progetti/${p.slug}/`);
  const toolsLabel = '<span lang="en">Tools &amp; Technologies</span>';

  /* Segnaposto e bozze -------------------------------------------------------
     Ogni segnaposto viene registrato: la pagina che lo contiene esce con
     noindex e l'elemento compare in CONTENUTI-DA-COMPLETARE.md. */

  function track(ctx, type, where, text, source) {
    ctx.issues.push({ type, where, text, source });
  }

  function placeholder(ctx, text, { where, source, inline: isInline = false, className = '' } = {}) {
    track(ctx, 'todo', where, text, source);
    if (isInline) {
      return `<span class="ph ph--inline"><span class="ph__label">Da completare</span> <span class="ph__text">${esc(text)}</span></span>`;
    }
    return `<div class="ph${className ? ` ${className}` : ''}" role="note"><p class="ph__label">Da completare</p><p class="ph__text">${esc(text)}</p></div>`;
  }

  function draft(ctx, text, { where, source, className = '' } = {}) {
    track(ctx, 'draft', where, text, source);
    return `<div class="draft${className ? ` ${className}` : ''}"><p class="draft__label">Bozza da validare</p><p>${inline(ctx, text)}</p></div>`;
  }

  /** Testo di configurazione: valore definitivo, "TODO: …" oppure "BOZZA: …". */
  function textBlock(ctx, value, { where, source, hint, className = '' }) {
    if (!value || isTodo(value)) {
      return placeholder(ctx, (value && stripMarker(value)) || hint, { where, source, className });
    }
    if (isDraft(value)) return draft(ctx, stripMarker(value), { where, source, className });
    return `<p${className ? ` class="${className}"` : ''}>${inline(ctx, value)}</p>`;
  }

  /* Blocchi di contenuto ------------------------------------------------------ */

  function figure(ctx, match, scope) {
    const [, alt, src, caption] = match;
    if (!alt.trim()) throw new Error(`${scope.source}: immagine senza testo alternativo → ${src}`);
    return `<figure class="figure"><img src="${esc(resolveHref(ctx, src))}" alt="${esc(alt)}" loading="lazy" decoding="async">${
      caption ? `<figcaption>${inline(ctx, caption)}</figcaption>` : ''
    }</figure>`;
  }

  function diagram(ctx, block, scope) {
    if (block.lang !== 'flow' && block.lang !== 'structure') {
      return `<pre class="code"><code>${esc(block.text)}</code></pre>`;
    }
    let data;
    try {
      data = parseDiagram(block.text);
    } catch (error) {
      throw new Error(`${scope.source}: ${error.message}`);
    }
    const caption = data.caption ? `<figcaption class="diagram__caption">${inline(ctx, data.caption)}</figcaption>` : '';

    if (block.lang === 'structure') {
      const parts = data.items.flatMap((item) => (item.type === 'group' ? item.items : [item]));
      const partsHtml = parts
        .map(
          (part) =>
            `<li class="structure__part"><span class="structure__label">${inline(ctx, part.label)}</span>${
              part.note ? `<span class="structure__note">${inline(ctx, part.note)}</span>` : ''
            }</li>`,
        )
        .join('');
      const base = data.base
        ? `<p class="structure__base"><span class="visually-hidden">Base comune: </span>${inline(ctx, data.base)}</p>`
        : '';
      return `<figure class="diagram diagram--structure">${caption}<div class="structure"><ul class="structure__parts" role="list">${partsHtml}</ul>${base}</div></figure>`;
    }

    const step = (item) =>
      `<li class="flow__step"><span class="flow__label">${inline(ctx, item.label)}</span>${
        item.note ? `<span class="flow__note">${inline(ctx, item.note)}</span>` : ''
      }</li>`;
    const items = data.items
      .map((item) =>
        item.type === 'group'
          ? `<li class="flow__group"><p class="flow__group-label">${inline(ctx, item.label)}</p><ol class="flow__steps" role="list">${item.items
              .map(step)
              .join('')}</ol></li>`
          : step(item),
      )
      .join('');
    return `<figure class="diagram diagram--flow">${caption}<ol class="flow" role="list">${items}</ol></figure>`;
  }

  function renderBlocks(ctx, blocks, scope) {
    return blocks
      .map((block) => {
        switch (block.type) {
          case 'p': {
            if (isTodo(block.text)) {
              return placeholder(ctx, stripMarker(block.text) || scope.hint, { where: scope.where, source: scope.source });
            }
            if (isDraft(block.text)) return draft(ctx, stripMarker(block.text), { where: scope.where, source: scope.source });
            const image = IMAGE.exec(block.text);
            if (image) return figure(ctx, image, scope);
            return `<p>${inline(ctx, block.text)}</p>`;
          }
          case 'ul':
            return `<ul>${block.items.map((item) => `<li>${inline(ctx, item)}</li>`).join('')}</ul>`;
          case 'ol':
            return `<ol>${block.items.map((item) => `<li>${inline(ctx, item)}</li>`).join('')}</ol>`;
          case 'quote':
            return `<div class="callout" role="note"><p>${inline(ctx, block.text)}</p></div>`;
          case 'heading':
            return `<h4 class="subheading">${inline(ctx, block.text)}</h4>`;
          case 'fence':
            return diagram(ctx, block, scope);
          default:
            return '';
        }
      })
      .join('\n');
  }

  /** Sezione del case study: testo introduttivo + gruppi introdotti da ### */
  function renderSection(ctx, blocks, scope) {
    const intro = [];
    const groups = [];
    let current = null;
    for (const block of blocks) {
      if (block.type === 'heading' && block.level === 3) {
        current = { title: block.text, blocks: [] };
        groups.push(current);
      } else {
        (current ? current.blocks : intro).push(block);
      }
    }
    let html = renderBlocks(ctx, intro, scope);
    if (groups.length) {
      const cards = groups
        .map((group) => {
          const groupScope = { ...scope, where: `${scope.where} · ${group.title}` };
          const content = group.blocks.length
            ? renderBlocks(ctx, group.blocks, groupScope)
            : placeholder(ctx, scope.hint, { where: groupScope.where, source: scope.source });
          return `<div class="group"><h3 class="group__title">${inline(ctx, group.title)}</h3>${content}</div>`;
        })
        .join('\n');
      html += `\n<div class="groups${groups.length > 1 ? ' groups--multi' : ''}">${cards}</div>`;
    }
    return html;
  }

  /* Componenti condivisi ----------------------------------------------------- */

  function breadcrumb(ctx, items) {
    const list = items
      .map(([label, target], index) =>
        index === items.length - 1
          ? `<li><span aria-current="page">${label}</span></li>`
          : `<li><a href="${href(ctx, target)}">${label}</a></li>`,
      )
      .join('');
    return `<nav class="breadcrumb" aria-label="Percorso"><ol role="list">${list}</ol></nav>`;
  }

  function breadcrumbLd(items) {
    return {
      '@type': 'BreadcrumbList',
      itemListElement: items.map(([name, target], index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
        item: `${siteUrl}/${target}`,
      })),
    };
  }

  function card(ctx, p, { showArea = true } = {}) {
    const summary = isTodo(p.summary)
      ? placeholder(ctx, stripMarker(p.summary) || 'Descrizione sintetica del progetto.', {
          where: 'Descrizione sintetica (card e meta description)',
          source: p.source,
        })
      : `<p class="card__summary">${inline(ctx, p.summary)}</p>`;
    const rows = [];
    if (p.role && !isTodo(p.role)) rows.push(['Ruolo', esc(p.role)]);
    if (p.scope && !isTodo(p.scope)) rows.push(['Ambito', dotted(p.scope)]);
    if (p.technologies.length) rows.push(['Stack', dotted(p.technologies.slice(0, 4))]);
    const meta = rows.length
      ? `<dl class="card__meta">${rows
          .map(([key, value]) => `<div class="card__meta-row"><dt>${key}</dt><dd>${value}</dd></div>`)
          .join('')}</dl>`
      : '';
    return `<article class="card">
            ${showArea ? `<p class="card__area label">${catName(p.category)}</p>` : ''}
            <h3 class="card__title"><a class="card__link" href="${projectHref(ctx, p)}"${langAttr(p.titleLang)}>${esc(p.title)}</a></h3>
            ${summary}
            <div class="card__foot">${meta}<p class="card__cta" aria-hidden="true">Esplora progetto <span class="arrow">→</span></p></div>
          </article>`;
  }

  function cardList(ctx, items, options) {
    return `<ul class="card-grid" role="list">
          ${items.map((p) => `<li>${card(ctx, p, options)}</li>`).join('\n          ')}
        </ul>`;
  }

  function cvAction(ctx) {
    const cv = site.contacts?.cv;
    if (cv === false) return '';
    if (cv) return `<a class="btn" href="${esc(resolveHref(ctx, cv))}">Scarica il CV <span class="btn__meta">PDF</span></a>`;
    track(ctx, 'todo', 'Contatti · CV', 'CV in PDF da pubblicare in src/static/docs/.', SITE_SOURCE);
    return '<span class="btn btn--placeholder"><span class="ph__label">Da completare</span> CV in PDF</span>';
  }

  function linkedinAction(ctx) {
    const url = site.contacts?.linkedin;
    if (url === false) return '';
    if (url) return `<a class="btn" href="${esc(url)}">LinkedIn</a>`;
    track(ctx, 'todo', 'Contatti · LinkedIn', 'URL del profilo LinkedIn.', SITE_SOURCE);
    return '<span class="btn btn--placeholder"><span class="ph__label">Da completare</span> Profilo LinkedIn</span>';
  }

  /* Header, footer e impaginato --------------------------------------------- */

  function header(ctx, current) {
    const link = (target, label, key) => {
      const attrs = current === key ? ' aria-current="page"' : '';
      const cls = current === `${key}-child` ? 'site-nav__link is-active' : 'site-nav__link';
      return `<li><a class="${cls}" href="${href(ctx, target)}"${attrs}>${label}</a></li>`;
    };
    return `<header class="site-header">
  <div class="container site-header__inner">
    <a class="brand" href="${href(ctx)}"><span class="brand__name">${esc(site.name)}</span><span class="brand__tag">Portfolio</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
      <svg class="nav-toggle__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M1 3.5h14M1 8h14M1 12.5h14" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
      Menu
    </button>
    <nav id="site-nav" class="site-nav" aria-label="Principale">
      <ul class="site-nav__list" role="list">
        ${link('progetti/', 'Progetti', 'progetti')}
        ${link('strumenti/', toolsLabel, 'strumenti')}
        <li><a class="site-nav__link" href="#contatti">Contatti</a></li>
      </ul>
    </nav>
  </div>
</header>`;
  }

  function footer(ctx) {
    const contacts = site.contacts || {};
    const rows = [];
    if (contacts.email !== false) {
      rows.push([
        'Email',
        contacts.email
          ? `<a href="mailto:${esc(contacts.email)}">${esc(contacts.email)}</a>`
          : placeholder(ctx, 'Indirizzo email personale (non aziendale).', {
              where: 'Contatti · email',
              source: SITE_SOURCE,
              inline: true,
            }),
      ]);
    }
    if (contacts.linkedin !== false) {
      rows.push([
        'LinkedIn',
        contacts.linkedin
          ? `<a href="${esc(contacts.linkedin)}">Profilo LinkedIn</a>`
          : placeholder(ctx, 'URL del profilo LinkedIn.', { where: 'Contatti · LinkedIn', source: SITE_SOURCE, inline: true }),
      ]);
    }
    if (contacts.cv !== false) {
      rows.push([
        'CV',
        contacts.cv
          ? `<a href="${esc(resolveHref(ctx, contacts.cv))}">Scarica il CV (PDF)</a>`
          : placeholder(ctx, 'CV in PDF da pubblicare in src/static/docs/.', {
              where: 'Contatti · CV',
              source: SITE_SOURCE,
              inline: true,
            }),
      ]);
    }
    return `<footer class="site-footer" id="contatti">
  <div class="container">
    <div class="site-footer__grid">
      <section aria-labelledby="contatti-title">
        <h2 class="site-footer__title" id="contatti-title">Contatti</h2>
        <dl class="contact-list">
          ${rows.map(([key, value]) => `<div class="contact-list__row"><dt>${key}</dt><dd>${value}</dd></div>`).join('\n          ')}
        </dl>
      </section>
      <nav class="site-footer__nav" aria-label="Navigazione secondaria">
        <ul role="list">
          <li><a href="${href(ctx)}">Home</a></li>
          <li><a href="${href(ctx, 'progetti/')}">Progetti</a></li>
          <li><a href="${href(ctx, 'strumenti/')}">${toolsLabel}</a></li>
        </ul>
      </nav>
    </div>
    <p class="site-footer__legal">© ${year} ${esc(site.name)}</p>
  </div>
</footer>`;
  }

  function head(ctx, page, indexable) {
    const canonical = `${siteUrl}/${page.path}`;
    const image = `${siteUrl}/assets/img/og-default.png`;
    const jsonld = page.jsonld
      ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': page.jsonld }).replace(
          /</g,
          '\\u003c',
        )}</script>`
      : '';
    return [
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      `<title>${esc(page.title)}</title>`,
      `<meta name="description" content="${esc(page.description)}">`,
      page.canonical === false ? '' : `<link rel="canonical" href="${esc(canonical)}">`,
      indexable ? '' : '<meta name="robots" content="noindex, follow">',
      `<meta property="og:type" content="${page.ogType || 'website'}">`,
      `<meta property="og:site_name" content="${esc(site.name)} — Portfolio">`,
      `<meta property="og:locale" content="${esc(site.locale)}">`,
      `<meta property="og:title" content="${esc(page.ogTitle || page.title)}">`,
      `<meta property="og:description" content="${esc(page.description)}">`,
      page.canonical === false ? '' : `<meta property="og:url" content="${esc(canonical)}">`,
      `<meta property="og:image" content="${esc(image)}">`,
      '<meta property="og:image:width" content="1200">',
      '<meta property="og:image:height" content="630">',
      `<meta property="og:image:alt" content="${esc(site.name)} — Portfolio">`,
      '<meta name="twitter:card" content="summary_large_image">',
      '<meta name="theme-color" content="#f7f6f2">',
      `<link rel="icon" href="${href(ctx, 'assets/img/favicon.svg')}" type="image/svg+xml">`,
      `<link rel="icon" href="${href(ctx, 'assets/img/favicon-32.png')}" type="image/png" sizes="32x32">`,
      `<link rel="apple-touch-icon" href="${href(ctx, 'assets/img/apple-touch-icon.png')}">`,
      `<link rel="stylesheet" href="${href(ctx, `assets/css/main.css?v=${assets.css}`)}">`,
      '<script>document.documentElement.classList.add("js")</script>',
      `<script src="${href(ctx, `assets/js/main.js?v=${assets.js}`)}" defer></script>`,
      jsonld,
    ]
      .filter(Boolean)
      .map((line) => `  ${line}`)
      .join('\n');
  }

  /** Impagina una pagina completa. Il contenuto principale va generato prima,
      così i segnaposto del corpo sono già registrati nel contesto. */
  function page(ctx, options) {
    const headerHtml = header(ctx, options.current);
    const footerHtml = footer(ctx);
    const indexable = !options.noindex && ctx.issues.length === 0;
    const html = `<!doctype html>
<html lang="${esc(site.lang)}">
<head>
${head(ctx, options, indexable)}
</head>
<body>
<a class="skip-link" href="#main">Vai al contenuto</a>
${headerHtml}
<main id="main" tabindex="-1">
${options.main}
</main>
${footerHtml}
</body>
</html>
`;
    return {
      path: options.path,
      file: options.file || `${options.path}index.html`,
      title: options.title,
      html,
      issues: ctx.issues,
      indexable,
    };
  }

  /* Pagine ------------------------------------------------------------------- */

  function home() {
    const ctx = createContext('');
    const featured = published.filter((p) => p.featured);
    const count = (cat) => published.filter((p) => p.category.id === cat.id).length;

    const areaItems = categories
      .map(
        (cat, index) => `
            <li>
              <a class="area-index__link" href="${href(ctx, `progetti/#${cat.id}`)}">
                <span class="area-index__num" aria-hidden="true">${pad2(index + 1)}</span>
                <span class="area-index__name">${catName(cat)}</span>
                <span class="area-index__count">${plural(count(cat), 'progetto', 'progetti')}</span>
                <span class="area-index__desc">${esc(cat.description || '')}</span>
              </a>
            </li>`,
      )
      .join('');
    const toolsItem = `
            <li>
              <a class="area-index__link" href="${href(ctx, 'strumenti/')}">
                <span class="area-index__num" aria-hidden="true">${pad2(categories.length + 1)}</span>
                <span class="area-index__name">${toolsLabel}</span>
                <span class="area-index__count">${plural(toolCount, 'strumento', 'strumenti')}</span>
                <span class="area-index__desc">${esc(site.toolsSummary || '')}</span>
              </a>
            </li>`;

    const hero = `
  <section class="hero" aria-labelledby="hero-title">
    <div class="container hero__grid">
      <div class="hero__main">
        <h1 class="hero__title" id="hero-title">${esc(site.name)}</h1>
        ${textBlock(ctx, site.positioning, {
          where: 'Home · posizionamento',
          source: SITE_SOURCE,
          hint: 'Posizionamento professionale in una frase.',
          className: 'hero__lead',
        })}
        ${textBlock(ctx, site.intro, {
          where: 'Home · introduzione',
          source: SITE_SOURCE,
          hint: 'Introduzione sintetica (2–3 frasi).',
          className: 'hero__intro',
        })}
        <div class="hero__actions">
          <a class="btn btn--primary" href="${href(ctx, 'progetti/')}">Esplora i progetti <span class="arrow" aria-hidden="true">→</span></a>
          ${cvAction(ctx)}
          ${linkedinAction(ctx)}
        </div>
      </div>
      <nav class="area-index" aria-labelledby="area-index-title">
        <h2 class="area-index__title label" id="area-index-title">Aree di lavoro</h2>
        <ol class="area-index__list" role="list">${areaItems}${toolsItem}
        </ol>
      </nav>
    </div>
  </section>`;

    const featuredSection = featured.length
      ? `
  <section class="section section--rule" aria-labelledby="featured-title">
    <div class="container">
      <div class="section__head">
        <h2 class="section__title" id="featured-title">Progetti in evidenza</h2>
        <a class="link-arrow" href="${href(ctx, 'progetti/')}">Tutti i progetti (${published.length}) <span class="arrow" aria-hidden="true">→</span></a>
      </div>
      ${cardList(ctx, featured, { showArea: true })}
    </div>
  </section>`
      : '';

    const toolsSection = `
  <section class="section section--rule" aria-labelledby="tools-title">
    <div class="container">
      <div class="section__head">
        <div>
          <h2 class="section__title" id="tools-title">${toolsLabel}</h2>
          ${site.toolsSummary ? `<p class="section__intro">${esc(site.toolsSummary)}</p>` : ''}
        </div>
        <a class="link-arrow" href="${href(ctx, 'strumenti/')}">In quali progetti <span class="arrow" aria-hidden="true">→</span></a>
      </div>
      <div class="tool-groups">
        ${toolGroups
          .map(
            (group) => `<div class="tool-group">
          <h3 class="tool-group__title label">${esc(group.title)}</h3>
          <ul class="tool-group__list" role="list">${group.tools
            .map((tool) => `<li${langAttr(tool.lang)}>${esc(tool.name)}</li>`)
            .join('')}</ul>
        </div>`,
          )
          .join('\n        ')}
      </div>
    </div>
  </section>`;

    const person = { '@type': 'Person', '@id': `${siteUrl}/#person`, name: site.name, url: `${siteUrl}/` };
    if (site.contacts?.linkedin) person.sameAs = [site.contacts.linkedin];

    return page(ctx, {
      path: '',
      current: 'home',
      title: `${site.name} — Portfolio`,
      description: site.description,
      jsonld: [
        { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: `${site.name} — Portfolio`, inLanguage: 'it-IT' },
        { '@type': 'ProfilePage', url: `${siteUrl}/`, name: `${site.name} — Portfolio`, inLanguage: 'it-IT', mainEntity: { '@id': `${siteUrl}/#person` } },
        person,
      ],
      main: `${hero}${featuredSection}${toolsSection}`,
    });
  }

  function projectsIndex() {
    const ctx = createContext('progetti/');
    const visible = categories
      .map((cat, index) => ({ cat, index, items: published.filter((p) => p.category.id === cat.id) }))
      .filter((entry) => entry.items.length);

    const buttons = [
      `<button type="button" class="filter-btn" data-filter="all" data-label="tutte le aree" aria-pressed="true">Tutte <span class="filter-btn__count">${published.length}</span></button>`,
      ...visible.map(
        ({ cat, items }) =>
          `<button type="button" class="filter-btn" data-filter="${cat.id}" data-label="${esc(cat.title)}" aria-pressed="false">${catName(cat)} <span class="filter-btn__count">${items.length}</span></button>`,
      ),
    ].join('\n        ');

    const groups = visible
      .map(
        ({ cat, index, items }) => `
      <section class="project-group" id="${cat.id}" data-category="${cat.id}" data-count="${items.length}" aria-labelledby="${cat.id}-title">
        <div class="project-group__head">
          <span class="project-group__num" aria-hidden="true">${pad2(index + 1)}</span>
          <h2 class="project-group__title" id="${cat.id}-title">${catName(cat)}</h2>
          ${textBlock(ctx, cat.description, {
            where: `Area ${cat.title} · descrizione`,
            source: CATEGORY_SOURCE,
            hint: "Descrizione dell'area.",
            className: 'project-group__desc',
          })}
        </div>
        ${cardList(ctx, items, { showArea: false })}
      </section>`,
      )
      .join('\n');

    const main = `
  <div class="page-head">
    <div class="container">
      ${breadcrumb(ctx, [['Home', ''], ['Progetti', 'progetti/']])}
      <h1 class="page-title page-head__eyebrow">Progetti</h1>
      <p class="page-intro">${plural(published.length, 'progetto', 'progetti')} in ${plural(visible.length, 'area', 'aree')}. Ogni scheda apre il caso di studio: contesto, problema, ruolo, approccio, soluzione, risultato e stack.</p>
    </div>
  </div>
  <div class="container">
    <div class="filters" role="group" aria-labelledby="filters-label" data-filters hidden>
      <span class="filters__label label" id="filters-label">Filtra per area</span>
      ${buttons}
    </div>
    <p class="visually-hidden" role="status" data-filter-status></p>
    <div class="project-groups">${groups}
    </div>
  </div>`;

    return page(ctx, {
      path: 'progetti/',
      current: 'progetti',
      title: `Progetti — ${site.name}`,
      description: `Progetti di ${site.name} organizzati per area: ${visible.map(({ cat }) => cat.title).join(', ')}.`,
      jsonld: [
        { '@type': 'CollectionPage', url: `${siteUrl}/progetti/`, name: `Progetti — ${site.name}`, inLanguage: 'it-IT' },
        breadcrumbLd([['Home', ''], ['Progetti', 'progetti/']]),
      ],
      main,
    });
  }

  function stackBlock(ctx, p) {
    const scope = { where: 'Sezione 07 · Stack', source: p.source, hint: SECTIONS[6].hint };
    const techs = p.techLinks.length
      ? `<ul class="inline-list" role="list">${p.techLinks
          .map(({ name, tool }) => `<li>${tool ? `<a href="${href(ctx, `strumenti/#tool-${tool.id}`)}">${esc(name)}</a>` : esc(name)}</li>`)
          .join('')}</ul>`
      : placeholder(ctx, 'Tecnologie e strumenti effettivamente utilizzati.', { ...scope, inline: true });
    const rows = [`<div class="stack__row"><dt>Tecnologie e strumenti</dt><dd>${techs}</dd></div>`];
    if (p.competencies.length) {
      rows.push(
        `<div class="stack__row"><dt>Competenze</dt><dd><ul class="inline-list" role="list">${p.competencies
          .map((item) => `<li>${esc(item)}</li>`)
          .join('')}</ul></dd></div>`,
      );
    }
    const extra = p.sections.stack?.length ? renderSection(ctx, p.sections.stack, scope) : '';
    return `<dl class="stack">${rows.join('')}</dl>${extra}`;
  }

  function project(p) {
    const ctx = createContext(`progetti/${p.slug}/`);
    const cat = p.category;
    const position = published.indexOf(p);
    const prev = position > 0 ? published[position - 1] : null;
    const next = position < published.length - 1 ? published[position + 1] : null;
    const sections = SECTIONS.filter((section) => !p.omit.includes(section.id));
    const canonical = `${siteUrl}/progetti/${p.slug}/`;

    const summary = isTodo(p.summary)
      ? placeholder(ctx, stripMarker(p.summary) || 'Descrizione sintetica del progetto.', {
          where: 'Descrizione sintetica (card e meta description)',
          source: p.source,
        })
      : `<p class="page-intro">${inline(ctx, p.summary)}</p>`;

    const metaValue = (value, where, hint) =>
      value && !isTodo(value) ? dotted(value) : placeholder(ctx, (value && stripMarker(value)) || hint, { where, source: p.source, inline: true });
    const meta = `
      <dl class="meta-list">
        <div class="meta-list__item"><dt>Area</dt><dd><a href="${href(ctx, `progetti/#${cat.id}`)}">${catName(cat)}</a></dd></div>
        <div class="meta-list__item"><dt>Ruolo</dt><dd>${metaValue(p.role, 'Ruolo (intestazione)', 'Ruolo esplicitamente confermato.')}</dd></div>
        <div class="meta-list__item"><dt>Ambito</dt><dd>${metaValue(p.scope, 'Ambito (intestazione)', 'Ambito o tipologia di intervento.')}</dd></div>
      </dl>`;

    const toc = `
    <nav class="case__toc toc" aria-labelledby="toc-title">
      <p class="toc__title label" id="toc-title">In questa pagina</p>
      <ol role="list">
        ${sections
          .map((section, index) => `<li><a href="#${section.id}"><span class="toc__num" aria-hidden="true">${pad2(index + 1)}</span>${section.title}</a></li>`)
          .join('\n        ')}
      </ol>
    </nav>`;

    const body = sections
      .map((section, index) => {
        const scope = {
          where: `Sezione ${pad2(index + 1)} · ${section.title}`,
          source: p.source,
          hint: section.hint,
        };
        let content;
        if (section.id === 'stack') {
          content = stackBlock(ctx, p);
        } else {
          const blocks = p.sections[section.id] || [];
          content = blocks.length ? renderSection(ctx, blocks, scope) : placeholder(ctx, section.hint, scope);
        }
        return `
      <section class="case-section case-section--${section.id}" id="${section.id}" aria-labelledby="${section.id}-title">
        <h2 class="case-section__title" id="${section.id}-title"><span class="case-section__num" aria-hidden="true">${pad2(index + 1)} /</span> ${section.title}</h2>
        <div class="case-section__body">
${content}
        </div>
      </section>`;
      })
      .join('\n');

    const related = p.related.map((slug) => bySlug.get(slug)).filter((item) => item && item.published);
    const relatedHtml = related.length
      ? `
      <aside class="related" aria-labelledby="related-title">
        <h2 class="related__title label" id="related-title">Progetti collegati</h2>
        <ul role="list">
          ${related
            .map((item) => `<li><a href="${projectHref(ctx, item)}">${projectName(item)}</a> <span class="related__area">· ${catName(item.category)}</span></li>`)
            .join('\n          ')}
        </ul>
      </aside>`
      : '';

    const pager =
      prev || next
        ? `
  <div class="container">
    <nav class="pager" aria-label="Altri progetti">
      ${
        prev
          ? `<a class="pager__link pager__link--prev" href="${projectHref(ctx, prev)}" rel="prev"><span class="pager__dir"><span aria-hidden="true">← </span>Precedente</span><span class="pager__title">${projectName(prev)}</span></a>`
          : ''
      }
      ${
        next
          ? `<a class="pager__link pager__link--next" href="${projectHref(ctx, next)}" rel="next"><span class="pager__dir">Successivo<span aria-hidden="true"> →</span></span><span class="pager__title">${projectName(next)}</span></a>`
          : ''
      }
    </nav>
  </div>`
        : '';

    const main = `
  <div class="page-head">
    <div class="container">
      ${breadcrumb(ctx, [
        ['Home', ''],
        ['Progetti', 'progetti/'],
        [catName(cat), `progetti/#${cat.id}`],
        [projectName(p)],
      ])}
      <p class="page-head__eyebrow label">Caso di studio</p>
      <h1 class="page-title"${langAttr(p.titleLang)}>${esc(p.title)}</h1>
      ${summary}${meta}
    </div>
  </div>
  <div class="container case">
    ${toc}
    <div class="case__body">
${body}
${relatedHtml}
    </div>
  </div>
${pager}`;

    const description = isTodo(p.summary) ? `Caso di studio: ${p.title} (${cat.title}).` : p.summary;
    const work = {
      '@type': 'CreativeWork',
      '@id': `${canonical}#caso-di-studio`,
      name: p.title,
      description,
      url: canonical,
      inLanguage: 'it-IT',
      genre: 'Caso di studio',
      author: { '@type': 'Person', '@id': `${siteUrl}/#person`, name: site.name, url: `${siteUrl}/` },
    };
    if (p.technologies.length) work.keywords = p.technologies.join(', ');

    return page(ctx, {
      path: `progetti/${p.slug}/`,
      current: 'progetti-child',
      title: `${p.title} — ${site.name}`,
      ogTitle: `${p.title} · Caso di studio`,
      ogType: 'article',
      description,
      jsonld: [work, breadcrumbLd([['Home', ''], ['Progetti', 'progetti/'], [p.title, `progetti/${p.slug}/`]])],
      main,
    });
  }

  function tools() {
    const ctx = createContext('strumenti/');
    const sections = toolGroups
      .map((group) => {
        const rows = group.tools
          .map((tool) => {
            let used;
            if (tool.projects.length) {
              used = `<ul class="inline-list" role="list">${tool.projects
                .map((p) => `<li><a href="${projectHref(ctx, p)}">${projectName(p)}</a></li>`)
                .join('')}</ul>`;
            } else if (tool.note) {
              used = `<span class="muted">${inline(ctx, tool.note)}</span>`;
            } else {
              used = placeholder(ctx, 'Collegare a un progetto documentato oppure aggiungere una nota d’uso.', {
                where: `Strumento · ${tool.name}`,
                source: TOOLS_SOURCE,
                inline: true,
              });
            }
            return `<tr id="tool-${tool.id}"><th scope="row"${langAttr(tool.lang)}>${esc(tool.name)}</th><td>${used}</td></tr>`;
          })
          .join('\n            ');
        return `
      <section class="tool-section" aria-labelledby="gruppo-${group.id}">
        <h2 class="tool-section__title" id="gruppo-${group.id}">${esc(group.title)}</h2>
        <table class="tool-table" aria-labelledby="gruppo-${group.id}">
          <thead><tr><th scope="col">Strumento</th><th scope="col">Utilizzato in</th></tr></thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </section>`;
      })
      .join('\n');

    const main = `
  <div class="page-head">
    <div class="container">
      ${breadcrumb(ctx, [['Home', ''], [toolsLabel, 'strumenti/']])}
      <h1 class="page-title page-head__eyebrow">${toolsLabel}</h1>
      ${textBlock(ctx, site.toolsIntro, {
        where: 'Tools & Technologies · introduzione',
        source: SITE_SOURCE,
        hint: 'Introduzione alla pagina.',
        className: 'page-intro',
      })}
    </div>
  </div>
  <div class="container tool-sections">${sections}
  </div>`;

    return page(ctx, {
      path: 'strumenti/',
      current: 'strumenti',
      title: `Tools & Technologies — ${site.name}`,
      description: `Strumenti e tecnologie utilizzati da ${site.name}, collegati ai progetti in cui sono stati applicati.`,
      jsonld: [
        { '@type': 'WebPage', url: `${siteUrl}/strumenti/`, name: `Tools & Technologies — ${site.name}`, inLanguage: 'it-IT' },
        breadcrumbLd([['Home', ''], ['Tools & Technologies', 'strumenti/']]),
      ],
      main,
    });
  }

  function notFound() {
    // Pagina servita da GitHub Pages a qualunque profondità: i link usano il percorso base assoluto.
    const ctx = createContext('', { absolute: true });
    const main = `
  <div class="page-head">
    <div class="container">
      <p class="label page-head__eyebrow">Errore 404</p>
      <h1 class="page-title">Pagina non trovata</h1>
      <p class="page-intro">L’indirizzo potrebbe essere cambiato o non esistere più.</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="${href(ctx, 'progetti/')}">Vai ai progetti</a>
        <a class="btn" href="${href(ctx)}">Torna alla home</a>
      </div>
    </div>
  </div>`;
    return page(ctx, {
      path: '404.html',
      file: '404.html',
      current: '',
      title: `Pagina non trovata — ${site.name}`,
      description: 'La pagina richiesta non è disponibile.',
      canonical: false,
      noindex: true,
      main,
    });
  }

  return {
    home,
    projectsIndex,
    project,
    tools,
    notFound,
    warnings,
  };
}
