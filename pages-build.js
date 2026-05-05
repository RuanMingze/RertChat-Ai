#!/usr/bin/env node

import { spawnSync } from 'child_process';

function runCommand(command, args = [], options = {}) {
  console.log(`\n📦 执行命令: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options
  });

  if (result.error) {
    console.error(`❌ 命令执行失败: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`❌ 命令退出码: ${result.status}`);
    process.exit(1);
  }

  console.log(`✅ 命令执行成功`);
}

function main() {
  console.log('🚀 开始构建...');
  runCommand('npx', ['@cloudflare/next-on-pages']);
  console.log('\n🎉 构建完成！');
}

main();