// tests/core/handlerLoader.test.js

const path = require('path');
const handlerLoader = require('../../src/core/handlerLoader');

describe('handlerLoader', () => {
  let handlerLoaderInstance;

  beforeEach(() => {
    // 테스트 전에 모듈 캐시 및 Mock 초기화
    jest.clearAllMocks();

    // handlerLoader 모듈 로드
    handlerLoaderInstance = require('../../src/core/handlerLoader');

    // 핸들러 저장소 초기화 (테스트 격리)
    handlerLoaderInstance.clearHandlers();
  });

  afterEach(() => {
    // 테스트 후 상태 초기화
    handlerLoaderInstance.clearHandlers();
    jest.restoreAllMocks();
  });

  describe('loadHandlers 성공 케이스', () => {
    test('디렉토리에서 핸들러 동적 로드 (성공)', () => {
      // Given
      const dirPath = path.join(__dirname, '../fixtures/handlers-valid');

      // When
      handlerLoaderInstance.loadHandlers(dirPath);

      // Then
      const handlers = handlerLoaderInstance.listHandlers();
      expect(handlers).toContain('handlerA');
      expect(handlers).toContain('handlerB');
      expect(handlers).toHaveLength(2);
    });

    test('JavaScript 파일만 필터링', () => {
      // Given
      const dirPath = path.join(__dirname, '../fixtures/handlers-mixed');
      handlerLoaderInstance.clearHandlers(); // 이전 테스트 영향 제거

      // When
      handlerLoaderInstance.loadHandlers(dirPath);

      // Then
      const handlers = handlerLoaderInstance.listHandlers();
      expect(handlers).toEqual(['handlerC']);
      expect(handlers).not.toContain('config');
      expect(handlers).not.toContain('README');
    });

    test('존재하지 않는 디렉토리 (Edge case)', () => {
      // Given
      const dirPath = path.join(__dirname, '../fixtures/non-existent-dir');
      handlerLoaderInstance.clearHandlers();

      // When
      handlerLoaderInstance.loadHandlers(dirPath);

      // Then
      const handlers = handlerLoaderInstance.listHandlers();
      expect(handlers).toEqual([]);
    });

    test('로드된 핸들러가 실제로 실행 가능함', () => {
      // Given
      const dirPath = path.join(__dirname, '../fixtures/handlers-valid');
      handlerLoaderInstance.clearHandlers();

      // When
      handlerLoaderInstance.loadHandlers(dirPath);
      const handler = handlerLoaderInstance.getHandler('handlerA');

      // Then
      expect(handler).toBeDefined();
      expect(handler.execute).toBeDefined();
      expect(handler.execute()).toBe('Handler A executed');
    });
  });

  describe('registerHandler 성공 케이스', () => {
    test('핸들러 수동 등록 (성공)', () => {
      // Given
      const handlerName = 'myManualHandler';
      const handler = { execute: jest.fn() };

      // When
      handlerLoaderInstance.registerHandler(handlerName, handler);

      // Then
      const handlers = handlerLoaderInstance.listHandlers();
      expect(handlers).toEqual([handlerName]);
    });
  });

  describe('registerHandler 에러 케이스', () => {
    test('중복 핸들러 등록 시 에러', () => {
      // Given
      const handlerName = 'existingHandler';
      const handler = { execute: jest.fn() };
      handlerLoaderInstance.registerHandler(handlerName, handler);

      // When & Then
      expect(() => {
        handlerLoaderInstance.registerHandler(handlerName, handler);
      }).toThrow('Handler already exists');
    });
  });

  describe('getHandler 성공 케이스', () => {
    test('핸들러 조회 (성공)', () => {
      // Given
      const handlerName = 'searchableHandler';
      const handler = { name: handlerName, execute: jest.fn() };
      handlerLoaderInstance.registerHandler(handlerName, handler);

      // When
      const result = handlerLoaderInstance.getHandler(handlerName);

      // Then
      expect(result).toEqual(handler);
    });
  });

  describe('getHandler 에러 케이스', () => {
    test('존재하지 않는 핸들러 조회 (Edge case)', () => {
      // When
      const result = handlerLoaderInstance.getHandler('nonExistentHandler');

      // Then
      expect(result).toBeNull();
    });
  });

  describe('listHandlers 성공 케이스', () => {
    test('모든 핸들러 목록 조회', () => {
      // Given
      handlerLoaderInstance.registerHandler('handlerX', { execute: jest.fn() });
      handlerLoaderInstance.registerHandler('handlerY', { execute: jest.fn() });

      // When
      const handlers = handlerLoaderInstance.listHandlers();

      // Then
      expect(handlers).toEqual(['handlerX', 'handlerY']);
    });
  });

  describe('listHandlers Edge case', () => {
    test('빈 핸들러 목록 (Edge case)', () => {
      // When
      const handlers = handlerLoaderInstance.listHandlers();

      // Then
      expect(handlers).toEqual([]);
    });
  });

  describe('clearHandlers', () => {
    test('등록된 핸들러 모두 제거', () => {
      // Given
      handlerLoaderInstance.registerHandler('handler1', { execute: jest.fn() });
      handlerLoaderInstance.registerHandler('handler2', { execute: jest.fn() });
      expect(handlerLoaderInstance.listHandlers()).toHaveLength(2);

      // When
      handlerLoaderInstance.clearHandlers();

      // Then
      expect(handlerLoaderInstance.listHandlers()).toEqual([]);
    });
  });

  describe('registerHandler 유효성 검사', () => {
    test('null 핸들러 등록 시 에러', () => {
      expect(() => {
        handlerLoaderInstance.registerHandler('nullHandler', null);
      }).toThrow('Handler cannot be null or undefined');
    });

    test('undefined 핸들러 등록 시 에러', () => {
      expect(() => {
        handlerLoaderInstance.registerHandler('undefinedHandler', undefined);
      }).toThrow('Handler cannot be null or undefined');
    });
  });
});
