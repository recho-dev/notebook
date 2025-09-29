/**
 * @title donut.js
 * @author Bairui Su
 * @created 2025-09-29
 * @pull_request 126
 * @github pearmini
 * @thumbnail_start 26
 *
 */

/**
 * ============================================================================
 * =                           Donut                                          =
 * ============================================================================
 *
 * This example ported directly from https://www.a1k0n.net/js/donut.js
 * 
 * - Original post: https://www.a1k0n.net/2011/07/20/donut-math.html
 */

const S = recho.number(10, {min: 5, max: 30, step: 1});
const T = recho.interval(30);

{
  var b = [];
  var z = [];
  var A = 1 + (T * 0.07 * S) / 10;
  var B = 1 + (T * 0.03 * S) / 10;
  var cA = Math.cos(A),
    sA = Math.sin(A),
    cB = Math.cos(B),
    sB = Math.sin(B);
  for (var k = 0; k < 1760; k++) {
    b[k] = k % 80 == 79 ? "\n" : " ";
    z[k] = 0;
  }
  for (var j = 0; j < 6.28; j += 0.07) {
    var ct = Math.cos(j),
      st = Math.sin(j);
    for (var i = 0; i < 6.28; i += 0.02) {
      var sp = Math.sin(i),
        cp = Math.cos(i),
        h = ct + 2,
        D = 1 / (sp * h * sA + st * cA + 5),
        t = sp * h * cA - st * sA;
      var x = 0 | (40 + 30 * D * (cp * h * cB - t * sB)),
        y = 0 | (12 + 15 * D * (cp * h * sB + t * cB)),
        o = x + 80 * y,
        N = 0 | (8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));
      if (y < 22 && y >= 0 && x >= 0 && x < 79 && D > z[o]) {
        z[o] = D;
        b[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0];
      }
    }
  }
  echo(b.join(""));
}
