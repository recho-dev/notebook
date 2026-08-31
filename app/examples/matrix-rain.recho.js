/**
 * @title Matrix Rain
 * @author Bairui Su
 * @created 2025-08-22
 * @pull_request 12
 * @github pearmini
 * @label ASCII Art
 */

/**
 * ============================================================================
 * =                            Matrix Rain                                   =
 * ============================================================================
 *
 * Matrix train is a classic effect in ASCII art and in the Matrix movie. So I
 * want to use Recho to create a simplified version. This example also provides
 * a way to render **shapes** in Recho.
 *
 * My implementation is basically a **particle system**. Each column of the
 * matrix is a particle. Each particle has a lifespan, a initial y position,
 * and a set of characters. The following rules are applied to each particle:
 *
 * - If a particle is dead (lifespan < 0), it will be reset,
 * - otherwise, if the lifespan is less than the length of the characters, the
 *   column will fade out, say to change characters to spaces successively,
 * - otherwise, the column will blink by replacing with new characters.
 *
 * Because there is no graphics API in Recho, we need to render the matrix
 * manually by creating a buffer and updating it, instead of concatenating
 * strings directly.
 *
 * Feel free to teak the `width` and `height` to see the changes!
 */

const width = 60;
const height = 25;
const columns = d3.range(width).map(() => createColumn(height));

//➜   B           X   ?l
//➜    R      D        P
//➜    ;      &        L     S             E           B
//➜    s      F  V   ) :0                   ; I       -   Q      ?
//➜    i         g  e  l    s     Y y    G  I:z       8   U      A
//➜    S         <  8  L   (        O    D  J )     > n   W      G
//➜       {    Z t  n  f  ,       w " 2g T  W Y   ,;M      T     4
//➜            g u We  &     8  I3u n  u u   nJ   #z<    2   @   {
//➜       S)   7 @7p-  r  \  f  K E.J    e'  /Oo  Su        u+   ^
//➜       1 |  c c~NM  '  ~E  CyE   5    '   )5   Ui }  .    t   d
//➜       . J  ( `q?   ^ 3ci    7   *   'W   h#  (@> Z  >    !   t
//➜         Y     }to  O -@i    B   S   [8   uw  };  }  b    r  4*
//➜               ~)B    3&^    ?b  l9  +    58  U"  v  h    N  BL
//➜               5D"    J      ve  Nr  4    }>  f-     '    ,  vJ
//➜               :u*    A      {   Fw  $     K  <u     H    2/ ic
//➜        r       h     3      v   [s  N     d  -[     sX   '   n
//➜      W b       B     H      k   .`  {  B     %S     /_ j -
//➜      + "    O        *  '       Eh  6  f     [.     La / G
//➜      L v    v       \'  p  8    7i  '  {     Pa     l' G *
//➜      Y p    T       2K  <  |     _  ! I\     %       9 ] ^
//➜      + B    !       )p  v  E     S  ^ km     D       y %
//➜     bt      Q       A5  T  j   H U  F Z/     X       n ]
//➜     #@              .J  N  H   ? o    ]      l         8
//➜     m               to  X  |   ] _    <      S         Y
//➜                     *~  q  K   `      n      ~         3
{
  frame;

  const buffer = d3.range(width * height).map(() => " ");

  for (let i = columns.length - 1; i >= 0; --i) {
    const column = columns[i];
    const {lifespan, length, chars} = column;
    const n = chars.length;
    if (lifespan < 0) columns[i] = createColumn(height);
    else if (lifespan <= n) chars[n - lifespan] = " ";
    else if (lifespan) {
      for (let j = length - 1; j < n; ++j) chars[j] = randomChar();
      chars.push(randomChar());
    }
    column.lifespan -= 1;
  }

  echo(write(buffer, columns));
}

function write(buffer, columns) {
  for (let i = 0; i < columns.length; ++i) {
    const column = columns[i];
    const {y, chars} = column;
    for (let j = 0; j < chars.length; ++j) buffer[(y + j) * width + i] = chars[j];
  }

  // Render the buffer.
  let output = "";
  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) output += buffer[i * width + j];
    output += i === height - 1 ? "" : "\n";
  }

  output = output
    .split("\n")
    .map((d) => "  " + d)
    .join("\n");

  return output;
}

function createColumn(height) {
  const lifespan = d3.randomInt(height)();
  const length = d3.randomInt(lifespan)();
  const chars = d3.range(length).map(randomChar);
  const y = d3.randomInt(0, 10)();
  return {lifespan, chars, length, y};
}

function randomChar() {
  return String.fromCharCode(d3.randomInt(32, 127)());
}

const frame = recho.interval(1000 / 15);

const d3 = recho.require("d3");
