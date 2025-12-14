// Empty module stub for Node.js built-ins in browser builds
// eslint-linter-browserify doesn't actually need these at runtime
// This file needs to support both default exports and namespace imports

// CommonJS export
if (typeof module !== "undefined" && module.exports) {
  module.exports = {};
  module.exports.default = {};
}

// ES module default export
const emptyModule = {};
export default emptyModule;

// Also export as named export for compatibility
export {emptyModule};

