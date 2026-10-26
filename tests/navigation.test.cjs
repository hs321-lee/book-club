const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

// Run the real scripts against a small DOM/event fixture without browser dependencies.
// Layout, browser focus behavior and rendering still need browser verification.
async function loadApp(hash = '#home', candidateLoadFails = false) {
  const root = join(__dirname, '..');
  const candidateScript = readFileSync(join(root, 'november-data.js'), 'utf8');
  const candidateMarkup = candidateScript.match(/insertAdjacentHTML\('afterend', `([\s\S]*?)`\)/)[1];
  const html = readFileSync(join(root, 'index.html'), 'utf8') + (candidateLoadFails ? '' : candidateMarkup + '<button id="month-november" role="tab" aria-selected="true" aria-controls="november" data-month="november"></button>');
  const elements = new Map();
  const listeners = new Map();
  const location = { hash, href: 'http://localhost/' };
  const document = { activeElement: null };
  const attributes = text => Object.fromEntries([...text.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(match => [match[1], match[2] ?? '']));
  function element(attrs = {}) {
    const handlers = new Map();
    const node = {
      id: attrs.id, hidden: 'hidden' in attrs, style: { setProperty() {}, removeProperty() {} },
      dataset: Object.fromEntries(Object.entries(attrs).filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5), value])),
      classList: { contains: () => false, add() {}, remove() {}, toggle() {} },
      children: [], value: '', innerHTML: '', scrollLeft: 0, clientWidth: 1000,
      offsetLeft: 0, offsetWidth: 100,
      getAttribute: key => attrs[key], setAttribute: (key, value) => { attrs[key] = value; },
      hasAttribute: key => key in attrs, removeAttribute: key => { delete attrs[key]; },
      addEventListener(type, fn) { if (!handlers.has(type)) handlers.set(type, []); handlers.get(type).push(fn); },
      querySelectorAll: () => [], querySelector: () => null, closest: () => null,
      contains: () => false, append() {}, remove() {},
      focus() { document.activeElement = node; },
      scrollIntoView() { node.scrolled = true; },
      click() {
        const event = { target: node, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
        for (const fn of handlers.get('click') || []) fn(event);
        if (attrs.href?.startsWith('#') && !event.defaultPrevented) {
          location.hash = attrs.href;
          for (const fn of listeners.get('hashchange') || []) fn();
        }
      }
    };
    return node;
  }
  const tagged = [...html.matchAll(/<([a-z][\w-]*)\b([^>]*?)>/g)].map(match => ({ tag: match[1], attrs: attributes(match[2]) }));
  for (const { attrs } of tagged) if (attrs.id) elements.set('#' + attrs.id, element(attrs));
  for (const name of ['skip-link', 'wordmark']) {
    const { attrs } = tagged.find(item => item.attrs.class?.split(' ').includes(name));
    elements.set('.' + name, element(attrs));
  }
  const tabs = tagged.filter(item => item.attrs['data-tab']).map(item => elements.get('#' + item.attrs.id));
  const months = tagged.filter(item => item.attrs['data-month']).map(item => elements.get('#' + item.attrs.id));
  document.documentElement = element();
  document.querySelector = selector => {
    if (!elements.has(selector)) elements.set(selector, element());
    return elements.get(selector);
  };
  document.getElementById = id => elements.get('#' + id) || null;
  document.querySelectorAll = selector => selector === '.menu-bar .tabs [role="tab"]' ? tabs : selector === '.month-tabs [role="tab"]' ? months : [];
  document.createElement = () => element();
  document.head = { append(script) {
    if (candidateLoadFails) { script.onerror(); return; }
    const additions = JSON.parse(candidateScript.match(/const additions = ([\s\S]*?);\n  for/)[1]);
    const data = window.BOOK_CLUB;
    for (const key of ['works', 'candidateMeetings']) data[key].push(...additions[key]);
    Object.assign(data.covers, additions.covers);
    Object.assign(data.meetings, additions.meetings);
    script.onload();
  } };
  const documentHandlers = new Map();
  document.addEventListener = (type, handler) => {
    if (!documentHandlers.has(type)) documentHandlers.set(type, []);
    documentHandlers.get(type).push(handler);
  };
  const window = {
    matchMedia: () => ({ matches: true, addEventListener() {} }),
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(fn); }
  };
  const history = { pushState(_state, _title, next) { location.hash = next; } };
  const context = vm.createContext({ window, document, location, history, URL });
  vm.runInContext(readFileSync(join(root, 'data.js'), 'utf8'), context);
  await vm.runInContext(readFileSync(join(root, 'app.js'), 'utf8'), context);
  return { document, location, elements, tabs, anchor: href => element({ href }), openCandidate(id) {
    const opener = element();
    opener.dataset.workOpen = id;
    const event = { target: { closest: selector => selector === '[data-work-open]' ? opener : null } };
    for (const handler of documentHandlers.get('click') || []) handler(event);
  } };
}

for (const [title, href, panel] of [
  ['작별하지 않는다', '#record-2025-02', 'record-2025-02'],
  ['인생의 짧음에 관하여', '#first-meeting', 'first-meeting'],
  ['나미야 잡화점의 기적', '#september', 'september'],
  ['히틀러의 음식을 먹는 여자들', '#october', 'october']
]) {
  test(`${title}: selected-book card links to its discussion`, async () => {
    const app = await loadApp('#history');
    const card = app.elements.get('#history-list').innerHTML.split('<article class="history-book">').find(markup => markup.includes(`<h2>${title}</h2>`));
    assert.ok(card?.includes(`class="history-discussion-link" href="${href}"`), 'discussion link is rendered in the matching book card');
    app.anchor(href).click();
    assert.equal(app.elements.get('#' + panel).hidden, false);
    assert.equal(app.elements.get('#meetings').hidden, false);
  });
}

for (const hash of ['#home', '#works', '#history', '#october', '#september', '#first-meeting', '#record-2025-02']) {
  test(`skip link preserves ${hash} and focuses the main content`, async () => {
    const app = await loadApp(hash);
    const title = app.document.title;
    const selectedTab = app.tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
    app.elements.get('.skip-link').click();
    assert.equal(app.location.hash, hash);
    assert.equal(app.document.title, title);
    assert.equal(selectedTab.getAttribute('aria-selected'), 'true');
    assert.equal(app.document.activeElement, app.elements.get('#main'));
    assert.equal(app.elements.get('#main').scrolled, true);
  });
}

for (const hash of ['#october-discussion', '#october-people', '#candidates']) {
  test(`${hash} opens the October record`, async () => {
    const app = await loadApp(hash);
    assert.equal(app.elements.get('#meetings').hidden, false);
    assert.equal(app.elements.get('#october').hidden, false);
    assert.equal(app.elements.get('#september').hidden, true);
    assert.equal(app.elements.get(hash).scrolled, true);
  });
}

for (const hash of ['#november', '#november-candidates']) {
  test(`${hash} opens November candidates without marking a book as selected`, async () => {
    const app = await loadApp(hash);
    assert.equal(app.elements.get('#meetings').hidden, false);
    assert.equal(app.elements.get('#november').hidden, false);
    assert.equal(app.elements.get('#october').hidden, true);
    assert.equal(app.elements.get('#month-november').getAttribute('aria-selected'), 'true');
    assert.match(app.elements.get('#now-reading-label').textContent, /최근에 함께 읽은 책 · 10월 · 15번째/);
    assert.doesNotMatch(app.elements.get('#archive-meeting-list').innerHTML, /2026년 11월/);
    assert.doesNotMatch(app.elements.get('#work-list').innerHTML, /cities-book|kokoro-book|cocktail-book/);
  });
}

test('candidate script failure preserves the existing home and October pages', async () => {
  const app = await loadApp('#october', true);
  assert.equal(app.elements.get('#meetings').hidden, false);
  assert.equal(app.elements.get('#october').hidden, false);
  assert.match(app.elements.get('#now-reading-label').textContent, /최근에 함께 읽은 책 · 10월 · 15번째/);
});

for (const [id, title, question] of [
  ['cities-book', '도시는 무엇으로 사는가', '내가 좋아하는 동네는 무엇 때문에 좋은가?'],
  ['kokoro-book', '마음', '솔직한 고백은 누구를 위한 행동일까?'],
  ['cocktail-book', '칵테일, 러브, 좀비', '가장 마음에 남거나 불편했던 이야기는 무엇인가?']
]) {
  test(`${title}: candidate detail reads the public book profile without participant history`, async () => {
    const app = await loadApp('#november');
    app.openCandidate(id);
    assert.equal(app.elements.get('#book-detail').hidden, false);
    assert.equal(app.elements.get('#book-detail-title').textContent, title);
    assert.ok(app.elements.get('#book-detail-body').innerHTML.includes(question));
    assert.match(app.elements.get('#book-detail-body').innerHTML, /추천 이유/);
    assert.match(app.elements.get('#book-detail-body').innerHTML, /마리오님 추천/);
  });
}
