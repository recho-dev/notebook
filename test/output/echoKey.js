//➜ +-------+-----+-----+-----+
//➜ |  {lo} |   0 |   3 |   3 |
//➜ |-------|-----|-----|-----|
//➜ |  {hi} |   5 |   5 |   3 |
//➜ |-------|-----|-----|-----|
//➜ |  {mi} |   2 |   4 |   3 |
//➜ |-------|-----|-----|-----|
//➜ | {val} | "c" | "e" | "d" |
//➜ +-------+-----+-----+-----+
binarySearch('d', ["a", "b", "c", "d", "e", "f"]);

function binarySearch(key, array) {
  let lo = 0;
  let hi = array.length - 1;
  while (lo <= hi) {
    const mi = (lo + hi) >>> 1;
    const val = array[mi];
    echo.key("lo")(lo);
    echo.key("hi")(hi);
    echo.key("mi")(mi);
    echo.key("val")(val);
    if (val < key) lo = mi + 1;
    else if (val > key) hi = mi - 1;
    else return mi;
  }
  return -1;
}