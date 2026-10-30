# 실행과 배포

이 문서의 명령은 저장소 루트에서 실행합니다. Cloudflare 전환을 검증하기 전까지 기존 GitHub Pages를 유지합니다.

## Cloudflare Pages 전환

저장소는 private로 관리하고, `dist/`에 만든 웹페이지는 로그인 없이 공개합니다. Private 저장소 연결도 지원합니다. [Cloudflare 공식 안내](https://developers.cloudflare.com/pages/get-started/git-integration/)

1. Cloudflare의 Workers & Pages에서 Pages 프로젝트를 만들고 GitHub 저장소를 연결합니다. GitHub 연결 권한은 이 저장소만 선택합니다.
2. 프레임워크는 **None**, 운영 브랜치는 **main**, 빌드 명령은 **`node scripts/build-site.mjs`**, 출력 디렉터리는 **`dist`**로 설정합니다. 루트 디렉터리는 저장소 루트로 둡니다.
3. 새 주소에서 홈, 11월 읽기 안내, 지난 모임 기록, 작품 상세, 표지, `mario/2026-10/` 발표자료와 `meetings/2025-03/` 이전 주소를 확인합니다.
4. Pages 프로젝트의 Metrics에서 Web Analytics를 활성화한 후 다시 배포합니다. 추적 코드는 Cloudflare가 삽입하므로 임의의 분석 토큰을 소스에 넣지 않습니다. 방문·페이지 조회 통계는 Cloudflare 관리자 화면에서 확인합니다. `#home` 등 화면별 통계 구분은 실제 배포에서 검증합니다. [Web Analytics 설정](https://developers.cloudflare.com/pages/how-to/web-analytics/)
5. 새 주소와 자동 배포가 정상인 것을 확인한 후 기존 Pages 게시를 종료하고 저장소를 private로 전환합니다. GitHub Free에서 먼저 private로 바꾸면 기존 Pages 게시가 중단됩니다. 전환 전 새 주소를 기록하고, 전환 후에도 Cloudflare의 저장소 접근과 배포를 확인합니다.

`build-site.mjs`는 루트의 HTML·CSS·JS 6개와 `assets/`의 이미지·폰트, `mario/`·`meetings/`의 HTML·CSS·JS만 복사합니다. 숨김 파일과 다른 확장자는 제외하고, 공개 디렉터리의 심볼릭 링크는 오류로 처리합니다. `AGENTS.md`, `README.md`, `docs/`, `tests/`, `.github/`, 그 밖의 새 폴더는 배포하지 않습니다. 새 공개 파일 종류가 필요하면 복사 허용 목록과 검사를 함께 수정합니다. `dist/`는 빌드마다 새로 만들며 Git에 저장하지 않습니다.

`data.js`, `november-data.js`, 공개 HTML과 허용된 이미지 파일의 내용은 방문자가 볼 수 있습니다. 빌드는 이 파일에서 개인 정보를 자동으로 제거하지 않습니다. 개인 정보와 원본 녹음·전문을 이 파일에 넣지 않습니다.

로컬에서 공개 산출물을 확인합니다.

```sh
node --test tests/*.test.cjs
node scripts/build-site.mjs
python -m http.server 8000 --directory dist
```

빌드 검사는 기존 자료의 보존, 로컬 리소스 경로, 비공개·유지보수 파일과 이전 빌드 파일의 제외를 확인합니다. 브라우저 렌더링과 실제 방문 통계는 배포 후 별도로 확인합니다.

## 기존 GitHub Pages

1. 저장소 Settings → Pages로 이동합니다.
2. Build and deployment → Source에서 **Deploy from a branch**를 선택합니다.
3. Branch는 **main**, 폴더는 **/(root)**로 선택하고 저장합니다.
4. 배포 완료 여부는 저장소의 Pages 설정과 배포 결과에서 확인합니다. 기존 사이트 주소는 유지합니다.

개인 **private** 저장소에서 GitHub Pages를 사용하려면 **GitHub Pro**가 필요합니다. 저장소가 private이어도 Pages에 배포한 HTML·CSS·JS와 데이터는 공개됩니다. [GitHub 공식 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

## 로컬 확인

```sh
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 엽니다. 모든 리소스 경로는 상대 경로이며 `/book-club/` 하위 배포를 지원합니다.

탐색 회귀 검사는 별도 패키지 설치 없이 `node --test tests/navigation.test.cjs`로 실행합니다. 실제 앱 스크립트의 카드 링크와 탭 유지·본문 포커스를 DOM 이벤트 fixture에서 확인하며, 화면 배치와 브라우저 고유 동작은 브라우저에서 별도로 확인합니다.

