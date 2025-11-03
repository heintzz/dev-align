// Global singleton state (persists across hot reloads)
if (!window.__TOAST_GLOBALS__) {
  window.__TOAST_GLOBALS__ = {
    listeners: [],
    id: 0,
  };
}

const getGlobals = () => window.__TOAST_GLOBALS__;

// 🚀 Export the global toast function
export const toast = (message, options = {}) => {
  const globals = getGlobals();
  const toastData = {
    id: ++globals.id,
    message,
    type: options.type || "info",
    icon: options.icon || null,
    position: options.position || "top-right",
    duration: options.duration || 3000,
  };
  globals.listeners.forEach((cb) => cb(toastData));
};

// helper (used by the component internally)
export const toastSubscribe = (callback) => {
  const globals = getGlobals();
  globals.listeners.push(callback);
  return () => {
    globals.listeners = globals.listeners.filter((fn) => fn !== callback);
  };
};
