module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    // 'plugin:vue/vue3-strongly-recommended',
    'plugin:@typescript-eslint/recommended',
    // "prettier",
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: false,
      jsx: true,
    },
  },
  // plugins：eslint-plugin-vue @typescript-eslint/eslint-plugin eslint-plugin-prettier的缩写
  plugins: [
    'vue',
    '@typescript-eslint',
    // "prettier"
  ],
  rules: {
    indent: ['error', 2],
    quotes: ['error', 'single'],
    // semi: ['warn', 'always'],
    // 'arrow-spacing': 'error',
    // 'space-before-blocks': 'warn',
    // 'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // eslint-pugin-vue规则
    'vue/multi-word-component-names': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-self-closing': ['error', {
      html: {
        void: 'never',
        normal: 'any',
        component: 'any',
      },
      svg: 'always',
      math: 'always',
    }],
    // 'vue/script-indent': ['error', 2, {
    //   'baseIndent': 0,
    //   'switchCase': 0,
    //   'ignores': []
    // }],
    '@typescript-eslint/no-explicit-any': ['off'],
    // "prettier/prettier": "warn",
  },
};
