/**
 * qwenService.js
 * Qwen AI CLI 서비스 래퍼
 *
 * @module qwenService
 * @description Qwen CLI를 실행하고 응답을 처리합니다.
 */

const { spawn } = require('child_process');

/**
 * QwenService 클래스
 * Qwen CLI 실행 및 응답 처리
 */
class QwenService {
  constructor(options = {}) {
    this.cliCommand = options.cliCommand || 'qwen';
    this.defaultTimeout = options.timeout || 30000; // 30초
  }

  /**
   * Qwen CLI 실행
   *
   * @param {string} prompt - 실행할 프롬프트
   * @param {Object} options - 실행 옵션
   * @param {number} options.timeout - 타임아웃 (ms)
   * @returns {Promise<string>} CLI 실행 결과
   * @throws {Error} 실행 실패 시
   *
   * @example
   * const result = await service.execute('Generate code');
   */
  async execute(prompt, options = {}) {
    // 프롬프트 검증
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: must be a non-empty string');
    }

    const timeout = options.timeout || this.defaultTimeout;

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
        reject(new Error(`Qwen CLI execution timeout after ${timeout}ms`));
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
          reject(new Error(`Qwen CLI failed with code ${code}: ${stderr}`));
        }
      });

      // 프로세스 에러 처리
      process.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to spawn Qwen CLI: ${error.message}`));
      });
    });
  }
}

module.exports = { QwenService };
