import type { Page } from '../app';
import {
  MONSTERS,
  RANKS,
  esc,
  famBadge,
  hashFor,
  miniMon,
  rankBadge,
  recipeHtml,
} from '../lib';
import type { BreedRecipe, Monster } from '../lib';

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
  const hit = COMBOS.find(([, x, y]) => (x === a && y === b) || (x === b && y === a));
  return hit?.[0];
}

function rankNo(m: Monster): number {
  return m.breed?.rankNo ?? m.no ?? 9999;
}

/** First monster of a family, above the given rank value, that rank synthesis can make. */
function nextInFamily(family: string, above: number): Monster | undefined {
  if (family === '???') return undefined;
  return MONSTERS.filter(
    (m) => m.family === family && m.breed?.rankSynth && rankNo(m) > above,
  ).sort((a, b) => rankNo(a) - rankNo(b))[0];
}

function topInFamily(family: string): Monster | undefined {
  if (family === '???') return undefined;
  return MONSTERS.filter((m) => m.family === family && m.breed?.rankSynth).sort(
    (a, b) => rankNo(b) - rankNo(a),
  )[0];
}

/* ------------------------------------------------------------ special recipes */

interface PairRecipe {
  result: Monster;
  recipe: BreedRecipe;
  ids: string[];
}

const PAIR_RECIPES: PairRecipe[] = [];
for (const m of MONSTERS) {
  for (const recipe of m.breed?.recipes ?? []) {
    if (recipe.size !== 2) continue;
    if (recipe.ingredients.length === 2 && recipe.ingredients.every((i) => i.id)) {
      PAIR_RECIPES.push({ result: m, recipe, ids: recipe.ingredients.map((i) => i.id as string) });
    } else if (recipe.ingredients.length === 1 && recipe.ingredients[0].id && recipe.family) {
      PAIR_RECIPES.push({ result: m, recipe, ids: [recipe.ingredients[0].id] });
    }
  }
}

function fourBodyMatches(a: Monster, b: Monster): { result: Monster; recipe: BreedRecipe }[] {
  const out: { result: Monster; recipe: BreedRecipe }[] = [];
  for (const m of MONSTERS) {
    for (const recipe of m.breed?.recipes ?? []) {
      if (recipe.size !== 4) continue;
      const ids = recipe.ingredients.map((i) => i.id);
      if (ids.includes(a.id) && ids.includes(b.id)) out.push({ result: m, recipe });
    }
  }
  return out;
}

function specialMatches(a: Monster, b: Monster): PairRecipe[] {
  return PAIR_RECIPES.filter(({ recipe, ids }) => {
    if (recipe.family) {
      return (
        (ids[0] === a.id && b.family === recipe.family) ||
        (ids[0] === b.id && a.family === recipe.family)
      );
    }
    return (ids[0] === a.id && ids[1] === b.id) || (ids[0] === b.id && ids[1] === a.id);
  });
}

/* ------------------------------------------------------------ rank synthesis */

interface Candidate {
  m: Monster;
  note: string;
}

function rankCandidates(a: Monster, b: Monster): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();
  const push = (m: Monster | undefined, note: string): void => {
    if (!m || seen.has(m.id)) return;
    seen.add(m.id);
    out.push({ m, note });
  };
  const hi = Math.max(rankNo(a), rankNo(b));
  const lo = Math.min(rankNo(a), rankNo(b));

  if (a.family === b.family) {
    push(nextInFamily(a.family, hi), `Next ${a.family} monster above rank value ${hi}.`);
    return out;
  }

  if (a.family === '???' || b.family === '???') {
    if (a.family === '???') push(a, 'The ??? parent is carried into the candidates.');
    if (b.family === '???') push(b, 'The ??? parent is carried into the candidates.');
    const other = a.family === '???' ? b : a;
    push(
      topInFamily(other.family),
      `Highest ${other.family} monster rank synthesis can make.`,
    );
    return out;
  }

  push(nextInFamily(a.family, hi), `Next ${a.family} monster above rank value ${hi}.`);
  push(nextInFamily(b.family, hi), `Next ${b.family} monster above rank value ${hi}.`);
  const crossed = resultFor(a.family, b.family);
  if (crossed) {
    push(
      nextInFamily(crossed, lo),
      `${a.family} × ${b.family} adds a ${crossed} candidate above the lower rank value ${lo}.`,
    );
  }
  return out;
}

/* ------------------------------------------------------------ rendering */

function resolveMonster(value: string): Monster | undefined {
  const q = value.trim().toLowerCase();
  if (!q) return undefined;
  return (
    MONSTERS.find((m) => m.id.toLowerCase() === q) ??
    MONSTERS.find((m) => m.name.toLowerCase() === q) ??
    MONSTERS.find((m) => m.jp === value.trim())
  );
}

function parentCard(m: Monster): string {
  return `<div class="card" style="margin:0;padding:12px 14px">
    ${miniMon(m)}
    <div class="small muted" style="margin-top:8px">
      Rank value <strong>${rankNo(m)}</strong> · ${famBadge(m.family)} · ${rankBadge(m.rank)}
      ${m.breed?.rankSynth ? '' : '<span class="badge tag-red">Not made by rank synthesis</span>'}
    </div>
  </div>`;
}

function resultsHtml(a: Monster, b: Monster): string {
  const special = specialMatches(a, b);
  const blocks: string[] = [];

  if (special.length) {
    blocks.push(`<div class="notice info"><p><strong>Special synthesis.</strong> These two monsters match a recipe the source records.</p></div>
      ${special
        .map(
          ({ result, recipe }) => `<div class="card" style="margin-bottom:10px">
            ${recipeHtml(recipe, result)}
          </div>`,
        )
        .join('')}`);
  }

  if (a.id === b.id) {
    blocks.push(`<div class="card" style="margin-bottom:10px">
      <div class="recipe">
        <div class="recipe-parts">${miniMon(a)}<span class="muted">＋</span>${miniMon(b)}</div>
        <div class="recipe-arrow" aria-hidden="true">↓</div>
        <div class="recipe-result">${miniMon(a)}</div>
        <div class="small muted">Same species · the same monster comes back</div>
      </div>
    </div>`);
  } else {
    const candidates = rankCandidates(a, b);
    const gapFamily =
      a.family === b.family ? a.family : rankNo(a) >= rankNo(b) ? a.family : b.family;
    blocks.push(
      candidates.length
        ? `<div class="notice info"><p><strong>Rank synthesis (位階配合).</strong> The parents’ rank values select these candidates.</p></div>
           <div class="grid cols-2">
             ${candidates
               .map(
                 ({ m, note }) => `<div class="card" style="margin:0;padding:12px 14px">
                   ${miniMon(m)}
                   <div class="small muted" style="margin-top:8px">${esc(note)} Rank value ${rankNo(m)}.</div>
                 </div>`,
               )
               .join('')}
           </div>`
        : `<div class="notice"><p><strong>No rank-synthesis result.</strong> The ${esc(gapFamily)} rank ladder stops at
             <strong>${esc(topInFamily(gapFamily)?.name ?? '—')}</strong>, or the monster is above its family’s cap.
             Only a special, four-monster or rebirth route leads further.</p></div>`,
    );
  }

  const four = fourBodyMatches(a, b);
  if (four.length) {
    blocks.push(`<div class="notice info"><p><strong>Four-monster recipe.</strong> These two are ingredients in a
      recipe that also needs the other grandparents listed below.</p></div>
      ${four
        .map(({ result, recipe }) => `<div class="card" style="margin-bottom:10px">${recipeHtml(recipe, result)}</div>`)
        .join('')}`);
  }

  return blocks.join('');
}

function recipePicker(): string {
  const list = MONSTERS.filter((m) => (m.breed?.recipes.length ?? 0) > 0).sort(
    (a, b) => rankNo(a) - rankNo(b) || a.name.localeCompare(b.name),
  );
  return `<label class="small muted" style="display:grid;gap:4px;max-width:420px">
      Monster to make
      <select class="field" id="recipePick">
        ${list
          .map(
            (m) =>
              `<option value="${esc(m.id)}">${esc(m.name)} — ${esc(m.rank)}${m.breed?.rankSynth ? ' · also rank synthesis' : ''}</option>`,
          )
          .join('')}
      </select>
    </label>`;
}

function isRebirth(m: Monster): boolean {
  return Boolean(m.obtain.rebirth || m.obtain.other === 'Rebirth monster');
}

function rebirthTable(): string {
  const list = MONSTERS.filter(isRebirth).sort((a, b) => (a.no ?? 9999) - (b.no ?? 9999));
  return `<div class="table-wrap">
    <table class="data" style="font-size:13px">
      <thead><tr><th>Rebirth monster</th><th>Rebirth of</th><th>Location</th></tr></thead>
      <tbody>
        ${list
          .map((m) => {
            const rb = m.obtain.rebirth;
            const of = rb
              ? (() => {
                  const base = MONSTERS.find((x) => x.name === rb.of || x.jp === rb.of);
                  return base ? miniMon(base) : `<span class="badge tag">${esc(rb.of)}</span>`;
                })()
              : '<span class="muted">Not recorded on the source page</span>';
            const where = rb?.where
              ? esc(rb.where)
              : '<span class="muted">Location not recorded on the source page</span>';
            return `<tr><td>${miniMon(m)}</td><td>${of}</td><td class="small">${where}</td></tr>`;
          })
          .join('')}
      </tbody>
    </table>
  </div>`;
}

export function render(params: URLSearchParams): Page {
  const a = resolveMonster(params.get('a') ?? '');
  const b = resolveMonster(params.get('b') ?? '');
  const picked =
    resolveMonster(params.get('r') ?? '') ??
    MONSTERS.find((m) => m.name === 'Killing Machine 2' && m.breed?.recipes.length) ??
    MONSTERS.find((m) => (m.breed?.recipes.length ?? 0) > 0);

  const initialOut =
    a && b
      ? resultsHtml(a, b)
      : `<p class="muted small">Name two monsters — or pick them from the list — to see what the pair produces.</p>`;
  const initialRecipe = picked
    ? picked.breed?.recipes.map((r) => `<div class="card" style="margin-bottom:10px">${recipeHtml(r, picked)}</div>`).join('') ??
      ''
    : '';

  return {
    title: 'Synthesis',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Synthesis</span></nav>
      <div class="page-head">
        <h1>Synthesis</h1>
        <p class="lede">
          The ranch’s synthesis altar fuses two monsters into one. The pair of families decides which family the
          child belongs to; the parents’ hidden rank values (位階) then select the monster of that family.
        </p>
      </div>

      <section class="card">
        <div class="card-head"><h2>Two-monster calculator</h2><span class="muted small">位階配合 · 特殊配合</span></div>
        <datalist id="monsterNames">
          ${MONSTERS.map((m) => `<option value="${esc(m.name)}"></option>`).join('')}
        </datalist>
        <div class="grid cols-2">
          <label class="small muted" style="display:grid;gap:4px">First parent
            <input class="field" id="parentA" list="monsterNames" autocomplete="off" placeholder="Name or Japanese name…" value="${esc(a?.name ?? '')}" />
          </label>
          <label class="small muted" style="display:grid;gap:4px">Second parent
            <input class="field" id="parentB" list="monsterNames" autocomplete="off" placeholder="Name or Japanese name…" value="${esc(b?.name ?? '')}" />
          </label>
        </div>
        <div id="breedParents" class="grid cols-2" style="margin-top:12px">
          ${a ? parentCard(a) : ''}${b ? parentCard(b) : ''}
        </div>
        <div id="breedResult" style="margin-top:14px">${initialOut}</div>
        <p class="small muted" style="margin:12px 0 0">
          Rank values are the <span lang="ja">位階No.</span> printed on every monster page (and equal to the dex
          order). A pair of the same species returns that species; a pair in one family climbs to the next monster
          the source marks as rank-synthesisable. At <strong>+25</strong> a rank D-or-lower parent counts as C,
          <strong>+50</strong> pushes a B-or-lower parent to A and <strong>+★</strong> turns an S-or-lower parent into
          SS, which changes its rank value — this calculator uses the base values.
        </p>
      </section>

      <section class="card">
        <div class="card-head"><h2>Special &amp; four-monster recipes</h2><span class="muted small">特殊配合 · 4体配合</span></div>
        ${recipePicker()}
        <div id="recipeOut" style="margin-top:12px">${initialRecipe}</div>
        <p class="small muted" style="margin:12px 0 0">
          Every recipe below is printed on the page of the monster it creates. A family chip means any monster of
          that family works as the other parent (種族系統配合). Four-monster recipes need all four grandparents,
          not just the two parents.
        </p>
      </section>

      <section class="card">
        <div class="card-head"><h2>Rebirth monsters</h2><span class="muted small">転生モンスター · ${MONSTERS.filter(isRebirth).length} records</span></div>
        ${rebirthTable()}
        <p class="small muted" style="margin:12px 0 0">
          A rebirth monster appears where its base monster is defeated under the recorded condition. The source page
          carries a location line for 15 of these records; the four without one are marked here instead of guessing.
        </p>
      </section>

      <section class="card">
        <div class="card-head"><h2>Family combinations</h2><span class="muted small">Third candidate, by family</span></div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Third candidate family</th><th>Parent pair</th></tr></thead>
            <tbody>
              ${COMBOS.map(
                ([child, x, y]) => `<tr>
                  <td>${famBadge(child)}</td>
                  <td>${famBadge(x)} <span class="muted small">×</span> ${famBadge(y)}</td>
                </tr>`,
              ).join('')}
            </tbody>
          </table>
        </div>
        <p class="small muted" style="margin-top:10px;margin-bottom:0">
          Two different families also add one candidate from each parent’s own family, above the higher rank value.
          The ??? family cannot be produced by rank synthesis — those monsters only come from special recipes,
          events or boss encounters.
        </p>
      </section>

      <div class="grid cols-2">
        <section class="card">
          <div class="card-head"><h2>Plus values</h2></div>
          <p class="small">
            Each synthesis adds the parents’ plus values. At <strong>+25</strong>, <strong>+50</strong> and
            <strong>+★</strong> a monster unlocks extra traits — the ones marked as plus traits on its record — and
            its effective rank (and therefore its rank value) can rise. Feeding duplicates of the same monster is the
            usual way to push the count up.
          </p>
        </section>
        <section class="card">
          <div class="card-head"><h2>Reading the recipe data</h2></div>
          <p class="small">
            <strong>${MONSTERS.filter((m) => (m.breed?.recipes.length ?? 0) > 0).length}</strong> monsters carry a
            special or four-monster recipe. <strong>${MONSTERS.filter((m) => m.breed?.rankSynth).length}</strong> can
            be produced by rank synthesis, and <strong>${MONSTERS.filter((m) => m.breed?.specialSynth).length}</strong>
            by a special recipe; the rest are scouted, hatched, dropped by bosses or only appear as rebirth monsters.
          </p>
        </section>
      </div>

      <section class="card">
        <div class="card-head"><h2>Rank ladder</h2></div>
        <div class="badge-list">
          ${RANKS.map((r) => `<a class="badge rank rank-${r}" href="#/monsters?rank=${r}" style="padding:4px 10px">${r}</a>`).join('')}
        </div>
        <p class="small muted" style="margin:10px 0 0">
          Rank sets the ceiling. Two high-rank parents still cannot pass their family’s rank-synthesis cap; above it
          you need a special or four-monster recipe.
        </p>
      </section>
    `,
    mount: () => {
      const inputA = document.getElementById('parentA') as HTMLInputElement | null;
      const inputB = document.getElementById('parentB') as HTMLInputElement | null;
      const out = document.getElementById('breedResult');
      const parents = document.getElementById('breedParents');
      if (!inputA || !inputB || !out || !parents) return;

      const paint = (): void => {
        const ma = resolveMonster(inputA.value);
        const mb = resolveMonster(inputB.value);
        parents.innerHTML = `${ma ? parentCard(ma) : ''}${mb ? parentCard(mb) : ''}`;
        out.innerHTML =
          ma && mb
            ? resultsHtml(ma, mb)
            : '<p class="muted small">Name two monsters — or pick them from the list — to see what the pair produces.</p>';
        const url = hashFor('breeding', { a: ma?.id, b: mb?.id, r: params.get('r') ?? undefined });
        history.replaceState(null, '', url);
      };
      inputA.addEventListener('change', paint);
      inputB.addEventListener('change', paint);
      inputA.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') paint();
      });
      inputB.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') paint();
      });

      const pick = document.getElementById('recipePick') as HTMLSelectElement | null;
      const recipeOut = document.getElementById('recipeOut');
      if (pick && recipeOut) {
        if (picked) pick.value = picked.id;
        pick.addEventListener('change', () => {
          const m = resolveMonster(pick.value);
          recipeOut.innerHTML = m
            ? (m.breed?.recipes.map((r) => `<div class="card" style="margin-bottom:10px">${recipeHtml(r, m)}</div>`).join('') ??
              '')
            : '';
          const ma = resolveMonster(inputA.value);
          const mb = resolveMonster(inputB.value);
          history.replaceState(null, '', hashFor('breeding', { a: ma?.id, b: mb?.id, r: m?.id }));
        });
      }
    },
  };
}
