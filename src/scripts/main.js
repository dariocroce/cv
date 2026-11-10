/*
 * Portfolio Dario Croce — JavaScript progressivo, nessuna dipendenza.
 * Il sito funziona anche senza JavaScript: questo file aggiunge soltanto
 *   1. il menu compatto su schermi piccoli;
 *   2. i filtri per area nella pagina Progetti.
 */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* 1. Menu di navigazione su schermi piccoli ------------------------------ */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    var wide = window.matchMedia('(min-width: 48rem)');
    var onResize = function () {
      if (wide.matches) setOpen(false);
    };
    if (wide.addEventListener) wide.addEventListener('change', onResize);
  }

  /* 2. Filtri per area nella pagina Progetti ------------------------------- */
  var filters = document.querySelector('[data-filters]');

  if (filters) {
    var buttons = Array.prototype.slice.call(filters.querySelectorAll('[data-filter]'));
    var groups = Array.prototype.slice.call(document.querySelectorAll('[data-category]'));
    var status = document.querySelector('[data-filter-status]');

    var apply = function (value, announce) {
      var total = 0;
      groups.forEach(function (group) {
        var visible = value === 'all' || group.getAttribute('data-category') === value;
        group.hidden = !visible;
        if (visible) total += Number(group.getAttribute('data-count')) || 0;
      });
      buttons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === value));
      });
      if (announce && status) {
        var noun = total === 1 ? 'progetto' : 'progetti';
        var active = buttons.filter(function (button) {
          return button.getAttribute('data-filter') === value;
        })[0];
        status.textContent = value === 'all'
          ? 'Mostrate tutte le aree: ' + total + ' ' + noun + '.'
          : total + ' ' + noun + ' in ' + active.getAttribute('data-label') + '.';
      }
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter');
        apply(value, true);
        if (window.history && history.replaceState) {
          history.replaceState(null, '', value === 'all' ? location.pathname + location.search : '#' + value);
        }
      });
    });

    filters.hidden = false;

    var initial = decodeURIComponent(location.hash.replace(/^#/, ''));
    var known = buttons.some(function (button) {
      return button.getAttribute('data-filter') === initial;
    });
    if (initial && known) apply(initial, false);

    window.addEventListener('hashchange', function () {
      var value = decodeURIComponent(location.hash.replace(/^#/, ''));
      var match = buttons.some(function (button) {
        return button.getAttribute('data-filter') === value;
      });
      apply(match ? value : 'all', true);
    });
  }
})();
