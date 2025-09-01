import {EditorView, Decoration, ViewUpdate, ViewPlugin, DecorationSet, WidgetType} from "@codemirror/view";
import {Transaction} from "@codemirror/state";
import {syntaxTree} from "@codemirror/language";

const WIDGET_CLASS_NAME = "cm-number-slider";
const INTEGER_PATTERN = /^-?\d+$/;

class SliderWidget extends WidgetType {
  /**
   * The current value of the slider.
   * @type {number}
   */
  #value;
  /**
   * The minimum value of the slider.
   * @type {number}
   */
  #min;
  /**
   * The maximum value of the slider.
   * @type {number}
   */
  #max;

  /**
   * Creates a new slider widget.
   * @param {number} value The initial value of the slider.
   * @param {number} min The minimum value of the slider.
   * @param {number} max The maximum value of the slider.
   */
  constructor(value, min, max) {
    super();
    this.#value = value;
    this.#min = min;
    this.#max = max;
  }

  eq(other) {
    return (
      other instanceof SliderWidget && other.#value == this.#value && other.#min == this.#min && other.#max == this.#max
    );
  }

  toDOM() {
    let wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    wrap.className = WIDGET_CLASS_NAME;
    const input = wrap.appendChild(document.createElement("input"));
    input.type = "range";
    input.name = "slider";
    input.min = this.#min;
    input.max = this.#max;
    input.value = this.#value.toString();
    input.addEventListener("change", () => {
      console.log("Slider value changed:", input.value);
    });
    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

class SliderPlugin {
  #decorations;

  /**
   *
   * @param {EditorView} view
   */
  constructor(view) {
    this.#decorations = SliderPlugin.createSliderWidgets(view);
  }

  /**
   * Update the slider widgets based on the view update.
   * @param {ViewUpdate} update
   */
  update(update) {
    if (update.docChanged || update.viewportChanged || syntaxTree(update.startState) != syntaxTree(update.state))
      this.#decorations = SliderPlugin.createSliderWidgets(update.view);
  }

  get decorations() {
    return this.#decorations;
  }

  /**
   *
   * @param {EditorView} view
   * @returns
   */
  static createSliderWidgets(view) {
    const widgets = [];
    for (const {from, to} of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from,
        to,
        enter: (node) => {
          if (node.name == "Number" && node.matchContext(["ArgList"])) {
            // console.group("Found a Number");
            // let currentNode = node.node;
            // while (currentNode) {
            //   console.log(`Node ${currentNode.name} spans from ${currentNode.from} to ${currentNode.to}`);
            //   currentNode = currentNode.parent;
            // }
            // console.groupEnd();
            const literal = view.state.doc.sliceString(node.from, node.to);
            console.log(`Literal value: ${literal}`);
            if (INTEGER_PATTERN.test(literal)) {
              let deco = Decoration.widget({
                widget: new SliderWidget(parseInt(literal, 10), 0, 100),
                side: -1,
              });
              widgets.push(deco.range(node.from));
            }
          }
        },
      });
    }
    console.log(`Created ${widgets.length} slider widgets`);
    return Decoration.set(widgets);
  }
}

/**
 * Create a slider extension for the editor.
 * @param {*} runtimeRef
 * @returns {ViewPlugin<SliderPlugin, undefined>}
 */
export function slider(runtimeRef) {
  const integerPattern = /\d+/g;
  /**
   * Slider the boolean value at the given position in the editor.
   * @param {EditorView} view The editor view.
   * @param {number} pos The starting position of the slider.
   * @param {boolean} newValue The new value to set.
   * @param {boolean} run Whether to run the runtime after updating the value.
   * @returns {boolean} If the slider was successfully updated.
   */
  function updateSliderValue(view, pos, newValue, run) {
    const line = view.state.doc.lineAt(pos);
    integerPattern.lastIndex = pos - line.from;
    const match = integerPattern.exec(line.text);
    if (match === null) return false;
    console.log(`updateSliderValue`, match);
    const source = view.state.doc.sliceString(pos, pos + match[0].length);
    const target = newValue.toString();
    if (source === target) {
      return false;
    } else {
      view.dispatch({
        changes: {from: pos, to: pos + target.length, insert: target},
        annotations: [Transaction.remote.of("control.slider")],
      });
      if (run) runtimeRef.current.run(); // Wait, is `dispatch` synchronous?
      return true;
    }
  }

  let isMouseDown = false;

  return ViewPlugin.fromClass(SliderPlugin, {
    decorations: (v) => v.decorations,
    eventHandlers: {
      // mousedown: () => {
      //   isMouseDown = true;
      // },
      // mousemove: ({target}, view) => {
      //   if (!isMouseDown || target.nodeName != "INPUT" || !target.parentElement.classList.contains(WIDGET_CLASS_NAME))
      //     return;
      //   return updateSliderValue(view, view.posAtDOM(target), false);
      // },
      mouseup() {
        console.log("mouseup");
      },
      change({target}, view) {
        console.log("change");
        if (target instanceof HTMLInputElement && target.parentElement.classList.contains(WIDGET_CLASS_NAME)) {
          console.log(`Try to update the slider's value.`);
          return updateSliderValue(view, view.posAtDOM(target), target.value, true);
        }
      },
    },
  });
}
