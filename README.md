# Recho: Reactive Echo

> We want to live in the editor forever. — [Luyu Cheng](https://luyu.computer/)

[**Recho**](https://recho.dev/) is a free, [open-source](/LICENCE), reactive code scratchpad that echoes output inline with your code as comments—enabling beginners, developers, artists, and anyone curious to quickly code and explore through text experiments/art. Built on the reactive model of [Observable Notebook Kit](https://github.com/observablehq/notebook-kit), Recho makes coding accessible, interactive, and playful, turning every string output into a creative, in-situ experience—discover the sketches of tomorrow.

- [Editor](https://recho.dev/) 📝 - The quickest way to get started with Recho.
- [Documentation](https://recho.dev/docs/introduction) 📚 - Learn how to use Recho with our comprehensive guides.
- [Examples](https://recho.dev/examples) 🖼️ - See what you can create and draw some inspiration!
- [Sharing](/CONTRIBUTING.md#sharing-examples) 🎨 - Follow the instructions to open a [pull request](https://github.com/recho-dev/recho/new/main/app/examples) to share your sketches!
- [Contributing](/CONTRIBUTING.md) 🙏 - We have [a bunch of things](https://github.com/recho-dev/recho/issues) that we would like you to help us build together!

## Why Recho 💡

We want to make code more accessible and hopefully, more playful. Inspired by [P5.js Editor](https://editor.p5js.org/) and [Observable Notebook](https://observablehq.com/), we realize that _well-designed libraries don't necessarily make code accessible—the code environment does_! So here is Recho: **a lighter way to code**. We offer you a lighter beginning:

- **Lighter Input** - We use vanilla JavaScript, and you don't have to learn extra libraries or browser specific APIs to get started with. It can help you focus more on general coding concepts and algorithms themselves.
- **Lighter Output** - We embrace text-based output—a universal and timeless interface. It's concise, intuitive, and efficient, which keeps your attention on the essence of code rather than the overhead of visuals.
- **Lighter Flow** - We stay in an online reactive editor—inputs and outputs both show up there. There is no need to switch context while coding. Instant feedback allows you to better understand your code and shape ideas.
- **Lighter Purpose** - We don't need to dream big in Recho. While AI makes coding less important for "world-changing" ideas, we want to secure a place where you can code just for fun. Life can be without work, right?

Ideally, you can be creative afterwards. You may find the minimalism of ASCII/text art both fascinating and inspiring. Coding can become a new way to express yourself and explore the world. That’s the success of Recho!

## What's Next 🔥

Recho is still in its early stage. There are a lot of areas we want to explore and build with the community. Especially, we are interested in the following things:

- **More Examples** - Examples attract users and shape tools. We would love to have examples in different areas ([text analysis](https://recho.dev/examples/word-count), [data viz](https://recho.dev/examples/phases-of-the-moon), [graphics](https://recho.dev/examples/cg-text-based-shaders), [concrete poetry](https://recho.dev/examples/fire!), [algorithms](https://recho.dev/examples/maze), etc.) and working with external libraries ([D3](https://d3js.org/), [Lodash](https://lodash.com/), [ml5](https://ml5js.org/), [Tone](https://tonejs.github.io/), etc.). They don't have to be complicated or perfect. One thing to share would be great. Follow the [instructions](/CONTRIBUTING.md#sharing-examples) to open a [pull request](https://github.com/recho-dev/recho/new/main/app/examples) to share yours today!
- **Text-Based Libraries** - Best practices deserve to be seen by more people. If you find some algorithms you are using helpful for others, don't hesitate to package them into libraries. Remember, they can be light!
- **Polyglot Programming** - Recho begins with JavaScript, but isn't limited to it—coding has no boundaries. As long as a programming language can be transpiled to JavaScript, it can be incorporated with Recho. It can be mainstream ([Python](https://www.python.org/), [Rust](https://www.rust-lang.org/)), academic ([MLscript](https://github.com/hkust-taco/mlscript)), or creative ([wenyan‑lang](https://wy-lang.org/)). The best part is that it doesn't have to be production-ready or have real-life usage. Just providing a different way to code or think is cool. Want to add your favorite language to Recho or share your "toys"? [Talk to us](https://github.com/recho-dev/recho/issues/109)!
- **Explorations with LLMs** - Recho’s text-first approach is ideal for LLMs. Rather than letting the LLM write code directly, you can use code as input: fusing files, turning text into pixel outputs, and more. We want to [exploring the possibilities](https://github.com/recho-dev/recho/issues/110).

Of course, there are a lot of editor related features on the way!

- **Editing Optimization** - Improve editing experiences. ([rerunning blocks](https://github.com/recho-dev/recho/issues/42), [formatting code](https://github.com/recho-dev/recho/issues/108), etc.)
- **Visual Enhancement** - More expressive and informative editor. ([dark theme](https://github.com/recho-dev/recho/issues/104), [ANSI escape codes](https://github.com/recho-dev/recho/issues/45), etc.)
- **Interactivity** - Response to user inputs. ([mouse](https://github.com/recho-dev/recho/issues/34), [keyboard](https://github.com/recho-dev/recho/issues/105), etc.)
- ...

Also, we have plans to provide [cloud storage services](https://github.com/recho-dev/recho/issues/107). But we don't want to overcomplicate things at this point, so any thoughts, comments, and suggestions are welcome!

## A Quick Example 🚀

Here is a [quick example](https://recho.dev/examples/mandelbrot-set) to showcase Recho. A block of code is written to explore the algorithm behind [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set), generating a string called _output_. After calling _echo(output)_, the output appears above the code block as comments. By tweaking the values of _cols_, _rows_, and _maxIter_, the output updates reactively for further explorations. Check out more [live examples](https://recho.dev/examples) to see what you can create with Recho.

```js
const text = `The dog, cat, and mouse were playing in the yard. Dog barked loudly, while cat ran quickly. 
Mouse hid under the bench, but the dog kept looking. Cat jumped over a small fence; dog followed. 
Bird watched silently as dog, cat, and mouse moved around.`;

const ignoredWords = ["the", "was", "not", "over", "and", "in", "were", "a", "while", "but", "as", "around"];

//➜ the dog cat and mouse were playing in the yard dog barked loudly while cat ran quickly
//➜ mouse hid under the bench but the dog kept looking cat jumped over a small fence dog followed
//➜ bird watched silently as dog cat and mouse moved around
const clean = echo(text.toLowerCase().replace(/[.,!?;]/g, ""));

//➜ [ "the", "dog", "cat", "and", "mouse", "were", "playing", "in", "the", "yard", "dog", "barked", "loudly", "while", "cat", "ran", "quickly", "mouse", "hid", "under", "the", "bench", "but", "the", "dog"…
const words = echo(clean.split(/\s+/));

//➜ [ "dog", "cat", "mouse", "playing", "yard", "dog", "barked", "loudly", "cat", "ran", "quickly", "mouse", "hid", "under", "bench", "dog", "kept", "looking", "cat", "jumped", "small", "fence", "dog", "f…
const filtered = echo(words.filter((w) => !ignoredWords.includes(w)));

//➜ { dog: 5, cat: 4, mouse: 3, playing: 1, yard: 1, barked: 1, loudly: 1, ran: 1, quickly: 1, hid: 1, under: 1, bench: 1, kept: 1, looking: 1, jumped: 1, small: 1, fence: 1, followed: 1, bird: 1, watched…
const frequencies = echo(filtered.reduce((acc, w) => ((acc[w] = (acc[w] || 0) + 1), acc), {}));

//➜ 🟩🟩🟩🟩🟩 dog
//➜ 🟩🟩🟩🟩 cat
//➜ 🟩🟩🟩 mouse
//➜ 🟩 playing
//➜ 🟩 yard
//➜ 🟩 barked
//➜ 🟩 loudly
//➜ 🟩 ran
//➜ 🟩 quickly
//➜ 🟩 hid
//➜ 🟩 under
//➜ 🟩 bench
//➜ 🟩 kept
//➜ 🟩 looking
//➜ 🟩 jumped
//➜ 🟩 small
//➜ 🟩 fence
//➜ 🟩 followed
//➜ 🟩 bird
//➜ 🟩 watched
//➜ 🟩 silently
//➜ 🟩 moved
echo(
  Object.entries(frequencies)
    .map(([word, count]) => "🟩".repeat(count) + " " + word)
    .join("\n"),
);
```

## License 📄

ISC © [Recho](https://github.com/recho-dev)
