import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type TextareaProps = React.ComponentProps<"textarea"> & {
  bg?: string;
  error?: string | boolean;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, bg, error, title, required, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {title && (
          <>
            <Label htmlFor={props.name}>{title}</Label>
            {required && <span className="text-red-500 ml-1">*</span>}
          </>
        )}
        <textarea
          className={cn(
            "flex min-h-[60px] w-full rounded-md border border-input  px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
            bg ?? "bg-transparent",
            error
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-input focus-visible:ring-ring"
          )}
          ref={ref}
          {...props}
        />
        {error && typeof error === "string" && (
          <p className="mt-1 text-sm text-red-600" id={`${props.name}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
