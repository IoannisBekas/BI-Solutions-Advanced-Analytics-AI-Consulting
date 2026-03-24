import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { cp, readFile, rm } from "fs/promises";
import path from "path";
import { spawn } from "child_process";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "bcryptjs",
  "cors",
  "express",
  "express-rate-limit",
  "helmet",
  "jsonwebtoken",
  "resend",
];
// NOTE: better-sqlite3 is a native addon (.node) and MUST remain external.
// esbuild cannot bundle native C++ bindings — they must be loaded from node_modules at runtime.

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  await buildNestedApp("Quantus", path.resolve("Quantus"), "quantus");
  await buildNestedApp(
    "Power BI Solutions",
    path.resolve("PowerBI_Solutions", "app"),
    "power-bi-solutions",
  );

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  // Build Quantus Express server — compile TS to JS so we can run with
  // plain `node` in production instead of tsx (which has ESM resolution issues).
  console.log("building Quantus server...");
  const quantusPkg = JSON.parse(
    await readFile(path.resolve("Quantus", "package.json"), "utf-8"),
  );
  const quantusDeps = [
    ...Object.keys(quantusPkg.dependencies || {}),
    ...Object.keys(quantusPkg.devDependencies || {}),
  ];
  await esbuild({
    entryPoints: [path.resolve("Quantus", "server", "index.ts")],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/quantus-server.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: quantusDeps,
    logLevel: "info",
  });
}

function runCommand(command: string, args: string[], cwd: string) {
  const isWindows = process.platform === "win32";
  const commandLine = [command, ...args].map(quoteCommandPart).join(" ");

  return new Promise<void>((resolve, reject) => {
    const child = spawn(
      isWindows ? "cmd.exe" : command,
      isWindows ? ["/d", "/s", "/c", commandLine] : args,
      {
      cwd,
      stdio: "inherit",
      },
    );

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? "unknown"}`));
    });

    child.on("error", reject);
  });
}

async function buildNestedApp(
  label: string,
  cwd: string,
  targetSubdirectory: string,
) {
  console.log(`building ${label}...`);
  await runCommand("npm", ["run", "build"], cwd);

  const sourceDist = path.resolve(cwd, "dist");
  const targetDist = path.resolve("dist", "public", targetSubdirectory);
  await cp(sourceDist, targetDist, { recursive: true });
}

function quoteCommandPart(value: string) {
  if (!/[ \t"]/u.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
