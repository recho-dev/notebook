import {syntaxTree} from "@codemirror/language";
import {Decoration, ViewPlugin, EditorView} from "@codemirror/view";

const isWindows = navigator.userAgent.includes("Windows");

// Create a decoration that marks links but keeps text selectable.
function createLinkDecoration(url) {
  return Decoration.mark({
    class: "cm-comment-link",
    attributes: {
      "data-url": url,
      title: `Open in a new tab (${isWindows ? "Ctrl" : "Cmd"} + Click)`,
    },
  });
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
      let decorations = [];
      let tree = syntaxTree(view.state);

      // Only iterate tree nodes that intersect with the viewport.
      for (const {from, to} of view.visibleRanges) {
        tree.iterate({
          from,
          to,
          enter: ({type, from, to}) => {
            if (type.name === "BlockComment" || type.name === "LineComment") {
              const text = view.state.doc.sliceString(from, to);
              // Match URLs, allowing common URL characters, then trim trailing punctuation.
              let httpRegex = /https?:\/\/[^\s\)\]\}]+/g;
              let m;
              while ((m = httpRegex.exec(text))) {
                let url = m[0];
                // Trim trailing punctuation that shouldn't be part of URL.
                // These are common sentence/clause-ending punctuation.
                url = url.replace(/[.,;:!?)\]}>]+$/, "");
                if (!url || url.length < 11) continue; // Minimum valid URL length.
                const tagStart = from + m.index;
                const tagEnd = tagStart + url.length;
                if (tagEnd >= from && tagStart <= to) {
                  decorations.push(createLinkDecoration(url).range(tagStart, tagEnd));
                }
              }
            }
          },
        });
      }

      return Decoration.set(decorations, true);
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);

// Handle clicks and cursor updates on comment links.
export const commentLinkClickHandler = EditorView.domEventHandlers({
  mousedown(event) {
    const target = event.target.closest?.(".cm-comment-link");
    if (!target) return false;
    const url = target.getAttribute("data-url");
    if (!url) return false;
    if (event.metaKey || event.ctrlKey) {
      event.preventDefault();
      window.open(url, "_blank", "noopener,noreferrer");
      return true;
    }
    return false;
  },
  mousemove(event) {
    const element = event.target;
    const isCmdHeld = event.metaKey || event.ctrlKey;
    const target = element?.closest?.(".cm-comment-link");
    if (!target) return false;
    if (isCmdHeld) target.classList.add("cmd-clickable");
    else target.classList.remove("cmd-clickable");
    return false;
  },
});
