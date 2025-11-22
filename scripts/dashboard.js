#!/usr/bin/env node
/**
 * dashboard.js
 * TDD 커버리지 대시보드
 */

const fs = require('fs');
const path = require('path');

// ANSI 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function printDashboard() {
  console.log('\n');
  console.log(colors.bright + colors.cyan + '╔════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.bright + colors.cyan + '║        🛡️  AEGIS AI - TDD DASHBOARD 🛡️                    ║' + colors.reset);
  console.log(colors.bright + colors.cyan + '╚════════════════════════════════════════════════════════════╝' + colors.reset);
  console.log('');

  // 커버리지 파일 읽기
  const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');

  if (!fs.existsSync(coveragePath)) {
    console.log(colors.yellow + '⚠️  커버리지 리포트가 없습니다. npm run test:coverage를 먼저 실행하세요.' + colors.reset);
    return;
  }

  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const total = coverage.total;

  // 전체 커버리지
  console.log(colors.bright + '📊 Overall Coverage' + colors.reset);
  console.log('─'.repeat(60));
  printMetric('Statements', total.statements.pct);
  printMetric('Branches', total.branches.pct);
  printMetric('Functions', total.functions.pct);
  printMetric('Lines', total.lines.pct);
  console.log('');

  // 모듈별 커버리지
  console.log(colors.bright + '📂 Module Coverage' + colors.reset);
  console.log('─'.repeat(60));

  const files = Object.keys(coverage).filter(k => k !== 'total');
  files.forEach(file => {
    const fileName = path.basename(file);
    const fileCoverage = coverage[file];
    const pct = fileCoverage.statements.pct;

    const emoji = pct === 100 ? '🏆' : pct >= 95 ? '✅' : pct >= 80 ? '⚠️' : '❌';
    const color = pct === 100 ? colors.green : pct >= 95 ? colors.cyan : pct >= 80 ? colors.yellow : colors.reset;

    console.log(`${emoji} ${color}${fileName.padEnd(25)}${pct.toFixed(2)}%${colors.reset}`);
  });

  console.log('');

  // 목표 달성도
  console.log(colors.bright + '🎯 Target Achievement' + colors.reset);
  console.log('─'.repeat(60));

  const target = 70;
  const actual = total.statements.pct;
  const achievement = ((actual / target) * 100).toFixed(1);

  console.log(`Target:      ${target}%`);
  console.log(`Actual:      ${colors.green}${actual.toFixed(2)}%${colors.reset}`);
  console.log(`Achievement: ${colors.bright}${colors.magenta}${achievement}%${colors.reset} 🎉`);
  console.log('');

  // 레벨 시스템
  printLevel(actual);

  console.log('');
}

function printMetric(name, value) {
  const bar = createBar(value);
  const color = value === 100 ? colors.green : value >= 95 ? colors.cyan : value >= 80 ? colors.yellow : colors.reset;

  console.log(`${name.padEnd(12)} ${bar} ${color}${value.toFixed(2)}%${colors.reset}`);
}

function createBar(percentage) {
  const filled = Math.floor(percentage / 5);
  const empty = 20 - filled;

  return (
    colors.green +
    '█'.repeat(filled) +
    colors.reset +
    '░'.repeat(empty)
  );
}

function printLevel(coverage) {
  let level, emoji, message;

  if (coverage >= 99) {
    level = 'LEGENDARY';
    emoji = '👑';
    message = 'You are a TDD Master!';
  } else if (coverage >= 95) {
    level = 'EXPERT';
    emoji = '🏆';
    message = 'Outstanding coverage!';
  } else if (coverage >= 90) {
    level = 'ADVANCED';
    emoji = '⭐';
    message = 'Great job!';
  } else if (coverage >= 80) {
    level = 'INTERMEDIATE';
    emoji = '✅';
    message = 'Good progress!';
  } else if (coverage >= 70) {
    level = 'BEGINNER';
    emoji = '📚';
    message = 'Keep going!';
  } else {
    level = 'NOVICE';
    emoji = '🌱';
    message = 'Just getting started!';
  }

  console.log(colors.bright + '🎮 TDD Level' + colors.reset);
  console.log('─'.repeat(60));
  console.log(`${emoji}  ${colors.bright}${colors.magenta}${level}${colors.reset} - ${message}`);
}

// 실행
printDashboard();
