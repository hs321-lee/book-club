const assert = require('node:assert/strict');
const { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { dirname, join, relative, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const root = join(__dirname, '..');
function fixture(t) {
  const path = mkdtempSync(join(tmpdir(), 'book-club-build-'));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  for (const name of ['index.html', 'app.js', 'data.js', 'november-data.js', 'styles.css', 'tokens.css', 'assets', 'mario', 'meetings', 'scripts']) {
    cpSync(join(root, name), join(path, name), { recursive: true });
  }
  return path;
}
function build(path) {
  return spawnSync(process.execPath, ['scripts/build-site.mjs'], { cwd: path, encoding: 'utf8' });
}
function files(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? files(join(path, entry.name)).map(name => join(entry.name, name)) : [entry.name]);
}

test('publishes the full website while excluding maintenance, private, and stale output files', t => {
  const path = fixture(t);
  for (const name of ['AGENTS.md', 'docs/private.md', 'tests/private.cjs', '.github/workflows/private.yml', '.env', 'unknown/private.html', 'assets/private.txt', 'assets/.env', 'mario/private.md', 'dist/stale-private.txt']) {
    mkdirSync(dirname(join(path, name)), { recursive: true });
    writeFileSync(join(path, name), 'must not be published');
  }
  const result = build(path);
  assert.equal(result.status, 0, result.stderr);
  const published = files(join(path, 'dist'));
  for (const name of published) assert.deepEqual(readFileSync(join(path, 'dist', name)), readFileSync(join(root, name)), name);
  const expected = files(root).filter(name => /^(?:index\.html|app\.js|data\.js|november-data\.js|styles\.css|tokens\.css)$/.test(name) || /^(?:assets|mario|meetings)\//.test(name));
  assert.deepEqual(published.sort(), expected.sort());
});

test('published HTML, CSS and data reference local resources inside the output', t => {
  const path = fixture(t);
  const result = build(path);
  assert.equal(result.status, 0, result.stderr);
  const output = join(path, 'dist');
  for (const name of files(output).filter(name => /\.(html|css|js)$/.test(name))) {
    const source = readFileSync(join(output, name), 'utf8');
    const references = name.endsWith('.html') ? [...source.matchAll(/(?:href|src)="([^"]+)"/g)].map(match => match[1])
      : name.endsWith('.css') ? [...source.matchAll(/url\(['"]?([^'"\s)]+)/g)].map(match => match[1])
      : [...source.matchAll(/['"](\.\/?(?:assets\/[^'"\s]+|november-data\.js[^'"\s]*))['"]/g)].map(match => match[1]);
    for (const reference of references.filter(value => !/^(?:#|[a-z]+:|\/\/)/i.test(value))) {
      const target = resolve(output, dirname(name), decodeURIComponent(reference.split(/[?#]/)[0] || '.'));
      assert.ok(!relative(output, target).startsWith('..'), `${name}: outside output: ${reference}`);
      assert.ok(existsSync(target), `${name}: missing ${reference}`);
    }
  }
});

test('rejects a symbolic link in a public directory instead of publishing its private target', t => {
  const path = fixture(t);
  writeFileSync(join(path, 'private.svg'), 'private data');
  symlinkSync('../private.svg', join(path, 'assets/leak.svg'));
  const result = build(path);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /symbolic link/i);
});
