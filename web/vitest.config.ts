import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()], // JSX変換を有効化（Reactコンポーネントのテストに必要）

  resolve: {
    alias: {
      // tsconfig.jsonの"@/*": ["./src/*"]と同期。import.meta.urlはVitest公式推奨のESModules対応パス解決
      "@/": new URL("./src/", import.meta.url).pathname,
    },
  },

  test: {
    include: ["tests/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"], // tests/配下（推奨）とsrc/配下（コロケーション）の両方を対象
    environment: "node", // デフォルトはNode.js環境。コンポーネントテスト時はファイル先頭に // @vitest-environment jsdom を指定
  },
});
