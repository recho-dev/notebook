//➜ [Function (anonymous)]
const obj = echo((x, y) => ({x, y}))

//➜ [Function (anonymous)]
const obj2 = echo((x, y) => ((x + y)))

//➜ { x: 1, y: 2 }
echo(obj(1, 2));

//➜ 7
echo(obj2(3, 4));
