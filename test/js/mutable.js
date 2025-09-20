export const mutable = `const {a, getA, setA} = (() => {
  const a = Mutable(0);
  return {a, getA: () => a.value, setA: (value) => a.value = value};
})();

setA(a + 1);

echo(a);`;

// export const mutable = `const {a, getA, setA} = (() => {
//   const a = Mutable(0);
//   return {a, getA: () => a.value, setA: (value) => a.value = value};
// })();

// setA(getA() + 1);

// echo(a);`;
