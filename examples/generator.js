const code = `const now = doc((function* () {
  for (let i = 0; true; ++i) {
    yield i;
  }
})());

const x = doc(Math.abs(~~(Math.sin(now / 100) * 22)));

doc('~'.repeat(x) + '(๑•̀ㅂ•́)و✧', {quote: false});`;

export const generator = {
  name: "Generator",
  code,
};
