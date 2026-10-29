# 실행과 배포

이 문서의 명령은 저장소 루트에서 실행합니다. 문서 분리는 사이트 주소·공개 범위·배포 설정을 변경하지 않습니다.

## GitHub Pages

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

