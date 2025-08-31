/**
 * @title Matrix Rain
 * @author Bairui Su
 * @created 2025-08-31
 * @pull_request 2
 * @github pearmini
 */

const width = 60;
const height = 25;
const columns = d3.range(width).map(() => createColumn(height));

//➜              w       $  R        |       @      2         !
//➜        j     M          &        C              m        ,
//➜         _#   D          9 z      L         ?    Z=
//➜         !d   `          [        *         g    g     3
//➜         t|   [      -  BS  E     k e      u<    J :  o6      j
//➜         I*   !      j  R$ p7     p I&D    k,      j  ?1      M
//➜      k  j#   W O D  (      ,   > a s#     XY   9' .  XK y    )
//➜      a  $\  *n [B   W  W   F    6[ w>  R  AOL   p j  _B U    Z
//➜      X  /1     NX9  K      ~     7  Z /u  b_    o H ,:u=$    6
//➜    Btb* rE a    yD  i    n ^     ks , S!  |?      &  ?$ l    a
//➜    $ 3  @  y    ro  9       b    Oh ! I-  ^7      x  =t     X
//➜    8 n  <  F    8ZG -       +    8i 2 .j  j       bx ,tf     G
//➜    _ 8  t  3    GH& T u           S K y   M   !   Ln 45Y   K L
//➜    }    d  ca   @ h   4           T 7 6   T   (   !y_hx7   P r
//➜    u    i  /    FH0   =      K    v P     `   e   <[ XjD  <6 u
//➜   M%    V  {    vg    |      V    4 q     7 [ R   ;   [@  =; \
//➜    R       y    [:    }      ) `v S       [ %     /   g-  u= 3
//➜    g       $    UH    g      & rD @       b H     =    o  4+ R
//➜    9       g    96           W c  ~         t          *  mq
//➜            ;    vI           )    p          \             M
//➜            )    wc           A                 ~
//➜                  d           _          =      D
//➜                  `           ~          q      #
//➜                  |           m                 e
//➜                  e           W                 ^
{
  frame;

  // Create a new buffer.
  const buffer = d3.range(width * height).map(() => " ");

  // Update all columns.
  for (let i = columns.length - 1; i >= 0; --i) {
    const column = columns[i];
    const {lifespan, length, chars} = column;
    const n = chars.length;
    if (lifespan < 0) columns[i] = createColumn(height);
    else if (lifespan <= n) chars[n - lifespan] = " ";
    else {
      for (let j = length - 1; j < n; ++j) chars[j] = randomChar();
      chars.push(randomChar());
    }
    column.lifespan -= 1;
  }

  // Update the buffer.
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
  echo(output);
}

function createColumn(height) {
  const lifespan = d3.randomInt(height)();
  const length = d3.randomInt(lifespan)();
  const chars = d3.range(length).map(randomChar);
  const y = d3.randomInt(0, 10)();
  return {lifespan, length, chars, y};
}

function randomChar() {
  return String.fromCharCode(d3.randomInt(32, 127)());
}

const frame = recho.interval(1000 / 15);

const d3 = recho.require("d3");
