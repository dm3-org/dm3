const esbuild = require('esbuild');

async function build() {
    await esbuild.build({
        entryPoints: [
            'src/styles/app.pcss',
            'src/styles/classic.pcss',
            'src/styles/streameth.pcss',
        ],
        outdir: 'dist/styles/',
        minify: true,
        bundle: true,
        loader: {
            '.css': 'css',
            '.pcss': 'css',
        },
    });
}

build().catch((e) => {
    console.error(e);
    process.exit(1);
});
