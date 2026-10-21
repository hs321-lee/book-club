const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

// Run the real scripts against a small DOM/event fixture without browser dependencies.
// Layout, browser focus behavior and rendering still need browser verification.
function loadApp(hash = '#home') {
  const root = join(__dirname, '..');
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const elements = new Map();
  const listeners = new Map();
  const location = { hash };
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
      contains: () => false, append() {},
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
  document.addEventListener = () => {};
  const window = {
    matchMedia: () => ({ matches: true, addEventListener() {} }),
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(fn); }
  };
  const history = { pushState(_state, _title, next) { location.hash = next; } };
  const context = vm.createContext({ window, document, location, history });
  vm.runInContext(readFileSync(join(root, 'data.js'), 'utf8'), context);
  vm.runInContext(readFileSync(join(root, 'app.js'), 'utf8'), context);
  return { document, location, elements, tabs, anchor: href => element({ href }) };
}

for (const [title, href, panel] of [
  ['작별하지 않는다', '#record-2025-02', 'record-2025-02'],
  ['인생의 짧음에 관하여', '#first-meeting', 'first-meeting'],
  ['나미야 잡화점의 기적', '#september', 'september'],
  ['히틀러의 음식을 먹는 여자들', '#october', 'october']
]) {
  test(`${title}: selected-book card links to its discussion`, () => {
    const app = loadApp('#history');
    const card = app.elements.get('#history-list').innerHTML.split('<article class="history-book">').find(markup => markup.includes(`<h2>${title}</h2>`));
    assert.ok(card?.includes(`class="history-discussion-link" href="${href}"`), 'discussion link is rendered in the matching book card');
    app.anchor(href).click();
    assert.equal(app.elements.get('#' + panel).hidden, false);
    assert.equal(app.elements.get('#meetings').hidden, false);
  });
}

for (const hash of ['#home', '#works', '#history', '#october', '#september', '#first-meeting', '#record-2025-02']) {
  test(`skip link preserves ${hash} and focuses the main content`, () => {
    const app = loadApp(hash);
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
  test(`${hash} opens the October record`, () => {
    const app = loadApp(hash);
    assert.equal(app.elements.get('#meetings').hidden, false);
    assert.equal(app.elements.get('#october').hidden, false);
    assert.equal(app.elements.get('#september').hidden, true);
    assert.equal(app.elements.get(hash).scrolled, true);
  });
}
