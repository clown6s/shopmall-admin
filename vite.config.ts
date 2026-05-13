import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
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
    // Terser 压缩选项（如果需要更小体积，可以安装 terser）
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // } as any,
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
    // 消除打包大小警告
    chunkSizeWarningLimit: 1000,
  },
})
