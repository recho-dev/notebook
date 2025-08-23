import {helloWorld} from "./hello-world.js";
import {addition} from "./addition.js";
import {inspector} from "./inspector.js";
import {promise} from "./promise.js";
import {generator} from "./generator.js";
import {invalidation} from "./invalidation.js";
import {clear} from "./clear.js";
import {syntaxError} from "./syntax-error.js";
import {syntaxError2} from "./syntax-error2.js";
import {runtimeError} from "./runtime-error.js";
import {randomHistogram} from "./random-histogram.js";
import {mandelbrotSet} from "./mandelbrot-set.js";
import {matrixRain} from "./matrix-rain.js";

export const examples = [
  helloWorld,
  addition,
  inspector,
  promise,
  generator,
  clear,
  invalidation,
  syntaxError,
  syntaxError2,
  runtimeError,
  randomHistogram,
  mandelbrotSet,
  matrixRain,
];
