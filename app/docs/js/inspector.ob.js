/**
 * @title Inspector
 * @order 3
 */

doc("line1\nline2");

doc([1, 2, 3]);

doc(function add(a, b) {
  return a + b;
});

doc({a: 1, b: 2});

doc(class Foo {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
});

doc(new Map([[1, 2], [3, 4]]));

doc(new Date());

doc(new Map([[1, 2], [3, 4]]), {indent: 2});

doc(new Array(100).fill(0));

doc(new Array(100).fill(0), {limit: 100});

doc(new Array(100).fill(0), {limit: Infinity});
