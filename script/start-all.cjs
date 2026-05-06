/**
 * start-all.cjs - Production entrypoint for the full application topology.
 *
 * Launches all three services in a single container:
 *   1. Quantus FastAPI  (Python, port 8000)
 *   2. Quantus Express  (Node,   port 3001)
 *   3. Main Express     (Node,   port $PORT - Railway assigns this)
 *
 * Stdout/stderr from child processes is piped to the parent so Railway
 * captures all logs in one stream.
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const QUANTUS_DIR = path.join(ROOT, "apps", "quantus");

// Railway sets PORT; default to 8080.
const MAIN_PORT = process.env.PORT || "8080";
const PYTHON_API_HOST = process.env.PYTHON_API_HOST || "127.0.0.1";

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
    if (label === "main") {
      console.error("Main server exited - shutting down");
      process.exit(code || 1);
    }
  });

  return child;
}

// 1. Quantus FastAPI (Python) - prefer the venv interpreter when present.
const venvPython = "/app/venv/bin/python3";
const pythonBin = fs.existsSync(venvPython) ? venvPython : "python3";

launch("quantus-api", pythonBin, [
  "-m",
  "uvicorn",
  "main:app",
  "--host",
  PYTHON_API_HOST,
  "--port",
  "8000",
  "--log-level",
  "info",
], {
  cwd: QUANTUS_DIR,
  env: { PORT: "8000", PYTHON_API_HOST },
});

// 2. Quantus Express (Node) - run the esbuild-compiled CJS bundle.
// tsx has ESM resolution issues with moduleResolution:bundler, so we
// compile the Quantus server at build time instead.
launch("quantus-node", "node", [
  path.join(ROOT, "dist", "quantus-server.cjs"),
], {
  cwd: QUANTUS_DIR,
  env: {
    PORT: "3001",
    NODE_ENV: "production",
    AUTH_API_TARGET: `http://127.0.0.1:${MAIN_PORT}`,
    // esbuild externalizes Quantus deps - Node must find them at runtime.
    NODE_PATH: path.join(QUANTUS_DIR, "node_modules"),
  },
});

// 3. Main Express server (the bundled CJS).
// Small delay to let child services bind their ports.
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
