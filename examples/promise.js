const code = `const a = doc(new Promise(resolve => setTimeout(() => resolve(1), 2000)));

const b = doc(a + 1);

{
  doc(1);
  doc(a + 2);
  doc(b + 3);
}`;

export const promise = {
  name: "Promise",
  code,
};
