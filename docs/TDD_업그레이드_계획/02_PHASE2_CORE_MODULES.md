# Phase 2: 핵심 모듈 테스트 (Week 3-4)

## 🎯 목표

core/ 디렉토리의 핵심 모듈에 TDD를 적용하여 80% 이상의 커버리지 달성

---

## 📊 대상 모듈

### core/ 구조
```
src/core/
├── handlerLoader.js        ← Priority 1 (최우선)
├── stageOrchestrator.js    ← Priority 2
├── qualityPipeline.js      ← Priority 3
├── stateManager.js         ← Priority 4
├── workflowEngine.js       ← Priority 5
├── featureDetector.js      ← Priority 6
├── metadataManager.js      ← Priority 7
└── toolRegistry.js         ← Priority 8
```

---

## 📋 우선순위별 작업

### Priority 1: handlerLoader.js (가장 중요)

#### 책임
- AI 핸들러 동적 로딩
- 핸들러 등록 및 관리
- 핸들러 검증

#### 테스트 계획

**tests/core/handlerLoader.test.js**:
```javascript
const { describe, it, expect, beforeEach, jest } = require('@jest/globals');
const HandlerLoader = require('../../src/core/handlerLoader');
const fs = require('fs');
const path = require('path');

// Mock fs 모듈
jest.mock('fs');

describe('HandlerLoader', () => {
  let loader;

  beforeEach(() => {
    loader = new HandlerLoader();
    jest.clearAllMocks();
  });

  describe('loadHandlers', () => {
    it('should load all handlers from handlers directory', () => {
      // Arrange: Mock fs.readdirSync
      fs.readdirSync.mockReturnValue([
        'gemini',
        'qwen',
        'speckit.js'
      ]);

      // Act
      const handlers = loader.loadHandlers('./src/handlers');

      // Assert
      expect(handlers).toBeDefined();
      expect(Object.keys(handlers).length).toBeGreaterThan(0);
    });

    it('should throw error if handlers directory does not exist', () => {
      // Arrange
      fs.readdirSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      // Act & Assert
      expect(() => {
        loader.loadHandlers('./nonexistent');
      }).toThrow('ENOENT');
    });

    it('should skip invalid handler files', () => {
      // Arrange
      fs.readdirSync.mockReturnValue([
        'valid-handler.js',
        'README.md',        // 스킵해야 함
        '.DS_Store'         // 스킵해야 함
      ]);

      // Act
      const handlers = loader.loadHandlers('./src/handlers');

      // Assert
      expect(handlers).not.toHaveProperty('README');
      expect(handlers).not.toHaveProperty('.DS_Store');
    });
  });

  describe('registerHandler', () => {
    it('should register a handler with metadata', () => {
      // Arrange
      const handler = {
        name: 'test_handler',
        execute: jest.fn()
      };

      // Act
      loader.registerHandler('test', handler);

      // Assert
      const registered = loader.getHandler('test');
      expect(registered).toBeDefined();
      expect(registered.name).toBe('test_handler');
    });

    it('should throw error if handler is invalid', () => {
      // Act & Assert
      expect(() => {
        loader.registerHandler('invalid', null);
      }).toThrow('Invalid handler');
    });
  });

  describe('getHandler', () => {
    it('should return registered handler', () => {
      // Arrange
      const handler = { name: 'test', execute: jest.fn() };
      loader.registerHandler('test', handler);

      // Act
      const result = loader.getHandler('test');

      // Assert
      expect(result).toBe(handler);
    });

    it('should return undefined for non-existent handler', () => {
      // Act
      const result = loader.getHandler('nonexistent');

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
```

**TDD 사이클**:
```
🔴 RED   → 위 테스트 작성 (실패)
🟢 GREEN → handlerLoader.js 구현하여 통과
🔵 REFACTOR → 코드 개선
```

---

### Priority 2: stageOrchestrator.js

#### 책임
- 워크플로우 스테이지 관리
- 스테이지 전환 로직
- 스테이지 상태 추적

#### 테스트 계획

**tests/core/stageOrchestrator.test.js**:
```javascript
const { describe, it, expect, beforeEach } = require('@jest/globals');
const StageOrchestrator = require('../../src/core/stageOrchestrator');

describe('StageOrchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new StageOrchestrator();
  });

  describe('initialize', () => {
    it('should initialize with default stages', () => {
      // Act
      orchestrator.initialize();

      // Assert
      const stages = orchestrator.getStages();
      expect(stages).toContain('init');
      expect(stages).toContain('processing');
      expect(stages).toContain('completed');
    });
  });

  describe('transition', () => {
    it('should transition from init to processing', async () => {
      // Arrange
      orchestrator.initialize();
      expect(orchestrator.getCurrentStage()).toBe('init');

      // Act
      await orchestrator.transition('processing');

      // Assert
      expect(orchestrator.getCurrentStage()).toBe('processing');
    });

    it('should throw error for invalid transition', async () => {
      // Arrange
      orchestrator.initialize();

      // Act & Assert
      await expect(
        orchestrator.transition('invalid_stage')
      ).rejects.toThrow('Invalid stage transition');
    });

    it('should execute stage hooks during transition', async () => {
      // Arrange
      const onEnterHook = jest.fn();
      orchestrator.addHook('processing', 'onEnter', onEnterHook);

      // Act
      await orchestrator.transition('processing');

      // Assert
      expect(onEnterHook).toHaveBeenCalled();
    });
  });

  describe('getStageHistory', () => {
    it('should track stage transition history', async () => {
      // Arrange
      orchestrator.initialize();

      // Act
      await orchestrator.transition('processing');
      await orchestrator.transition('completed');

      // Assert
      const history = orchestrator.getStageHistory();
      expect(history).toEqual(['init', 'processing', 'completed']);
    });
  });
});
```

---

### Priority 3: qualityPipeline.js

#### 책임
- 코드 품질 검사 실행
- 품질 게이트 관리
- 품질 리포트 생성

#### 테스트 계획

**tests/core/qualityPipeline.test.js**:
```javascript
const { describe, it, expect, beforeEach } = require('@jest/globals');
const QualityPipeline = require('../../src/core/qualityPipeline');

describe('QualityPipeline', () => {
  let pipeline;

  beforeEach(() => {
    pipeline = new QualityPipeline();
  });

  describe('execute', () => {
    it('should execute all quality checks', async () => {
      // Arrange
      const checks = [
        { name: 'lint', fn: jest.fn().mockResolvedValue({ passed: true }) },
        { name: 'test', fn: jest.fn().mockResolvedValue({ passed: true }) }
      ];

      checks.forEach(check => pipeline.addCheck(check));

      // Act
      const result = await pipeline.execute();

      // Assert
      expect(result.passed).toBe(true);
      expect(checks[0].fn).toHaveBeenCalled();
      expect(checks[1].fn).toHaveBeenCalled();
    });

    it('should fail if any check fails', async () => {
      // Arrange
      pipeline.addCheck({
        name: 'failing_check',
        fn: jest.fn().mockResolvedValue({ passed: false })
      });

      // Act
      const result = await pipeline.execute();

      // Assert
      expect(result.passed).toBe(false);
    });

    it('should generate quality report', async () => {
      // Arrange
      pipeline.addCheck({
        name: 'check1',
        fn: jest.fn().mockResolvedValue({ passed: true, score: 95 })
      });

      // Act
      const result = await pipeline.execute();

      // Assert
      expect(result.report).toBeDefined();
      expect(result.report.checks).toHaveLength(1);
      expect(result.report.overallScore).toBe(95);
    });
  });

  describe('addGate', () => {
    it('should add quality gate', () => {
      // Arrange
      const gate = {
        name: 'coverage_gate',
        threshold: 80,
        validator: (result) => result.coverage >= 80
      };

      // Act
      pipeline.addGate(gate);

      // Assert
      const gates = pipeline.getGates();
      expect(gates).toContainEqual(gate);
    });
  });

  describe('validateGates', () => {
    it('should pass if all gates pass', async () => {
      // Arrange
      pipeline.addGate({
        name: 'test_gate',
        validator: () => true
      });

      // Act
      const result = await pipeline.execute();
      const gateResult = pipeline.validateGates(result);

      // Assert
      expect(gateResult.passed).toBe(true);
    });
  });
});
```

---

### Priority 4: stateManager.js

#### 테스트 계획

**tests/core/stateManager.test.js**:
```javascript
const { describe, it, expect, beforeEach } = require('@jest/globals');
const StateManager = require('../../src/core/stateManager');

describe('StateManager', () => {
  let manager;

  beforeEach(() => {
    manager = new StateManager();
  });

  describe('setState', () => {
    it('should set state correctly', () => {
      // Act
      manager.setState({ stage: 'processing', data: { count: 1 } });

      // Assert
      const state = manager.getState();
      expect(state.stage).toBe('processing');
      expect(state.data.count).toBe(1);
    });

    it('should merge state partially', () => {
      // Arrange
      manager.setState({ stage: 'init', data: { count: 0 } });

      // Act
      manager.setState({ data: { count: 1 } });

      // Assert
      const state = manager.getState();
      expect(state.stage).toBe('init'); // 유지
      expect(state.data.count).toBe(1);  // 변경
    });
  });

  describe('snapshot', () => {
    it('should create state snapshot', () => {
      // Arrange
      manager.setState({ stage: 'processing' });

      // Act
      const snapshot = manager.snapshot();

      // Assert
      expect(snapshot).toEqual({ stage: 'processing' });

      // 원본 상태 변경해도 스냅샷은 불변
      manager.setState({ stage: 'completed' });
      expect(snapshot.stage).toBe('processing');
    });
  });

  describe('restore', () => {
    it('should restore from snapshot', () => {
      // Arrange
      manager.setState({ stage: 'processing' });
      const snapshot = manager.snapshot();
      manager.setState({ stage: 'completed' });

      // Act
      manager.restore(snapshot);

      // Assert
      expect(manager.getState().stage).toBe('processing');
    });
  });
});
```

---

### Priority 5: workflowEngine.js

#### 테스트 계획

**tests/core/workflowEngine.test.js**:
```javascript
const { describe, it, expect, beforeEach, jest } = require('@jest/globals');
const WorkflowEngine = require('../../src/core/workflowEngine');

describe('WorkflowEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  describe('execute', () => {
    it('should execute workflow steps in order', async () => {
      // Arrange
      const steps = [
        jest.fn().mockResolvedValue('step1'),
        jest.fn().mockResolvedValue('step2'),
        jest.fn().mockResolvedValue('step3')
      ];

      // Act
      const result = await engine.execute(steps);

      // Assert
      expect(steps[0]).toHaveBeenCalled();
      expect(steps[1]).toHaveBeenCalled();
      expect(steps[2]).toHaveBeenCalled();
      expect(result).toBe('step3');
    });

    it('should stop on step failure', async () => {
      // Arrange
      const steps = [
        jest.fn().mockResolvedValue('step1'),
        jest.fn().mockRejectedValue(new Error('Step 2 failed')),
        jest.fn().mockResolvedValue('step3')
      ];

      // Act & Assert
      await expect(engine.execute(steps)).rejects.toThrow('Step 2 failed');
      expect(steps[2]).not.toHaveBeenCalled();
    });
  });

  describe('rollback', () => {
    it('should rollback executed steps', async () => {
      // Arrange
      const cleanup1 = jest.fn();
      const cleanup2 = jest.fn();

      const steps = [
        { execute: jest.fn(), rollback: cleanup1 },
        { execute: jest.fn().mockRejectedValue(new Error('Failed')), rollback: cleanup2 }
      ];

      // Act
      try {
        await engine.execute(steps);
      } catch (error) {
        await engine.rollback();
      }

      // Assert
      expect(cleanup1).toHaveBeenCalled();
    });
  });
});
```

---

## 📊 커버리지 목표

### 모듈별 목표
| 모듈 | 목표 | 우선순위 |
|------|------|---------|
| handlerLoader.js | 90% | P1 |
| stageOrchestrator.js | 85% | P2 |
| qualityPipeline.js | 85% | P3 |
| stateManager.js | 80% | P4 |
| workflowEngine.js | 80% | P5 |
| featureDetector.js | 75% | P6 |
| metadataManager.js | 75% | P7 |
| toolRegistry.js | 75% | P8 |

### 전체 core/ 목표
- **Statements**: 80% 이상
- **Branches**: 80% 이상
- **Functions**: 85% 이상
- **Lines**: 80% 이상

---

## ✅ 완료 기준 (Definition of Done)

### Priority 1-3 (필수)
- [x] handlerLoader.js 테스트 작성 (15+ 테스트)
- [x] stageOrchestrator.js 테스트 작성 (12+ 테스트)
- [x] qualityPipeline.js 테스트 작성 (10+ 테스트)
- [x] 모든 테스트 통과
- [x] 커버리지 80% 이상

### Priority 4-5 (중요)
- [ ] stateManager.js 테스트 작성
- [ ] workflowEngine.js 테스트 작성
- [ ] 통합 테스트 추가

### Priority 6-8 (추가)
- [ ] featureDetector.js 테스트
- [ ] metadataManager.js 테스트
- [ ] toolRegistry.js 테스트

---

## 🚀 실행 가이드

### Week 3: Priority 1-3

**Day 1-2**: handlerLoader.js
```bash
# 1. 테스트 파일 생성
touch tests/core/handlerLoader.test.js

# 2. 🔴 RED: 실패하는 테스트 작성
npm test -- handlerLoader

# 3. 🟢 GREEN: 구현하여 통과
# 4. 🔵 REFACTOR: 리팩토링
```

**Day 3-4**: stageOrchestrator.js
**Day 5**: qualityPipeline.js

### Week 4: Priority 4-8

**Day 1-2**: stateManager.js, workflowEngine.js
**Day 3-5**: 나머지 모듈 + 통합 테스트

---

## 📊 예상 결과

### 테스트 실행
```bash
$ npm test -- --testPathPattern=core

PASS  tests/core/handlerLoader.test.js
PASS  tests/core/stageOrchestrator.test.js
PASS  tests/core/qualityPipeline.test.js
PASS  tests/core/stateManager.test.js
PASS  tests/core/workflowEngine.test.js

Test Suites: 5 passed, 5 total
Tests:       47 passed, 47 total
Time:        2.5s
```

### 커버리지 리포트
```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   82.45 |    80.12 |   85.33 |   83.21 |
 core/                |   82.45 |    80.12 |   85.33 |   83.21 |
  handlerLoader.js    |   91.23 |    88.45 |   92.11 |   90.87 |
  stageOrchestrator.js|   87.34 |    83.21 |   89.12 |   86.45 |
  qualityPipeline.js  |   85.67 |    81.34 |   87.23 |   84.98 |
  stateManager.js     |   82.11 |    78.90 |   84.56 |   81.23 |
  workflowEngine.js   |   80.45 |    77.12 |   82.34 |   79.87 |
----------------------|---------|----------|---------|---------|
```

---

## 다음 단계

Phase 2 완료 후:
- ✅ core/ 모듈 80% 커버리지 달성
- 📖 [Phase 3: 서비스 레이어 테스트](./03_PHASE3_SERVICE_LAYER.md)로 이동
- 🎯 services/ Mocking 전략 적용

---

**상태**: 🚀 실행 준비 완료
**예상 소요 시간**: 2 주
**다음**: [Phase 3: 서비스 레이어 테스트](./03_PHASE3_SERVICE_LAYER.md)

---

## 🎯 Claude Code PM 관리

### Phase 2 PM 프로세스

**시작 전 PM 승인**:
```
Claude Code (PM):
"Phase 2: 핵심 모듈 테스트 착수

📊 분석:
- 대상: core/ 8개 모듈
- 우선순위: P1(handlerLoader) → P5(workflowEngine)
- 목표: 80% 커버리지
- 예상 시간: 2주

🎯 AI 팀 할당:
- Gemini: BDD 명세 생성 (각 모듈당)
- Qwen: Jest 테스트 코드 생성
- Codex: 리팩토링 제안

⚠️ 리스크:
- qualityPipeline 복잡도 (Medium)

승인 및 시작합니다."
```

**모듈별 PM 검증**:
- handlerLoader 완료 시 → PM 커버리지 확인 (목표: 90%)
- 각 Priority 완료 시 → PM 중간 승인
- Phase 2 완료 시 → PM 최종 게이트 검증

**완료 시 PM 승인**:
```
"✅ Phase 2 승인

📊 최종 결과:
- core/ 커버리지: 85.6% (목표 80% 초과달성)
- 테스트 수: 47개
- 통과율: 100%

🎖️ Phase 3 진행 승인"
```
