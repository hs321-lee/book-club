# 책 사이 · 독서모임

9월 토론 기록, 10월 선정 도서와 후보 검토, 모임에서 소개된 작품을 읽는 정적 웹사이트입니다. 프레임워크나 빌드 과정 없이 동작합니다.

## GitHub Pages

1. 저장소 Settings → Pages로 이동합니다.
2. Build and deployment → Source에서 **Deploy from a branch**를 선택합니다.
3. Branch는 **main**, 폴더는 **/(root)**로 선택하고 저장합니다.
4. 배포가 완료되면 `https://hs321-lee.github.io/book-club/`에서 확인합니다.

개인 **private** 저장소에서 GitHub Pages를 사용하려면 **GitHub Pro**가 필요합니다. 저장소가 private이어도 Pages에 배포한 HTML·CSS·JS와 데이터는 공개됩니다. [GitHub 공식 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

## 로컬 확인

```sh
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 엽니다. 모든 리소스 경로는 상대 경로이며 `/book-club/` 하위 배포를 지원합니다.

## 기록 기준

- 9월: 2026년 9월 15일 모임 녹음에서 요약한 내용입니다. 직접 인용이나 개인의 원본 준비 자료로 표현하지 않습니다.
- 10월: 선정 도서와 후보 검토 메모만 표시합니다. 아직 열린 모임의 토론처럼 표현하지 않습니다.
- 작품 목록: 추천·비교·추억·영화화 언급을 구별합니다. 제목 또는 영화 판본이 불확실한 작품은 확정 목록에 넣지 않습니다.
- 책 이미지는 제목으로 구성한 장식이며 공식 표지가 아닙니다.
- 원본 녹음·전문, 사적인 대화 및 관계자의 개인 정보는 배포하지 않습니다.

`data.js`에서 주제, 화자별 요약, 작품 목록과 후보 메모를 수정합니다. 이후 모임은 같은 자료 기준으로 확장합니다.
