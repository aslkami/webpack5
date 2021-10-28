const path = require("path");
const htmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "development", // 如果命令行用了 --mode=production 以 命令行的为准
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    publicPath: "/",
  },
  devServer: {
    static: path.resolve(__dirname, "public"), // 配置额外的静态服务文件夹，也就是 除了 dist 也可以用 localhost 访问 public 文件夹
    port: 8080,
    open: true,
    onBeforeSetupMiddleware(devServer) {
      // express()
      devServer.app.get("/api/users", (req, res) => {
        res.json([{ id: 1 }, { id: 2 }]);
      });
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        pathRewrite: { "^/api": "" },
      },
    },
  },
  //默认false,也就是不开启
  watch: false,
  //只有开启监听模式时，watchOptions才有意义
  watchOptions: {
    //默认为空，不监听的文件或者文件夹，支持正则匹配
    ignored: /node_modules/,
    //监听到变化发生后会等300ms再去执行，默认300ms
    aggregateTimeout: 300,
    //判断文件是否发生变化是通过不停的询问文件系统指定议是有变化实现的，默认每秒问1000次
    poll: 1000,
  },
  resolve: {
    alias: {
      "@": path.resolve("src"),
    },
  },
  // 配置外部模块，key 模块名， value 全局变量名
  externals: {
    lodash: "_",
  },
  optimization: {
    minimize: true, // 开启这个 development 环境下也会压缩
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
      // `...`,
      new CssMinimizerPlugin(),
      new TerserPlugin(),
    ],
  },
  module: {
    rules: [
      // {
      //   test: /\.jsx?$/,
      //   loader: "eslint-loader",
      //   enforce: "pre",
      //   options: { fix: true }, // build 的时候自动修复
      //   exclude: /node_modules/,
      // },
      // {
      //   test: require.resolve("lodash"), // 解析 lodash 路径
      //   loader: "expose-loader",
      //   options: {
      //     exposes: {
      //       globalName: "_", // 全局变量名
      //       override: true, // 如果原来有这个变量名，是否覆盖
      //     },
      //   },
      // },
      {
        test: /\.jsx?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  useBuiltIns: false,
                },
              ],
              "@babel/preset-react",
            ],
            plugins: [
              ["@babel/plugin-proposal-decorators", { legacy: true }],
              [
                "@babel/plugin-proposal-private-property-in-object",
                { loose: true },
              ],
              ["@babel/plugin-proposal-private-methods", { loose: true }],
              ["@babel/plugin-proposal-class-properties", { loose: true }],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "less-loader",
        ],
      },
      {
        test: /\.(jpg|jpeg|png|bmp|gif|svg)$/,
        type: "asset/resource",
        generator: {
          filename: "images/[hash][ext]",
        },
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: "./src/index.html",
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    }),
    // 自动向模块注入第三方模块，相当于 import _ from 'lodash', 属于模块作用域内
    // new webpack.ProvidePlugin({
    //   _: "lodash",
    // }),
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ["**/*"] }),
    // 在文件尾部 追加 # sourceMappingURL=http://127.0.0.1:8081/[xxx.map.js]]
    new webpack.SourceMapDevToolPlugin({
      append: "\n//# sourceMappingURL=http://127.0.0.1:8081/[url]",
      filename: "[file].map",
    }),
    // 在编译结束后复制 dist 下的 所有 map 文件 到 src 下的 maps 文件夹里
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            {
              source: "./dist/*.map",
              destination: path.resolve(__dirname, "maps"),
            },
          ],
          delete: ["./dist/*.map"],
        },
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/public"), //静态资源目录源地址
          to: path.resolve(__dirname, "dist/public"), //目标地址，相对于output的path目录
        },
      ],
    }),
  ],
};
