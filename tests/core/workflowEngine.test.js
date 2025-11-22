// tests/core/workflowEngine.test.js

const { WorkflowEngine } = require('../../src/core/workflowEngine');

describe('WorkflowEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  describe('execute', () => {
    test('워크플로우 스텝을 순서대로 실행', async () => {
      // Given
      const callOrder = [];
      const steps = [
        async () => { callOrder.push('step1'); return 'result1'; },
        async () => { callOrder.push('step2'); return 'result2'; },
        async () => { callOrder.push('step3'); return 'result3'; },
      ];

      // When
      const result = await engine.execute(steps);

      // Then
      expect(callOrder).toEqual(['step1', 'step2', 'step3']);
      expect(result).toBe('result3');
    });

    test('스텝 실패 시 중단', async () => {
      // Given
      const step3 = jest.fn();
      const steps = [
        async () => 'step1',
        async () => { throw new Error('Step 2 failed'); },
        step3,
      ];

      // When & Then
      await expect(engine.execute(steps)).rejects.toThrow('Step 2 failed');
      expect(step3).not.toHaveBeenCalled();
    });

    test('빈 워크플로우 실행 시 undefined 반환', async () => {
      // When
      const result = await engine.execute([]);

      // Then
      expect(result).toBeUndefined();
    });

    test('각 스텝에 context 전달', async () => {
      // Given
      const context = { user: 'test' };
      const steps = [
        async (ctx) => {
          expect(ctx).toEqual(context);
          return 'done';
        },
      ];

      // When
      const result = await engine.execute(steps, context);

      // Then
      expect(result).toBe('done');
    });
  });

  describe('rollback', () => {
    test('실행된 스텝들을 역순으로 롤백', async () => {
      // Given
      const rollbackOrder = [];
      const steps = [
        {
          execute: async () => 'step1',
          rollback: async () => { rollbackOrder.push('rollback1'); },
        },
        {
          execute: async () => { throw new Error('Failed'); },
          rollback: async () => { rollbackOrder.push('rollback2'); },
        },
        {
          execute: async () => 'step3',
          rollback: async () => { rollbackOrder.push('rollback3'); },
        },
      ];

      // When
      try {
        await engine.execute(steps);
      } catch (error) {
        await engine.rollback();
      }

      // Then
      expect(rollbackOrder).toEqual(['rollback1']); // step1만 실행되었으므로
    });

    test('rollback이 없는 스텝은 건너뜀', async () => {
      // Given
      const rollbackFn = jest.fn();
      const steps = [
        { execute: async () => 'step1' }, // rollback 없음
        {
          execute: async () => { throw new Error('Failed'); },
          rollback: rollbackFn,
        },
      ];

      // When
      try {
        await engine.execute(steps);
      } catch (error) {
        await engine.rollback();
      }

      // Then
      expect(rollbackFn).not.toHaveBeenCalled();
    });

    test('실행된 스텝이 없을 때 롤백 호출 시 에러 없음', async () => {
      // When & Then
      await expect(engine.rollback()).resolves.not.toThrow();
    });
  });

  describe('getExecutionHistory', () => {
    test('실행된 스텝 히스토리 조회', async () => {
      // Given
      const steps = [
        async () => 'step1',
        async () => 'step2',
      ];

      // When
      await engine.execute(steps);
      const history = engine.getExecutionHistory();

      // Then
      expect(history).toHaveLength(2);
      expect(history[0]).toHaveProperty('stepIndex', 0);
      expect(history[0]).toHaveProperty('result', 'step1');
      expect(history[1]).toHaveProperty('stepIndex', 1);
      expect(history[1]).toHaveProperty('result', 'step2');
    });

    test('실패한 스텝도 히스토리에 포함', async () => {
      // Given
      const steps = [
        async () => 'step1',
        async () => { throw new Error('Failed'); },
      ];

      // When
      try {
        await engine.execute(steps);
      } catch (error) {
        // 예상된 에러
      }

      // Then
      const history = engine.getExecutionHistory();
      expect(history).toHaveLength(2);
      expect(history[1]).toHaveProperty('error');
    });
  });

  describe('Edge Cases', () => {
    test('null 스텝 배열 처리', async () => {
      // When & Then
      await expect(engine.execute(null)).rejects.toThrow('Invalid steps');
    });

    test('스텝이 함수가 아닌 경우', async () => {
      // Given
      const steps = ['not a function'];

      // When & Then
      await expect(engine.execute(steps)).rejects.toThrow();
    });

    test('롤백 함수 실행 중 에러 발생', async () => {
      // Given
      const steps = [
        {
          execute: async () => 'step1',
          rollback: async () => { throw new Error('Rollback failed'); },
        },
        {
          execute: async () => { throw new Error('Execute failed'); },
        },
      ];

      // When
      try {
        await engine.execute(steps);
      } catch (error) {
        // 롤백 중 에러 발생해도 처리
        await expect(engine.rollback()).resolves.not.toThrow();
      }
    });
  });

  describe('reset', () => {
    test('엔진 상태 초기화', async () => {
      // Given
      const steps = [async () => 'step1'];
      await engine.execute(steps);
      expect(engine.getExecutionHistory()).toHaveLength(1);

      // When
      engine.reset();

      // Then
      expect(engine.getExecutionHistory()).toHaveLength(0);
    });
  });
});
