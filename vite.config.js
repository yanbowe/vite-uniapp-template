import path from 'node:path'
import { defineConfig } from 'vite'
import useUni from '@dcloudio/vite-plugin-uni'
import useEslint from 'vite-plugin-eslint'
import useUnoCSS from 'unocss/vite'
import useUniPages from '@uni-helper/vite-plugin-uni-pages'

import postcssConfig from './postcss.config.js'

import {
  proxyPath,
  proxyPort,
  proxyURL,
  requestFilePath,
  requestPath,
  useProxy,
} from './src/configs/devServer.js'

import { homePage } from './src/configs/index.js'

const isDevelopment = process.env.NODE_ENV === 'development'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    useEslint(),
    useUnoCSS(),
    useUniPages({
      mergePages: false,
      homePage,
    }),
    useUni(),
  ],
  server: {
    cors: true,
    host: true,
    port: proxyPort,
    proxy: {
      ...(useProxy && proxyURL
        ? {
            [`^${proxyPath}`]: {
              target: `${proxyURL}${requestPath}`,
              changeOrigin: true,
              rewrite: path => path.replace(new RegExp(`^${proxyPath}`), ''),
            },
            // 解决开发环境上传图片无法直接显示的问题
            [`^${requestFilePath}`]: {
              target: `${proxyURL}${requestFilePath}`,
              changeOrigin: true,
              rewrite: path =>
                path.replace(new RegExp(`^${requestFilePath}`), ''),
            },
          }
        : {}),
    },
  },
  resolve: {
    alias: {
      '^@': path.resolve(__dirname, './src/'),
      '$uni-router': path.resolve(__dirname, './src/utils/uni-router/'),
    },
  },
  css: {
    // 修复外部 postcss.config.js 不被解析的问题
    postcss: postcssConfig,
  },
  build: {
    // minify: false,
    // TODO 解决 Windows 下开发模式控制台提示崩溃的问题
    ...(isDevelopment
      ? {
          watch: {
            exclude: ['node_modules/**', '/__uno.css'],
          },
        }
      : {}),
  },
})
