/**
 * @title Computer Layers
 * @author Bairui Su
 * @created 2026-01-02
 * @github pearmini
 * @pull_request 207
 * @thumbnail_start 36
 * @label Beginner
 */

/**
 * ============================================================================
 * =                            Computer Layers                               =
 * ============================================================================
 *
 * > Computers can be seen as layers of technology, with increasing complexity and
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

//➜ +-----+--------------------------------+
//➜ | {0} |                  "Application" |
//➜ |-----|--------------------------------|
//➜ | {1} |                    "Algorithm" |
//➜ |-----|--------------------------------|
//➜ | {2} |         "Programming Language" |
//➜ |-----|--------------------------------|
//➜ | {3} |            "Assembly Language" |
//➜ |-----|--------------------------------|
//➜ | {4} |                 "Machine Code" |
//➜ |-----|--------------------------------|
//➜ | {5} | "Instruction Set Architecture" |
//➜ |-----|--------------------------------|
//➜ | {6} |            "Microarchitecture" |
//➜ |-----|--------------------------------|
//➜ | {7} |              "Gates/Registers" |
//➜ |-----|--------------------------------|
//➜ | {8} |         "Device (Transistors)" |
//➜ |-----|--------------------------------|
//➜ | {9} |                    "Physicals" |
//➜ +-----+--------------------------------+
for (let i = 0; i < layers.length; i++) {
  echo.key(i)(layers[i]);
}
