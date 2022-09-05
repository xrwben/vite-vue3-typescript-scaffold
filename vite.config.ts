import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  root: path.resolve(__dirname, ''),
  base: '/',
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  publicDir: 'public', // 静态资源服务，里面的资源可直接访问
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: true,
    port: 8080,
    // proxy: {
    //   '/api': {
    //     target: 'http://jsonplaceholder.typicode.com',
    //     changeOrigin: true
    //   }
    // }
  },
  build: {
    outDir: 'dist',
    target: 'modules',
    sourcemap: true,
    minify: 'esbuild', // esbuild tester 当设置为'terser'时必须先安装terser
  }
})
