<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 개발했슈(notion-gaebalhaetsyu) 에이전트 작업 가이드

## Git 작업 및 자동 커밋/푸시 규칙 (필수 준수)

1. **자동 커밋 및 푸시 의무 (Mandatory Auto Commit & Push)**
   - 사용자의 요청에 따른 코드 수정, 기능 구현, 버그 수정, 스타일 개선 등의 작업을 완료하고 검증(빌드/타입체크/브라우저 테스트 등)을 마친 후에는 **반드시 변경사항을 스테이징(git add), 커밋(git commit), 원격 저장소 푸시(git push origin main)까지 자동으로 완료**해야 합니다.
   - 사용자가 매번 "커밋해주세요", "푸시해주세요"라고 요청하지 않아도 작업 완료 시점에 항상 커밋과 푸시가 반영되어 있어야 합니다.

2. **커밋 메시지 규칙 (Conventional Commits)**
   - 커밋 메시지는 변경 성격에 맞는 직관적이고 명확한 접두사를 사용합니다:
     - `feat: ...` (새로운 기능 구현)
     - `fix: ...` (버그 및 레이아웃/UI 오류 수정)
     - `style: ...` (디자인, 여백, 색상 등 스타일 조정)
     - `refactor: ...` (기능 변화 없는 코드 구조 개선)
     - `chore: ...` (빌드, 환경설정, 종속성, 에이전트 룰 수정 등)
   - 커밋 내용은 어떤 변경이 왜 일어났는지 한국어로 명확히 작성합니다.

3. **작업 완료 후 결과 보고**
   - 모든 커밋과 푸시가 정상적으로 완료된 후 사용자에게 변경 내역과 함께 커밋 해시/메시지 및 푸시 완료 상태를 안내합니다.
