import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        plugins: [react(), dts()],
        define: {
            'process.env': {},
        },
        build: {
            lib: {
                // Could also be a dictionary or array of multiple entry points
                entry: resolve(__dirname, './src/App.tsx'),
                name: 'Dm3BillboardWidget',
                // the proper extensions will be added
                fileName: 'billboard-widget',
                formats: ['es', 'cjs'],
            },
            rollupOptions: {
                // make sure to externalize deps that shouldn't be bundled
                // into your library
                external: ['react', 'react-dom/client'],
                output: {
                    // Provide global variables to use in the UMD build
                    // for externalized deps
                    globals: {
                        react: 'react',
                    },
                },
            },
            cssCodeSplit: false,
        },
    };
});
