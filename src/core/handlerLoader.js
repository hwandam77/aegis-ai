/**
 * handlerLoader.js
 * AI 핸들러를 동적으로 로드하고 관리하는 모듈
 *
 * @module handlerLoader
 * @description 핸들러 레지스트리를 관리하고 동적 로딩을 지원합니다.
 *
 * Handler Contract:
 * - Handler는 일반적으로 객체 또는 함수입니다
 * - ES6 모듈의 경우 default export를 사용합니다
 * - CommonJS 모듈의 경우 module.exports를 사용합니다
 */

const fs = require('fs');
const path = require('path');

// 핸들러 저장소
const handlers = new Map();

/**
 * 지정된 디렉토리에서 모든 핸들러 파일을 동적으로 로드
 *
 * @param {string} directory - 핸들러 디렉토리 경로
 * @returns {void}
 * @throws {Error} 치명적인 디렉토리 읽기 오류가 발생하지 않음 (경고만 표시)
 *
 * @example
 * loadHandlers('./handlers');
 * // handlers/ 디렉토리의 모든 .js 파일을 로드
 */
function loadHandlers(directory) {
  try {
    const files = fs.readdirSync(directory);

    // JavaScript 파일만 필터링
    const jsFiles = files.filter(file => file.endsWith('.js'));

    jsFiles.forEach(file => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      // 디렉토리가 아닌 파일만 처리
      if (!stat.isDirectory()) {
        try {
          const handler = require(path.resolve(filePath));
          const handlerName = path.basename(file, '.js');

          // 핸들러 등록
          handlers.set(handlerName, handler.default || handler);
        } catch (error) {
          // 개별 핸들러 로드 실패는 무시하고 계속 진행
          console.warn(`Failed to load handler ${file}:`, error.message);
        }
      }
    });
  } catch (error) {
    // 디렉토리가 존재하지 않거나 읽을 수 없는 경우 빈 배열 반환
    console.warn(`Failed to read directory ${directory}:`, error.message);
  }
}

/**
 * 개별 핸들러를 수동으로 등록
 *
 * @param {string} name - 핸들러 이름
 * @param {Object|Function} handler - 핸들러 객체 또는 함수
 * @throws {Error} 동일한 이름의 핸들러가 이미 존재하는 경우
 *
 * @example
 * registerHandler('customHandler', { execute: () => {} });
 */
function registerHandler(name, handler) {
  if (handlers.has(name)) {
    throw new Error(`Handler already exists: ${name}`);
  }

  // 핸들러 유효성 검사
  if (handler === null || handler === undefined) {
    throw new Error(`Handler cannot be null or undefined: ${name}`);
  }

  handlers.set(name, handler);
}

/**
 * 이름으로 핸들러 조회
 *
 * @param {string} name - 핸들러 이름
 * @returns {Object|Function|null} 핸들러 객체/함수 또는 null
 *
 * @example
 * const handler = getHandler('myHandler');
 * if (handler) {
 *   // 핸들러 사용
 * }
 */
function getHandler(name) {
  return handlers.get(name) || null;
}

/**
 * 등록된 모든 핸들러 목록 반환
 *
 * @returns {string[]} 핸들러 이름 배열
 *
 * @example
 * const allHandlers = listHandlers();
 * console.log(allHandlers); // ['handler1', 'handler2', ...]
 */
function listHandlers() {
  return Array.from(handlers.keys());
}

/**
 * 모든 등록된 핸들러를 제거 (테스트 격리용)
 *
 * @returns {void}
 *
 * @example
 * // 테스트에서 사용
 * afterEach(() => {
 *   clearHandlers();
 * });
 */
function clearHandlers() {
  handlers.clear();
}

module.exports = {
  loadHandlers,
  registerHandler,
  getHandler,
  listHandlers,
  clearHandlers,
};
