"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


// HOC version
const ProtectedRoute = (WrappedComponent) => {
  return function ProtectedComponentWrapper(props) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem("zentoken");
      if (!token) {
        router.replace("/login");
      } else {
        setAuthorized(true);
      }
    }, []);

    if (!authorized) return null;

    return <WrappedComponent {...props} />;
  };
};

export default ProtectedRoute;
