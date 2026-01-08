"use client";

import dynamic from "next/dynamic";

const WorksPage = dynamic(() => import("./WorksPage.jsx").then((mod) => ({default: mod.WorksPage})), {
  loading: () => <LoadingIndicator />,
  // As we are reading the notebooks from the localStorage, we don't need to
  // render this page on the server side.
  ssr: false,
});

function LoadingIndicator() {
  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="w-8 h-8 border-3 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}

export default function Page() {
  return <WorksPage />;
}
