import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), ['VITE_', 'REACT_APP_']);

    return {
        plugins: [react()],
        define: {
            'process.env.REACT_APP_BILLBOARD_BACKEND': JSON.stringify(
                env.REACT_APP_BILLBOARD_BACKEND,
            ),
        },
    };
});
