import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 生产环境移除 console/debugger 语句
function dropConsole(): Plugin {
  return {
    name: 'drop-console',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk') {
          chunk.code = chunk.code
            .replace(/console\.(log|debug|info|warn|error)\((?:[^)(]|\((?:[^)(]|\([^)]*\))*\))*\);?/g, '')
            .replace(/debugger;?/g, '')
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), dropConsole()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:7000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    // P1: 显式禁用生产环境 source map，防止源码泄露
    sourcemap: false,
    // 使用 esbuild 压缩（Vite 默认，更快）
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // 静态资源分类打包
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks: (id: string) => {
          // 将 React 相关库打包到单独的 chunk
          if (id.includes('node_modules/react')) {
            return 'react-vendor';
          }
          // 将 MUI 打包到单独的 chunk
          if (id.includes('node_modules/@mui')) {
            return 'mui-vendor';
          }
          // 将工具库打包到单独的 chunk
          if (id.includes('node_modules/axios') || id.includes('node_modules/zustand')) {
            return 'utils-vendor';
          }
        },
      },
    },
    // 开启 gzip 压缩（需要服务器支持）
    // brotliSize: false, // Vite 新版本已移除该选项
    // P2#47: 降低 chunk 大小警告阈值
    chunkSizeWarningLimit: 500,
  },
})
