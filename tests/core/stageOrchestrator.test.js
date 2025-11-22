// tests/core/stageOrchestrator.test.js

const { StageOrchestrator } = require('../../src/core/stageOrchestrator');

describe('StageOrchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new StageOrchestrator();
  });

  describe('초기화', () => {
    test('오케스트레이터 기본 초기화', async () => {
      // Given: 초기화되지 않은 orchestrator
      // When: initialize() 호출
      await orchestrator.initialize();

      // Then: 현재 스테이지 = 'init', 히스토리 = ['init'], getStages() = ['init', 'processing', 'completed']
      expect(orchestrator.getCurrentStage()).toBe('init');
      expect(orchestrator.getStageHistory()).toEqual(['init']);
      expect(orchestrator.getStages()).toEqual(['init', 'processing', 'completed']);
    });
  });

  describe('유효한 스테이지 전환', () => {
    test('유효한 스테이지 전환', async () => {
      // Given: 'init' 스테이지로 초기화됨
      await orchestrator.initialize();

      // When: transition('processing') 호출 (async)
      await orchestrator.transition('processing');

      // Then: 현재 스테이지 = 'processing', 히스토리 = ['init', 'processing']
      expect(orchestrator.getCurrentStage()).toBe('processing');
      expect(orchestrator.getStageHistory()).toEqual(['init', 'processing']);
    });
  });

  describe('스테이지 전환 훅 실행', () => {
    test('스테이지 전환 훅 실행', async () => {
      // Given: 'init' 초기화, 'init' onExit 훅 등록, 'processing' onEnter 훅 등록
      await orchestrator.initialize();
      const exitHook = jest.fn();
      const enterHook = jest.fn();
      orchestrator.onExit('init', exitHook);
      orchestrator.onEnter('processing', enterHook);

      // When: transition('processing') 호출
      await orchestrator.transition('processing');

      // Then: onExit 먼저 호출, onEnter 나중에 호출, 스테이지 = 'processing'
      expect(exitHook).toHaveBeenCalled();
      expect(enterHook).toHaveBeenCalled();
      expect(orchestrator.getCurrentStage()).toBe('processing');
    });
  });

  describe('현재 스테이지 및 히스토리 조회', () => {
    test('현재 스테이지 및 히스토리 조회', async () => {
      // Given: init → processing → completed 순차 전환
      await orchestrator.initialize();
      await orchestrator.transition('processing');
      await orchestrator.transition('completed');

      // When: getCurrentStage(), getStageHistory() 호출
      const currentStage = orchestrator.getCurrentStage();
      const history = orchestrator.getStageHistory();

      // Then: getCurrentStage() = 'completed', getStageHistory() = ['init', 'processing', 'completed']
      expect(currentStage).toBe('completed');
      expect(history).toEqual(['init', 'processing', 'completed']);
    });
  });

  describe('Edge Case: 유효하지 않은 스테이지 전환', () => {
    test('유효하지 않은 스테이지 전환', async () => {
      // Given: 'init' 스테이지
      await orchestrator.initialize();

      // When: transition('completed') 호출 (processing 건너뜀)
      const transitionPromise = orchestrator.transition('completed');

      // Then: 'Invalid stage transition' 에러, 스테이지 유지, 히스토리 변경 없음
      await expect(transitionPromise).rejects.toThrow('Invalid stage transition');
      expect(orchestrator.getCurrentStage()).toBe('init');
      expect(orchestrator.getStageHistory()).toEqual(['init']);
    });
  });

  describe('Edge Case: 초기화 전 메서드 호출', () => {
    test('초기화 전 메서드 호출', async () => {
      // Given: 초기화되지 않은 orchestrator
      // When: transition('processing') 호출
      const transitionPromise = orchestrator.transition('processing');

      // Then: 'Orchestrator not initialized' 에러
      await expect(transitionPromise).rejects.toThrow('Orchestrator not initialized');
    });
  });

  describe('Edge Case: 존재하지 않는 스테이지로 전환', () => {
    test('존재하지 않는 스테이지로 전환', async () => {
      // Given: 'processing' 스테이지
      await orchestrator.initialize();
      await orchestrator.transition('processing');

      // When: transition('unknown_stage') 호출
      const transitionPromise = orchestrator.transition('unknown_stage');

      // Then: 'Target stage does not exist' 에러, 스테이지 유지
      await expect(transitionPromise).rejects.toThrow('Target stage does not exist');
      expect(orchestrator.getCurrentStage()).toBe('processing');
    });
  });

  describe('Edge Case: 동일한 스테이지로 전환', () => {
    test('동일한 스테이지로 전환', async () => {
      // Given: 'processing' 스테이지
      await orchestrator.initialize();
      await orchestrator.transition('processing');

      // When: transition('processing') 호출
      const transitionPromise = orchestrator.transition('processing');

      // Then: 'Cannot transition to the same stage' 에러, 스테이지 유지
      await expect(transitionPromise).rejects.toThrow('Cannot transition to the same stage');
      expect(orchestrator.getCurrentStage()).toBe('processing');
    });
  });

  describe('Edge Case: 훅 실행 중 에러', () => {
    test('훅 실행 중 에러', async () => {
      // Given: 'init' 스테이지, onExit 훅이 에러 발생하도록 설정
      await orchestrator.initialize();
      orchestrator.onExit('init', () => {
        throw new Error('Hook error');
      });

      // When: transition('processing') 호출
      const transitionPromise = orchestrator.transition('processing');

      // Then: 에러 전파, 스테이지 롤백/유지, 히스토리 변경 없음
      await expect(transitionPromise).rejects.toThrow('Hook error');
      expect(orchestrator.getCurrentStage()).toBe('init');
      expect(orchestrator.getStageHistory()).toEqual(['init']);
    });
  });

  describe('추가 Edge Cases (Codex 제안)', () => {
    test('이중 초기화 방지', async () => {
      // Given: 이미 초기화됨
      await orchestrator.initialize();

      // When: 다시 초기화 시도
      const initPromise = orchestrator.initialize();

      // Then: 에러 발생
      await expect(initPromise).rejects.toThrow('Orchestrator already initialized');
    });

    test('유효하지 않은 스테이지에 훅 등록 시 에러', () => {
      // When & Then: onEnter
      expect(() => {
        orchestrator.onEnter('invalid_stage', jest.fn());
      }).toThrow('Invalid stage for hook registration');

      // When & Then: onExit
      expect(() => {
        orchestrator.onExit('unknown_stage', jest.fn());
      }).toThrow('Invalid stage for hook registration');
    });

    test('다중 훅 실행 순서 확인', async () => {
      // Given
      await orchestrator.initialize();
      const callOrder = [];

      orchestrator.onEnter('processing', async () => {
        callOrder.push('enter1');
      });
      orchestrator.onEnter('processing', async () => {
        callOrder.push('enter2');
      });

      // When
      await orchestrator.transition('processing');

      // Then: 등록 순서대로 실행
      expect(callOrder).toEqual(['enter1', 'enter2']);
    });

    test('onEnter 훅 에러 시 롤백 (라인 96-98 커버)', async () => {
      // Given: onEnter 훅이 에러 발생
      await orchestrator.initialize();
      orchestrator.onEnter('processing', () => {
        throw new Error('Enter hook failed');
      });

      // When
      const transitionPromise = orchestrator.transition('processing');

      // Then: 롤백 확인
      await expect(transitionPromise).rejects.toThrow('Enter hook failed');
      expect(orchestrator.getCurrentStage()).toBe('init');
      expect(orchestrator.getStageHistory()).toEqual(['init']);
    });
  });
});
