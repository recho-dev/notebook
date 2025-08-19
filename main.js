import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { oneDark } from "@codemirror/theme-one-dark"

function main() {
  // Sample JavaScript code to display in the editor
  const sampleCode = `// Welcome to your code editor!
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Example usage
console.log(greet("World"));

// You can edit this code directly in the editor
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);`;

  // Create the editor state
  const state = EditorState.create({
    doc: sampleCode,
    extensions: [
      basicSetup,
      javascript(),
      oneDark,
      EditorView.lineWrapping,
      EditorView.theme({
        "&": {
          fontSize: "14px",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', monospace"
        }
      })
    ]
  });

  // Create and mount the editor
  const view = new EditorView({
    state,
    parent: document.getElementById("code-editor")
  });

  console.log("CodeMirror editor initialized successfully!");
}

main();
