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
    <section className="relative max-w-full overflow-hidden px-4 pb-10 sm:px-6 md:px-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden bi-hero-backdrop" />

      <div className="relative z-10 mx-auto w-full max-w-7xl min-w-0">
        <div
          className={cn(
            "w-full min-w-0 rounded-[2rem] border border-gray-200 bg-white/90 px-6 py-10 shadow-xl shadow-black/5 sm:px-8 sm:py-12 md:px-12 md:py-16",
            className,
          )}
        >
          <div className="inline-flex max-w-full items-center gap-3 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-gray-600">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white shadow-lg shadow-black/10">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 break-words">{eyebrow}</span>
          </div>

          <h1 className="mt-6 max-w-full break-words text-[2.55rem] font-bold font-heading leading-[1.05] tracking-tight sm:max-w-5xl sm:text-5xl sm:leading-tight md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-full break-words text-lg leading-relaxed text-gray-600 sm:max-w-3xl">
            {description}
          </p>

          {actions ? (
            <div className="mt-8 flex flex-wrap gap-4 [&>a]:min-w-0 [&>button]:min-w-0">
              {actions}
            </div>
          ) : null}

          {footer ? <div className="mt-10 min-w-0 max-w-full">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}
