import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  bg?: string;
  height?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = "text", title, required, bg,height, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";

    return (
      <div className="w-full space-y-2">
        {title && (
          <>
            <Label htmlFor={props.name}>{title}</Label>
            {required && <span className="text-red-500 ml-1">*</span>}
          </>
        )}

        <div className="relative">
          <input
            type={isPassword && showPassword ? "text" : type}
            className={cn(
              "flex w-full rounded-md border  px-3 pr-10 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              className,
              bg ?? "bg-transparent",
              height??"h-9",
              error
                ? "border-red-500 focus-visible:ring-red-500"
                : "border-input focus-visible:ring-ring"
            )}
            ref={ref}
            {...props}
          />

          {/* Password eye toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {error && typeof error === "string" && (
          <p className="mt-1 text-sm text-red-600" id={`${props.name}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
