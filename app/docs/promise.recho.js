/**
 * @title Promise
 * @order 4
 */

const a = echo(new Promise((resolve) => setTimeout(() => resolve(1), 2000)));

const b = echo(a + 1);

{
  echo(1);
  echo(a + 2);
  echo(b + 3);
}
