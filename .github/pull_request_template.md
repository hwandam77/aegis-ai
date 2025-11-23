# Pull Request

## 📋 변경 사항 요약

<!-- 무엇을 변경했는지 간단히 설명해주세요 -->

## 🎯 TDD 체크리스트

- [ ] 🔴 **RED**: 실패하는 테스트를 먼저 작성했습니다
- [ ] 🟢 **GREEN**: 테스트를 통과하는 최소한의 코드를 작성했습니다
- [ ] 🔵 **REFACTOR**: 코드 리팩토링을 완료했습니다
- [ ] 📊 **Coverage**: 커버리지 임계값을 충족합니다
- [ ] ✅ **Tests Pass**: 모든 테스트가 통과합니다

## 🧪 테스트 결과

```bash
# npm test 결과를 여기에 붙여넣기

Test Suites: X passed, X total
Tests:       X passed, X total
```

## 📊 커버리지 변화

| Module | Before | After | Change |
|--------|--------|-------|--------|
| core/ | XX% | XX% | +/- XX% |
| services/ | XX% | XX% | +/- XX% |
| **Overall** | XX% | XX% | +/- XX% |

## 📝 테스트 상세

### 추가된 테스트
<!-- 어떤 테스트를 추가했는지 나열 -->
- [ ] Test 1: ...
- [ ] Test 2: ...

### 테스트 시나리오
<!-- BDD Given-When-Then 형식으로 주요 시나리오 설명 -->

**Scenario 1:**
- **Given**: ...
- **When**: ...
- **Then**: ...

## 🔍 리뷰어를 위한 참고사항

<!-- 리뷰어가 특별히 주목해야 할 부분 -->

### 주요 변경 파일
- `src/...` - ...
- `tests/...` - ...

### 고려사항
<!-- 아키텍처 결정, 트레이드오프 등 -->

## 🚀 배포 체크리스트 (해당되는 경우)

- [ ] 문서 업데이트 완료
- [ ] Breaking changes 없음 또는 명시됨
- [ ] 마이그레이션 가이드 작성 (필요시)

---

**TDD Workflow**: 🔴 RED → 🟢 GREEN → 🔵 REFACTOR
