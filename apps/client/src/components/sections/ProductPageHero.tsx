import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductPageHeroProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function ProductPageHero({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  footer,
  className,
}: ProductPageHeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-10 md:px-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-stone-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div
          className={cn(
            "rounded-[2rem] border border-gray-200 bg-white/90 px-8 py-12 shadow-xl shadow-black/5 md:px-12 md:py-16",
            className,
          )}
        >
          <div className="inline-flex items-center gap-3 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-gray-600">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white shadow-lg shadow-black/10">
              <Icon className="h-4 w-4" />
            </span>
            <span>{eyebrow}</span>
          </div>

          <h1 className="mt-6 max-w-5xl text-5xl font-bold font-heading leading-tight tracking-tight md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-600">
            {description}
          </p>

          {actions ? (
            <div className="mt-8 flex flex-wrap gap-4">
              {actions}
            </div>
          ) : null}

          {footer ? <div className="mt-10">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}
