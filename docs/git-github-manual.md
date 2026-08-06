# Git · GitHub 실무 매뉴얼

팀에서 자주 쓰는 Git과 GitHub 명령어를 짧고 명확하게 정리한 문서입니다.  
이 프로젝트는 `main`에 직접 작업하지 않고 개인 작업 브랜치에서 수정한 뒤 PR로 검토합니다.

## 먼저 구분하기

| 구분 | 쉬운 말 | 하는 일 | 명령어 (Terminal) | 명령어 (대화) |
| --- | --- | --- | --- | --- |
| Git | 내 PC의 변경 이력 관리 | 파일 변경과 커밋을 관리 | `git status`, `git commit` | `Git의 현재 상태를 확인하고 커밋까지 진행해줘.` |
| GitHub | 온라인 공유 공간 | 원격 저장소, PR, 리뷰를 관리 | `git push`, `gh pr create` | `GitHub 업로드와 PR 생성을 도와줘.` |
| 브랜치 | 안전한 작업 공간 | 다른 작업과 분리해서 수정 | `git switch -c` | `새 작업 브랜치를 만들고 이동해줘.` |
| 커밋 | 저장 지점 | 의미 있는 변경을 기록 | `git commit -m` | `변경점을 확인한 뒤 적절한 메시지로 커밋해줘.` |
| Push | 온라인 업로드 | 내 커밋을 GitHub에 올림 | `git push` | `현재 브랜치의 커밋을 GitHub에 올려줘.` |
| Pull Request (PR) | 병합 요청서 | 변경을 검토받고 `main`에 합칠 준비 | `gh pr create` | `현재 브랜치로 main 대상 PR을 만들어줘.` |

## 가장 자주 쓰는 명령어

`<브랜치명>`과 `<파일경로>`는 실제 값으로 바꿉니다. 대화 명령어는 AI에게 그대로 보내면 됩니다.

| 목적 | 명령어 (Terminal) | 명령어 (대화) | 환경 | 바로 이해할 결과 |
| --- | --- | --- | --- | --- |
| 브랜치 상태 체크 | `git status --short --branch` | `브랜치 상태 체크하고 매우 직관적으로 이야기해줘.` | 프로젝트 폴더 | 수정 파일과 업로드/다운로드 필요 여부 |
| GitHub 상태 체크 | `git fetch --prune` 후 `git status --short --branch` | `GitHub 상태 체크해주고 매우 쉽게 알려줘.` | 프로젝트 폴더 + 원격 | 원격 기준으로 최신 상태인지 확인 |
| 전체 브랜치 목록 | `git branch --all` | `전체 브랜치 리스트업하고 역할별로 쉽게 설명해줘.` | 프로젝트 폴더 | 로컬·원격 브랜치 전체 목록, `*`는 현재 브랜치 |
| 내 브랜치만 보기 | `git branch` | `내 로컬 브랜치만 쉽게 알려줘.` | 프로젝트 폴더 | 현재 작업 공간 목록 |
| 원격 브랜치만 보기 | `git branch --remotes` | `GitHub 원격 브랜치만 목록으로 알려줘.` | 프로젝트 폴더 | 팀원 작업 브랜치 목록 |
| 커밋 상태 보기 | `git log --oneline -10` | `최근 커밋 상태를 쉬운 말로 알려줘.` | 프로젝트 폴더 | 최근 작업 이력 |
| 현재 변경 상세 보기 | `git diff` | `커밋 전 변경점을 확인하고 위험한 파일이 있는지 알려줘.` | 프로젝트 폴더 | 실제 바뀐 코드/문서 |
| 커밋 전 파일 선택 | `git add <파일경로>` | `이 파일만 다음 커밋에 넣어줘.` | 프로젝트 폴더 | 다음 커밋에 들어갈 파일 선택 |
| 모든 변경 선택 | `git add .` | `현재 변경 전체를 커밋 후보에 넣되 위험한 파일부터 확인해줘.` | 프로젝트 폴더 | 의도하지 않은 파일 포함 여부 확인 필요 |
| 작은 변경 커밋 | `git commit -m "docs: Git GitHub 매뉴얼 추가"` | `작은 변경점을 만들고 커밋까지만 해줘.` | 프로젝트 폴더 | 내 PC에만 새 커밋 생성 |
| 커밋 후 GitHub 업로드 | `git push origin <브랜치명>` | `작은 변경점을 만들고 커밋한 뒤 Push 해줘.` | 프로젝트 폴더 | 팀원이 GitHub에서 변경 확인 가능 |
| 첫 Push | `git push -u origin <브랜치명>` | `현재 브랜치를 처음으로 GitHub에 올려줘.` | 프로젝트 폴더 | 이후에는 `git push`만 사용 가능 |
| PR 생성 | `gh pr create --base main --head <브랜치명>` | `현재 작업 브랜치로 main 대상 PR을 만들어줘.` | GitHub CLI 로그인 환경 | GitHub에서 리뷰와 병합 여부 확인 |
| PR 상태 확인 | `gh pr view` | `내 PR의 리뷰, 체크, 충돌 상태를 알려줘.` | GitHub CLI 로그인 환경 | 병합 전에 남은 작업 |

## 기본 작업 흐름

| 순서 | 명령어 (Terminal) | 명령어 (대화) | 언제 쓰는가 | 확인할 것 |
| --- | --- | --- | --- | --- |
| 1. 최신 상태 확인 | `git fetch --prune` | `작업 시작 전 GitHub 최신 상태를 확인해줘.` | 작업 시작 전 | 원격 브랜치 정보 갱신 |
| 2. 작업 공간 확인 | `git status --short --branch` | `작업 공간에 남은 변경이 무엇인지 확인해줘.` | 수정 전·후 | 남아 있는 변경이 내 작업인지 확인 |
| 3. 작업 브랜치 생성 | `git switch -c student/<이름>/<작업명>` | `내 이름과 작업명을 사용해 새 작업 브랜치를 만들고 이동해줘.` | 새 작업 시작 | `main`에서는 직접 수정하지 않음 |
| 4. 변경 확인 | `git diff` | `커밋 전 변경점을 확인하고 위험한 파일이 있는지 알려줘.` | 커밋 전 | 의도한 변경만 있는지 확인 |
| 5. 커밋할 파일 선택 | `git add <파일경로>` | `확인한 파일만 다음 커밋에 넣어줘.` | 변경 검토 후 | `.env`, 빌드 산출물 등 제외 |
| 6. 커밋 내용 확인 | `git diff --staged` | `커밋 후보에 들어간 파일과 내용을 확인해줘.` | 커밋 직전 | 선택한 파일과 내용이 맞는지 확인 |
| 7. 커밋 | `git commit -m "타입: 짧은 변경 설명"` | `변경점을 검토하고 적절한 메시지로 커밋해줘.` | 의미 있는 변경 단위 | 메시지가 변경 이유를 설명하는지 확인 |
| 8. 업로드 | `git push -u origin <브랜치명>` | `현재 브랜치를 처음 GitHub에 올려줘.` | 첫 업로드 | 원격 브랜치 연결 성공 여부 |
| 9. PR 생성 | `gh pr create --base main --head <브랜치명>` | `현재 작업 브랜치로 main 대상 PR을 만들어줘.` | 리뷰 준비 완료 | 대상은 `main`, 출발점은 내 브랜치 |
| 10. 리뷰·병합 | GitHub PR 화면 | `PR의 체크, 리뷰, 충돌 여부를 확인해줘. 병합은 하지 마.` | PR 생성 후 | 체크, 리뷰, 충돌 여부 확인 |

## 상태 문구 읽는 법

| 표시 | 뜻 | 해야 할 일 |
| --- | --- | --- |
| `nothing to commit, working tree clean` | 수정 파일이 없음 | 바로 작업하거나 상태를 그대로 유지 |
| `Changes not staged for commit` | 수정했지만 커밋 후보로 선택하지 않음 | `git diff` 확인 후 `git add` |
| `Changes to be committed` | 다음 커밋에 들어갈 파일이 선택됨 | `git diff --staged` 후 커밋 |
| `ahead N` | 내 PC에만 커밋 N개가 있음 | 검토 후 `git push` |
| `behind N` | GitHub에만 새 커밋 N개가 있음 | 팀 기준을 확인한 뒤 최신 내용 반영 |
| `ahead N, behind M` | 양쪽 모두 새 커밋이 있음 | 바로 push하지 말고 충돌 가능성부터 확인 |
| `Your branch is up to date` | 내 브랜치와 GitHub가 같음 | 추가 동기화 불필요 |

## 브랜치 관리

| 상황 | 명령어 (Terminal) | 명령어 (대화) | 사용법 | 주의점 |
| --- | --- | --- | --- | --- |
| 새 브랜치 만들고 이동 | `git switch -c student/<이름>/<작업명>` | `새 작업 브랜치를 만들고 이동해줘.` | 작업 시작 전에 실행 | 팀 규칙의 브랜치 이름 형식을 따름 |
| 기존 브랜치로 이동 | `git switch <브랜치명>` | `현재 변경을 확인한 뒤 지정한 브랜치로 이동해줘.` | 이동 전 `git status` 확인 | 미커밋 변경이 있으면 이동이 막히거나 섞일 수 있음 |
| 원격 브랜치 받기 | `git switch --track origin/<브랜치명>` | `지정한 원격 브랜치를 내 PC에서 추적하도록 받아줘.` | 처음 받는 팀원 브랜치에 사용 | 다른 사람 브랜치는 수정 목적이 아니면 이동만 함 |
| 원격의 삭제된 브랜치 정리 | `git fetch --prune` | `삭제된 원격 브랜치 정보를 정리해줘.` | 목록이 오래됐을 때 실행 | 내 로컬 브랜치를 지우지는 않음 |
| 내 브랜치 삭제 | `git branch -d <브랜치명>` | `병합된 내 브랜치를 삭제해줘.` | PR 병합 후 정리 | 현재 브랜치는 삭제할 수 없음 |

## 커밋 관리

| 상황 | 명령어 (Terminal) | 명령어 (대화) | 사용법 | 주의점 |
| --- | --- | --- | --- | --- |
| 최근 커밋 보기 | `git log --oneline -10` | `최근 커밋을 쉬운 말로 정리해줘.` | 최근 이력 확인 | 긴 설명은 `git log -10` 사용 |
| 특정 커밋 내용 보기 | `git show <커밋ID>` | `지정한 커밋의 변경 내용을 보여주고 설명해줘.` | 커밋 ID 앞 몇 글자 사용 가능 | 다른 사람 커밋은 임의 수정하지 않음 |
| 마지막 커밋 메시지 수정 | `git commit --amend -m "새 메시지"` | `아직 Push하지 않은 마지막 커밋의 메시지를 바꿔줘.` | 아직 Push 전인 경우 | Push 후에는 팀원 이력과 충돌할 수 있어 주의 |
| 커밋에서 파일 빼기 | `git restore --staged <파일경로>` | `잘못 추가한 파일을 커밋 후보에서만 빼줘.` | `git add`를 잘못했을 때 | 파일 변경 자체는 유지됨 |
| 변경 취소 전 내용 확인 | `git diff` | `변경을 취소하기 전에 무엇이 바뀌었는지 확인해줘.` | 되돌리기 전 반드시 실행 | 취소는 데이터 손실 가능성이 있어 신중히 판단 |

## 원격 저장소와 동기화

| 상황 | 명령어 (Terminal) | 명령어 (대화) | 사용법 | 주의점 |
| --- | --- | --- | --- | --- |
| 연결된 GitHub 주소 확인 | `git remote -v` | `연결된 GitHub 주소를 확인해줘.` | fetch/push 주소 확인 | 모르는 주소면 Push하지 않음 |
| 원격 정보만 갱신 | `git fetch --prune` | `파일은 바꾸지 말고 GitHub 최신 정보만 받아줘.` | 안전한 최신 상태 확인 | 파일을 바꾸지 않음 |
| 현재 브랜치 업로드 | `git push` | `현재 브랜치를 GitHub에 업로드해줘.` | 원격 연결이 이미 있는 경우 | Push 전 `git status` 확인 |
| GitHub 변경 받기 | `git pull` | `내 브랜치에 GitHub 변경을 반영해줘.` | 내 브랜치에 원격 변경을 반영 | 미커밋 변경이 있으면 먼저 정리 |
| 내 브랜치와 원격 차이 보기 | `git log --oneline HEAD..@{upstream}` | `내 브랜치와 GitHub 원격 브랜치의 차이를 알려줘.` | 원격에만 있는 커밋 확인 | upstream 연결이 있어야 함 |
| 인증 상태 확인 | `gh auth status` | `GitHub CLI 로그인과 권한 상태를 확인해줘.` | GitHub CLI 사용 전 | 계정이나 권한 오류를 먼저 해결 |

## PR과 리뷰

| 상황 | 명령어 (Terminal) | 명령어 (대화) | 사용법 | 확인할 것 |
| --- | --- | --- | --- | --- |
| PR 목록 보기 | `gh pr list` | `열린 PR 목록을 확인해줘.` | 열린 PR 확인 | 내 PR인지, 대상 브랜치가 맞는지 |
| PR 생성 | `gh pr create --base main --head <브랜치명>` | `현재 작업 브랜치로 main 대상 PR을 만들어줘.` | 안내에 따라 제목·설명 작성 | `main`으로 병합하는 요청인지 |
| 제목·설명까지 한 번에 생성 | `gh pr create --base main --head <브랜치명> --title "제목" --body "변경 이유와 확인 내용"` | `제목과 변경 이유, 확인 내용을 포함해 PR을 만들어줘.` | 반복 입력을 줄일 때 | 제목은 결과, 본문은 이유와 검증 내용 |
| 임시 PR 생성 | `gh pr create --draft` | `아직 리뷰 전인 임시 PR을 만들어줘.` | 아직 리뷰 준비 전 | 준비되면 Ready for review로 전환 |
| 리뷰 요청 | GitHub PR 화면 또는 `gh pr edit --add-reviewer <아이디>` | `지정한 사람에게 PR 리뷰를 요청해줘.` | PR 생성 후 | 담당자와 팀을 정확히 선택 |
| PR 상세 보기 | `gh pr view` | `내 PR의 체크, 리뷰, 충돌 상태를 알려줘.` | 체크·리뷰·충돌 확인 | Checks와 Files changed를 우선 확인 |
| 병합 | GitHub PR 화면 | `PR이 병합 가능한지 확인해줘. 병합은 하지 마.` | 승인과 체크 통과 후 팀장이 진행 | 이 프로젝트의 `main` 병합은 팀장 최종 결정 |

## 안전 수칙

| 하지 말 것 | 이유 | 대신 할 일 |
| --- | --- | --- |
| `main`에서 바로 작업·커밋 | 배포 기준 브랜치가 흔들릴 수 있음 | 개인 작업 브랜치에서 작업 후 PR |
| 상태 확인 없이 `git add .` | 다른 파일까지 커밋될 수 있음 | `git status`와 `git diff`를 먼저 확인 |
| `.env` 파일 커밋 | 비밀값이 GitHub에 올라갈 수 있음 | `.env.example`에는 이름만 공유 |
| 원격에 Push한 커밋을 임의로 `--amend` 또는 강제 Push | 팀원 이력이 꼬일 수 있음 | 팀과 먼저 합의하고 안전한 방법 선택 |
| 충돌을 이해하지 못한 채 자동 선택 | 다른 팀원 작업을 잃을 수 있음 | 충돌 내용과 양쪽 변경을 확인 후 해결 |
| PR 확인 없이 병합 | 빌드·리뷰 문제를 놓칠 수 있음 | Checks, 리뷰, 충돌 여부 확인 |

## 커밋 메시지 예시

| 변경 종류 | 형식 | 예시 |
| --- | --- | --- |
| 기능 추가 | `feat: 무엇을 추가했는지` | `feat: 지원서 상태 필터 추가` |
| 버그 수정 | `fix: 무엇을 고쳤는지` | `fix: 메인 화면 문법 오류 수정` |
| 문서 수정 | `docs: 무엇을 정리했는지` | `docs: Git GitHub 매뉴얼 추가` |
| 코드 정리 | `refactor: 무엇을 정리했는지` | `refactor: 상태 계산 로직 정리` |
| 설정/기타 | `chore: 무엇을 변경했는지` | `chore: 빌드 안내 문구 수정` |

## 문제가 생겼을 때

| 문제 | 먼저 확인 | 권장 대응 |
| --- | --- | --- |
| Push가 거절됨 | `git status --short --branch` | `behind` 또는 `ahead/behind`인지 확인하고 최신 변경을 안전하게 반영 |
| PR을 만들 수 없음 | `gh auth status`, `git branch --show-current` | 로그인·권한·현재 브랜치가 `main`이 아닌지 확인 |
| 충돌 발생 | 충돌 난 파일과 `git status` | 양쪽 변경 의도를 확인한 뒤 해결하고 다시 검증 |
| 원치 않는 파일이 커밋 후보 | `git diff --staged` | `git restore --staged <파일경로>`로 후보에서만 제외 |
| 작업 내용이 사라진 것 같음 | `git status`, `git log --oneline` | 바로 추가 명령을 실행하지 말고 현재 상태부터 확인 |

## 공식 참고 자료

- [Git 공식 Cheat Sheet](https://git-scm.com/cheat-sheet.pdf)
- [GitHub Docs: Pull Request 개요](https://docs.github.com/en/pull-requests/get-started/about-pull-requests)
- [GitHub Docs: PR 생성](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request)
- [GitHub Docs: PR 협업](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- [GitHub Docs: 리뷰 요청](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/requesting-a-pull-request-review)

## 팀 기준 요약

| 항목 | 이 프로젝트 기준 |
| --- | --- |
| 작업 위치 | 개인 작업 브랜치 |
| 브랜치 이름 | `student/<이름>/<작업명>` |
| `main` | 배포 가능한 상태로 유지 |
| PR | `main` 병합 전 필수 |
| PR 작성 | 제목, 변경 요약, 확인 명령, 데이터 사전 변경 여부 포함 |
| 최종 병합 | 팀장이 결정 |
| 환경변수 | `.env`는 커밋하지 않음 |
