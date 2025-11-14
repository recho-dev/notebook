const add = (x, y) => echo(x, y);

//➜ 1 2
add(1, 2);

//➜ 3 4
add(3, 4);

const adder = () => (x, y) => echo(x, y);

//➜ 5 6
adder()(5, 6);

//➜ 7 8
adder()(7, 8);

const adder2 = {
  add: (x, y) => echo(x, y),
};

//➜ 9 10
adder2.add(9, 10);

const adder3 = {
  add: () => (x, y) => echo(x, y),
};

//➜ 11 12
adder3.add()(11, 12);
