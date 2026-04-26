import {require as browserRequire} from "d3-require";

const nodeImportCache = new Map();

function hasDocument() {
  return typeof document !== "undefined" && document.createElement && document.head;
}

function normalizeModule(module) {
  const keys = Object.keys(module);
  if (keys.includes("module.exports")) return module.default;
  return keys.length === 1 && keys[0] === "default" ? module.default : module;
}

function mergeModules(modules) {
  const merged = {};
  for (const module of modules) {
    const normalized = normalizeModule(module);
    Object.assign(merged, normalized);
  }
  return merged;
}

function nodeImport(name) {
  if (typeof name !== "string") return Promise.resolve(name);
  let module = nodeImportCache.get(name);
  if (!module) {
    module = import(name).then(normalizeModule);
    nodeImportCache.set(name, module);
  }
  return module;
}

export function require(...names) {
  if (hasDocument()) return browserRequire(...names);
  return names.length > 1 ? Promise.all(names.map(nodeImport)).then(mergeModules) : nodeImport(names[0]);
}

export {now} from "./now.js";
export {interval} from "./interval.js";
export {inspect, Inspector} from "./inspect.js";
export * from "../controls/index.js";
export {state} from "./state.js";
