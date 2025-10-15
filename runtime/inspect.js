import objectInspector from "object-inspect";

function isMultiline(value) {
  const isString = typeof value === "string";
  if (!isString) return false;
  const lines = value.split("\n");
  return lines.length > 1;
}

function inspector(value, {limit = 200, quote = "double", indent = null} = {}) {
  if (isMultiline(value)) return value;
  if (typeof value === "string" && !quote) return value;
  const string = objectInspector(value, {indent, quoteStyle: quote});
  if (string.length > limit) return string.slice(0, limit) + "…";
  return string;
}

export class Inspector {
  constructor(value, options = {}) {
    this.value = value;
    this.options = options;
  }
  format() {
    return inspector(this.value, this.options);
  }
}

export function inspect(value, options) {
  return new Inspector(value, options);
}
