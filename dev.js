import figlet from "figlet";
import { spawn } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

const green = "\x1b[38;5;122m";
const orange = "\x1b[38;5;214m";
const reset = "\x1b[0m";
const red = "\x1b[31m";

console.log(orange + figlet.textSync("RertChat", {
  font: "Standard",
  horizontalLayout: "default",
  verticalLayout: "default",
  width: 80,
  whitespaceBreak: true
}) + reset);

const CERT_DIR = process.cwd();
const CERT_FILE = join(CERT_DIR, "localhost+2.pem");
const KEY_FILE = join(CERT_DIR, "localhost+2-key.pem");

const env = { ...process.env };

if (existsSync(CERT_FILE) && existsSync(KEY_FILE)) {
  console.log(green + "\n  使用 HTTPS 模式启动开发服务器...\n" + reset);

  env.NODE_EXTRA_CA_CERTS = CERT_FILE;

  const dev = spawn("npx", ["next", "dev", "--experimental-https", "--experimental-https-key", KEY_FILE, "--experimental-https-cert", CERT_FILE], {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
    env
  });

  dev.on("close", (code) => {
    process.exit(code);
  });
} else {
  console.log(red + "\n  找不到 SSL 证书，使用 HTTP 模式启动开发服务器...\n" + reset);

  const certHint = `
  请先生成 SSL 证书:
  1. 安装 mkcert: choco install mkcert
  2. 运行: mkcert -install
  3. 运行: mkcert localhost
  4. 重新运行: pnpm dev
  `;

  console.log(red + certHint + reset);

  const dev = spawn("npx", ["next", "dev"], {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd()
  });

  dev.on("close", (code) => {
    process.exit(code);
  });
}
