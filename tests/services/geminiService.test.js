// tests/services/geminiService.test.js

const { spawn } = require('child_process');
const { GeminiService } = require('../../src/services/geminiService');

// Mock child_process
jest.mock('child_process');

describe('GeminiService', () => {
  let service;
  let mockProcess;

  beforeEach(() => {
    service = new GeminiService();
    jest.clearAllMocks();

    // Mock process 객체 생성
    mockProcess = {
      stdout: {
        on: jest.fn(),
        setEncoding: jest.fn(),
      },
      stderr: {
        on: jest.fn(),
      },
      on: jest.fn(),
    };

    spawn.mockReturnValue(mockProcess);
  });

  describe('execute', () => {
    test('Gemini CLI를 올바른 파라미터로 실행', async () => {
      // Given
      const prompt = 'Brainstorm AI ideas';

      // Mock 성공 응답
      mockProcess.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback('Gemini response');
        }
      });
      mockProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0); // exit code 0
        }
      });

      // When
      const result = await service.execute(prompt);

      // Then
      expect(spawn).toHaveBeenCalledWith(
        'gemini',
        expect.arrayContaining([prompt]),
        expect.any(Object)
      );
      expect(result).toContain('Gemini response');
    });

    test('CLI 실행 실패 시 에러 발생', async () => {
      // Given
      mockProcess.stderr.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback('Error occurred');
        }
      });
      mockProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(1); // exit code 1 (실패)
        }
      });

      // When & Then
      await expect(service.execute('test prompt')).rejects.toThrow();
    });

    test('타임아웃 처리', async () => {
      // Given
      const timeout = 100;

      // Mock kill 함수 추가
      mockProcess.kill = jest.fn();

      // Mock이 응답하지 않음 (타임아웃 시나리오)
      mockProcess.stdout.on.mockImplementation(() => {});
      mockProcess.stderr.on.mockImplementation(() => {});
      mockProcess.on.mockImplementation(() => {}); // close 이벤트가 호출되지 않음

      // When & Then
      await expect(
        service.execute('test', { timeout })
      ).rejects.toThrow('timeout');
      expect(mockProcess.kill).toHaveBeenCalled();
    }, 1000);

    test('빈 프롬프트 처리', async () => {
      // When & Then
      await expect(service.execute('')).rejects.toThrow('Invalid prompt');
    });
  });

  describe('retry logic', () => {
    test('실패 시 재시도', async () => {
      // Given
      let attemptCount = 0;

      // spawn이 여러 번 호출될 때마다 새로운 mock 반환
      spawn.mockImplementation(() => {
        attemptCount++;
        const mockProc = {
          stdout: { on: jest.fn(), setEncoding: jest.fn() },
          stderr: { on: jest.fn() },
          on: jest.fn(),
        };

        // 첫 2번은 실패, 3번째는 성공
        if (attemptCount < 3) {
          mockProc.on.mockImplementation((event, callback) => {
            if (event === 'close') callback(1); // 실패
          });
        } else {
          mockProc.stdout.on.mockImplementation((event, callback) => {
            if (event === 'data') callback('Success after retry');
          });
          mockProc.on.mockImplementation((event, callback) => {
            if (event === 'close') callback(0); // 성공
          });
        }

        return mockProc;
      });

      // When
      const result = await service.execute('test', { maxRetries: 2 });

      // Then
      expect(result).toContain('Success');
      expect(spawn).toHaveBeenCalledTimes(3);
    }, 15000);
  });

  describe('parameter validation', () => {
    test('프롬프트 파라미터 검증', async () => {
      // When & Then
      await expect(service.execute(null)).rejects.toThrow('Invalid prompt');
      await expect(service.execute(undefined)).rejects.toThrow('Invalid prompt');
      await expect(service.execute(123)).rejects.toThrow('Invalid prompt');
    });

    test('옵션 파라미터 기본값', async () => {
      // Given
      mockProcess.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') callback('result');
      });
      mockProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      // When
      await service.execute('test');

      // Then - 기본 옵션으로 실행되었는지 확인
      expect(spawn).toHaveBeenCalled();
    });
  });

  describe('response parsing', () => {
    test('다중 데이터 청크 처리', async () => {
      // Given
      const chunks = ['chunk1', 'chunk2', 'chunk3'];
      let chunkIndex = 0;

      mockProcess.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          chunks.forEach(chunk => callback(chunk));
        }
      });
      mockProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      // When
      const result = await service.execute('test');

      // Then
      expect(result).toContain('chunk1');
      expect(result).toContain('chunk2');
      expect(result).toContain('chunk3');
    });
  });

  describe('process error handling', () => {
    test('프로세스 spawn 실패 처리 (라인 112-113)', async () => {
      // Given
      mockProcess.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(new Error('ENOENT: command not found'));
        }
      });

      // When & Then
      await expect(service.execute('test')).rejects.toThrow('Failed to spawn Gemini CLI');
    });
  });
});
