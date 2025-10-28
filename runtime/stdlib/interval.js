export async function* interval(ms) {
  let frame = 0;
  while (true) {
    yield frame++;
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
