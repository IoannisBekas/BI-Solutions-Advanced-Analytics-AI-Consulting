import type { ReactNode } from "react";
import { withAssetBase } from "@/lib/site";
import { cn } from "@/lib/utils";

interface ResourcePageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  footer?: ReactNode;
  className?: string;
}

export function ResourcePageHero({
  eyebrow,
  title,
  description,
  footer,
  className,
}: ResourcePageHeroProps) {
  return (
    <section className={cn("resource-page-hero", className)}>
      <div className="resource-page-hero__media" aria-hidden="true">
        <img
          className="cinematic-hero__poster resource-page-hero__poster"
          src={withAssetBase("scroll-world-v4/posters/clip-01.webp")}
          srcSet={`${withAssetBase("scroll-world-v4/posters/clip-01-mobile.webp")} 600w, ${withAssetBase("scroll-world-v4/posters/clip-01-900.webp")} 900w, ${withAssetBase("scroll-world-v4/posters/clip-01.webp")} 1280w`}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="sync"
        />
        <div className="cinematic-hero__scrim" />
      </div>
      <div className="resource-page-hero__content">
        <p className="cinematic-hero__eyebrow">{eyebrow}</p>
        <h1 className="resource-page-hero__title">{title}</h1>
        <p className="resource-page-hero__description">{description}</p>
        {footer ? <div className="resource-page-hero__footer">{footer}</div> : null}
      </div>
    </section>
  );
}
