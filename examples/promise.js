const code = `const a = doc(new Promise(resolve => setTimeout(() => resolve(1), 2000)));

const b = doc(a + 1);`;

export const promise = {
  name: "Promise",
  code,
};
