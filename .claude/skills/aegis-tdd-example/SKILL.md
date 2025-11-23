---
name: aegis-tdd-example
description: Aegis AI project-specific TDD examples and patterns. Use when working on this project to follow established patterns for handlers, services, and core modules with 99%+ coverage standards.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# 🛡️ Aegis TDD Example - Project Patterns

## Purpose

Provide Aegis AI project-specific TDD patterns and examples.

**Project Context**: 99.33% coverage, 105 tests, LEGENDARY level 👑

---

## 🎯 Project-Specific Standards

### Coverage Requirements

- **Core modules**: 95%+ (currently 98.81%)
- **Services**: 95%+ (currently 100%)
- **MCP**: 100% (currently 100%)

### Test Count

- Minimum 10 tests per module
- Edge cases mandatory
- Error handling 100% covered

---

## 📋 Established Patterns

### Pattern 1: Core Module (handlerLoader example)

**Test Structure**:
```javascript
describe('HandlerLoader', () => {
  let instance;

  beforeEach(() => {
    instance = require('../../src/core/handlerLoader');
    instance.clearHandlers();  // Isolation
  });

  // Use real fixtures instead of mocks
  test('loads handlers from directory', () => {
    const fixturesPath = path.join(__dirname, '../fixtures/handlers-valid');
    instance.loadHandlers(fixturesPath);
    expect(instance.listHandlers()).toContain('handlerA');
  });
});
```

**Key Points**:
- ✅ Use `clearHandlers()` for isolation
- ✅ Real fixtures over complex mocks
- ✅ Test actual file system operations

---

### Pattern 2: Service with Mocking (geminiService example)

**Mocking Strategy**:
```javascript
const { spawn } = require('child_process');
jest.mock('child_process');

describe('GeminiService', () => {
  let mockProcess;

  beforeEach(() => {
    mockProcess = {
      stdout: { on: jest.fn(), setEncoding: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn(),
      kill: jest.fn(),  // Important for timeout tests
    };
    spawn.mockReturnValue(mockProcess);
  });

  test('handles timeout correctly', async () => {
    mockProcess.on.mockImplementation(() => {});  // No close event

    await expect(service.execute('test', { timeout: 100 }))
      .rejects.toThrow('timeout');
    expect(mockProcess.kill).toHaveBeenCalled();
  });
});
```

**Key Points**:
- ✅ Mock `child_process.spawn`
- ✅ Include `kill` for timeout tests
- ✅ Test error paths thoroughly

---

### Pattern 3: MCP Protocol (index.js example)

**JSON-RPC Testing**:
```javascript
describe('MCP Server', () => {
  test('handles tools/list request', async () => {
    const request = {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1,
    };

    const response = await server.handleRequest(request);

    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).toBe(1);
    expect(response.result).toHaveProperty('tools');
  });

  test('returns error for invalid jsonrpc version', async () => {
    const response = await server.handleRequest({
      jsonrpc: '1.0',
      method: 'tools/list',
      id: 1,
    });

    expect(response.error.code).toBe(-32600);
  });
});
```

**Key Points**:
- ✅ Test all error codes (-32600, -32601, -32602, -32603, -32700)
- ✅ Verify JSON-RPC 2.0 compliance
- ✅ 100% coverage mandatory

---

## 🧪 Project Test Fixtures

**Location**: `tests/fixtures/`

**Example**:
```
tests/fixtures/
├── handlers-valid/
│   ├── handlerA.js
│   └── handlerB.js
└── handlers-mixed/
    ├── handlerC.js
    ├── config.json  # Should be ignored
    └── README.md    # Should be ignored
```

**Usage**:
```javascript
const fixturesPath = path.join(__dirname, '../fixtures/handlers-valid');
handlerLoader.loadHandlers(fixturesPath);
```

---

## 🎮 Project Tools

### Dashboard

```bash
npm run dashboard
```

Shows:
- Current coverage by module
- TDD level (LEGENDARY 👑)
- Progress bars
- Achievement percentage

### Test Generator

```bash
npm run generate-test <moduleName> <category>

# Example
npm run generate-test authHandler handlers
```

Generates:
- Test file with template
- Source file template
- TDD workflow guidance

---

## 📊 Achieved Results

**Coverage by Layer**:
- Core: 98.81% (5 modules)
- Services: 100% (3 services) 🏆
- MCP: 100% (index.js) 🏆

**100% Coverage Modules** (7):
1. index.js
2. stageOrchestrator.js
3. stateManager.js
4. workflowEngine.js
5. geminiService.js
6. qwenService.js
7. codexService.js

---

## 💡 When to Use This Skill

**Auto-activate when user**:
- Asks to "create tests"
- Mentions "TDD" or "test-driven"
- Wants to add a new module/service
- Asks about test coverage
- Mentions "follow Aegis AI pattern"

**Steps**:
1. Identify module category (core/services/handlers)
2. Use appropriate pattern from this skill
3. Follow TDD cycle
4. Aim for 95%+ coverage
5. Use project tools (dashboard, generate-test)

---

## 🏆 Success Criteria

- [ ] Tests written before implementation
- [ ] Coverage 95%+
- [ ] All tests passing
- [ ] Edge cases covered
- [ ] Mocking strategy appropriate
- [ ] JSDoc complete
- [ ] CI/CD passing

---

## 📚 Reference Files

**Within this project**:
- Examples: All files in `tests/`
- Patterns: `src/core/`, `src/services/`
- Documentation: `docs/TDD_POLICY.md`
- Benefits: `docs/PRACTICAL_BENEFITS.md`

**Commands**:
```bash
npm test                 # Run tests
npm run test:coverage    # Coverage report
npm run dashboard        # Visual dashboard
npm run generate-test    # Generate new test
```

---

**Level**: 👑 LEGENDARY (99.33% coverage)
**Tests**: 105 (100% pass)
**Status**: Production Ready ✅
