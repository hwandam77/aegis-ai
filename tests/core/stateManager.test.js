// tests/core/stateManager.test.js

const { StateManager } = require('../../src/core/stateManager');

describe('StateManager', () => {
  let manager;

  beforeEach(() => {
    manager = new StateManager();
  });

  describe('setState와 getState', () => {
    test('상태 설정 및 조회', () => {
      // Given & When
      manager.setState('user', { name: 'test' });

      // Then
      expect(manager.getState('user')).toEqual({ name: 'test' });
    });

    test('존재하지 않는 상태 조회 시 undefined', () => {
      // When
      const result = manager.getState('nonexistent');

      // Then
      expect(result).toBeUndefined();
    });

    test('동일한 키로 상태 덮어쓰기', () => {
      // Given
      manager.setState('count', 1);

      // When
      manager.setState('count', 2);

      // Then
      expect(manager.getState('count')).toBe(2);
    });
  });

  describe('hasState', () => {
    test('상태 존재 여부 확인', () => {
      // Given
      manager.setState('exists', 'value');

      // Then
      expect(manager.hasState('exists')).toBe(true);
      expect(manager.hasState('notexists')).toBe(false);
    });
  });

  describe('removeState', () => {
    test('특정 상태 제거', () => {
      // Given
      manager.setState('toRemove', 'value');
      expect(manager.hasState('toRemove')).toBe(true);

      // When
      manager.removeState('toRemove');

      // Then
      expect(manager.hasState('toRemove')).toBe(false);
    });

    test('존재하지 않는 상태 제거 (에러 없음)', () => {
      // When & Then
      expect(() => {
        manager.removeState('nonexistent');
      }).not.toThrow();
    });
  });

  describe('clearState', () => {
    test('모든 상태 제거', () => {
      // Given
      manager.setState('key1', 'value1');
      manager.setState('key2', 'value2');
      expect(manager.hasState('key1')).toBe(true);

      // When
      manager.clearState();

      // Then
      expect(manager.hasState('key1')).toBe(false);
      expect(manager.hasState('key2')).toBe(false);
    });
  });

  describe('snapshot과 restore', () => {
    test('스냅샷 생성 및 복원', () => {
      // Given
      manager.setState('key1', 'value1');
      manager.setState('key2', 'value2');

      // When
      const snapshotId = manager.snapshot();
      manager.setState('key1', 'changed');
      manager.restore(snapshotId);

      // Then
      expect(manager.getState('key1')).toBe('value1');
      expect(manager.getState('key2')).toBe('value2');
    });

    test('빈 상태에서 스냅샷 생성', () => {
      // When
      const snapshotId = manager.snapshot();

      // Then
      expect(snapshotId).toBeDefined();
      const snapshots = manager.listSnapshots();
      expect(snapshots).toHaveLength(1);
    });

    test('존재하지 않는 스냅샷 복원 시 에러', () => {
      // When & Then
      expect(() => {
        manager.restore('nonexistent-id');
      }).toThrow('Snapshot not found');
    });

    test('스냅샷에 ID와 timestamp 포함', () => {
      // When
      const snapshotId = manager.snapshot();
      const snapshots = manager.listSnapshots();

      // Then
      expect(snapshots[0]).toHaveProperty('id', snapshotId);
      expect(snapshots[0]).toHaveProperty('timestamp');
      expect(typeof snapshots[0].timestamp).toBe('number');
    });

    test('스냅샷 한도 초과 시 오래된 것 삭제 (기본 10개)', () => {
      // Given
      for (let i = 0; i < 12; i++) {
        manager.setState(`key${i}`, `value${i}`);
        manager.snapshot();
      }

      // Then
      const snapshots = manager.listSnapshots();
      expect(snapshots.length).toBeLessThanOrEqual(10);
    });
  });

  describe('listSnapshots', () => {
    test('모든 스냅샷 목록 조회', () => {
      // Given
      const id1 = manager.snapshot();
      const id2 = manager.snapshot();

      // When
      const snapshots = manager.listSnapshots();

      // Then
      expect(snapshots).toHaveLength(2);
      expect(snapshots.map(s => s.id)).toContain(id1);
      expect(snapshots.map(s => s.id)).toContain(id2);
    });

    test('스냅샷 없을 때 빈 배열', () => {
      // When
      const snapshots = manager.listSnapshots();

      // Then
      expect(snapshots).toEqual([]);
    });
  });
});
