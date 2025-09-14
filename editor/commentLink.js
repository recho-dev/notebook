import {syntaxTree} from "@codemirror/language";
import {Decoration, ViewPlugin, WidgetType} from "@codemirror/view";

class LinkWidget extends WidgetType {
  constructor(url) {
    super();
    this.url = url;
  }

  toDOM() {
    const link = document.createElement("a");
    link.href = this.url;
    link.textContent = this.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "cm-comment-link";
    link.title = "Open in a new tab (Cmd + Click)";

    // Prevent default click behavior - only open on Cmd+Click
    link.addEventListener("click", (e) => !e.metaKey && !e.ctrlKey && e.preventDefault());

    // Change cursor to pointer when Ctrl/Cmd is held
    this.handleKeyDown = (e) => (e.metaKey || e.ctrlKey) && link.classList.add("cmd-clickable");
    this.handleKeyUp = (e) => !e.metaKey && !e.ctrlKey && link.classList.remove("cmd-clickable");
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);

    return link;
  }

  destroy() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }

  ignoreEvent() {
    return false;
  }
}

export const commentLink = ViewPlugin.fromClass(
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
            if (type.name === "BlockComment" || type.name === "LineComment") {
              const text = view.state.doc.sliceString(from, to);
              let httpRegex = /https?:\/\/[^\s\)]+/g;
              let m;
              while ((m = httpRegex.exec(text))) {
                const tagStart = from + m.index;
                const tagEnd = tagStart + m[0].length;
                if (tagEnd >= from && tagStart <= to) {
                  const url = m[0];
                  const widget = new LinkWidget(url);
                  widgets.push(
                    Decoration.replace({
                      widget,
                      inclusive: true,
                    }).range(tagStart, tagEnd),
                  );
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
