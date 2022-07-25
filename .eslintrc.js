module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
    },
    'extends': [
        'google',
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module',
    },
    'ignorePatterns': [
        'node_modules/*',
        'api/*',
        'dist/*',
        'publish/*',
        'webpack.config.js',
        'jest.config.js',
    ],
    'plugins': [
        '@typescript-eslint',
    ],
    'rules': {
        'max-len': 'off',
        'require-jsdoc': 'off',
        'eqeqeq': ['error', 'always'],
        'indent': ['error', 4],
    },
};
