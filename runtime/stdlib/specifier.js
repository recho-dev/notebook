// Splits a `recho.require` specifier the way the browser resolver reads it:
// `name@version/sub/path`, with an optional `@scope/` prefix, or a URL.
// Dependency-free on purpose — the runtime is bundled for the browser and the
// terminal editor imports this too.

export function parseSpecifier(spec) {
  if (/^https?:\/\//i.test(spec)) return {url: true, name: null, version: null, subpath: ""};
  let rest = spec;
  let scope = "";
  if (rest.startsWith("@")) {
    const slash = rest.indexOf("/");
    if (slash === -1) return {url: false, name: rest, version: null, subpath: ""};
    scope = rest.slice(0, slash + 1);
    rest = rest.slice(slash + 1);
  }
  const slash = rest.indexOf("/");
  let pkg = slash === -1 ? rest : rest.slice(0, slash);
  const subpath = slash === -1 ? "" : rest.slice(slash);
  let version = null;
  const at = pkg.indexOf("@");
  if (at > 0) {
    version = pkg.slice(at + 1);
    pkg = pkg.slice(0, at);
  }
  return {url: false, name: scope + pkg, version, subpath};
}
