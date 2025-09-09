/**
 * @title Mandelbrot Set
 * @author Bairui Su
 * @created 2025-08-21
 * @pull_request 79
 * @github pearmini
 * @thumbnail_start 42
 */

/**
 * ============================================================================
 * =                            Mandelbrot Set                                =
 * ============================================================================
 *
 * I'm always fascinated by fractals. It's truly amazing that fractals allows
 * us generate complex and beautiful patterns from simple rules or code.
 *
 * The Mandelbrot set[1] is one of the most famous fractals. So I want to use
 * Recho to draw a text-based Mandelbrot set to demonstrate we can create
 * something appealing with just few lines of code in Recho.
 *
 * I'm not going to explain the details of what the Mandelbrot set is or how to
 * implement it here. The whole idea is that we apply certain math formulas to
 * each point of a plane iteratively until the point satisfies certain
 * conditions. Then we can color the point based on the number of iterations.
 * We're using characters here of course!
 */

const cols = 80;
const rows = 30;
const maxIter = 80;
const colors = ["·", "*", "o", "O", "@"];

//➜
//➜
//➜                                                        0
//➜                                                      0000
//➜                                                      0000
//➜                                              0       000
//➜                                              00  000000000000
//➜                                              00000000000000000000
//➜                                              0000000000000000000
//➜                                            0000000000000000000000
//➜                                          00000000000000000000000000
//➜                                0  0       000000000000000000000000
//➜                                00000000  00000000000000000000000000
//➜                               0000000000 0000000000000000000000000
//➜                              00000000000 000000000000000000000000
//➜             000000000000000000000000000000000000000000000000000
//➜                              00000000000 000000000000000000000000
//➜                               0000000000 0000000000000000000000000
//➜                                00000000  00000000000000000000000000
//➜                                0  0       000000000000000000000000
//➜                                          00000000000000000000000000
//➜                                            0000000000000000000000
//➜                                              0000000000000000000
//➜                                              00000000000000000000
//➜                                              00  000000000000
//➜                                              0       000
//➜                                                      0000
//➜                                                      0000
//➜                                                        0
//➜
{
  let output = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const re = map(x, 0, cols, -2.5, 1);
      const im = map(y, 0, rows, -1, 1);
      let [a, b, i] = [0, 0, 0];
      while (i < maxIter) {
        [a, b] = [a * a - b * b + re, 2 * a * b + im];
        if (a * a + b * b > 4) break;
        i++;
      }
      const index = ~~((i / maxIter) * (colors.length - 1));
      output += colors[index];
    }
    output += y === rows - 1 ? "" : "\n";
  }
  echo(output);
}

function map(x, d0, d1, r0, r1) {
  return r0 + ((r1 - r0) * (x - d0)) / (d1 - d0);
}

/**
 * Again, you don't need to completely understand the code above for now. If
 * you find textual outputs can be interesting and creative by this example,
 * that's the point!
 *
 * If you're really curious about Mandelbrot set, here are some examples that
 * I made with Charming.js[2] you may find interesting:
 *
 * - Multibrot Set: https://observablehq.com/d/fc2cfd9ae9e7524c
 * - Multibrot Set Table: https://observablehq.com/d/3028c0d5655345e3
 * - Multibrot Set Transition: https://observablehq.com/d/c040d3db33c0033e
 * - Zoomable Mandelbrot Set (Canvas): https://observablehq.com/d/2e5bdd2365236c2d
 * - Zoomable Mandelbrot Set (WebGL): https://observablehq.com/d/cfe263c1213334e3
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                              References
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * [1] https://en.wikipedia.org/wiki/Mandelbrot_set
 * [2] https://charmingjs.org/
 */
