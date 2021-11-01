(window["webpack5"] = window["webpack5"] || []).push([
  ["hello"],
  {
    "./hello.js": (module, exports, __webpack_require__) => {
      "use strict";
      debugger;
      __webpack_require__.renderEsModule(exports);
      __webpack_require__.defineProperties(exports, {
        default: () => DEFAULT_EXPORT,
      });
      const DEFAULT_EXPORT = "hello";
    },
  },
]);
