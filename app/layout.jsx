import "./global.css";
import {Nav} from "./Nav.jsx";
import {cn} from "./cn.js";
import {Analytics} from "@vercel/analytics/next";
import {LegacyDomainMigration} from "./LegacyDomainMigration.jsx";

export const metadata = {
  title: "Recho",
  description: "Recho - A interactive editor for algorithms and ASCII art",
};

export default function Layout({children}) {
  return (
    <html lang="en">
      <body className={cn("text-sm")}>
        <LegacyDomainMigration />
        <Nav />
        <main>{children}</main>
        <Analytics
          scriptSrc="/_vercel/insights/script.js"
          viewEndpoint="/_vercel/insights/view"
          eventEndpoint="/_vercel/insights/event"
        />
      </body>
    </html>
  );
}
