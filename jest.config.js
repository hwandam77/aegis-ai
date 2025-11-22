/**
 * Jest Configuration for Aegis AI
 * TDD-based Multi-AI MCP Server
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Coverage directory
  coverageDirectory: 'coverage',

  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/__tests__/**',
  ],

  // Coverage thresholds (TDD 계획에 따른 목표)
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
    // Phase별 목표 설정
    'src/core/**/*.js': {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
    'src/services/**/*.js': {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },

  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
  ],

  // Module paths
  moduleDirectories: ['node_modules', 'src'],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks automatically
  restoreMocks: true,

  // Collect coverage from all tests
  collectCoverage: false, // --coverage 플래그로 활성화

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Test timeout
  testTimeout: 10000,
};
