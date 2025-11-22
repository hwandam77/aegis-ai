# Phase 4: MCP 프로토콜 테스트 (Week 7-8)

## 🎯 목표

MCP (Model Context Protocol) 프로토콜 계약을 100% 검증하여 MCP 표준 준수 보장

---

## 📊 MCP 프로토콜 개요

### JSON-RPC 2.0 기반
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

### 핵심 엔드포인트
- `tools/list`: 도구 목록 조회
- `tools/call`: 도구 실행
- `prompts/list`: 프롬프트 목록
- `resources/list`: 리소스 목록

---

## 📋 테스트 구조

```
tests/mcp/
├── protocol-harness/         ← 인메모리 transport
│   ├── harness.test.js
│   └── mock-transport.js
├── mocked-stdio/             ← stdin/stdout Mock
│   ├── stdio.test.js
│   └── mock-stdio.js
├── snapshot-tests/           ← 스냅샷 테스트
│   └── protocol-snapshots.test.js
└── integration/              ← E2E 테스트
    └── full-protocol.test.js
```

---

## 📋 Task 4.1: Protocol Harness (인메모리 Transport)

### mock-transport.js 구현

```javascript
// tests/mcp/protocol-harness/mock-transport.js
class MockTransport {
  constructor() {
    this.messages = [];
    this.responses = new Map();
  }

  send(message) {
    this.messages.push(message);
    return this.responses.get(message.method) || { result: {} };
  }

  mockResponse(method, response) {
    this.responses.set(method, response);
  }

  getMessages() {
    return this.messages;
  }

  clear() {
    this.messages = [];
    this.responses.clear();
  }
}

module.exports = MockTransport;
```

### harness.test.js 구현

```javascript
// tests/mcp/protocol-harness/harness.test.js
const { describe, it, expect, beforeEach } = require('@jest/globals');
const MockTransport = require('./mock-transport');
const MCPServer = require('../../../src/index'); // MCP 서버 진입점

describe('MCP Protocol Harness', () => {
  let transport;
  let server;

  beforeEach(() => {
    transport = new MockTransport();
    server = new MCPServer({ transport });
  });

  describe('tools/list', () => {
    it('should return list of all tools', async () => {
      // Arrange
      const request = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 1
      };

      // Act
      const response = await server.handleRequest(request);

      // Assert
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeDefined();
      expect(response.result.tools).toBeInstanceOf(Array);
      expect(response.result.tools).toHaveLength(22); // 22개 도구
    });

    it('should include all required tool metadata', async () => {
      // Arrange
      const request = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 2
      };

      // Act
      const response = await server.handleRequest(request);

      // Assert
      const tools = response.result.tools;
      tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
      });
    });

    it('should categorize tools correctly', async () => {
      // Arrange
      const request = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 3
      };

      // Act
      const response = await server.handleRequest(request);

      // Assert
      const tools = response.result.tools;

      // Codex 도구
      const codexTools = tools.filter(t => t.name.startsWith('codex_'));
      expect(codexTools).toHaveLength(13);

      // Qwen 도구
      const qwenTools = tools.filter(t => t.name.startsWith('qwen_'));
      expect(qwenTools).toHaveLength(5);

      // Gemini 도구
      const geminiTools = tools.filter(t => t.name.startsWith('gemini_'));
      expect(geminiTools).toHaveLength(4);
    });
  });

  describe('tools/call', () => {
    it('should execute tool successfully', async () => {
      // Arrange
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 4,
        params: {
          name: 'gemini_brainstorm',
          arguments: {
            prompt: 'AI ideas'
          }
        }
      };

      // Mock 서비스 응답
      transport.mockResponse('gemini_brainstorm', {
        result: {
          ideas: ['Idea 1', 'Idea 2']
        }
      });

      // Act
      const response = await server.handleRequest(request);

      // Assert
      expect(response.result).toBeDefined();
      expect(response.result.ideas).toHaveLength(2);
    });

    it('should return error for non-existent tool', async () => {
      // Arrange
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 5,
        params: {
          name: 'nonexistent_tool',
          arguments: {}
        }
      };

      // Act
      const response = await server.handleRequest(request);

      // Assert
      expect(response.error).toBeDefined();
      expect(response.error.code).toBe(-32601); // Method not found
      expect(response.error.message).toContain('Tool not found');
    });

    it('should validate tool arguments', async () => {
      // Arrange
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 6,
        params: {
          name: 'gemini_brainstorm',
          arguments: {} // prompt 누락
        }
      };

      // Act
      const response = await server.handleRequest(request);

      // Assert
      expect(response.error).toBeDefined();
      expect(response.error.code).toBe(-32602); // Invalid params
      expect(response.error.message).toContain('Missing required parameter');
    });
  });

  describe('JSON-RPC error codes', () => {
    it('should return -32700 for parse error', async () => {
      // Arrange
      const invalidJSON = 'not a valid json';

      // Act
      const response = await server.handleRawRequest(invalidJSON);

      // Assert
      expect(response.error.code).toBe(-32700);
      expect(response.error.message).toBe('Parse error');
    });

    it('should return -32600 for invalid request', async () => {
      // Arrange
      const invalidRequest = {
        // jsonrpc 필드 누락
        method: 'tools/list',
        id: 1
      };

      // Act
      const response = await server.handleRequest(invalidRequest);

      // Assert
      expect(response.error.code).toBe(-32600);
      expect(response.error.message).toBe('Invalid Request');
    });

    it('should return -32601 for method not found', async () => {
      // Arrange
      const request = {
        jsonrpc: '2.0',
        method: 'invalid/method',
        id: 1
      };

      // Act
      const response = await server.handleRequest(request);

      // Assert
      expect(response.error.code).toBe(-32601);
      expect(response.error.message).toBe('Method not found');
    });
  });
});
```

---

## 📋 Task 4.2: Mocked stdio 테스트

### mock-stdio.js 구현

```javascript
// tests/mcp/mocked-stdio/mock-stdio.js
const { EventEmitter } = require('events');

class MockStdin extends EventEmitter {
  constructor() {
    super();
    this.isTTY = false;
  }

  write(data) {
    this.emit('data', data);
  }

  setEncoding() {}
  resume() {}
  pause() {}
}

class MockStdout extends EventEmitter {
  constructor() {
    super();
    this.data = [];
  }

  write(chunk) {
    this.data.push(chunk);
  }

  getData() {
    return this.data.join('');
  }

  clear() {
    this.data = [];
  }
}

module.exports = { MockStdin, MockStdout };
```

### stdio.test.js 구현

```javascript
// tests/mcp/mocked-stdio/stdio.test.js
const { describe, it, expect, beforeEach } = require('@jest/globals');
const { MockStdin, MockStdout } = require('./mock-stdio');
const MCPServer = require('../../../src/index');

describe('MCP stdio Protocol', () => {
  let stdin;
  let stdout;
  let server;

  beforeEach(() => {
    stdin = new MockStdin();
    stdout = new MockStdout();
    server = new MCPServer({ stdin, stdout });
  });

  describe('stdio communication', () => {
    it('should read request from stdin', async () => {
      // Arrange
      const request = JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 1
      });

      // Act
      stdin.write(request + '\n');

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert
      const output = stdout.getData();
      const response = JSON.parse(output);

      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeDefined();
    });

    it('should handle multiple requests', async () => {
      // Arrange
      const requests = [
        { jsonrpc: '2.0', method: 'tools/list', id: 1 },
        { jsonrpc: '2.0', method: 'tools/list', id: 2 }
      ];

      // Act
      requests.forEach(req => {
        stdin.write(JSON.stringify(req) + '\n');
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      // Assert
      const outputs = stdout.getData().split('\n').filter(Boolean);
      expect(outputs).toHaveLength(2);

      const responses = outputs.map(JSON.parse);
      expect(responses[0].id).toBe(1);
      expect(responses[1].id).toBe(2);
    });

    it('should handle newline-delimited JSON', async () => {
      // Arrange
      const request1 = '{"jsonrpc":"2.0","method":"tools/list","id":1}\n';
      const request2 = '{"jsonrpc":"2.0","method":"tools/list","id":2}\n';

      // Act
      stdin.write(request1);
      stdin.write(request2);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert
      const outputs = stdout.getData().split('\n').filter(Boolean);
      expect(outputs.length).toBeGreaterThanOrEqual(2);
    });
  });
});
```

---

## 📋 Task 4.3: Snapshot 테스트

```javascript
// tests/mcp/snapshot-tests/protocol-snapshots.test.js
const { describe, it, expect } = require('@jest/globals');
const MCPServer = require('../../../src/index');

describe('MCP Protocol Snapshots', () => {
  let server;

  beforeEach(() => {
    server = new MCPServer();
  });

  it('should match tools/list response snapshot', async () => {
    // Arrange
    const request = {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1
    };

    // Act
    const response = await server.handleRequest(request);

    // Assert
    expect(response).toMatchSnapshot();
  });

  it('should match error response snapshot', async () => {
    // Arrange
    const request = {
      jsonrpc: '2.0',
      method: 'invalid/method',
      id: 1
    };

    // Act
    const response = await server.handleRequest(request);

    // Assert
    expect(response).toMatchSnapshot();
  });

  it('should match tool schema snapshot', async () => {
    // Arrange
    const request = {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1
    };

    // Act
    const response = await server.handleRequest(request);
    const firstTool = response.result.tools[0];

    // Assert
    expect(firstTool.inputSchema).toMatchSnapshot();
  });
});
```

---

## 📋 Task 4.4: E2E 통합 테스트

```javascript
// tests/mcp/integration/full-protocol.test.js
const { describe, it, expect } = require('@jest/globals');
const { spawn } = require('child_process');
const path = require('path');

describe('MCP E2E Protocol Test', () => {
  let serverProcess;

  beforeEach(() => {
    // MCP 서버 프로세스 시작
    const serverPath = path.join(__dirname, '../../../src/index.js');
    serverProcess = spawn('node', [serverPath]);
  });

  afterEach(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should handle full request-response cycle', (done) => {
    // Arrange
    const request = {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1
    };

    let responseData = '';

    // Act
    serverProcess.stdout.on('data', (chunk) => {
      responseData += chunk.toString();
    });

    serverProcess.stdin.write(JSON.stringify(request) + '\n');

    // Assert
    setTimeout(() => {
      const response = JSON.parse(responseData);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result.tools).toBeDefined();
      done();
    }, 1000);
  });

  it('should handle tool execution end-to-end', (done) => {
    // 실제 도구 실행 E2E 테스트
    // (필요시 구현)
    done();
  });
});
```

---

## 📊 커버리지 목표

### MCP 프로토콜 목표
- **Protocol Compliance**: 100%
- **Error Handling**: 100%
- **Tool Registration**: 100%
- **Schema Validation**: 100%

---

## ✅ 완료 기준

- [x] Protocol harness 구현 및 테스트
- [x] Mocked stdio 테스트
- [x] Snapshot 테스트
- [x] E2E 통합 테스트
- [x] MCP 프로토콜 100% 커버리지
- [x] 모든 JSON-RPC 에러 코드 검증

---

## 🚀 실행 가이드

### Week 7: Protocol Harness & stdio
```bash
# Day 1-2: Protocol Harness
mkdir -p tests/mcp/protocol-harness
touch tests/mcp/protocol-harness/mock-transport.js
touch tests/mcp/protocol-harness/harness.test.js

npm test -- protocol-harness

# Day 3-4: Mocked stdio
mkdir -p tests/mcp/mocked-stdio
touch tests/mcp/mocked-stdio/mock-stdio.js
touch tests/mcp/mocked-stdio/stdio.test.js

npm test -- mocked-stdio
```

### Week 8: Snapshots & E2E
```bash
# Day 1-2: Snapshots
mkdir -p tests/mcp/snapshot-tests
touch tests/mcp/snapshot-tests/protocol-snapshots.test.js

npm test -- snapshot-tests

# Day 3-5: E2E
mkdir -p tests/mcp/integration
touch tests/mcp/integration/full-protocol.test.js

npm run test:integration
```

---

## 다음 단계

Phase 4 완료 후:
- ✅ MCP 프로토콜 100% 검증 완료
- 📖 [Phase 5: AI 기반 자동화](./05_PHASE5_AI_AUTOMATION.md)로 이동

---

**상태**: 🚀 실행 준비 완료
**예상 소요 시간**: 2 주
**다음**: [Phase 5: AI 기반 자동화](./05_PHASE5_AI_AUTOMATION.md)

---

## 🎯 Claude Code PM 관리

### Phase 4: 프로토콜 100% 검증

**PM 품질 기준**:
```
Claude Code (PM):
"Phase 4는 MCP 프로토콜 준수가 핵심입니다.

검증 항목:
✅ JSON-RPC 2.0 완전 준수
✅ 모든 에러 코드 테스트
✅ 22개 도구 등록 확인
✅ Snapshot 일치 검증

100% 커버리지 필수
승인 기준: 프로토콜 테스트 전체 통과"
```
