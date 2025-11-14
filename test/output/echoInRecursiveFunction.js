function recursiveAdd(v, depth) {
  if (depth === 0) return;
  echo(v);
  recursiveAdd(v + 1, depth - 1);
}

//➜ 1
//➜ 2
//➜ 3
recursiveAdd(1, 3);

//➜ 2
//➜ 3
//➜ 4
//➜ 5
recursiveAdd(2, 4);
