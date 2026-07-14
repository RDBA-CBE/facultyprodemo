"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  description?: string;
  renderComponent: () => React.ReactNode;
  onSubmit?: () => void;
  width?: string;
  hideHeader?: boolean;
  closeIcon?:boolean;
  preventOutsideClose?: boolean;
}

export default function Modal({
  isOpen,
  setIsOpen,
  title,
  description,
  renderComponent,
  width,
  hideHeader = false,
  closeIcon=true,
  preventOutsideClose = false,
}: ModalProps) {
  const widthClasses: Record<string, string> = {
    "500px": "sm:max-w-[500px]",
    "700px": "sm:max-w-[700px]",
    "750px": "sm:max-w-[750px]",

    "900px": "sm:max-w-[900px]",
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        hideClose
        className={cn("p-0 bg-[#EFF2F6] !gap-0", width ? widthClasses[width] : "sm:max-w-[500px]")}
        onInteractOutside={(e) => {
          if (!preventOutsideClose) return;
          const target = e.target as HTMLElement | null;
          if (target?.closest(".react-joyride") || target?.closest("#react-joyride-portal")) return;
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (!preventOutsideClose) return;
          const target = e.target as HTMLElement | null;
          if (target?.closest(".react-joyride") || target?.closest("#react-joyride-portal")) return;
          e.preventDefault();
        }}
        onOpenAutoFocus={(e) => {
          if (preventOutsideClose) e.preventDefault();
        }}
        // Disable focus trap so reCAPTCHA iframe can receive pointer events
        {...(preventOutsideClose ? {
          onFocusOutside: (e: Event) => e.preventDefault(),
        } : {})}
      >
        {/* Custom header with title + close in one row */}
        {!hideHeader && (
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>

            <DialogClose asChild>
              <button className="rounded-md text-gray-700 hover:opacity-70 focus:outline-none">
                <X className="h-6 w-6" /> 
              </button>
            </DialogClose>
          </div>
        )}

        {hideHeader && (
          <>
            <DialogTitle className="sr-only">{title}</DialogTitle>
            {closeIcon && (
              <DialogClose asChild>
                <button className="absolute top-4 right-4 z-10 rounded-md text-gray-700 hover:opacity-70 focus:outline-none">
                  <X className="h-6 w-6" /> 
                </button>
              </DialogClose>
            )}
          </>
        )}

        {/* Body */}
        <div className={hideHeader ? "p-0" : "px-6"}>{renderComponent()}</div>
      </DialogContent>
    </Dialog>
  );
}
