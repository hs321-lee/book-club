(() => {
  'use strict';
  const data = window.BOOK_CLUB;
  if (!data) return;
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const coverKeys = {'나미야 잡화점의 기적':'namiya','빵충 사육 준수 사항':'breadworm','봄에 나는 없었다':'spring','히틀러의 음식을 먹는 여자들':'hitler','아이들의 집':'children','용의자 X의 헌신':'suspect-x','용의자 X의 헌신 · 영화화':'suspect-x','불편한 편의점':'convenience','영웅문':'youngwoongmoon','진격의 거인':'attack'};
  function coverMarkup(title) {
    const cover = data.covers[coverKeys[title]];
    if (!cover) return `<div class="cover-frame"><span class="cover-fallback">${escapeHTML(title)}<br>표지 확인 중</span></div>`;
    const label = title.includes('영화화') ? '원작 소설 표지 · 영화 판본 미확인' : cover.label;
    return `<div class="cover-frame"><img class="cover-img" src="${escapeHTML(cover.local)}" width="${cover.width}" height="${cover.height}" alt="${escapeHTML(cover.title + ' · ' + label)}" loading="lazy"><span class="cover-fallback" hidden>${escapeHTML(title)}<br>표지를 불러오지 못했어요.</span></div><p class="cover-caption"><span>${escapeHTML(label)}</span><a class="cover-source" href="${escapeHTML(cover.page)}" target="_blank" rel="noopener noreferrer">출처 ↗</a></p>`;
  }
  function handleCoverError(image) {
    image.hidden = true;
    const fallback = image.parentElement.querySelector('.cover-fallback');
    if (fallback) fallback.hidden = false;
  }
  document.addEventListener('error', event => {
    if (event.target.matches?.('img.cover-img')) handleCoverError(event.target);
  }, true);
  document.querySelectorAll('img.cover-img').forEach(image => {
    if (image.complete && image.naturalWidth === 0) handleCoverError(image);
  });
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
  document.querySelector('#people-list').innerHTML = data.people.map(person => `<article class="person"><div class="person-head"><span class="person-avatar" aria-hidden="true"><svg viewBox="0 0 32 32" width="32" height="32" fill="none" focusable="false"><circle cx="16" cy="11" r="5"/><path d="M6 27v-2a10 10 0 0 1 20 0v2"/></svg></span><div><h3>${escapeHTML(person.name)}</h3><p class="person-tagline">${escapeHTML(person.tagline)}</p></div></div>${person.paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('')}<details><summary>공유한 생각 더 읽기</summary><p>${escapeHTML(person.more)}</p></details><span class="timestamp">녹음 ${escapeHTML(person.time)}</span></article>`).join('');
  document.querySelector('#candidate-list').innerHTML = data.candidates.map(candidate => `<article class="candidate">${coverMarkup(candidate.title)}<p class="candidate-state">${escapeHTML(candidate.state)}</p><h3>${escapeHTML(candidate.title)}</h3><p>${escapeHTML(candidate.note)}</p></article>`).join('');
  const search = document.querySelector('#search');
  const media = document.querySelector('#media');
  const context = document.querySelector('#context');
  let searchTimer;
  function renderWorks() {
    const term = search.value.trim().toLocaleLowerCase('ko');
    const matches = data.works.filter(work => (media.value === 'all' || work.media === media.value) && (context.value === 'all' || work.context === context.value) && `${work.title} ${work.creator} ${work.note} ${work.detail}`.toLocaleLowerCase('ko').includes(term));
    document.querySelector('#work-list').innerHTML = matches.map(work => `<article class="work">${coverMarkup(work.title)}<div class="work-meta"><span>${escapeHTML(work.mediaLabel)}</span><span>${escapeHTML(work.context)}</span></div><h2>${escapeHTML(work.title)}</h2><p class="muted">${escapeHTML(work.creator)}</p><p>${escapeHTML(work.note)}</p><details><summary>언급 맥락 더 읽기</summary><p>${escapeHTML(work.detail)}</p></details><span class="timestamp">녹음 ${escapeHTML(work.time)}</span><a class="text-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/search?q=${encodeURIComponent(work.search || work.title + ' ' + work.creator)}">작품 검색 <span aria-hidden="true">↗</span></a></article>`).join('');
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
