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

      tree.iterate({
        enter: ({type, from, to}) => {
          if (type.name === "BlockComment") {
            const text = view.state.doc.sliceString(from, to);
            let regex = /(@[a-zA-Z_]+)/g;
            let m;
            while ((m = regex.exec(text))) {
              widgets.push(docTagDeco.range(from + m.index, from + m.index + m[0].length));
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
