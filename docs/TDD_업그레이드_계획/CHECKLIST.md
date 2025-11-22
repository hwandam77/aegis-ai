# TDD 통합 실행 체크리스트

## 📋 전체 진행 상황

```
                Claude Code (PM) 관리
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   계획 수립        진행 모니터링      품질 검증
        ↓                ↓                ↓

[ ] Phase 1: 기반 구축 (Week 1-2)          [PM 승인 대기]
[ ] Phase 2: 핵심 모듈 테스트 (Week 3-4)   [PM 승인 대기]
[ ] Phase 3: 서비스 레이어 테스트 (Week 5-6) [PM 승인 대기]
[ ] Phase 4: MCP 프로토콜 테스트 (Week 7-8)  [PM 승인 대기]
[ ] Phase 5: AI 기반 자동화 (Week 9+)       [PM 승인 대기]
[ ] Phase 6: 지속적 개선 (Ongoing)          [PM 지속 관리]
```

---

## 🎯 PM 승인 게이트

각 Phase는 Claude Code PM의 승인을 받아야 다음 단계로 진행할 수 있습니다.

### 승인 기준
- ✅ **기술적 완료**: 모든 Task 완료
- ✅ **품질 기준**: 커버리지 및 테스트 통과율 충족
- ✅ **문서화**: 완료 문서 및 리포트 작성
- ✅ **PM 검증**: 최종 품질 게이트 통과

---

## Phase 1: 기반 구축 ✅ (Week 1-2)

### 🎯 PM 체크포인트

```
[ ] PM 사전 승인: Phase 1 시작 승인
[ ] PM 중간 점검: Task 1.1-1.3 완료 시
[ ] PM 최종 승인: Phase 1 완료 검증
```

### Task 1.1: Jest 설치 및 설정
- [ ] npm install --save-dev jest @types/jest @jest/globals
- [ ] jest.config.js 생성
- [ ] package.json 테스트 스크립트 추가
- [ ] `npm test -- --version` 실행 확인
- [ ] **[PM 검증]** Jest 설정 동작 확인

### Task 1.2: 기존 테스트 Jest로 전환
- [ ] golden-spec-test.js → golden-spec.test.js
- [ ] quality-pipeline-test.js → quality-pipeline.test.js
- [ ] speckit-commands-test.js → speckit-commands.test.js
- [ ] 모든 기존 테스트 통과 확인

### Task 1.3: CI/CD 파이프라인 통합
- [ ] .github/workflows/test.yml 생성
- [ ] GitHub Actions 워크플로우 동작 확인
- [ ] 커버리지 리포트 Codecov 연동

### Task 1.4: TDD 정책 문서화
- [ ] CLAUDE.md에 TDD 섹션 추가
- [ ] TDD 원칙 및 정책 명시
- [ ] 팀 공유 및 리뷰

### Task 1.5: .gitignore 업데이트
- [ ] coverage/ 추가
- [ ] .nyc_output/ 추가
- [ ] jest-results.json 추가

### 검증
- [ ] `npm test` 실행 시 모든 테스트 통과
- [ ] `npm run test:coverage` 커버리지 리포트 생성
- [ ] CI에서 테스트 자동 실행 확인

---

## Phase 2: 핵심 모듈 테스트 🚀 (Week 3-4)

### Priority 1: handlerLoader.js
- [ ] tests/core/handlerLoader.test.js 생성
- [ ] loadHandlers 테스트 (5+ 케이스)
- [ ] registerHandler 테스트 (5+ 케이스)
- [ ] getHandler 테스트 (3+ 케이스)
- [ ] Edge case 테스트
- [ ] 커버리지 90% 이상

### Priority 2: stageOrchestrator.js
- [ ] tests/core/stageOrchestrator.test.js 생성
- [ ] initialize 테스트
- [ ] transition 테스트 (8+ 케이스)
- [ ] getStageHistory 테스트
- [ ] 커버리지 85% 이상

### Priority 3: qualityPipeline.js
- [ ] tests/core/qualityPipeline.test.js 생성
- [ ] execute 테스트 (6+ 케이스)
- [ ] addGate 테스트
- [ ] validateGates 테스트
- [ ] 커버리지 85% 이상

### Priority 4: stateManager.js
- [ ] tests/core/stateManager.test.js 생성
- [ ] setState 테스트
- [ ] snapshot 테스트
- [ ] restore 테스트
- [ ] 커버리지 80% 이상

### Priority 5: workflowEngine.js
- [ ] tests/core/workflowEngine.test.js 생성
- [ ] execute 테스트
- [ ] rollback 테스트
- [ ] 커버리지 80% 이상

### 검증
- [ ] core/ 전체 커버리지 80% 이상
- [ ] 모든 테스트 통과
- [ ] 리팩토링 완료

---

## Phase 3: 서비스 레이어 테스트 🎭 (Week 5-6)

### Priority 1: geminiService.js
- [ ] tests/services/geminiService.test.js 생성
- [ ] child_process Mock 설정
- [ ] execute 테스트 (10+ 케이스)
- [ ] retry logic 테스트 (5+ 케이스)
- [ ] parameter validation 테스트
- [ ] 커버리지 75% 이상

### Priority 2: qwenService.js
- [ ] tests/services/qwenService.test.js 생성
- [ ] code generation 테스트
- [ ] code review 테스트
- [ ] session management 테스트
- [ ] 커버리지 75% 이상

### Priority 3: codexService.js
- [ ] tests/services/codexService.test.js 생성
- [ ] execute 테스트 (YOLO flag 포함)
- [ ] session chat 테스트
- [ ] model selection 테스트
- [ ] 커버리지 75% 이상

### 통합 테스트
- [ ] tests/services/integration.test.js 생성
- [ ] Schema consistency 테스트
- [ ] Error handling consistency 테스트

### 검증
- [ ] services/ 전체 커버리지 70% 이상
- [ ] 모든 Mocking 전략 검증
- [ ] 통합 테스트 통과

---

## Phase 4: MCP 프로토콜 테스트 📡 (Week 7-8)

### Task 4.1: Protocol Harness
- [ ] tests/mcp/protocol-harness/ 생성
- [ ] mock-transport.js 구현
- [ ] harness.test.js 작성
- [ ] tools/list 테스트
- [ ] tools/call 테스트
- [ ] JSON-RPC error codes 테스트

### Task 4.2: Mocked stdio
- [ ] tests/mcp/mocked-stdio/ 생성
- [ ] mock-stdio.js 구현
- [ ] stdio.test.js 작성
- [ ] stdio communication 테스트

### Task 4.3: Snapshot 테스트
- [ ] tests/mcp/snapshot-tests/ 생성
- [ ] protocol-snapshots.test.js 작성
- [ ] 응답 스냅샷 검증

### Task 4.4: E2E 통합 테스트
- [ ] tests/mcp/integration/ 생성
- [ ] full-protocol.test.js 작성
- [ ] 실제 프로세스 E2E 테스트

### 검증
- [ ] MCP 프로토콜 100% 커버리지
- [ ] 모든 JSON-RPC 에러 코드 검증
- [ ] E2E 테스트 통과

---

## Phase 5: AI 기반 자동화 🤖 (Week 9+)

### Task 5.1: generate-test 스크립트
- [ ] scripts/generate-test.js 생성
- [ ] inquirer 패키지 설치
- [ ] Gemini BDD 명세 생성 연동
- [ ] Qwen Jest 코드 생성 연동
- [ ] 파일 자동 저장 기능
- [ ] package.json 스크립트 추가

### Task 5.2: 게임화 대시보드
- [ ] scripts/coverage-dashboard.js 생성
- [ ] chalk 패키지 설치
- [ ] 커버리지 시각화
- [ ] 레벨 시스템 구현
- [ ] 목표 진행률 표시

### Task 5.3: Git Commit Hook
- [ ] scripts/pre-commit-hook.js 생성
- [ ] Husky 설치 및 설정
- [ ] Gemini 커밋 메시지 생성 연동
- [ ] .husky/pre-commit 훅 설정

### Task 5.4: VS Code 확장 아이디어
- [ ] 확장 기능 명세 작성
- [ ] Quick Fix 제안
- [ ] 실시간 커버리지 표시 설계

### 검증
- [ ] generate-test 명령어 동작
- [ ] dashboard 명령어 동작
- [ ] Git hook 동작 확인

---

## Phase 6: 지속적 개선 🔄 (Ongoing)

### 정책 수립
- [ ] PR 템플릿 생성 (.github/pull_request_template.md)
- [ ] 코드 리뷰 가이드라인 작성
- [ ] 버그 수정 프로세스 정의

### 주간 리포트
- [ ] scripts/weekly-report.js 생성
- [ ] GitHub Actions 스케줄러 설정
- [ ] Slack 알림 연동

### 교육 자료
- [ ] TDD 온보딩 체크리스트 작성
- [ ] docs/TDD_WORKSHOP.md 생성
- [ ] 실습 자료 준비

### 모니터링
- [ ] 품질 지표 대시보드 설정
- [ ] 자동 알림 설정
- [ ] 월간 리뷰 미팅 일정

### 검증
- [ ] 모든 PR에 테스트 포함 (100%)
- [ ] TDD 사이클 준수율 80% 이상
- [ ] 전체 커버리지 80% 이상 유지

---

## 🎯 마일스톤

### Milestone 1: 기반 완성 (Week 2)
- [x] Jest 설정 완료
- [x] 기존 테스트 전환
- [x] CI/CD 통합

### Milestone 2: 핵심 안정화 (Week 4)
- [ ] core/ 80% 커버리지
- [ ] 핵심 모듈 테스트 완료

### Milestone 3: 서비스 검증 (Week 6)
- [ ] services/ 70% 커버리지
- [ ] Mocking 전략 확립

### Milestone 4: 프로토콜 완성 (Week 8)
- [ ] MCP 프로토콜 100% 검증
- [ ] E2E 테스트 완료

### Milestone 5: 자동화 구현 (Week 10)
- [ ] AI 자동화 도구 완성
- [ ] 게임화 시스템 가동

### Milestone 6: 문화 정착 (Ongoing)
- [ ] TDD가 기본 워크플로우
- [ ] 품질 지표 지속 개선

---

## 📊 현재 진행 상황

### 완료된 항목: 0 / 100+
### 전체 진행률: 0%

```
Phase 1: [░░░░░░░░░░] 0%
Phase 2: [░░░░░░░░░░] 0%
Phase 3: [░░░░░░░░░░] 0%
Phase 4: [░░░░░░░░░░] 0%
Phase 5: [░░░░░░░░░░] 0%
Phase 6: [░░░░░░░░░░] 0%
```

---

## 🚀 다음 작업

1. **즉시 시작**: Phase 1 - Jest 설정
2. **준비 사항**: Node.js 20+, npm 설치 확인
3. **예상 시간**: 1-2주

---

**마지막 업데이트**: 2025-11-22
**책임자**: TDD Champion
**검토 주기**: 주간
