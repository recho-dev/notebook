export const mutable = `const [a, setA] = recho.state(0);

setTimeout(() => {
  setA((a) => a + 1);
}, 1000);

echo(a);
`;
