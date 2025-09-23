export const inspector = `echo("line1\\nline2");

echo([1, 2, 3]);

echo(function add(a, b) {
  return a + b;
});

echo({a: 1, b: 2});

echo(class Foo {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
});

echo(new Map([[1, 2], [3, 4]]));

echo(new Date('2025-09-23T12:00:00Z'));

echo(new Map([[1, 2], [3, 4]]), {indent: 2});

echo(new Array(100).fill(0));

echo(new Array(100).fill(0), {limit: 100});

echo(new Array(100).fill(0), {limit: Infinity});`;
