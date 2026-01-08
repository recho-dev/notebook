"use client";

import dynamic from "next/dynamic";

const WorksPage = dynamic(() => import("./WorksPage.jsx").then((mod) => ({default: mod.WorksPage})), {
  loading: () => <LoadingIndicator />,
  // As we are reading the notebooks from the localStorage, we don't need to
  // render this page on the server side.
  ssr: false,
});

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="w-4 h-4 bg-gray-200 rounded ml-2 shrink-0" />
      </div>
      <div className="w-full pt-[62.5%] relative border border-gray-200 rounded-md overflow-hidden bg-gray-100" />
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="max-w-screen-xl lg:mx-auto mx-4 my-4">
      <div className="grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-10">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return <WorksPage />;
}
