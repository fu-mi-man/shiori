import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // プラグイン設定
  plugins: [react()], // ReactのJSX変換やHMR(ホットリロード)を有効化

  // 開発サーバーの設定
  server: {
    // 本番（Vercel）では無視されるので，開発環境では全てのネットワークインターフェースでリッスン（Docker用）
    host: '0.0.0.0',
  },
})
