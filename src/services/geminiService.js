/**
 * geminiService.js
 * Gemini AI CLI 서비스 래퍼
 *
 * @module geminiService
 * @description Gemini CLI를 실행하고 응답을 처리합니다.
 */

const { spawn } = require('child_process');

/**
 * GeminiService 클래스
 * Gemini CLI 실행 및 응답 처리
 */
class GeminiService {
  constructor(options = {}) {
    this.cliCommand = options.cliCommand || 'gemini';
    this.defaultTimeout = options.timeout || 30000; // 30초
    this.maxRetries = options.maxRetries || 0; // 기본값: 재시도 없음
  }

  /**
   * Gemini CLI 실행
   *
   * @param {string} prompt - 실행할 프롬프트
   * @param {Object} options - 실행 옵션
   * @param {number} options.timeout - 타임아웃 (ms)
   * @param {number} options.maxRetries - 최대 재시도 횟수
   * @returns {Promise<string>} CLI 실행 결과
   * @throws {Error} 실행 실패 시
   *
   * @example
   * const result = await service.execute('Brainstorm ideas');
   */
  async execute(prompt, options = {}) {
    // 프롬프트 검증
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: must be a non-empty string');
    }

    const timeout = options.timeout || this.defaultTimeout;
    const maxRetries = options.maxRetries !== undefined ? options.maxRetries : this.maxRetries;

    let lastError;

    // 재시도 로직
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this._executeOnce(prompt, timeout);
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          // 재시도 전 대기 (exponential backoff)
          await this._sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // 모든 재시도 실패
    throw lastError;
  }

  /**
   * CLI 단일 실행 (내부 메서드)
   *
   * @private
   * @param {string} prompt - 프롬프트
   * @param {number} timeout - 타임아웃
   * @returns {Promise<string>} 실행 결과
   */
  async _executeOnce(prompt, timeout) {
    return new Promise((resolve, reject) => {
      const args = [prompt];
      let stdout = '';
      let stderr = '';
      let timeoutId;

      // CLI 프로세스 실행
      const process = spawn(this.cliCommand, args, {
        shell: true,
      });

      // 타임아웃 설정
      timeoutId = setTimeout(() => {
        process.kill();
        reject(new Error(`Gemini CLI execution timeout after ${timeout}ms`));
      }, timeout);

      // stdout 데이터 수집
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      // stderr 데이터 수집
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // 프로세스 종료 처리
      process.on('close', (code) => {
        clearTimeout(timeoutId);

        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Gemini CLI failed with code ${code}: ${stderr}`));
        }
      });

      // 프로세스 에러 처리
      process.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to spawn Gemini CLI: ${error.message}`));
      });
    });
  }

  /**
   * 지연 유틸리티
   *
   * @private
   * @param {number} ms - 대기 시간 (밀리초)
   * @returns {Promise<void>}
   */
  async _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { GeminiService };
