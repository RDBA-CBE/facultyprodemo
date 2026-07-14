import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Utility for merging classNames
import { Loader2 } from "lucide-react"; // Loader icon for loading state

// interface PrimaryButtonProps {
//   name: string;
//   onClick?: () => void;
//   loading?: boolean;
//   disabled?: boolean;
//   color?: string; // Accepts Tailwind color classes
//   className?: string;
//   variant?:any
// }

const PrimaryButton = ({
  name,
  onClick,
  loading = false,
  disabled = false,
  color = "sm:w-auto lg:w-[100px]",
  className = "",
  variant
}) => {
  return (
    <Button
    variant={variant}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "px-4 py-2 rounded-md transition-all duration-300 flex items-center justify-center gap-2",
        color,
        className,
        (disabled || loading) && "opacity-50 cursor-not-allowed"
      )}
    >
      {loading && <Loader2 className="animate-spin h-5 w-5" />}
      {name}
    </Button>
  );
};

export default PrimaryButton;
