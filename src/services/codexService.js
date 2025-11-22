/**
 * codexService.js
 * Codex AI CLI 서비스 래퍼
 *
 * @module codexService
 * @description Codex CLI를 실행하고 응답을 처리합니다.
 */

const { spawn } = require('child_process');

/**
 * CodexService 클래스
 * Codex CLI 실행 및 응답 처리
 */
class CodexService {
  constructor(options = {}) {
    this.cliCommand = options.cliCommand || 'codex';
    this.defaultTimeout = options.timeout || 30000; // 30초
  }

  /**
   * Codex CLI 실행
   *
   * @param {string} prompt - 실행할 프롬프트
   * @param {Object} options - 실행 옵션
   * @param {number} options.timeout - 타임아웃 (ms)
   * @param {boolean} options.yolo - YOLO 모드 (자동 승인)
   * @returns {Promise<string>} CLI 실행 결과
   * @throws {Error} 실행 실패 시
   *
   * @example
   * const result = await service.execute('Review code', { yolo: true });
   */
  async execute(prompt, options = {}) {
    // 프롬프트 검증
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: must be a non-empty string');
    }

    const timeout = options.timeout || this.defaultTimeout;
    const yolo = options.yolo || false;

    return new Promise((resolve, reject) => {
      const args = [prompt];

      // YOLO 플래그 추가
      if (yolo) {
        args.unshift('--yolo');
      }

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
        reject(new Error(`Codex CLI execution timeout after ${timeout}ms`));
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
          reject(new Error(`Codex CLI failed with code ${code}: ${stderr}`));
        }
      });

      // 프로세스 에러 처리
      process.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to spawn Codex CLI: ${error.message}`));
      });
    });
  }
}

module.exports = { CodexService };
