/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // This is done to support SVG & other images rendering
    webpack: config => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        config.module.rules.push({
            test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 100000
                }
            }
        });
        return config;
    },
 };
 
 
 export default nextConfig;