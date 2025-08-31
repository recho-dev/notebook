/**
 * @title Generator
 * @order 5
 */

const now = echo(recho.now());

const x = echo(Math.abs(~~(Math.sin(now / 1000) * 22)));

echo("~".repeat(x) + "(๑•̀ㅂ•́)و✧", {quote: false});
