// tests/core/handlerLoader.test.js

const fs = require('fs');
const path = require('path');
const handlerLoader = require('../../src/core/handlerLoader');

// Mock 파일 시스템
jest.mock('fs');
jest.mock('path');

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
    // TODO: 파일 시스템 모킹 개선 필요
    test.skip('디렉토리에서 핸들러 동적 로드 (성공)', () => {
      // Given
      const dirPath = 'test-handlers';
      const mockFiles = ['handlerA.js', 'handlerB.js'];
      fs.readdirSync.mockReturnValue(mockFiles);
      fs.statSync.mockImplementation((filePath) => {
        return { isDirectory: () => false };
      });
      jest.mock('../../src/test-handlers/handlerA', () => ({
        default: { name: 'handlerA', execute: jest.fn() }
      }));
      jest.mock('../../src/test-handlers/handlerB', () => ({
        default: { name: 'handlerB', execute: jest.fn() }
      }));

      // When
      handlerLoaderInstance.loadHandlers(dirPath);

      // Then
      const handlers = handlerLoaderInstance.listHandlers();
      expect(handlers).toEqual(['handlerA', 'handlerB']);
    });

    // TODO: 파일 시스템 모킹 개선 필요
    test.skip('JavaScript 파일만 필터링', () => {
      // Given
      const dirPath = 'mixed-handlers';
      const mockFiles = ['handlerC.js', 'config.json', 'README.md'];
      fs.readdirSync.mockReturnValue(mockFiles);
      fs.statSync.mockImplementation((filePath) => {
        return { isDirectory: () => false };
      });
      jest.mock('../../src/mixed-handlers/handlerC', () => ({
        default: { name: 'handlerC', execute: jest.fn() }
      }));

      // When
      handlerLoaderInstance.loadHandlers(dirPath);

      // Then
      const handlers = handlerLoaderInstance.listHandlers();
      expect(handlers).toEqual(['handlerC']);
    });

    test('존재하지 않는 디렉토리 (Edge case)', () => {
      // Given
      const dirPath = 'non-existent-dir';
      fs.readdirSync.mockImplementation(() => {
        throw new Error('No such file or directory');
      });

      // When
      handlerLoaderInstance.loadHandlers(dirPath);

      // Then
      const handlers = handlerLoaderInstance.listHandlers();
      expect(handlers).toEqual([]);
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
