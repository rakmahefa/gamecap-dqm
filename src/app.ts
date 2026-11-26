import './styles.css';
import { FAMILIES, MONSTERS, RANKS, SKILLS, SIZES, countBy, esc, searchMonsters, iconSrc } from './lib';
import * as home from './pages/home';
import * as monsters from './pages/monsters';
import * as skills from './pages/skills';
import * as breeding from './pages/breeding';
import * as reference from './pages/reference';
import * as chart from './pages/chart';
import * as tools from './pages/tools';
import * as about from './pages/about';

export interface Page {
  title: string;
  html: string;
  mount?: () => void;
}

const view = document.getElementById('view') as HTMLElement;
const sidebar = document.getElementById('sidebar') as HTMLElement;

/* ------------------------------------------------------------------ sidebar */

function sideCard(title: string, body: string): string {
  return `<section class="side-card"><h3>${esc(title)}</h3>${body}</section>`;
}

function buildSidebar(): void {
  const familyCounts = FAMILIES.map(
    (f) => `<li><a href="#/monsters?family=${encodeURIComponent(f)}">${esc(f === '???' ? '???' : f)}<span class="count">${countBy((m) => m.family === f)}</span></a></li>`,
  ).join('');

  sidebar.innerHTML = [
    sideCard(
      'Monster dex',
      `<ul>
        <li><a href="#/monsters">All monsters<span class="count">${MONSTERS.length}</span></a></li>
        <li><a href="#/monsters?sort=total">Stat ranking<span class="count">top</span></a></li>
        <li><a href="#/eggs">Eggs</a></li>
        <li><a href="#/arena">Monster arena</a></li>
        <li><a href="#/favourites">Favourites</a></li>
      </ul>
      <div class="chip-row" style="margin-top:9px">${RANKS.map((r) => `<a href="#/monsters?rank=${r}">${r}</a>`).join('')}</div>
      <div class="chip-row" style="margin-top:6px">${SIZES.map((s) => `<a href="#/monsters?size=${encodeURIComponent(s)}">${s}</a>`).join('')}</div>`,
    ),
    sideCard('By family', `<ul>${familyCounts}</ul>`),
    sideCard(
      'Synthesis',
      `<ul>
        <li><a href="#/breeding">Synthesis calculator</a></li>
        <li><a href="#/monsters?rank=SS">SS-rank recipes</a></li>
        <li><a href="#/monsters?family=%3F%3F%3F">??? family</a></li>
      </ul>`,
    ),
    sideCard(
      'Data',
      `<ul>
        <li><a href="#/skills">Skill sets<span class="count">${SKILLS.length}</span></a></li>
        <li><a href="#/abilities">Spells &amp; abilities</a></li>
        <li><a href="#/traits">Traits</a></li>
        <li><a href="#/weapons">Weapons &amp; forging</a></li>
        <li><a href="#/items">Items &amp; materials</a></li>
        <li><a href="#/keys">Alchemy keys</a></li>
        <li><a href="#/key-rewards">Alchemy-key rewards</a></li>
      </ul>`,
    ),
    sideCard(
      'Walkthrough',
      `<ul>
        <li><a href="#/chart">Chart overview</a></li>
        <li><a href="#/chart/desert">1 · Desert Realm</a></li>
        <li><a href="#/chart/water">2 · Water Realm</a></li>
        <li><a href="#/chart/snow">3 · Snow &amp; Ice Realm</a></li>
        <li><a href="#/chart/sky">4 · Sky Realm</a></li>
        <li><a href="#/chart/rift">5 · Rift Realm</a></li>
        <li><a href="#/chart/ultimate">6 · Ultimate Key</a></li>
        <li><a href="#/chart/mistletoe">7 · Tower of Mistletoe</a></li>
      </ul>`,
    ),
    sideCard(
      'Tools',
      `<ul>
        <li><a href="#/tools">Team builder</a></li>
        <li><a href="#/tools?tab=compare">Compare monsters</a></li>
        <li><a href="#/about">About &amp; data notes</a></li>
      </ul>`,
    ),
  ].join('');
}

/* ------------------------------------------------------------------ router */

interface Route {
  segs: string[];
  params: URLSearchParams;
}

function currentRoute(): Route {
  const raw = location.hash.replace(/^#\/?/, '');
  const [pathPart = '', queryPart = ''] = raw.split('?');
  const segs = pathPart
    .split('/')
    .filter(Boolean)
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    });
  return { segs, params: new URLSearchParams(queryPart) };
}

function resolve({ segs, params }: Route): Page {
  const [head = '', second] = segs;
  switch (head) {
    case '':
      return home.render();
    case 'monsters':
      return monsters.renderList(params);
    case 'monster':
      return monsters.renderDetail(second ?? '');
    case 'breeding':
      return breeding.render(params);
    case 'skills':
      return skills.renderList(params);
    case 'skill':
      return skills.renderDetail(second ?? '');
    case 'traits':
      return reference.renderTraits(params);
    case 'items':
      return reference.renderItems(params);
    case 'weapons':
      return reference.renderWeapons();
    case 'abilities':
      return reference.renderAbilities(params);
    case 'keys':
      return reference.renderAlchemyKeys();
    case 'key-rewards':
      return reference.renderKeyRewards();
    case 'chart':
      return chart.renderChart(second);
    case 'eggs':
      return chart.renderEggs();
    case 'arena':
      return chart.renderArena();
    case 'tools':
      return tools.render(params);
    case 'favourites':
      return tools.renderFavourites();
    case 'about':
      return about.render();
    default:
      return {
        title: 'Not found',
        html: `<div class="card"><h1>Page not found</h1><p>The page <code>${esc(head)}</code> does not exist in this offline compendium.</p><p><a href="#/">Back to the home page</a></p></div>`,
      };
  }
}

function setActiveNav(head: string): void {
  document.querySelectorAll<HTMLAnchorElement>('.main-nav a').forEach((a) => {
    const key = a.dataset.nav ?? '';
    const isActive = key === head || (head === 'monster' && key === 'monsters') || (head === 'skill' && key === 'skills');
    a.classList.toggle('active', isActive);
  });
  sidebar.querySelectorAll<HTMLAnchorElement>('a').forEach((a) => a.classList.remove('active'));
  const href = `#/${head}`;
  sidebar.querySelectorAll<HTMLAnchorElement>('a').forEach((a) => {
    if (a.getAttribute('href') === href) a.classList.add('active');
  });
}

function renderRoute(): void {
  const route = currentRoute();
  const page = resolve(route);
  view.innerHTML = page.html;
  page.mount?.();
  setActiveNav(route.segs[0] ?? '');
  document.title = `${page.title} · DQM2 Offline Compendium`;
  document.body.classList.remove('nav-open');
  const toggle = document.getElementById('navToggle');
  toggle?.setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ------------------------------------------------------------------ global search */

function wireSearch(): void {
  const input = document.getElementById('globalSearch') as HTMLInputElement | null;
  const results = document.getElementById('searchResults') as HTMLElement | null;
  if (!input || !results) return;

  const paint = (): void => {
    const term = input.value;
    if (!term.trim()) {
      results.hidden = true;
      results.innerHTML = '';
      return;
    }
    const found = searchMonsters(term, 8);
    results.hidden = false;
    results.innerHTML = found.length
      ? found
          .map(
            (m) => `<a href="#/monster/${encodeURIComponent(m.id)}">
              <img src="${iconSrc(m.icon)}" alt="" width="26" height="26" />
              <span>${esc(m.name)}</span>
              <span class="badge rank rank-${esc(m.rank)}" style="margin-left:auto">${esc(m.rank)}</span>
            </a>`,
          )
          .join('')
      : `<div class="empty">No monster matches “${esc(term)}”.</div>`;
  };

  input.addEventListener('input', paint);
  input.addEventListener('focus', paint);
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      const first = results.querySelector<HTMLAnchorElement>('a');
      if (first) location.hash = first.getAttribute('href') ?? '#/monsters';
    }
    if (ev.key === 'Escape') {
      results.hidden = true;
      input.blur();
    }
  });
  document.addEventListener('click', (ev) => {
    if (!(ev.target instanceof Node)) return;
    if (!results.contains(ev.target) && ev.target !== input) results.hidden = true;
  });
}

/* ------------------------------------------------------------------ boot */

function boot(): void {
  buildSidebar();
  wireSearch();
  document.getElementById('navToggle')?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    document.getElementById('navToggle')?.setAttribute('aria-expanded', String(open));
  });
  window.addEventListener('hashchange', renderRoute);
  renderRoute();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    // The worker calls `skipWaiting()` + `clients.claim()`, so a new deployment
    // takes control while this page is still running the old bundle. Reloading
    // once on `controllerchange` swaps the page over instead of leaving it
    // stale until the reader closes the tab. A first install has no previous
    // controller, so it never reloads.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloading) return;
      reloading = true;
      location.reload();
    });

    window.addEventListener('load', () => {
      // `updateViaCache: 'none'` bypasses the HTTP cache for sw.js itself, so a
      // new deployment is detected on the next visit instead of up to 10 min later.
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {
        /* the app still works offline as a cached page bundle */
      });
    });
  }
}

boot();
