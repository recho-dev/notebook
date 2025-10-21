# Recho Notebook

![preview](./img/preview.png)

> We want to live in the editor forever. — [Luyu Cheng](https://luyu.computer/)

[**Recho Notebook**](https://recho.dev/notebook) is a free, [open-source](/LICENCE), reactive editor for algorithms and ASCII art. It introduces a _plain code format_ for notebooks — echoing output inline as comments for live, in-situ coding with instant feedback. Built on vanilla JavaScript and the reactive model of [Observable Notebook Kit](https://observablehq.com/notebook-kit/), Recho Notebook lets developers, artists, and learners explore algorithms and ASCII art interactively.

- [Editor](https://recho.dev/notebook) 📝 - The quickest way to get started with Recho Notebook.
- [Announcement](https://medium.com/@subairui/a-lighter-way-to-code-with-creativity-8c0ac739aa6f) 📢 - Read our initial release story to discovery the vision behind Recho Notebook.
- [Documentation](https://recho.dev/notebook/docs/introduction) 📚 - Learn how to use Recho Notebook with our comprehensive guides.
- [Examples](https://recho.dev/notebook/examples) 🖼️ - See what you can create and draw some inspiration!
- [Sharing](/CONTRIBUTING.md#sharing-examples) 🎨 - Follow the instructions to open a [pull request](https://github.com/recho-dev/notebook/new/main/app/examples) to share your sketches!
- [Contributing](/CONTRIBUTING.md) 🙏 - We have [a bunch of things](https://github.com/recho-dev/notebook/issues) that we would like you to help us build together!

## Core Idea 🧠

Unlike typical notebooks (like Jupyter or Observable), Recho Notebook treats **code and its output as a single, continuous document**. When you write code, **the output appears inline — as a comment right below or beside your code**.

```js
//➜ "dog"
const text = echo("dog");

//➜ [ "g", "o", "d" ]
const words = echo(text.split(""));

//➜ "god"
echo(words.reverse().join(""));
```

If you modify the code, the echoed output updates immediately. So instead of switching between “code cells” and “output cells,” your entire notebook feels like a living text file that responds to you.

## Design Philosophy 💡

The name **Recho** comes from “Reactive Echo” — every expression echoes its result, instantly. It’s meant to capture the feedback loop between code and creator — seeing how every small change ripples through your work.

Recho Notebook is both a tool and a statement — it imagines what happens if we strip away complex GUIs and treat code itself as the canvas.

It’s light, artistic, and reactive — blending ideas from creative coding, literate programming, and live performance.

## Example Use Cases 🖼️

- Teaching/learning basic algorithms with immediate visual/text feedback.
- Creating text-based animations to experience the simplicity and clarity in ASCII art.
- Exploring code minimalism — finding beauty in code and its textual output.

## Why Recho Notebook 🪶

We’ve always loved [Observable Notebooks](https://observablehq.com/). To make notebooks more portable, we built [Markdown Genji](https://genji-md.dev/), extending Markdown with live code features. Later, [Observable Framework](https://observablehq.com/framework) and [Observable Notebook Kit](https://observablehq.com/notebook-kit/) explored similar ideas, which made us wonder — could a notebook exist as a plain code file?

At the same time, we wanted to make coding more accessible and playful. Inspired by the [p5.js web editor](https://editor.p5js.org/), we realized **well-designed language doesn’t necessarily make coding more accessible — the environment does**. So we asked — what if we focused on algorithms instead of graphics, using ASCII art when visuals are needed?

That’s how Recho Notebook began — **[a lighter way to code with creativity](https://medium.com/@subairui/a-lighter-way-to-code-with-creativity-8c0ac739aa6f)**.

## License 📄

ISC © [Recho Notebook](https://github.com/recho-dev)
