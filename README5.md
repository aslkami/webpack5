# webpack5 新特性 [特性](http://www.zhufengpeixun.com/strong/html/103.13.webpack5.html)

## 持久化缓存

- webpack 会缓存生成的 webpack 模块和 chunk,来改善构建速度
- 缓存在 webpack5 中默认开启，缓存默认是在内存里,但可以对 cache 进行设置
- webpack 追踪了每个模块的依赖，并创建了文件系统快照。此快照会与真实文件系统进行比较，当检测到差异时，将触发对应模块的重新构建

```javascript
const config = {
  cache: {
    type: "filesystem", //'memory' | 'filesystem'
    cacheDirectory: path.resolve(__dirname, "node_modules/.cache/webpack"),
  },
};
```

## 资源处理

```javascript
const config = [
  {
    test: /\.png$/,
    type: "asset/resource", // file-loader
  },
  {
    test: /\.ico$/,
    type: "asset/inline", url-loader
  },
  {
    test: /\.txt$/,
    type: "asset/source", // raw-loader
  },
  {
    test: /\.jpg$/,
    type: "asset",
    parser: {
      dataUrlCondition: {
        maxSize: 4 * 1024, //  根据阈值自动选择用 哪个 loader 处理
      },
    },
  },
];
```

## URIs

- Webpack 5 支持在请求中处理协议
- 支持 data 支持 Base64 或原始编码,MimeType 可以在 module.rule 中被映射到加载器和模块类型

```javascript
import data from "data:text/javascript,export default 'title'";
console.log(data);
```

## moduleIds & chunkIds 的优化

- module: 每一个文件其实都可以看成一个 module
- chunk: webpack 打包最终生成的代码块，代码块会生成文件，一个文件对应一个 chunk
- 在 webpack5 之前，没有从 entry 打包的 chunk 文件，都会以 1、2、3...的文件命名方式输出,删除某些些文件可能会导致缓存失效
- 在生产模式下，默认启用这些功能 chunkIds: "deterministic", moduleIds: "deterministic"，此算法采用确- 定性的方式将短数字 ID(3 或 4 个字符)短 hash 值分配给 modules 和 chunks
- chunkId 设置为 deterministic，则 output 中 chunkFilename 里的[name]会被替换成确定性短数字 ID
- 虽然 chunkId 不变(不管值是 deterministic | natural | named)，但更改 chunk 内容，chunkhash 还是会改变的

```javascript
const config = {
  optimization: {
    moduleIds: "deterministic",
    chunkIds: "deterministic",
  },
};
```

## 移除 Node.js 的 polyfill

- webpack4 带了许多 Node.js 核心模块的 polyfill,一旦模块中使用了任何核心模块(如 crypto)，这些模块就会被自动启用
- webpack5 不再自动引入这些 polyfill

```javascript
// cnpm i crypto-js crypto-browserify stream-browserify buffer -D
// import CryptoJS from 'crypto-js';
// console.log(CryptoJS.MD5('zhufeng').toString());
const config = {
  resolve: {
    /* fallback:{ 
            "crypto": require.resolve("crypto-browserify"),
            "buffer": require.resolve("buffer"),
            "stream":require.resolve("stream-browserify")
        }, */
    fallback: {
      crypto: false,
      buffer: false,
      stream: false,
    },
  },
};
```

就是 webpack5 里要使用 node 模块， 需要自己手动引入 polyfill

## 更强大的 tree-shaking

- tree-shaking 就在打包的时候剔除没有用到的代码
- webpack4 本身的 tree shaking 比较简单,主要是找一个 import 进来的变量是否在这个模块内出现过
- webpack5 可以进行根据作用域之间的关系来进行优化
- webpack-deep-scope-demo

```javascript
module.exports = {
  mode: "development",
  optimization: {
    usedExports: true,
  },
};
```

## sideEffects

- 函数副作用指当调用函数时，除了返回函数值之外，还产生了附加的影响,例如修改全局变量
- 严格的函数式语言要求函数必须无副作用
- `package.json` 里 "sideEffects": false, 如果 确保没有副作用，可以设置 为 false, 表示会将所有没有依赖关系的，，可以设置 白名单 `sideEffects:["*.css"]`

## 模块联邦
