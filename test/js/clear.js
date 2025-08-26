export const clear = `{
  let count = 10;
  
  const timer = setInterval(() => { 
    clear();
    if (count-- <= 0) {
      clearInterval(timer);
      setTimeout(() => {
        clear();
      }, 1000);
    } else {
      echo(count);
    }
  }, 1000);

  echo(count);

  invalidation.then(() => clearInterval(timer));
}`;
