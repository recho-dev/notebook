/**
 * @title Moon Sundial
 * @author Bairui Su
 * @created 2025-09-12
 * @pull_request 87
 * @github pearmini
 */

/**
 * ============================================================================
 * =                            Moon Sundial                                  =
 * ============================================================================
 *
 * I'm taking a class called **Time**. The first assignment is to create a
 * sundial. It could be a physic device, or a digital one and really depends
 * on your imagination.
 *
 * So I'm wondering what features make a sundial a sundial?
 *
 * ChatGPT says:
 *
 * > A sundial is a device that tells the time by casting a shadow from a
 * > stick or gnomon onto a marked surface, using the sun’s position in the
 * > sky.
 *
 * I get two features from the definition:
 *
 * 1. It tells the time using the sun's position.
 * 2. It casts a shadow from an object.
 *
 * So I think why not create a moon sundial? It uses shadows from a matrix of
 * moons and the phases of the moon relies on the time. Then I based on Mike's
 * "Beesandbombs"[1] to create the following piece.
 *
 * This piece is a good example of how to use emojis to create animations in
 * Recho. Also, theoretically speaking, you can tell time based the pattern of
 * this matrix if the animation slows down and you're familiar enough with it!
 */

const moons = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘", "🌑"];
const size = 20;
const now = recho.now();
const rotate = d3.scaleLinear([-360, 360], [0, moons.length - 1]);
const pos = d3.scaleLinear([0, size], [-1, 1]);

//➜ 🌘🌕🌕🌕🌕🌕🌕🌖🌖🌖🌖🌕🌕🌕🌕🌕🌕🌘🌘🌘
//➜ 🌕🌕🌕🌕🌖🌖🌖🌖🌖🌖🌖🌖🌖🌖🌕🌕🌕🌕🌘🌘
//➜ 🌕🌕🌖🌖🌖🌖🌖🌖🌖🌖🌖🌖🌖🌖🌖🌕🌕🌕🌕🌘
//➜ 🌕🌖🌖🌖🌖🌗🌗🌗🌗🌗🌗🌗🌖🌖🌖🌖🌕🌕🌕🌘
//➜ 🌖🌖🌖🌖🌗🌗🌗🌗🌗🌗🌗🌗🌗🌗🌖🌖🌖🌕🌕🌕
//➜ 🌖🌖🌖🌗🌗🌗🌗🌘🌘🌘🌘🌗🌗🌗🌗🌖🌖🌖🌕🌕
//➜ 🌖🌖🌗🌗🌗🌘🌘🌘🌘🌘🌘🌘🌗🌗🌗🌖🌖🌖🌕🌕
//➜ 🌖🌗🌗🌗🌘🌘🌘🌘🌘🌘🌘🌘🌘🌗🌗🌗🌖🌖🌕🌕
//➜ 🌖🌗🌗🌗🌘🌘🌘🌕🌕🌕🌕🌘🌘🌗🌗🌗🌖🌖🌕🌕
//➜ 🌖🌗🌗🌘🌘🌘🌕🌕🌕🌕🌕🌘🌘🌗🌗🌗🌖🌖🌕🌕
//➜ 🌗🌗🌗🌘🌘🌕🌕🌕🌖🌖🌕🌘🌘🌗🌗🌗🌖🌖🌕🌕
//➜ 🌗🌗🌗🌘🌘🌕🌕🌕🌖🌖🌗🌗🌗🌗🌗🌖🌖🌖🌕🌕
//➜ 🌗🌗🌗🌘🌘🌕🌕🌕🌖🌖🌗🌗🌗🌗🌖🌖🌖🌕🌕🌕
//➜ 🌗🌗🌗🌘🌘🌕🌕🌕🌖🌖🌖🌖🌖🌖🌖🌖🌖🌕🌕🌕
//➜ 🌖🌗🌗🌘🌘🌘🌕🌕🌕🌖🌖🌖🌖🌖🌖🌖🌕🌕🌕🌘
//➜ 🌖🌗🌗🌘🌘🌘🌕🌕🌕🌕🌖🌖🌖🌖🌕🌕🌕🌕🌘🌘
//➜ 🌖🌗🌗🌗🌘🌘🌘🌕🌕🌕🌕🌕🌕🌕🌕🌕🌕🌘🌘🌘
//➜ 🌖🌖🌗🌗🌗🌘🌘🌘🌘🌕🌕🌕🌕🌕🌕🌕🌘🌘🌘🌘
//➜ 🌖🌖🌗🌗🌗🌗🌘🌘🌘🌘🌘🌘🌘🌘🌘🌘🌘🌘🌘🌗
//➜ 🌖🌖🌖🌗🌗🌗🌗🌘🌘🌘🌘🌘🌘🌘🌘🌘🌘🌗🌗🌗
{
  let output = "";
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const [x, y] = [pos(j), pos(i)];
      const r = Math.hypot(x, y);
      const theta = Math.atan2(y, x) / (Math.PI * 2);
      const phase = now / 3000;
      const l = ((r + theta - phase) % 1) * -360;
      const index = ~~rotate(l);
      output += moons[index];
    }
    output += i == size - 1 ? "" : "\n";
  }
  echo(output);
}

const d3 = recho.require("d3");

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                             References
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * [1] https://observablehq.com/d/a741f9a27e8c0e73
 */
