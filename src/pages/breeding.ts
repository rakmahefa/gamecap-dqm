import type { Page } from '../app';
import { FAMILIES, MONSTERS, RANKS, esc, famBadge, iconSrc, rankBadge } from '../lib';

/** Family-pair table for rank synthesis (位階配合), as recorded for the 3DS release.
 *  Each entry: [result family, family A, family B]. */
const COMBOS: [string, string, string][] = [
  ['Slime', 'Dragon', 'Zombie'],
  ['Slime', 'Nature', 'Demon'],
  ['Slime', 'Material', 'Zombie'],
  ['Dragon', 'Slime', 'Nature'],
  ['Dragon', 'Nature', 'Beast'],
  ['Dragon', 'Beast', 'Demon'],
  ['Nature', 'Beast', 'Material'],
  ['Nature', 'Material', 'Demon'],
  ['Nature', 'Demon', 'Zombie'],
  ['Beast', 'Slime', 'Zombie'],
  ['Beast', 'Dragon', 'Nature'],
  ['Beast', 'Nature', 'Material'],
  ['Material', 'Slime', 'Dragon'],
  ['Material', 'Dragon', 'Beast'],
  ['Material', 'Beast', 'Zombie'],
  ['Demon', 'Slime', 'Material'],
  ['Demon', 'Dragon', 'Material'],
  ['Demon', 'Nature', 'Zombie'],
  ['Zombie', 'Slime', 'Beast'],
  ['Zombie', 'Slime', 'Demon'],
  ['Zombie', 'Dragon', 'Demon'],
];

function resultFor(a: string, b: string): string | undefined {
  if (!a || !b) return undefined;
  const hit = COMBOS.find(
    ([, x, y]) => (x === a && y === b) || (x === b && y === a),
  );
  return hit?.[0];
}

function candidates(family: string): string {
  const list = MONSTERS.filter((m) => m.family === family).sort(
    (a, b) => (a.no ?? 9999) - (b.no ?? 9999),
  );
  return list
    .slice(0, 60)
    .map(
      (m) => `<a class="mini-mon" href="#/monster/${encodeURIComponent(m.id)}">
        <img src="${iconSrc(m.icon)}" alt="" width="28" height="28" loading="lazy" />
        <span>${esc(m.name)}</span>${rankBadge(m.rank)}
      </a>`,
    )
    .join('');
}

function familySelect(id: string, label: string): string {
  return `<label class="small muted" style="display:grid;gap:4px">${esc(label)}
    <select class="field" id="${id}">
      <option value="">— choose a family —</option>
      ${FAMILIES.map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join('')}
    </select>
  </label>`;
}

export function render(params: URLSearchParams): Page {
  const famA = params.get('a') ?? '';
  const famB = params.get('b') ?? '';
  const result = resultFor(famA, famB);

  return {
    title: 'Synthesis',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Synthesis</span></nav>
      <div class="page-head">
        <h1>Synthesis</h1>
        <p class="lede">
          The ranch’s synthesis altar fuses two monsters into one. The pair of families decides which family the
          child belongs to; the parents’ rank values then decide which monster of that family you receive.
        </p>
      </div>

      <section class="card">
        <div class="card-head"><h2>Family combinations</h2><span class="muted small">Rank synthesis (位階配合)</span></div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Child family</th><th>Parent pair</th><th></th></tr></thead>
            <tbody>
              ${COMBOS.map(
                ([child, a, b]) => `<tr>
                  <td>${famBadge(child)}</td>
                  <td>${famBadge(a)} <span class="muted small">×</span> ${famBadge(b)}</td>
                  <td class="small muted">${child} family</td>
                </tr>`,
              ).join('')}
            </tbody>
          </table>
        </div>
        <p class="small muted" style="margin-top:10px;margin-bottom:0">
          The ??? family cannot be produced by rank synthesis — those monsters only come from special recipes,
          events or boss encounters.
        </p>
      </section>

      <section class="card">
        <div class="card-head"><h2>What will I get?</h2></div>
        <div class="grid cols-2">
          ${familySelect('famA', 'First parent’s family')}
          ${familySelect('famB', 'Second parent’s family')}
        </div>
        <div id="breedResult" style="margin-top:14px">
          ${
            result
              ? `<div class="notice info"><p>This pairing belongs to the <strong>${esc(result)}</strong> family. Candidates from that family:</p></div>
                 <div class="grid auto">${candidates(result)}</div>`
              : `<p class="muted small">Choose two families to see the resulting family and its monsters.</p>`
          }
        </div>
        <p class="small muted" style="margin-top:12px;margin-bottom:0">
          Every monster of the resulting family is listed, ordered by dex number. In game, the parents’ rank values
          select the child within that family — higher-ranked parents push the result towards stronger monsters.
        </p>
      </section>

      <div class="grid cols-2">
        <section class="card">
          <div class="card-head"><h2>Plus values</h2></div>
          <p class="small">
            Each synthesis adds the parents’ plus values. At <strong>+25</strong>, <strong>+50</strong> and
            <strong>+★</strong> a monster unlocks extra traits — the ones marked as plus traits on its record. Feeding
            duplicates of the same monster is the usual way to push the count up.
          </p>
        </section>
        <section class="card">
          <div class="card-head"><h2>Special synthesis</h2></div>
          <p class="small">
            Some monsters ignore the family table entirely: they need an exact pair (or four specific monsters).
            Those recipes are monster-specific and are not part of this offline dataset — the
            <a href="#/monsters?rank=SS">SS rank</a> and <a href="#/monsters?family=%3F%3F%3F">??? family</a> lists
            are where most of them live.
          </p>
        </section>
      </div>

      <section class="card">
        <div class="card-head"><h2>Rank ladder</h2></div>
        <div class="badge-list">
          ${RANKS.map((r) => `<a class="badge rank rank-${r}" href="#/monsters?rank=${r}" style="padding:4px 10px">${r}</a>`).join('')}
        </div>
        <p class="small muted" style="margin:10px 0 0">
          Rank sets the ceiling. Synthesising two high-rank monsters is the only way to climb past rank A without
          events.
        </p>
      </section>
    `,
    mount: () => {
      const a = document.getElementById('famA') as HTMLSelectElement | null;
      const b = document.getElementById('famB') as HTMLSelectElement | null;
      const out = document.getElementById('breedResult');
      if (!a || !b || !out) return;
      a.value = famA;
      b.value = famB;

      const paint = (): void => {
        const fam = resultFor(a.value, b.value);
        if (!fam) {
          out.innerHTML = '<p class="muted small">Choose two families to see the resulting family and its monsters.</p>';
          return;
        }
        out.innerHTML = `<div class="notice info"><p>This pairing belongs to the <strong>${esc(fam)}</strong> family. Candidates from that family:</p></div>
          <div class="grid auto">${candidates(fam)}</div>`;
        history.replaceState(null, '', `#/breeding?a=${encodeURIComponent(a.value)}&b=${encodeURIComponent(b.value)}`);
      };
      a.addEventListener('change', paint);
      b.addEventListener('change', paint);
    },
  };
}
