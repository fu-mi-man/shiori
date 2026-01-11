import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // プラグイン設定
  plugins: [react(), tailwindcss()], // ReactのJSX変換やHMR(ホットリロード)を有効化、Tailwind CSS v4を有効化

  // 開発サーバーの設定
  server: {
    // 本番（Vercel）では無視されるので，開発環境では全てのネットワークインターフェースでリッスン（Docker用）
    host: '0.0.0.0',
  },
})
