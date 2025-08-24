import * as jsTests from "./js/index.js";
import {createEditor} from "../src/editor.js";

// Select
const select = createSelect(() => {
  const {value} = select;
  history.pushState({value}, "", `?name=${value}`);
  render();
});
const options = Object.keys(jsTests).map(createOption);
select.append(...options);
document.body.append(select);

const container = document.createElement("div");
container.id = "container";
document.body.append(container);

// Init app name.
const initialValue = new URL(location).searchParams.get("name");
if (jsTests[initialValue]) select.value = initialValue;

let preEditor = null;
render();

async function render() {
  container.innerHTML = "";
  if (preEditor) preEditor.destroy();
  const editorContainer = document.createElement("div");
  const code = jsTests[select.value];
  const editor = createEditor(editorContainer, {code});
  const button = document.createElement("button");
  button.textContent = "Run";
  button.onclick = () => editor.run();
  button.style.marginBottom = "10px";
  container.appendChild(button);
  container.appendChild(editorContainer);
}

function createSelect(onchange) {
  const select = document.createElement("select");
  select.style.height = "20px";
  select.style.marginBottom = "10px";
  select.onchange = onchange;
  document.onkeydown = (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
      return;
    }
    switch (event.key) {
      case "ArrowLeft": {
        if (select.selectedIndex > 0) {
          select.selectedIndex--;
          select.onchange();
        } else alert("This is the first test case.");
        break;
      }
      case "ArrowRight": {
        if (select.selectedIndex < select.options.length - 1) {
          select.selectedIndex++;
          select.onchange();
        } else alert("This is the last test case.");
        break;
      }
    }
  };

  return select;
}

function createOption(key) {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = key;
  return option;
}
