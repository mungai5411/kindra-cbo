import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            jsxImportSource: '@emotion/react',
        })
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
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        },
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('@mui')) {
                            return 'mui-vendor';
                        }
                        if (id.includes('react')) {
                            return 'react-vendor';
                        }
                        if (id.includes('@reduxjs') || id.includes('react-redux')) {
                            return 'redux-vendor';
                        }
                        if (id.includes('framer-motion')) {
                            return 'animation-vendor';
                        }
                        if (id.includes('recharts') || id.includes('chart')) {
                            return 'chart-vendor';
                        }
                        return 'vendor';
                    }
                    if (id.includes('src/components')) {
                        return 'components';
                    }
                    if (id.includes('src/features')) {
                        return 'features';
                    }
                    if (id.includes('src/pages')) {
                        return 'pages';
                    }
                }
            }
        }
    }
})
