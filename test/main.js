import * as jsTests from "./js/index.js";
import {createEditor} from "../editor/index.js";
import {createTransactionViewer} from "./transactionViewer.js";

// The main and side panels
const mainPanel = document.createElement("main");
mainPanel.id = "main-panel";
document.body.append(mainPanel);

const sidePanels = document.createElement("aside");
sidePanels.id = "side-panels";
document.body.append(sidePanels);

// Select
const select = createSelect(() => {
  const {value} = select;
  history.pushState({value}, "", `?name=${value}`);
  render();
});
const options = Object.keys(jsTests).map(createOption);
select.append(...options);
mainPanel.append(select);

const container = document.createElement("div");
container.id = "container";
mainPanel.append(container);

// Init app name.
const initialValue = new URL(location).searchParams.get("name");
if (jsTests[initialValue]) select.value = initialValue;

let preEditor = null;
let transactionViewer = null;
render();

async function render() {
  container.innerHTML = "";
  if (preEditor) preEditor.destroy();
  if (transactionViewer) transactionViewer.destroy();

  // Clear and reset side panels
  sidePanels.innerHTML = "";

  // Create transaction viewer
  transactionViewer = createTransactionViewer(sidePanels);

  const editorContainer = document.createElement("div");
  const code = jsTests[select.value];
  const editor = (preEditor = createEditor(editorContainer, {
    code,
    extensions: [transactionViewer.plugin],
  }));
  editor.run();
  preEditor = editor;

  const runButton = document.createElement("button");
  runButton.textContent = "Run";
  runButton.onclick = () => editor.run();
  runButton.style.marginBottom = "10px";
  container.appendChild(runButton);

  const stopButton = document.createElement("button");
  stopButton.textContent = "Stop";
  stopButton.onclick = () => editor.stop();
  container.appendChild(stopButton);

  container.appendChild(editorContainer);
}

function createSelect(onchange) {
  const select = document.createElement("select");
  select.style.height = "20px";
  select.style.marginBottom = "10px";
  select.onchange = onchange;
  return select;
}

function createOption(key) {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = key;
  return option;
}
