import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PublicPageHeroProps = {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  aside?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function PublicPageHero({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  footer,
  aside,
  className,
  titleClassName,
  descriptionClassName,
}: PublicPageHeroProps) {
  return (
    <section className="relative max-w-full overflow-hidden pb-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden bi-hero-backdrop" />

      <div className="site-container relative z-10 min-w-0">
        <div
          className={cn(
            "content-panel w-full",
            className,
          )}
        >
          <div
            className={cn(
              "grid min-w-0 gap-10",
              aside ? "lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start" : "",
            )}
          >
            <div className="min-w-0">
              {eyebrow ? (
                <div className="inline-flex max-w-full items-center gap-3 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-gray-600">
                  {Icon ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white shadow-lg shadow-black/10">
                      <Icon className="h-4 w-4" />
                    </span>
                  ) : null}
                  <span className="min-w-0 break-words">{eyebrow}</span>
                </div>
              ) : null}

              <h1
                className={cn(
                  "page-title mt-6 text-gray-950",
                  titleClassName,
                )}
              >
                {title}
              </h1>

              {description ? (
                <p
                  className={cn(
                    "body-lead reading-width mt-5 text-gray-600",
                    descriptionClassName,
                  )}
                >
                  {description}
                </p>
              ) : null}

              {actions ? <div className="mt-8 flex flex-wrap gap-4">{actions}</div> : null}
            </div>

            {aside ? <div className="min-w-0 lg:justify-self-end">{aside}</div> : null}
          </div>

          {footer ? <div className="mt-10 min-w-0 max-w-full">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}
