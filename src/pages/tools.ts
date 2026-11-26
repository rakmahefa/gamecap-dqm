import type { Page } from '../app';
import {
  MONSTERS,
  STAT_LABELS,
  esc,
  famBadge,
  fmt,
  getFavourites,
  iconSrc,
  monsterCell,
  rankBadge,
  sizeBadge,
  sumStats,
} from '../lib';
import type { Monster, StatKey } from '../lib';

const SIZE_WEIGHT: Record<string, number> = { S: 1, M: 2, G: 3, 'Super G': 4 };

const SORTED = [...MONSTERS].sort((a, b) => a.name.localeCompare(b.name));

function options(selected?: string): string {
  return `<option value="">— choose a monster —</option>${SORTED.map(
    (m) =>
      `<option value="${m.id}" ${selected === m.id ? 'selected' : ''}>${esc(m.name)} (${esc(m.rank)}, ${esc(m.size)})</option>`,
  ).join('')}`;
}

function slot(index: number): string {
  return `<div class="slot" data-slot="${index}">
    <div class="slot-icon" data-icon>${''}</div>
    <div class="slot-fields">
      <select class="field" data-select="${index}" aria-label="Monster ${index + 1}">${options()}</select>
      <span class="slot-stats" data-stats>Empty slot</span>
    </div>
  </div>`;
}

export function render(params: URLSearchParams): Page {
  const compareMode = params.get('tab') === 'compare';

  return {
    title: 'Tools',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Tools</span></nav>
      <div class="page-head">
        <h1>Planning tools</h1>
        <p class="lede">
          Everything here runs on the offline dataset — no requests, no saving to a server. Build a three-monster
          team to add up stat caps, or put two monsters side by side.
        </p>
      </div>

      <section class="card" id="builder">
        <div class="card-head"><h2>Team builder</h2><span class="muted small">3 body slots</span></div>
        <div class="builder">
          ${[0, 1, 2].map(slot).join('')}
          <div class="slot" style="border-style:solid;background:#fff">
            <div class="slot-fields">
              <table class="data summary-table" style="font-size:13px">
                <tbody>
                  <tr><td>Body slots used</td><td id="sumSize" class="num">0 / 3</td></tr>
                  ${STAT_LABELS.map(([k, label]) => `<tr><td>${label} (caps)</td><td class="num" data-sum="${k}">0</td></tr>`).join('')}
                  <tr><td>Stat total</td><td class="num" data-sum="total">0</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <p class="small muted" style="margin-top:10px;margin-bottom:0">
          Body slots: S = 1, M = 2, G = 3, Super G = 4. Values are base stat caps, not levelled stats.
        </p>
      </section>

      <section class="card" id="compare" ${compareMode ? '' : 'style="scroll-margin-top:90px"'}>
        <div class="card-head"><h2>Compare monsters</h2><a class="small" href="#/tools?tab=compare">Link to this</a></div>
        <div class="grid cols-2">
          <select class="field" id="cmpA" aria-label="First monster">${options()}</select>
          <select class="field" id="cmpB" aria-label="Second monster">${options()}</select>
        </div>
        <div id="cmpResult" style="margin-top:14px"><p class="muted small">Pick two monsters to compare their base stats.</p></div>
      </section>

      <div class="notice">
        <p>
          <strong>Offline note.</strong> Favourites and any tool state live only in this browser. Nothing is sent
          anywhere — the app ships with its data and images inside the build.
        </p>
      </div>
    `,
    mount: () => {
      const selects = Array.from(document.querySelectorAll<HTMLSelectElement>('[data-select]'));
      const sumSize = document.getElementById('sumSize');
      const sumCells = document.querySelectorAll<HTMLElement>('[data-sum]');

      const recalc = (): void => {
        const chosen = selects.map((s) => MONSTERS.find((m) => m.id === s.value)).filter((m): m is Monster => Boolean(m));
        let slots = 0;
        const totals: Record<string, number> = { hp: 0, mp: 0, atk: 0, def: 0, agi: 0, wis: 0, total: 0 };
        for (const m of chosen) {
          slots += SIZE_WEIGHT[m.size] ?? 1;
          for (const [k] of STAT_LABELS) totals[k] += m.stats[k] ?? 0;
          totals.total += sumStats(m);
        }
        if (sumSize) {
          sumSize.textContent = `${slots} / 3`;
          sumSize.style.color = slots > 3 ? '#b5402f' : '';
        }
        sumCells.forEach((cell) => {
          const key = cell.dataset.sum as string;
          cell.textContent = fmt(totals[key] ?? 0);
        });
      };

      selects.forEach((sel) => {
        sel.addEventListener('change', () => {
          const m = MONSTERS.find((x) => x.id === sel.value);
          const wrapper = sel.closest('.slot');
          const iconBox = wrapper?.querySelector<HTMLElement>('[data-icon]');
          const stats = wrapper?.querySelector<HTMLElement>('[data-stats]');
          if (iconBox) {
            iconBox.innerHTML = m ? `<img src="${iconSrc(m.icon)}" alt="" width="46" height="46" />` : '';
          }
          if (stats) {
            stats.innerHTML = m
              ? `${rankBadge(m.rank)} ${famBadge(m.family)} ${sizeBadge(m.size)} · HP ${fmt(m.stats.hp)} · ATK ${fmt(m.stats.atk)} · AGI ${fmt(m.stats.agi)}`
              : 'Empty slot';
          }
          recalc();
        });
      });
      recalc();

      const cmpA = document.getElementById('cmpA') as HTMLSelectElement | null;
      const cmpB = document.getElementById('cmpB') as HTMLSelectElement | null;
      const out = document.getElementById('cmpResult');

      const paintCompare = (): void => {
        if (!out || !cmpA || !cmpB) return;
        const a = MONSTERS.find((m) => m.id === cmpA.value);
        const b = MONSTERS.find((m) => m.id === cmpB.value);
        if (!a || !b) {
          out.innerHTML = '<p class="muted small">Pick two monsters to compare their base stats.</p>';
          return;
        }
        const rows = STAT_LABELS.map(([k, label]) => {
          const av = a.stats[k] ?? 0;
          const bv = b.stats[k] ?? 0;
          return `<tr>
            <td class="num" style="color:${av >= bv ? 'var(--teal)' : 'inherit'};font-weight:${av >= bv ? '700' : '400'}">${fmt(av)}</td>
            <td class="small muted" style="text-align:center;text-transform:uppercase;letter-spacing:.08em">${label}</td>
            <td class="num" style="color:${bv >= av ? 'var(--teal)' : 'inherit'};font-weight:${bv >= av ? '700' : '400'}">${fmt(bv)}</td>
          </tr>`;
        }).join('');
        out.innerHTML = `
          <div class="grid cols-2" style="margin-bottom:10px">
            <div>${monsterCell(a)}<div class="small muted">${esc(a.family)} · ${esc(a.size)} · ${esc(a.skill)}</div></div>
            <div>${monsterCell(b)}<div class="small muted">${esc(b.family)} · ${esc(b.size)} · ${esc(b.skill)}</div></div>
          </div>
          <div class="table-wrap"><table class="data" style="font-size:13px">
            <tbody>${rows}
              <tr><td class="num"><strong>${fmt(sumStats(a))}</strong></td><td class="small muted center">Total</td><td class="num"><strong>${fmt(sumStats(b))}</strong></td></tr>
            </tbody>
          </table></div>`;
      };

      cmpA?.addEventListener('change', paintCompare);
      cmpB?.addEventListener('change', paintCompare);
    },
  };
}

export function renderFavourites(): Page {
  const ids = getFavourites();
  const list = ids.map((id) => MONSTERS.find((m) => m.id === id)).filter((m): m is Monster => Boolean(m));

  return {
    title: 'Favourites',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Favourites</span></nav>
      <div class="page-head">
        <h1>Favourites</h1>
        <p class="lede">Monsters you starred, stored only in this browser’s local storage.</p>
      </div>
      ${
        list.length
          ? `<div class="grid auto">${list
              .map(
                (m) => `<a class="mini-mon" href="#/monster/${encodeURIComponent(m.id)}">
                  <img src="${iconSrc(m.icon)}" alt="" width="28" height="28" loading="lazy" />
                  <span>${esc(m.name)}</span>${rankBadge(m.rank)}
                </a>`,
              )
              .join('')}</div>`
          : `<div class="card empty">
              <p><strong>No favourites yet.</strong></p>
              <p>Open any monster and press “Add to favourites” — the list appears here.</p>
              <p><a class="btn primary" href="#/monsters">Browse the dex</a></p>
            </div>`
      }
    `,
  };
}

export type { StatKey };
