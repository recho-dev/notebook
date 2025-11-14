function createAdder(a, b) {
  echo("Creating adder", a, b);
  return () => {
    return echo(a + b);
  }
}

//➜ Creating adder 2 3
const adder3 = createAdder(2, 3);

//➜ 5
adder3();
