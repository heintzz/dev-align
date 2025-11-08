// components/Loading.jsx

import { FolderKanban } from "lucide-react";

export default function Loading({
  status,
  text = "Loading...",
  fullscreen = false,
}) {
  if (!status) return null;

  return (
    <div
      className={`${
        fullscreen ? "fixed inset-0 z-9999" : "min-h-screen"
      } bg-black/40 p-4 md:p-6 lg:p-8`}
    >
      <div className="flex flex-col justify-center items-center h-full">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primer"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <FolderKanban className="w-6 h-6 text-primer" />
          </div>
        </div>
        <p className="mt-4 text-white font-medium">{text}</p>
      </div>
    </div>
  );
}
