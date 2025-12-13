import {type Text} from "@codemirror/state";
import {OUTPUT_MARK, ERROR_MARK} from "../../runtime/constant.js";
import {syntaxTree} from "@codemirror/language";
import {BlockMetadata, type Range} from "../../editor/blocks/BlockMetadata.ts";

const OUTPUT_MARK_CODE_POINT = OUTPUT_MARK.codePointAt(0);
const ERROR_MARK_CODE_POINT = ERROR_MARK.codePointAt(0);

// Since CodeMirror does not export `SyntaxNode`, we have to get it in this way.
type Tree = ReturnType<typeof syntaxTree>;
type SyntaxNode = Tree["topNode"];

function extendOutputForward(doc: Text, node: SyntaxNode): Range | null {
  let outputRange: Range | null = null;
  let currentNode = node.node.prevSibling;

  while (currentNode?.name === "LineComment") {
    const line = doc.lineAt(currentNode.from);
    if (line.from === currentNode.from && line.to === currentNode.to) {
      const codePoint = line.text.codePointAt(2);
      if (codePoint === OUTPUT_MARK_CODE_POINT || codePoint === ERROR_MARK_CODE_POINT) {
        outputRange = outputRange === null ? {from: line.from, to: line.to} : {from: line.from, to: outputRange.to};
      }
    }
    currentNode = currentNode.prevSibling;
  }

  return outputRange;
}

/**
 * Detect blocks in a given range by traversing the syntax tree.
 * Similar to how runtime/index.js uses acorn to parse blocks, but adapted for CodeMirror.
 */
export function detectBlocksWithinRange(tree: Tree, doc: Text, from: number, to: number): BlockMetadata[] {
  const blocks: BlockMetadata[] = [];

  // Collect all top-level statements and their preceding output/error comment lines
  const statementRanges: (Range & {name: string})[] = [];
  const outputRanges = new Map<number, Range>(); // Map statement position to output range

  tree.iterate({
    from,
    to,
    enter: (node) => {
      // Detect top-level statements (direct children of Script)
      if (node.node.parent?.name === "Script") {
        // Check if this is a statement (not a comment)
        if (
          node.name.includes("Statement") ||
          node.name.includes("Declaration") ||
          node.name === "ExportDeclaration" ||
          node.name === "ImportDeclaration" ||
          node.name === "Block"
        ) {
          statementRanges.push({from: node.from, to: node.to, name: node.name});

          const outputRange = extendOutputForward(doc, node.node);
          if (outputRange !== null) {
            outputRanges.set(node.from, outputRange);
          }
        }
        // Detect output/error comment lines (top-level line comments)
        else if (node.name === "LineComment") {
          // Get the line containing the comment.
          const line = doc.lineAt(node.from);

          // Check if the line comment covers the entire line
          if (line.from === node.from && line.to === node.to) {
            const codePoint = line.text.codePointAt(2);
            if (codePoint === OUTPUT_MARK_CODE_POINT || codePoint === ERROR_MARK_CODE_POINT) {
              // Find consecutive output/error lines
              let outputStart = line.from;
              let outputEnd = line.to;

              // Look backwards for more output/error lines
              let currentLineNum = line.number - 1;
              while (currentLineNum >= 1) {
                const prevLine = doc.line(currentLineNum);
                const prevCodePoint = prevLine.text.codePointAt(2);
                if (
                  prevLine.text.startsWith("//") &&
                  (prevCodePoint === OUTPUT_MARK_CODE_POINT || prevCodePoint === ERROR_MARK_CODE_POINT)
                ) {
                  outputStart = prevLine.from;
                  currentLineNum--;
                } else {
                  break;
                }
              }

              // Look forwards for more output/error lines
              currentLineNum = line.number + 1;
              const totalLines = doc.lines;
              while (currentLineNum <= totalLines) {
                const nextLine = doc.line(currentLineNum);
                const nextCodePoint = nextLine.text.codePointAt(2);
                if (
                  nextLine.text.startsWith("//") &&
                  (nextCodePoint === OUTPUT_MARK_CODE_POINT || nextCodePoint === ERROR_MARK_CODE_POINT)
                ) {
                  outputEnd = nextLine.to;
                  currentLineNum++;
                } else {
                  break;
                }
              }

              // Find the next statement after these output lines
              // The output belongs to the statement immediately following it
              let nextStatementLine = currentLineNum;
              if (nextStatementLine <= totalLines) {
                const nextStmtLine = doc.line(nextStatementLine);
                // Store this output range to be associated with the next statement
                outputRanges.set(nextStmtLine.from, {from: outputStart, to: outputEnd});
              }
            }
          }
        }
      }
    },
  });

  // Build block metadata from statements
  for (const range of statementRanges) {
    blocks.push(new BlockMetadata(range.name, outputRanges.get(range.from) ?? null, range));
  }

  return blocks;
}
