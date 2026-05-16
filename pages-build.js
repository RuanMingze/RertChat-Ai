#!/usr/bin/env node

import { spawnSync } from 'child_process';

const green = "\x1b[38;5;122m";
const red = "\x1b[31m";
const reset = "\x1b[0m";

function runCommand(command, args = [], options = {}) {
  console.log(green + `\n执行命令: ${command} ${args.join(' ')}` + reset);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options
  });

  if (result.error) {
    console.error(red + `命令执行失败: ${result.error.message}` + reset);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(red + `命令退出码: ${result.status}` + reset);
    process.exit(1);
  }

  console.log(green + `命令执行成功` + reset);
}

function main() {
  console.log(green + '开始构建...' + reset);
  runCommand('npx', ['@cloudflare/next-on-pages']);
  console.log(green + '\n构建完成！' + reset);
}

main();