import {compactDecoration} from "./compact.ts";
import {debugDecoration} from "./debug.ts";
export {blockIndicator} from "./indicators.ts";
import {outputDecoration, outputLines} from "./output.ts";
import {blockMetadataExtension} from "./state.ts";

export const blockExtensions = [
  // This view plugin tracks the output lines.
  outputLines,
  outputDecoration,
  // This extension tracks the metdata of each block.
  blockMetadataExtension,
  // This view plugin displays output lines in compact mode.
  compactDecoration,
  // This view plugin displays the block indicators.
  // Note that block indicators are added by modifying the basic setup.
  // Because we want to display the block indicators in the gutter.
  // blockIndicator,
];

// Only enable debug decoration in the test environment.
if (process.env.NODE_ENV === "test") {
  blockExtensions.push(debugDecoration);
}
