(() => {
  'use strict';
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
  }, true);
  document.querySelectorAll('img.cover-img').forEach(image => {
    if (image.complete && image.naturalWidth === 0) handleCoverError(image);
  });
  let activeRole = 'all';
  const roleHashes = {all:'works',candidate:'works-candidates',recommendation:'works-recommendations',mention:'works-mentions'};
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
  function renderBookDetail(work, opener, isIntro, morphing) {
    closeBookDetail(false);
    const mentions = isIntro ? [] : workMentions(work);
    document.querySelector('#book-detail-title').textContent = work.title;
    const contexts = isIntro ? `<div class="work-context"><p class="context-source">9월 15일 토론 기록</p><p>${escapeHTML(data.topics[0].summary)}</p><p>${escapeHTML(data.topics[3].summary)}</p><a class="text-link" href="#discussion" data-meeting-link>9월 토론 보기 →</a></div>` : mentions.map(mentionMarkup).join('');
    const badges = isIntro ? '<span class="work-badge">9월 함께 읽은 책</span>' : badgesFor(work, mentions);
    document.querySelector('#book-detail-body').innerHTML = `<div class="book-detail-cover">${coverMarkup(work.title,work.coverKey)}</div><div class="book-detail-copy"><p class="book-detail-media">${escapeHTML(work.mediaLabel + ' · ' + work.creator)}</p><div class="work-badges">${badges}</div>${contexts}${isIntro ? '' : `<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/search?q=${encodeURIComponent(work.search || work.title + ' ' + work.creator)}">작품 검색 <span aria-hidden="true">↗</span></a>`}</div>`;
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
  const monthPanels = monthTabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const monthTitles = Object.fromEntries(Object.values(data.meetings).filter(meeting => monthPanels.some(panel => panel.id === meeting.tab)).map(meeting => [meeting.tab, meeting.label + ' 모임']));
  let activeMonth = monthTabs[0]?.dataset.month;
  function showMonth(month) {
    const changed = monthPanels.find(panel => !panel.hidden)?.id !== month;
    monthTabs.forEach(tab => { const active = tab.dataset.month === month; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
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
    if (updateHash) history.pushState(null, '', '#' + (id === 'works' ? roleHashes[activeRole] : id === 'meetings' ? activeMonth : id));
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
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => { const id = button.dataset.go; showTab(id); (monthTabs.find(tab => tab.dataset.month === id) || tabs.find(tab => tab.dataset.tab === id)).focus({preventScroll:true}); document.querySelector('.masthead').scrollIntoView({block:'start'}); }));
  function syncHash() {
    const id = location.hash.slice(1);
    const role = Object.keys(roleHashes).find(key => roleHashes[key] === id);
    if (role) { selectRole(role, false); showTab('works', false); }
    else if ([...panels, ...monthPanels].some(p => p.id === id)) showTab(id, false);
    else if (['discussion', 'people', 'summary-title'].includes(id)) { showTab('september', false); document.getElementById(id)?.scrollIntoView({block:'start'}); }
    else if (id === 'candidates') { showTab('october', false); document.getElementById(id)?.scrollIntoView({block:'start'}); }
    else showTab('home', false);
  }
  window.addEventListener('hashchange', syncHash);
  window.addEventListener('popstate', syncHash);
  document.querySelector('.wordmark').addEventListener('click', () => showTab('home', false));
  const voiceKeywords = {sh:'구조 · 무협',hs:'추억 · 연결',hj:'편지 · 동네'};
  document.querySelector('#voice-preview').innerHTML = data.people.map(person => `<a class="voice-preview-item" href="#people"><img src="${escapeHTML(data.participants[person.participantId].avatar)}" width="48" height="48" alt=""><span><strong>${escapeHTML(participantName(person.participantId))}</strong><small>${escapeHTML(voiceKeywords[person.participantId])}</small></span></a>`).join('');
  document.querySelector('#topics').innerHTML = data.topics.map(topic => `<article class="topic"><div class="topic-header"><h3>${escapeHTML(topic.title)}</h3><span class="timestamp">${escapeHTML(topic.time)}</span></div><p>${escapeHTML(topic.summary)}</p><details${topic.spoiler ? ' class="spoiler"' : ''}><summary>${topic.spoiler ? '스포일러 포함 · 펼쳐 읽기' : '대화 맥락 더 읽기'}</summary><p>${escapeHTML(topic.more)}</p></details></article>`).join('');
  document.querySelector('#people-list').innerHTML = data.people.map(person => `<article class="person"><div class="person-head"><span class="person-avatar" aria-hidden="true"><img class="person-character" src="${escapeHTML(data.participants[person.participantId].avatar)}" alt="" width="64" height="64"></span><div><h3>${escapeHTML(participantName(person.participantId))}</h3><p class="person-tagline">${escapeHTML(person.tagline)}</p></div></div>${person.paragraphs.map(p => `<p>${escapeHTML(displayText(p))}</p>`).join('')}<details><summary>공유한 생각 더 읽기</summary><p>${escapeHTML(displayText(person.more))}</p></details><span class="timestamp">녹음 ${escapeHTML(person.time)}</span></article>`).join('');
  document.querySelector('#candidate-list').innerHTML = data.candidates.map(candidate => `<article class="candidate" data-work-id="${escapeHTML(candidate.workId)}"><button class="cover-trigger candidate-open" type="button" data-work-open="${escapeHTML(candidate.workId)}" aria-label="${escapeHTML(candidate.title)} 소개 보기" aria-expanded="false" aria-controls="book-detail">${coverFrameMarkup(candidate.title,null,'span')}<span class="work-title">${escapeHTML(candidate.title)}</span><span class="cover-hint">소개·추천 맥락 보기 →</span></button>${coverCaptionMarkup(candidate.title)}<p class="candidate-state">${escapeHTML(candidate.state)} · ${escapeHTML(participantName('hj'))} 추천</p><p>${escapeHTML(displayText(candidate.note))}</p></article>`).join('');
  document.querySelector('#history-list').innerHTML = data.selectionHistory.map(book => {
    const cover = data.covers[book.coverKey];
    const participant = data.participants[book.recommenderId];
    const month = book.month.slice(2,4) + '.' + Number(book.month.slice(5));
    const recommender = participant ? `<span class="history-recommender"><img src="${escapeHTML(participant.avatar)}" width="24" height="24" alt=""><span>${escapeHTML(participant.displayName)} 추천</span></span>` : '';
    const content = `<span class="history-cover">${coverFrameMarkup(book.title,book.coverKey,'span')}</span><h2>${escapeHTML(book.title)}</h2><span class="history-meta"><span class="history-month">(${escapeHTML(month)})</span>${recommender}</span>`;
    const label = `${book.title} · ${book.month} 선정작${participant ? ' · ' + participant.displayName + ' 추천' : ''} · 도서 정보 · 새 창`;
    return `<article class="history-book">${cover ? `<a href="${escapeHTML(cover.page)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(label)}">${content}</a>` : content}</article>`;
  }).join('');
  document.querySelector('#history-sources').innerHTML = data.selectionHistory.map(book => {
    const cover = data.covers[book.coverKey];
    return cover ? `<li><a href="${escapeHTML(cover.page)}" target="_blank" rel="noopener noreferrer">${escapeHTML(book.title)} · ${escapeHTML(cover.label)} ↗</a></li>` : '';
  }).join('');
  const pastSelections = data.selectionHistory;
  const currentMeetingId = Object.keys(data.meetings).find(key => data.meetings[key].state === 'before-meeting');
  const shortMonth = month => month.slice(2,4) + '.' + Number(month.slice(5));
  const [firstYear, firstMonth] = pastSelections[0].month.split('-').map(Number);
  const [nowYear, nowMonth] = (currentMeetingId || pastSelections.at(-1).month).split('-').map(Number);
  const monthsTogether = (nowYear - firstYear) * 12 + (nowMonth - firstMonth);
  const nowNumber = pastSelections.length + (currentMeetingId ? 1 : 0);
  document.querySelector('#home-since').innerHTML = `<time datetime="${escapeHTML(pastSelections[0].month)}">${firstYear}년 ${firstMonth}월부터</time><span>${nowNumber}번째 책을 읽는 중</span>`;
  document.querySelector('#now-reading-label').textContent = `지금 읽는 책 · ${nowMonth}월 · ${nowNumber}번째`;
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
  const context = document.querySelector('#context');
  const roleTabs = [...document.querySelectorAll('.shelf-tabs [role="tab"]')];
  const roleNames = {all:'전체',candidate:'후보로 소개된 작품',recommendation:'추천한 작품',mention:'이야기에 등장한 작품'};
  function selectRole(role, updateHash = true) {
    if (!Object.hasOwn(roleNames, role)) return;
    activeRole = role;
    roleTabs.forEach(tab => { const active = tab.dataset.role === role; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    document.querySelector('#shelf-results').setAttribute('aria-labelledby', 'role-' + role);
    if (updateHash) history.pushState(null, '', '#' + roleHashes[role]);
    renderWorks();
  }
  roleTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectRole(tab.dataset.role));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % roleTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + roleTabs.length) % roleTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = roleTabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectRole(roleTabs[next].dataset.role); roleTabs[next].focus({preventScroll:true}); }
    });
  });
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-meeting-link]');
    if (!link) return;
    const sectionId = link.getAttribute('href').slice(1);
    const meeting = Object.values(data.meetings).find(item => item.section === sectionId);
    if (!meeting) return;
    event.preventDefault();
    showTab(meeting.tab, false);
    history.pushState(null, '', '#' + sectionId);
    const section = document.getElementById(sectionId);
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
    const link = meeting?.section ? `<a class="text-link" href="#${escapeHTML(meeting.section)}" data-meeting-link>${escapeHTML(linkLabel)} <span aria-hidden="true">→</span></a>` : '';
    return `<div class="work-context"><p class="context-source">${escapeHTML(mention.sourceLabel + people + time)}</p><p>${escapeHTML(displayText(mention.summary))}</p>${detail}${link}</div>`;
  }
  function renderWorks() {
    closeBookDetail(false);
    const term = search.value.trim().toLocaleLowerCase('ko');
    const uniqueWorks = [...new Map(data.works.map(work => [work.id, work])).values()];
    const matches = uniqueWorks.filter(work => {
      const mentions = workMentions(work);
      const text = `${work.title} ${work.creator} ${mentions.map(mention => `${displayText(mention.summary)} ${displayText(mention.detail)} ${mention.sourceLabel} ${mention.people.map(participantName).join(' ')}`).join(' ')}`;
      return (media.value === 'all' || work.media === media.value) &&
        (activeRole === 'all' || mentions.some(mention => mention.roles.includes(activeRole) && (activeRole !== 'recommendation' || ['discussion','remembered-recommendation'].includes(mention.kind)))) &&
        (context.value === 'all' || mentions.some(mention => mention.context === context.value)) &&
        text.toLocaleLowerCase('ko').includes(term);
    });
    document.querySelector('#work-list').innerHTML = matches.map(work => {
      const mentions = workMentions(work);
      const summary = mentions[0]?.summary ? `<span class="work-summary">${escapeHTML(displayText(mentions[0].summary))}</span>` : '';
      return `<article class="work" data-work-id="${escapeHTML(work.id)}"><button class="cover-trigger work-open" type="button" data-work-open="${escapeHTML(work.id)}" aria-label="${escapeHTML(work.title)} 소개 보기" aria-expanded="false" aria-controls="book-detail">${coverFrameMarkup(work.title,work.coverKey,'span')}<span class="work-copy"><span class="work-title">${escapeHTML(work.title)}</span><span class="work-author">${escapeHTML(work.creator + ' · ' + work.mediaLabel)}</span><span class="work-badges">${badgesFor(work, mentions)}</span>${summary}<span class="cover-hint">상세 보기 →</span></span></button></article>`;
    }).join('');
    document.querySelector('#result-count').textContent = `${matches.length}개 작품 · ${roleNames[activeRole]}${term ? ' · 검색 결과' : ''}`;
    document.querySelector('#empty-state').hidden = matches.length > 0;
    playMotion(document.querySelector('#work-list'),[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:180});
  }
  function resetFilters() { search.value = ''; media.value = 'all'; context.value = 'all'; selectRole('all', false); showTab('works'); }
  // The shelf is local and small: commit input synchronously so no delayed search can close a newly opened book.
  search.addEventListener('input', renderWorks);
  media.addEventListener('change', renderWorks);
  context.addEventListener('change', renderWorks);
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
