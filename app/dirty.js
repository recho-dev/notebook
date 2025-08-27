let isDirty = false;

export function setDirty(dirty) {
  isDirty = dirty;
}

export function getDirty() {
  return isDirty;
}
