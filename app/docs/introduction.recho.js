/**
 * @title Introduction
 * @order 1
 */

/**
 *            __        __   _                            _
 *            \ \      / /__| | ___ ___  _ __ ___   ___  | |_ ___
 *             \ \ /\ / / _ \ |/ __/ _ \| '_ ` _ \ / _ \ | __/ _ \
 *              \ V  V /  __/ | (_| (_) | | | | | |  __/ | || (_) |
 *               \_/\_/ \___|_|\___\___/|_| |_| |_|\___|  \__\___/
 *                       ____           _             _
 *                      |  _ \ ___  ___| |__   ___   | |
 *                      | |_) / _ \/ __| '_ \ / _ \  | |
 *                      |  _ <  __/ (__| | | | (_) | |_|
 *                      |_| \_\___|\___|_| |_|\___/  (_)
 *
 * ============================================================================
 * =                            Introduction                                  =
 * ============================================================================
 *
 * > We want to live in the editor forever. — Luyu Cheng[1]
 *
 * **Recho**[2] is a free, open-source, reactive notebook-like editor that 
 * echoes output inline with your code as comments — enabling beginners, 
 * developers, artists, and anyone curious to quickly code and explore through
 * text experiments/art.
 *
 * Built on the reactive model of Observable Notebook Kit[3], Recho aims to
 * make coding accessible, interactive, and playful, turning every string
 * manipulation into a creative, in-situ experience - discover the sketches of
 * tomorrow!
 *
 * Here is a quick example[4] to showcase Recho. A block of code is written to
 * explore the algorithm behind Mandelbrot set[5], generating a string called
 * `output`. After calling `echo(output)`, the output appears above the code
 * block as comments. By tweaking the values of `cols`, `rows`, and `maxIter`,
 * the output updates reactively for further explorations. Check out more live
 * examples[6] to see what you can create with Recho.
 */

const cols = 80;
const rows = 30;
const maxIter = 80;

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
      output += i === maxIter ? "0" : " ";
    }
    output += y === rows - 1 ? "" : "\n";
  }
  echo(output);
}

function map(x, d0, d1, r0, r1) {
  return r0 + ((r1 - r0) * (x - d0)) / (d1 - d0);
}

/**
 * Please visit the GitHub repository for more details:
 * 
 * > https://github.com/recho-dev/recho
 *
 * - [1] https://luyu.computer/
 * - [2] https://recho.dev/
 * - [3] https://github.com/observablehq/notebook-kit
 * - [4] https://recho.dev/examples/mandelbrot-set
 * - [5] https://en.wikipedia.org/wiki/Mandelbrot_set
 * - [6] https://recho.dev/docs/getting-started
 */
