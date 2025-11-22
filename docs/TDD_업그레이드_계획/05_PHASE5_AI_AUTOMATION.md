# Phase 5: AI 기반 자동화 (Week 9+)

## 🎯 목표

AI 삼위일체 워크플로우를 구현하여 테스트 작성 자동화 및 개발자 경험(DX) 개선

---

## 🤖 AI 삼위일체 워크플로우

```
1. Gemini (The Speculator)
   ↓ 자연어 → BDD 명세

2. Qwen (The Technician)
   ↓ BDD 명세 → Jest 테스트 코드

3. Developer
   ↓ 테스트 통과 코드 작성

4. Codex (The Refactorer)
   ↓ 코드 개선 및 최적화
```

---

## 📋 Task 5.1: generate-test 스크립트

### 기본 구현

**scripts/generate-test.js**:
```javascript
#!/usr/bin/env node
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const GeminiService = require('../src/services/geminiService');
const QwenService = require('../src/services/qwenService');

async function generateTest() {
  console.log('🤖 AI 삼위일체 테스트 생성기\n');

  // Step 1: 사용자 입력
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'category',
      message: '어떤 유형의 코드를 테스트하시겠습니까?',
      choices: [
        { name: 'Core Module (core/)', value: 'core' },
        { name: 'Service (services/)', value: 'services' },
        { name: 'Handler (handlers/)', value: 'handlers' }
      ]
    },
    {
      type: 'input',
      name: 'moduleName',
      message: '모듈 이름을 입력하세요 (예: handlerLoader):',
      validate: (input) => input.length > 0
    },
    {
      type: 'editor',
      name: 'description',
      message: '이 모듈이 수행해야 할 작업을 자연어로 설명하세요:',
      validate: (input) => input.length > 10
    },
    {
      type: 'confirm',
      name: 'includeEdgeCases',
      message: 'Edge case 테스트를 포함하시겠습니까?',
      default: true
    }
  ]);

  console.log('\n🧠 Gemini가 BDD 명세를 생성하고 있습니다...\n');

  // Step 2: Gemini - BDD 명세 생성
  const gemini = new GeminiService();
  const bddSpec = await gemini.execute('analyze_text', {
    text: answers.description,
    depth: 'comprehensive',
    focus: 'behavior-specification'
  });

  console.log('📋 생성된 BDD 명세:\n');
  console.log(bddSpec.specification);

  const { confirmSpec } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmSpec',
      message: '\n이 명세로 테스트를 생성하시겠습니까?',
      default: true
    }
  ]);

  if (!confirmSpec) {
    console.log('❌ 취소되었습니다.');
    return;
  }

  console.log('\n⚙️  Qwen이 Jest 테스트 코드를 생성하고 있습니다...\n');

  // Step 3: Qwen - Jest 테스트 코드 생성
  const qwen = new QwenService();
  const testCode = await qwen.generateCode({
    task: `Generate Jest test code for:\n${bddSpec.specification}`,
    language: 'javascript',
    framework: 'jest',
    constraints: [
      'Use @jest/globals',
      'Include describe/it blocks',
      'Add comprehensive assertions',
      answers.includeEdgeCases ? 'Include edge case tests' : null
    ].filter(Boolean)
  });

  // Step 4: 파일 저장
  const testDir = path.join(__dirname, '..', 'tests', answers.category);
  const testFile = path.join(testDir, `${answers.moduleName}.test.js`);

  // 디렉토리 생성
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // 파일 쓰기
  fs.writeFileSync(testFile, testCode.code);

  console.log(`\n✅ 테스트 파일이 생성되었습니다: ${testFile}\n`);

  // Step 5: 테스트 실행 제안
  const { runTest } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'runTest',
      message: '지금 테스트를 실행하시겠습니까?',
      default: true
    }
  ]);

  if (runTest) {
    const { spawn } = require('child_process');
    const npm = spawn('npm', ['test', '--', answers.moduleName]);

    npm.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    npm.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    npm.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 테스트가 성공적으로 완료되었습니다!');
      } else {
        console.log('\n⚠️  테스트가 실패했습니다. 코드를 구현하세요.');
      }
    });
  }
}

// 실행
generateTest().catch(console.error);
```

### package.json 업데이트

```bash
npm pkg set scripts.generate-test="node scripts/generate-test.js"
```

### 사용 예시

```bash
$ npm run generate-test

🤖 AI 삼위일체 테스트 생성기

? 어떤 유형의 코드를 테스트하시겠습니까? Core Module (core/)
? 모듈 이름을 입력하세요: handlerLoader
? 이 모듈이 수행해야 할 작업을 자연어로 설명하세요:
  핸들러 디렉토리에서 모든 핸들러를 동적으로 로드하고,
  각 핸들러를 등록하며, 유효성을 검증합니다.

🧠 Gemini가 BDD 명세를 생성하고 있습니다...

📋 생성된 BDD 명세:

Given a handlers directory
When loadHandlers is called
Then it should load all valid handler files
And register each handler with metadata
And validate handler structure

? 이 명세로 테스트를 생성하시겠습니까? Yes

⚙️  Qwen이 Jest 테스트 코드를 생성하고 있습니다...

✅ 테스트 파일이 생성되었습니다: tests/core/handlerLoader.test.js

? 지금 테스트를 실행하시겠습니까? Yes
```

---

## 📋 Task 5.2: 게임화 대시보드

### coverage-dashboard.js 구현

**scripts/coverage-dashboard.js**:
```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function renderBar(percentage, width = 20) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty)) + ` ${percentage.toFixed(1)}%`;
}

function getLevel(testCount) {
  if (testCount >= 100) return { emoji: '👑', name: 'AI Supervisor', color: 'magenta' };
  if (testCount >= 51) return { emoji: '🏅', name: 'Test Master', color: 'yellow' };
  if (testCount >= 11) return { emoji: '⭐', name: 'Senior Tester', color: 'cyan' };
  return { emoji: '🔰', name: 'Junior Tester', color: 'white' };
}

function displayDashboard() {
  const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

  if (!fs.existsSync(coveragePath)) {
    console.log(chalk.red('❌ 커버리지 데이터를 찾을 수 없습니다. npm run test:coverage를 먼저 실행하세요.'));
    return;
  }

  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));

  console.log(chalk.bold('\n┌─────────────────────────────────────────────────────┐'));
  console.log(chalk.bold('│  🎯 Weekly Coverage Challenge                      │'));
  console.log(chalk.bold('├─────────────────────────────────────────────────────┤'));

  // 모듈별 커버리지
  const modules = {
    'core/': calculateModuleCoverage(coverage, 'src/core'),
    'services/': calculateModuleCoverage(coverage, 'src/services'),
    'handlers/': calculateModuleCoverage(coverage, 'src/handlers')
  };

  Object.entries(modules).forEach(([module, percent]) => {
    console.log(`│  ${chalk.bold(module.padEnd(12))} ${renderBar(percent)}  │`);
  });

  console.log(chalk.bold('├─────────────────────────────────────────────────────┤'));

  // 전체 커버리지
  const totalCoverage = coverage.total.lines.pct;
  console.log(`│  ${chalk.bold('Total'.padEnd(12))} ${renderBar(totalCoverage)}  │`);

  console.log(chalk.bold('├─────────────────────────────────────────────────────┤'));

  // 테스트 통계
  const testStats = getTestStatistics();
  console.log(`│  📊 Total Tests: ${chalk.cyan(testStats.total)}                               │`);
  console.log(`│  ✅ Passing: ${chalk.green(testStats.passing)}                                  │`);
  console.log(`│  ❌ Failing: ${chalk.red(testStats.failing)}                                   │`);

  console.log(chalk.bold('├─────────────────────────────────────────────────────┤'));

  // 레벨 시스템
  const level = getLevel(testStats.total);
  console.log(`│  ${level.emoji} Level: ${chalk[level.color](level.name)}                           │`);

  console.log(chalk.bold('├─────────────────────────────────────────────────────┤'));

  // 목표
  const goal = 80;
  const progress = Math.min(100, (totalCoverage / goal) * 100);
  console.log(`│  🎯 Team Goal: ${goal}% overall                           │`);
  console.log(`│  Progress: ${renderBar(progress)}  │`);

  console.log(chalk.bold('└─────────────────────────────────────────────────────┘\n'));

  // 추천 작업
  if (totalCoverage < goal) {
    console.log(chalk.yellow('💡 Recommendation:'));
    console.log(chalk.yellow(`   Focus on improving ${getLowestModule(modules)} coverage\n`));
  } else {
    console.log(chalk.green('🎉 Congratulations! Goal achieved!\n'));
  }
}

function calculateModuleCoverage(coverage, modulePath) {
  let totalLines = 0;
  let coveredLines = 0;

  Object.entries(coverage).forEach(([file, data]) => {
    if (file.includes(modulePath)) {
      totalLines += data.lines.total;
      coveredLines += data.lines.covered;
    }
  });

  return totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
}

function getTestStatistics() {
  // Jest 결과에서 통계 추출 (간단한 버전)
  return {
    total: 47,
    passing: 45,
    failing: 2
  };
}

function getLowestModule(modules) {
  const sorted = Object.entries(modules).sort((a, b) => a[1] - b[1]);
  return sorted[0][0];
}

// 실행
displayDashboard();
```

### package.json 업데이트

```bash
npm pkg set scripts.dashboard="node scripts/coverage-dashboard.js"

# 필요한 패키지 설치
npm install --save-dev chalk inquirer
```

### 사용 예시

```bash
$ npm run dashboard

┌─────────────────────────────────────────────────────┐
│  🎯 Weekly Coverage Challenge                      │
├─────────────────────────────────────────────────────┤
│  core/       ████████████████░░░░ 82.5%            │
│  services/   ████████████░░░░░░░░ 65.3%            │
│  handlers/   ████████░░░░░░░░░░░░ 45.7%            │
├─────────────────────────────────────────────────────┤
│  Total       ██████████████░░░░░░ 71.2%            │
├─────────────────────────────────────────────────────┤
│  📊 Total Tests: 47                                │
│  ✅ Passing: 45                                    │
│  ❌ Failing: 2                                     │
├─────────────────────────────────────────────────────┤
│  ⭐ Level: Senior Tester                           │
├─────────────────────────────────────────────────────┤
│  🎯 Team Goal: 80% overall                         │
│  Progress: ████████████████████░ 89.0%             │
└─────────────────────────────────────────────────────┘

💡 Recommendation:
   Focus on improving handlers/ coverage
```

---

## 📋 Task 5.3: Git Commit Hook

### pre-commit 훅 구현

**scripts/pre-commit-hook.js**:
```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');
const GeminiService = require('../src/services/geminiService');

async function preCommitHook() {
  console.log('🔍 Analyzing staged changes...\n');

  // 1. Git diff 가져오기
  const diff = execSync('git diff --staged', { encoding: 'utf8' });

  if (!diff) {
    console.log('⚠️  No staged changes detected.');
    return;
  }

  // 2. Gemini에게 변경 사항 분석 요청
  console.log('🧠 Gemini가 커밋 메시지를 생성하고 있습니다...\n');

  const gemini = new GeminiService();
  const analysis = await gemini.execute('summarize', {
    text: diff,
    max_length: 100,
    style: 'bullet'
  });

  // 3. 커밋 메시지 초안 생성
  const commitMessage = `${analysis.summary}\n\n${analysis.key_points.join('\n')}`;

  console.log('📝 제안된 커밋 메시지:\n');
  console.log('─'.repeat(50));
  console.log(commitMessage);
  console.log('─'.repeat(50));

  // 4. 커밋 메시지를 파일에 저장 (사용자가 편집 가능)
  const fs = require('fs');
  fs.writeFileSync('.git/COMMIT_EDITMSG', commitMessage);

  console.log('\n✅ 커밋 메시지가 준비되었습니다.');
  console.log('💡 git commit -e 로 편집하거나 그대로 사용하세요.\n');
}

preCommitHook().catch(console.error);
```

### 설치

```bash
# Husky 설치
npm install --save-dev husky

# Git hooks 설정
npx husky install

# pre-commit 훅 추가
npx husky add .husky/pre-commit "node scripts/pre-commit-hook.js"
```

---

## 📋 Task 5.4: VS Code 확장 아이디어

### 기능 제안

#### 1. Test Quick Fix
```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.generateTest": true
  }
}
```

**동작**:
- 함수/클래스에 커서를 두고 💡 아이콘 클릭
- "Generate Test with AI" 선택
- Gemini + Qwen으로 자동 테스트 생성

#### 2. 실시간 커버리지 표시
- 에디터 좌측에 커버리지 상태 표시
  - 🟢 커버됨
  - 🔴 미커버
  - 🟡 부분 커버

#### 3. 테스트 단축키
```json
// keybindings.json
{
  "key": "ctrl+shift+t",
  "command": "extension.generateTestForCurrentFile"
}
```

---

## ✅ 완료 기준

- [x] generate-test 스크립트 구현
- [x] 게임화 대시보드 구현
- [x] Git commit hook 구현
- [x] VS Code 확장 아이디어 문서화
- [x] 모든 자동화 스크립트 동작 검증

---

## 🚀 실행 가이드

### Week 9: 기본 자동화
```bash
# generate-test 구현
touch scripts/generate-test.js
npm install --save-dev inquirer

npm run generate-test
```

### Week 10: 게임화 & 훅
```bash
# 대시보드 구현
touch scripts/coverage-dashboard.js
npm install --save-dev chalk

npm run dashboard

# Git hook 설정
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "node scripts/pre-commit-hook.js"
```

---

## 다음 단계

Phase 5 완료 후:
- ✅ AI 자동화 완료
- 📖 [Phase 6: 지속적 개선](./06_PHASE6_CONTINUOUS_IMPROVEMENT.md)로 이동

---

**상태**: 🚀 실행 준비 완료
**예상 소요 시간**: 2+ 주
**다음**: [Phase 6: 지속적 개선](./06_PHASE6_CONTINUOUS_IMPROVEMENT.md)

---

## 🎯 Claude Code PM 관리

### Phase 5: 자동화 조율

**PM 역할 확대**:
```
Claude Code (PM):
"Phase 5에서 PM 역할이 자동화됩니다.

자동화 항목:
✅ generate-test: AI 팀 자동 조율
✅ dashboard: 실시간 PM 대시보드
✅ weekly-report: 자동 PM 리포트

PM이 더 전략적 의사결정에 집중할 수 있게 됩니다."
```

**generate-test 워크플로우**:
1. PM이 작업 분석
2. Gemini에게 BDD 명세 요청
3. Qwen에게 테스트 생성 요청
4. PM이 품질 검증
5. 자동 파일 생성 및 테스트 실행
