/**
 * start-all.cjs — Production entrypoint for Railway.
 *
 * Launches all three services in a single container:
 *   1. Quantus FastAPI  (Python, port 8000)
 *   2. Quantus Express  (Node,   port 3001)
 *   3. Main Express     (Node,   port $PORT — Railway assigns this)
 *
 * Stdout/stderr from child processes is piped to the parent so Railway
 * captures all logs in one stream.
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const QUANTUS_DIR = path.join(ROOT, "Quantus");

// Railway sets PORT; default to 8080
const MAIN_PORT = process.env.PORT || "8080";

function launch(label, command, args, opts = {}) {
  const child = spawn(command, args, {
    cwd: opts.cwd || ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...opts.env },
    shell: false,
  });

  const prefix = `[${label}]`;

  child.stdout.on("data", (data) => {
    for (const line of data.toString().split("\n").filter(Boolean)) {
      console.log(`${prefix} ${line}`);
    }
  });

  child.stderr.on("data", (data) => {
    for (const line of data.toString().split("\n").filter(Boolean)) {
      console.error(`${prefix} ${line}`);
    }
  });

  child.on("exit", (code, signal) => {
    console.error(`${prefix} exited (code=${code}, signal=${signal})`);
    // If the main Express server dies, bring everything down
    if (label === "main") {
      console.error("Main server exited — shutting down");
      process.exit(code || 1);
    }
  });

  return child;
}

// 1. Quantus FastAPI (Python) — use venv Python if available (Railway), else system python3
const venvPython = "/app/venv/bin/python3";
const pythonBin = fs.existsSync(venvPython) ? venvPython : "python3";

launch("quantus-api", pythonBin, [
  "-m", "uvicorn", "main:app",
  "--host", "0.0.0.0",
  "--port", "8000",
  "--log-level", "info",
], {
  cwd: QUANTUS_DIR,
  env: { PORT: "8000" },
});

// 2. Quantus Express (Node) — runs the built Quantus server
// We use tsx to run the TypeScript server in production too,
// but if a built version exists we should use that.
// For now, the Quantus Express server is compiled alongside the root build.
// Check if Quantus has a dist/server or if we need tsx:
const quantusServerEntry = path.join(QUANTUS_DIR, "server", "index.ts");

launch("quantus-node", "node", [
  "--import", "tsx",
  quantusServerEntry,
], {
  cwd: QUANTUS_DIR,
  env: {
    PORT: "3001",
    NODE_ENV: "production",
    AUTH_API_TARGET: `http://127.0.0.1:${MAIN_PORT}`,
  },
});

// 3. Main Express server (the bundled CJS)
// Small delay to let child services bind their ports
setTimeout(() => {
  launch("main", "node", [
    path.join(ROOT, "dist", "index.cjs"),
  ], {
    env: {
      PORT: MAIN_PORT,
      NODE_ENV: "production",
    },
  });
}, 2000);
