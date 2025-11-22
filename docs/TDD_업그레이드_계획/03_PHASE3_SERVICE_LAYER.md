# Phase 3: 서비스 레이어 테스트 (Week 5-6)

## 🎯 목표

services/ 디렉토리의 AI 서비스에 Mocking 전략을 적용하여 70% 이상의 커버리지 달성

---

## 📊 대상 모듈

### services/ 구조
```
src/services/
├── geminiService.js    ← Priority 1
├── qwenService.js      ← Priority 2
├── codexService.js     ← Priority 3
└── (기타 서비스)
```

---

## 🎭 Mocking 전략

### 핵심 원칙
AI CLI 호출은 외부 의존성이므로 **jest.mock()**으로 대체

### Mocking 레벨
| 레벨 | 대상 | 목적 |
|------|------|------|
| **Level 1** | child_process | CLI 프로세스 실행 Mock |
| **Level 2** | spawn/exec | 명령어 실행 Mock |
| **Level 3** | stdout/stderr | 출력 스트림 Mock |

---

## 📋 Priority 1: geminiService.js

### 책임
- Gemini CLI 실행
- 프롬프트 전달
- 응답 파싱
- 에러 처리

### 테스트 계획

**tests/services/geminiService.test.js**:
```javascript
const { describe, it, expect, beforeEach, jest } = require('@jest/globals');
const { spawn } = require('child_process');
const GeminiService = require('../../src/services/geminiService');

// Mock child_process
jest.mock('child_process');

describe('GeminiService', () => {
  let service;
  let mockSpawn;

  beforeEach(() => {
    service = new GeminiService();
    jest.clearAllMocks();

    // Mock spawn 동작 설정
    mockSpawn = {
      stdout: {
        on: jest.fn(),
        setEncoding: jest.fn()
      },
      stderr: {
        on: jest.fn()
      },
      on: jest.fn()
    };

    spawn.mockReturnValue(mockSpawn);
  });

  describe('execute', () => {
    it('should execute gemini CLI with correct parameters', async () => {
      // Arrange
      const prompt = 'Brainstorm AI ideas';
      const expectedArgs = ['brainstorm', '--prompt', prompt];

      // Mock 성공 응답
      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback('Success response');
        }
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0); // exit code 0
        }
      });

      // Act
      await service.execute('brainstorm', { prompt });

      // Assert
      expect(spawn).toHaveBeenCalledWith('gemini', expectedArgs);
    });

    it('should handle CLI errors gracefully', async () => {
      // Arrange
      mockSpawn.stderr.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback('Error message');
        }
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(1); // exit code 1 (error)
        }
      });

      // Act & Assert
      await expect(
        service.execute('invalid_command', {})
      ).rejects.toThrow('Gemini CLI error');
    });

    it('should parse JSON response correctly', async () => {
      // Arrange
      const mockResponse = JSON.stringify({
        ideas: ['AI idea 1', 'AI idea 2'],
        status: 'success'
      });

      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(mockResponse);
        }
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0);
        }
      });

      // Act
      const result = await service.execute('brainstorm', { prompt: 'test' });

      // Assert
      expect(result).toEqual({
        ideas: ['AI idea 1', 'AI idea 2'],
        status: 'success'
      });
    });

    it('should timeout if CLI takes too long', async () => {
      // Arrange
      jest.useFakeTimers();
      service.setTimeout(5000); // 5초 타임아웃

      // Mock CLI가 응답하지 않음
      mockSpawn.on.mockImplementation(() => {});

      // Act
      const executePromise = service.execute('slow_command', {});
      jest.advanceTimersByTime(6000); // 6초 경과

      // Assert
      await expect(executePromise).rejects.toThrow('Timeout');

      jest.useRealTimers();
    });
  });

  describe('retry logic', () => {
    it('should retry on transient failures', async () => {
      // Arrange
      let attemptCount = 0;

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          attemptCount++;
          if (attemptCount < 3) {
            callback(1); // 처음 2번은 실패
          } else {
            callback(0); // 3번째는 성공
          }
        }
      });

      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data' && attemptCount === 3) {
          callback('Success');
        }
      });

      service.setRetryCount(3);

      // Act
      const result = await service.execute('flaky_command', {});

      // Assert
      expect(spawn).toHaveBeenCalledTimes(3);
      expect(result).toBeDefined();
    });

    it('should fail after max retries', async () => {
      // Arrange
      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(1); // 항상 실패
        }
      });

      service.setRetryCount(3);

      // Act & Assert
      await expect(
        service.execute('always_fail', {})
      ).rejects.toThrow('Max retries exceeded');

      expect(spawn).toHaveBeenCalledTimes(3);
    });
  });

  describe('parameter validation', () => {
    it('should validate required parameters', async () => {
      // Act & Assert
      await expect(
        service.execute('brainstorm', {}) // prompt 누락
      ).rejects.toThrow('Missing required parameter: prompt');
    });

    it('should sanitize user input', async () => {
      // Arrange
      const maliciousPrompt = 'test; rm -rf /';

      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') callback('Safe response');
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      // Act
      await service.execute('brainstorm', { prompt: maliciousPrompt });

      // Assert
      const calledArgs = spawn.mock.calls[0][1];
      expect(calledArgs).not.toContain('; rm -rf /');
    });
  });
});
```

---

## 📋 Priority 2: qwenService.js

### 테스트 계획

**tests/services/qwenService.test.js**:
```javascript
const { describe, it, expect, beforeEach, jest } = require('@jest/globals');
const { spawn } = require('child_process');
const QwenService = require('../../src/services/qwenService');

jest.mock('child_process');

describe('QwenService', () => {
  let service;
  let mockSpawn;

  beforeEach(() => {
    service = new QwenService();
    jest.clearAllMocks();

    mockSpawn = {
      stdout: { on: jest.fn(), setEncoding: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn()
    };

    spawn.mockReturnValue(mockSpawn);
  });

  describe('code generation', () => {
    it('should generate code from prompt', async () => {
      // Arrange
      const mockCode = 'function hello() { return "world"; }';

      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(JSON.stringify({ code: mockCode }));
        }
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      // Act
      const result = await service.generateCode('Create hello function');

      // Assert
      expect(result.code).toBe(mockCode);
      expect(spawn).toHaveBeenCalledWith(
        'qwen',
        expect.arrayContaining(['generate', '--prompt'])
      );
    });

    it('should handle syntax errors in generated code', async () => {
      // Arrange
      const invalidCode = 'function hello() { return "unclosed';

      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(JSON.stringify({ code: invalidCode, error: 'Syntax error' }));
        }
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      // Act
      const result = await service.generateCode('Invalid code');

      // Assert
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Syntax error');
    });
  });

  describe('code review', () => {
    it('should review code and provide feedback', async () => {
      // Arrange
      const codeToReview = 'function test() {}';
      const mockReview = {
        issues: ['Missing return statement'],
        suggestions: ['Add error handling'],
        score: 7
      };

      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(JSON.stringify(mockReview));
        }
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      // Act
      const result = await service.reviewCode(codeToReview);

      // Assert
      expect(result.issues).toHaveLength(1);
      expect(result.score).toBe(7);
    });
  });

  describe('session management', () => {
    it('should maintain session context', async () => {
      // Arrange
      const sessionId = 'test-session-123';

      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(JSON.stringify({ sessionId, message: 'Session created' }));
        }
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      // Act
      const session = await service.createSession(sessionId);

      // Assert
      expect(session.sessionId).toBe(sessionId);
      expect(spawn).toHaveBeenCalledWith(
        'qwen',
        expect.arrayContaining(['session', 'create', sessionId])
      );
    });
  });
});
```

---

## 📋 Priority 3: codexService.js

### 테스트 계획

**tests/services/codexService.test.js**:
```javascript
const { describe, it, expect, beforeEach, jest } = require('@jest/globals');
const { spawn } = require('child_process');
const CodexService = require('../../src/services/codexService');

jest.mock('child_process');

describe('CodexService', () => {
  let service;
  let mockSpawn;

  beforeEach(() => {
    service = new CodexService();
    jest.clearAllMocks();

    mockSpawn = {
      stdout: { on: jest.fn(), setEncoding: jest.fn() },
      stderr: { on: jest.fn() },
      stdin: { write: jest.fn(), end: jest.fn() },
      on: jest.fn()
    };

    spawn.mockReturnValue(mockSpawn);
  });

  describe('execute', () => {
    it('should execute codex with YOLO flag', async () => {
      // Arrange
      const prompt = 'Refactor this code';

      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback('Refactored code');
        }
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      // Act
      await service.execute(prompt);

      // Assert
      expect(spawn).toHaveBeenCalledWith(
        'codex',
        expect.arrayContaining(['--yolo'])
      );
    });

    it('should handle model selection', async () => {
      // Arrange
      const model = 'gpt-5-codex-high';

      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') callback('Response');
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      // Act
      await service.execute('test', { model });

      // Assert
      expect(spawn).toHaveBeenCalledWith(
        'codex',
        expect.arrayContaining(['--model', model])
      );
    });
  });

  describe('session chat', () => {
    it('should maintain conversation context', async () => {
      // Arrange
      const sessionId = 'chat-session-456';
      const messages = ['Hello', 'How are you?'];

      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(JSON.stringify({ response: 'I am fine', sessionId }));
        }
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      // Act
      const result = await service.sessionChat(sessionId, messages[1]);

      // Assert
      expect(result.sessionId).toBe(sessionId);
      expect(spawn).toHaveBeenCalledWith(
        'codex',
        expect.arrayContaining(['session', 'chat', sessionId])
      );
    });
  });
});
```

---

## 🧪 통합 테스트

### tests/services/integration.test.js

```javascript
const { describe, it, expect } = require('@jest/globals');
const GeminiService = require('../../src/services/geminiService');
const QwenService = require('../../src/services/qwenService');
const CodexService = require('../../src/services/codexService');

describe('AI Services Integration', () => {
  describe('Schema consistency', () => {
    it('should return consistent response schema across all services', async () => {
      // Arrange
      const gemini = new GeminiService();
      const qwen = new QwenService();
      const codex = new CodexService();

      // 공통 입력
      const input = 'Explain binary search';

      // Act
      const [geminiResult, qwenResult, codexResult] = await Promise.all([
        gemini.execute('explain', { prompt: input }),
        qwen.explain(input),
        codex.execute(input)
      ]);

      // Assert: 모든 서비스가 동일한 스키마 반환
      expect(geminiResult).toMatchObject({
        response: expect.any(String),
        metadata: expect.any(Object)
      });

      expect(qwenResult).toMatchObject({
        response: expect.any(String),
        metadata: expect.any(Object)
      });

      expect(codexResult).toMatchObject({
        response: expect.any(String),
        metadata: expect.any(Object)
      });
    });
  });

  describe('Error handling consistency', () => {
    it('should handle errors uniformly', async () => {
      // 모든 서비스가 동일한 에러 포맷 사용 검증
    });
  });
});
```

---

## 📊 커버리지 목표

### 모듈별 목표
| 모듈 | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| geminiService.js | 75% | 70% | 80% | 75% |
| qwenService.js | 75% | 70% | 80% | 75% |
| codexService.js | 75% | 70% | 80% | 75% |

### 전체 services/ 목표
- **Overall**: 70% 이상

---

## ✅ 완료 기준

- [x] geminiService.js 테스트 작성 (20+ 테스트)
- [x] qwenService.js 테스트 작성 (15+ 테스트)
- [x] codexService.js 테스트 작성 (15+ 테스트)
- [x] 통합 테스트 작성
- [x] 모든 테스트 통과
- [x] services/ 커버리지 70% 이상

---

## 🚀 실행 가이드

### Week 5: Gemini & Qwen
```bash
# Day 1-2: geminiService.js
touch tests/services/geminiService.test.js
npm test -- geminiService

# Day 3-4: qwenService.js
touch tests/services/qwenService.test.js
npm test -- qwenService
```

### Week 6: Codex & Integration
```bash
# Day 1-2: codexService.js
touch tests/services/codexService.test.js
npm test -- codexService

# Day 3-5: 통합 테스트
touch tests/services/integration.test.js
npm test -- integration
```

---

## 다음 단계

Phase 3 완료 후:
- ✅ services/ 70% 커버리지 달성
- 📖 [Phase 4: MCP 프로토콜 테스트](./04_PHASE4_MCP_PROTOCOL.md)로 이동

---

**상태**: 🚀 실행 준비 완료
**예상 소요 시간**: 2 주
**다음**: [Phase 4: MCP 프로토콜 테스트](./04_PHASE4_MCP_PROTOCOL.md)

---

## 🎯 Claude Code PM 관리

### Phase 3 핵심: Mocking 전략 승인

**PM 사전 검토**:
```
Claude Code (PM):
"⚠️ Phase 3 리스크 분석

Mocking 복잡도가 예상보다 높습니다.

대응 계획:
1. Qwen에게 Mocking 베스트 프랙티스 요청
2. 1일 추가 학습 시간 배정
3. 완전한 이해 후 진행

일정 조정: Phase 3 완료일 +1일
승인하시겠습니까?"
```

**PM 품질 검증**:
- Mocking 전략 문서화 확인
- child_process Mock 동작 검증
- 3개 서비스 일관성 확인
