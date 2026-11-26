import type { Page } from '../app';
import { MONSTERS, RANKS, SKILLS, esc, hashFor, iconSrc, rankBadge } from '../lib';
import type { SkillSet } from '../lib';

function findSkill(name: string): SkillSet | undefined {
  return SKILLS.find((s) => s.name === name);
}

export function renderList(params: URLSearchParams): Page {
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const list = SKILLS.filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.jp.includes(params.get('q') ?? ''),
  ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    title: 'Skill sets',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Skill sets</span></nav>
      <div class="page-head">
        <h1>Skill sets</h1>
        <p class="lede">
          A monster’s skill set is the tree of spells, abilities and traits it learns as it levels. There are
          ${SKILLS.length} sets in this compendium; open one to see every monster that learns it.
        </p>
      </div>
      <section class="filters">
        <div class="filter-row">
          <span class="label">Search</span>
          <input id="sSearch" class="field" type="search" placeholder="Skill set name…" value="${esc(params.get('q') ?? '')}" style="flex:1;min-width:240px" />
          <a class="btn ghost" href="#/skills">Reset</a>
        </div>
      </section>
      <div class="result-count"><span id="sCount">${list.length} skill set${list.length === 1 ? '' : 's'}</span><span>Sorted by number of monsters</span></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Skill set</th><th class="num">Monsters</th><th>Typical holders</th></tr></thead>
          <tbody id="sBody">${list
            .map(
              (s) => `<tr>
                <td><a href="${hashFor(`skill/${encodeURIComponent(s.name)}`)}"><strong>${esc(s.name)}</strong></a>
                  <div class="jp">${esc(s.jp)}</div></td>
                <td class="num">${s.count}</td>
                <td class="small muted">${s.monsters
                  .slice(0, 4)
                  .map((m) => esc(m.name))
                  .join(', ')}${s.count > 4 ? '…' : ''}</td>
              </tr>`,
            )
            .join('')}</tbody>
        </table>
      </div>
    `,
    mount: () => {
      const input = document.getElementById('sSearch') as HTMLInputElement | null;
      const body = document.getElementById('sBody');
      const count = document.getElementById('sCount');
      input?.addEventListener('input', () => {
        const term = input.value.trim().toLowerCase();
        const next = SKILLS.filter(
          (s) => !term || s.name.toLowerCase().includes(term) || s.jp.includes(input.value.trim()),
        ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
        if (body) {
          body.innerHTML = next
            .map(
              (s) => `<tr>
                <td><a href="${hashFor(`skill/${encodeURIComponent(s.name)}`)}"><strong>${esc(s.name)}</strong></a>
                  <div class="jp">${esc(s.jp)}</div></td>
                <td class="num">${s.count}</td>
                <td class="small muted">${s.monsters
                  .slice(0, 4)
                  .map((m) => esc(m.name))
                  .join(', ')}${s.count > 4 ? '…' : ''}</td>
              </tr>`,
            )
            .join('');
        }
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
        </div>
      </div>
      <div class="notice info">
        <p>
          A skill set is learned from level 1 and grows as the monster gains skill points. Monsters sharing a set
          share the same progression of spells, abilities and traits.
        </p>
      </div>
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
        <div class="grid auto">
          ${skill.monsters
            .map(
              (m) => `<a class="mini-mon" href="#/monster/${encodeURIComponent(m.id)}">
                ${iconFor(m.id)}<span>${esc(m.name)}</span>${rankBadge(m.rank)}
              </a>`,
            )
            .join('')}
        </div>
      </section>
    `,
  };
}

function iconFor(id: string): string {
  const icon = MONSTER_ICONS.get(id);
  return icon ? `<img src="${iconSrc(icon)}" alt="" width="28" height="28" loading="lazy" />` : '';
}

const MONSTER_ICONS = new Map(MONSTERS.map((m) => [m.id, m.icon]));
