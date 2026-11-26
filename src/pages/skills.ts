import type { Page } from '../app';
import { MONSTERS, RANKS, SKILLS, SKILL_BY_JP, esc, hashFor, iconSrc, rankBadge } from '../lib';
import { skillEntryHtml } from './reference';
import type { SkillSet } from '../lib';

function findSkill(name: string): SkillSet | undefined {
  return SKILLS.find((s) => s.name === name);
}

function skillRow(s: SkillSet): string {
  return `<tr>
    <td><a href="${hashFor(`skill/${encodeURIComponent(s.name)}`)}"><strong>${esc(s.name)}</strong></a>
      <div class="jp">${esc(s.jp)}</div></td>
    <td class="num">${s.count}</td>
    <td class="num">${s.sp.length}</td>
    <td class="small muted">${
      s.count
        ? `${s.monsters
            .slice(0, 4)
            .map((m) => esc(m.name))
            .join(', ')}${s.count > 4 ? '…' : ''}`
        : '<span class="muted">No dex monster holds it</span>'
    }</td>
  </tr>`;
}

/** A link to another skill set, given its Japanese name. */
function setLink(name: string | undefined): string {
  if (!name) return '';
  const set = SKILL_BY_JP.get(name);
  return set
    ? `<a href="${hashFor(`skill/${encodeURIComponent(set.name)}`)}">${esc(set.name)} <span class="jp">${esc(set.jp)}</span></a>`
    : `<span lang="ja">${esc(name)}</span>`;
}

export function renderList(params: URLSearchParams): Page {
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const matches = (term: string): SkillSet[] =>
    SKILLS.filter((s) => !term || s.name.toLowerCase().includes(term) || s.jp.includes(term.trim())).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
  const list = matches(q);
  const evolutions = SKILLS.filter((s) => s.evolvesTo).sort((a, b) => a.name.localeCompare(b.name));

  return {
    title: 'Skill sets',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Skill sets</span></nav>
      <div class="page-head">
        <h1>Skill sets</h1>
        <p class="lede">
          A monster’s skill set is the tree of spells, abilities and traits it learns as it levels. All
          ${SKILLS.length} sets of the reference index are here; open one to see its skill-point table, every monster
          that learns it and the set it evolves from or into.
        </p>
        <div class="meta">
          <span class="badge tag">${SKILLS.length} sets</span>
          <span class="badge tag-gold">${evolutions.length} evolutions</span>
        </div>
      </div>
      <section class="filters">
        <div class="filter-row">
          <span class="label">Search</span>
          <input id="sSearch" class="field" type="search" placeholder="Skill set name…" value="${esc(params.get('q') ?? '')}" style="flex:1;min-width:240px" />
          <a class="btn ghost" href="#/skills">Reset</a>
        </div>
      </section>
      ${evolutions.length
        ? `<section class="card">
            <div class="card-head"><h2>Skill evolution</h2><span class="muted small">スキル進化 · ${evolutions.length} upgrades</span></div>
            <div class="grid auto">
              ${evolutions
                .map(
                  (s) => `<div class="small">${setLink(s.evolvesFrom)} <span class="muted">→</span> ${setLink(s.evolvesTo)}</div>`,
                )
                .join('')}
            </div>
            <p class="small muted" style="margin:10px 0 0">
              Pairs are the reference’s own 進化元 / 進化先 links: the left set is the one a monster starts with and the
              right set the one it can become. Both halves of a pair keep their own skill-point table.
            </p>
          </section>`
        : ''}
      <div class="result-count"><span id="sCount">${list.length} skill set${list.length === 1 ? '' : 's'}</span><span>Sorted by number of monsters</span></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Skill set</th><th class="num">Monsters</th><th class="num">Entries</th><th>Typical holders</th></tr></thead>
          <tbody id="sBody">${list.map(skillRow).join('')}</tbody>
        </table>
      </div>
    `,
    mount: () => {
      const input = document.getElementById('sSearch') as HTMLInputElement | null;
      const body = document.getElementById('sBody');
      const count = document.getElementById('sCount');
      input?.addEventListener('input', () => {
        const next = matches(input.value.trim().toLowerCase());
        if (body) body.innerHTML = next.map(skillRow).join('');
        if (count) count.textContent = `${next.length} skill set${next.length === 1 ? '' : 's'}`;
      });
    },
  };
}

export function renderDetail(name: string): Page {
  const skill = findSkill(name);
  if (!skill) {
    return {
      title: 'Skill set not found',
      html: `<div class="card"><h1>Skill set not found</h1><p>No skill set called <code>${esc(name)}</code>.</p><p><a href="#/skills">Back to skill sets</a></p></div>`,
    };
  }

  const byRank = RANKS.map((rank) => ({
    rank,
    monsters: skill.monsters.filter((m) => m.rank === rank),
  })).filter((g) => g.monsters.length > 0);

  const evolution = skill.evolvesFrom || skill.evolvesTo;

  return {
    title: skill.name,
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><a href="#/skills">Skill sets</a><span class="sep">/</span><span>${esc(skill.name)}</span></nav>
      <div class="page-head">
        <h1>${esc(skill.name)}</h1>
        <div class="jp">${esc(skill.jp)}</div>
        <div class="meta">
          <span class="badge tag">${skill.count} monster${skill.count === 1 ? '' : 's'}</span>
          <span class="badge tag-gold">Skill set</span>
          ${skill.evolvesTo ? '<span class="badge tag-gold">Evolves</span>' : ''}
        </div>
      </div>
      <div class="notice info">
        <p>
          A skill set is learned from level 1 and grows as the monster gains skill points. Monsters sharing a set
          share the same progression of spells, abilities and traits.
        </p>
      </div>

      <section class="card">
        <div class="card-head"><h2>Progression</h2><span class="muted small">${skill.sp.length} entries · 必要SP</span></div>
        ${
          skill.sp.length
            ? `<div class="table-wrap"><table class="data">
                <thead><tr><th class="num">SP</th><th>Learns</th></tr></thead>
                <tbody>${skill.sp
                  .map((r) => `<tr><td class="num">${r.sp}</td><td>${skillEntryHtml(r)}</td></tr>`)
                  .join('')}</tbody>
              </table></div>
              <p class="small muted" style="margin:10px 0 0">
                Thresholds are the skill-point table recorded on every monster that learns this set; all of them
                share the same table. Each entry opens the ability or trait page the reference links it to, with the
                Japanese source beside the English name.
              </p>`
            : `<p class="muted small" style="margin:0">No skill-point table recorded for this set.</p>`
        }
      </section>

      ${evolution
        ? `<section class="card">
            <div class="card-head"><h2>Evolution</h2><span class="muted small">スキル進化</span></div>
            <div class="grid cols-2">
              <div>
                <h3 class="small muted" style="margin:0 0 8px">Evolves from</h3>
                ${skill.evolvesFrom ? `<p>${setLink(skill.evolvesFrom)}</p>` : '<p class="small muted">— this is a base set.</p>'}
              </div>
              <div>
                <h3 class="small muted" style="margin:0 0 8px">Evolves into</h3>
                ${skill.evolvesTo ? `<p>${setLink(skill.evolvesTo)}</p>` : '<p class="small muted">— this set has no evolved form.</p>'}
              </div>
            </div>
            <p class="small muted" style="margin:10px 0 0">
              The two columns are the reference’s 進化元スキル and 進化先スキル fields for this set.
            </p>
          </section>`
        : ''}

      ${skill.combinesFor || skill.other
        ? `<section class="card">
            <div class="card-head"><h2>Other details</h2></div>
            <dl class="dl">
              ${skill.combinesFor ? `<dt>Key fusion use</dt><dd lang="ja">${esc(skill.combinesFor)}</dd>` : ''}
              ${skill.other ? `<dt>Other acquisition</dt><dd lang="ja">${esc(skill.other)}</dd>` : ''}
            </dl>
            <p class="small muted" style="margin:10px 0 0">Source text kept in Japanese.</p>
          </section>`
        : ''}

      ${byRank
        .map(
          (g) => `<section class="card">
            <div class="card-head"><h2>Rank ${g.rank}</h2><span class="muted small">${g.monsters.length} monster${g.monsters.length === 1 ? '' : 's'}</span></div>
            <div class="grid auto">
              ${g.monsters
                .map(
                  (m) => `<a class="mini-mon" href="#/monster/${encodeURIComponent(m.id)}">
                    <span>${esc(m.name)}</span>${rankBadge(m.rank)}
                  </a>`,
                )
                .join('')}
            </div>
          </section>`,
        )
        .join('')}
      <section class="card">
        <div class="card-head"><h2>All holders</h2></div>
        ${
          skill.monsters.length
            ? `<div class="grid auto">
                ${skill.monsters
                  .map(
                    (m) => `<a class="mini-mon" href="#/monster/${encodeURIComponent(m.id)}">
                      ${iconFor(m.id)}<span>${esc(m.name)}</span>${rankBadge(m.rank)}
                    </a>`,
                  )
                  .join('')}
              </div>`
            : `<p class="small muted" style="margin:0">
                No dex monster holds this set as its own: in the reference it comes from a skill crest, a key or an
                evolved set, not from a monster’s starting skill set.
              </p>`
        }
      </section>
    `,
  };
}

function iconFor(id: string): string {
  const icon = MONSTER_ICONS.get(id);
  return icon ? `<img src="${iconSrc(icon)}" alt="" width="28" height="28" loading="lazy" />` : '';
}

const MONSTER_ICONS = new Map(MONSTERS.map((m) => [m.id, m.icon]));
