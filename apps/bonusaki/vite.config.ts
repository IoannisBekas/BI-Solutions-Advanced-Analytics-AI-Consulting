import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { getDeployBasePath, joinBasePath } from "../../script/deployBase";

export default defineConfig({
  base: joinBasePath(getDeployBasePath(), "bonusaki/demo"),
  plugins: [tailwindcss()],
  server: {
    host: "127.0.0.1",
    allowedHosts: ["localhost", "127.0.0.1"],
  },
});
