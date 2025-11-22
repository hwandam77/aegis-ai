/**
 * stageOrchestrator.js
 * 워크플로우 스테이지를 관리하고 전환하는 오케스트레이터
 *
 * @module stageOrchestrator
 * @description 워크플로우의 단계별 상태를 관리하고 전환 로직을 처리합니다.
 */

/**
 * StageOrchestrator 클래스
 * 스테이지 전환 및 히스토리를 관리합니다.
 */
class StageOrchestrator {
  constructor() {
    this.currentStage = null;
    this.history = [];
    this.stages = ['init', 'processing', 'completed'];
    this.hooks = {
      onEnter: new Map(),
      onExit: new Map(),
    };
    this.initialized = false;

    // 스테이지 전환 규칙 정의
    this.transitionRules = {
      init: ['processing'],
      processing: ['completed'],
      completed: [],
    };
  }

  /**
   * 오케스트레이터를 기본 스테이지로 초기화
   *
   * @returns {Promise<void>}
   * @throws {Error} 이미 초기화된 경우
   *
   * @example
   * await orchestrator.initialize();
   */
  async initialize() {
    if (this.initialized) {
      throw new Error('Orchestrator already initialized');
    }

    this.currentStage = 'init';
    this.history = ['init'];
    this.initialized = true;
  }

  /**
   * 현재 스테이지에서 대상 스테이지로 전환
   *
   * @param {string} targetStage - 전환할 대상 스테이지
   * @returns {Promise<void>}
   * @throws {Error} 초기화되지 않았거나 유효하지 않은 전환인 경우
   *
   * @example
   * await orchestrator.transition('processing');
   */
  async transition(targetStage) {
    // 초기화 확인
    if (!this.initialized) {
      throw new Error('Orchestrator not initialized');
    }

    // 대상 스테이지 존재 확인
    if (!this.stages.includes(targetStage)) {
      throw new Error(`Target stage does not exist: ${targetStage}`);
    }

    // 동일한 스테이지로 전환 방지
    if (this.currentStage === targetStage) {
      throw new Error(`Cannot transition to the same stage: ${targetStage}`);
    }

    // 유효한 전환인지 확인
    const allowedTransitions = this.transitionRules[this.currentStage] || [];
    if (!allowedTransitions.includes(targetStage)) {
      throw new Error(`Invalid stage transition: ${this.currentStage} -> ${targetStage}`);
    }

    // onExit 훅 실행 (현재 스테이지)
    await this.executeHooks('onExit', this.currentStage);

    // 스테이지 전환
    const previousStage = this.currentStage;
    this.currentStage = targetStage;
    this.history.push(targetStage);

    try {
      // onEnter 훅 실행 (새 스테이지)
      await this.executeHooks('onEnter', targetStage);
    } catch (error) {
      // 훅 실행 중 에러 발생 시 롤백
      this.currentStage = previousStage;
      this.history.pop();
      throw error;
    }
  }

  /**
   * 현재 스테이지 조회
   *
   * @returns {string|null} 현재 스테이지 이름
   *
   * @example
   * const stage = orchestrator.getCurrentStage();
   */
  getCurrentStage() {
    return this.currentStage;
  }

  /**
   * 스테이지 전환 히스토리 조회
   *
   * @returns {string[]} 스테이지 히스토리 배열
   *
   * @example
   * const history = orchestrator.getStageHistory();
   */
  getStageHistory() {
    return [...this.history];
  }

  /**
   * 사용 가능한 모든 스테이지 목록
   *
   * @returns {string[]} 스테이지 목록
   */
  getStages() {
    return [...this.stages];
  }

  /**
   * 스테이지 진입 시 실행할 훅 등록
   *
   * @param {string} stage - 스테이지 이름
   * @param {Function} callback - 실행할 콜백 함수
   * @throws {Error} 유효하지 않은 스테이지인 경우
   *
   * @example
   * orchestrator.onEnter('processing', async () => {
   *   console.log('Entering processing stage');
   * });
   */
  onEnter(stage, callback) {
    // 스테이지 유효성 검증
    if (!this.stages.includes(stage)) {
      throw new Error(`Invalid stage for hook registration: ${stage}`);
    }

    if (!this.hooks.onEnter.has(stage)) {
      this.hooks.onEnter.set(stage, []);
    }
    this.hooks.onEnter.get(stage).push(callback);
  }

  /**
   * 스테이지 종료 시 실행할 훅 등록
   *
   * @param {string} stage - 스테이지 이름
   * @param {Function} callback - 실행할 콜백 함수
   * @throws {Error} 유효하지 않은 스테이지인 경우
   *
   * @example
   * orchestrator.onExit('init', async () => {
   *   console.log('Exiting init stage');
   * });
   */
  onExit(stage, callback) {
    // 스테이지 유효성 검증
    if (!this.stages.includes(stage)) {
      throw new Error(`Invalid stage for hook registration: ${stage}`);
    }

    if (!this.hooks.onExit.has(stage)) {
      this.hooks.onExit.set(stage, []);
    }
    this.hooks.onExit.get(stage).push(callback);
  }

  /**
   * 특정 스테이지의 훅 실행
   *
   * @private
   * @param {string} event - 이벤트 타입 (onEnter 또는 onExit)
   * @param {string} stage - 스테이지 이름
   * @returns {Promise<void>}
   */
  async executeHooks(event, stage) {
    const callbacks = this.hooks[event].get(stage) || [];
    for (const callback of callbacks) {
      await callback();
    }
  }
}

module.exports = { StageOrchestrator };
