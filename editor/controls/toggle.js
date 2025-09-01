import {EditorView, Decoration, ViewUpdate, ViewPlugin, DecorationSet, WidgetType} from "@codemirror/view";
import {Transaction} from "@codemirror/state";
import {syntaxTree} from "@codemirror/language";

const WIDGET_CLASS_NAME = "cm-boolean-toggle";

class ToggleWidget extends WidgetType {
  #checked;

  /**
   *
   * @param {boolean} checked
   */
  constructor(checked) {
    super();
    this.#checked = checked;
  }

  eq(other) {
    return other instanceof ToggleWidget && other.#checked == this.#checked;
  }

  toDOM() {
    let wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    wrap.className = WIDGET_CLASS_NAME;
    let box = wrap.appendChild(document.createElement("input"));
    box.type = "checkbox";
    box.name = "toggle";
    box.checked = this.#checked;
    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

class TogglePlugin {
  #decorations;

  /**
   *
   * @param {EditorView} view
   */
  constructor(view) {
    this.#decorations = TogglePlugin.createToggleWidgets(view);
  }

  /**
   * Update the toggle widgets based on the view update.
   * @param {ViewUpdate} update
   */
  update(update) {
    if (update.docChanged || update.viewportChanged || syntaxTree(update.startState) != syntaxTree(update.state))
      this.#decorations = TogglePlugin.createToggleWidgets(update.view);
  }

  get decorations() {
    return this.#decorations;
  }

  /**
   *
   * @param {EditorView} view
   * @returns
   */
  static createToggleWidgets(view) {
    let widgets = [];
    for (let {from, to} of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from,
        to,
        enter: (node) => {
          if (
            node.name == "BooleanLiteral" &&
            node.matchContext(["CallExpression", "ArgList"]) &&
            node.node.prevSibling.name === "(" &&
            node.node.nextSibling.name === ")" &&
            node.node.parent.firstChild.name === "MemberExpression" &&
            node.node.parent.firstChild.firstChild.name === "Identifier"
            // node.node.parent.firstChild.lastChild.name === "Identifier"
          ) {
            console.log("parent's parent", node.node.parent.parent);
            console.group("Found a BooleanLiteral");
            let currentNode = node.node;
            while (currentNode) {
              console.log(currentNode.name);
              currentNode = currentNode.parent;
            }
            console.groupEnd();
            let isTrue = view.state.doc.sliceString(node.from, node.to) == "true";
            let deco = Decoration.widget({
              widget: new ToggleWidget(isTrue),
              side: -1,
            });
            widgets.push(deco.range(node.from));
          }
        },
      });
    }
    return Decoration.set(widgets);
  }
}

/**
 * Create a toggle extension for the editor.
 * @param {*} runtimeRef
 * @returns {ViewPlugin<TogglePlugin, undefined>}
 */
export function toggle(runtimeRef) {
  /**
   * Toggle the boolean value at the given position in the editor.
   * @param {EditorView} view
   * @param {number} pos
   * @returns {boolean} if the toggle was successful
   */
  function toggleBoolean(view, pos) {
    let textAfter = view.state.doc.sliceString(pos, pos + 5);
    let change;
    if (textAfter == "false") change = {from: pos, to: pos + 5, insert: "true"};
    else if (textAfter.startsWith("true")) change = {from: pos, to: pos + 4, insert: "false"};
    else return false;
    view.dispatch({changes: change, annotations: [Transaction.remote.of("control.toggle")]});
    setTimeout(() => {
      runtimeRef.current.run();
    }, 0);
    return true;
  }

  return ViewPlugin.fromClass(TogglePlugin, {
    decorations: (v) => v.decorations,
    eventHandlers: {
      mousedown: ({target}, view) => {
        if (target.nodeName == "INPUT" && target.parentElement.classList.contains(WIDGET_CLASS_NAME)) {
          return toggleBoolean(view, view.posAtDOM(target));
        }
      },
    },
  });
}
