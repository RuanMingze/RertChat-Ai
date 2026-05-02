import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, 'node_modules', '@cloudflare', 'next-on-pages', 'package.json');

try {
  if (!fs.existsSync(packageJsonPath)) {
    console.error('Error: @cloudflare/next-on-pages package.json not found at:', packageJsonPath);
    console.error('Please run "pnpm install" first.');
    process.exit(1);
  }

  const content = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(content);

  if (packageJson.peerDependencies && packageJson.peerDependencies.next) {
    const originalVersion = packageJson.peerDependencies.next;
    packageJson.peerDependencies.next = '>=14.3.0';
    console.log('Successfully updated Next.js version constraint in peerDependencies:');
    console.log(`  From: ${originalVersion}`);
    console.log(`  To: >=14.3.0`);
  } else {
    console.warn('Warning: peerDependencies.next not found in @cloudflare/next-on-pages package.json');
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('\n✅ Compatibility patch for @cloudflare/next-on-pages applied successfully');
} catch (e) {
  console.error('❌ Failed to apply patch:', e.message);
  console.error('Stack:', e.stack);
  process.exit(1);
}
