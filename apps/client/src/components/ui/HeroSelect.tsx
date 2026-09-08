import { ChevronDown } from "lucide-react";

export interface HeroSelectOption {
  value: string;
  label: string;
}

interface HeroSelectProps {
  id: string;
  label: string;
  value: string;
  options: HeroSelectOption[];
  onChange: (value: string) => void;
}

export function HeroSelect({
  id,
  label,
  value,
  options,
  onChange,
}: HeroSelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full appearance-none bg-transparent pr-7 text-left text-[0.95rem] font-medium text-white outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#12161d] text-white">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70"
      />
    </div>
  );
}
