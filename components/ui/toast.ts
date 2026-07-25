"use client";

import { toast } from "sonner";

const useToast = () => {
  const showToast = (message: string, type: "success" | "error" | "info") => {
    switch (type) {
      case "success":
        toast.success(message)
        break;
      case "error":
        toast.error(message);
        break;
      default:
        toast(message);
        break;
    }
  };

  return { showToast };
};

export default useToast;
