import figlet from "figlet";

const orange = "\x1b[33m";
const reset = "\x1b[0m";

console.log(orange + figlet.textSync("RertChat", {
  font: "Standard",
  horizontalLayout: "default",
  verticalLayout: "default",
  width: 80,
  whitespaceBreak: true
}) + reset);

console.log("\n  正在启动开发服务器...\n");

import { spawn } from "child_process";

const dev = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd()
});

dev.on("close", (code) => {
  process.exit(code);
});
