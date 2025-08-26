/**
 * @title Generator
 * @order 5
 */

const now = echo(
  (function* () {
    for (let i = 0; true; ++i) {
      yield i;
    }
  })(),
);

const x = echo(Math.abs(~~(Math.sin(now / 100) * 22)));

echo("~".repeat(x) + "(๑•̀ㅂ•́)و✧", {quote: false});
