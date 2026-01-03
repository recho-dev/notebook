/**
 * @title Computer Layers
 * @author Bairui Su
 * @created 2026-01-02
 * @github pearmini
 * @pull_request 207
 * @thumbnail_start 41
 * @label Beginner
 */

/**
 * ============================================================================
 * =                            Computer Layers                               =
 * ============================================================================
 *
 * > Computer can be seen as layers of technology, with increasing complexity and
 * > abstraction as they go up. Programming can happen at different layers.
 *
 * - By Everest Pipkin, 2020
 * - Ref. https://ifyoulived.org/fuzzy/#I%20-%20Computers%20were%20humans
 */

const layers = [
  "Application",
  "Algorithm",
  "Programming Language",
  "Assembly Language",
  "Machine Code",
  "Instruction Set Architecture",
  "Microarchitecture",
  "Gates/Registers",
  "Device (Transistors)",
  "Physicals",
];

for (let i = 0; i < layers.length; i++) {
  echo.key(i)(layers[i]);
}
