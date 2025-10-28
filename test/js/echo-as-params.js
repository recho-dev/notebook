export const echoAsParams = `function add(a, b, echo) {
  echo(a, b);
}

add(1, 2, echo);

function add2(a, b, echo = () => {}) {
  echo(a, b);
}

add2(1, 2, echo);

add2(3, 4);
`;
