"use client";

import { Toaster, toast } from "sonner";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from 'lucide-react';

// Toast styles
const toastStyles = {
  success: { background: "#22C55E", color: "#FFFFFF" },
  error: { background: "#DC2626", color: "#FFFFFF" },
  info: { background: "#fae8ff", color: "#000" , fontWeight:"400"},
};

// Dismiss and Show
// function dismissAndToast(message, style) {
//   toast.dismiss(); // Dismiss existing toasts
//   toast(message, {
//     duration: 5000,
//     style,
//     action: {
//       label: "x",
//       onClick: () => toast.dismiss(),
//     },
//   });
// }

// // Success
// export function Success(message) {
//   dismissAndToast(message, toastStyles.success);
// }

// function dismissAndToast(message, style,onClick) {
//   toast.dismiss(); // Dismiss existing toasts
//   toast(message, {
//     duration: 5000,
//     style,
//     action: {
//       label: "x",
//       onClick: () => onClick,
//     },
//   });
// }

function dismissAndToast(message, style, onClick) {
  toast.dismiss();

  toast(message, {
    duration: 5000,
    style: {
      ...style,
    },
    classNames: {
      title: "!text-white",
      description: "!text-white",
      actionButton: "!text-white",
    },
    action: {
      label: "x",
      onClick: onClick,
    },
  });
}

Success
export function Success(message,onClick) {
  dismissAndToast(message, toastStyles.success,onClick);
}

// export function InfinitySuccess(message,onClick) {
//   toast.dismiss()
//   toast(message, {
//     duration: Infinity,
//     style: toastStyles.success,
//       action: {
//             label: "x",
//             onClick: onClick,
//           },
//   });
// }

export function InfinitySuccess(message, onClick) {
  toast.dismiss();

  toast(message, {
    duration: Infinity,
    style: toastStyles.success,
    classNames: {
      title: "!text-white",
      description: "!text-white",
      actionButton: "!text-white",
    },
    action: {
      label: "x",
      onClick: () => {
        toast.dismiss();
        if (onClick) onClick();
      },
    },
  });
}

// Failure
export function Failure(message) {
  dismissAndToast(message, toastStyles.error);
}

// Info
// export function Info(message) {
//   dismissAndToast(message, toastStyles.info);
// }


export function Info(message, onClick) {
  toast.dismiss();
  toast(message, {
    duration: 5000,
    style: toastStyles.info,
    action: {
      label: <X size={14} className="text-black hover:text-foreground" />,
      onClick: () => onClick,
      
    },
  });
}


// Toaster with route change handler
export function ToastContainer() {
  const pathname = usePathname();

  

  useEffect(() => {
    toast.dismiss(); // Clear toasts on route change
  }, [pathname]);

  return <Toaster position="top-right"  swipeDirections="right"/>;
}
