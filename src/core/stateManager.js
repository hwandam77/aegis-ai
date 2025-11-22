/**
 * stateManager.js
 * 애플리케이션 상태 관리 및 스냅샷/복원 기능
 *
 * @module stateManager
 * @description 상태를 관리하고 스냅샷을 통한 상태 복원을 지원합니다.
 */

/**
 * StateManager 클래스
 * 상태 저장소 및 스냅샷 관리
 */
class StateManager {
  constructor(options = {}) {
    this.state = new Map();
    this.snapshots = [];
    this.maxSnapshots = options.maxSnapshots || 10;
  }

  /**
   * 상태 값 설정
   *
   * @param {string} key - 상태 키
   * @param {*} value - 상태 값
   *
   * @example
   * manager.setState('user', { name: 'John' });
   */
  setState(key, value) {
    this.state.set(key, value);
  }

  /**
   * 상태 값 조회
   *
   * @param {string} key - 상태 키
   * @returns {*} 상태 값 또는 undefined
   *
   * @example
   * const user = manager.getState('user');
   */
  getState(key) {
    return this.state.get(key);
  }

  /**
   * 상태 존재 여부 확인
   *
   * @param {string} key - 상태 키
   * @returns {boolean} 존재 여부
   *
   * @example
   * if (manager.hasState('user')) { ... }
   */
  hasState(key) {
    return this.state.has(key);
  }

  /**
   * 특정 상태 제거
   *
   * @param {string} key - 제거할 상태 키
   *
   * @example
   * manager.removeState('user');
   */
  removeState(key) {
    this.state.delete(key);
  }

  /**
   * 모든 상태 제거
   *
   * @example
   * manager.clearState();
   */
  clearState() {
    this.state.clear();
  }

  /**
   * 현재 상태의 스냅샷 생성
   *
   * @returns {string} 스냅샷 ID
   *
   * @example
   * const snapshotId = manager.snapshot();
   */
  snapshot() {
    const snapshotId = `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    // 현재 상태의 깊은 복사
    const stateCopy = new Map(this.state);

    this.snapshots.push({
      id: snapshotId,
      timestamp,
      state: stateCopy,
    });

    // 최대 개수 초과 시 오래된 스냅샷 제거
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift(); // 가장 오래된 것 제거
    }

    return snapshotId;
  }

  /**
   * 특정 스냅샷으로 복원
   *
   * @param {string} snapshotId - 복원할 스냅샷 ID
   * @throws {Error} 스냅샷을 찾을 수 없는 경우
   *
   * @example
   * manager.restore(snapshotId);
   */
  restore(snapshotId) {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);

    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    // 현재 상태를 스냅샷 상태로 완전 교체
    this.state = new Map(snapshot.state);
  }

  /**
   * 모든 스냅샷 목록
   *
   * @returns {Array} 스냅샷 목록 (id, timestamp 포함)
   *
   * @example
   * const snapshots = manager.listSnapshots();
   */
  listSnapshots() {
    return this.snapshots.map(s => ({
      id: s.id,
      timestamp: s.timestamp,
    }));
  }
}

module.exports = { StateManager };
