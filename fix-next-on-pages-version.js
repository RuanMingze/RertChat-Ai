import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const red = "\x1b[31m";
const green = "\x1b[38;5;122m";
const yellow = "\x1b[33m";
const reset = "\x1b[0m";

const packageJsonPath = path.join(__dirname, 'node_modules', '@cloudflare', 'next-on-pages', 'package.json');

try {
  if (!fs.existsSync(packageJsonPath)) {
    console.error(red + 'Error: @cloudflare/next-on-pages package.json not found at:' + reset, packageJsonPath);
    console.error(red + 'Please run "pnpm install" first.' + reset);
    process.exit(1);
  }

  const content = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(content);

  if (packageJson.peerDependencies && packageJson.peerDependencies.next) {
    const originalVersion = packageJson.peerDependencies.next;
    packageJson.peerDependencies.next = '>=14.3.0';
    console.log(green + 'Successfully updated Next.js version constraint in peerDependencies:' + reset);
    console.log(`  From: ${yellow}${originalVersion}${reset}`);
    console.log(`  To: ${green}>=14.3.0${reset}`);
  } else {
    console.warn(yellow + 'Warning: peerDependencies.next not found in @cloudflare/next-on-pages package.json' + reset);
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log(green + '\nCompatibility patch for @cloudflare/next-on-pages applied successfully' + reset);
} catch (e) {
  console.error(red + 'Failed to apply patch:' + reset, e.message);
  console.error(red + 'Stack:' + reset, e.stack);
  process.exit(1);
}