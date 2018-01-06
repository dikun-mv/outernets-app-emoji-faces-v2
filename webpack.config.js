const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const buildPath = path.resolve(__dirname, "./build");

const config = {

  devtool: 'source-map',

  entry: "./src/app.js",

  output: {
    path: buildPath,
    filename: "bundle.js"
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
      },
      {
        test: /.(json|csv)/,
        loader: "file-loader",
      }
    ],
  },

  plugins: [
    new CopyWebpackPlugin([
      { from: './public', to: './public' }
    ]),
  ]
};

module.exports = config;