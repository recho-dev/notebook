//➜ [Function (anonymous)]
const obj = echo((x, y) => ({x, y}))

//➜ { x: 1, y: 2 }
echo(obj(1, 2));
