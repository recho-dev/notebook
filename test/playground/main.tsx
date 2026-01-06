import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {Provider as JotaiProvider} from "jotai";
import {App} from "./components/App.tsx";
import "./styles.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <JotaiProvider>
      <App />
    </JotaiProvider>
  </StrictMode>,
);
