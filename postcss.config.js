module.exports = {
    plugins: {
      'postcss-import': {},
      'postcss-preset-env': {
          browsers: 'last 4 versions'
      },
      cssnano: {
          preset: ['default', {
                discardComments: {
                    removeAll: true,
                },
          }]
      }
    }
  }