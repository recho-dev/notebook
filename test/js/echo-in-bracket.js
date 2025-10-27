export const echoInBracket = `const obj = echo((x, y) => ({x, y}))

const obj2 = echo((x, y) => ((x + y)))

echo(obj(1, 2));

echo(obj2(3, 4));
`;
