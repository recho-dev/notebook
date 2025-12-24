import {Decoration, ViewPlugin, ViewUpdate, EditorView, type DecorationSet} from "@codemirror/view";
import {blockMetadataField} from "./state.ts";
import {BlockMetadata} from "./BlockMetadata.ts";
import {RangeSetBuilder} from "@codemirror/state";
import {supportedTypefaces, loadFont, createTypefaceDecoration, isFontLoaded} from "./fonts.ts";

const compactLineDecoration = Decoration.line({attributes: {class: "cm-output-line cm-compact-line"}});

export const compactDecoration = ViewPlugin.fromClass(
  class {
    #decorations: DecorationSet;
    #loadingFonts = new Set<string>();
    #view: EditorView | null = null;

    get decorations() {
      return this.#decorations;
    }

    /** @param {EditorView} view */
    constructor(view: EditorView) {
      this.#view = view;
      const blockMetadata = view.state.field(blockMetadataField);
      this.#decorations = this.createDecorations(blockMetadata, view.state);
    }

    /** @param {ViewUpdate} update */
    update(update: ViewUpdate) {
      const blockMetadata = update.state.field(blockMetadataField);
      // A possible optimization would be to only update the changed lines.
      this.#decorations = this.createDecorations(blockMetadata, update.state);
    }

    createDecorations(blockMetadata: BlockMetadata[], state: EditorView["state"]) {
      // Collect all decorations with their positions first
      type DecorationEntry = {from: number; decoration: Decoration};
      const decorations: DecorationEntry[] = [];
      
      // Add block attribute decorations
      for (const {output, attributes} of blockMetadata) {
        if (output === null) continue;
        // Apply decorations to each line in the block range
        const startLine = state.doc.lineAt(output.from);
        const endLine = state.doc.lineAt(output.to);
        const endLineNumber = endLine.from < output.to ? endLine.number + 1 : endLine.number;
        
        if (attributes.compact === true) {
          for (let lineNum = startLine.number; lineNum < endLineNumber; lineNum++) {
            const line = state.doc.line(lineNum);
            decorations.push({from: line.from, decoration: compactLineDecoration});
          }
        }
        
        if (typeof attributes.typeface === "string") {
          const typeface = attributes.typeface;
          // Load font if not already loaded or loading
          if (supportedTypefaces.has(typeface) && !isFontLoaded(typeface) && !this.#loadingFonts.has(typeface)) {
            this.#loadingFonts.add(typeface);
            loadFont(typeface).then(() => {
              this.#loadingFonts.delete(typeface);
              // Force update after font loads by dispatching an empty transaction
              if (this.#view) {
                this.#view.dispatch({});
              }
            }).catch(() => {
              this.#loadingFonts.delete(typeface);
            });
          }
          
          // Apply typeface decoration to each line
          const typefaceDeco = createTypefaceDecoration(typeface);
          for (let lineNum = startLine.number; lineNum < endLineNumber; lineNum++) {
            const line = state.doc.line(lineNum);
            decorations.push({from: line.from, decoration: typefaceDeco});
          }
        }
      }
      
      // Sort decorations by position to ensure RangeSetBuilder receives them in order
      decorations.sort((a, b) => a.from - b.from);
      
      // Add sorted decorations to builder
      const builder = new RangeSetBuilder<Decoration>();
      for (const {from, decoration} of decorations) {
        builder.add(from, from, decoration);
      }
      
      return builder.finish();
    }
  },
  {decorations: (v) => v.decorations},
);

