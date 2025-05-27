"use client";

import Navbar from "@/components/shared/Navbar";
import { useAuth } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RingLoader } from "react-spinners"; // Or any other loader

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) { // Check for token instead of user directly for quicker redirect
      router.replace("/login");
    }
  }, [isLoading, token, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* You can use a ShadCN spinner or any other loader component here */}
        <RingLoader color="#36d7b7" size={60} />
        <p className="ml-4 text-lg">Loading application...</p>
      </div>
    );
  }

  if (!token) {
    // This check is mostly redundant due to useEffect but good for initial render blocking
    return null; // Or a minimal loading/redirecting message
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-slate-100 dark:bg-slate-800 text-center py-4 border-t">
        <p className="text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} Papikos. All rights reserved.
        </p>
      </footer>
    </div>
  );
}