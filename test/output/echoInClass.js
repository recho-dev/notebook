class Adder {
  add(a, b) {
    echo(a + b);
  }
}

const adder = new Adder();

//➜ 11
adder.add(5, 6);

const adder2 = new Adder();

//➜ 15
adder2.add(7, 8);
