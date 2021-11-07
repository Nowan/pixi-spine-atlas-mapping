const webpack = require("webpack");
const path = require("path");
const child_process = require("child_process");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WatchExternalFilesPlugin = require("webpack-watch-files-plugin").default;
console.log(WatchExternalFilesPlugin)
const BUILD_DIR = "dist/";

module.exports = {
  mode: 'production',
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env'],
            plugins: ["@babel/plugin-transform-async-to-generator"]
          }
        }
      }
    ]
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, BUILD_DIR)
  },
  devServer: {
    contentBase: path.join(__dirname, BUILD_DIR),
    serveIndex: true
  },
  plugins: [
    new WatchExternalFilesPlugin({
      files: [
        "build.config.js"
      ]
    }),
    new CleanWebpackPlugin({
      root: path.resolve(__dirname, "../")
    }),
    new webpack.DefinePlugin({
      PROD: JSON.stringify(process.env.NODE_ENV)
    }),
    new HtmlWebpackPlugin({
      template: "./index.html"
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "src/assets/", 
          to: "assets/"
        }
      ]
    }),
    new class RepackPlugin {
      apply(compiler) {
        compiler.hooks.compile.tap('RepackPlugin', (compilation) => {
          child_process.execSync("npm run packAndMap");
        });
      }
    }
  ]
};
