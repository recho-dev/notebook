export const echoInRecursiveFunction = `function recursiveAdd(v, depth) {
  if (depth === 0) return;
  echo(v);
  recursiveAdd(v + 1, depth - 1);
}

recursiveAdd(1, 3);

recursiveAdd(2, 4);
`
