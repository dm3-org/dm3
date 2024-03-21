const webpack = require('webpack');
module.exports = function override(config) {
    const fallback = config.resolve.fallback || {
        /**
         * Added to remove errors for smtp as webpack 5
         * doesn't support modules of node.js in react by default
         **/
        fs: false,
        zlib: false,
        net: false,
        dns: false,
        tls: false,
        child_process: false,
    };
    Object.assign(fallback, {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url'),
        path: require.resolve('path-browserify'),
    });
    config.module.rules.push({
        test: /\.(js|mjs|jsx)$/,
        enforce: 'pre',
        loader: require.resolve('source-map-loader'),
        resolve: {
            fullySpecified: false,
        },
    });
    config.resolve.fallback = fallback;

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);

    config.module.rules = config.module.rules.map((rule) => {
        if (rule.oneOf instanceof Array) {
            rule.oneOf[rule.oneOf.length - 1].exclude = [
                /\.(js|mjs|jsx|cjs|ts|tsx)$/,
                /\.html$/,
                /\.json$/,
            ];
        }
        return rule;
    });

    return config;
};
