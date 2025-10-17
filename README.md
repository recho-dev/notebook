# Recho Notebook

![preview](./img/preview.png)

> We want to live in the editor forever. — [Luyu Cheng](https://luyu.computer/)

[**Recho Notebook**](https://recho.dev/notebook) is a free, [open-source](/LICENCE), reactive editor for algorithms and ASCII art. It introduces a _plain code format_ for notebooks — echoing output inline as comments for live, in-situ coding with instant feedback. Built on vanilla JavaScript and the reactive model of [Observable Notebook Kit](https://observablehq.com/notebook-kit/), Recho Notebook lets developers, artists, and learners explore and create directly in code.

- [Editor](https://recho.dev/notebook) 📝 - The quickest way to get started with Recho Notebook.
- [Announcement](https://medium.com/@subairui/a-lighter-way-to-code-with-creativity-8c0ac739aa6f) 📢 - Read our initial release story to discovery the vision behind Recho Notebook.
- [Documentation](https://recho.dev/notebook/docs/introduction) 📚 - Learn how to use Recho Notebook with our comprehensive guides.
- [Examples](https://recho.dev/notebook/examples) 🖼️ - See what you can create and draw some inspiration!
- [Sharing](/CONTRIBUTING.md#sharing-examples) 🎨 - Follow the instructions to open a [pull request](https://github.com/recho-dev/notebook/new/main/app/examples) to share your sketches!
- [Contributing](/CONTRIBUTING.md) 🙏 - We have [a bunch of things](https://github.com/recho-dev/notebook/issues) that we would like you to help us build together!

## Why Recho Notebook 💡

On the one hand, we’ve always loved [Observable Notebooks](https://observablehq.com/). To explore a more portable notebook format, we created [Markdown Genji](https://genji-md.dev/), which extends Markdown with notebook-like features. Later, similar ideas appeared in [Observable Framework](https://observablehq.com/framework), and recently, [Observable Notebook Kit](https://observablehq.com/notebook-kit/) introduced an HTML-based file format. That made us wonder — could notebooks be even more portable, perhaps as a plain code file?

On the other hand, we’ve always been interested in making code more accessible and playful. Inspired by the [p5.js web editor](https://editor.p5js.org/), we realized that a _well-designed language doesn’t necessarily make coding more accessible — the environment does_. The p5.js web editor achieves this, in part, through its focus on graphics. That made us wonder — could there be an environment that focuses more on computation rather than graphics, yet remains just as accessible and playful? One that uses ASCII art—like what we did in [gh2](https://github.com/charming-art/gh2)—when visual output is truly needed?

To explore these questions, introducing Recho Notebook: **[a lighter way to code with creativity](https://medium.com/@subairui/a-lighter-way-to-code-with-creativity-8c0ac739aa6f)**. By "lighter", we mean you can have a lighter start:

- **Lighter Output** - The first citizen of Recho Notebook is text—each piece of result can be inspected as strings. Text is a universal interface, which is concise, intuitive, and efficient. This keeps your attention on the essence of code rather than the overhead of visuals.
- **Lighter Flow** - We stay in an online reactive editor—inputs and outputs both show up there. There is no need to switch context while coding. Instant feedback allows you to better understand your code and shape ideas.
- **Lighter Input** - We use vanilla JavaScript with reactivity and minimal custom APIs. This means you don't need to learn any nonstandard JavaScript variant, and also eliminates the need to learn a bunch of third-party APIs. By doing this, we aim to minimize the gap between coding in Recho Notebook and in the real world, making it easier for the experienced to get in and for beginners to get out.
- **Lighter Purpose** - We don't need to dream big in Recho Notebook. While AI makes coding less important for "world-changing" ideas, we want to secure a place where you can code just for fun. Life can be without work, right? You can experiment with math functions, play with string manipulation, or simply implement basic algorithms to experience the charm of computing.

By "creativity", we mean you can end up doing something fun, and find a new way to express yourself or understand the world. If computers are aliens, our best hope is that by learning their languages, which is code, through Recho Notebook, you'll develop a deeper understanding of computation while unleashing your creativity!

## What's Next 🔥

Recho Notebook is still in its early stage. While there's still much work to do, we're excited to release the beta version and make it open source right now. If you're interested in trying it out, please visit the [website](https://recho.dev/notebook). Since the source code is available at GitHub here, we welcome any thoughts, comments, or suggestions. If you're interested in contributing to Recho Notebook, we're especially interested in these areas:

- **More Examples** - Examples attract users and shape tools. We would love to showcase examples across diverse areas ([text analysis](https://recho.dev/notebook/examples/word-count), [data viz](https://recho.dev/notebook/examples/phases-of-the-moon), [graphics](https://recho.dev/notebook/examples/cg-text-based-shaders), [concrete poetry](https://recho.dev/notebook/examples/fire!), [algorithms](https://recho.dev/notebook/examples/maze), etc.) and demonstrations working with external libraries ([D3](https://d3js.org/), [Lodash](https://lodash.com/), [ml5](https://ml5js.org/), [Tone](https://tonejs.github.io/), etc.). They don't have to be complicated or perfect. One thing to share would be great. Follow the [instructions](/CONTRIBUTING.md#sharing-examples) to open a [pull request](https://github.com/recho-dev/notebook/new/main/app/examples) to share yours today!
- **Polyglot Programming** - Recho Notebook begins with JavaScript, but isn't limited to it—coding has no boundaries. As long as a programming language can be transpiled to JavaScript, it can be incorporated with Recho Notebook. It can be mainstream ([Python](https://www.python.org/), [Rust](https://www.rust-lang.org/)), academic ([MLscript](https://github.com/hkust-taco/mlscript)), or creative ([wenyan‑lang](https://wy-lang.org/)). The best part is that it doesn't have to be production-ready or have real-life usage. Just providing a different way to code or think is cool. Want to add your favorite language to Recho Notebook or share your "toys"? [Talk to us](https://github.com/recho-dev/notebook/issues/109)!
- **Text-Based Libraries** - Best practices deserve to be seen by more people. If you find some algorithms you are using helpful for others, don't hesitate to package them into libraries. Remember, they can be light!
- **Explorations with LLMs** - Recho Notebook's text-first approach is ideal for LLMs. Rather than letting the LLM write code directly, you can use code as input: fusing files, turning text into pixel outputs, and more. We want to [explore the possibilities](https://github.com/recho-dev/notebook/issues/110).

In addition to these, there are a lot of editor related features on the way!

- **Editing Optimization** - Improve editing experiences. ([rerunning blocks](https://github.com/recho-dev/notebook/issues/42), [formatting code](https://github.com/recho-dev/notebook/issues/108), etc.)
- **Visual Enhancement** - More expressive and informative editor. ([dark theme](https://github.com/recho-dev/notebook/issues/104), [ANSI escape codes](https://github.com/recho-dev/notebook/issues/45), etc.)
- **Interactivity** - Response to user inputs. ([mouse](https://github.com/recho-dev/notebook/issues/34), [keyboard](https://github.com/recho-dev/notebook/issues/105), etc.)

Also, we have plans to provide [cloud storage services](https://github.com/recho-dev/notebook/issues/107). But we don't want to overcomplicate things at this point, so any thoughts, comments, and suggestions are welcome!

## A Quick Example 🚀

Here is a [word counting](https://recho.dev/notebook/examples/word-count) example to showcase Recho Notebook. Bret Victor gives programming a concise [definition](https://www.youtube.com/watch?v=ef2jpjTEB5U&t=501s):

> Programming is blindly manipulating symbols.

By "blindly", he means we can't see the results of our manipulations. For example, given the piece of code counting word frequencies, we aren't able to see the results of each step. Implementing this transformation process largely relies on our imagination! If we accidentally imagine wrong, the code becomes buggy.

```js
const text = `The dog, cat, and mouse were playing in the yard. Dog barked loudly, while cat ran quickly. 
Mouse hid under the bench, but the dog kept looking. Cat jumped over a small fence; dog followed. 
Bird watched silently as dog, cat, and mouse moved around.`;

const ignoredWords = ["the", "was", "not", "over", "and", "in", "were", "a", "while", "but", "as", "around"];

const clean = text.toLowerCase().replace(/[.,!?;]/g, "");

const words = clean.split(/\s+/);

const filtered = words.filter((w) => !ignoredWords.includes(w));

const frequencies = filtered.reduce((acc, w) => ((acc[w] = (acc[w] || 0) + 1), acc), {});
```

However, we can see the results of each transformation in Recho Notebook. By calling `echo(results)`, the results are displayed as comments above the statement! Now we can better understand this piece of code by better "seeing" every manipulation. Notice that there is no need to switch to console to see the results, which results in an in-situ experience. And of course, we can be a little creative at last: writing a few lines of code to create a simple visualization!

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

ISC © [Recho Notebook](https://github.com/recho-dev)
