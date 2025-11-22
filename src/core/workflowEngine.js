/**
 * workflowEngine.js
 * 워크플로우 실행 및 롤백 엔진
 *
 * @module workflowEngine
 * @description 워크플로우 스텝을 순차적으로 실행하고 실패 시 롤백을 지원합니다.
 */

/**
 * WorkflowEngine 클래스
 * 워크플로우 실행 및 롤백 관리
 */
class WorkflowEngine {
  constructor() {
    this.executedSteps = [];
    this.executionHistory = [];
  }

  /**
   * 워크플로우 스텝들을 순서대로 실행
   *
   * @param {Array<Function|Object>} steps - 실행할 스텝 배열
   * @param {Object} context - 각 스텝에 전달할 컨텍스트
   * @returns {Promise<*>} 마지막 스텝의 결과
   * @throws {Error} 스텝 실행 중 에러 발생 시
   *
   * @example
   * const result = await engine.execute([
   *   async () => 'step1',
   *   async () => 'step2',
   * ]);
   */
  async execute(steps, context = {}) {
    // 입력 검증
    if (!steps || !Array.isArray(steps)) {
      throw new Error('Invalid steps: must be an array');
    }

    // 빈 워크플로우
    if (steps.length === 0) {
      return undefined;
    }

    this.executedSteps = [];
    this.executionHistory = [];

    let lastResult;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      try {
        // 스텝이 객체인 경우 execute 함수 추출
        const executeFn = typeof step === 'function' ? step : step.execute;

        if (typeof executeFn !== 'function') {
          throw new Error(`Step at index ${i} is not a function`);
        }

        // 스텝 실행
        lastResult = await executeFn(context);

        // 실행 기록
        this.executedSteps.push(step);
        this.executionHistory.push({
          stepIndex: i,
          result: lastResult,
          success: true,
        });
      } catch (error) {
        // 실행 실패 기록
        this.executionHistory.push({
          stepIndex: i,
          error: error.message,
          success: false,
        });

        // 에러 전파
        throw error;
      }
    }

    return lastResult;
  }

  /**
   * 실행된 스텝들을 역순으로 롤백
   *
   * @returns {Promise<void>}
   *
   * @example
   * try {
   *   await engine.execute(steps);
   * } catch (error) {
   *   await engine.rollback();
   * }
   */
  async rollback() {
    // 역순으로 롤백 실행
    const stepsToRollback = [...this.executedSteps].reverse();

    for (const step of stepsToRollback) {
      // 스텝이 객체이고 rollback 함수가 있는 경우만 실행
      if (typeof step === 'object' && step.rollback && typeof step.rollback === 'function') {
        try {
          await step.rollback();
        } catch (error) {
          // 롤백 중 에러는 로그만 남기고 계속 진행
          console.warn(`Rollback failed for step:`, error.message);
        }
      }
    }

    // 롤백 후 상태 초기화
    this.executedSteps = [];
  }

  /**
   * 실행 히스토리 조회
   *
   * @returns {Array} 실행 히스토리
   *
   * @example
   * const history = engine.getExecutionHistory();
   */
  getExecutionHistory() {
    return [...this.executionHistory];
  }

  /**
   * 엔진 상태 초기화
   *
   * @example
   * engine.reset();
   */
  reset() {
    this.executedSteps = [];
    this.executionHistory = [];
  }
}

module.exports = { WorkflowEngine };
