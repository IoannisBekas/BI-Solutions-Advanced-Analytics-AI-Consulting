import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

import { trackEvent } from "@/lib/analytics";
import { withAssetBase, withSiteBase } from "@/lib/site";

type StoryChapter = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  composition: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
};

type StoryClip = {
  id: string;
  chapterIndex: number;
  poster: string;
  posterMobile: string;
  video: string;
  videoMobile: string;
  scroll: number;
};

const chapters: StoryChapter[] = [
  {
    id: "clarity",
    label: "Overview",
    eyebrow: "BI Solutions Group",
    title: "Clarity from complexity.",
    body: "Business intelligence, AI, data foundations, and web applications for teams across Greece and Europe—from strategy to handoff.",
    tags: ["Greece & Europe", "Strategy to handoff"],
    composition: "origin",
    primary: { label: "Start a project", href: "/start-a-project" },
    secondary: { label: "See case studies", href: "/#case-studies" },
  },
  {
    id: "intelligence",
    label: "BI systems",
    eyebrow: "Business intelligence",
    title: "See the whole business.",
    body: "Trusted reporting, semantic models, and decision systems that turn fragmented data into a clear operating view.",
    tags: ["Power BI", "Semantic models", "Analytics"],
    composition: "east",
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
    composition: "cross",
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
    composition: "slope",
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
    composition: "west",
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
    composition: "finale",
    primary: { label: "Discuss your project", href: "/start-a-project" },
    secondary: { label: "Review the work", href: "/#case-studies" },
  },
];

const CHAPTER_SCROLL = 1.35;
const CHAPTER_FOCUS = 0.46;
const clipChapterIndexes = [0, 1, 1, 2, 3, 4, 5, 5, 5] as const;
const chapterClipCounts = clipChapterIndexes.reduce<number[]>(
  (counts, chapterIndex) => {
    counts[chapterIndex] = (counts[chapterIndex] ?? 0) + 1;
    return counts;
  },
  Array.from({ length: chapters.length }, () => 0),
);

const clips: StoryClip[] = clipChapterIndexes.map((chapterIndex, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `story-clip-${number}`,
    chapterIndex,
    poster: withAssetBase(`scroll-world-v4/posters/clip-${number}.webp`),
    posterMobile: withAssetBase(
      `scroll-world-v4/posters/clip-${number}-mobile.webp`,
    ),
    video: withAssetBase(`scroll-world-v4/video/clip-${number}.mp4`),
    videoMobile: withAssetBase(
      `scroll-world-v4/video/clip-${number}-mobile.mp4`,
    ),
    scroll: CHAPTER_SCROLL / chapterClipCounts[chapterIndex],
  };
});

const clipOffsets = clips.reduce<number[]>(
  (offsets, clip) => [
    ...offsets,
    offsets[offsets.length - 1] + clip.scroll,
  ],
  [0],
);
const TOTAL_SCROLL = chapters.length * CHAPTER_SCROLL;
const SECTION_HEIGHT = Math.round((TOTAL_SCROLL + 1) * 100);

const chapterMotion = [
  { x: -42, y: 18, detailX: 22, detailY: -10, angle: -1.1 },
  { x: 46, y: -20, detailX: -24, detailY: 12, angle: 1.35 },
  { x: -38, y: -24, detailX: 26, detailY: 14, angle: -1.65 },
  { x: 40, y: 22, detailX: -22, detailY: -12, angle: 0.85 },
  { x: -44, y: 20, detailX: 24, detailY: -14, angle: 1.55 },
  { x: 0, y: -26, detailX: 0, detailY: 16, angle: -0.6 },
] as const;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const ease = (value: number) => {
  const next = clamp(value);
  return next * next * (3 - 2 * next);
};

export function ScrollStoryHero() {
  const rootRef = useRef<HTMLElement>(null);
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const posterRefs = useRef<Array<HTMLImageElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);
  const kickerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const titleRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const detailRefs = useRef<Array<HTMLDivElement | null>>([]);
  const routeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const progressRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarsePointer = window.matchMedia(
      "(hover: none) and (pointer: coarse)",
    ).matches;
    const mobileQuery = window.matchMedia("(max-width: 860px)");
    const isMobile = () => coarsePointer || mobileQuery.matches;
    const mediaStates = clips.map(() => ({
      loading: false,
      unavailable: false,
      ready: false,
      visible: false,
      posterReady: false,
      current: 0,
      target: 0,
      objectUrl: "",
      controller: null as AbortController | null,
    }));

    let viewportHeight = window.innerHeight;
    let rootTop = 0;
    let laidOutWidth = window.innerWidth;
    let mobile = isMobile();
    let activeClip = -1;
    let activeChapter = -1;
    let frame = 0;
    let scrollQueued = false;
    let disposed = false;
    let userReady = false;

    const posterFor = (index: number) =>
      mobile ? clips[index].posterMobile : clips[index].poster;
    const videoFor = (index: number) =>
      mobile ? clips[index].videoMobile : clips[index].video;

    const ensurePoster = (index: number) => {
      const poster = posterRefs.current[index];
      const state = mediaStates[index];
      if (!poster || state.posterReady) return;
      poster.src = posterFor(index);
      state.posterReady = true;
    };

    const releaseVideo = (index: number) => {
      const state = mediaStates[index];
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
      if (!mobile || !video) return;
      try {
        await video.play();
        video.pause();
      } catch {
        // The poster stays visible if the browser declines video priming.
      }
    };

    const loadVideo = async (index: number) => {
      const state = mediaStates[index];
      const video = videoRefs.current[index];
      ensurePoster(index);
      if (
        reducedMotion ||
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

      try {
        const response = await fetch(videoFor(index), {
          signal: controller.signal,
        });
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

    const update = () => {
      const localY = clamp(
        window.scrollY - rootTop,
        0,
        TOTAL_SCROLL * viewportHeight,
      );
      const position = localY / viewportHeight;
      const matchedClip = clips.findIndex(
        (_, index) => position < clipOffsets[index + 1],
      );
      const nextClip = matchedClip === -1 ? clips.length - 1 : matchedClip;
      const nextChapter = Math.min(
        chapters.length - 1,
        Math.floor(position / CHAPTER_SCROLL),
      );
      const crossfade = 0.09;

      clips.forEach((clip, index) => {
        const start = clipOffsets[index];
        const end = clipOffsets[index + 1];
        const local = clamp((position - start) / clip.scroll);
        const state = mediaStates[index];
        const scene = sceneRefs.current[index];
        const poster = posterRefs.current[index];

        if (Math.abs(index - nextClip) <= 2) ensurePoster(index);
        if (Math.abs(index - nextClip) <= 1) {
          void loadVideo(index);
        } else if (Math.abs(index - nextClip) > 2 && state.objectUrl) {
          releaseVideo(index);
        }

        let opacity = 1;
        if (position < start) {
          opacity = ease(1 - (start - position) / crossfade);
        } else if (position > end) {
          opacity = ease(1 - (position - end) / crossfade);
        }

        state.visible = opacity > 0.001;
        state.target = local;
        if (scene) {
          scene.style.opacity = String(opacity);
          scene.style.zIndex =
            position >= start && position <= end ? "12" : "10";
        }
        if (poster && !reducedMotion) {
          poster.style.transform = `scale(${(1.01 + local * 0.035).toFixed(3)})`;
        }
      });

      chapters.forEach((chapter, index) => {
        const local = clamp(
          (position - index * CHAPTER_SCROLL) / CHAPTER_SCROLL,
        );
        const article = chapterRefs.current[index];
        const kicker = kickerRefs.current[index];
        const title = titleRefs.current[index];
        const detail = detailRefs.current[index];
        if (!article || !kicker || !title || !detail) return;

        const intro = index === 0 ? 1 : ease(local / 0.16);
        const outro =
          index === chapters.length - 1 ? 1 : ease((1 - local) / 0.18);
        const opacity = intro * outro;
        const travel = 0.5 - local;
        const motion = chapterMotion[index];
        const titleX = travel * motion.x;
        const titleY = travel * motion.y;

        article.style.opacity = String(opacity);
        article.style.zIndex = opacity > 0.45 ? "22" : "20";
        kicker.style.transform = `translate3d(${(titleX * 0.45).toFixed(1)}px, ${(titleY * 0.45).toFixed(1)}px, 0)`;
        title.style.transform = reducedMotion
          ? `rotate(${motion.angle}deg)`
          : `translate3d(${titleX.toFixed(1)}px, ${titleY.toFixed(1)}px, 0) rotate(${(motion.angle + travel * 0.45).toFixed(2)}deg)`;
        detail.style.transform = reducedMotion
          ? "none"
          : `translate3d(${(travel * motion.detailX).toFixed(1)}px, ${(travel * motion.detailY).toFixed(1)}px, 0)`;

        const interactive = opacity > 0.62;
        article.style.pointerEvents = interactive ? "auto" : "none";
        article.setAttribute("aria-hidden", String(!interactive));
        article.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
          link.tabIndex = interactive ? 0 : -1;
        });
      });

      if (nextClip !== activeClip) {
        activeClip = nextClip;
        root.dataset.activeClip = String(activeClip + 1);
      }

      if (nextChapter !== activeChapter) {
        activeChapter = nextChapter;
        root.dataset.activeChapter = chapters[activeChapter].id;
        if (counterRef.current) {
          counterRef.current.textContent = String(activeChapter + 1).padStart(
            2,
            "0",
          );
        }
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
          localY / (TOTAL_SCROLL * viewportHeight),
        )})`;
      }
      if (cueRef.current) {
        cueRef.current.style.opacity = String(
          clamp(1 - localY / (0.6 * viewportHeight)),
        );
      }
      scrollQueued = false;
    };

    const layout = () => {
      const nextMobile = isMobile();
      if (nextMobile !== mobile) {
        mobile = nextMobile;
        mediaStates.forEach((state, index) => {
          releaseVideo(index);
          const poster = posterRefs.current[index];
          if (poster && state.posterReady) poster.src = posterFor(index);
        });
      }
      viewportHeight = window.innerHeight;
      laidOutWidth = window.innerWidth;
      rootTop = window.scrollY + root.getBoundingClientRect().top;
      update();
    };

    const animate = () => {
      mediaStates.forEach((state, index) => {
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
          (state.target - state.current) * (reducedMotion ? 1 : 0.22);
        const targetTime =
          clamp(state.current, 0, 0.999) * (video.duration || 1);
        const threshold = mobile ? 0.018 : 0.007;
        if (Math.abs(video.currentTime - targetTime) > threshold) {
          try {
            video.currentTime = targetTime;
          } catch {
            // The poster remains the visual fallback until seeking is ready.
          }
        }
      });
      frame = window.requestAnimationFrame(animate);
    };

    const handleScroll = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      window.requestAnimationFrame(update);
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
        mediaStates[index].ready = true;
        mediaStates[index].loading = false;
        update();
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
    frame = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", layout);
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      mediaStates.forEach((state) => {
        state.controller?.abort();
        if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
      });
    };
  }, []);

  const jumpTo = (index: number) => {
    const root = rootRef.current;
    if (!root) return;
    const target =
      window.scrollY +
      root.getBoundingClientRect().top +
      (index * CHAPTER_SCROLL + CHAPTER_SCROLL * CHAPTER_FOCUS) *
        window.innerHeight;
    window.scrollTo({
      top: target,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const trackCta = (chapter: StoryChapter, label: string, href: string) => {
    trackEvent("scroll_story_cta_click", {
      scene: chapter.id,
      cta: label,
      target: href,
      version: "data-center-v4",
    });
  };

  return (
    <section
      ref={rootRef}
      className="scroll-story"
      aria-label="BI Solutions Group capabilities"
      data-active-chapter="clarity"
      style={{ height: `${SECTION_HEIGHT}vh` }}
    >
      <div className="scroll-story__sticky">
        <div className="scroll-story__stage" aria-hidden="true">
          {clips.map((clip, index) => (
            <div
              key={clip.id}
              ref={(element) => {
                sceneRefs.current[index] = element;
              }}
              className={`scroll-story__scene ${
                index === 0 ? "is-initial" : ""
              }`}
            >
              <img
                ref={(element) => {
                  posterRefs.current[index] = element;
                }}
                className="scroll-story__poster"
                alt=""
                src={index === 0 ? clip.poster : undefined}
                decoding={index === 0 ? "sync" : "async"}
              />
              <video
                ref={(element) => {
                  videoRefs.current[index] = element;
                }}
                className="scroll-story__video"
                muted
                playsInline
                preload="none"
              />
            </div>
          ))}
        </div>

        <div className="scroll-story__wash" aria-hidden="true" />
        <div className="scroll-story__grid" aria-hidden="true" />
        <div className="scroll-story__frame" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="scroll-story__progress" aria-hidden="true">
          <span ref={progressRef} />
        </div>

        <div className="scroll-story__chapters">
          {chapters.map((chapter, index) => {
            const Heading = index === 0 ? "h1" : "h2";
            return (
              <article
                key={chapter.id}
                ref={(element) => {
                  chapterRefs.current[index] = element;
                }}
                className={`scroll-story__chapter ${
                  index === 0 ? "is-initial" : ""
                }`}
                data-composition={chapter.composition}
                aria-hidden={index !== 0}
              >
                <div
                  ref={(element) => {
                    kickerRefs.current[index] = element;
                  }}
                  className="scroll-story__kicker"
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{chapter.eyebrow}</span>
                </div>
                <Heading
                  ref={(element) => {
                    titleRefs.current[index] = element;
                  }}
                  className="scroll-story__title"
                >
                  {chapter.title}
                </Heading>
                <div
                  ref={(element) => {
                    detailRefs.current[index] = element;
                  }}
                  className="scroll-story__detail"
                >
                  <p>{chapter.body}</p>
                  <ul aria-label="Capabilities">
                    {chapter.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  <div className="scroll-story__actions">
                    <Link
                      href={chapter.primary.href}
                      className="scroll-story__button scroll-story__button--primary"
                      tabIndex={index === 0 ? 0 : -1}
                      onClick={() =>
                        trackCta(
                          chapter,
                          chapter.primary.label,
                          chapter.primary.href,
                        )
                      }
                    >
                      {chapter.primary.label}
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                    {chapter.secondary ? (
                      <a
                        href={withSiteBase(chapter.secondary.href)}
                        className="scroll-story__button scroll-story__button--secondary"
                        tabIndex={index === 0 ? 0 : -1}
                        onClick={() =>
                          trackCta(
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
                </div>
              </article>
            );
          })}
        </div>

        <div className="scroll-story__status" aria-hidden="true">
          <span ref={counterRef}>01</span>
          <i />
          <span>06</span>
        </div>

        <nav className="scroll-story__route" aria-label="Capability journey">
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
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{chapter.label}</strong>
              <i aria-hidden="true" />
            </button>
          ))}
        </nav>

        <div ref={cueRef} className="scroll-story__cue" aria-hidden="true">
          <span>Scroll to enter</span>
          <i />
        </div>
      </div>
    </section>
  );
}
