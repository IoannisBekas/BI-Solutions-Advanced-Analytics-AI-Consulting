const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const [, , cwdArg, logPrefix, command, ...args] = process.argv;

if (!cwdArg || !logPrefix || !command) {
  console.error("Usage: node script/spawn-detached.cjs <cwd> <logPrefix> <command> [args...]");
  process.exit(1);
}

const cwd = path.resolve(cwdArg);
const stdoutPath = path.resolve(cwd, `${logPrefix}.log`);
const stderrPath = path.resolve(cwd, `${logPrefix}.err.log`);

const stdoutFd = fs.openSync(stdoutPath, "a");
const stderrFd = fs.openSync(stderrPath, "a");

const child = spawn(command, args, {
  cwd,
  detached: true,
  stdio: ["ignore", stdoutFd, stderrFd],
  shell: false,
});

child.unref();

console.log(JSON.stringify({
  pid: child.pid,
  cwd,
  stdout: stdoutPath,
  stderr: stderrPath,
}));
