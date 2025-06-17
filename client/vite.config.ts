/// <reference types="vitest/config" />

import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const generateScopedName = mode === 'production'
    ? '[hash:base64:5]'
    : '[name]__[local]___[hash:base64:5]';

  return {
    css: {
      modules: {
        generateScopedName,
        localsConvention: 'camelCaseOnly',
      },
    },
    plugins: [
      // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@styles": path.resolve(__dirname, "./src/styles"),
        "@components": path.resolve(__dirname, "./src/components"),
      },
    },
    test: {
      silent: 'passed-only',
      typecheck: {
        enabled: true,
      },
      printConsoleTrace: true,
    }
  }
})
