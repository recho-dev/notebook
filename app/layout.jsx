import "./global.css";
import {Nav} from "./Nav.jsx";
import {cn} from "./cn.js";
import {NotebookAnalytics} from "./NotebookAnalytics.jsx";

export const metadata = {
  title: "Recho Notebook",
  description: "Recho Notebook - A interactive editor for algorithms and ASCII art",
};

export default function Layout({children}) {
  return (
    <html lang="en">
      <body className={cn("text-sm")}>
        <Nav />
        <main>{children}</main>
        <NotebookAnalytics />
      </body>
    </html>
  );
}
