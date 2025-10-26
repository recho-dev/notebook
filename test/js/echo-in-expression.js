export const echoInExpression = `const add = (x, y) => echo(x, y);

add(1, 2);

add(3, 4);

const adder = () => (x, y) => echo(x, y);

adder()(5, 6);

adder()(7, 8);

const adder2 = {
  add: (x, y) => echo(x, y),
};

adder2.add(9, 10);

const adder3 = {
  add: () => (x, y) => echo(x, y),
};

adder3.add()(11, 12);
`;
