import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Checkboxs: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <CheckboxPrimitive.Root
        className=" flex h-5 w-5 items-center justify-center rounded 
    border border-gray-400 
    bg-white 
    data-[state=checked]:bg-black"
        checked={checked}
        onCheckedChange={(value) => onChange(!!value)} // Radix returns true | false | 'indeterminate'
      >
        <CheckboxPrimitive.Indicator>
          <CheckIcon className="h-4 w-4 text-white" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <label className="text-sm">{label}</label>
    </div>
  );
};

export default Checkboxs;
