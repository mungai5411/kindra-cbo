import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@/components': path.resolve(__dirname, './src/components'),
            '@/features': path.resolve(__dirname, './src/features'),
            '@/pages': path.resolve(__dirname, './src/pages'),
            '@/utils': path.resolve(__dirname, './src/utils'),
            '@/api': path.resolve(__dirname, './src/api'),
            '@/hooks': path.resolve(__dirname, './src/hooks'),
            '@/types': path.resolve(__dirname, './src/types')
        }
    },
    server: {
        port: 3000,
        host: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'mui-vendor': ['@mui/material', '@mui/icons-material'],
                    'redux-vendor': ['@reduxjs/toolkit', 'react-redux']
                }
            }
        }
    }
})
