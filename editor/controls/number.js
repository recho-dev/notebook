import {EditorView, Decoration, ViewUpdate, ViewPlugin, WidgetType} from "@codemirror/view";
import {StateField, Transaction} from "@codemirror/state";
import {syntaxTree} from "@codemirror/language";

const WIDGET_CLASS_NAME = "cm-number-input";

export const numberInputsField = StateField.define({
  create(state) {
    return collectNumberInputs(state);
  },
  update(value, tr) {
    return tr.docChanged ? collectNumberInputs(tr.state) : value;
  },
});

function collectNumberInputs(state) {
  const ranges = [];
  syntaxTree(state).iterate({
    enter: (node) => {
      if (node.name === "CallExpression") {
        // Check if the callee is `recho.number`
        const memberExpression = node.node.firstChild;
        if (memberExpression.name !== "MemberExpression") return;

        const variableNameNode = memberExpression.firstChild;
        const propertyNameNode = memberExpression.lastChild;
        if (variableNameNode.name !== "VariableName") return;
        if (propertyNameNode.name !== "PropertyName") return;

        if (state.doc.sliceString(variableNameNode.from, variableNameNode.to) !== "recho") return;
        if (state.doc.sliceString(propertyNameNode.from, propertyNameNode.to) !== "number") return;

        // Find the ArgList
        const argList = node.node.getChild("ArgList");
        if (!argList) return;

        // Get the first argument (value)
        let firstArg = null;
        for (let child = argList.firstChild; child; child = child.nextSibling) {
          if (child.name === "Number") {
            firstArg = child;
            break;
          }
        }

        if (!firstArg) return;

        const value = parseInt(state.doc.sliceString(firstArg.from, firstArg.to), 10);

        // Parse second argument (options object)
        let min = -Infinity;
        let max = Infinity;
        let step = 1;

        // Find the options object (second argument)
        let secondArg = null;
        let argCount = 0;
        for (let child = argList.firstChild; child; child = child.nextSibling) {
          if (child.name === "Number" || child.name === "ObjectExpression") {
            argCount++;
            if (argCount === 2) {
              secondArg = child;
              break;
            }
          }
        }

        if (secondArg && secondArg.name === "ObjectExpression") {
          // Parse the options object
          for (let prop = secondArg.firstChild; prop; prop = prop.nextSibling) {
            if (prop.name === "Property") {
              const key = prop.firstChild;
              const value = prop.lastChild;

              if (key && value && value.name === "Number") {
                const keyText = state.doc.sliceString(key.from, key.to);
                const valueNum = parseInt(state.doc.sliceString(value.from, value.to), 10);

                if (keyText === "min" || keyText === '"min"' || keyText === "'min'") {
                  min = valueNum;
                } else if (keyText === "max" || keyText === '"max"' || keyText === "'max'") {
                  max = valueNum;
                } else if (keyText === "step" || keyText === '"step"' || keyText === "'step'") {
                  step = valueNum;
                }
              }
            }
          }
        }

        ranges.push({
          from: firstArg.from,
          to: firstArg.to,
          value,
          min,
          max,
          step,
        });
      }
    },
  });
  return ranges;
}

class NumberWidget extends WidgetType {
  #value;
  #direction;
  #min;
  #max;
  #step;

  /**
   * @param {number} value
   * @param {-1 | 1} direction
   * @param {number} min
   * @param {number} max
   * @param {number} step
   */
  constructor(value, direction, min = -Infinity, max = Infinity, step = 1) {
    super();
    this.#value = value;
    this.#direction = direction;
    this.#min = min;
    this.#max = max;
    this.#step = step;
  }

  eq(other) {
    return (
      other instanceof NumberWidget &&
      other.#value === this.#value &&
      other.#direction === this.#direction &&
      other.#min === this.#min &&
      other.#max === this.#max &&
      other.#step === this.#step
    );
  }

  toDOM() {
    let wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    wrap.className = WIDGET_CLASS_NAME;
    wrap.classList.add(this.#direction > 0 ? "cm-number-inc" : "cm-number-dec");

    const button = wrap.appendChild(document.createElement("button"));
    if (this.#direction > 0) {
      button.className = "cm-number-btn cm-number-inc";
      // button.innerHTML = "▲";
      button.setAttribute("data-action", "increment");
      // Disable increment button if at max value
      if (this.#value >= this.#max) {
        button.setAttribute("data-disabled", "true");
      }
    } else {
      button.className = "cm-number-btn cm-number-dec";
      // button.innerHTML = "▼";
      button.setAttribute("data-action", "decrement");
      // Disable decrement button if at min value
      if (this.#value <= this.#min) {
        button.setAttribute("data-disabled", "true");
      }
    }

    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

class NumberPlugin {
  #decorations;

  /**
   * @param {EditorView} view
   */
  constructor(view) {
    this.#decorations = NumberPlugin.createNumberWidgets(view);
  }

  /**
   * Update the number widgets based on the view update.
   * @param {ViewUpdate} update
   */
  update(update) {
    if (update.docChanged || update.viewportChanged || syntaxTree(update.startState) != syntaxTree(update.state))
      this.#decorations = NumberPlugin.createNumberWidgets(update.view);
  }

  get decorations() {
    return this.#decorations;
  }

  /**
   * @param {EditorView} view
   * @returns {import("@codemirror/view").DecorationSet}
   */
  static createNumberWidgets(view) {
    const numberInputs = view.state.field(numberInputsField);
    let widgets = [];

    for (let {from, to} of view.visibleRanges) {
      for (const input of numberInputs) {
        // Only add widgets for inputs in the visible range
        if (input.from >= from && input.to <= to) {
          // Add widget before the value (decrement)
          widgets.push(
            Decoration.widget({
              widget: new NumberWidget(input.value, -1, input.min, input.max, input.step),
              side: -1,
            }).range(input.from),
          );

          // Add widget after the value (increment)
          widgets.push(
            Decoration.widget({
              widget: new NumberWidget(input.value, 1, input.min, input.max, input.step),
              side: 1,
            }).range(input.to),
          );
        }
      }
    }
    return Decoration.set(widgets);
  }
}

/**
 * Create a number control extension for the editor.
 * @param {*} runtimeRef
 * @returns {ViewPlugin<NumberPlugin, undefined>}
 */
export function number(runtimeRef) {
  /**
   * Increment or decrement the number value at the given position.
   * @param {EditorView} view
   * @param {number} pos
   * @param {string} action - "increment" or "decrement"
   * @returns {boolean} if the operation was successful
   */
  function adjustNumber(view, pos, action) {
    // Get number inputs from state field
    const numberInputs = view.state.field(numberInputsField);

    // Find the number input that contains this position
    let targetInput = null;
    for (const input of numberInputs) {
      if (pos >= input.from && pos <= input.to) {
        targetInput = input;
        break;
      }
    }

    if (!targetInput) return false;

    const currentValue = targetInput.value;
    const step = targetInput.step;
    const min = targetInput.min;
    const max = targetInput.max;

    // Calculate new value respecting step, min, and max constraints
    let newValue;
    if (action === "increment") {
      newValue = currentValue + step;
      if (newValue > max) newValue = max;
    } else {
      newValue = currentValue - step;
      if (newValue < min) newValue = min;
    }

    // Only update if the value actually changed
    if (newValue === currentValue) return false;

    const change = {
      from: targetInput.from,
      to: targetInput.to,
      insert: newValue.toString(),
    };

    view.dispatch({
      changes: change,
      annotations: [Transaction.remote.of("control.number")],
    });

    runtimeRef.current.run();

    return true;
  }

  return [
    numberInputsField,
    ViewPlugin.fromClass(NumberPlugin, {
      decorations: (v) => v.decorations,
      eventHandlers: {
        mousedown: (event, view) => {
          const target = event.target;
          if (target.nodeName === "BUTTON" && target.parentElement.classList.contains(WIDGET_CLASS_NAME)) {
            const action = target.getAttribute("data-action");
            const pos = view.posAtDOM(target);
            event.preventDefault();
            event.stopPropagation(); // This prevents selecting the content.
            return adjustNumber(view, pos, action);
          }
        },
      },
    }),
  ];
}
