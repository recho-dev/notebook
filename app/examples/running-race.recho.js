/**
 * @title Running Race
 * @author Bairui Su
 * @created 2025-09-09
 * @pull_request 82
 * @github pearmini
 * @thumbnail_start 26
 * @label ASCII Art, Beginner
 * @tui true
 */

/**
 * ============================================================================
 * =                            Running Race                                  =
 * ============================================================================
 *
 * This is a tiny demo that shows how to use `recho.interval` to create
 * animations in Recho. It's inspired by the **hello world** example from
 * VanJs: https://vanjs.org/demo#hello-world
 */

const snail = recho.interval(2000);
const turtle = recho.interval(1000);
const human = recho.interval(500);
const car = recho.interval(10);
const rocket = recho.interval(2);

//➜                                    🐌💨
//➜                                   🐢💨
//➜                              🚶‍♂️💨
//➜                     🚗💨
//➜           🚀💨
{
  const x = (count) => 40 - (count % 40);
  echo("🐌💨".padStart(x(snail)));
  echo("🐢💨".padStart(x(turtle)));
  echo("🚶‍♂️💨".padStart(x(human)));
  echo("🚗💨".padStart(x(car)));
  echo("🚀💨".padStart(x(rocket)));
}
