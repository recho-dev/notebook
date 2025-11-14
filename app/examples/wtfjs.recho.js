/**
 * @title What the f*ck JavaScript?
 * @author Bairui Su
 * @created 2025-09-25
 * @pull_request 123
 * @github pearmini
 * @thumbnail_start 26
 * @label Algorithm
 */

/**
 * ============================================================================
 * =                           What the f*ck JavaScript?                      =
 * ============================================================================
 *
 * JavaScript is a powerful language, flexible syntax and a large ecosystem
 * with a great community. However, it also has some quirks and unexpected
 * behaviors that can be dangerous but funny.
 * 
 * Here are some of the examples from https://github.com/denysdovhan/wtfjs.
 */

//➜ true
echo([] == ![]);
// https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#-is-equal-

//➜ false
echo(0.1 + 0.2 === 0.3);
// https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#precision-of-01--02

//➜ "baNaNa"
echo("b" + "a" + +"a" + "a");
// https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#banana

//➜ "fail"
echo(
  (![] + [])[+[]] +
  (![] + [])[+!+[]] +
  ([![]] + [][[]])[+!+[] + [+[]]] +
  (![] + [])[!+[] + !+[]]
)
// https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#its-a-fail

//➜ 15
echo(parseInt("f*ck", 16));
// https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#parseint-is-a-bad-guy

//➜ "1,2,34,5,6"
echo([1, 2, 3] + [4, 5, 6]);
// https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#adding-arrays

//➜ "first"
foo: {
  echo("first");
  break foo;
  echo("second");
}
// https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#labels

//➜ 1
//➜ 2
//➜ 3
//➜ 4
//➜ 5
a: b: c: d: e: f: g: echo(1), echo(2), echo(3), echo(4), echo(5);
// https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#labels

//➜ [ 1, 10, 3 ]
echo([10, 1, 3].sort());
// https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#default-behavior-arrayprototypesort
