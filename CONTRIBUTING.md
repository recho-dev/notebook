# Recho - Contributing

Recho is open source and released under the [ISC license](/LICENCE). You are welcome to contribute in different ways: open a [pull request](https://github.com/recho-dev/recho/pulls), particle in [issues](https://github.com/recho-dev/recho/issues) and [discussions](https://github.com/recho-dev/recho/discussions) or star this project!

## Sharing Examples

All the examples locate in `app/examples`. The quickest way for adding an example is through GitHub's web editor:

- Go to [new file](https://github.com/recho-dev/recho/new/main/app/examples).
- Enter the filename in the format of `[SKETCH-NAME].recho.js`.
- Add the metadata as doc strings at the top of the file.
- Add the code below the metadata.
- Click the "Commit changes" button.

The following metadata are required:

- **title** - the title of the sketch
- **author** - the author of the sketch
- **created** - the date of the creation of the sketch
- **github** - the GitHub username of the author, for displaying the avatar
- **pull_request** - the pull request number of adding this sketch, for commenting on the pull request

The following metadata are optional:

- **thumbnail_start** - the line number of the start of the thumbnail code

Here is an example:

```js
/**
 * @title Hello World
 * @author Bairui SU
 * @github pearmini
 * @created 2025-09-15
 * @pull_request 123
 * @thumbnail_start 26
 */

echo("Hello World");
```

This a [pull request](https://github.com/recho-dev/recho/pull/82) you can refer to.

## Editor & Runtime Development

If you want to contribute to the editor or runtime, make sure to add test files in `test/js/` and register then in `test/js/index.js`.

For example, if you add a new test file called `hello-world.js` with the following content:

```js
export const helloWorld = `echo("Hello World");`;
```

Then you need to register it in _test/js/index.js_ with the following content:

```js
export {helloWorld} from "./hello-world.js";
```

Then run `npm run dev` to open the development server.

After finishing development, run `npm run test` to make sure everything work as expected.

![test-env](/img/test-env.png)

## Website Development

If you want to contribute to the [website](https://recho.dev/), run `npm run app:dev` to open the development server. After finishing development, run `npm run test` to make sure everything work as expected.
