# Contributing to Aegis AI

Thank you for your interest in contributing to Aegis AI! 🛡️

---

## 🎯 TDD-First Approach

Aegis AI follows **strict Test-Driven Development (TDD)**. All contributions must follow the TDD workflow.

---

## 🔴🟢🔵 Development Workflow

### Step 1: 🔴 RED - Write Failing Test

```bash
# 1. Create your feature branch
git checkout -b feature/my-feature

# 2. Generate test template (optional)
npm run generate-test myModule core

# 3. Write failing tests
# Edit: tests/core/myModule.test.js

# 4. Verify tests fail
npm test
```

### Step 2: 🟢 GREEN - Implement Code

```bash
# 1. Write minimal code to pass tests
# Edit: src/core/myModule.js

# 2. Run tests
npm test

# 3. Verify all tests pass
```

### Step 3: 🔵 REFACTOR - Improve Quality

```bash
# 1. Improve code quality
# 2. Ensure tests still pass
npm test

# 3. Check coverage
npm run test:coverage

# 4. View dashboard
npm run dashboard
```

---

## 📋 Contribution Checklist

Before submitting your PR, ensure:

- [ ] ✅ Followed TDD cycle (RED → GREEN → REFACTOR)
- [ ] ✅ All tests pass (`npm test`)
- [ ] ✅ Coverage meets threshold
  - core/: 80%+
  - services/: 70%+
  - handlers/: 60%+
- [ ] ✅ No linting errors (if configured)
- [ ] ✅ Updated documentation (if needed)
- [ ] ✅ Filled PR template completely

---

## 🧪 Testing Standards

### Test Structure

Use **Arrange-Act-Assert (AAA)** pattern:

```javascript
test('should calculate total correctly', () => {
  // Arrange (Given)
  const price = 100;
  const tax = 0.1;

  // Act (When)
  const result = calculateTotal(price, tax);

  // Assert (Then)
  expect(result).toBe(110);
});
```

### Test Naming

Use descriptive names with `should`:

```javascript
// ✅ Good
test('should return null when user not found', () => {});

// ❌ Bad
test('test1', () => {});
```

### Test Independence

Each test must be independent:

```javascript
// ✅ Good
beforeEach(() => {
  manager = new StateManager();
  manager.clearState();
});

// ❌ Bad - tests depend on each other
test('test1', () => { count = 1; });
test('test2', () => { count++; }); // depends on test1
```

---

## 🤖 AI Team Workflow

Aegis AI uses **AI Trinity** for test generation:

### 1. Gemini (The Speculator)
**Use for**: BDD specification generation

```bash
# Generates Given-When-Then scenarios
# Identifies edge cases
```

### 2. Qwen (The Technician)
**Use for**: Jest test code generation

```bash
# Converts BDD specs to Jest tests
# Implements mocking strategies
```

### 3. Codex (The Refactorer)
**Use for**: Code review and refactoring

```bash
# Suggests improvements
# Optimizes implementation
```

### Automated Workflow

```bash
npm run generate-test myModule core "Module description"
```

---

## 📊 Quality Gates

### PR Approval Requirements

Your PR will be automatically checked for:

1. ✅ **Test Pass Rate**: 100%
2. ✅ **Coverage Threshold**: Category-specific
3. ✅ **No Breaking Changes**: Without migration guide
4. ✅ **Code Review**: 1+ approvals

### CI/CD Pipeline

GitHub Actions will:
- Run all tests
- Generate coverage report
- Comment on PR with results
- Block merge if quality gates fail

---

## 🐛 Bug Fix Workflow

### Process

1. **Create Regression Test** (reproduces bug)
```javascript
test('should handle edge case that caused bug', () => {
  // This test should FAIL initially
  expect(buggyFunction()).toBe(expectedValue);
});
```

2. **Verify Test Fails**
```bash
npm test
# Should show failing test
```

3. **Fix Bug**
```javascript
// Implement fix
```

4. **Verify Test Passes**
```bash
npm test
# All tests should pass
```

5. **Submit PR** with test + fix

---

## 📝 Commit Message Guidelines

### Format

```
<type>: <description>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `test`: Add/update tests
- `refactor`: Code refactoring
- `docs`: Documentation
- `ci`: CI/CD changes

### Examples

```bash
feat: Add user authentication with 100% coverage

Implemented TDD cycle for authentication:
- 12 tests (100% pass)
- Coverage: 98%

test: Improve edge case coverage for authHandler

Added 5 edge case tests:
- Invalid tokens
- Expired sessions
- Concurrent requests
```

---

## 🎓 Learning Resources

### Getting Started

1. Read [TDD Policy](./docs/TDD_POLICY.md)
2. Review [Phase 2 Examples](./docs/TDD_업그레이드_계획/02_PHASE2_CORE_MODULES.md)
3. Try `npm run generate-test`
4. Review existing tests in `tests/`

### Tools

- `npm test` - Run all tests
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage report
- `npm run dashboard` - Visual dashboard
- `npm run generate-test` - Generate tests

---

## 🤝 Code Review

### For Reviewers

Focus on:

1. **Test Quality**
   - Are tests meaningful?
   - Do they test actual behavior?
   - Are edge cases covered?

2. **TDD Compliance**
   - Was RED-GREEN-REFACTOR followed?
   - Are tests written first?
   - Is implementation minimal?

3. **Coverage**
   - Does it meet threshold?
   - Are critical paths covered?

### For Contributors

When receiving feedback:
- Address all comments
- Update tests if needed
- Re-run coverage check
- Thank reviewers!

---

## 🚀 Release Process

1. All tests pass on main branch
2. Coverage >= 95%
3. Version bump in package.json
4. Update CHANGELOG.md
5. Create release tag
6. Deploy with confidence! 🎉

---

## ❓ Questions?

- Check [TDD Policy](./docs/TDD_POLICY.md)
- Review [Examples](./docs/TDD_업그레이드_계획/)
- Open an issue on GitHub

---

**Happy TDD! 🔴🟢🔵**

Remember: Tests are not overhead, they are **your safety net**! 🛡️
