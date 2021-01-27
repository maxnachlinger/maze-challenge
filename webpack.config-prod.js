const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

const docs = path.resolve(__dirname, "docs");

module.exports = {
  mode: "production",
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
    new CopyPlugin({
      patterns: [path.resolve(__dirname, "static")],
    }),
    new WasmPackPlugin({
      crateDirectory: __dirname,
    }),
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
