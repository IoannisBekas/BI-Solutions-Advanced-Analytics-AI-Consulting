import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { withAssetBase } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  portfolioCopy as copy,
  projectImage,
  projectCategory,
  type PortfolioProject,
} from "@/data/portfolio";

export function ProjectCard({ project, compact = false }: { project: PortfolioProject; compact?: boolean }) {
  const { locale } = useLocale();
  return (
    <article className={cn("project-card surface-card surface-card--interactive group overflow-hidden", compact ? "project-card--compact" : "flex flex-col")}>
      <Link
        href={`/projects/${project.slug}`}
        className="project-card__preview block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black"
        aria-label={`${copy.details[locale]}: ${project.title}`}
      >
        <img
          src={withAssetBase(projectImage(project))}
          srcSet={`${withAssetBase(projectImage(project, "800"))} 800w, ${withAssetBase(projectImage(project))} 1440w`}
          sizes={compact ? "104px" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          width={1440}
          height={810}
          alt={`${project.title} — ${copy.alt[locale]}`}
          loading="lazy"
          decoding="async"
          className="aspect-video w-full border-b border-gray-200 object-cover"
        />
      </Link>
      <div className="project-card__body card-padding flex flex-1 flex-col">
        <p className="project-card__category text-xs font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
          {projectCategory(project).name[locale]}
        </p>
        <h3
          className="card-title mt-3 text-gray-950"
          translate="no"
        >
          <Link
            href={`/projects/${project.slug}`}
            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            {project.title}
          </Link>
        </h3>
        <p className="project-card__summary mt-4 flex-1 text-base leading-relaxed text-gray-600">
          {project.summary[locale]}
        </p>
        <Link
          href={`/projects/${project.slug}`}
          className="project-card__action mt-6 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-gray-950 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          {copy.details[locale]}
          <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
