function add(a, b, echo) {
  echo(a, b);
}

//➜ 1 2
add(1, 2, echo);

function add2(a, b, echo = () => {}) {
  echo(a, b);
}

//➜ 1 2
add2(1, 2, echo);

add2(3, 4);
