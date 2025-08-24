import "./global.css";
import {Nav} from "./Nav.jsx";

export const metadata = {
  title: "Observable Script",
  description: "Observable Script",
};

export default function Layout({children}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
