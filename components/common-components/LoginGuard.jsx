"use client";

import { useEffect, useState } from "react";

export default function LoginGuard({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      // Open login modal via header's event listener
      window.dispatchEvent(new CustomEvent("openLoginModal"));
    } else {
      setIsLoggedIn(true);
    }

    const handleLoginSuccess = () => setIsLoggedIn(true);
    window.addEventListener("loginSuccess", handleLoginSuccess);
    return () => window.removeEventListener("loginSuccess", handleLoginSuccess);
  }, []);

  // Loading state
  if (isLoggedIn === null) return null;

  // Not logged in - show blurred content with overlay
  if (!isLoggedIn) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm opacity-40">
          {children}
        </div>
        <div className="fixed inset-0 z-40 bg-black/20" />
      </div>
    );
  }

  return children;
}
