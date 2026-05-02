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

console.log("\n  正在编译项目...\n");

import { spawn } from "child_process";

process.env.NEXT_FONT_GOOGLE_MIRROR = "https://fonts.googleapis.cn";

const build = spawn("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
  env: { ...process.env }
});

build.on("close", (code) => {
  if (code === 0) {
    console.log("\n  编译完成，正在启动生产服务器...\n");

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
