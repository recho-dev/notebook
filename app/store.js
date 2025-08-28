function emitChange(listeners) {
  for (const listener of listeners) listener();
}

let count = 0;
const counterListeners = new Set();

export const countStore = {
  increment() {
    count++;
    emitChange(counterListeners);
  },
  subscribe(listener) {
    counterListeners.add(listener);
    return () => counterListeners.delete(listener);
  },
  getSnapshot() {
    return count;
  },
  getServerSnapshot() {
    return 0;
  },
};

let isDirty = false;
const dirtyListeners = new Set();

export const isDirtyStore = {
  setDirty(dirty) {
    isDirty = dirty;
    emitChange(dirtyListeners);
  },
  subscribe(listener) {
    dirtyListeners.add(listener);
    return () => dirtyListeners.delete(listener);
  },
  getSnapshot() {
    return isDirty;
  },
  getServerSnapshot() {
    return false;
  },
};
