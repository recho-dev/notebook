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
      doc(count);
    }
  }, 1000);

  doc(count);

  invalidation.then(() => clearInterval(timer));
}`;
