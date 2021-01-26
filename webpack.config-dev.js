const path = require("path");
const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

const dist = path.resolve(__dirname, "dist");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    index: "./js/index.js"
  },
  output: {
    path: dist,
    filename: "[name].js"
  },
  experiments: {
    asyncWebAssembly: true,
  },
  devServer: {
    contentBase: dist,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        path.resolve(__dirname, "static"),
      ],
    }),
    new WasmPackPlugin({
      crateDirectory: __dirname,
    }),
    new webpack.HotModuleReplacementPlugin(),
  ]
};
