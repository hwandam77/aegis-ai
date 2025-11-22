# CLAUDE.md - Aegis AI 프로젝트 관리

Aegis AI 프로젝트의 Claude Code 작업 환경 설정 및 관리 가이드입니다.

## 목차
- [프로젝트 개요](#프로젝트-개요)
- [시스템 환경](#시스템-환경)
- [TDD 개발 원칙](#tdd-개발-원칙)
- [AI 팀 구조](#ai-팀-구조)
- [개발 워크플로우](#개발-워크플로우)
- [MCP 서버 관리](#mcp-서버-관리)
- [품질 관리](#품질-관리)

---

## 프로젝트 개요

### 기본 정보
- **프로젝트명**: Aegis AI
- **설명**: TDD 기반 Multi-AI MCP 서버
- **버전**: 0.1.0
- **라이센스**: MIT
- **저장소**: `/Users/hwandam/workspace/aegis-ai`

### 핵심 목표
- ✅ Test-Driven Development 방법론 완전 적용
- ✅ Codex, Qwen, Gemini 3개 AI 통합
- ✅ 70%+ 테스트 커버리지 달성
- ✅ 프로덕션 그레이드 코드 품질

---

## 시스템 환경

### 기술 스택
- **런타임**: Node.js >= 20.0.0
- **테스트**: Jest 30.2.0
- **프로토콜**: MCP (Model Context Protocol)
- **개발 언어**: JavaScript (CommonJS)

### 디렉토리 구조
```
aegis-ai/
├── src/
│   ├── core/           # 핵심 모듈 (80% 커버리지 목표)
│   ├── services/       # AI 서비스 레이어 (70% 커버리지)
│   ├── handlers/       # 요청 핸들러 (60% 커버리지)
│   └── utils/          # 유틸리티 함수
├── tests/
│   ├── core/           # 핵심 모듈 테스트
│   ├── services/       # 서비스 테스트
│   ├── handlers/       # 핸들러 테스트
│   ├── mcp/            # MCP 프로토콜 테스트
│   └── integration/    # 통합 테스트
├── docs/
│   └── TDD_업그레이드_계획/  # 6단계 TDD 로드맵
└── scripts/            # 빌드 및 자동화 스크립트
```

---

## TDD 개발 원칙

### TDD 3단계 사이클

```
🔴 RED (실패하는 테스트 작성)
   ↓
🟢 GREEN (최소 구현으로 테스트 통과)
   ↓
🔵 REFACTOR (코드 개선 및 최적화)
```

### 필수 정책

1. **테스트 우선 작성**
   - 모든 새 기능은 테스트부터 작성
   - 구현 전 실패하는 테스트 확인

2. **최소 구현**
   - 테스트를 통과시키는 최소한의 코드만 작성
   - 과도한 엔지니어링 금지

3. **지속적 리팩토링**
   - 테스트 통과 후 코드 품질 개선
   - 모든 테스트가 여전히 통과하는지 확인

4. **커버리지 목표**
   - `src/core/`: 80% 이상
   - `src/services/`: 70% 이상
   - `src/handlers/`: 60% 이상
   - **전체**: 70% 이상

---

## AI 팀 구조

### Claude Code (총괄 PM)

**역할**: 프로젝트 매니저 & 오케스트레이터

**책임**:
- 🎯 프로젝트 계획 및 마일스톤 관리
- 🤖 AI 팀 작업 할당 및 조율
- 📊 진행 상황 모니터링
- ✅ Phase별 품질 게이트 승인
- 📈 메트릭 관리 및 보고

**PM 명령어**:
```bash
Claude, status          # 전체 현황 보고
Claude, risk           # 리스크 분석
Claude, report         # 주간/월간 리포트
Claude, approve Phase N # Phase 승인
Claude, delegate [task] # AI 팀 작업 할당
```

---

### AI 삼위일체 워크플로우

```
      Claude Code (PM)
           │
           ├─> 1️⃣ Gemini (The Speculator)
           │      └─ BDD 명세 생성 (Given-When-Then)
           │      └─ Edge Case 식별
           │
           ├─> 2️⃣ Qwen (The Technician)
           │      └─ Jest 테스트 코드 자동 생성
           │      └─ Mocking 구현
           │
           └─> 3️⃣ Codex (The Refactorer)
                  └─ 코드 리뷰 및 최적화
                  └─ 리팩토링 제안
```

### 각 AI의 활용 시점

**Gemini 활용**:
- 새로운 기능 명세 작성 시
- BDD 시나리오 생성 필요 시
- 엣지 케이스 발견 필요 시

**Qwen 활용**:
- Jest 테스트 코드 생성 시
- Mocking 전략 구현 시
- 코드 생성 및 구조화 시

**Codex 활용**:
- 코드 리뷰 필요 시
- 리팩토링 제안 필요 시
- 최적화 및 패턴 개선 시

---

## 개발 워크플로우

### 새 기능 개발 프로세스

#### 1. 계획 단계
```bash
# PM이 작업 분석 및 AI 팀 할당
Claude, delegate "handlerLoader 테스트 작성" to AI team
```

#### 2. BDD 명세 생성 (Gemini)
```bash
# Gemini에게 기능 명세 요청
mcp__codex-qwen-gemini__gemini_cli
→ 자연어 요구사항 → BDD 명세 생성
```

#### 3. 테스트 코드 생성 (Qwen)
```bash
# BDD 명세 기반 Jest 테스트 생성
mcp__codex-qwen-gemini__qwen_cli
→ BDD 명세 입력 → Jest 테스트 코드 출력
```

#### 4. TDD 사이클 실행
```bash
# 🔴 RED: 테스트 실패 확인
npm test

# 🟢 GREEN: 최소 구현
[코드 작성]
npm test  # 통과 확인

# 🔵 REFACTOR: 코드 개선
[리팩토링]
npm test  # 여전히 통과하는지 확인
```

#### 5. 코드 리뷰 (Codex)
```bash
# Codex에게 리뷰 요청
mcp__codex-qwen-gemini__codex_cli
→ 리팩토링 제안 → 개선 적용
```

#### 6. PM 검증 및 승인
```bash
# 커버리지 확인
npm run test:coverage

# PM 최종 승인
Claude, approve Task X.Y
```

---

## MCP 서버 관리

### 사용 가능한 MCP 서버

프로젝트에서 활용할 주요 MCP 서버:

**1. codex-qwen-gemini MCP**
- **용도**: AI 삼위일체 워크플로우
- **도구**:
  - `gemini_cli`: BDD 명세 생성
  - `qwen_cli`: 테스트 코드 생성
  - `codex_cli`: 코드 리뷰

**2. sequential-thinking MCP**
- **용도**: 복잡한 문제 분석
- **활용**: 아키텍처 설계, 디버깅

**3. context7 MCP**
- **용도**: 라이브러리 문서 검색
- **활용**: Jest, MCP 프로토콜 참조

**4. playwright MCP**
- **용도**: E2E 테스트 (Phase 4+)
- **활용**: 브라우저 자동화 테스트

---

## 품질 관리

### 테스트 실행 명령어

```bash
# 기본 테스트 실행
npm test

# Watch 모드 (개발 중)
npm run test:watch

# 커버리지 리포트
npm run test:coverage

# Verbose 출력
npm run test:verbose
```

### 커버리지 검증

```bash
# 현재 커버리지 확인
npm run test:coverage

# 목표 확인
# - src/core/: 80% 이상
# - src/services/: 70% 이상
# - 전체: 70% 이상
```

### 품질 게이트

**코드 커밋 전 체크리스트**:
- [ ] 🔴 실패하는 테스트 작성
- [ ] 🟢 테스트 통과하는 구현
- [ ] 🔵 리팩토링 완료
- [ ] ✅ 모든 테스트 통과
- [ ] 📊 커버리지 목표 충족
- [ ] 👀 코드 리뷰 완료 (Codex)

---

## 6단계 TDD 로드맵

### Phase 1: 기반 구축 (Week 1-2) ✅
- [x] Jest 설치 및 설정
- [x] 프로젝트 구조 생성
- [x] Git 저장소 초기화
- [ ] CI/CD 파이프라인 통합

### Phase 2: 핵심 모듈 테스트 (Week 3-4)
- [ ] handlerLoader.js 테스트
- [ ] stageOrchestrator.js 테스트
- [ ] qualityPipeline.js 테스트
- [ ] stateManager.js 테스트
- [ ] workflowEngine.js 테스트

### Phase 3: 서비스 레이어 테스트 (Week 5-6)
- [ ] geminiService.js 테스트
- [ ] qwenService.js 테스트
- [ ] codexService.js 테스트
- [ ] Mocking 전략 구현

### Phase 4: MCP 프로토콜 테스트 (Week 7-8)
- [ ] Protocol harness 구현
- [ ] Mocked stdio 테스트
- [ ] Snapshot 테스트
- [ ] JSON-RPC 검증

### Phase 5: AI 기반 자동화 (Week 9+)
- [ ] generate-test 스크립트
- [ ] 커버리지 대시보드
- [ ] Git commit 훅
- [ ] VS Code 확장

### Phase 6: 지속적 개선 (Ongoing)
- [ ] 주간 커버리지 리포트
- [ ] TDD 워크숍
- [ ] 코드 리뷰 자동화
- [ ] 팀 채택률 추적

**상세 정보**: [TDD 계획 문서](./docs/TDD_업그레이드_계획/00_OVERVIEW.md)

---

## 참고 문서

### 프로젝트 문서
- **[README.md](./README.md)**: 프로젝트 소개
- **[TDD 계획](./docs/TDD_업그레이드_계획/00_OVERVIEW.md)**: 전체 로드맵
- **[CHECKLIST](./docs/TDD_업그레이드_계획/CHECKLIST.md)**: 실행 체크리스트
- **[METRICS](./docs/TDD_업그레이드_계획/METRICS.md)**: 측정 지표

### 외부 참고
- **Jest 문서**: https://jestjs.io/
- **MCP 프로토콜**: https://modelcontextprotocol.io/
- **TDD 가이드**: https://martinfowler.com/bliki/TestDrivenDevelopment.html

---

## 빠른 시작 가이드

### 새 세션 시작 시

```bash
# 1. 프로젝트 디렉토리로 이동
cd /Users/hwandam/workspace/aegis-ai

# 2. 현재 상태 확인
npm test
git status

# 3. PM 모드 활성화
Claude, status

# 4. 작업 시작
[TDD 사이클 실행]
```

### PM 대시보드 확인

```bash
Claude, status
```

예상 출력:
```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Claude Code PM Dashboard - Aegis AI                    │
├─────────────────────────────────────────────────────────────┤
│  📅 Project: aegis-ai                                       │
│  📊 Current Phase: Phase 1 (Infrastructure)                 │
│  🎯 Overall Progress: ████░░░░░░░░░░░░░░░░ 20%            │
├─────────────────────────────────────────────────────────────┤
│  📈 Key Metrics                                             │
│     Coverage     : 0%                                       │
│     Tests        : 0                                        │
│     TDD Adoption : 100% (모든 작업 TDD)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 트러블슈팅

### 테스트 실패 시
1. 에러 메시지 확인
2. TDD 사이클 확인 (RED → GREEN → REFACTOR)
3. Codex에게 디버깅 요청

### 커버리지 부족 시
1. 누락된 테스트 케이스 식별
2. Gemini에게 엣지 케이스 요청
3. Qwen에게 테스트 코드 생성 요청

### AI 팀 활용 문제 시
1. MCP 서버 연결 확인
2. 프롬프트 명확성 검토
3. PM에게 작업 재할당 요청

---

**마지막 업데이트**: 2025-11-22
**프로젝트 상태**: Phase 1 진행 중
**PM**: Claude Code (총괄 책임)
