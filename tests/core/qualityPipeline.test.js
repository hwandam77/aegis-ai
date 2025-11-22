// tests/core/qualityPipeline.test.js

const { QualityPipeline } = require('../../src/core/qualityPipeline');

describe('QualityPipeline', () => {
  let pipeline;

  beforeEach(() => {
    pipeline = new QualityPipeline();
  });

  // 1. 모든 검사 성공 (Happy Path)
  test('모든 검사 성공 시 passed = true, 리포트에 두 검사 결과 포함', async () => {
    pipeline.addCheck('lint', async () => ({ passed: true, result: 'lint passed' }));
    pipeline.addCheck('unit-test', async () => ({ passed: true, result: 'unit test passed' }));

    const result = await pipeline.execute();

    expect(result.passed).toBe(true);
    expect(result.checks.length).toBe(2);
    expect(result.checks[0].name).toBe('lint');
    expect(result.checks[1].name).toBe('unit-test');
  });

  // 2. 검사 중 하나 실패
  test('검사 중 하나 실패 시 passed = false, summary에 실패 원인 포함', async () => {
    pipeline.addCheck('lint', async () => ({ passed: true, result: 'lint passed' }));
    pipeline.addCheck('unit-test', async () => ({ passed: false, result: 'unit test failed' }));

    const result = await pipeline.execute();

    expect(result.passed).toBe(false);
    expect(result.summary).toContain('unit test failed');
  });

  // 3. 모든 게이트 통과
  test('모든 게이트 통과 시 passed = true, 실패 게이트 목록 비어있음', async () => {
    pipeline.addCheck('coverage', async () => ({ passed: true, result: { coverage: 95 } }));
    pipeline.addGate('coverage', { validator: (result) => result.coverage >= 90 });

    const result = await pipeline.execute();
    const gatesResult = pipeline.validateGates(result);

    expect(gatesResult.passed).toBe(true);
    expect(gatesResult.failedGates).toHaveLength(0);
  });

  // 4. 게이트 통과 실패
  test('게이트 통과 실패 시 passed = false, 실패 게이트 정보 포함', async () => {
    pipeline.addCheck('critical-issues', async () => ({ passed: true, result: { issues: 3 } }));
    pipeline.addGate('critical-issues', { validator: (result) => result.issues === 0 });

    const result = await pipeline.execute();
    const gatesResult = pipeline.validateGates(result);

    expect(gatesResult.passed).toBe(false);
    expect(gatesResult.failedGates).toHaveLength(1);
    expect(gatesResult.failedGates[0].name).toBe('critical-issues');
  });

  // 5. Edge: 검사 없음
  test('빈 파이프라인에서 execute 호출 시 passed = true, checks 배열 비어있음', async () => {
    const result = await pipeline.execute();

    expect(result.passed).toBe(true);
    expect(result.checks).toHaveLength(0);
  });

  // 6. Edge: 검사 실행 중 예외
  test('검사 실행 중 예외 발생 시 passed = false, 에러 정보 포함', async () => {
    pipeline.addCheck('broken-check', async () => {
      throw new Error('Broken check error');
    });

    const result = await pipeline.execute();

    expect(result.passed).toBe(false);
    expect(result.checks[0].error).toBe('Broken check error');
  });

  // 7. Edge: 게이트 없이 검증
  test('게이트 없이 검증 시 passed = true', async () => {
    pipeline.addCheck('lint', async () => ({ passed: true, result: 'lint passed' }));
    const result = await pipeline.execute();

    const gatesResult = pipeline.validateGates(result);

    expect(gatesResult.passed).toBe(true);
  });

  // 8. Edge: 중복 검사 이름
  test('중복된 검사 이름 추가 시 "Duplicate check name" 에러 발생', () => {
    pipeline.addCheck('lint', async () => ({ passed: true, result: 'lint passed' }));

    expect(() => {
      pipeline.addCheck('lint', async () => ({ passed: true, result: 'lint passed again' }));
    }).toThrow('Duplicate check name');
  });

  // 9. Edge: 잘못된 검사 형식 (fn 누락)
  test('fn 없는 검사 추가 시 "Invalid check format" 에러 발생', () => {
    expect(() => {
      pipeline.addCheck('invalid-check', {});
    }).toThrow('Invalid check format');
  });

  // 10. Edge: 잘못된 게이트 형식 (validator 누락)
  test('validator 없는 게이트 추가 시 "Invalid gate format" 에러 발생', () => {
    expect(() => {
      pipeline.addGate('invalid-gate', {});
    }).toThrow('Invalid gate format');
  });

  // 11. 검사 및 게이트 목록 조회
  test('getChecks(), getGates() 호출 시 각각 올바른 배열 반환', () => {
    pipeline.addCheck('check1', async () => ({ passed: true }));
    pipeline.addCheck('check2', async () => ({ passed: true }));
    pipeline.addGate('gate1', { validator: () => true });

    const checks = pipeline.getChecks();
    const gates = pipeline.getGates();

    expect(checks).toHaveLength(2);
    expect(checks[0].name).toBe('check1');
    expect(checks[1].name).toBe('check2');
    expect(gates).toHaveLength(1);
    expect(gates[0].name).toBe('gate1');
  });
});
