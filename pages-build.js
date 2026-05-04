#!/usr/bin/env node

import { spawnSync, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BUILD_DIR = '.vercel/output/static';
const JEKYLL_OUTPUT = '_site';
const PUBLIC_DIR = 'public';

const MARKDOWN_FILES = ['README', 'CONTRIBUTING', 'SECURITY'];

function runCommand(command, args = [], options = {}) {
  console.log(`\n📦 执行命令: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options
  });

  if (result.error) {
    console.error(`❌ 命令执行失败: ${result.error.message}`);
    return { success: false, error: result.error.message };
  }

  if (result.status !== 0) {
    console.error(`❌ 命令退出码: ${result.status}`);
    return { success: false, status: result.status };
  }

  console.log(`✅ 命令执行成功`);
  return { success: true };
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`  复制: ${path.basename(src)} -> ${dest}`);
}

function isMainModule() {
  const modulePath = new URL(import.meta.url).pathname;
  const mainPath = path.resolve(process.argv[1]);

  if (process.platform === 'win32') {
    const normalizedModulePath = modulePath.replace(/\//g, '\\').replace(/^\\([A-Za-z]):/, '$1:');
    return normalizedModulePath.toLowerCase() === mainPath.toLowerCase();
  }

  return modulePath === mainPath;
}

function checkJekyllInstalled() {
  try {
    execSync('jekyll --version', { stdio: 'ignore', shell: process.platform === 'win32' });
    return true;
  } catch {
    return false;
  }
}

function installJekyll() {
  console.log('📦 开始安装 Jekyll...');

  const result = runCommand('gem', ['install', 'jekyll']);

  if (result.success) {
    console.log('✅ Jekyll 安装成功');
    return true;
  } else {
    console.error('❌ Jekyll 安装失败，请手动安装: gem install jekyll');
    return false;
  }
}

function copyMarkdownHtmlToPublic() {
  console.log('\n📦 复制 Markdown 生成的 HTML 文件到 public 目录...');

  if (!fs.existsSync(JEKYLL_OUTPUT)) {
    console.warn(`⚠️ Jekyll 输出目录不存在: ${JEKYLL_OUTPUT}`);
    return;
  }

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    console.log(`📁 创建目录: ${PUBLIC_DIR}`);
  }

  let copiedCount = 0;

  for (const name of MARKDOWN_FILES) {
    const srcHtml = path.join(JEKYLL_OUTPUT, `${name}.html`);
    const destHtml = path.join(PUBLIC_DIR, `${name}.html`);

    if (fs.existsSync(srcHtml)) {
      copyFile(srcHtml, destHtml);
      copiedCount++;
    } else {
      console.warn(`  ⚠️ 文件不存在: ${srcHtml}`);
    }
  }

  console.log(`✅ 已复制 ${copiedCount} 个 HTML 文件到 ${PUBLIC_DIR}`);
}

function main() {
  console.log('🚀 开始构建流程...');

  try {
    console.log('\n============= Step 1: 检查 Jekyll =============');
    if (!checkJekyllInstalled()) {
      console.log('⚠️ Jekyll 未安装，自动安装中...');
      if (!installJekyll()) {
        process.exit(1);
      }
    } else {
      console.log('✅ Jekyll 已安装');
    }

    console.log('\n============= Step 2: Jekyll 编译 Markdown =============');
    console.log('📝 编译 Markdown 文件为 HTML...');
    const jekyllResult = runCommand('jekyll', ['build', '--destination', JEKYLL_OUTPUT], { cwd: process.cwd() });
    if (!jekyllResult.success) {
      process.exit(1);
    }

    console.log('\n============= Step 3: 复制 HTML 到 public =============');
    copyMarkdownHtmlToPublic();

    console.log('\n============= Step 4: Next.js 构建 =============');
    const nextResult = runCommand('npx', ['@cloudflare/next-on-pages'], { cwd: process.cwd() });
    if (!nextResult.success) {
      process.exit(1);
    }

    console.log('\n============= Step 5: 清理 =============');
    if (fs.existsSync(JEKYLL_OUTPUT)) {
      fs.rmSync(JEKYLL_OUTPUT, { recursive: true, force: true });
      console.log(`🗑️ 清理临时目录: ${JEKYLL_OUTPUT}`);
    }

    console.log('\n🎉 构建完成！');
    console.log(`📁 输出目录: ${BUILD_DIR}`);
    console.log(`🔗 HTML 文件将作为静态资源访问`);

  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

if (isMainModule()) {
  main();
}

export { main, runCommand, copyMarkdownHtmlToPublic };
