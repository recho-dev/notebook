/**
 * @title Animations Authoring
 * @order 5
 */

/**
 * ============================================================================
 * =                         Animations Authoring                             =
 * ============================================================================
 *
 * Animations are very powerful tools making your sketches more interactive and
 * engaging. In Recho, there are at least two ways to author animations. You
 * can choose either one which suits you best.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                          Block-level Animations
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * You can author block-level animations using generators[1]. If one block
 * refers a generator defined in another block, the referencing block will
 * re-evaluate when the generator yields a value.
 *
 * For example, here’s a generator `i` that increments once a second, defined
 * directly by an immediately-invoked async generator function[2]. The
 * referencing block `echo(i)` will update its value when the generator yields
 * the next count.
 */

const i = (async function* () {
  for (let j = 0; true; ++j) {
    yield j;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
})();

echo(i);

/**
 * As you can imagine, you can use such a generator to drive an animation. Here
 * is a moving turtle animation.
 */

{
  const x = 40 - (i % 40);
  const turtle = "🐢".padStart(x);
  echo(turtle);
}

/**
 * If you are not familiar with generators or don't want to write the
 * boilerplate code, you can use the `recho.interval` function to create a
 * generator that yields values at a specified interval.
 *
 * For example, let's create a "bigger" moving animation[2].
 */

const snail = recho.interval(2000);
const turtle = recho.interval(1000);
const human = recho.interval(500);
const car = recho.interval(10);
const rocket = recho.interval(2);

{
  const x = (count) => 40 - (count % 40);
  echo("🐌💨".padStart(x(snail)), {quote: false});
  echo("🐢💨".padStart(x(turtle)), {quote: false});
  echo("🚶‍♂️💨".padStart(x(human)), {quote: false});
  echo("🚗💨".padStart(x(car)), {quote: false});
  echo("🚀💨".padStart(x(rocket)), {quote: false});
}

/**
 * In addition, you can use the `recho.now` function to create a generator that
 * yields the current time continuously.
 */

const now = recho.now();

echo(now);

/**
 * This is a convenient way to create smoother animations.
 */

const x = echo(Math.abs(~~(Math.sin(now / 1000) * 22)));

echo("~".repeat(x) + "(๑•̀ㅂ•́)و✧", {quote: false});

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                          Browser Animation APIs
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * You can use the browser APIs to create animations, such as the `setInterval`
 * or `requestAnimationFrame`. Compare to block-level animations, there are two
 * differences:
 *
 * 1. You need to clear the output of the current block manually.
 * 2. You need to register a disposal hook to clear the interval when the block
 *    is re-run.
 *
 * For example, let's create the same moving turtle animation using the
 * `setInterval` function.
 */

{
  let i = 0;

  const loop = () => {
    const x = 40 - (i++ % 40);
    const turtle = "🐢".padStart(x);
    clear(); // Clear the output of the current block.
    echo(turtle);
  };

  loop();

  const interval = setInterval(() => loop(), 1000);

  // Clear the interval when the block is re-run.
  invalidation.then(() => clearInterval(interval));
}

/**
 * Although the two approaches can achieve the same result, we highly recommend
 * using block-level animations because it's more convenient, efficient and
 * **declarative**!
 */

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                                 References
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * - [1] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
 * - [2] https://vanjs.org/demo#hello-world
 */
