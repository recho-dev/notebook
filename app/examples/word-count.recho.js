/**
 * @title Word Count
 * @author Bairui Su
 * @created 2025-09-13
 * @pull_request 96
 * @github pearmini
 * @thumbnail_start 152
 */

/**
 * ============================================================================
 * =                           Word Count                                     =
 * ============================================================================
 *
 * This example shows how to count the frequency of words in a text and
 * visualize the result with a simple bar chart. Also, we'll cover some useful
 * JavaScript APIs related to string and array manipulation.
 */

const text = `The dog, cat, and mouse were playing in the yard. Dog barked loudly, while cat ran quickly. 
Mouse hid under the bench, but the dog kept looking. Cat jumped over a small fence; dog followed. 
Bird watched silently as dog, cat, and mouse moved around.`;

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *             Step 1. Normalize: lowercase + remove punctuation
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * The first step is to normalize the text by converting it to lowercase and
 * removing punctuation. Here we use two string methods:
 *
 * - `string.toLowerCase()`: converts the text to lowercase.
 * - `string.replace(pattern, replacement)`: replaces the pattern with the
 *    replacement.
 */

//➜ the dog cat and mouse were playing in the yard dog barked loudly while cat ran quickly
//➜ mouse hid under the bench but the dog kept looking cat jumped over a small fence dog followed
//➜ bird watched silently as dog cat and mouse moved around
const clean = echo(text.toLowerCase().replace(/[.,!?;]/g, ""));

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                         Step 2. Split into words
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * The we need to split the text into words by whitespace. Here we use
 *
 * - `string.split(splitter)`: splits the text into words by the splitter.
 * - `/\s+/`: a regular expression that matches one or more whitespace
 *   characters.
 */

//➜ [ "the", "dog", "cat", "and", "mouse", "were", "playing", "in", "the", "yard", "dog", "barked", "loudly", "while", "cat", "ran", "quickly", "mouse", "hid", "under", "the", "bench", "but", "the", "dog"…
const words = echo(clean.split(/\s+/));

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                         Step 3. Remove Ignored Words
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * The next step is to remove ignored words. We first define a list of words
 * that we want to ignore.
 */

const ignoredWords = ["the", "was", "not", "over", "and", "in", "were", "a", "while", "but", "as", "around"];

/**
 * Then we filter out the ignored words by the following method:
 *
 * - `array.filter(callback)`: filters the array by the callback. The callback
 *    returns true for the words we want to keep.
 * - `array.includes(value)`: returns true if the array contains the value.
 */

//➜ [ "dog", "cat", "mouse", "playing", "yard", "dog", "barked", "loudly", "cat", "ran", "quickly", "mouse", "hid", "under", "bench", "dog", "kept", "looking", "cat", "jumped", "small", "fence", "dog", "f…
const filtered = echo(words.filter((w) => !ignoredWords.includes(w)));

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                         Step 4. Count frequencies
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Next, we count the frequencies of the words. We use the following method:
 *
 * - `array.reduce(callback, initial)`: reduces the array to a single value.
 *
 * The result should an associative array (or object in JavaScript) that maps
 * each word to its frequency.
 */

//➜ { dog: 5, cat: 4, mouse: 3, playing: 1, yard: 1, barked: 1, loudly: 1, ran: 1, quickly: 1, hid: 1, under: 1, bench: 1, kept: 1, looking: 1, jumped: 1, small: 1, fence: 1, followed: 1, bird: 1, watched…
const frequencies = echo(
  filtered.reduce((acc, w) => {
    acc[w] = (acc[w] || 0) + 1;
    return acc;
  }, {}),
);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           Step 5. Visualize it
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * The final step is to visualize the result. We first get the keys of the
 * object by `Object.keys(object)`, which is an array of the keys.
 */

//➜ [ "dog", "cat", "mouse", "playing", "yard", "barked", "loudly", "ran", "quickly", "hid", "under", "bench", "kept", "looking", "jumped", "small", "fence", "followed", "bird", "watched", "silently", "mo…
const keys = echo(Object.keys(frequencies));

/**
 * Then we get the maximum length of the keys by the following method:
 *
 * - `Math.max(...array)`: returns the maximum value in the array.
 * - `array.map(callback)`: maps the array to a new array by the callback.
 * - `string.length`: the character length of the string.
 */

//➜ 8
const maxLength = echo(Math.max(...keys.map((d) => d.length)));

/**
 * Next, we get the entries of the object by `Object.entries(object)`, which
 * is an array of pairs of the key and the value.
 */

//➜ [ [ "dog", 5 ], [ "cat", 4 ], [ "mouse", 3 ], [ "playing", 1 ], [ "yard", 1 ], [ "barked", 1 ], [ "loudly", 1 ], [ "ran", 1 ], [ "quickly", 1 ], [ "hid", 1 ], [ "under", 1 ], [ "bench", 1 ], [ "kept",…
const entries = echo(Object.entries(frequencies));

/**
 * Then we map the entries to the rows of the chart by the following method:
 *
 * - `string.padStart(length, padString)`: pads the string to the length with
 *    the padString.
 * - `string.repeat(value)`: repeats the string value times.
 */

//➜ [ "     dog-|🟩🟩🟩🟩🟩", "     cat-|🟩🟩🟩🟩", "   mouse-|🟩🟩🟩", " playing-|🟩", "    yard-|🟩", "  barked-|🟩", "  loudly-|🟩", "     ran-|🟩", " quickly-|🟩", "     hid-|🟩", "   under-|🟩", "   …
const rows = echo(
  entries.map(([key, value]) => {
    return key.padStart(maxLength) + "-|" + "🟩".repeat(value);
  }),
);

/**
 * Finally, we join the rows with a newline character to get the final output.
 *
 * - `array.join(separator)`: joins the array with the separator.
 */

//➜      dog-|🟩🟩🟩🟩🟩
//➜      cat-|🟩🟩🟩🟩
//➜    mouse-|🟩🟩🟩
//➜  playing-|🟩
//➜     yard-|🟩
//➜   barked-|🟩
//➜   loudly-|🟩
//➜      ran-|🟩
//➜  quickly-|🟩
//➜      hid-|🟩
//➜    under-|🟩
//➜    bench-|🟩
//➜     kept-|🟩
//➜  looking-|🟩
//➜   jumped-|🟩
//➜    small-|🟩
//➜    fence-|🟩
//➜ followed-|🟩
//➜     bird-|🟩
//➜  watched-|🟩
//➜ silently-|🟩
//➜    moved-|🟩
echo(rows.join("\n"));

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                              References
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Here are the links to the JavaScript APIs we used:
 *
 * - `string.toLowerCase()`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase
 * - `string.replace(pattern, replacement)`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
 * - `string.split(splitter)`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
 * - `array.filter(callback)`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 * - `array.includes(value)`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
 * - `array.reduce(callback, initialValue)`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
 * - `Object.keys(object)`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
 * - `Object.entries(object)`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
 * - `Math.max(...array)`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
 * - `array.map(callback)`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
 * - `string.padStart(length, padString)`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
 *    the padString. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
 * - `string.repeat(value)`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat
 * - `array.join(separator)`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
 */
