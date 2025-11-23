# TDD Policy - Aegis AI

## 🎯 목적

Aegis AI 프로젝트의 모든 코드는 **Test-Driven Development (TDD)** 방법론을 따라 개발됩니다.

---

## 🔴🟢🔵 TDD 3단계 사이클

### 🔴 RED - Write Failing Test
**실패하는 테스트를 먼저 작성합니다**

1. 구현하려는 기능의 동작을 테스트로 정의
2. 테스트 실행 → 실패 확인
3. 실패 이유가 명확해야 함

```bash
npm test
# Expected: FAIL - Cannot find module
```

### 🟢 GREEN - Make Test Pass
**테스트를 통과시키는 최소한의 코드를 작성합니다**

1. 테스트를 통과시키는 가장 간단한 코드 작성
2. 과도한 엔지니어링 금지
3. 모든 테스트 통과 확인

```bash
npm test
# Expected: PASS - All tests passed
```

### 🔵 REFACTOR - Improve Code
**코드를 개선하고 최적화합니다**

1. 중복 제거
2. 명확성 개선
3. 성능 최적화
4. 모든 테스트가 여전히 통과하는지 확인

```bash
npm test
# Expected: PASS - All tests still passing
```

---

## 📊 커버리지 목표

### 모듈별 최소 커버리지

| Category | Minimum Coverage | Target |
|----------|-----------------|--------|
| **src/core/** | 80% | 95%+ |
| **src/services/** | 70% | 90%+ |
| **src/handlers/** | 60% | 80%+ |
| **Overall** | 70% | 90%+ |

### 검증 방법

```bash
npm run test:coverage
```

---

## ✅ 필수 정책

### 1. 모든 PR에 테스트 포함

**규칙**: 새로운 기능이나 버그 수정은 반드시 테스트와 함께 제출

**예외**: 문서 변경, 설정 파일 수정

### 2. 테스트 없이 머지 금지

**규칙**: 테스트 커버리지가 임계값 미달 시 머지 불가

**검증**: GitHub Actions가 자동으로 확인

### 3. 버그 수정 시 회귀 테스트 필수

**규칙**: 버그 발견 시
1. 버그를 재현하는 테스트 작성 (실패)
2. 버그 수정 (테스트 통과)
3. 테스트와 함께 커밋

### 4. 리팩토링은 테스트 통과 상태에서만

**규칙**: 모든 테스트가 통과하는 상태에서 리팩토링 시작

**검증**: 리팩토링 후에도 모든 테스트 통과 확인

---

## 🤖 AI 팀 활용 가이드

### Gemini (The Speculator) - BDD 명세 생성
```bash
# Use for: 요구사항 → BDD 시나리오
```

### Qwen (The Technician) - 테스트 코드 생성
```bash
# Use for: BDD 명세 → Jest 테스트
```

### Codex (The Refactorer) - 코드 리뷰
```bash
# Use for: 코드 개선 및 최적화
```

### 자동화 도구
```bash
npm run generate-test <name> <category>  # 테스트 자동 생성
npm run dashboard                        # 커버리지 대시보드
```

---

## 📈 품질 게이트

### PR 승인 조건

1. ✅ 모든 테스트 통과
2. ✅ 커버리지 임계값 충족
3. ✅ TDD 체크리스트 완료
4. ✅ 코드 리뷰 승인 (1명 이상)

### CI/CD 검증

GitHub Actions가 자동으로 검증:
- Test Suite 실행
- Coverage Report 생성
- 커버리지 임계값 확인
- PR에 자동 코멘트

---

## 🎓 모범 사례

### 좋은 테스트의 특징

1. **Fast**: 빠르게 실행 (전체 < 5분)
2. **Independent**: 다른 테스트와 독립적
3. **Repeatable**: 매번 동일한 결과
4. **Self-validating**: 명확한 pass/fail
5. **Timely**: 기능 구현 전에 작성

### 테스트 명명 규칙

```javascript
// 좋은 예
test('should return user when valid ID is provided', () => {});

// 나쁜 예
test('test1', () => {});
```

### Given-When-Then 패턴

```javascript
test('should calculate total with tax', () => {
  // Given: 초기 조건
  const price = 100;
  const taxRate = 0.1;

  // When: 동작 실행
  const total = calculateTotal(price, taxRate);

  // Then: 결과 검증
  expect(total).toBe(110);
});
```

---

## 🚫 안티패턴

### 하지 말아야 할 것

1. ❌ 테스트 없이 코드 작성
2. ❌ 테스트를 나중에 작성
3. ❌ 실패하지 않는 테스트 작성
4. ❌ 테스트를 통과시키기 위해 테스트 수정
5. ❌ 커버리지만을 위한 의미 없는 테스트

---

## 📚 학습 자료

### 내부 자료
- [TDD 구현 계획](./TDD_업그레이드_계획/00_OVERVIEW.md)
- [Phase별 가이드](./TDD_업그레이드_계획/)
- [Metrics & KPIs](./TDD_업그레이드_계획/METRICS.md)

### 외부 자료
- [Jest 공식 문서](https://jestjs.io/)
- [TDD by Example - Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Growing Object-Oriented Software, Guided by Tests](http://www.growing-object-oriented-software.com/)

---

## 🎯 성공 지표

### 단기 (현재)
- ✅ 커버리지: 99.33% (목표: 70%)
- ✅ 테스트 수: 105개 (목표: 100+)
- ✅ TDD 채택률: 100%

### 중기 (3-6개월)
- 🎯 전체 커버리지 유지: 95%+
- 🎯 새로운 기능 TDD: 100%
- 🎯 버그 발견율: 90%+

### 장기 (6개월+)
- 🎯 프로덕션 버그: 90% 감소
- 🎯 개발 속도: 30% 향상
- 🎯 코드 리뷰 시간: 50% 감소

---

## 🤝 팀 역할

### TDD Champion
- TDD 정책 관리
- 교육 및 멘토링
- 품질 지표 모니터링

### 개발자
- TDD 사이클 준수
- 테스트 작성
- 코드 리뷰 참여

### 리뷰어
- 테스트 품질 검토
- TDD 체크리스트 확인
- 피드백 제공

---

**마지막 업데이트**: 2025-11-22
**상태**: Active
**레벨**: LEGENDARY 👑
