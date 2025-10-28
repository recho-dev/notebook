export const echoFunctionReturnsFunction = `function createAdder(a, b) {
  echo("Creating adder", a, b);
  return () => {
    return echo(a + b);
  }
}

const adder3 = createAdder(2, 3);

adder3();
`;
