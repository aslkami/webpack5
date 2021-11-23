## webpack 工作流程

- [webpack 工作流程](http://www.zhufengpeixun.com/strong/html/103.4.webpack-flow.html)
- webpack 作为一个工厂函数，接收 options，与命令行的 options 合并，然后注册插件，遍历插件执行 apply 方法
- apply 会把 编译器 compiler 放入，监听 run start 和 run done 事件
- compiler 编译器，接收 option，提供 run 方法， 第一次 就获得依赖文件和目录，通过 fs.watch 监听
- 读取 入口文件，获得 source code，代入 loader 得到 loader 解析后的 source code
- 将 source code 解析成 ast ，解析里面的 import 和 require 引用的 模块， 维护 moduels 的依赖关系
- 递归生成最终代码，然后 fs.writeFile 生成文件

## ast

- esprima parse 解析源代码 转化成 ast
- estraverse 转化代码结构
- escodegen 重新生成源代码
- @babel/core `core.trasform(sourceCode, { plugin: [] })`
- @babel/types 内含 ast 转化的工具集合
- babel 相当于 上面 的 esprima 等包的集合
- 工作流：es6 -> astes6 -> astes5 -> es5
- 深度优先遍历，访问者模式，visitor

## plugin

插件是一个类，并提供 apply 方法

## loader

- 利用 loader-utils 获取 options `const { getOptions } = require('loader-utils')`, `getOptions(this)`
- inputSourceMap, 上一次 转化的 sourcemap
