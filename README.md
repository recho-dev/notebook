# Recho: Reactive Echo

> We want to live in the editor forever. — [Luyu Cheng](https://luyu.computer/)

[**Recho**](https://recho.dev/) is a free, [open-source](/LICENCE), reactive code scratchpad that echoes output inline with your code as comments — enabling beginners, developers, artists, and anyone curious to quickly code and explore through text experiments/art. Built on the reactive model of [Observable Notebook Kit](https://github.com/observablehq/notebook-kit), Recho makes coding accessible, interactive, and playful, turning every string output into a creative, in-situ experience - discover the sketches of tomorrow.

## A Quick Example 🚀

Here is a [quick example](https://recho.dev/examples/mandelbrot-set) to showcase Recho. A block of code is written to explore the algorithm behind [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set), generating a string called _output_. After calling _echo(output)_, the output appears above the code block as comments. By tweaking the values of _cols_, _rows_, and _maxIter_, the output updates reactively for further explorations. Check out more [live examples](https://recho.dev/examples) to see what you can create with Recho.

```js
const cols = 80;
const rows = 30;
const maxIter = 80;

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
      output += i === maxIter ? "0" : " ";
    }
    output += y === rows - 1 ? "" : "\n";
  }
  echo(output);
}

function map(x, d0, d1, r0, r1) {
  return r0 + ((r1 - r0) * (x - d0)) / (d1 - d0);
}
```

## Editor 📝

The quickest way to get started with Recho.

https://recho.dev/

## Documentation 📚

Learn how to use Recho with our comprehensive guides.

https://recho.dev/docs/introduction

## Examples 🖼️

See what you can create and draw some inspiration!

https://recho.dev/examples

## Contributing 🙏

We have a bundle of features that we would like you to help us build together!

https://github.com/recho-dev/recho/issues

## License 📄

ISC © [Recho](https://github.com/recho-dev)
