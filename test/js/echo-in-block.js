export const echoInBlock = `{
  let count = 5;
  const timer = setInterval(() => { 
    echo(count--);
    if (count <= 0) clearInterval(timer);
  }, 1000);
  invalidation.then(() => clearInterval(timer));
}`;