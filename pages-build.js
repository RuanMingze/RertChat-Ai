#!/usr/bin/env node

import { spawnSync, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BUILD_DIR = '.vercel/output/static';
const JEKYLL_OUTPUT = '_site';

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

function copyDirectory(src, dest) {
  console.log(`\n📤 复制目录: ${src} -> ${dest}`);
  
  if (!fs.existsSync(src)) {
    console.warn(`⚠️ 源目录不存在: ${src}`);
    return;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  复制文件: ${file}`);
    }
  });
  
  console.log(`✅ 复制完成`);
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
  
  const isWindows = process.platform === 'win32';
  let result;
  
  if (isWindows) {
    result = runCommand('gem', ['install', 'jekyll']);
  } else {
    console.log('💡 需要管理员权限安装 Jekyll，请输入密码...');
    result = runCommand('sudo', ['gem', 'install', 'jekyll']);
  }
  
  if (result.success) {
    console.log('✅ Jekyll 安装成功');
    return true;
  } else {
    console.error('❌ Jekyll 安装失败，请手动安装');
    if (!isWindows) {
      console.error('   手动安装命令: sudo gem install jekyll');
    } else {
      console.error('   手动安装命令: gem install jekyll');
    }
    return false;
  }
}

function main() {
  console.log('🚀 开始构建流程...');
  
  try {
    // 1. 运行 next-on-pages 构建
    console.log('\n============= Step 1: Next.js 构建 =============');
    const nextResult = runCommand('npx', ['@cloudflare/next-on-pages'], { cwd: process.cwd() });
    if (!nextResult.success) {
      process.exit(1);
    }
    
    // 2. 检查并安装 Jekyll
    console.log('\n============= Step 2: 检查 Jekyll =============');
    if (!checkJekyllInstalled()) {
      console.log('⚠️ Jekyll 未安装，自动安装中...');
      if (!installJekyll()) {
        process.exit(1);
      }
    } else {
      console.log('✅ Jekyll 已安装');
    }
    
    // 3. 运行 Jekyll 构建
    console.log('\n============= Step 3: Jekyll 编译 =============');
    console.log('📝 使用 Jekyll 编译 Markdown 文件...');
    const jekyllResult = runCommand('jekyll', ['build', '--destination', JEKYLL_OUTPUT], { cwd: process.cwd() });
    if (!jekyllResult.success) {
      process.exit(1);
    }
    
    // 4. 复制 Jekyll 输出到构建目录
    console.log('\n============= Step 4: 复制文件 =============');
    copyDirectory(JEKYLL_OUTPUT, BUILD_DIR);
    
    // 5. 清理临时目录
    console.log('\n============= Step 5: 清理 =============');
    if (fs.existsSync(JEKYLL_OUTPUT)) {
      fs.rmSync(JEKYLL_OUTPUT, { recursive: true, force: true });
      console.log(`🗑️ 清理临时目录: ${JEKYLL_OUTPUT}`);
    }
    
    console.log('\n🎉 构建完成！');
    console.log(`📁 输出目录: ${BUILD_DIR}`);
    
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

if (isMainModule()) {
  main();
}

export { main, runCommand, copyDirectory };
