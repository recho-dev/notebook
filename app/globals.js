let isDirty = false;
let count = 0;

export function setCount(c) {
  count = c;
}

export function getCount() {
  return count;
}

export function setDirty(dirty) {
  isDirty = dirty;
}

export function getDirty() {
  return isDirty;
}
