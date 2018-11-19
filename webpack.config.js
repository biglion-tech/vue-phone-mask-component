const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname + '/src/PhoneMask.vue'),
  output: {
    path: path.resolve(__dirname + '/dist/'),
    filename: 'vue-phone-mask-component.js',
    libraryTarget: 'umd',
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
  externals: {
    inputmask: 'inputmask'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin( {
      minimize : true,
      sourceMap : false,
      mangle: true,
      compress: {
        warnings: false
      }
    })
  ]
};