const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    bundle: "./bootstrap.js",
  },
  output: {
    path: path.resolve(__dirname, "../docs"),
    filename: "[name]-[hash].js",
  },
  plugins: [
    new CopyWebpackPlugin(["index.html"]),
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
