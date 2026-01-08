"use client";

import dynamic from "next/dynamic";

const EditorPage = dynamic(() => import("./EditorPage.jsx").then((mod) => ({default: mod.EditorPage})), {
  loading: () => <LoadingIndicator />,
  // As we are reading the notebooks from the localStorage, we don't need to
  // render this page on the server side.
  ssr: false,
});

function LoadingIndicator() {
  return (
    <div className="animate-pulse">
      {/* Hero section skeleton */}
      <div className="flex h-[72px] bg-gray-100 p-2 w-full border-b border-gray-200">
        <div className="hidden md:flex items-center justify-between gap-2 h-full max-w-screen-lg lg:mx-auto mx-4 w-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-4 w-24 bg-gray-300 rounded" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          ))}
          <div className="h-4 w-32 bg-gray-300 rounded" />
        </div>
        <div className="flex md:hidden items-center justify-center h-full max-w-screen-lg lg:mx-auto mx-4 w-full">
          <div className="h-10 w-full bg-gray-200 rounded-md" />
        </div>
      </div>

      {/* Editor container skeleton */}
      <div className="max-w-screen-lg lg:mx-auto mx-4 lg:my-10 my-4">
        {/* Toolbar skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-5 w-16 bg-gray-100 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 bg-gray-200 rounded-md" />
          </div>
        </div>

        {/* Editor area skeleton */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Code editor header */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
          {/* Code lines skeleton */}
          <div className="p-4 space-y-2 min-h-[400px] bg-white">
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-4 w-1/2 bg-gray-100 rounded" />
            <div className="h-4 w-5/6 bg-gray-100 rounded" />
            <div className="h-4 w-2/3 bg-gray-100 rounded" />
            <div className="h-4 w-1/3 bg-gray-100 rounded" />
            <div className="h-4 w-3/5 bg-gray-100 rounded" />
            <div className="h-4 w-1/2 bg-gray-100 rounded" />
            <div className="h-4 w-4/5 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Output area skeleton */}
        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="p-4 min-h-[200px] bg-white">
            <div className="h-4 w-1/4 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <EditorPage />;
}
