import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const TextInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", title, required, error, value, onChange, ...props }, ref) => {
    // Use a controlled approach by providing a default empty string
    const inputValue = value ?? '';
    
    return (
      <div className="w-full ">
        {title && (
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {title} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500", // Add error styling
            className,
          )}
          value={inputValue} // Always use controlled value
          onChange={onChange}
          ref={ref}
          {...props}
          required={required}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600" id={`${props.name}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export { TextInput };