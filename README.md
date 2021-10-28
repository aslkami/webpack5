## 环境变量

1. --mode，process.env.NODE_ENV 只能在打包模块内获取，在 node 里无法获取，如果命令行用了 --mode=production 以 命令行的为准
2. --env, 只能在 配置文件 (env) => {} 取到, node 和 打包模块里取不到
3. cross-env, node 可以取到 ，其它地方取不到
4. webpack.DefinePlugin 可以让 打包模块获取到定义的变量, 原理就是 打包的时候 直接替换变量的值

## 样式 loader

1. sass-loader less-loader 将 sass 和 less 文件转化成 css
2. postcss-loader 处理 css 的兼容，如加前缀
3. css-loader 处理 @import 和 url()
4. style-loader 将 css 转化成 js 文件，因为 webpack 只能识别 js 文件

## browserslist

1. [browserslist](https://github.com/browserslist/browserslist)
2. [browserslist-example](https://github.com/browserslist/browserslist-example)
3. .browserslistrc
4. package.json

```json
{
  "browserslist": {
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ],
    "production": [">0.2%"]
  }
}
```

## url-loader file-loader

1. webpack5 出了 [asset-modules](https://webpack.js.org/guides/asset-modules/)

## babel

1. babel-loader 只是个转化函数，使用 Babel 和 webpack 转译 JavaScript 文件
2. @babel/@babel/core Babel 编译的核心包
3. babel-preset-env 一些语法的聚合包
4. @babel/@babel/preset-reactReact 插件的 Babel 预设
5. @babel/plugin-proposal-decorators 把类和对象装饰器编译成 ES5
6. @babel/plugin-proposal-class-properties 转换静态类属性以及使用属性初始值化语法声明的属性

## source-map

- eval 使用 eval 包裹模块代码
- source-map 产生.map 文件
- cheap 不包含列信息（关于列信息的解释下面会有详细介绍)也不包含 loader 的 sourcemap
- module 包含 loader 的 sourcemap（比如 jsx to js ，babel 的 sourcemap）,否则无法定义源文件
- inline 将.map 作为 DataURI 嵌入，不单独生成.map 文件
- hidden 不关联源文件

1. 顺序：[inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map
2. source-map 单独在外部生成完整的 sourcemap 文件，并且在目标文件里建立关联,能提示错误代码的准确原始位置
3. inline-source-map 以 base64 格式内联在打包后的文件中，内联构建速度更快,也能提示错误代码的准确原始位置
4. hidden-source-map 会在外部生成 sourcemap 文件,但是在目标文件里没有建立关联,不能提示错误代码的准确原始位置
5. eval-source-map 会为每一个模块生成一个单独的 sourcemap 文件进行内联，并使用 eval 执行
6. nosources-source-map 也会在外部生成 sourcemap 文件,能找到源始代码位置，但源代码内容为空
7. cheap-source-map 外部生成 sourcemap 文件,不包含列和 loader 的 map
8. cheap-module-source-map 外部生成 sourcemap 文件,不包含列的信息但包含 loader 的 map

- 最佳实践(测试环境)
- 我们在开发环境对 sourceMap 的要求是：速度快，调试更友好
- 要想速度快 推荐 eval-cheap-source-map
- 如果想调试更友好 cheap-module-source-map
- 折中的选择就是 eval-source-map

- 最佳实践(正式环境)
- 首先排除内联，因为一方面我们需要隐藏源代码，另一方面要减少文件体积
- 要想调试友好 sourcemap>cheap-source-map/cheap-module-source-map>hidden-source-map/nosources-sourcemap
- 要想速度快 优先选择 cheap
- 折中的选择就是 hidden-source-map

## polyfill

- @babel/preset-env 会根据预设的浏览器兼容列表从 stage-4 选取必须的 plugin，也就是说，不引入别的 stage-x，@babel/preset-env 将只支持到 stage-4

1. babel-polyfill

- Babel 默认只转换新的 javascript 语法，而不转换新的 API，比如 Iterator, Generator, Set, Maps, Proxy, Reflect,Symbol,Promise 等全局对象。以及一些在全局对象上的方法(比如 Object.assign)都不会转码。
- 比如说，ES6 在 Array 对象上新增了 Array.form 方法，Babel 就不会转码这个方法，如果想让这个方法运行，必须使用 babel-polyfill 来转换等
- babel-polyfill 它是通过向全局对象和内置对象的 prototype 上添加方法来实现的。比如运行环境中不支持 Array.prototype.find 方法，引入 polyfill, 我们就可以使用 es6 方法来编写了，但是缺点就是会造成全局空间污染
- @babel/@babel/preset-env 为每一个环境的预设
- @babel/preset-env 默认支持语法转化，需要开启 useBuiltIns 配置才能转化 API 和实例方法
- useBuiltIns 可选值包括："usage" | "entry" | false, 默认为 false，表示不对 polyfills 处理，这个配置是引入 polyfills 的关键

  1.1 "useBuiltIns": false 此时不对 polyfill 做操作。如果引入 @babel/polyfill，则无视配置的浏览器兼容，引入所有的 polyfill
  1.2 "useBuiltIns": "entry", 在项目入口引入一次（多次引入会报错）
  "useBuiltIns": "entry" 根据配置的浏览器兼容，引入浏览器不兼容的 polyfill。需要在入口文件手动添加 import '@babel/polyfill'，会自动根据 browserslist 替换成浏览器不兼容的所有 polyfill
  这里需要指定 core-js 的版本, 如果 "corejs": 3, 则 import '@babel/polyfill' 需要改成 import 'core-js/stable';import 'regenerator-runtime/runtime';
  corejs 默认是 2,配置 2 的话需要单独安装 core-js@3

  ```javascript
  import '@babel/polyfill';
  import 'core-js/stable';
  import 'regenerator-runtime/runtime';
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [["@babel/preset-env", {
          useBuiltIns: 'entry',
        corejs: { version: 2 }
      }], "@babel/preset-react"],
        plugins: [
          ["@babel/plugin-proposal-decorators", { legacy: true }],
          ["@babel/plugin-proposal-class-properties", { loose: true }]
        ]
      }
    }
  },
  {
    "browserslist": {
      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ],
      "production": [
        ">1%"
      ]
    },
  }
  ```

  1.3 "useBuiltIns": "usage" usage 会根据配置的浏览器兼容，以及你代码中用到的 API 来进行 polyfill，实现了按需添加；当设置为 usage 时，polyfills 会自动按需添加，不再需要手工引入@babel/polyfill，usage 的行为类似 babel-transform-runtime，不会造成全局污染,因此也会不会对类似 Array.prototype.includes() 进行 polyfill

  ```javascript
  useBuiltIns: 'usage',
  corejs: { version: 3 }
  ```

2. babel-runtime

- Babel 为了解决全局空间污染的问题，提供了单独的包 babel-runtime 用以提供编译模块的工具函数
- 简单说 babel-runtime 更像是一种按需加载的实现，比如你哪里需要使用 Promise，只要在这个文件头部 import Promise from 'babel-runtime/core-js/promise'就行了

```javascript
import Promise from "babel-runtime/core-js/promise";
const p = new Promise(() => {});
console.log(p);
```

3. babel-plugin-transform-runtime

- @babel/plugin-transform-runtime 插件是为了解决
  - 多个文件重复引用相同 helpers（帮助函数）-> 提取运行时
  - 新 API 方法全局污染 -> 局部引入
- 启用插件 babel-plugin-transform-runtime 后，Babel 就会使用 babel-runtime 下的工具函数
- babel-plugin-transform-runtime 插件能够将这些工具函数的代码转换成 require 语句，指向为对 babel-runtime 的引用
- babel-plugin-transform-runtime 就是可以在我们使用新 API 时自动 import babel-runtime 里面的 polyfill
  - 当我们使用 async/await 时，自动引入 babel-runtime/regenerator
  - 当我们使用 ES6 的静态事件或内置对象时，自动引入 babel-runtime/core-js
  - 移除内联 babel helpers 并替换使用 babel-runtime/helpers 来替换

```javascript
[
  "@babel/plugin-transform-runtime",
  {
    corejs: 2,//当我们使用 ES6 的静态事件或内置对象时自动引入 babel-runtime/core-js
    helpers: true,//移除内联babel helpers并替换使用babel-runtime/helpers 来替换
    regenerator: true,//是否开启generator函数转换成使用regenerator runtime来避免污染全局域
  },
],

corejs: 2 corejs 2=>false 131 KiB => 224 bytes
const p = new Promise(()=> {});
console.log(p);

helpers true=>false 160 KiB=>150 KiB
class A {
}
class B extends A {
}
console.log(new B());

regenerator false=>true B490 bytes->28.6 Ki
function* gen() {
}
console.log(gen());
```

4. 最佳实践

- babel-runtime 适合在组件和类库项目中使用，而 babel-polyfill 适合在业务项目中使用。

5. polyfill-service

- https://polyfill.io/v3/
- polyfill.io 自动化的 JavaScript Polyfill 服务
- polyfill.io 通过分析请求头信息中的 UserAgent 实现自动加载浏览器所需的 polyfills

```javascript
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
```
