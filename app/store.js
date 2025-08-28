let data = {count: 0, isDirty: false};
const initialData = {...data};
const listeners = new Set();

function emitChange() {
  for (const listener of listeners) listener();
}

export const editorStore = {
  increment() {
    data = {...data, count: data.count + 1};
    emitChange();
  },
  setDirty(dirty) {
    data = {...data, isDirty: dirty};
    emitChange();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return data;
  },
  getServerSnapshot() {
    return initialData;
  },
};
