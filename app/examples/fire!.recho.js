/**
 * @title 火炎焱燚 (Fire!)
 * @created 2025-09-03
 * @author Bairui Su
 * @pull_request 83
 * @github pearmini
 * @thumbnail_start 37
 */

/**
 * ============================================================================
 * =                         火炎焱燚 (Fire!)                                  =
 * ============================================================================
 *
 * 火炎焱燚 (Fire!) is a concrete poetry that uses Chinese words 火, 炎, 焱, 燚 to
 * create a fire effect. In Chinese, it's normal to repeat the same word
 * multiple times to create a new word, which is usually called **reduplicated
 * words**.
 *
 * In this example, 火 means fire, two 火 makes 炎 means hot, three 火 makes 焱
 * means very hot, four 火 makes 燚 means extremely hot. So this poetry can be
 * interpreted as burning fire with fire to emphasize how hot it is.
 */

const cols = 36;
const rows = 20;
const fire = d3.range(cols * rows).map(() => 0);
const index = (x, y) => x + y * cols;
const chs = ["火", "炎", "焱", "燚"].reverse();
const frame = recho.interval(1000 / 15);

//➜
//➜
//➜   　　　　　　　　　　　　　　　　　　　　　　　　　　燚　燚　燚燚
//➜   　　　　　　　　　　　　　　　　　　　　　　燚
//➜   　　　　　　　　　燚　　　　　　　　　　　燚　　　　燚燚
//➜   　　　　　　　　　　　　　　　　　　　　　　燚
//➜   燚燚　　　　　　　　燚燚　　燚　　　　　燚燚　　燚
//➜   　　燚燚　　　　　　　燚　　　　　　　　　　　　燚
//➜   　　　　燚燚燚　　燚燚　燚　　　　燚燚燚燚　　　燚燚　　燚燚　燚焱燚燚燚
//➜   　　　燚焱　　　　燚燚燚　燚燚　　　燚燚燚燚燚　　　　燚燚　　燚燚焱燚燚
//➜   焱燚　　　燚　　　　燚燚燚燚燚　　焱焱焱燚燚
//➜   　　　焱焱焱燚燚燚燚燚燚焱焱焱燚燚燚　焱燚焱　　　　　　燚焱焱
//➜   燚燚燚燚燚燚燚　　　　　燚燚燚焱焱燚
//➜   焱焱　　焱燚燚燚燚燚燚焱焱燚焱焱焱　　　　燚焱焱燚燚燚燚焱焱焱燚燚燚燚焱
//➜   燚燚炎炎燚焱焱炎焱燚燚燚燚燚　　燚燚燚燚焱焱燚炎炎炎燚焱燚　燚燚　焱焱炎
//➜   燚燚燚　炎炎炎炎炎炎炎炎炎炎炎焱焱焱燚　炎炎　焱焱燚炎焱炎燚焱焱焱焱炎炎
//➜   焱焱焱焱焱焱焱焱炎炎炎炎焱焱焱焱焱火焱燚燚焱　焱燚焱燚焱炎炎炎炎燚炎焱焱
//➜   焱炎燚燚燚焱燚炎炎炎火火焱焱火火火火火火焱炎炎炎　燚炎炎　　焱燚燚燚炎火
//➜   燚炎焱焱燚燚炎焱炎火焱炎炎焱焱燚焱炎炎焱炎火焱炎焱焱焱炎火焱炎炎焱焱焱炎
//➜   火炎焱焱火炎炎焱炎焱火炎炎炎炎炎炎炎炎焱炎焱火焱火燚焱焱炎炎焱焱焱焱炎火
{
  frame;

  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < cols; x++) {
      const decay = d3.randomInt(0, 3)();
      const spread = d3.randomInt(-1, 1)();
      const i = Math.min(Math.max(0, x - spread), cols - 1);
      const target = fire[index(i, y + 1)];
      fire[index(x, y)] = Math.max(0, target - decay);
    }
  }

  const noise = new Noise();
  const linear = d3.scaleLinear([0, 1], [0, rows]);
  const source = (i) => linear(noise.get(i, 0, 0));

  for (let x = 0; x < cols; x++) {
    fire[index(x, rows - 1)] = ~~source(x);
  }

  const quantile = d3.scaleQuantile(d3.extent(fire), chs);
  const ch = (d) => (d ? quantile(d) : "　");

  let output = "";
  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < cols; ++j) output += ch(fire[index(j, i)]);
    output += i === rows - 1 ? "" : "\n";
  }
  output = output.split("\n").map((d) => "  " + d).join("\n");

  echo(output);
}

const d3 = recho.require("d3");

/**
 * I like this example also because I found one importable noise library:
 * `perlin-noise-3d`:
 *
 * - https://www.npmjs.com/package/perlin-noise-3d
 */

const Noise = recho.require("perlin-noise-3d");

/**
 * Perlin noise is so useful in creative coding, so it's great that we can use
 * it in Recho before making it a built-in function.
 *
 * As you can see, the implementation replies on noise function to generate
 * natural source of fire, which is the key to create such effect!
 */
