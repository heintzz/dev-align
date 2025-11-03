import { useState, useEffect } from "react";
import { X, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toastSubscribe } from "@/lib/toast";

// ✨ MAIN COMPONENT
export default function CustomToaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastSubscribe((newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration);
    });
    return unsubscribe;
  }, []);

  const groupedToasts = toasts.reduce((acc, t) => {
    if (!acc[t.position]) acc[t.position] = [];
    acc[t.position].push(t);
    return acc;
  }, {});

  const positionClass = (pos) => {
    const base = "fixed z-[9999] flex flex-col gap-3 p-4";
    switch (pos) {
      case "top-left":
        return `${base} top-4 left-4 items-start`;
      case "top-right":
        return `${base} top-4 right-4 items-end`;
      case "bottom-left":
        return `${base} bottom-4 left-4 items-start`;
      case "bottom-right":
        return `${base} bottom-4 right-4 items-end`;
      case "top-center":
        return `${base} top-4 left-1/2 -translate-x-1/2 items-center`;
      case "bottom-center":
        return `${base} bottom-4 left-1/2 -translate-x-1/2 items-center`;
      default:
        return `${base} top-4 right-4 items-end`;
    }
  };

  const getIcon = (t) => {
    if (t.icon) return t.icon;
    switch (t.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-white/90" />;
      case "error":
        return <XCircle className="w-5 h-5 text-white/90" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-black/80" />;
      default:
        return <Info className="w-5 h-5 text-white/90" />;
    }
  };

  const getBgColor = (t) => {
    switch (t.type) {
      case "success":
        return "bg-gradient-to-r from-green-500 to-emerald-600";
      case "error":
        return "bg-gradient-to-r from-red-500 to-rose-600";
      case "warning":
        return "bg-gradient-to-r from-yellow-400 to-amber-500 text-black";
      default:
        return "bg-gradient-to-r from-cyan-500 to-cyan-700";
    }
  };

  return (
    <>
      {Object.entries(groupedToasts).map(([position, items]) => (
        <div key={position} className={positionClass(position)}>
          <AnimatePresence>
            {items.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
                className={`flex items-center justify-between w-full max-w-sm p-4 rounded-xl shadow-xl ${getBgColor(
                  t
                )}`}
              >
                <div className="flex items-center gap-3">
                  {getIcon(t)}
                  <p className="text-sm font-medium">{t.message}</p>
                </div>
                <button
                  onClick={() =>
                    setToasts((prev) => prev.filter((x) => x.id !== t.id))
                  }
                  className="ml-3 text-white/70 hover:text-white"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
}
