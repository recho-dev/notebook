# Recho: Reactive Echo

> We want to live in the editor forever. — [Luyu Cheng](https://luyu.computer/)

[**Recho**](https://recho.dev/) is a free, [open-source](/LICENCE), reactive code scratchpad that echoes output inline with your code as comments — enabling beginners, developers, artists, and anyone curious to quickly code and explore through text experiments/art. Built on the reactive model of [Observable Notebook Kit](https://github.com/observablehq/notebook-kit), Recho makes coding accessible, interactive, and playful, turning every string output into a creative, in-situ experience - discover the sketches of tomorrow.

- [Editor](https://recho.dev/) 📝 - The quickest way to get started with Recho.
- [Documentation](https://recho.dev/docs/introduction) 📚 - Learn how to use Recho with our comprehensive guides.
- [Examples](https://recho.dev/examples) 🖼️ - See what you can create and draw some inspiration!
- [Contributing](https://github.com/recho-dev/recho/issues) 🙏 - We have a bunch of things that we would like you to help us build together!

## Why Recho 💡

We want to make code more accessible and hopefully, more playful. Inspired by [P5.js Editor](https://editor.p5js.org/) and [Observable Notebook](https://observablehq.com/), we realize that _well-designed libraries don't necessarily make code accessible—the code environment does_! So here is Recho — **a lighter way to code, creatively**. We offer you a lighter beginning:

- **Lighter Input** - We use vanilla JavaScript, and you don't have to learn extra libraries or browser specific APIs to get started with. It can help you focus more on general coding concepts and algorithms themselves.
- **Lighter Output** - We embrace text based output - an universal and timeless interface. It's concise, intuitive and efficient, which keeps your attention on the essence of code rather than the overhead of visuals.
- **Lighter Flow** - We stay in an online reactive editor - inputs and outputs both show up there. There is no need to switch context while coding. Instant feedbacks allow you better understand your code and shape ideas.
- **Lighter Purpose** - We don't need to dream big in Recho. While AI makes coding less important for "world-changing" ideas, we want to secure a place where you can code just for fun. Life can be without work, right?

Ideally, you can be creative afterwards. You may find the minimalism of ASCII/text art both fascinating and inspiring. Coding can become a new way to express yourself and explore the world. That’s the success of Recho!

## What's Next 🔥

Recho is still in its early stage, there are a lot of areas we want to explore and build with the community. Especially, we are interested in the following things:

- **More Examples** - Examples attract users and shape tools. We would love to have examples in different areas (text analysis, data viz, graphics, concrete poetry, algorithms, etc,) and working with external libraries (D3, Lodash, ml5, Tone, etc,). They don't have to be complicated or perfect. One thing to share is enough. Open a pull request to share yours today!
- **Text Based Libraries** - Best practices deserve to be seen by more people. If you find some algorithms you are using helpful for others, don't hesitate to package them into libraries. Remember, they can be light!
- **Diverse Programming Languages** - Recho begins with JavaScript, but isn’t limited to it—coding has no boundaries. As long as a programming language can be transpiled to JavaScript, it can incorporated with Recho. It can be main steam (Python, Rust), be academic (mlscript) and be creative (wenyan‑lang). The best part is that it doesn't have to be production ready or have a real life usage. Just providing a new way to code or think is cool. Want to add your favorite language to Recho or share your "toys"? Talk to us!

Of course, there are a lot of editor related features on the way!

- **Reactive Inputs** - Reactivity right in the editor. (slider, checkbox, radio, etc,.)
- **Visual Enhancement** - More expressive and informative editor. (dark theme, ANSI escape codes, etc,.)
- **Interactivity** - Response to user inputs. (mouse, keyboard, etc,.)
- ...

Also, we have plans to provide cloud storage services. But we don't want to overcomplicated things at this point, so any thoughts, comments and suggestions are welcome!

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

## License 📄

ISC © [Recho](https://github.com/recho-dev)
