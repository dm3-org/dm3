module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    extends: ['prettier'],
    plugins: ['no-only-tests'],
    ignorePatterns: ['package.json', '**/*.js', '**/billboard-widget/**'],
    rules: {
        'max-len': ['error', { code: 120 }],
        'no-only-tests/no-only-tests': ['error'],
    },
};
