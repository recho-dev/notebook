/**
 * @title recho.require(...names)
 */

/**
 * ============================================================================
 * =                        recho.require(...names)                          =
 * ============================================================================
 *
 * Imports one or more JavaScript packages. The import specifiers must be valid
 * npm package names with optional version specifiers. It use `d3-require`
 * under the hood.
 *
 * @param {string} ...names - The names of the packages to import.
 * @returns {any} The imported package.
 * @see https://github.com/d3/d3-require
 */

const Noise = recho.require("perlin-noise-3d");

//➜ [ 0.5428002520733116, 0.5424832952636395, 0.5414633391270067, 0.5397183031066122…
{
  const noise = new Noise();
  const values = [];
  for (let i = 0; i < 100; i++) {
    values.push(noise.get(i / 100, i / 100, i / 100));
  }
  echo(recho.inspect(values, {limit: 80}));
}

const d3 = recho.require("d3-array", "d3-random");

//➜ [ 6, 4, 1, 2, 5, 3, 3, 0, 6, 2 ]
echo(d3.range(10).map(d3.randomInt(0, 10)));

