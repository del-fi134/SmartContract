"use client";

import dynamic from "next/dynamic";
import { Dashboard } from "@/components/Dashboard";
import { WalletProvider } from "@/components/WalletContext";
import { ToastProvider } from "@/components/ToastContext";

const ToastContainer = dynamic(() => import("@/components/ToastContainer").then((mod) => mod.ToastContainer), {
  ssr: false,
});

function AppContent() {
  return (
    <>
      <Dashboard />
      <ToastContainer />
    </>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ToastProvider>
  );
}
