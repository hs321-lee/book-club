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
    const copy = panel.querySelector('.hero-copy') || panel.querySelector('.works-intro');
    const book = panel.querySelector('.featured-book');
    playMotion(copy, [{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}], {duration:480});
    playMotion(book, [{opacity:0,transform:'translateY(20px) rotate(-3deg)'},{opacity:1,transform:'none'}], {duration:580,delay:70});
    panel.querySelectorAll('.voice-preview-item').forEach((voice,index) => playMotion(voice, [{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}], {duration:420,delay:160+index*70}));
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
  const tabs = [...document.querySelectorAll('.masthead .tabs [role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const detailPanel = document.querySelector('#book-detail');
  let detailOpener = null;
  function closeBookDetail(returnFocus = true) {
    if (detailPanel.hidden) return;
    const focusWasInside = detailPanel.contains(document.activeElement);
    detailPanel.hidden = true;
    stopMotionWithin(detailPanel);
    document.querySelectorAll('[data-work-open],[data-book-intro]').forEach(button => button.setAttribute('aria-expanded','false'));
    if (returnFocus) {
      const target = detailOpener?.isConnected ? detailOpener : document.querySelector('#main');
      target.focus({preventScroll:true});
      target.scrollIntoView({block:'center',behavior:motionPreference?.matches ? 'auto' : 'smooth'});
    } else if (focusWasInside) document.querySelector('#main').focus({preventScroll:true});
    detailOpener = null;
  }
  function openBookDetail(work, opener, isIntro = false) {
    closeBookDetail(false);
    const mentions = isIntro ? [] : workMentions(work);
    document.querySelector('#book-detail-title').textContent = work.title;
    const contexts = isIntro ? `<div class="work-context"><p class="context-source">9월 15일 토론 기록</p><p>${escapeHTML(data.topics[0].summary)}</p><p>${escapeHTML(data.topics[3].summary)}</p><a class="text-link" href="#discussion" data-meeting-link>9월 토론 보기 →</a></div>` : mentions.map(mentionMarkup).join('');
    const badges = isIntro ? '<span class="work-badge">9월 함께 읽은 책</span>' : badgesFor(work, mentions);
    document.querySelector('#book-detail-body').innerHTML = `<div class="book-detail-cover">${coverMarkup(work.title,work.coverKey)}</div><div class="book-detail-copy"><p class="book-detail-media">${escapeHTML(work.mediaLabel + ' · ' + work.creator)}</p><div class="work-badges">${badges}</div>${contexts}${isIntro ? '' : `<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/search?q=${encodeURIComponent(work.search || work.title + ' ' + work.creator)}">작품 검색 <span aria-hidden="true">↗</span></a>`}</div>`;
    detailOpener = opener;
    detailPanel.hidden = false;
    opener.setAttribute('aria-expanded','true');
    playMotion(document.querySelector('#book-detail-body'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:260});
    document.querySelector('#book-detail-title').focus({preventScroll:true});
    detailPanel.scrollIntoView({block:'start',behavior:motionPreference?.matches ? 'auto' : 'smooth'});
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
  function showTab(id, updateHash = true) {
    if (!panels.some(p => p.id === id)) return;
    const changed = panels.find(panel => !panel.hidden)?.id !== id;
    closeBookDetail(false);
    tabs.forEach(tab => { const active = tab.dataset.tab === id; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    panels.forEach(panel => { if (panel.id !== id) stopMotionWithin(panel); panel.hidden = panel.id !== id; });
    if (updateHash) history.pushState(null, '', '#' + (id === 'works' ? roleHashes[activeRole] : id));
    const tabTitles = {september:'9월 모임',october:'10월 모임',works:'함께 볼 작품',history:'지난 선정작'};
    document.title = `${tabTitles[id]} · 책 사이`;
    const panel = panels.find(item => item.id === id);
    if (changed && visitedScenes.has(id)) playMotion(panel,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}]);
    playScene(panel);
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
    const role = Object.keys(roleHashes).find(key => roleHashes[key] === id);
    if (role) { selectRole(role, false); showTab('works', false); }
    else if (panels.some(p => p.id === id)) showTab(id, false);
    else if (['discussion', 'people', 'summary-title'].includes(id)) { showTab('september', false); document.getElementById(id)?.scrollIntoView({block:'start'}); }
    else if (id === 'candidates') { showTab('october', false); document.getElementById(id)?.scrollIntoView({block:'start'}); }
    else showTab('september', false);
  }
  window.addEventListener('hashchange', syncHash);
  window.addEventListener('popstate', syncHash);
  document.querySelector('.wordmark').addEventListener('click', () => showTab('september', false));
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
  syncHash();
})();
