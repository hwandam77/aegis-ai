/**
 * index.js
 * Aegis AI MCP Server 진입점
 *
 * @module index
 * @description MCP (Model Context Protocol) 서버의 메인 진입점
 */

const { handlerLoader } = require('./core/handlerLoader');

/**
 * MCP Server 클래스
 * JSON-RPC 2.0 기반 MCP 프로토콜 구현
 */
class MCPServer {
  constructor(options = {}) {
    this.transport = options.transport;
    this.tools = new Map();
    this.initialized = false;

    // 기본 도구 등록
    this._registerDefaultTools();
  }

  /**
   * 기본 도구 등록
   * @private
   */
  _registerDefaultTools() {
    // Gemini CLI 도구
    this.tools.set('gemini_cli', {
      name: 'gemini_cli',
      description: 'Execute Gemini CLI with prompts',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
        },
        required: ['prompt'],
      },
    });

    // Qwen CLI 도구
    this.tools.set('qwen_cli', {
      name: 'qwen_cli',
      description: 'Execute Qwen CLI for code generation',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
        },
        required: ['prompt'],
      },
    });

    // Codex CLI 도구
    this.tools.set('codex_cli', {
      name: 'codex_cli',
      description: 'Execute Codex CLI for code review',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
        },
        required: ['prompt'],
      },
    });
  }

  /**
   * JSON-RPC 요청 처리
   *
   * @param {Object} request - JSON-RPC 요청
   * @returns {Promise<Object>} JSON-RPC 응답
   */
  async handleRequest(request) {
    try {
      // JSON-RPC 버전 검증
      if (request.jsonrpc !== '2.0') {
        return this._errorResponse(request.id, -32600, 'Invalid Request: jsonrpc must be 2.0');
      }

      // 메서드별 라우팅
      switch (request.method) {
        case 'tools/list':
          return this._handleToolsList(request);

        case 'tools/call':
          return this._handleToolsCall(request);

        case 'prompts/list':
          return this._handlePromptsList(request);

        case 'resources/list':
          return this._handleResourcesList(request);

        default:
          return this._errorResponse(request.id, -32601, `Method not found: ${request.method}`);
      }
    } catch (error) {
      return this._errorResponse(request.id, -32603, `Internal error: ${error.message}`);
    }
  }

  /**
   * Raw JSON 문자열 요청 처리
   *
   * @param {string} jsonString - JSON 문자열
   * @returns {Promise<Object>} JSON-RPC 응답
   */
  async handleRawRequest(jsonString) {
    try {
      const request = JSON.parse(jsonString);
      return await this.handleRequest(request);
    } catch (error) {
      return this._errorResponse(null, -32700, 'Parse error: Invalid JSON');
    }
  }

  /**
   * tools/list 처리
   * @private
   */
  async _handleToolsList(request) {
    const tools = Array.from(this.tools.values());

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        tools,
      },
    };
  }

  /**
   * tools/call 처리
   * @private
   */
  async _handleToolsCall(request) {
    const { name, arguments: args } = request.params || {};

    // 파라미터 검증
    if (!name) {
      return this._errorResponse(request.id, -32602, 'Invalid params: name is required');
    }

    // 도구 존재 확인
    if (!this.tools.has(name)) {
      return this._errorResponse(request.id, -32602, `Invalid params: tool '${name}' not found`);
    }

    // 도구 실행 (실제 구현은 서비스 레이어에서)
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        content: [
          {
            type: 'text',
            text: `Tool ${name} executed successfully`,
          },
        ],
      },
    };
  }

  /**
   * prompts/list 처리
   * @private
   */
  async _handlePromptsList(request) {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        prompts: [],
      },
    };
  }

  /**
   * resources/list 처리
   * @private
   */
  async _handleResourcesList(request) {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        resources: [],
      },
    };
  }

  /**
   * 에러 응답 생성
   * @private
   */
  _errorResponse(id, code, message) {
    return {
      jsonrpc: '2.0',
      id: id || null,
      error: {
        code,
        message,
      },
    };
  }
}

module.exports = { MCPServer };
