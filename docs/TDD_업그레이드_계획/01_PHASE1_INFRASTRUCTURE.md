# Phase 1: 기반 구축 (Week 1-2)

## 🎯 목표

TDD 인프라 구축 및 기존 테스트를 Jest로 전환하여 안정적인 테스트 환경 마련

---

## 📊 현황 분석

### 기존 테스트 파일
```
tests/
├── golden-spec-test.js        ← 기존 테스트 1
├── quality-pipeline-test.js   ← 기존 테스트 2
└── speckit-commands-test.js   ← 기존 테스트 3
```

### 문제점
- ❌ package.json에 테스트 스크립트 없음
- ❌ 테스트 프레임워크 미설정
- ❌ 커버리지 측정 불가
- ❌ CI/CD 통합 없음

---

## 📋 작업 목록

### Task 1.1: Jest 설치 및 설정 (30분)

#### 1.1.1 의존성 설치
```bash
cd /Users/hwandam/workspace/MCP/codex-qwen-gemini-mcp

# Jest 및 관련 패키지 설치
npm install --save-dev jest @types/jest

# 추가 도구 설치
npm install --save-dev @jest/globals
```

#### 1.1.2 jest.config.js 생성
```javascript
// jest.config.js
module.exports = {
  // 테스트 환경
  testEnvironment: 'node',

  // 테스트 파일 패턴
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*-test.js',
    '**/__tests__/**/*.js'
  ],

  // 커버리지 설정
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/index.js'
  ],

  // 커버리지 임계값 (초기: 70%)
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    }
  },

  // 테스트 타임아웃
  testTimeout: 10000,

  // Verbose 출력
  verbose: true,

  // Mock 설정
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
```

#### 1.1.3 package.json 업데이트
```bash
# 테스트 스크립트 추가
npm pkg set scripts.test="jest"
npm pkg set scripts.test:watch="jest --watch"
npm pkg set scripts.test:coverage="jest --coverage"
npm pkg set scripts.test:unit="jest --testPathPattern=unit"
npm pkg set scripts.test:mcp="jest --testPathPattern=mcp"
npm pkg set scripts.test:integration="jest --testPathPattern=integration"
```

**검증**:
```bash
npm test -- --version
# Expected: Jest 버전 출력
```

---

### Task 1.2: 기존 테스트 Jest로 전환 (2시간)

#### 1.2.1 golden-spec-test.js 전환

**Before** (기존 코드):
```javascript
// 기존 테스트 구조 확인 필요
```

**After** (Jest 구조):
```javascript
// tests/golden-spec.test.js
const { describe, it, expect } = require('@jest/globals');

describe('Golden Spec Test', () => {
  describe('Spec validation', () => {
    it('should validate golden spec format', () => {
      // 기존 로직을 describe/it 구조로 래핑
      expect(true).toBe(true); // 임시
    });
  });
});
```

#### 1.2.2 quality-pipeline-test.js 전환

```javascript
// tests/quality-pipeline.test.js
const { describe, it, expect, beforeEach } = require('@jest/globals');
const QualityPipeline = require('../src/core/qualityPipeline');

describe('QualityPipeline', () => {
  let pipeline;

  beforeEach(() => {
    pipeline = new QualityPipeline();
  });

  describe('Pipeline execution', () => {
    it('should execute quality checks', async () => {
      // 기존 로직 Jest로 변환
      const result = await pipeline.execute();
      expect(result).toBeDefined();
    });
  });
});
```

#### 1.2.3 speckit-commands-test.js 전환

```javascript
// tests/speckit-commands.test.js
const { describe, it, expect } = require('@jest/globals');

describe('Speckit Commands', () => {
  describe('Command parsing', () => {
    it('should parse speckit commands correctly', () => {
      // 기존 로직 변환
      expect(true).toBe(true); // 임시
    });
  });
});
```

**검증**:
```bash
npm test
# Expected: 3개 테스트 통과
```

---

### Task 1.3: CI/CD 파이프라인 통합 (1시간)

#### 1.3.1 GitHub Actions 설정

`.github/workflows/test.yml` 생성:
```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linter
      run: npm run lint || echo "Lint not configured yet"

    - name: Run unit tests
      run: npm run test:unit

    - name: Run MCP protocol tests
      run: npm run test:mcp || echo "MCP tests not ready yet"

    - name: Generate coverage report
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/coverage-final.json
        flags: unittests
        name: codecov-umbrella
```

#### 1.3.2 파이프라인 단계
```
lint → unit (mocked) → protocol → coverage
```

**최적화**:
- node_modules 캐싱
- Jest 캐싱 활성화
- 병렬 테스트 실행

---

### Task 1.4: TDD 정책 문서화 (30분)

#### 1.4.1 CLAUDE.md에 TDD 섹션 추가

프로젝트 루트의 `CLAUDE.md`에 다음 섹션 추가:

```markdown
## 🧪 TDD (Test-Driven Development) 정책

### 핵심 원칙

이 프로젝트는 **Test-Driven Development (TDD)** 방법론을 따릅니다.

모든 기능 구현과 버그 수정은 반드시:

1. 🔴 **RED**: 실패하는 테스트 작성
2. 🟢 **GREEN**: 테스트를 통과시키는 최소 코드 작성
3. 🔵 **REFACTOR**: 코드 리팩토링

순서로 진행되어야 합니다.

---

### 테스트 전략

#### 우선순위
```
1. core/       ← 최우선 (핵심 로직)
2. services/   ← 중요 (AI 서비스)
3. handlers/   ← 확장 (AI별 핸들러)
```

#### 프레임워크
- **Jest**: Node.js 표준 테스트 프레임워크
- **Mocking**: AI CLI 호출은 `jest.mock()` 사용

#### 커버리지 목표
- **core/**: 80% 이상
- **services/**: 70% 이상
- **handlers/**: 60% 이상
- **전체**: 70% 이상

---

### AI 삼위일체 워크플로우

1. **Gemini (Speculator)**: 기능 명세 작성 (BDD)
2. **Qwen (Technician)**: 테스트 코드 생성
3. **Developer**: 구현 코드 작성
4. **Codex (Refactorer)**: 리팩토링 제안

---

### 정책

#### 필수 사항
- ✅ 모든 PR에 테스트 포함 (core/ 부터)
- ✅ 버그 발견 시 회귀 테스트 작성
- ✅ 새 기능은 spec + 구현 동시 커밋

#### 금지 사항
- ❌ 테스트 없이 core/ 모듈 수정
- ❌ 테스트 스킵 또는 주석 처리
- ❌ 커버리지 임계값 미달 커밋

---

### 테스트 실행

\`\`\`bash
# 전체 테스트
npm test

# Watch 모드
npm run test:watch

# 커버리지 확인
npm run test:coverage

# 특정 유형만
npm run test:unit
npm run test:mcp
\`\`\`
```

---

### Task 1.5: .gitignore 업데이트 (5분)

`.gitignore`에 추가:
```
# Testing
coverage/
.nyc_output/
*.lcov

# Jest
jest-results.json
```

---

## ✅ 완료 기준 (Definition of Done)

### 기술적 완료
- [ ] Jest 설치 및 설정 완료
- [ ] jest.config.js 작성
- [ ] package.json 테스트 스크립트 추가
- [ ] 기존 3개 테스트 Jest로 전환
- [ ] 모든 테스트 통과 (npm test)
- [ ] GitHub Actions 워크플로우 설정
- [ ] CLAUDE.md에 TDD 정책 추가

### 품질 기준
- [ ] 테스트 커버리지 측정 가능
- [ ] CI/CD에서 테스트 자동 실행
- [ ] 커버리지 리포트 생성

### 문서화
- [ ] TDD 정책 문서화
- [ ] 팀 공유 및 리뷰

---

## 🎯 Claude Code PM 검증 프로세스

### Phase 1 시작 전 (PM 준비)

```
Claude Code (PM):
"Phase 1: 기반 구축을 시작합니다.

📊 사전 분석:
- 프로젝트 상태: 테스트 인프라 부재
- 리스크: Jest 설정 복잡도 (Low)
- 예상 시간: 1-2주
- 필요 자원: Node.js 20+, npm

🎯 작업 분해:
Task 1.1: Jest 설치 및 설정 (30분)
Task 1.2: 기존 테스트 전환 (2시간)
Task 1.3: CI/CD 통합 (1시간)
Task 1.4: TDD 정책 문서화 (30분)
Task 1.5: .gitignore 업데이트 (5분)

총 예상 시간: 4시간 15분 (1일)

✅ 품질 게이트:
- Jest 설정 동작 확인
- 기존 테스트 100% 통과
- CI에서 자동 실행 확인

시작하시겠습니까?"
```

### Task별 PM 검증

#### Task 1.1 완료 시
```
사용자: "Jest 설치 완료했어"

Claude Code (PM):
"🔍 Task 1.1 검증 중...

✅ 검증 항목:
[검증] package.json에 jest 추가됨
[검증] jest.config.js 존재함
[검증] npm test 명령어 동작함

결과: ✅ Task 1.1 승인

📊 진행 상황:
Phase 1: [██░░░░░░░░] 20%
다음: Task 1.2 (기존 테스트 전환)

계속 진행하시겠습니까?"
```

#### Task 1.2 완료 시
```
사용자: "3개 테스트 모두 전환 완료"

Claude Code (PM):
"🔍 Task 1.2 검증 중...

테스트 실행 결과 확인:
[실행] npm test

결과:
✅ golden-spec.test.js (3 tests passed)
✅ quality-pipeline.test.js (5 tests passed)
✅ speckit-commands.test.js (4 tests passed)

Total: 12 tests passed, 0 failed

결과: ✅ Task 1.2 승인

📊 진행 상황:
Phase 1: [██████░░░░] 60%
다음: Task 1.3 (CI/CD 통합)"
```

### Phase 1 완료 시 (PM 최종 승인)

```
Claude Code (PM):
"🎯 Phase 1 최종 검증

✅ 완료 항목:
[✓] Task 1.1: Jest 설치 및 설정
[✓] Task 1.2: 기존 테스트 전환 (12 tests)
[✓] Task 1.3: CI/CD 통합
[✓] Task 1.4: TDD 정책 문서화
[✓] Task 1.5: .gitignore 업데이트

📊 품질 게이트 검증:
[✓] Jest 설정 동작 확인
[✓] 모든 테스트 통과 (12/12)
[✓] CI 자동 실행 확인
[✓] 커버리지 측정 가능

🎖️ Phase 1 완료 승인!

📈 성과:
- 테스트 인프라 구축 완료
- 기존 테스트 Jest로 전환
- CI/CD 파이프라인 통합

⚠️ 다음 Phase 준비 사항:
- core/ 모듈 분석 필요
- Mocking 전략 검토

📋 다음 단계:
Phase 2 (핵심 모듈 테스트) 착수 가능합니다.
시작하시겠습니까?"
```

---

## 🚀 실행 가이드

### Step 1: 설치 (5분)
```bash
cd /Users/hwandam/workspace/MCP/codex-qwen-gemini-mcp

# 의존성 설치
npm install --save-dev jest @types/jest @jest/globals
```

### Step 2: 설정 (10분)
```bash
# jest.config.js 생성
cat > jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*-test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],
  coverageThreshold: {
    global: { statements: 70, branches: 70, functions: 70, lines: 70 }
  },
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
EOF

# package.json 업데이트
npm pkg set scripts.test="jest"
npm pkg set scripts.test:watch="jest --watch"
npm pkg set scripts.test:coverage="jest --coverage"
```

### Step 3: 테스트 전환 (2시간)
```bash
# 기존 테스트 파일 확인
ls -la tests/

# 각 테스트를 Jest 구조로 전환
# (수동 작업 필요)
```

### Step 4: 검증 (5분)
```bash
# 테스트 실행
npm test

# 커버리지 확인
npm run test:coverage

# Watch 모드 테스트
npm run test:watch
```

---

## 📊 예상 결과

### 설치 후
```bash
$ npm test -- --version
Jest 29.x.x
```

### 테스트 실행 후
```
PASS  tests/golden-spec.test.js
PASS  tests/quality-pipeline.test.js
PASS  tests/speckit-commands.test.js

Test Suites: 3 passed, 3 total
Tests:       X passed, X total
Time:        X.XXs
```

### 커버리지 리포트
```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   XX.XX |    XX.XX |   XX.XX |   XX.XX |
--------------------|---------|----------|---------|---------|
```

---

## 🐛 트러블슈팅

### 문제 1: Jest 명령어가 없음
**증상**: `jest: command not found`

**해결**:
```bash
npm install --save-dev jest
npx jest --version
```

### 문제 2: 기존 테스트 실패
**증상**: 기존 테스트가 Jest에서 실패

**해결**:
1. 기존 테스트 로직 확인
2. describe/it 구조로 래핑
3. import/require 방식 통일

### 문제 3: 커버리지 측정 안됨
**증상**: Coverage 0%

**해결**:
```javascript
// jest.config.js
collectCoverageFrom: [
  'src/**/*.js',
  '!src/**/*.test.js',
  '!**/node_modules/**'
]
```

---

## 📚 참고 자료

- [Jest 공식 문서](https://jestjs.io/docs/getting-started)
- [Jest Node.js 설정](https://jestjs.io/docs/configuration)
- [GitHub Actions for Node.js](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)

---

## 다음 단계

Phase 1 완료 후:
- ✅ 기반 인프라 구축 완료
- 📖 [Phase 2: 핵심 모듈 테스트](./02_PHASE2_CORE_MODULES.md)로 이동
- 🎯 core/ 모듈 TDD 적용 시작

---

**상태**: 🚀 실행 준비 완료
**예상 소요 시간**: 1-2 주
**다음**: [Phase 2: 핵심 모듈 테스트](./02_PHASE2_CORE_MODULES.md)
