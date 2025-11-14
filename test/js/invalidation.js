export const invalidation = `// Change the value of count and click the run button to see the alert.
const count = 0;

{
  echo.dispose(() => alert("Previous Value: " + count));
}`;
