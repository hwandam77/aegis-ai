# Aegis AI → Claude Code Skills 전환 제안

**작성일**: 2025-11-22

---

## 🎯 제안 개요

Aegis AI의 TDD 워크플로우를 **Claude Code Skills**로 제작하여 모든 프로젝트에서 쉽게 사용할 수 있도록 합니다.

---

## 📋 Skills 구조 제안

### Option A: 단일 통합 Skill (권장)

**Skill 이름**: `aegis-tdd`

```
~/.claude/skills/aegis-tdd/
├── SKILL.md                    # 메인 스킬 정의
├── templates/
│   ├── test-template.js        # Jest 테스트 템플릿
│   ├── service-template.js     # Service 템플릿
│   └── core-template.js        # Core 모듈 템플릿
├── workflows/
│   ├── red-green-refactor.md   # TDD 사이클 가이드
│   └── ai-trinity.md           # AI 협업 워크플로우
└── examples/
    └── real-examples.md        # 실제 사용 예시
```

---

### Option B: 모듈형 Multiple Skills

**3개의 독립 Skills**:

1. **aegis-tdd-workflow** - TDD 사이클 가이드
2. **aegis-test-generator** - 테스트 자동 생성
3. **aegis-coverage-dashboard** - 커버리지 시각화

---

## 📝 SKILL.md 예시

### aegis-tdd/SKILL.md

```markdown
---
name: aegis-tdd
description: Test-Driven Development workflow with AI Trinity (Gemini, Qwen, Codex) for creating high-quality tested code. Use when user wants to implement TDD, generate tests, or achieve high test coverage.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Aegis TDD - AI-Powered Test-Driven Development

## Purpose

Help developers implement Test-Driven Development (TDD) with AI assistance, achieving 95%+ test coverage.

## When to Use

Activate this skill when:
- User mentions "TDD", "test-driven", "write tests"
- User wants to generate tests
- User asks about test coverage
- User is implementing a new feature and wants quality assurance
- User mentions "Gemini", "Qwen", or "Codex" for testing

## TDD Workflow (RED-GREEN-REFACTOR)

### Step 1: 🔴 RED - Write Failing Test

1. Ask user about the module/feature to test
2. Create test file: `tests/<category>/<moduleName>.test.js`
3. Generate test using this template:

\`\`\`javascript
const { ModuleName } = require('../../src/<category>/<moduleName>');

describe('ModuleName', () => {
  let instance;

  beforeEach(() => {
    instance = new ModuleName();
  });

  describe('Core functionality', () => {
    test('should perform main operation', () => {
      // Given
      const input = 'test';

      // When
      const result = instance.execute(input);

      // Then
      expect(result).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    test('should handle invalid input', () => {
      expect(() => instance.execute(null))
        .toThrow('Invalid input');
    });
  });
});
\`\`\`

4. Run test to confirm RED:
\`\`\`bash
npm test
\`\`\`

### Step 2: 🟢 GREEN - Minimal Implementation

1. Create source file with minimal code to pass tests
2. Run tests to confirm GREEN
3. Verify coverage

### Step 3: 🔵 REFACTOR - Improve Quality

1. Improve code quality
2. Add JSDoc comments
3. Verify tests still pass
4. Check coverage: target 95%+

## AI Trinity Workflow

### Use Gemini for BDD Specification

Ask Gemini to create Given-When-Then scenarios:
- Main functionality scenarios
- Error handling scenarios
- Edge cases

### Use Qwen for Test Code Generation

Ask Qwen to generate Jest test code from BDD specs:
- Full test file with describe/test blocks
- Mocking strategies
- Assertions

### Use Codex for Code Review

Ask Codex to review implementation:
- Code quality
- Performance
- Security
- Refactoring suggestions

## Coverage Targets

- Core modules: 80%+
- Services: 70%+
- Overall: 70%+
- Perfect modules: 100% 🏆

## Templates

### Service Template (with Mocking)

\`\`\`javascript
const { spawn } = require('child_process');
jest.mock('child_process');

describe('ServiceName', () => {
  let service;
  let mockProcess;

  beforeEach(() => {
    service = new ServiceName();
    mockProcess = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn(),
      kill: jest.fn(),
    };
    spawn.mockReturnValue(mockProcess);
  });

  test('should execute CLI successfully', async () => {
    mockProcess.stdout.on.mockImplementation((event, callback) => {
      if (event === 'data') callback('response');
    });
    mockProcess.on.mockImplementation((event, callback) => {
      if (event === 'close') callback(0);
    });

    const result = await service.execute('prompt');
    expect(result).toContain('response');
  });
});
\`\`\`

## Quality Checklist

Before completing:
- [ ] All tests pass (100%)
- [ ] Coverage meets target
- [ ] JSDoc comments added
- [ ] Edge cases covered
- [ ] No console.log left behind

## Success Metrics

- Tests: 10+ per module
- Coverage: 95%+
- Pass rate: 100%
- Level: LEGENDARY 👑

## Examples

See: https://github.com/hwandam77/aegis-ai
- 99.33% coverage achieved
- 105 tests (100% pass rate)
- 7 modules with 100% coverage

---

**Built with Test-Driven Development by AI Trinity**
```

---

## 🎯 전역 vs 프로젝트 등록 제안

### Option 1: 전역 등록 (권장) 👍

**위치**: `~/.claude/skills/aegis-tdd/`

**장점**:
- ✅ 모든 프로젝트에서 사용 가능
- ✅ 한 번 설정으로 영구 사용
- ✅ 개인 워크플로우 최적화
- ✅ 실험 및 개선 자유

**단점**:
- ❌ 팀원과 공유 어려움
- ❌ 프로젝트별 커스터마이징 불가

**추천 대상**:
- 개인 개발자
- 다양한 프로젝트 작업
- TDD 개인 학습

---

### Option 2: 프로젝트 등록

**위치**: `.claude/skills/aegis-tdd/`

**장점**:
- ✅ 팀 전체 공유 (Git 커밋)
- ✅ 프로젝트 특화 워크플로우
- ✅ 버전 관리 가능
- ✅ 자동 배포 (git pull)

**단점**:
- ❌ 프로젝트마다 설정 필요
- ❌ 다른 프로젝트에서 사용 불가

**추천 대상**:
- 팀 프로젝트
- 특정 프로젝트 전용 워크플로우
- 팀 표준 확립

---

### Option 3: 하이브리드 (최선) 🏆

**전략**:
1. **전역**: 기본 TDD 워크플로우
   ```
   ~/.claude/skills/aegis-tdd/
   ```

2. **프로젝트**: 프로젝트 특화 확장
   ```
   .claude/skills/aegis-tdd-extensions/
   ```

**이점**:
- ✅ 전역: 범용 TDD 워크플로우
- ✅ 프로젝트: 팀 특화 규칙
- ✅ 최고의 유연성

---

## 🚀 구현 계획

### Phase 1: 기본 Skill 제작

**파일 구조**:
```
~/.claude/skills/aegis-tdd/
├── SKILL.md                 # 메인 정의
├── templates/
│   ├── core-module.js       # Core 모듈 템플릿
│   ├── service.js           # Service 템플릿
│   └── mcp-handler.js       # MCP 핸들러 템플릿
├── guides/
│   ├── tdd-cycle.md         # RED-GREEN-REFACTOR
│   ├── mocking-guide.md     # Mocking 전략
│   └── coverage-targets.md  # 커버리지 목표
└── examples/
    ├── handlerLoader.md     # 실제 예시
    └── geminiService.md     # Mocking 예시
```

### Phase 2: 템플릿 최적화

Aegis AI의 실제 코드를 템플릿으로:
- handlerLoader 패턴
- Service mocking 패턴
- MCP protocol 패턴

### Phase 3: AI 통합

SKILL.md에 AI 활용 가이드 포함:
- Gemini: BDD 명세 생성 프롬프트
- Qwen: Jest 코드 생성 프롬프트
- Codex: 리뷰 요청 프롬프트

---

## 💡 MCP 연동 방안

### 문제: Skills는 MCP 직접 지원 안함

**해결책 1: Bash 도구 사용**

SKILL.md에서:
```markdown
## Generate Test with AI

\`\`\`bash
# Use Gemini via MCP
mcp__codex-qwen-gemini__gemini_cli --prompt "Generate BDD spec"

# Use Qwen via MCP
mcp__codex-qwen-gemini__qwen_cli --prompt "Generate Jest test"
\`\`\`
```

**해결책 2: Wrapper 스크립트**

```javascript
// scripts/ai-trinity.js
const { exec } = require('child_process');

async function generateTest(moduleName) {
  // MCP 도구 호출
  const geminiResult = await callMCP('gemini_cli', { prompt: '...' });
  const qwenResult = await callMCP('qwen_cli', { prompt: '...' });
  // ...
}
```

**해결책 3: Skill이 직접 프롬프트 제공**

MCP 호출 대신, Skill이 "이렇게 물어봐"라는 프롬프트 제공:
```markdown
## AI Trinity Prompts

Ask Gemini:
> "Create Given-When-Then scenarios for a module that handles X"

Ask Qwen:
> "Generate Jest tests from these BDD scenarios: [paste scenarios]"
```

---

## 🎯 최종 제안

### 권장 방식: 하이브리드 + Wrapper

**1. 전역 Skill**: 범용 TDD 워크플로우
```
~/.claude/skills/aegis-tdd/
└── SKILL.md  # 기본 TDD 가이드
```

**2. Aegis AI 프로젝트**: Skills 예시로 활용
```
aegis-ai/.claude/skills/aegis-tdd-example/
└── SKILL.md  # 프로젝트 특화 예시
```

**3. Wrapper 스크립트**: MCP 연동
```
aegis-ai/scripts/ai-trinity.js
→ SKILL.md에서 "node scripts/ai-trinity.js" 호출
```

---

## 📋 구현 체크리스트

### 전역 Skill 생성

- [ ] `~/.claude/skills/aegis-tdd/` 디렉토리 생성
- [ ] `SKILL.md` 작성 (YAML + 워크플로우)
- [ ] 템플릿 파일 추가
- [ ] 가이드 문서 추가
- [ ] Claude Code 재시작
- [ ] 테스트: "Create a TDD test for myModule" 요청

### 프로젝트 Skill 생성

- [ ] `.claude/skills/aegis-tdd-project/` 생성
- [ ] 프로젝트 특화 템플릿
- [ ] Git에 커밋
- [ ] 팀원과 공유

### MCP 연동 스크립트

- [ ] `scripts/skill-wrapper.js` 생성
- [ ] MCP 도구 호출 로직
- [ ] SKILL.md에서 참조

---

## 🎮 사용 예시

### 전역 Skill 사용

```
사용자: "Create TDD tests for my authentication module"

Claude: *aegis-tdd skill activated*
1. Creating test file: tests/auth/authentication.test.js
2. Following RED-GREEN-REFACTOR cycle...
3. Generated 12 test cases
4. Coverage target: 95%+
```

### 프로젝트 Skill 사용

```
사용자: "Add a new handler with tests"

Claude: *aegis-tdd-project skill activated*
1. Using project-specific handler template
2. Following team's TDD policy
3. Applying project mocking strategies
```

---

## 🏆 최종 추천

### 추천: 전역 등록 + 프로젝트 예시

**이유**:
1. ✅ **전역으로 등록** → 모든 프로젝트에서 활용
2. ✅ **Aegis AI는 예시** → 참고 프로젝트로 유지
3. ✅ **유연성** → 각 프로젝트에서 커스터마이징 가능

**실행 계획**:
```bash
# 1. 전역 Skill 생성
mkdir -p ~/.claude/skills/aegis-tdd

# 2. SKILL.md 작성 (Aegis AI 기반)

# 3. Aegis AI를 참고 프로젝트로 유지
# → 다른 프로젝트에서 "Aegis AI처럼 해줘" 요청 가능
```

---

## 📊 장단점 비교표

| 방식 | 재사용성 | 팀 공유 | 유지보수 | 추천도 |
|------|---------|---------|---------|--------|
| **전역만** | ⭐⭐⭐ | ❌ | ⭐⭐ | ⭐⭐ |
| **프로젝트만** | ❌ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **하이브리드** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

**결론**: 하이브리드 방식 권장 🏆

---

## 🔧 다음 단계

1. **즉시 가능**: 전역 Skill 생성
2. **팀 공유**: Aegis AI를 프로젝트 템플릿으로 공유
3. **확장**: 필요시 프로젝트별 Skill 추가

어떤 방식으로 진행하시겠습니까?
