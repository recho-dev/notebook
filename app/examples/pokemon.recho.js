/**
 * @title Pokemon Guessing Game
 * @author Bairui Su
 * @created 2025-09-23
 * @pull_request 121
 * @github pearmini
 * @thumbnail_start 38
 */

/**
 * ============================================================================
 * =                           Pokemon Guessing Game                          =
 * ============================================================================
 *
 * This example is inspired by Ping Lin's **LoadJSON: Pokemon**:
 *
 * https://editor.p5js.org/pinglin/sketches/530Xltl3l
 *
 * You can select a Pokemon by the radio or change the search text to get a
 * Pokemon. Then ask others to guess the Pokemon by the ASCII art.
 */

const selected = recho.radio(0, ["pikachu", "charmander", "squirtle", "bulbasaur"]);

const search = null;

//➜ ⚡ Type: ELECTRIC
//➜ ⚖️ Weight: 60
//➜ 📏 Height: 4
//➜
//➜
//➜
//➜
//➜
//➜
//➜
//➜
//➜                      %%
//➜                      +-*       #*+##%
//➜                      #--:..:=::-=#     %+*
//➜                      #*:-::+*=-+    #*-:::-%
//➜                     #=:-=---:**=  #-:::::::+
//➜                      %----------*%=----+#%
//➜                       :-:----::::  #==
//➜                      *::-::=::-::*#=+*%
//➜                     #----:-=--::-- ##
//➜                     +--:::::------%
//➜                     ##+#%   %#*=+#
//➜
//➜
//➜
//➜
//➜
//➜
//➜
//➜
{
  echo(`⚡ Type: ${pokemon.types[0].type.name.toUpperCase()}`, {quote: false});
  echo(`⚖️ Weight: ${pokemon.weight}`, {quote: false});
  echo(`📏 Height: ${pokemon.height}`, {quote: false});
  echo("", {quote: false});
  img2ASCIIString(pokemon.sprites.front_default).then(echo);
}

/**
 * Originally, I wanted to create an example to visualize a Pokemon in ASCII
 * art. But I found it's not easy to tell under the current transformation
 * from pixels to characters. So I decided to make it a guessing game.
 *
 * In addition, this is also a good showcase for the following features:
 *
 * - How to use Data API in Recho
 * - How to draw image in Recho
 * - How to use inputs in Recho
 */

const pokemon = await getPokemon(search || selected);

async function getPokemon(name) {
  const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  return pokemon.json();
}

async function img2ASCIIString(url, cols = 60, rows = 25) {
  const asciiChars = " %#*+=-:. "; // From black to white.

  // Load the image.
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, img.width, img.height).data;

  const cellWidth = img.width / cols;
  const cellHeight = img.height / rows;

  let ascii = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Compute the range of the cell.
      const startX = Math.floor(x * cellWidth);
      const startY = Math.floor(y * cellHeight);
      const endX = Math.floor((x + 1) * cellWidth);
      const endY = Math.floor((y + 1) * cellHeight);

      // Compute the brightness of the cell.
      let sum = 0;
      let count = 0;
      for (let py = startY; py < endY; py++) {
        for (let px = startX; px < endX; px++) {
          const idx = (py * img.width + px) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          sum += brightness;
          count++;
        }
      }
      const avg = sum / count;
      const charIndex = Math.floor((avg / 255) * (asciiChars.length - 1));
      ascii += asciiChars[charIndex];
    }
    ascii += "\n";
  }

  return ascii;
}
