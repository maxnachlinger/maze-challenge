const path = require("path");
const webpack = require("webpack");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')

const docs = path.resolve(__dirname, "docs");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    index: "./client/index.js",
  },
  output: {
    path: docs,
    filename: "[name].js",
  },
  experiments: {
    asyncWebAssembly: true,
  },
  devServer: {
    contentBase: docs,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/index.html'
    }),
    new WasmPackPlugin({
      crateDirectory: __dirname,
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  module: {
    rules: [
      { test: /\.js$/, use: ["babel-loader"] },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
