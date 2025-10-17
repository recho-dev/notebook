import {EditorView, basicSetup} from "codemirror";
import {EditorState, Transaction} from "@codemirror/state";
import {keymap} from "@codemirror/view";
import {javascript, javascriptLanguage, esLint} from "@codemirror/lang-javascript";
import {linter} from "@codemirror/lint";
import {githubLightInit} from "@uiw/codemirror-theme-github";
import {tags as t} from "@lezer/highlight";
import {indentWithTab} from "@codemirror/commands";
import {browser} from "globals";
import * as eslint from "eslint-linter-browserify";
import {createRuntime} from "../runtime/index.js";
import {outputDecoration} from "./decoration.js";
import {outputLines} from "./outputLines.js";
// import {outputProtection} from "./protection.js";
import {dispatch as d3Dispatch} from "d3-dispatch";
import {controls} from "./controls/index.js";
import {rechoCompletion} from "./completion.js";
import {docStringTag} from "./docStringTag.js";
import {commentLink} from "./commentLink.js";

// @see https://github.com/UziTech/eslint-linter-browserify/blob/master/example/script.js
// @see https://codemirror.net/examples/lint/
const eslintConfig = {
  languageOptions: {
    globals: {
      ...browser,
    },
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },
};

export function createEditor(container, options) {
  const {code, onError} = options;
  const dispatcher = d3Dispatch("userInput");
  const runtimeRef = {current: null};

  const state = EditorState.create({
    doc: code,
    extensions: [
      basicSetup,
      javascript(),
      githubLightInit({
        styles: [
          {tag: [t.variableName], color: "#1f2328"},
          {tag: [t.function(t.variableName)], color: "#6f42c1"},
        ],
      }),
      EditorView.lineWrapping,
      EditorView.theme({
        "&": {fontSize: "14px", fontFamily: "monospace"},
        ".cm-content": {whiteSpace: "pre"},
        ".cm-line": {wordWrap: "normal"},
      }),
      EditorView.updateListener.of(onChange),
      keymap.of([
        {
          key: "Mod-s",
          run: () => {
            runtimeRef.current?.setIsRunning(true);
            runtimeRef.current?.run();
          },
          preventDefault: true,
        },
        indentWithTab,
      ]),
      javascriptLanguage.data.of({autocomplete: rechoCompletion}),
      outputLines,
      outputDecoration,
      controls(runtimeRef),
      // Disable this for now, because it prevents copying/pasting the code.
      // outputProtection(),
      docStringTag,
      commentLink,
      linter(esLint(new eslint.Linter(), eslintConfig)),
    ],
  });

  const view = new EditorView({state, parent: container});

  let isStopByMetaKey = false;

  function initRuntime() {
    runtimeRef.current = createRuntime(view.state.doc.toString());
    runtimeRef.current.onChanges(dispatch);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
  }

  function dispatch(changes) {
    // Mark this transaction as from runtime so that it will not be filtered out.
    view.dispatch({changes, annotations: [Transaction.remote.of("runtime")]});
  }

  function onChange(update) {
    if (update.docChanged) {
      const code = update.state.doc.toString();
      runtimeRef.current?.setCode(code);
      const userEdit = update.transactions.some((tr) => tr.annotation(Transaction.userEvent));
      // Stop updating the outputs when user edit the code.
      // Prevent triggering `run` by generators, which will parse the code immediately.
      // This may lead to syntax error if inputting code is not finished.
      if (userEdit) {
        runtimeRef.current?.setIsRunning(false);
        dispatcher.call("userInput", null, code);
      }
    }
  }

  // 1. Stop running when press cmd key. This is useful when we want to open a link
  // in the comment by cmd + click. If we don't stop running, the links consistently
  // create and destroy, and there is no way to click them. This also makes sense
  // when we want to copy/paste/select code using the shortcut with cmd key.
  //
  // 2. For cmd + s, we don't want to stop running.
  function onKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key !== "s") {
      if (runtimeRef.current?.isRunning()) isStopByMetaKey = true;
      runtimeRef.current?.setIsRunning(false);
    }
  }

  function onKeyUp(e) {
    const key = e.key;
    if ((key === "Meta" || key === "Control") && isStopByMetaKey) {
      isStopByMetaKey = false;
      runtimeRef.current?.setIsRunning(true);
    }
  }

  return {
    run: () => {
      try {
        if (!runtimeRef.current) initRuntime();
        runtimeRef.current.run();
      } catch (error) {
        console.error(error);
        onError?.(error);
      }
    },
    stop: () => {
      runtimeRef.current?.destroy();
      runtimeRef.current = null;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    },
    on: (event, callback) => dispatcher.on(event, callback),
    destroy: () => {
      runtimeRef.current?.destroy();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      view.destroy();
    },
  };
}
