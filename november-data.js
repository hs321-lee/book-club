/* Public book information and approved display labels for November candidates. */
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
        "note": "저자의 설명에 동의하는 사례와 반대하는 사례를 함께 찾아보면 좋겠습니다."
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
        "edition": "",
        "summary": "청년인 나와 세상에서 거리를 두고 사는 선생님의 만남으로 시작합니다. 한 사람의 고백을 따라 신뢰와 이기심, 죄책감을 들여다봅니다.",
        "question": "솔직한 고백은 누구를 위한 행동일까?",
        "reason": "인물의 선택을 이해하는 시선과 비판하는 시선을 비교하며 깊게 이야기하기 좋습니다.",
        "note": "초반 전개는 느리고 분위기는 무겁습니다. 표지는 문학동네 유은경 번역 대표 판본이며, 함께 읽을 판본을 지정한 것은 아닙니다."
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
        "note": "폭력과 잔혹한 장면이 있습니다. 표지는 안전가옥 대표 표지입니다."
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
      "state": "choosing-book"
    }
  ],
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
      "page": "https://www.yes24.com/product/goods/32614607",
      "local": "./assets/covers/candidates/november-kokoro.webp",
      "width": 270,
      "height": 400,
      "label": "책 표지 · 문학동네 · 유은경 번역 · 대표 판본",
      "isbn": "9788954642484"
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
      "section": "november-candidates",
      "candidateSection": "november-candidates",
      "state": "choosing-book",
      "linkLabel": "11월 후보 세 권 보기"
    }
  }
};
  for (const key of ['works', 'candidateMeetings']) data[key].push(...additions[key]);
  Object.assign(data.covers, additions.covers);
  Object.assign(data.meetings, additions.meetings);
  const monthTabs = document.querySelector('.month-tabs');
  monthTabs.querySelectorAll('[role="tab"]').forEach(tab => { tab.setAttribute('aria-selected', 'false'); tab.tabIndex = -1; });
  monthTabs.insertAdjacentHTML('afterbegin', '<button id="month-november" role="tab" aria-selected="true" aria-controls="november" data-month="november">2026년 11월 · 후보</button>');
  monthTabs.insertAdjacentHTML('afterend', `    <section id="november" role="tabpanel" aria-labelledby="month-november">
      <div class="november-intro" data-reveal>
        <p class="meeting-meta"><time datetime="2026-11">2026년 11월</time><span>후보 3권</span><span>마리오님 추천</span></p>
        <h1>11월에는 어떤 질문을 만날까요?</h1>
        <p class="hero-lede">도시를 보는 시선, 인간의 마음, 낯선 상상.<br>서로 다른 세 권 중 함께 읽을 책을 고릅니다.</p>
        <p class="muted">다음 모임 · 2026년 11월 25일 수요일 예정 · 도서 선정 전</p>
      </div>
      <section id="november-candidates" class="section november-candidates" tabindex="-1" aria-labelledby="november-candidates-title">
        <div class="section-heading" data-reveal><h2 id="november-candidates-title">11월 후보 세 권</h2><p>표지를 누르면 소개와 추천 이유를 볼 수 있습니다.</p></div>
        <ul class="november-grid" data-reveal-group data-upcoming-candidates="2026-11"></ul>
        <p class="source-note">소개와 질문은 도서 선정을 위한 모임 전 자료입니다. 실제 토론이나 멤버의 독후 감상은 아닙니다.</p>
      </section>
    </section>
`);
  document.getElementById('october').hidden = true;
  const homeRecent = document.querySelector('.home-recent');
  homeRecent.querySelector('h2').textContent = '11월, 함께 읽을 책을 골라요.';
  homeRecent.querySelector('p').textContent = '마리오님이 소개하는 세 권입니다. 도시를 보는 시선, 인간의 마음, 낯선 상상 중 다음 독서를 골라 봅니다.';
  const homeLink = homeRecent.querySelector('[data-go]');
  homeLink.dataset.go = 'november';
  homeLink.textContent = '11월 후보 세 권 보기 →';
  const nextMeeting = document.querySelector('#october > .next-meeting:last-child');
  nextMeeting.querySelector('p').textContent = '11월 25일로 잡았고, 마리오님이 소개하는 세 권 중 함께 읽을 책을 고릅니다.';
  const nextLink = nextMeeting.querySelector('[data-go]');
  nextLink.dataset.go = 'november';
  nextLink.textContent = '11월 후보 세 권 보기 →';
})();
