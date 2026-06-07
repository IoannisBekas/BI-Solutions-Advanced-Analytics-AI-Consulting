const fs = require("fs");
const path = require("path");

const appRoot = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(appRoot, "index.html"), "utf8");
const mainJs = fs.readFileSync(path.join(appRoot, "src", "main.js"), "utf8");

const requiredFiles = ["index.html", "qr.svg", "favicon.svg", "src/main.js", "src/styles.css"];
const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(appRoot, file)));
const publicDemoUrl = "https://www.bisolutions.group/bonusaki/demo/";

if (missingFiles.length > 0) {
  throw new Error(`Missing Bonusaki demo file(s): ${missingFiles.join(", ")}`);
}

if (indexHtml.includes("cdn.tailwindcss.com")) {
  throw new Error("Bonusaki demo must not use the Tailwind CDN in production.");
}

if (mainJs.includes('src="./qr.svg"')) {
  throw new Error("Dynamic QR images must use the Vite-resolved QR_URL asset.");
}

if (!indexHtml.includes(publicDemoUrl)) {
  throw new Error(`The visible QR fallback link must point to ${publicDemoUrl}`);
}

for (const endpoint of [
  "/api/bonusaki/events",
  "/api/bonusaki/rewards/issue",
  "/api/bonusaki/rewards/validate",
  "/api/bonusaki/rewards/redeem",
]) {
  if (!mainJs.includes(endpoint)) {
    throw new Error(`Bonusaki pilot must call ${endpoint}.`);
  }
}

if (!mainJs.includes("cashierPin")) {
  throw new Error("Bonusaki cashier flow must submit a cashier PIN.");
}

if (!mainJs.includes("qrCode") || !mainJs.includes("qrVerify")) {
  throw new Error("Bonusaki reward issue flow must include QR code attribution.");
}

if (!mainJs.includes("/api/bonusaki/events")) {
  throw new Error("Bonusaki demo must send privacy-safe engagement events.");
}

if (!mainJs.includes("new URLSearchParams(window.location.search)")) {
  throw new Error("Bonusaki demo must include QR attribution parameters in event metadata.");
}

if (/onclick\s*=/.test(indexHtml) || /onclick\s*=/.test(mainJs)) {
  throw new Error("Bonusaki demo must not use inline onclick handlers; production CSP blocks them.");
}

for (const name of ["renderCustomer", "addToWallet", "simulateRedeem"]) {
  if (!mainJs.includes(name)) {
    throw new Error(`Expected demo function ${name} to be present.`);
  }
}

console.log("Bonusaki demo checks passed.");
