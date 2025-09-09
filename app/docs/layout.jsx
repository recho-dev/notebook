import {Sidebar} from "../Sidebar.js";
import {cn} from "../cn.js";
import {getAllJSDocs} from "../utils.js";

export const metadata = {
  title: "Docs | Recho",
  description: "Docs | Recho",
};

export default function Layout({children}) {
  const docs = getAllJSDocs();
  return (
    <div className={cn("flex", "h-[calc(100vh-65px)] overflow-auto")}>
      <Sidebar docs={docs} />
      <div className={cn("flex-1", "overflow-auto")}>{children}</div>
    </div>
  );
}
