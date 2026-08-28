import "./global.css";
import {Nav} from "./Nav.jsx";
import {cn} from "./cn.js";
import {Analytics} from "@vercel/analytics/next";

export const metadata = {
  title: "Recho Notebook",
  description: "Recho Notebook - A interactive editor for algorithms and ASCII art",
};

const insightsEndpoint =
  process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENDPOINT ||
  (process.env.VERCEL_ENV === "production" ? "https://recho-notebook.vercel.app/_vercel/insights" : undefined);

const analyticsProps = insightsEndpoint
  ? {
      endpoint: insightsEndpoint,
      scriptSrc: `${insightsEndpoint}/script.js`,
    }
  : {};

export default function Layout({children}) {
  return (
    <html lang="en">
      <body className={cn("text-sm")}>
        <Nav />
        <main>{children}</main>
        <Analytics {...analyticsProps} />
      </body>
    </html>
  );
}
