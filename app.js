(async () => {
  'use strict';
  // Load only the new candidate information; historical data remains in data.js.
  // A failed enhancement keeps the existing club pages available.
  await new Promise(resolve => {
    const script = document.createElement('script');
    script.src = new URL('./november-data.js?v=20261026', document.currentScript?.src || location.href).href;
    script.onload = resolve;
    script.onerror = () => { script.remove(); resolve(); };
    document.head.append(script);
  });
  const data = window.BOOK_CLUB;
  if (!data) return;
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const participantName = id => data.participants[id]?.displayName || '참여자';
  const displayText = value => String(value).replace(/\{(sh|hs|hj)\}/g, (_, id) => participantName(id));
  const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const runningMotion = new Map();
  const visitedScenes = new Set();
  function playMotion(element, frames, options = {}) {
    runningMotion.get(element)?.cancel();
    runningMotion.delete(element);
    if (!element?.animate || motionPreference?.matches) return;
    const animation = element.animate(frames, {duration:220, easing:'cubic-bezier(.16,1,.3,1)', fill:'backwards', ...options});
    runningMotion.set(element, animation);
    animation.finished?.then(() => { if (runningMotion.get(element) === animation) runningMotion.delete(element); }, () => { if (runningMotion.get(element) === animation) runningMotion.delete(element); });
  }
  motionPreference?.addEventListener?.('change', () => {
    if (motionPreference.matches) { runningMotion.forEach(animation => animation.cancel()); runningMotion.clear(); }
  });
  function playScene(panel) {
    if (visitedScenes.has(panel.id)) return;
    visitedScenes.add(panel.id);
    panel.querySelectorAll('[data-count]').forEach(countUp);
  }
  // Counts settle on their final value; motion only replays the climb from zero.
  function countUp(element) {
    const target = Number(element.dataset.count);
    element.textContent = String(target);
    if (motionPreference?.matches || !window.requestAnimationFrame || !target) return;
    const start = performance.now();
    const step = now => {
      const progress = Math.min(1, (now - start) / 900);
      element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  // Scroll reveal: titles, copy and cards rise 26px into place the first time they enter the viewport.
  // Cards in one group follow each other by 80ms, and each group restarts its own count.
  const revealRoot = document.documentElement;
  const REVEAL_STEP_MS = 80, REVEAL_MAX_STEPS = 8;
  function settleReveal(element) {
    element.removeAttribute('data-reveal');
    element.classList.remove('is-revealed');
    element.style.removeProperty('--reveal-delay');
  }
  function showReveal(element, delay = 0) {
    if (!element.hasAttribute('data-reveal') || element.classList.contains('is-revealed')) return;
    revealObserver?.unobserve(element);
    element.style.setProperty('--reveal-delay', delay + 'ms');
    element.classList.add('is-revealed');
    setTimeout(() => settleReveal(element), 800 + delay + 100);
  }
  const revealObserver = revealRoot.classList.contains('reveal-on') ? new IntersectionObserver(entries => {
    const groups = new Map();
    entries.filter(entry => entry.isIntersecting).forEach(entry => {
      const group = entry.target.parentElement?.hasAttribute('data-reveal-group') ? entry.target.parentElement : entry.target;
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(entry.target);
    });
    groups.forEach((items, group) => {
      // A horizontal shelf enters as one row, including covers still scrolled off to the side.
      if (group.dataset.revealGroup === 'together') items = [...group.children].filter(child => child.hasAttribute('data-reveal'));
      items.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
      items.forEach((item, index) => showReveal(item, Math.min(index, REVEAL_MAX_STEPS) * REVEAL_STEP_MS));
    });
  }, {rootMargin:'0px 0px -8% 0px'}) : null;
  function revealEverything() {
    revealRoot.classList.remove('reveal-on');
    revealObserver?.disconnect();
    document.querySelectorAll('[data-reveal]').forEach(settleReveal);
  }
  function startReveal() {
    document.querySelectorAll('[data-reveal-group]').forEach(group => [...group.children].forEach(child => child.setAttribute('data-reveal', '')));
    if (!revealObserver) { document.querySelectorAll('[data-reveal]').forEach(settleReveal); return; }
    document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));
    // Keyboard focus never lands on something still invisible.
    document.addEventListener('focusin', event => { const hidden = event.target.closest?.('[data-reveal]'); if (hidden) showReveal(hidden); });
    motionPreference?.addEventListener?.('change', () => { if (motionPreference.matches) revealEverything(); });
  }
  // A chosen cover travels into the detail view (and back) where View Transitions exist; elsewhere the detail appears at once.
  const canMorph = () => Boolean(document.startViewTransition) && !motionPreference?.matches;
  function coverImageIn(root, requireLoaded = true) {
    const image = root?.querySelector?.('img.cover-img');
    return image && !image.hidden && (!requireLoaded || image.naturalWidth) ? image : null;
  }
  function morphCover(fromImage, update, findTarget) {
    let target = null;
    fromImage.style.viewTransitionName = 'book-cover';
    const transition = document.startViewTransition(async () => {
      fromImage.style.viewTransitionName = '';
      update();
      target = findTarget();
      if (!target) return;
      target.style.viewTransitionName = 'book-cover';
      target.loading = 'eager';
      await Promise.race([target.decode?.().catch(() => {}), new Promise(resolve => setTimeout(resolve, 300))]);
    });
    const clear = () => { fromImage.style.viewTransitionName = ''; if (target) target.style.viewTransitionName = ''; };
    transition.finished.then(clear, clear);
  }
  function stopMotionWithin(root) {
    runningMotion.forEach((animation, element) => {
      if (element === root || root.contains?.(element)) { animation.cancel(); runningMotion.delete(element); }
    });
  }
  document.addEventListener('focusin', event => {
    runningMotion.forEach((animation, element) => {
      if (element === event.target || element?.contains?.(event.target)) { animation.cancel(); runningMotion.delete(element); }
    });
  });
  document.querySelectorAll('[data-participant]').forEach(element => { element.textContent = participantName(element.dataset.participant); });
  const coverKeys = {'나미야 잡화점의 기적':'namiya','빵충 사육 준수 사항':'breadworm','봄에 나는 없었다':'spring','히틀러의 음식을 먹는 여자들':'hitler','아이들의 집':'children','용의자 X의 헌신':'suspect-x','불편한 편의점':'convenience','영웅문':'youngwoongmoon','진격의 거인':'attack'};
  function coverFrameMarkup(title, coverKey, tag = 'div') {
    const cover = data.covers[coverKey || coverKeys[title]];
    if (!cover) return `<${tag} class="cover-frame"><span class="cover-fallback">${escapeHTML(title)}<br>표지 확인 중</span></${tag}>`;
    return `<${tag} class="cover-frame"><img class="cover-img" src="${escapeHTML(cover.local)}" width="${cover.width}" height="${cover.height}" alt="${escapeHTML(cover.title + ' · ' + cover.label)}" loading="lazy"><span class="cover-fallback" hidden>${escapeHTML(title)}<br>표지를 불러오지 못했어요.</span></${tag}>`;
  }
  function coverCaptionMarkup(title, coverKey) {
    const cover = data.covers[coverKey || coverKeys[title]];
    return cover ? `<p class="cover-caption"><span>${escapeHTML(cover.label)}</span><a class="cover-source" href="${escapeHTML(cover.page)}" target="_blank" rel="noopener noreferrer">출처 ↗</a></p>` : '';
  }
  function coverMarkup(title, coverKey) {
    return coverFrameMarkup(title, coverKey) + coverCaptionMarkup(title, coverKey);
  }
  function handleCoverError(image) {
    image.hidden = true;
    const fallback = image.parentElement.querySelector('.cover-fallback');
    if (fallback) fallback.hidden = false;
  }
  document.addEventListener('error', event => {
    if (event.target.matches?.('img.cover-img')) handleCoverError(event.target);
    if (event.target.matches?.('.discovery-thumb img')) {
      event.target.hidden = true;
      const fallback = event.target.parentElement.querySelector('.discovery-image-fallback');
      if (fallback) fallback.hidden = false;
    }
  }, true);
  document.querySelectorAll('img.cover-img').forEach(image => {
    if (image.complete && image.naturalWidth === 0) handleCoverError(image);
  });
  const tabs = [...document.querySelectorAll('.menu-bar .tabs [role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const detailPanel = document.querySelector('#book-detail');
  let detailOpener = null;
  function closeBookDetail(returnFocus = true) {
    if (detailPanel.hidden) return;
    if (returnFocus && canMorph()) {
      const fromImage = coverImageIn(detailPanel.querySelector('.book-detail-cover'));
      const opener = detailOpener?.isConnected ? detailOpener : null;
      if (fromImage && coverImageIn(opener)) { morphCover(fromImage, () => finishClose(true, true), () => coverImageIn(opener)); return; }
    }
    finishClose(returnFocus, false);
  }
  function finishClose(returnFocus, morphing) {
    if (detailPanel.hidden) return;
    const focusWasInside = detailPanel.contains(document.activeElement);
    detailPanel.hidden = true;
    stopMotionWithin(detailPanel);
    document.querySelectorAll('[data-work-open],[data-book-intro]').forEach(button => button.setAttribute('aria-expanded','false'));
    if (returnFocus) {
      const target = detailOpener?.isConnected ? detailOpener : document.querySelector('#main');
      target.focus({preventScroll:true});
      target.scrollIntoView({block:'center',behavior:morphing || motionPreference?.matches ? 'auto' : 'smooth'});
    } else if (focusWasInside) document.querySelector('#main').focus({preventScroll:true});
    detailOpener = null;
  }
  function openBookDetail(work, opener, isIntro = false) {
    const fromImage = canMorph() ? coverImageIn(opener) : null;
    if (fromImage) morphCover(fromImage, () => renderBookDetail(work, opener, isIntro, true), () => coverImageIn(detailPanel.querySelector('.book-detail-cover'), false));
    else renderBookDetail(work, opener, isIntro, false);
  }
  function discoveryMarkup(source) {
    if (!source) return '';
    const imageHref = source.imageAction === 'video' ? source.url : source.image;
    const action = source.imageAction === 'video' ? '영상 보기' : '이미지 확대';
    const imageClass = source.imageAction === 'crop' ? ' discovery-thumb--crop' : '';
    const link = source.url ? `<a class="discovery-link" href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.linkLabel)} ↗</a>` : '';
    const gallery = source.gallery?.length ? `<details class="discovery-gallery"><summary>출처 자세히 보기 · 사진 ${source.gallery.length}장</summary><div class="discovery-gallery-images">${source.gallery.map((photo, index) => `<figure><a href="${escapeHTML(photo.image)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(photo.alt + ' · 원본 보기, 새 창')}"><img src="${escapeHTML(photo.image)}" alt="${escapeHTML(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy"></a><figcaption>${index + 1} / ${source.gallery.length} · 사진을 누르면 원본을 볼 수 있습니다. ↗</figcaption></figure>`).join('')}</div></details>` : '';
    return `<section class="discovery-source" aria-label="고른 계기와 출처"><a class="discovery-thumb${imageClass}" href="${escapeHTML(imageHref)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(source.label + ' · ' + action + ', 새 창')}"><img src="${escapeHTML(source.image)}" alt="${escapeHTML(source.imageAlt)}" loading="lazy"><span class="discovery-image-fallback" hidden>이미지를 불러오지 못했습니다.</span></a><div class="discovery-copy"><p><strong>고른 계기</strong></p><p>${escapeHTML(source.text)}</p><p class="discovery-caption">${escapeHTML(source.label)} · ${action} ↗</p>${link}</div>${gallery}</section>`;
  }
  function renderBookDetail(work, opener, isIntro, morphing) {
    closeBookDetail(false);
    const mentions = isIntro ? [] : workMentions(work);
    document.querySelector('#book-detail-title').textContent = work.title;
    const septemberTopics = data.records['2026-09'].topics;
    const profile = work.candidateProfile;
    const candidateContext = profile ? `<div class="work-context"><p>${escapeHTML(profile.summary)}</p>${discoveryMarkup(profile.discovery)}<p><strong>추천 이유</strong><br>${escapeHTML(profile.reason)}</p><p><strong>미리 생각할 질문</strong><br>${escapeHTML(profile.question)}</p><p class="muted">${escapeHTML(profile.note)}</p><a class="text-link" href="#november-candidates" data-meeting-link>11월 후보 세 권 보기 →</a></div>` : '';
    const contexts = profile ? candidateContext : isIntro ? `<div class="work-context"><p class="context-source">9월 15일 토론 기록</p><p>${escapeHTML(septemberTopics[0].summary)}</p><p>${escapeHTML(septemberTopics[3].summary)}</p><a class="text-link" href="#discussion" data-meeting-link>9월 토론 보기 →</a></div>` : mentions.map(mentionMarkup).join('');
    const badges = profile ? '<span class="work-badge">11월 후보</span><span class="work-badge">마리오님 추천</span>' : isIntro ? '<span class="work-badge">9월 함께 읽은 책</span>' : badgesFor(work, mentions);
    const discussionLink = work.discussionHref ? `<p class="archive-discussion-link"><a class="text-link" href="${escapeHTML(work.discussionHref)}">토론 기록 읽기 →</a></p>` : '';
    document.querySelector('#book-detail-body').innerHTML = `<div class="book-detail-cover">${coverMarkup(work.title,work.coverKey)}</div><div class="book-detail-copy"><p class="book-detail-media">${escapeHTML(work.mediaLabel + ' · ' + work.creator)}</p><div class="work-badges">${badges}</div>${contexts}${discussionLink}${isIntro ? '' : `<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/search?q=${encodeURIComponent(work.search || work.title + ' ' + work.creator)}">작품 검색 <span aria-hidden="true">↗</span></a>`}</div>`;
    detailOpener = opener;
    detailPanel.hidden = false;
    opener.setAttribute('aria-expanded','true');
    if (!morphing) playMotion(document.querySelector('#book-detail-body'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:260});
    document.querySelector('#book-detail-title').focus({preventScroll:true});
    detailPanel.scrollIntoView({block:'start',behavior:morphing || motionPreference?.matches ? 'auto' : 'smooth'});
  }
  document.querySelector('#book-detail-close').addEventListener('click', () => closeBookDetail());
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !detailPanel.hidden) { event.preventDefault(); closeBookDetail(); } });
  document.addEventListener('click', event => {
    const intro = event.target.closest?.('[data-book-intro]');
    if (intro) { openBookDetail({title:'나미야 잡화점의 기적',creator:'히가시노 게이고',mediaLabel:'책',coverKey:'namiya'},intro,true); return; }
    let opener = event.target.closest?.('[data-work-open]');
    if (!opener && !event.target.closest?.('a,button,summary,input,select')) opener = event.target.closest?.('.work[data-work-id],.candidate[data-work-id]')?.querySelector('[data-work-open]');
    if (!opener) return;
    const work = data.works.find(item => item.id === opener.dataset.workOpen);
    if (work) openBookDetail(work,opener);
  });
  // One underline slides between menu tabs; the selected tab keeps its own color and weight.
  const tabList = document.querySelector('.menu-bar .tabs');
  const tabIndicator = document.createElement('span');
  tabIndicator.className = 'tabs-indicator';
  tabIndicator.setAttribute('aria-hidden', 'true');
  tabList.append(tabIndicator);
  tabList.classList.add('has-indicator');
  function moveTabIndicator(instant = false) {
    const tab = tabs.find(item => item.getAttribute('aria-selected') === 'true');
    if (!tab) return;
    tabIndicator.classList.toggle('is-instant', instant || !tabIndicator.style.width);
    tabIndicator.style.width = tab.offsetWidth + 'px';
    tabIndicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    const left = tab.offsetLeft, right = left + tab.offsetWidth;
    if (left < tabList.scrollLeft) tabList.scrollLeft = left - 16;
    else if (right > tabList.scrollLeft + tabList.clientWidth) tabList.scrollLeft = right - tabList.clientWidth + 16;
  }
  if ('ResizeObserver' in window) new ResizeObserver(() => moveTabIndicator(true)).observe(tabList);
  document.fonts?.ready.then(() => moveTabIndicator(true));
  // Meetings live in one tab; each month keeps its own id so #september and #october still link directly.
  const monthTabs = [...document.querySelectorAll('.month-tabs [role="tab"]')];
  // Newest months first; older records open from 지난 기록 and keep that tab selected.
  const monthPanels = [...monthTabs.map(tab => document.getElementById(tab.getAttribute('aria-controls'))), document.getElementById('first-meeting'), document.getElementById('record-2025-02')];
  const monthTitles = {november:'2026년 11월 후보', october:'2026년 10월 모임', september:'2026년 9월 모임', 'meeting-archive':'지난 기록', 'first-meeting':'2025년 3월 토론 기록', 'record-2025-02':'2025년 2월 토론 기록'};
  const archiveViews = ['first-meeting', 'record-2025-02'];
  let activeMonth = monthTabs[0]?.dataset.month;
  function showMonth(month) {
    const changed = monthPanels.find(panel => !panel.hidden)?.id !== month;
    const tabMonth = archiveViews.includes(month) ? 'meeting-archive' : month;
    monthTabs.forEach(tab => { const active = tab.dataset.month === tabMonth; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    monthPanels.forEach(panel => { if (panel.id !== month) stopMotionWithin(panel); panel.hidden = panel.id !== month; });
    return changed;
  }
  function showTab(id, updateHash = true) {
    if (monthPanels.some(panel => panel.id === id)) { activeMonth = id; id = 'meetings'; }
    if (!panels.some(p => p.id === id)) return;
    const changed = panels.find(panel => !panel.hidden)?.id !== id;
    closeBookDetail(false);
    tabs.forEach(tab => { const active = tab.dataset.tab === id; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    panels.forEach(panel => { if (panel.id !== id) stopMotionWithin(panel); panel.hidden = panel.id !== id; });
    const monthChanged = id === 'meetings' && showMonth(activeMonth);
    if (updateHash) history.pushState(null, '', '#' + (id === 'meetings' ? activeMonth : id));
    moveTabIndicator(!changed);
    const tabTitles = {home:'홈',works:'함께 볼 작품',history:'지난 선정작'};
    document.title = `${id === 'meetings' ? monthTitles[activeMonth] : tabTitles[id]} · 책 사이`;
    const scene = id === 'meetings' ? document.getElementById(activeMonth) : panels.find(item => item.id === id);
    if ((changed || monthChanged) && visitedScenes.has(scene.id)) playMotion(scene,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}]);
    playScene(scene);
  }
  monthTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showTab(tab.dataset.month));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % monthTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + monthTabs.length) % monthTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = monthTabs.length - 1;
      if (next !== undefined) { event.preventDefault(); showTab(monthTabs[next].dataset.month); monthTabs[next].focus({preventScroll:true}); }
    });
  });
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
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => { const id = button.dataset.go; showTab(id); (monthTabs.find(tab => tab.dataset.month === id) || tabs.find(tab => tab.dataset.tab === id) || tabs.find(tab => tab.dataset.tab === 'meetings')).focus({preventScroll:true}); document.querySelector('.masthead').scrollIntoView({block:'start'}); }));
  function syncHash() {
    const id = location.hash.slice(1);
    // Keep shared links working after moving candidate browsing into meeting records.
    if (id === 'works-candidates') showTab('meeting-archive', false);
    else if (['works-recommendations', 'works-mentions'].includes(id)) showTab('works', false);
    else if ([...panels, ...monthPanels].some(p => p.id === id)) showTab(id, false);
    else if (id === 'previous') showTab('meeting-archive', false);
    else if (id.startsWith('archive-') && data.candidateMeetings.some(meeting => meeting.meetingId === id.slice(8))) { showTab('meeting-archive', false); document.getElementById('candidates-' + id.slice(8))?.scrollIntoView({block:'start'}); }
    else if (id.startsWith('record-2025-02-')) { showTab('record-2025-02', false); document.getElementById(id)?.scrollIntoView({block:'start'}); }
    else if (['first-voices', 'first-sh', 'first-hs', 'first-hj', 'first-candidates'].includes(id)) { showTab('first-meeting', false); document.getElementById(id)?.scrollIntoView({block:'start'}); }
    else if (['discussion', 'people', 'summary-title'].includes(id)) { showTab('september', false); document.getElementById(id)?.scrollIntoView({block:'start'}); }
    else if (['candidates', 'october-discussion', 'october-people', 'october-summary-title'].includes(id)) { showTab('october', false); document.getElementById(id)?.scrollIntoView({block:'start'}); }
    else if (data.candidateMeetings.some(meeting => meeting.section === id)) { const candidate = data.candidateMeetings.find(meeting => meeting.section === id); showTab(data.meetings[candidate.meetingId]?.tab || 'meeting-archive', false); document.getElementById(id)?.scrollIntoView({block:'start'}); }
    else showTab('home', false);
  }
  window.addEventListener('hashchange', syncHash);
  window.addEventListener('popstate', syncHash);
  document.querySelector('.skip-link').addEventListener('click', event => {
    event.preventDefault();
    const main = document.querySelector('#main');
    main.focus({preventScroll:true});
    main.scrollIntoView({block:'start'});
  });
  document.querySelector('.wordmark').addEventListener('click', () => showTab('home', false));
  // Recorded months share one layout: data-record names the month, data-record-part the piece it holds.
  const recordParts = {
    voices: (record, element) => record.people.map(person => `<a class="voice-preview-item" href="${escapeHTML(element.dataset.peopleHref)}"><img src="${escapeHTML(data.participants[person.participantId].avatar)}" width="48" height="48" alt=""><span><strong>${escapeHTML(participantName(person.participantId))}</strong><small>${escapeHTML(person.keywords)}</small></span></a>`).join(''),
    topics: record => record.topics.map(topic => `<article class="topic"><div class="topic-header"><h3>${escapeHTML(topic.title)}</h3><span class="timestamp">${escapeHTML(topic.time)}</span></div><p>${escapeHTML(displayText(topic.summary))}</p><details${topic.spoiler ? ' class="spoiler"' : ''}><summary>${topic.spoiler ? '스포일러 포함 · 펼쳐 읽기' : '대화 맥락 더 읽기'}</summary><p>${escapeHTML(displayText(topic.more))}</p></details></article>`).join(''),
    people: record => record.people.map(person => `<article class="person"><div class="person-head"><span class="person-avatar" aria-hidden="true"><img class="person-character" src="${escapeHTML(data.participants[person.participantId].avatar)}" alt="" width="64" height="64"></span><div><h3>${escapeHTML(participantName(person.participantId))}</h3><p class="person-tagline">${escapeHTML(person.tagline)}</p></div></div>${person.paragraphs.map(p => `<p>${escapeHTML(displayText(p))}</p>`).join('')}<details><summary>공유한 생각 더 읽기</summary><p>${escapeHTML(displayText(person.more))}</p></details><span class="timestamp">녹음 ${escapeHTML(person.time)}</span></article>`).join('')
  };
  document.querySelectorAll('[data-record-part]').forEach(element => {
    const record = data.records[element.dataset.record];
    if (record) element.innerHTML = recordParts[element.dataset.recordPart](record, element);
  });
  function candidateShelfColumns(count) { return count <= 3 ? Math.max(1, count) : Math.ceil(count / 2); }
  function selectedFirstCandidateIds(ids, selectedId) {
    return [...ids.filter(id => id === selectedId), ...ids.filter(id => id !== selectedId)];
  }
  function candidateCardMarkup(id, selectedId) {
    const work = data.works.find(item => item.id === id);
    if (!work) return '';
    const selected = id === selectedId ? '<span class="work-badge">선정작</span>' : '';
    return `<li><button class="record-candidate-open" type="button" data-work-open="${escapeHTML(id)}" aria-label="${escapeHTML(work.title)} 소개 보기" aria-expanded="false" aria-controls="book-detail">${coverFrameMarkup(work.title, work.coverKey, 'span')}<strong>${escapeHTML(work.title)}</strong><span class="muted">${escapeHTML(work.creator)}</span></button>${selected}</li>`;
  }
  // Months that began without candidates show only the selected book, from the selection history.
  function selectionOnlyBook(meeting) { return data.selectionHistory.find(book => book.id === meeting.selectionId); }
  function selectionCardMarkup(book) {
    const cover = data.covers[book.coverKey];
    const inner = `${coverFrameMarkup(book.title, book.coverKey, 'span')}<strong>${escapeHTML(book.title)}</strong><span class="muted">${escapeHTML(cover?.creator || '')}</span>`;
    return `<li>${cover ? `<a class="record-candidate-open" href="${escapeHTML(cover.page)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(book.title)} 도서 정보 · 새 창">${inner}</a>` : `<span class="record-candidate-open">${inner}</span>`}<span class="work-badge">선정작</span></li>`;
  }
  function populateCandidateShelf(shelf, ids, selectedId) {
    shelf.style.setProperty('--shelf-columns', candidateShelfColumns(ids.length));
    shelf.innerHTML = selectedFirstCandidateIds(ids, selectedId).map(id => candidateCardMarkup(id, selectedId)).join('');
  }
  // Put the selected book first while preserving the order of the other candidates.
  document.querySelectorAll('[data-candidate-shelf]').forEach(shelf => {
    const meeting = data.candidateMeetings.find(item => item.meetingId === shelf.dataset.candidateShelf);
    const section = shelf.closest('[data-candidate-section]');
    if (section) section.hidden = !meeting;
    if (meeting && !meeting.workIds.length) {
      // The selected book is already the record's hero, so only the note is shown.
      shelf.hidden = true;
      shelf.insertAdjacentHTML('beforebegin', `<p class="selection-only-note">${escapeHTML(meeting.note || '')}</p>`);
    } else if (meeting) populateCandidateShelf(shelf, meeting.workIds, meeting.selectedWorkId);
  });
  document.querySelectorAll('[data-upcoming-candidates]').forEach(shelf => {
    const meeting = data.candidateMeetings.find(item => item.meetingId === shelf.dataset.upcomingCandidates);
    if (!meeting) return;
    shelf.innerHTML = meeting.workIds.map(id => {
      const work = data.works.find(item => item.id === id);
      const profile = work.candidateProfile;
      return `<li class="november-card" data-reveal><button class="november-cover cover-trigger" type="button" data-work-open="${escapeHTML(id)}" aria-label="${escapeHTML(work.title)} 소개 보기" aria-expanded="false" aria-controls="book-detail">${coverFrameMarkup(work.title, work.coverKey, 'span')}<span class="cover-hint">자세히 보기 →</span></button><div class="november-copy"><p class="november-genre">${escapeHTML(profile.genre)}</p><h3>${escapeHTML(work.title)}</h3><p class="november-author">${escapeHTML(work.creator)}${profile.edition ? ' · ' + escapeHTML(profile.edition) : ''}</p><p>${escapeHTML(profile.summary)}</p>${profile.discovery ? `<p class="november-origin"><span>고른 계기</span>${escapeHTML(profile.discovery.short)}</p>` : ''}<p class="november-question"><span>미리 생각할 질문</span>${escapeHTML(profile.question)}</p></div></li>`;
    }).join('');
  });
  const archivedMeetings = data.candidateMeetings.filter(meeting => meeting.state !== 'choosing-book').reverse();
  document.querySelector('#archive-meeting-nav').innerHTML = archivedMeetings.map(meeting => `<a href="#${escapeHTML(meeting.section)}" data-meeting-link>${escapeHTML(Number(meeting.meetingId.slice(0,4)) + '년 ' + Number(meeting.meetingId.slice(5)) + '월')}</a>`).join('');
  document.querySelector('#archive-meeting-list').innerHTML = archivedMeetings.map(meeting => {
    const selectionOnly = !meeting.workIds.length;
    const selected = selectionOnly ? selectionOnlyBook(meeting) : data.works.find(work => work.id === meeting.selectedWorkId);
    const year = meeting.meetingId.slice(0,4), month = Number(meeting.meetingId.slice(5));
    const books = selectionOnly ? selectionCardMarkup(selected) : selectedFirstCandidateIds(meeting.workIds, meeting.selectedWorkId).map(id => candidateCardMarkup(id, meeting.selectedWorkId)).join('');
    const shelfTitle = selectionOnly ? `<h3 class="archive-shelf-title">함께 읽은 책</h3><p class="selection-only-note">${escapeHTML(meeting.note || '')}</p>` : '<h3 class="archive-shelf-title">함께 검토했던 책</h3>';
    const discussion = meeting.discussionHref ? `<a class="text-link" href="${escapeHTML(meeting.discussionHref)}">토론 기록 읽기 →</a>` : '';
    return `<section id="${escapeHTML(meeting.section)}" class="archive-meeting section" tabindex="-1" aria-labelledby="${escapeHTML(meeting.section)}-title"><div class="section-heading"><p class="meeting-meta"><time datetime="${escapeHTML(meeting.meetingId)}">${year}년 ${month}월</time><span>${selectionOnly ? '선정작' : `후보 ${meeting.workIds.length}권`}</span></p><h2 id="${escapeHTML(meeting.section)}-title">${escapeHTML(selected.title)}</h2>${discussion}</div>${shelfTitle}<ul class="record-candidate-shelf" style="--shelf-columns:${candidateShelfColumns(Math.max(meeting.workIds.length, 1))}">${books}</ul></section>`;
  }).join('');
  document.querySelector('#history-list').innerHTML = data.selectionHistory.map(book => {
    const cover = data.covers[book.coverKey];
    const participant = data.participants[book.recommenderId];
    const month = book.month.slice(2,4) + '.' + Number(book.month.slice(5));
    const recommender = participant ? `<span class="history-recommender"><img src="${escapeHTML(participant.avatar)}" width="24" height="24" alt=""><span>${escapeHTML(participant.displayName)} 추천</span></span>` : '';
    const content = `<span class="history-cover">${coverFrameMarkup(book.title,book.coverKey,'span')}</span><h2>${escapeHTML(book.title)}</h2><span class="history-meta"><span class="history-month">(${escapeHTML(month)})</span>${recommender}</span>`;
    const label = `${book.title} · ${book.month} 선정작${participant ? ' · ' + participant.displayName + ' 추천' : ''} · 도서 정보 · 새 창`;
    const discussion = book.discussionHref ? `<a class="history-discussion-link" href="${escapeHTML(book.discussionHref)}">토론 기록 →</a>` : '';
    return `<article class="history-book">${cover ? `<a href="${escapeHTML(cover.page)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(label)}">${content}</a>` : content}${discussion}</article>`;
  }).join('');
  document.querySelector('#history-sources').innerHTML = data.selectionHistory.map(book => {
    const cover = data.covers[book.coverKey];
    return cover ? `<li><a href="${escapeHTML(cover.page)}" target="_blank" rel="noopener noreferrer">${escapeHTML(book.title)} · ${escapeHTML(cover.label)} ↗</a></li>` : '';
  }).join('');
  const currentMeetingId = Object.keys(data.meetings).find(key => data.meetings[key].state === 'before-meeting');
  const pastSelections = data.selectionHistory.filter(book => book.month !== currentMeetingId);
  const shortMonth = month => month.slice(2,4) + '.' + Number(month.slice(5));
  const [firstYear, firstMonth] = pastSelections[0].month.split('-').map(Number);
  const [nowYear, nowMonth] = (currentMeetingId || pastSelections.at(-1).month).split('-').map(Number);
  const monthsTogether = (nowYear - firstYear) * 12 + (nowMonth - firstMonth);
  const nowNumber = pastSelections.length + (currentMeetingId ? 1 : 0);
  // Between meetings, before the next book is chosen, the home card shows the book read most recently.
  document.querySelector('#home-since').innerHTML = `<time datetime="${escapeHTML(pastSelections[0].month)}">${firstYear}년 ${firstMonth}월부터</time><span>${currentMeetingId ? `${nowNumber}번째 책을 읽는 중` : `${nowNumber}권을 함께 읽었습니다`}</span>`;
  document.querySelector('#now-reading-label').textContent = `${currentMeetingId ? '지금 읽는 책' : '최근에 함께 읽은 책'} · ${nowMonth}월 · ${nowNumber}번째`;
  const stats = [[pastSelections.length,'권','함께 읽은 책'],[Object.keys(data.participants).length,'명','함께 읽는 사람'],[monthsTogether,'개월','이어 온 시간']];
  document.querySelector('#home-stats').innerHTML = stats.map(([value, unit, label]) => `<div><dt>${label}</dt><dd><span class="stat-value" data-count="${value}">${value}</span>${unit}</dd></div>`).join('');
  document.querySelector('#home-shelf').innerHTML = pastSelections.map(book => `<li class="home-shelf-book">${coverFrameMarkup(book.title,book.coverKey,'span')}<span class="home-shelf-month">${escapeHTML(shortMonth(book.month))}</span></li>`).join('');
  document.querySelector('#home-members').innerHTML = Object.entries(data.participants).map(([id, participant]) => {
    const picks = pastSelections.filter(book => book.recommenderId === id);
    const covers = picks.map(book => { const cover = data.covers[book.coverKey]; return cover ? `<img src="${escapeHTML(cover.local)}" width="28" height="40" alt="" loading="lazy">` : ''; }).join('');
    return `<li class="home-member"><img class="home-member-avatar" src="${escapeHTML(participant.avatar)}" width="56" height="56" alt=""><div><h3>${escapeHTML(participant.displayName)}</h3><p class="muted">선정작 추천 ${picks.length}권</p><span class="home-member-picks" aria-hidden="true">${covers}</span></div></li>`;
  }).join('');
  const search = document.querySelector('#search');
  const media = document.querySelector('#media');
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-meeting-link]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href.startsWith('#')) return;
    const sectionId = href.slice(1);
    const section = document.getElementById(sectionId);
    if (section?.closest('#meeting-archive')) {
      event.preventDefault();
      showTab('meeting-archive', false);
      history.pushState(null, '', '#' + sectionId);
      section.focus({preventScroll:true});
      section.scrollIntoView({block:'start'});
      return;
    }
    const meeting = Object.values(data.meetings).find(item => item.section === sectionId);
    if (!meeting) return;
    event.preventDefault();
    showTab(meeting.tab, false);
    history.pushState(null, '', '#' + sectionId);
    section.focus({preventScroll:true});
    section.scrollIntoView({block:'start'});
  });
  function workMentions(work) { return data.mentions.filter(mention => mention.workId === work.id); }
  function badgesFor(work, mentions) {
    const labels = new Set();
    mentions.forEach(mention => mention.roles.forEach(role => {
      const month = data.meetings[mention.meetingId]?.label;
      if (role === 'candidate') labels.add(month ? month + ' 후보' : '후보로 소개된 작품');
      if (role === 'recommendation' && mention.kind === 'discussion') labels.add(month ? month + ' 토론 추천' : '토론 추천');
      if (role === 'recommendation' && mention.kind === 'remembered-recommendation') labels.add('추천한 작품');
      if (role === 'recommendation' && mention.kind === 'candidate-suggestion') labels.add(mention.people.length ? mention.people.map(participantName).join(', ') + ' 추천' : '후보 추천');
      if (role === 'mention') labels.add(month ? month + ' 이야기 속 언급' : '함께 나눈 작품');
    }));
    data.selections.filter(selection => selection.workId === work.id && selection.status === 'selected').forEach(selection => {
      const month = data.meetings[selection.meetingId]?.label;
      if (month) labels.add(month + ' 선정작');
    });
    return [...labels].map(label => `<span class="work-badge">${escapeHTML(label)}</span>`).join('');
  }
  function mentionMarkup(mention) {
    const meeting = data.meetings[mention.meetingId];
    const linkLabel = meeting ? (meeting.linkLabel || (meeting.state === 'before-meeting' ? meeting.label + ' 후보 메모 보기' : meeting.label + ' 토론 보기')) : '';
    const people = mention.people.length ? ' · ' + mention.people.map(participantName).join(', ') : '';
    const time = mention.timestamp ? ' · 녹음 ' + mention.timestamp : '';
    const detail = mention.detail ? `<p>${escapeHTML(displayText(mention.detail))}</p>` : '';
    const candidateMeeting = mention.roles.includes('candidate') ? data.candidateMeetings.find(item => item.meetingId === mention.meetingId) : null;
    const section = mention.section || candidateMeeting?.section || meeting?.section;
    const candidateLabel = candidateMeeting ? `${Number(candidateMeeting.meetingId.slice(0,4))}년 ${Number(candidateMeeting.meetingId.slice(5))}월 후보 목록 보기` : linkLabel;
    const link = section ? `<a class="text-link" href="#${escapeHTML(section)}" data-meeting-link>${escapeHTML(candidateLabel)} <span aria-hidden="true">→</span></a>` : '';
    return `<div class="work-context"><p class="context-source">${escapeHTML(mention.sourceLabel + people + time)}</p><p>${escapeHTML(displayText(mention.summary))}</p>${detail}${link}</div>`;
  }
  // The shelf holds works recommended or brought up in conversation; candidates and the book read together stay in meeting records.
  function shelfMentions(work) {
    return workMentions(work).filter(mention => ['discussion', 'remembered-recommendation', 'remembered'].includes(mention.kind) && (mention.roles.includes('recommendation') || mention.roles.includes('mention')));
  }
  function shelfLabel(mention) { return mention.roles.includes('recommendation') ? '추천' : (mention.context || '언급'); }
  function recommendationMonth(mention) {
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(mention.meetingId || '')) return mention.meetingId;
    // A source may state its month even when meetingId was left unrecorded.
    const sourceMonth = mention.sourceLabel.match(/^(\d{4})년\s+(0?[1-9]|1[0-2])월(?:\s|$)/);
    return sourceMonth ? sourceMonth[1] + '-' + sourceMonth[2].padStart(2, '0') : '';
  }
  function latestShelfMention(work) {
    // Order by when the work came up in a meeting, never by publication dates or candidate suggestions.
    return shelfMentions(work).map(mention => ({mention, month:recommendationMonth(mention)})).sort((a, b) => a.month.localeCompare(b.month) || Number(a.mention.roles.includes('recommendation')) - Number(b.mention.roles.includes('recommendation'))).at(-1);
  }
  function latestShelfMonth(work) { return latestShelfMention(work)?.month || ''; }
  function renderWorks() {
    closeBookDetail(false);
    const term = search.value.trim().toLocaleLowerCase('ko');
    const uniqueWorks = [...new Map(data.works.map(work => [work.id, work])).values()];
    const matches = uniqueWorks.filter(work => {
      const mentions = shelfMentions(work);
      const text = `${work.title} ${work.creator} ${mentions.map(mention => `${displayText(mention.summary)} ${displayText(mention.detail)} ${mention.sourceLabel} ${mention.people.map(participantName).join(' ')}`).join(' ')}`;
      return mentions.length > 0 && (media.value === 'all' || work.media === media.value) && text.toLocaleLowerCase('ko').includes(term);
    }).sort((a, b) => latestShelfMonth(b).localeCompare(latestShelfMonth(a)));
    document.querySelector('#work-list').innerHTML = matches.map(work => {
      const mentions = shelfMentions(work);
      const latest = latestShelfMention(work);
      const summary = latest?.mention.summary ? `<span class="work-summary">${escapeHTML(displayText(latest.mention.summary))}</span>` : '';
      const month = latest?.month;
      const date = latest ? `<span class="work-date">${month ? `${Number(month.slice(0,4))}.${Number(month.slice(5))} ` : ''}${escapeHTML(shelfLabel(latest.mention))}</span>` : '';
      return `<article class="work" data-work-id="${escapeHTML(work.id)}"><button class="cover-trigger work-open" type="button" data-work-open="${escapeHTML(work.id)}" aria-label="${escapeHTML(work.title)} 소개 보기" aria-expanded="false" aria-controls="book-detail">${coverFrameMarkup(work.title,work.coverKey,'span')}<span class="work-copy"><span class="work-title">${escapeHTML(work.title)}</span><span class="work-author">${escapeHTML(work.creator + ' · ' + work.mediaLabel)}</span>${date}<span class="work-badges">${badgesFor(work, mentions)}</span>${summary}<span class="cover-hint">상세 보기 →</span></span></button></article>`;
    }).join('');
    document.querySelector('#result-count').textContent = `${matches.length}개 작품${term ? ' · 검색 결과' : ''}`;
    document.querySelector('#empty-state').hidden = matches.length > 0;
    playMotion(document.querySelector('#work-list'),[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:180});
  }
  function resetFilters() { search.value = ''; media.value = 'all'; renderWorks(); showTab('works'); }
  // The shelf is local and small: commit input synchronously so no delayed search can close a newly opened book.
  search.addEventListener('input', renderWorks);
  media.addEventListener('change', renderWorks);
  document.querySelector('#filters').addEventListener('submit', event => event.preventDefault());
  document.querySelector('#filters').addEventListener('reset', event => { event.preventDefault(); resetFilters(); });
  document.querySelector('#empty-reset').addEventListener('click', () => { resetFilters(); search.focus({preventScroll:true}); });
  renderWorks();
  // The menu bar stays at the top; it gains a paper background and shadow once it is actually stuck.
  const menuBar = document.querySelector('.menu-bar');
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => menuBar.classList.toggle('is-stuck', !entry.isIntersecting)).observe(document.querySelector('.menu-sentinel'));
  startReveal();
  window.bookClubReady = true;
  syncHash();
})();
