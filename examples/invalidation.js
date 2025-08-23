const code = `// Change the value of count and click the run button to see the alert.
const count = 0;

{
  invalidation.then(() => alert("Previous Value: " + count));
}`;

export const invalidation = {
  code,
  name: "Invalidation",
};
