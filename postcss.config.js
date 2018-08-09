module.exports = {
  //  parser: 'sugarss',
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
      //,
    //  autoprefixer: { browsers: ['last 4 versions', 'iOS >= 8'] }
    }
  }