/**
 * qualityPipeline.js
 * 코드 품질 검사 파이프라인 실행 및 품질 게이트 관리
 *
 * @module qualityPipeline
 * @description 코드 품질 검사를 순차적으로 실행하고 품질 게이트를 검증합니다.
 */

/**
 * QualityPipeline 클래스
 * 품질 검사와 게이트를 관리합니다.
 */
class QualityPipeline {
  constructor() {
    this.checks = [];
    this.gates = [];
  }

  /**
   * 품질 검사 추가
   *
   * @param {string} name - 검사 이름
   * @param {Function} fn - 검사 실행 함수 (async)
   * @throws {Error} 중복된 이름이거나 형식이 잘못된 경우
   *
   * @example
   * pipeline.addCheck('lint', async () => ({ passed: true }));
   */
  addCheck(name, fn) {
    // 형식 검증
    if (!fn || typeof fn !== 'function') {
      throw new Error('Invalid check format: fn is required and must be a function');
    }

    // 중복 검사
    if (this.checks.some(check => check.name === name)) {
      throw new Error(`Duplicate check name: ${name}`);
    }

    this.checks.push({ name, fn });
  }

  /**
   * 품질 게이트 추가
   *
   * @param {string} name - 게이트 이름
   * @param {Object} gate - 게이트 설정 객체
   * @param {Function} gate.validator - 검증 함수
   * @throws {Error} 형식이 잘못된 경우
   *
   * @example
   * pipeline.addGate('coverage', {
   *   validator: (result) => result.coverage >= 80
   * });
   */
  addGate(name, gate) {
    // 형식 검증
    if (!gate || !gate.validator || typeof gate.validator !== 'function') {
      throw new Error('Invalid gate format: validator is required and must be a function');
    }

    this.gates.push({ name, ...gate });
  }

  /**
   * 등록된 모든 검사 목록
   *
   * @returns {Array} 검사 목록
   */
  getChecks() {
    return this.checks.map(check => ({ name: check.name }));
  }

  /**
   * 등록된 모든 게이트 목록
   *
   * @returns {Array} 게이트 목록
   */
  getGates() {
    return this.gates.map(gate => ({ name: gate.name }));
  }

  /**
   * 모든 품질 검사를 실행하고 결과 반환
   *
   * @returns {Promise<Object>} 실행 결과
   * @returns {boolean} result.passed - 전체 통과 여부
   * @returns {Array} result.checks - 각 검사 결과
   * @returns {string} result.summary - 요약 정보
   *
   * @example
   * const result = await pipeline.execute();
   * if (result.passed) {
   *   console.log('All checks passed!');
   * }
   */
  async execute() {
    const checkResults = [];
    let allPassed = true;
    const summaryMessages = [];

    // 각 검사 순차 실행
    for (const check of this.checks) {
      try {
        const checkResult = await check.fn();

        checkResults.push({
          name: check.name,
          passed: checkResult.passed,
          result: checkResult.result,
        });

        if (!checkResult.passed) {
          allPassed = false;
          summaryMessages.push(`${check.name}: ${checkResult.result || 'failed'}`);
        }
      } catch (error) {
        // 검사 실행 중 예외 처리
        allPassed = false;
        checkResults.push({
          name: check.name,
          passed: false,
          error: error.message,
        });
        summaryMessages.push(`${check.name}: ${error.message}`);
      }
    }

    return {
      passed: allPassed,
      checks: checkResults,
      summary: summaryMessages.join('; '),
    };
  }

  /**
   * 품질 게이트 검증
   *
   * @param {Object} executionResult - execute() 실행 결과
   * @returns {Object} 게이트 검증 결과
   * @returns {boolean} result.passed - 모든 게이트 통과 여부
   * @returns {Array} result.failedGates - 실패한 게이트 목록
   *
   * @example
   * const result = await pipeline.execute();
   * const gatesResult = pipeline.validateGates(result);
   */
  validateGates(executionResult) {
    const failedGates = [];

    // 게이트가 없으면 통과
    if (this.gates.length === 0) {
      return {
        passed: true,
        failedGates: [],
      };
    }

    // 각 게이트 검증
    for (const gate of this.gates) {
      try {
        // 각 검사 결과에 대해 validator 실행
        const checkResults = executionResult.checks || [];
        const relevantCheck = checkResults.find(c => c.name === gate.name);

        if (relevantCheck && !gate.validator(relevantCheck.result)) {
          failedGates.push({
            name: gate.name,
            reason: 'Validator returned false',
          });
        }
      } catch (error) {
        failedGates.push({
          name: gate.name,
          reason: error.message,
        });
      }
    }

    return {
      passed: failedGates.length === 0,
      failedGates,
    };
  }
}

module.exports = { QualityPipeline };
