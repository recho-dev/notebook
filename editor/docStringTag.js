import {syntaxTree} from "@codemirror/language";
import {Decoration, ViewPlugin} from "@codemirror/view";

const docTagDeco = Decoration.mark({class: "cm-doc-tag"});

export const docStringTag = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = this.buildDeco(view);
    }

    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDeco(update.view);
      }
    }

    buildDeco(view) {
      let widgets = [];
      let tree = syntaxTree(view.state);

      // Get the visible viewport range
      const viewport = view.viewport;
      const viewportFrom = viewport.from;
      const viewportTo = viewport.to;

      tree.iterate({
        enter: ({type, from, to}) => {
          if (type.name === "BlockComment") {
            // Only process block comments that intersect with the viewport
            if (to >= viewportFrom && from <= viewportTo) {
              const text = view.state.doc.sliceString(from, to);
              let regex = /(@[a-zA-Z_]+)/g;
              let m;
              while ((m = regex.exec(text))) {
                const tagStart = from + m.index;
                const tagEnd = tagStart + m[0].length;

                // Only add decoration if the tag is within or intersects the viewport
                if (tagEnd >= viewportFrom && tagStart <= viewportTo) {
                  widgets.push(docTagDeco.range(tagStart, tagEnd));
                }
              }
            }
          }
        },
      });

      return Decoration.set(widgets, true);
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);
