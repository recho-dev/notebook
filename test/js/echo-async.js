export const echoAsync = `function add(a, b) {
  echo("Adding", a, b);
  setTimeout(() => {
    echo(a + b);
  }, 0);
  return () => {setTimeout(() => {echo("Ending", a, b)}, 10)};
}

const e1 = add(1, 2);

const e2 = add(3, 4);

e1();

e2();
`;
