module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parser: 'vue-eslint-parser',
  extends: [
    'plugin:vue/essential',
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    project: "tsconfig.eslint.json",
    extraFileExtensions: ['.vue', '.md']
  },
  ignorePatterns: ['dist', 'docs', '!vuepress/.vuepress', 'vuepress/**/*.md'],
  plugins: [
    'vue',
    '@typescript-eslint',
  ],
  rules: {
    'max-len': [
      "error",
      {
        "ignoreComments": true,
        "ignoreTrailingComments": true,
        code: 100,
        "ignoreTemplateLiterals": true,
        "ignoreStrings": true
      }
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        "selector": "variable",
        format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case']
      }
    ],
    'no-plusplus': 'off',
    'no-bitwise': 'off',
    'no-nested-ternary': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-continue': 'off'
  },
};
