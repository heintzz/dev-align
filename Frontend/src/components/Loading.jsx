// components/Loading.tsx

import { Sun } from "lucide-react"; // optional: nice spinner icon

export default function Loading({
  status,
  text = "Loading...",
  fullscreen = false,
}) {
  if (!status) return null; // if false, don't render anything

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullscreen ? "fixed inset-0 bg-black/40 z-50" : ""
      }`}
    >
      <Sun className="animate-spin h-10 w-10 text-primer z-50" />
      <p className="mt-2 text-white">{text}</p>
    </div>
  );
}
