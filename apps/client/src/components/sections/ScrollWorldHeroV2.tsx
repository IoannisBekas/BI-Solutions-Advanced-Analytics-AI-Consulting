import { useEffect, useMemo, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

import { trackEvent } from "@/lib/analytics";
import { withAssetBase, withSiteBase } from "@/lib/site";

type WorldChapter = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
};

type WorldClip = {
  id: string;
  still: string;
  stillMobile: string;
  clip: string;
  clipMobile: string;
  scroll: number;
  chapterIndex: number;
};

const chapters: WorldChapter[] = [
  {
    id: "clarity",
    label: "Overview",
    eyebrow: "BI Solutions Group",
    title: "Clarity from complexity.",
    body: "Business intelligence, AI, data foundations, and web applications for teams across Greece and Europe—from strategy to handoff.",
    tags: ["Greece & Europe", "Strategy to handoff"],
    primary: { label: "Start a project", href: "/start-a-project" },
    secondary: { label: "See case studies", href: "#case-studies" },
  },
  {
    id: "intelligence",
    label: "BI systems",
    eyebrow: "Business intelligence",
    title: "See the whole business.",
    body: "Trusted reporting, semantic models, and decision systems that turn fragmented data into a clear operating view.",
    tags: ["Power BI", "Semantic models", "Analytics"],
    primary: {
      label: "Explore BI services",
      href: "/services/business-intelligence-semantic-modeling",
    },
  },
  {
    id: "ai",
    label: "AI workflows",
    eyebrow: "Applied AI",
    title: "Automate the work that matters.",
    body: "Practical AI workflows, assistants, and predictive systems designed around real processes, controls, and measurable value.",
    tags: ["AI workflows", "LLM applications", "Predictive analytics"],
    primary: {
      label: "Explore AI services",
      href: "/services/advanced-analytics-ai",
    },
  },
  {
    id: "foundations",
    label: "Data",
    eyebrow: "Data foundations",
    title: "Build on reliable foundations.",
    body: "A maintainable data architecture, governance model, and cloud foundation that keeps every downstream system dependable.",
    tags: ["Data strategy", "Cloud", "Governance"],
    primary: {
      label: "Explore data services",
      href: "/services/data-strategy-governance",
    },
  },
  {
    id: "products",
    label: "Web apps",
    eyebrow: "Digital products",
    title: "Turn workflows into usable products.",
    body: "Focused websites, internal tools, and web applications that connect data, automation, and a clear user experience.",
    tags: ["Web apps", "Internal tools", "Product UX"],
    primary: {
      label: "Explore web development",
      href: "/services/website-app-development",
    },
  },
  {
    id: "handoff",
    label: "Delivery",
    eyebrow: "Results & handoff",
    title: "From first question to working result.",
    body: "Senior-led delivery connects strategy, implementation, enablement, and a clean handoff your team can continue using.",
    tags: ["Senior-led", "5-star reviews", "Built for handoff"],
    primary: { label: "Discuss your project", href: "/start-a-project" },
    secondary: { label: "Review the work", href: "#case-studies" },
  },
];

const CHAPTER_SCROLL = 1.6;
const CHAPTER_FOCUS_POINT = 0.42;
const chapterMotions = [
  { desktopX: 34, desktopY: -18, mobileX: 16, mobileY: -10, turn: 0.7 },
  { desktopX: -38, desktopY: 20, mobileX: -18, mobileY: 12, turn: -0.8 },
  { desktopX: 42, desktopY: 16, mobileX: 20, mobileY: 10, turn: 0.9 },
  { desktopX: -36, desktopY: -22, mobileX: -16, mobileY: -12, turn: -0.7 },
  { desktopX: 30, desktopY: 24, mobileX: 18, mobileY: 12, turn: 0.8 },
  { desktopX: -42, desktopY: -16, mobileX: -20, mobileY: -10, turn: -0.9 },
] as const;
const clipChapterIndexes = [0, 1, 1, 2, 3, 4, 5, 5, 5] as const;
const chapterClipCounts = clipChapterIndexes.reduce<number[]>(
  (counts, chapterIndex) => {
    counts[chapterIndex] = (counts[chapterIndex] ?? 0) + 1;
    return counts;
  },
  Array.from({ length: chapters.length }, () => 0),
);
const clips: WorldClip[] = clipChapterIndexes.map(
  (chapterIndex, index) => {
    const clipNumber = String(index + 1).padStart(2, "0");

    return {
      id: `clip-${clipNumber}`,
      still: withAssetBase(
        `scroll-world-v3/posters/clip-${clipNumber}.webp`,
      ),
      stillMobile: withAssetBase(
        `scroll-world-v3/posters/clip-${clipNumber}-mobile.webp`,
      ),
      clip: withAssetBase(
        `scroll-world-v3/video/clip-${clipNumber}.mp4`,
      ),
      clipMobile: withAssetBase(
        `scroll-world-v3/video/clip-${clipNumber}-mobile.mp4`,
      ),
      scroll: CHAPTER_SCROLL / chapterClipCounts[chapterIndex],
      chapterIndex,
    };
  },
);
const CLIP_COUNT = clips.length;
const clipOffsets = clips.reduce<number[]>(
  (offsets, clip) => [...offsets, offsets[offsets.length - 1] + clip.scroll],
  [0],
);
const chapterRanges = chapters.map((_, chapterIndex) => {
  const firstClip = clips.findIndex(
    (clip) => clip.chapterIndex === chapterIndex,
  );
  const lastClip = clips.findLastIndex(
    (clip) => clip.chapterIndex === chapterIndex,
  );

  return {
    start: clipOffsets[firstClip],
    span: clipOffsets[lastClip + 1] - clipOffsets[firstClip],
  };
});
const TOTAL_SCROLL = clipOffsets[clipOffsets.length - 1];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smooth = (value: number) => {
  const next = clamp(value);
  return next * next * (3 - 2 * next);
};

export function ScrollWorldHeroV2() {
  const rootRef = useRef<HTMLElement>(null);
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stillRefs = useRef<Array<HTMLImageElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const copyRefs = useRef<Array<HTMLElement | null>>([]);
  const routeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const progressRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const totalScroll = useMemo(() => TOTAL_SCROLL, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarsePointer = window.matchMedia(
      "(hover: none) and (pointer: coarse)",
    ).matches;
    const mobileQuery = window.matchMedia("(max-width: 860px)");
    const isMobile = () => coarsePointer || mobileQuery.matches;
    const states = clips.map(() => ({
      loading: false,
      unavailable: false,
      ready: false,
      visible: false,
      current: 0,
      target: 0,
      objectUrl: "",
      controller: null as AbortController | null,
      posterReady: false,
    }));
    let viewportHeight = window.innerHeight;
    let rootTop = 0;
    let laidOutWidth = window.innerWidth;
    let activeBeat = -1;
    let activeChapter = -1;
    let scrollTicking = false;
    let animationFrame = 0;
    let userReady = false;
    let disposed = false;
    let selectedMobile = isMobile();

    const posterFor = (index: number) =>
      selectedMobile ? clips[index].stillMobile : clips[index].still;

    const ensurePoster = (index: number) => {
      const image = stillRefs.current[index];
      const state = states[index];
      if (!image || state.posterReady) return;
      image.src = posterFor(index);
      state.posterReady = true;
    };

    const releaseClip = (index: number) => {
      const state = states[index];
      const video = videoRefs.current[index];
      state.controller?.abort();
      state.controller = null;
      if (video) {
        video.removeAttribute("src");
        video.load();
      }
      if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
      state.objectUrl = "";
      state.loading = false;
      state.ready = false;
      state.unavailable = false;
      sceneRefs.current[index]?.removeAttribute("data-video-ready");
    };

    const primeVideo = async (video: HTMLVideoElement | null) => {
      if (!selectedMobile || !video) return;
      try {
        await video.play();
        video.pause();
      } catch {
        // The poster remains visible when a browser declines priming.
      }
    };

    const loadClip = async (index: number) => {
      const state = states[index];
      const video = videoRefs.current[index];
      ensurePoster(index);
      if (
        reduceMotion ||
        !video ||
        state.loading ||
        state.unavailable ||
        state.ready
      ) {
        return;
      }

      const controller = new AbortController();
      state.loading = true;
      state.controller = controller;
      const source = selectedMobile
        ? clips[index].clipMobile
        : clips[index].clip;

      try {
        const response = await fetch(source, { signal: controller.signal });
        if (!response.ok) throw new Error(String(response.status));
        const blob = await response.blob();
        if (disposed || state.controller !== controller) return;
        state.objectUrl = URL.createObjectURL(blob);
        video.src = state.objectUrl;
        video.load();
      } catch (error) {
        if (state.controller !== controller) return;
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          state.unavailable = true;
        }
        state.loading = false;
      } finally {
        if (state.controller === controller) state.controller = null;
      }
    };

    const read = () => {
      const localY = clamp(
        window.scrollY - rootTop,
        0,
        totalScroll * viewportHeight,
      );
      const position = localY / viewportHeight;
      const nearestMatch = clips.findIndex(
        (_, index) => position < clipOffsets[index + 1],
      );
      const nearest =
        nearestMatch === -1 ? CLIP_COUNT - 1 : nearestMatch;
      const transitionBand = 0.11;

      clips.forEach((clip, index) => {
        const start = clipOffsets[index];
        const end = clipOffsets[index + 1];
        const local = clamp((position - start) / clip.scroll);
        const state = states[index];
        const sceneElement = sceneRefs.current[index];
        const stillElement = stillRefs.current[index];

        if (Math.abs(index - nearest) <= 2) ensurePoster(index);
        if (Math.abs(index - nearest) <= 1) {
          void loadClip(index);
        } else if (Math.abs(index - nearest) > 2 && state.objectUrl) {
          releaseClip(index);
        }

        let opacity = 1;
        if (position < start) {
          opacity = smooth(1 - (start - position) / transitionBand);
        } else if (position > end) {
          opacity = smooth(1 - (position - end) / transitionBand);
        }
        state.visible = opacity > 0.001;
        state.target = local;

        if (sceneElement) {
          sceneElement.style.opacity = String(opacity);
          sceneElement.style.zIndex =
            position >= start && position <= end ? "12" : "10";
        }
        if (stillElement && !reduceMotion) {
          stillElement.style.transform = `scale(${(
            1.012 +
            local * 0.03
          ).toFixed(3)})`;
        }
      });

      chapters.forEach((chapter, index) => {
        const { start, span } = chapterRanges[index];
        const local = clamp((position - start) / span);
        const copy = copyRefs.current[index];
        if (!copy) return;

        let copyOpacity = 0;
        if (index === 0) {
          copyOpacity = smooth(1 - Math.max(0, local - 0.28) / 0.46);
        } else if (index === chapters.length - 1) {
          copyOpacity = smooth(local / 0.24);
        } else {
          copyOpacity = smooth(local / 0.2) * smooth((1 - local) / 0.2);
        }

        copy.style.opacity = String(copyOpacity);
        const motion = chapterMotions[index];
        const travel = 0.5 - local;
        const driftX = (
          travel * (selectedMobile ? motion.mobileX : motion.desktopX)
        ).toFixed(1);
        const driftY = (
          travel * (selectedMobile ? motion.mobileY : motion.desktopY)
        ).toFixed(1);
        const turn = (travel * motion.turn).toFixed(2);
        copy.style.transform = selectedMobile
          ? reduceMotion
            ? "rotate(var(--copy-angle-mobile, 0deg))"
            : `translate(${driftX}px, ${driftY}px) rotate(calc(var(--copy-angle-mobile, 0deg) + ${turn}deg))`
          : reduceMotion
            ? "translateY(-50%) rotate(var(--copy-angle, 0deg))"
            : `translate(${driftX}px, calc(-50% + ${driftY}px)) rotate(calc(var(--copy-angle, 0deg) + ${turn}deg))`;
        copy.style.pointerEvents = copyOpacity > 0.55 ? "auto" : "none";
        const copyIsInteractive = copyOpacity > 0.55;
        copy.setAttribute("aria-hidden", String(!copyIsInteractive));
        copy.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
          link.tabIndex = copyIsInteractive ? 0 : -1;
        });
      });

      if (nearest !== activeBeat) {
        activeBeat = nearest;
        root.dataset.activeBeat = String(activeBeat + 1);
      }

      const nextChapter = clips[nearest].chapterIndex;
      if (nextChapter !== activeChapter) {
        activeChapter = nextChapter;
        root.dataset.activeChapter = chapters[activeChapter].id;
        routeRefs.current.forEach((route, index) => {
          route?.classList.toggle("is-active", index === activeChapter);
          if (index === activeChapter) {
            route?.setAttribute("aria-current", "step");
          } else {
            route?.removeAttribute("aria-current");
          }
        });
      }

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${clamp(
          localY / (totalScroll * viewportHeight),
        )})`;
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(
          clamp(1 - localY / (0.7 * viewportHeight)),
        );
      }
      scrollTicking = false;
    };

    const layout = () => {
      const nextMobile = isMobile();
      if (nextMobile !== selectedMobile) {
        selectedMobile = nextMobile;
        states.forEach((state, index) => {
          releaseClip(index);
          const image = stillRefs.current[index];
          if (image && state.posterReady) image.src = posterFor(index);
        });
      }
      viewportHeight = window.innerHeight;
      laidOutWidth = window.innerWidth;
      rootTop = window.scrollY + root.getBoundingClientRect().top;
      read();
    };

    const animate = () => {
      states.forEach((state, index) => {
        const video = videoRefs.current[index];
        if (
          !video ||
          !state.ready ||
          video.seeking ||
          (!state.visible && Math.abs(state.current - state.target) < 0.002)
        ) {
          return;
        }

        state.current +=
          (state.target - state.current) * (reduceMotion ? 1 : 0.2);
        const targetTime =
          clamp(state.current, 0, 0.999) * (video.duration || 1);
        const threshold = selectedMobile ? 0.018 : 0.007;
        if (Math.abs(video.currentTime - targetTime) > threshold) {
          try {
            video.currentTime = targetTime;
          } catch {
            // The poster remains visible until seeking is supported.
          }
        }
      });
      animationFrame = window.requestAnimationFrame(animate);
    };

    const handleScroll = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(read);
    };
    const handleResize = () => {
      if (coarsePointer && window.innerWidth === laidOutWidth) return;
      layout();
    };
    const handleFirstGesture = () => {
      if (userReady) return;
      userReady = true;
      videoRefs.current.forEach((video) => void primeVideo(video));
    };

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.addEventListener("loadedmetadata", () => {
        states[index].ready = true;
        states[index].loading = false;
        read();
      });
      video.addEventListener("seeked", () => {
        sceneRefs.current[index]?.setAttribute("data-video-ready", "true");
      });
      video.addEventListener("loadeddata", () => {
        if (userReady) void primeVideo(video);
      });
    });

    ensurePoster(0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", layout);
    window.addEventListener("pointerdown", handleFirstGesture, {
      once: true,
      passive: true,
    });
    window.addEventListener("touchstart", handleFirstGesture, {
      once: true,
      passive: true,
    });

    layout();
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", layout);
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      states.forEach((state) => {
        state.controller?.abort();
        if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
      });
    };
  }, [totalScroll]);

  const jumpTo = (index: number) => {
    const root = rootRef.current;
    if (!root) return;
    const { start: chapterStart, span: chapterSpan } =
      chapterRanges[index];
    const target =
      window.scrollY +
      root.getBoundingClientRect().top +
      (chapterStart + chapterSpan * CHAPTER_FOCUS_POINT) *
        window.innerHeight;
    window.scrollTo({
      top: target,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const handleCta = (chapter: WorldChapter, label: string, href: string) => {
    trackEvent("scroll_world_cta_click", {
      scene: chapter.id,
      cta: label,
      target: href,
      version: "v2",
    });
  };

  return (
    <section
      ref={rootRef}
      className="bi-world bi-world--v3"
      aria-label="BI Solutions Group capabilities"
      data-active-chapter="clarity"
      style={{ height: `${(totalScroll + 1) * 100}vh` }}
    >
      <div className="bi-world__sticky">
        <div className="bi-world__grid" aria-hidden="true" />
        <div className="bi-world__progress" aria-hidden="true">
          <span ref={progressRef} />
        </div>

        <div className="bi-world__stage" aria-hidden="true">
          {clips.map((clip, index) => (
            <div
              key={clip.id}
              ref={(element) => {
                sceneRefs.current[index] = element;
              }}
              className={`bi-world__scene ${
                index === 0 ? "is-initial" : ""
              }`}
            >
              <img
                ref={(element) => {
                  stillRefs.current[index] = element;
                }}
                alt=""
                className="bi-world__still"
                decoding={index === 0 ? "sync" : "async"}
              />
              <video
                ref={(element) => {
                  videoRefs.current[index] = element;
                }}
                className="bi-world__video"
                muted
                playsInline
                preload="none"
              />
            </div>
          ))}
        </div>

        <div className="bi-world__copy-layer">
          {chapters.map((chapter, index) => {
            const Heading = index === 0 ? "h1" : "h2";

            return (
              <article
                key={chapter.id}
                ref={(element) => {
                  copyRefs.current[index] = element;
                }}
                className={`bi-world__copy ${
                  index === 0 ? "is-initial" : ""
                }`}
                data-chapter={chapter.id}
                aria-hidden={index !== 0}
              >
                <span className="bi-world__count">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(chapters.length).padStart(2, "0")}
                </span>
                <span className="bi-world__eyebrow">{chapter.eyebrow}</span>
                <Heading className="bi-world__title">{chapter.title}</Heading>
                <p className="bi-world__body">{chapter.body}</p>
                <ul className="bi-world__tags" aria-label="Capabilities">
                  {chapter.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                {chapter.primary || chapter.secondary ? (
                  <div className="bi-world__actions">
                    {chapter.primary ? (
                      <Link
                        href={chapter.primary.href}
                        className="bi-world__button bi-world__button--primary"
                        tabIndex={index === 0 ? 0 : -1}
                        onClick={() =>
                          handleCta(
                            chapter,
                            chapter.primary!.label,
                            chapter.primary!.href,
                          )
                        }
                      >
                        {chapter.primary.label}
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </Link>
                    ) : null}
                    {chapter.secondary ? (
                      <a
                        href={withSiteBase(`/${chapter.secondary.href}`)}
                        className="bi-world__button bi-world__button--secondary"
                        tabIndex={index === 0 ? 0 : -1}
                        onClick={() =>
                          handleCta(
                            chapter,
                            chapter.secondary!.label,
                            chapter.secondary!.href,
                          )
                        }
                      >
                        {chapter.secondary.label}
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <nav className="bi-world__route" aria-label="Capability journey">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              ref={(element) => {
                routeRefs.current[index] = element;
              }}
              type="button"
              className={index === 0 ? "is-active" : ""}
              onClick={() => jumpTo(index)}
              aria-label={`Go to ${chapter.label}`}
              aria-current={index === 0 ? "step" : undefined}
            >
              <span>{chapter.label}</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </nav>

        <div ref={hintRef} className="bi-world__hint" aria-hidden="true">
          <span>Scroll to explore</span>
          <i />
        </div>
      </div>
    </section>
  );
}
