(() => {
  var modules = {};
  var cache = {};
  function require(moduleId) {
    if (cache[moduleId]) {
      return cache[moduleId].exports;
    }
    var module = (cache[moduleId] = {
      exports: {},
    });
    modules[moduleId](module, module.exports, require);
    return module.exports;
  }
  require.m = modules;
  require.defineProperties = (exports, definition) => {
    for (var key in definition) {
      if (
        require.ownProperty(definition, key) &&
        !require.ownProperty(exports, key)
      ) {
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: definition[key],
        });
      }
    }
  };
  require.find = {};
  require.ensure = (chunkId) => {
    debugger;
    let promises = [];
    require.find.jsonp(chunkId, promises);
    return Promise.all(promises);
  };
  require.unionFileName = (chunkId) => {
    return "" + chunkId + ".main.js";
  };
  require.ownProperty = (obj, prop) =>
    Object.prototype.hasOwnProperty.call(obj, prop);
  require.load = (url) => {
    var script = document.createElement("script");
    script.src = url;
    document.head.appendChild(script);
  };
  require.renderEsModule = (exports) => {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
  };
  require.publicPath = "";
  var installedChunks = {
    main: 0,
  };
  require.find.jsonp = (chunkId, promises) => {
    var promise = new Promise((resolve, reject) => {
      installedChunkData = installedChunks[chunkId] = [resolve, reject];
    });
    promises.push((installedChunkData[2] = promise));
    var url = require.publicPath + require.unionFileName(chunkId);
    require.load(url);
  };
  var webpackJsonpCallback = (data) => {
    var [chunkIds, moreModules] = data;
    var moduleId,
      chunkId,
      i = 0,
      resolves = [];
    for (; i < chunkIds.length; i++) {
      chunkId = chunkIds[i];
      resolves.push(installedChunks[chunkId][0]);
      installedChunks[chunkId] = 0;
    }
    for (moduleId in moreModules) {
      require.m[moduleId] = moreModules[moduleId];
    }
    while (resolves.length) {
      resolves.shift()();
    }
  };
  var chunkLoadingGlobal = (window["webpack5"] = window["webpack5"] || []);
  chunkLoadingGlobal.push = webpackJsonpCallback;
  require
    .ensure("hello")
    .then(require.bind(require, "./hello.js"))
    .then((result) => {
      console.log(result);
    });
})();
