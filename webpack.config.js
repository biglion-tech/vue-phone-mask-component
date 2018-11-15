const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

let config = {
  output: {
    path: path.resolve(__dirname + '/dist/'),
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: __dirname,
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue'
      },
        {
            test: /\.css$/,
            loader: 'style!less!css'
        }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin( {
      minimize : true,
      sourceMap : false,
      mangle: true,
      compress: {
        warnings: false
      }
    } )
  ]
};


module.exports = [
  merge(config, {
    entry: path.resolve(__dirname + '/src/plugin.js'),
    output: {
      filename: 'vue-phone-mask.min.js',
      libraryTarget: 'window',
      library: 'VuePhoneMask',
    }
  }),
  merge(config, {
    entry: path.resolve(__dirname + '/src/PhoneMask.vue'),
    output: {
      filename: 'vue-phone-mask.js',
      libraryTarget: 'umd',
      library: 'vue-phone-mask',
      umdNamedDefine: true
    }
  })
];
