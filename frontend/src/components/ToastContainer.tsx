"use client";

import { useToast } from "./ToastContext";

const icons: Record<string, string> = {
  success: "✅",
  error: "🚨",
  warning: "⚠️",
  info: "ℹ️",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`
            flex items-center gap-4 px-6 py-5 rounded-lg shadow-xl backdrop-blur-md
            min-w-[300px] cursor-pointer
            border-l-4
            ${toast.type === "success" ? "bg-slate-800/90 border-l-green-500" : ""}
            ${toast.type === "error" ? "bg-slate-800/90 border-l-red-500" : ""}
            ${toast.type === "info" ? "bg-slate-800/90 border-l-blue-500" : ""}
            ${toast.type === "warning" ? "bg-slate-800/90 border-l-amber-500" : ""}
            toast
          `}
        >
          <span className="text-xl">{icons[toast.type]}</span>
          <span className="text-sm font-medium text-slate-100">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
