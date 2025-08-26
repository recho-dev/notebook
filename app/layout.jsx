import "./global.css";
import {Nav} from "./Nav.jsx";

export const metadata = {
  title: "Recho",
  description: "Recho",
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
