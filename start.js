import figlet from "figlet";

const orange = "\x1b[38;5;214m";
const reset = "\x1b[0m";
const green = "\x1b[38;5;122m";

console.log(orange + figlet.textSync("RertChat", {
  font: "Standard",
  horizontalLayout: "default",
  verticalLayout: "default",
  width: 80,
  whitespaceBreak: true
}) + reset);

console.log(green + "\n  正在编译项目...\n" + reset);

import { spawn } from "child_process";

const build = spawn("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
  env: { ...process.env }
});

build.on("close", (code) => {
  if (code === 0) {
    console.log(green + "\n  编译完成，正在启动生产服务器...\n" + reset);

    const start = spawn("npx", ["next", "start"], {
      stdio: "inherit",
      shell: true,
      cwd: process.cwd()
    });

    start.on("close", (startCode) => {
      process.exit(startCode);
    });
  } else {
    process.exit(code);
  }
});
