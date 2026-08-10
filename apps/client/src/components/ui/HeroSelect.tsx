import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

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

/**
 * The native <select> popup is drawn by the OS and cannot be themed, so it
 * lands as a white list on the dark hero. Radix renders the list as real DOM,
 * keeping the keyboard behaviour and ARIA wiring of a native select while
 * letting the panel match the hero.
 */
export function HeroSelect({
  id,
  label,
  value,
  options,
  onChange,
}: HeroSelectProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={label}
        className="group flex w-full items-center justify-between gap-3 text-left text-[0.9rem] font-medium text-white outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        <SelectPrimitive.Value>{selected?.label}</SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 shrink-0 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={12}
          // Opaque rather than translucent-and-blurred: a backdrop-filter over
          // the sticky hero composites badly on mobile and washes the labels out.
          className="z-[60] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-white/15 bg-[#12161d] p-1.5 text-white shadow-2xl shadow-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer select-none items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm outline-none data-[highlighted]:bg-white/12 data-[state=checked]:bg-white/[0.08]"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check aria-hidden="true" className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
