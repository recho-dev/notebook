import "./global.css";

export const metadata = {
  title: "Observable Script",
  description: "Observable Script",
};

export default function Layout({children}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
