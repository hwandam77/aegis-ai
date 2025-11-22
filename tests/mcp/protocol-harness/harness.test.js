// tests/mcp/protocol-harness/harness.test.js

const { MockTransport } = require('./mock-transport');
const { MCPServer } = require('../../../src/index');

describe('MCP Protocol Harness', () => {
  let transport;
  let server;

  beforeEach(() => {
    transport = new MockTransport();
    server = new MCPServer({ transport });
  });

  describe('JSON-RPC 2.0 기본 구조', () => {
    test('유효한 요청 형식 검증', async () => {
      // Given
      const request = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 1,
      };

      // When
      const response = await server.handleRequest(request);

      // Then
      expect(response).toHaveProperty('jsonrpc', '2.0');
      expect(response).toHaveProperty('id', 1);
      expect(response).toHaveProperty('result');
    });

    test('잘못된 jsonrpc 버전 거부', async () => {
      // Given
      const request = {
        jsonrpc: '1.0',
        method: 'tools/list',
        id: 1,
      };

      // When
      const response = await server.handleRequest(request);

      // Then
      expect(response).toHaveProperty('error');
      expect(response.error.code).toBe(-32600); // Invalid Request
    });
  });

  describe('tools/list 엔드포인트', () => {
    test('모든 도구 목록 반환', async () => {
      // Given
      const request = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 1,
      };

      // When
      const response = await server.handleRequest(request);

      // Then
      expect(response.result).toHaveProperty('tools');
      expect(Array.isArray(response.result.tools)).toBe(true);
    });

    test('도구에 name과 description 포함', async () => {
      // Given
      const request = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 1,
      };

      // When
      const response = await server.handleRequest(request);

      // Then
      const tools = response.result.tools;
      if (tools.length > 0) {
        expect(tools[0]).toHaveProperty('name');
        expect(tools[0]).toHaveProperty('description');
      }
    });
  });

  describe('tools/call 엔드포인트', () => {
    test('도구 실행 요청 처리', async () => {
      // Given
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'gemini_cli',
          arguments: { prompt: 'test' },
        },
        id: 2,
      };

      // When
      const response = await server.handleRequest(request);

      // Then
      expect(response).toHaveProperty('result');
      expect(response.id).toBe(2);
    });

    test('존재하지 않는 도구 호출 시 에러', async () => {
      // Given
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'nonexistent_tool',
          arguments: {},
        },
        id: 3,
      };

      // When
      const response = await server.handleRequest(request);

      // Then
      expect(response).toHaveProperty('error');
      expect(response.error.code).toBe(-32602); // Invalid params
    });
  });

  describe('에러 코드 검증', () => {
    test('Method not found (-32601)', async () => {
      // Given
      const request = {
        jsonrpc: '2.0',
        method: 'invalid/method',
        id: 4,
      };

      // When
      const response = await server.handleRequest(request);

      // Then
      expect(response.error.code).toBe(-32601);
    });

    test('Parse error (-32700)', async () => {
      // Given
      const invalidJson = 'not a json';

      // When
      const response = await server.handleRawRequest(invalidJson);

      // Then
      expect(response.error.code).toBe(-32700);
    });

    test('Invalid params (-32602)', async () => {
      // Given
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {}, // name 누락
        id: 5,
      };

      // When
      const response = await server.handleRequest(request);

      // Then
      expect(response.error.code).toBe(-32602);
    });
  });

  describe('prompts/list 엔드포인트', () => {
    test('프롬프트 목록 반환', async () => {
      // Given
      const request = {
        jsonrpc: '2.0',
        method: 'prompts/list',
        id: 6,
      };

      // When
      const response = await server.handleRequest(request);

      // Then
      expect(response.result).toHaveProperty('prompts');
      expect(Array.isArray(response.result.prompts)).toBe(true);
    });
  });

  describe('resources/list 엔드포인트', () => {
    test('리소스 목록 반환', async () => {
      // Given
      const request = {
        jsonrpc: '2.0',
        method: 'resources/list',
        id: 7,
      };

      // When
      const response = await server.handleRequest(request);

      // Then
      expect(response.result).toHaveProperty('resources');
      expect(Array.isArray(response.result.resources)).toBe(true);
    });
  });

  describe('handleRawRequest', () => {
    test('JSON 문자열 요청 처리', async () => {
      // Given
      const jsonString = JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 8,
      });

      // When
      const response = await server.handleRawRequest(jsonString);

      // Then
      expect(response).toHaveProperty('result');
      expect(response.id).toBe(8);
    });
  });

  describe('Internal Error 처리', () => {
    test('handleRequest 내부 예외 발생 시 -32603', async () => {
      // Given
      // handleRequest를 오버라이드해서 예외 발생시킴
      const originalHandle = server._handleToolsList;
      server._handleToolsList = () => {
        throw new Error('Internal crash');
      };

      const request = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 9,
      };

      // When
      const response = await server.handleRequest(request);

      // Then
      expect(response.error.code).toBe(-32603);
      expect(response.error.message).toContain('Internal error');

      // 복원
      server._handleToolsList = originalHandle;
    });
  });

  describe('MockTransport 동작', () => {
    test('전송된 메시지 추적', async () => {
      // Given
      const message = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 1,
      };

      // When
      await transport.send(message);

      // Then
      expect(transport.getSentMessages()).toHaveLength(1);
      expect(transport.getSentMessages()[0]).toEqual(message);
    });

    test('Mock 응답 설정', async () => {
      // Given
      transport.mockResponse('tools/list', {
        tools: [{ name: 'test_tool' }],
      });

      // When
      const response = await transport.send({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 1,
      });

      // Then
      expect(response.result.tools).toHaveLength(1);
    });

    test('상태 초기화', () => {
      // Given
      transport.send({ method: 'test' });

      // When
      transport.clear();

      // Then
      expect(transport.getSentMessages()).toHaveLength(0);
    });
  });
});
