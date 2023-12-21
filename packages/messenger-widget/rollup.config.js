import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import postCSS from 'rollup-plugin-postcss';
import url from '@rollup/plugin-url';
import pkg from './package.json';

export default {
    input: 'src/widget.tsx',
    output: [
        {
            file: './dist/cjs/index.js',
            format: 'cjs',
        },
        {
            file: './dist/esm/index.js',
            format: 'es',
        },
    ],
    external: [
        ...Object.keys(pkg.peerDependencies || {}),
        'react/jsx-runtime',
        'dm3-lib',
        'react-chat-widget/lib/styles.css',
        'socket.io-client',
        'react-beforeunload',
        'bootstrap/dist/css/bootstrap.min.css',
        'localforage',
        'react-chat-widget',
        '@metamask/detect-provider',
        '@walletconnect/web3-provider',
        'ethereum-blockies-base64',
    ],
    plugins: [
        url(),
        commonjs(),
        typescript({
            sourceMap: true,
            typescript: require('typescript'),
        }),
        postCSS({
            plugins: [require('autoprefixer')],
        }),
    ],
};
