export const specialStatement = `let height = 5;
let triangle = '';

for (let i = 1; i <= height; i++) {
  triangle += ' '.repeat(height - i); 
  triangle += '*'.repeat(i * 2 - 1); 
  triangle += '\\n';
}

echo(triangle);


if (true) {
  echo("true");
} else {
  echo("false");
}
`;
