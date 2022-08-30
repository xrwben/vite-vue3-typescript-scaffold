module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 375,
    },
    'autoprefixer': {
      overrideBrowserslist: [
        'last 5 version'
      ]
    }
  }
}