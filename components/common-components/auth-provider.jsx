"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Import useRouter
import { AppSidebar } from "@/components/common-sidebar/side-menu";
// import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/common-components/navbar";

export default function ClientAuth({ children }) {
  const router = useRouter(); // ✅ Initialize router
  const [hasToken, setHasToken] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // ✅ Prevent hydration errors

  useEffect(() => {
    setIsMounted(true); // ✅ Ensure component mounts on the client

    const checkToken = () => {
      const token = localStorage.getItem("zentoken");
      setHasToken(!!token);
      
      if (!token) {
        router.push("/login"); // ✅ Redirect to login if no token
      }
    };

    checkToken();
    window.addEventListener("storage", checkToken);

    return () => {
      window.removeEventListener("storage", checkToken);
    };
  }, [router]);

  if (!isMounted) return null; // ✅ Prevent hydration mismatch

  return hasToken ? (
    // <SidebarProvider>
      // <AppSidebar />
      <div className="flex flex-col w-full">
        <Navbar />
        <main className="w-full p-4">{children}</main>
      </div>
    // </SidebarProvider>
  ) : null; // Don't render anything while redirecting
}
