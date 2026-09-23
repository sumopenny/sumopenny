import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(projectRoot, 'profile.config.json');
const templatePath = path.join(projectRoot, 'templates', 'README.template.md');
const outputPath = path.join(projectRoot, 'README.md');

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const template = fs.readFileSync(templatePath, 'utf8');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderParagraphs(items) {
  return items.map((item) => '<p>' + escapeHtml(item) + '</p>').join('\n\n');
}

function renderBullets(items) {
  return items.map((item) => '- ' + escapeHtml(item)).join('\n');
}

function renderLinks(links) {
  const entries = [
    {
      label: 'GitHub',
      icon: 'github',
      url: links.github,
      color: 'B8B3B8'
    },
    {
      label: 'Website',
      icon: 'googlechrome',
      url: links.website,
      color: 'D6A0B0'
    },
    {
      label: 'Email',
      icon: 'maildotru',
      url: links.email ? 'mailto:' + links.email : '',
      color: 'E7C39D'
    }
  ].filter((entry) => entry.url);

  return entries.map((entry) => {
    const badgeUrl = 'https://img.shields.io/badge/' +
      encodeURIComponent(entry.label) + '-' + entry.color +
      '?style=flat-square&logo=' + entry.icon + '&logoColor=ffffff';
    return '<a href="' + escapeHtml(entry.url) + '"><img src="' + badgeUrl +
      '" alt="' + escapeHtml(entry.label) + '" /></a>';
  }).join(' ');
}

function renderTechBadges(skills) {
  return skills.map((skill) => {
    const badgeUrl = 'https://img.shields.io/badge/' +
      encodeURIComponent(skill.label) + '-' + skill.color +
      '?style=flat-square&logo=' + skill.logo + '&logoColor=ffffff';
    return '<a href="' + escapeHtml(skill.url) + '"><img src="' + badgeUrl +
      '" alt="' + escapeHtml(skill.label) + '" /></a>';
  }).join(' ');
}

// 将项目配置排成两列卡片，保持 GitHub README 在桌面和移动端都容易浏览。
function renderProjectCards(projects) {
  const rows = [];
  for (let index = 0; index < projects.length; index += 2) {
    const cells = projects.slice(index, index + 2).map((project) => {
      const liveLink = project.homepage
        ? ' · <a href="' + escapeHtml(project.homepage) + '">Live demo ↗</a>'
        : '';
      return '<td width="50%" valign="top">\n\n' +
        '<h3><a href="' + escapeHtml(project.url) + '">' +
        escapeHtml(project.name) + '</a></h3>\n' +
        '<p>' + escapeHtml(project.description) + '</p>\n' +
        '<p><code>' + escapeHtml(project.language) + '</code>' + liveLink +
        '</p>\n\n</td>';
    });
    if (cells.length === 1) {
      cells.push('<td width="50%" valign="top"></td>');
    }
    rows.push('<tr>\n' + cells.join('\n') + '\n</tr>');
  }

  return '<table>\n' + rows.join('\n') + '\n</table>';
}

const replacements = {
  DISPLAY_NAME: escapeHtml(config.displayName),
  HEADLINE: escapeHtml(config.headline),
  TAGLINE: escapeHtml(config.tagline),
  TYPING_LINES: encodeURIComponent(config.tagline),
  LOCATION: escapeHtml(config.location),
  USERNAME: escapeHtml(config.username),
  STATUS: escapeHtml(config.status),
  ABOUT: renderParagraphs(config.about),
  NOW: renderBullets(config.now),
  LINKS: renderLinks(config.links),
  TECH_BADGES: renderTechBadges(config.skills),
  PROJECT_CARDS: renderProjectCards(config.projects),
  FOOTER: escapeHtml(config.footer)
};

const readme = template.replace(/{{([A-Z0-9_]+)}}/g, (match, key) => {
  if (!(key in replacements)) {
    throw new Error('Missing replacement for template token: ' + match);
  }
  return replacements[key];
});

const unresolved = readme.match(/{{[^}]+}}/g);
if (unresolved) {
  throw new Error('Unresolved template tokens: ' + unresolved.join(', '));
}

fs.writeFileSync(outputPath, readme.trim() + '\n', 'utf8');
console.log('Rendered ' + path.relative(projectRoot, outputPath) + ' from profile.config.json');
