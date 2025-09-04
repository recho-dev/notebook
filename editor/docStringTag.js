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

      for (const {from, to} of view.visibleRanges) {
        tree.iterate({
          // Only iterate tree nodes that intersect with the viewport.
          from,
          to,
          enter: ({type, from, to}) => {
            if (type.name === "BlockComment") {
              const text = view.state.doc.sliceString(from, to);
              let regex = /(@[a-zA-Z_]+)/g;
              let m;
              while ((m = regex.exec(text))) {
                const tagStart = from + m.index;
                const tagEnd = tagStart + m[0].length;
                // Only add decoration if the tag is within or intersects the viewport
                if (tagEnd >= from && tagStart <= to) {
                  widgets.push(docTagDeco.range(tagStart, tagEnd));
                }
              }
            }
          },
        });
      }

      return Decoration.set(widgets, true);
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);
