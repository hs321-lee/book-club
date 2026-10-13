(() => {
  'use strict';
  const data = window.BOOK_CLUB;
  if (!data) return;
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];
  function showTab(id, updateHash = true) {
    if (!panels.some(p => p.id === id)) return;
    tabs.forEach(tab => { const active = tab.dataset.tab === id; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    panels.forEach(panel => { panel.hidden = panel.id !== id; });
    if (updateHash) history.pushState(null, '', '#' + id);
    document.title = `${id === 'september' ? '9월 모임' : id === 'october' ? '10월 모임' : '함께 볼 작품'} · 책 사이`;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); showTab(tabs[next].dataset.tab); tabs[next].focus({preventScroll:true}); }
    });
  });
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => { const id = button.dataset.go; showTab(id); tabs.find(tab => tab.dataset.tab === id).focus({preventScroll:true}); document.querySelector('.masthead').scrollIntoView({block:'start'}); }));
  function syncHash() {
    const id = location.hash.slice(1);
    if (panels.some(p => p.id === id)) showTab(id, false);
    else if (['discussion', 'people', 'summary-title'].includes(id)) showTab('september', false);
    else if (id === 'candidates') showTab('october', false);
    else showTab('september', false);
  }
  window.addEventListener('hashchange', syncHash);
  window.addEventListener('popstate', syncHash);
  document.querySelector('.wordmark').addEventListener('click', () => showTab('september', false));
  document.querySelector('#topics').innerHTML = data.topics.map(topic => `<article class="topic"><div class="topic-header"><h3>${escapeHTML(topic.title)}</h3><span class="timestamp">${escapeHTML(topic.time)}</span></div><p>${escapeHTML(topic.summary)}</p><details${topic.spoiler ? ' class="spoiler"' : ''}><summary>${topic.spoiler ? '스포일러 포함 · 펼쳐 읽기' : '대화 맥락 더 읽기'}</summary><p>${escapeHTML(topic.more)}</p></details></article>`).join('');
  document.querySelector('#people-list').innerHTML = data.people.map(person => `<article class="person"><div class="person-head"><span class="person-initial" aria-hidden="true">${escapeHTML(person.initial)}</span><div><h3>${escapeHTML(person.name)}</h3><p class="person-tagline">${escapeHTML(person.tagline)}</p></div></div>${person.paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('')}<details><summary>공유한 생각 더 읽기</summary><p>${escapeHTML(person.more)}</p></details><span class="timestamp">녹음 ${escapeHTML(person.time)}</span></article>`).join('');
  document.querySelector('#candidate-list').innerHTML = data.candidates.map(candidate => `<article class="candidate"><div class="mini-art tone-${candidate.tone}" aria-hidden="true"><span>${escapeHTML(candidate.state)}</span><strong>${escapeHTML(candidate.title)}</strong></div><h3>${escapeHTML(candidate.title)}</h3><p>${escapeHTML(candidate.note)}</p></article>`).join('');
  const search = document.querySelector('#search');
  const media = document.querySelector('#media');
  const context = document.querySelector('#context');
  let searchTimer;
  function renderWorks() {
    const term = search.value.trim().toLocaleLowerCase('ko');
    const matches = data.works.filter(work => (media.value === 'all' || work.media === media.value) && (context.value === 'all' || work.context === context.value) && `${work.title} ${work.creator} ${work.note} ${work.detail}`.toLocaleLowerCase('ko').includes(term));
    document.querySelector('#work-list').innerHTML = matches.map(work => `<article class="work"><div class="mini-art tone-${work.tone}" aria-hidden="true"><span>${escapeHTML(work.mediaLabel)}</span><strong>${escapeHTML(work.title)}</strong></div><div class="work-meta"><span>${escapeHTML(work.mediaLabel)}</span><span>${escapeHTML(work.context)}</span></div><h2>${escapeHTML(work.title)}</h2><p class="muted">${escapeHTML(work.creator)}</p><p>${escapeHTML(work.note)}</p><details><summary>언급 맥락 더 읽기</summary><p>${escapeHTML(work.detail)}</p></details><span class="timestamp">녹음 ${escapeHTML(work.time)}</span><a class="text-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/search?q=${encodeURIComponent(work.search || work.title + ' ' + work.creator)}">작품 검색 <span aria-hidden="true">↗</span></a></article>`).join('');
    document.querySelector('#result-count').textContent = `${matches.length}개 작품${term ? ' · 검색 결과' : ''}`;
    document.querySelector('#empty-state').hidden = matches.length > 0;
  }
  function resetFilters() { clearTimeout(searchTimer); search.value = ''; media.value = 'all'; context.value = 'all'; renderWorks(); }
  search.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(renderWorks, 180); });
  media.addEventListener('change', renderWorks);
  context.addEventListener('change', renderWorks);
  document.querySelector('#filters').addEventListener('submit', event => event.preventDefault());
  document.querySelector('#filters').addEventListener('reset', event => { event.preventDefault(); resetFilters(); });
  document.querySelector('#empty-reset').addEventListener('click', () => { resetFilters(); search.focus({preventScroll:true}); });
  renderWorks();
  syncHash();
})();
