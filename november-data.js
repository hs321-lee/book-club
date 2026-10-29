/* November: candidates, the chosen book (마음) and its four-week reading plan. */
(() => {
  const data = window.BOOK_CLUB;
  if (!data || data.meetings['2026-11']) return;
  const additions = {
  "works": [
    {
      "id": "cities-book",
      "title": "도시는 무엇으로 사는가",
      "creator": "유현준",
      "media": "book",
      "mediaLabel": "책",
      "coverKey": "november-cities",
      "candidateProfile": {
        "genre": "도시 인문",
        "edition": "10주년 전면 개정판",
        "summary": "매일 걷는 거리와 머무는 공간을 새롭게 보는 도시 인문서입니다. 아파트와 공원, 사무실이 우리의 생활과 관계에 주는 영향을 살펴봅니다.",
        "question": "내가 좋아하는 동네는 무엇 때문에 좋은가?",
        "reason": "익숙한 생활 공간에서 새로운 질문을 찾고, 각자의 동네와 직장 경험을 나누기 좋습니다.",
        "note": "저자의 설명에 동의하는 사례와 반대하는 사례를 함께 찾아보면 좋겠습니다.",
        "discovery": {
          "short": "유현준 건축가의 유튜브 영상에서 10주년 개정판을 알게 돼 골랐습니다.",
          "text": "유현준 건축가가 출연한 유튜브 영상을 보고 10주년 개정판이 나왔다는 것을 알게 됐습니다. 익숙한 도시와 공간을 어떤 시선으로 설명하는지 읽어보고 싶었습니다.",
          "label": "지식인사이드 · 김대식 × 유현준 대담",
          "image": "https://i.ytimg.com/vi/nxWYjFlzRbM/hqdefault.jpg",
          "imageAlt": "지식인사이드의 김대식·유현준 대담 영상 썸네일",
          "url": "https://youtu.be/nxWYjFlzRbM",
          "linkLabel": "계기가 된 영상 보기",
          "imageAction": "video"
        }
      }
    },
    {
      "id": "kokoro-book",
      "title": "마음",
      "creator": "나쓰메 소세키",
      "media": "book",
      "mediaLabel": "책",
      "coverKey": "november-kokoro",
      "candidateProfile": {
        "genre": "고전 · 심리소설",
        "edition": "에디터스 컬렉션 · 오유리 옮김",
        "summary": "청년인 나와 세상에서 거리를 두고 사는 선생님의 만남으로 시작합니다. 한 사람의 고백을 따라 신뢰와 이기심, 죄책감을 들여다봅니다.",
        "question": "솔직한 고백은 누구를 위한 행동일까?",
        "reason": "인물의 선택을 이해하는 시선과 비판하는 시선을 비교하며 깊게 이야기하기 좋습니다.",
        "note": "초반 전개는 느리고 분위기는 무겁습니다. 문예출판사 에디터스 컬렉션의 오유리 번역판으로 소개합니다.",
        "discovery": {
          "short": "송희구 작가에게 영감을 준 책을 소개하는 밀리 콘텐츠에서 첫 추천 도서로 만나 골랐습니다.",
          "text": "밀리의 서재에서 송희구 작가에게 영감을 준 책들을 소개하는 콘텐츠를 봤습니다. 첫 번째 추천 도서인 『마음』이 궁금해 후보로 골랐습니다.",
          "label": "밀리의 서재 · 송희구 작가 추천 콘텐츠",
          "image": "./assets/sources/november-kokoro-millie-1.jpg",
          "imageAlt": "밀리의 서재 송희구 작가 추천 콘텐츠의 대표 추천 도서 마음",
          "imageAction": "crop",
          "gallery": [
            { "image": "./assets/sources/november-kokoro-millie-1.jpg", "alt": "밀리의 서재 마음 추천 도서와 소개 전반", "width": 979, "height": 1536 },
            { "image": "./assets/sources/november-kokoro-millie-2.jpg", "alt": "밀리의 서재 마음 소개 후반", "width": 1171, "height": 1536 }
          ]
        }
      }
    },
    {
      "id": "cocktail-book",
      "title": "칵테일, 러브, 좀비",
      "creator": "조예은",
      "media": "book",
      "mediaLabel": "책",
      "coverKey": "november-cocktail",
      "candidateProfile": {
        "genre": "호러 · 판타지 단편집",
        "edition": "",
        "summary": "귀신과 좀비, 시간여행을 다룬 네 편의 단편을 묶었습니다. 낯선 설정을 통해 익숙한 관계와 일상 속 폭력을 돌아보게 합니다.",
        "question": "가장 마음에 남거나 불편했던 이야기는 무엇인가?",
        "reason": "단편별로 끊어 읽고, 가장 좋았던 작품과 불편했던 작품의 감상을 비교하기 좋습니다.",
        "note": "폭력과 잔혹한 장면이 있습니다. 표지는 안전가옥 대표 표지입니다.",
        "discovery": {
          "short": "교보문고와 MBC가 함께하는 북 퍼포먼스 예능 『읽는 사람들』의 첫 번째 책으로 소개돼 관심이 생겼습니다.",
          "text": "교보문고와 MBC가 함께하는 북 퍼포먼스 예능 『읽는 사람들』의 첫 번째 책으로 소개돼 관심이 생겼습니다.",
          "label": "교보문고 × MBC · 읽는 사람들",
          "image": "./assets/sources/november-cocktail-reading-people.jpg",
          "imageAlt": "교보문고와 MBC의 북 퍼포먼스 예능 읽는 사람들 포스터",
          "url": "https://event.kyobobook.co.kr/make/247513",
          "linkLabel": "읽는 사람들 공식 행사 보기",
          "imageAction": "enlarge"
        }
      }
    }
  ],
  "candidateMeetings": [
    {
      "meetingId": "2026-11",
      "section": "november-candidates",
      "workIds": [
        "cities-book",
        "kokoro-book",
        "cocktail-book"
      ],
      "selectedWorkId": "kokoro-book",
      "state": "before-meeting"
    }
  ],
  "selections": [
    {
      "workId": "kokoro-book",
      "meetingId": "2026-11",
      "status": "selected"
    }
  ],
  "selectionHistory": [
    {
      "id": "kokoro",
      "month": "2026-11",
      "title": "마음",
      "recommenderId": "hs",
      "coverKey": "november-kokoro"
    }
  ],
  "reading": {
    "2026-11": {
      "workId": "kokoro-book",
      "basis": "번역본마다 쪽수가 달라 장 번호로 나눴습니다. 상 36장 · 중 18장 · 하 56장, 모두 110장입니다.",
      "weeks": [
        { "label": "1주", "dates": "10월 29일 – 11월 4일", "range": "상 1–27장", "part": "상 · 선생님과 나", "focus": "'나'가 선생님을 처음 만나 조금씩 가까워집니다. 잔잔하게 흘러가니 이번 주에 넉넉히 읽어 두면 좋습니다." },
        { "label": "2주", "dates": "11월 5일 – 11월 11일", "range": "상 28–36장 · 중 1–18장", "part": "상 끝 · 중 · 부모님과 나", "focus": "상편을 마무리하고, 고향에 내려간 '나'와 가족의 이야기로 넘어갑니다." },
        { "label": "3주", "dates": "11월 12일 – 11월 18일", "range": "하 1–28장", "part": "하 · 선생님과 유서", "focus": "선생님이 남긴 긴 글이 시작됩니다. 이야기의 목소리가 바뀌는 지점입니다." },
        { "label": "4주", "dates": "11월 19일 – 11월 24일", "range": "하 29–56장", "part": "하 · 선생님과 유서", "focus": "끝까지 읽고, 모임에서 나누고 싶은 장면이나 문장을 하나씩 골라 둡니다." }
      ],
      "questions": [
        "솔직한 고백은 누구를 위한 행동일까?",
        "선생님은 왜 세상과 거리를 두고 살까? 읽는 동안 내 짐작은 어떻게 바뀌었나?",
        "'나'에게 선생님과 아버지는 각각 어떤 어른일까?"
      ],
      "tips": [
        "다른 번역본으로 읽어도 장 번호는 같습니다.",
        "초반 전개는 느리고 분위기는 무겁습니다. 뒤로 갈수록 앞의 장면이 다시 읽힙니다."
      ]
    }
  },
  "covers": {
    "november-cities": {
      "title": "도시는 무엇으로 사는가",
      "creator": "유현준",
      "page": "https://www.yes24.com/product/goods/182624787",
      "local": "./assets/covers/candidates/november-cities.webp",
      "width": 873,
      "height": 1200,
      "label": "책 표지 · 을유문화사 · 10주년 전면 개정판",
      "isbn": "9788932476049"
    },
    "november-kokoro": {
      "title": "마음",
      "creator": "나쓰메 소세키",
      "page": "https://www.yes24.com/product/goods/78520772",
      "local": "./assets/covers/candidates/november-kokoro.webp?v=oh-yuri-2019",
      "width": 543,
      "height": 850,
      "label": "책 표지 · 문예출판사 · 에디터스 컬렉션 · 오유리 옮김",
      "isbn": "9788931020106",
      "printIsbn": "9788931019605",
      "publisher": "문예출판사",
      "translator": "오유리"
    },
    "november-cocktail": {
      "title": "칵테일, 러브, 좀비",
      "creator": "조예은",
      "page": "https://www.yes24.com/product/goods/89913383",
      "local": "./assets/covers/candidates/november-cocktail.webp",
      "width": 659,
      "height": 1200,
      "label": "책 표지 · 안전가옥 · 대표 판본"
    }
  },
  "meetings": {
    "2026-11": {
      "label": "11월",
      "tab": "november",
      "candidateSection": "november-candidates",
      "section": "november-reading",
      "state": "before-meeting",
      "linkLabel": "11월 읽기 안내 보기"
    }
  }
};
  for (const key of ['works', 'candidateMeetings', 'selections', 'selectionHistory']) data[key].push(...additions[key]);
  data.reading = additions.reading;
  Object.assign(data.covers, additions.covers);
  Object.assign(data.meetings, additions.meetings);
  const monthTabs = document.querySelector('.month-tabs');
  monthTabs.querySelectorAll('[role="tab"]').forEach(tab => { tab.setAttribute('aria-selected', 'false'); tab.tabIndex = -1; });
  monthTabs.insertAdjacentHTML('afterbegin', '<button id="month-november" role="tab" aria-selected="true" aria-controls="november" data-month="november">2026년 11월 · 읽는 중</button>');
  monthTabs.insertAdjacentHTML('afterend', `    <section id="november" role="tabpanel" aria-labelledby="month-november">
      <div class="meeting-hero" data-reveal-group>
        <div class="hero-copy" data-reveal>
          <p class="meeting-meta"><time datetime="2026-11">2026년 11월</time><span>읽는 중</span><span>마리오님 추천</span></p>
          <h1 id="november-title">한 사람의 고백을 따라,<br>마음 속으로.</h1>
          <p class="hero-lede">후보 세 권 중 나쓰메 소세키의 『마음』을 함께 읽습니다.<br>11월 25일 수요일에 만나 이야기합니다.</p>
          <a class="text-link" href="#november-reading">4주 읽기 안내 <span aria-hidden="true">↓</span></a>
        </div>
        <figure class="featured-book" data-reveal><button class="cover-trigger hero-book-button" type="button" data-work-open="kokoro-book" aria-label="마음 소개 보기" aria-expanded="false" aria-controls="book-detail"><span class="cover-frame hero-cover"><img class="cover-img" src="./assets/covers/candidates/november-kokoro.webp?v=oh-yuri-2019" width="543" height="850" alt="마음 책 표지 · 문예출판사 · 에디터스 컬렉션 · 오유리 옮김"><span class="cover-fallback" hidden>마음<br>표지를 불러오지 못했어요.</span></span><span class="cover-hint">책을 펼쳐 보기 →</span></button><figcaption><strong>11월에 함께 읽는 책</strong><span>마음 · 나쓰메 소세키 · 오유리 옮김</span><a class="cover-source" href="https://www.yes24.com/product/goods/78520772" target="_blank" rel="noopener noreferrer">표지 출처 ↗</a></figcaption></figure>
      </div>
      <section id="november-reading" class="section" tabindex="-1" aria-labelledby="november-reading-title">
        <div class="section-heading" data-reveal><h2 id="november-reading-title">4주 읽기 안내</h2><p data-reading-basis="2026-11"></p></div>
        <ol class="reading-plan" data-reveal-group data-reading-plan="2026-11"></ol>
      </section>
      <section id="november-before" class="section" aria-labelledby="november-before-title">
        <div class="section-heading" data-reveal><h2 id="november-before-title">읽기 전에</h2><p>모임에서 함께 꺼내 보고 싶은 질문입니다. 답을 정해 두지 않아도 괜찮습니다.</p></div>
        <div class="reading-notes" data-reveal data-reading-notes="2026-11"></div>
      </section>
      <section id="november-candidates" class="section record-candidates" tabindex="-1" aria-labelledby="november-candidates-title"><div class="section-heading" data-reveal><h2 id="november-candidates-title">함께 검토했던 책</h2><p>2026년 11월 모임의 후보 세 권입니다. <span data-participant="hs"></span>이 소개한 세 권 중 『마음』을 함께 읽기로 정했습니다.</p></div><ul class="record-candidate-shelf" data-reveal-group data-candidate-shelf="2026-11"></ul></section>
    </section>
`);
  document.getElementById('october').hidden = true;
  // Home: the chosen book becomes the book being read now.
  const now = document.querySelector('.now-reading');
  const nowCover = now.querySelector('.now-reading-cover');
  nowCover.dataset.workOpen = 'kokoro-book';
  nowCover.setAttribute('aria-label', '마음 소개 보기');
  const nowImg = nowCover.querySelector('.cover-img');
  Object.assign(nowImg, { src: './assets/covers/candidates/november-kokoro.webp?v=oh-yuri-2019', width: 543, height: 850, alt: '마음 책 표지 · 문예출판사 · 에디터스 컬렉션 · 오유리 옮김' });
  nowCover.querySelector('.cover-fallback').innerHTML = '마음<br>표지를 불러오지 못했어요.';
  now.querySelector('#now-reading-title').textContent = '마음';
  now.querySelector('.now-reading-copy .muted').textContent = '나쓰메 소세키 · 마리오님 추천 · 11월 25일 수요일 모임에서 이야기합니다';
  const nowLink = now.querySelector('[data-go]');
  nowLink.dataset.go = 'november';
  nowLink.textContent = '11월 읽기 안내 보기 →';
  const homeRecent = document.querySelector('.home-recent');
  homeRecent.querySelector('h2').textContent = '11월 25일 수요일에 만나요.';
  homeRecent.querySelector('p').textContent = '『마음』을 4주에 나눠 읽을 수 있게 장 번호로 읽기 안내를 정리했습니다. 함께 검토했던 후보 두 권도 같은 곳에서 볼 수 있습니다.';
  const homeLink = homeRecent.querySelector('[data-go]');
  homeLink.dataset.go = 'november';
  homeLink.textContent = '4주 읽기 안내 보기 →';
  const nextMeeting = document.querySelector('#october > .next-meeting:last-child');
  nextMeeting.querySelector('h2').textContent = '11월에는 『마음』을 읽습니다.';
  nextMeeting.querySelector('p').textContent = '11월 25일 수요일에 만나, 마리오님이 소개한 나쓰메 소세키의 『마음』을 이야기합니다.';
  const nextLink = nextMeeting.querySelector('[data-go]');
  nextLink.dataset.go = 'november';
  nextLink.textContent = '11월 읽기 안내 보기 →';
})();
