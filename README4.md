## 优化 [课件](http://www.zhufengpeixun.com/strong/html/103.8.webpack-optimize1.html)

#### 缩小查找返回

- extensions 配置解析后缀名
- alias 配置别名
- modules 指定依赖模块 默认 ['node_modules']
- mainFields 指定 package.json 的字段作为入口
- mainFiles 没有 package.json 的时候 指定入口文件
- resovleLoader，里面配置项和上述一致，只不过是配置 loader 的

#### noParse

对于没有模块依赖的包，如 jquery，直接告诉 webpack 说不用去 解析了

#### webpack.ignorePlugin

- 指定模块的某些文件不被打包进去

```javascript
new webpack.IgnorePlugin({
  //A RegExp to test the context (directory) against.
  contextRegExp: /moment$/,
  //A RegExp to test the request against.
  resourceRegExp: /^\.\/locale/,
});
```

#### 费时分析

- 分析各模块的 打包时间

```javascript
const SpeedMeasureWebpackPlugin = require("speed-measure-webpack-plugin");
const smw = new SpeedMeasureWebpackPlugin();
module.exports = smw.wrap({});
```

#### webpack-bundle-analyzer

- 是一个 webpack 的插件，需要配合 webpack 和 webpack-cli 一起使用。这个插件的功能是生成代码分析报告，帮助提升代码质量和网站性能

#### libraryTarget 和 library

- output.library 配置导出库的名称
- output.libraryExport 配置要导出的模块中哪些子模块需要被导出。 它只有在 output.libraryTarget 被设置成 commonjs 或者 commonjs2 时使用才有意义
- output.libraryTarget 配置以何种方式导出库,是字符串的枚举类型，支持以下配置
  - var
  - commonjs exports.xxxx
  - commonjs2 module.exports = xxxx
  - amd
  - this
  - window
  - global
  - umd

#### purgecss-webpack-plugin

- 相当于 css 版本的 tree shaking

```javascript
new PurgecssPlugin({
  paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
});
```

#### thread-loader

多线程打包

#### CDN

- 使用缓存

  - HTML 文件不缓存，放在自己的服务器上，关闭自己服务器的缓存，静态资源的 URL 变成指向 CDN 服务器的地址
  - 静态的 JavaScript、CSS、图片等文件开启 CDN 和缓存，并且文件名带上 HASH 值
  - 为了并行加载不阻塞，把不同的静态资源分配到不同的 CDN 服务器上

- 域名限制

  - 同一时刻针对同一个域名的资源并行请求是有限制
  - 可以把这些静态资源分散到不同的 CDN 服务上去
  - 多个域名后会增加域名解析时间
  - 可以通过在 HTML HEAD 标签中 加入<link rel="dns-prefetch" href="http://img.zhufengpeixun.cn">去预解析域名，以降低域名解析带来的延迟

- 文件指纹
  - ext 资源后缀名
  - name 文件名称
  - path 文件的相对路径
  - folder 文件所在的文件夹
  - hash 每次 webpack 构建时生成一个唯一的 hash 值
  - chunkhash 根据 chunk 生成 hash 值，来源于同一个 chunk，则 hash 值就一样
  - contenthash 根据内容生成 hash 值，文件内容相同 hash 值就相同

#### Tree Shaking

- webpack 默认支持，在.babelrc 里设置 module:false 即可在 production mode 下默认开启(babel-loader 里也可设置)
- 要注意把 devtool 设置为 null 在 package.json 中配置：
- "sideEffects": false 所有的代码都没有副作用（都可以进行 tree shaking）
- 可能会把 css / @babel/polyfill 文件干掉 可以设置"sideEffects":["*.css"]

#### 代码分割

- 入口点分割
- 动态导入和懒加载

  - preload 是告诉浏览器页面必定需要的资源，浏览器一定会加载这些资源
  - prefetch 是告诉浏览器页面可能需要的资源，浏览器不一定会加载这些资源
  - 建议：对于当前页面很有必要的资源使用 preload,对于可能在将来的页面中使用的资源使用 prefetch

- 提取公共代码

```javascript
const HtmlWebpackPlugin = require("html-webpack-plugin");
const config = {
  entry: {
    page1: "./src/page1.js",
    page2: "./src/page2.js",
    page3: "./src/page3.js",
  },
  optimization: {
    splitChunks: {
      // 表示选择哪些 chunks 进行分割，可选值有：async，initial和all
      chunks: "all",
      // 表示新分离出的chunk必须大于等于minSize，默认为30000，约30kb。
      minSize: 0, //默认值是20000,生成的代码块的最小尺寸
      // 表示一个模块至少应被minChunks个chunk所包含才能分割。默认为1。
      minChunks: 1,
      // 表示按需加载文件时，并行请求的最大数目。默认为5。
      maxAsyncRequests: 3,
      // 表示加载入口文件时，并行请求的最大数目。默认为3
      maxInitialRequests: 5,
      // 表示拆分出的chunk的名称连接符。默认为~。如chunk~vendors.js
      automaticNameDelimiter: "~",
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/, //条件
          priority: -10, ///优先级，一个chunk很可能满足多个缓存组，会被抽取到优先级高的缓存组中,为了能够让自定义缓存组有更高的优先级(默认0),默认缓存组的priority属性为负值.
        },
        default: {
          minChunks: 2, ////被多少模块共享,在分割之前模块的被引用次数
          priority: -20,
        },
      },
    },
    runtimeChunk: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      chunks: ["page1"],
      filename: "page1.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      chunks: ["page2"],
      filename: "page2.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      chunks: ["page3"],
      filename: "page3.html",
    }),
  ],
};
```

- 大网站有多个页面，每个页面由于采用相同技术栈和样式代码，会包含很多公共代码，如果都包含进来会有问题
- 相同的资源被重复的加载，浪费用户的流量和服务器的成本；
- 每个页面需要加载的资源太大，导致网页首屏加载缓慢，影响用户体验。
- 如果能把公共代码抽离成单独文件进行加载能进行优化，可以减少网络传输流量，降低服务器成本
- reuseExistingChunk, 如果当前的代码包含已经被从主 bundle 中分割出去的模块，它将会被重用，而不会生成一个新的代码块

```javascript
{
  cacheGroups:{
     defaultVendors:false,
     default:false,
     common:{
         minChunks: 1,
         reuseExistingChunk:false
    }
  }
}
```

#### 开启 scope hoisting

- Scope Hoisting 可以让 Webpack 打包出来的代码文件更小、运行的更快， 它又译作 "作用域提升"，是在 Webpack3 中新推出的功能。
- 初 webpack 转换后的模块会包裹上一层函数,import 会转换成 require
- 代码体积更小，因为函数申明语句会产生大量代码
- 代码在运行时因为创建的函数作用域更少了，内存开销也随之变小
- 大量作用域包裹代码会导致体积增大
- 运行时创建的函数作用域变多，内存开销增大
- scope hoisting 的原理是将所有的模块按照引用顺序放在一个函数作用域里，然后适当地重命名一些变量以防止命名冲突
- 这个功能在 mode 为 production 下默认开启,开发环境要用 `webpack.optimize.ModuleConcatenationPlugin` 插件
- 也要使用 ES6 Module,CJS 不支持

#### 利用缓存

- babel-loader

Babel 在转义 js 文件过程中消耗性能较高，将 babel-loader 执行的结果缓存起来，当重新打包构建时会尝试读取缓存，从而提高打包构建速度、降低消耗
{

```javascript
 {
    test: /\.js$/,
    exclude: /node_modules/,
    use: [{
      loader: "babel-loader",
      options: {
        cacheDirectory: true
      }
    }]
  },
```

- cache-loader

在一些性能开销较大的 loader 之前添加此 loader,以将结果缓存到磁盘里
存和读取这些缓存文件会有一些时间开销,所以请只对性能开销较大的 loader 使用此 loader

```javascript
const loaders = ["babel-loader"];
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["cache-loader", ...loaders],
        include: path.resolve("src"),
      },
    ],
  },
};
```

- oneOf

每个文件对于 rules 中的所有规则都会遍历一遍，如果使用 oneOf 就可以解决该问题，只要能匹配一个即可退出。(注意：在 oneOf 中不能两个配置处理同一种类型文件)

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        //优先执行
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
          fix: true
        }
      },
      {
        // 以下 loader 只会匹配一个
        oneOf: [
          ...,
          {},
          {}
        ]
      }
    ]
  }
```
