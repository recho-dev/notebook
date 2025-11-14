/**
 * @title Dog
 * @author Bairui Su
 * @created 2025-10-21
 * @github pearmini
 * @pull_request 181
 * @thumbnail_start 10
 * @label Algorithm, Beginner
 */

/** A Quick Example! 🐶 */

//➜ "dog"
const text = echo("dog");

//➜ [ "d", "o", "g" ]
const chars = echo(text.split(""));

//➜ "god"
echo(chars.slice().reverse().join(""));
