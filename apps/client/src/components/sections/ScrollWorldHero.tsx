import { useEffect, useMemo, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

import { trackEvent } from "@/lib/analytics";
import { withAssetBase, withSiteBase } from "@/lib/site";

type WorldScene = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  still: string;
  stillMobile: string;
  clip: string;
  clipMobile: string;
  scroll: number;
  linger: number;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
};

const scenes: WorldScene[] = [
  {
    id: "clarity",
    label: "Overview",
    eyebrow: "BI Solutions Group",
    title: "Clarity from complexity.",
    body: "Business intelligence, AI, data foundations, and web applications for teams across Greece and Europe—from strategy to handoff.",
    tags: ["Greece & Europe", "Strategy to handoff"],
    still: withAssetBase("scroll-world/clarity.webp"),
    stillMobile: withAssetBase("scroll-world/clarity-mobile.webp"),
    clip: withAssetBase("scroll-world/video/clarity.mp4"),
    clipMobile: withAssetBase("scroll-world/video/clarity-mobile.mp4"),
    scroll: 1.65,
    linger: 0.42,
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
    still: withAssetBase("scroll-world/intelligence.webp"),
    stillMobile: withAssetBase("scroll-world/intelligence-mobile.webp"),
    clip: withAssetBase("scroll-world/video/intelligence.mp4"),
    clipMobile: withAssetBase("scroll-world/video/intelligence-mobile.mp4"),
    scroll: 1.4,
    linger: 0.35,
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
    still: withAssetBase("scroll-world/ai.webp"),
    stillMobile: withAssetBase("scroll-world/ai-mobile.webp"),
    clip: withAssetBase("scroll-world/video/ai.mp4"),
    clipMobile: withAssetBase("scroll-world/video/ai-mobile.mp4"),
    scroll: 1.4,
    linger: 0.32,
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
    still: withAssetBase("scroll-world/foundations.webp"),
    stillMobile: withAssetBase("scroll-world/foundations-mobile.webp"),
    clip: withAssetBase("scroll-world/video/foundations.mp4"),
    clipMobile: withAssetBase("scroll-world/video/foundations-mobile.mp4"),
    scroll: 1.35,
    linger: 0.3,
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
    still: withAssetBase("scroll-world/products.webp"),
    stillMobile: withAssetBase("scroll-world/products-mobile.webp"),
    clip: withAssetBase("scroll-world/video/products.mp4"),
    clipMobile: withAssetBase("scroll-world/video/products-mobile.mp4"),
    scroll: 1.35,
    linger: 0.3,
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
    still: withAssetBase("scroll-world/handoff.webp"),
    stillMobile: withAssetBase("scroll-world/handoff-mobile.webp"),
    clip: withAssetBase("scroll-world/video/handoff.mp4"),
    clipMobile: withAssetBase("scroll-world/video/handoff-mobile.mp4"),
    scroll: 1.7,
    linger: 0.45,
    primary: { label: "Discuss your project", href: "/start-a-project" },
    secondary: { label: "Review the work", href: "#case-studies" },
  },
];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smooth = (value: number) => {
  const next = clamp(value);
  return next * next * (3 - 2 * next);
};

const linger = (value: number, amount: number) => {
  const centered = value - 0.5;
  return (1 - amount) * value + amount * (4 * centered ** 3 + 0.5);
};

export function ScrollWorldHero() {
  const rootRef = useRef<HTMLElement>(null);
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stillRefs = useRef<Array<HTMLImageElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const copyRefs = useRef<Array<HTMLElement | null>>([]);
  const routeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const progressRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const totalScroll = useMemo(
    () => scenes.reduce((sum, scene) => sum + scene.scroll, 0),
    [],
  );

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
    const states = scenes.map(() => ({
      loading: false,
      unavailable: false,
      ready: false,
      visible: false,
      current: 0,
      target: 0,
      objectUrl: "",
    }));
    let viewportHeight = window.innerHeight;
    let rootTop = 0;
    let laidOutWidth = window.innerWidth;
    let activeIndex = -1;
    let scrollTicking = false;
    let animationFrame = 0;
    let userReady = false;
    let disposed = false;
    let offsets: number[] = [];

    const layout = () => {
      viewportHeight = window.innerHeight;
      laidOutWidth = window.innerWidth;
      rootTop = window.scrollY + root.getBoundingClientRect().top;
      offsets = [0];
      scenes.forEach((scene) => {
        offsets.push(offsets[offsets.length - 1] + scene.scroll);
      });
      read();
    };

    const primeVideo = async (video: HTMLVideoElement | null) => {
      if (!isMobile() || !video) return;
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
      if (
        reduceMotion ||
        !video ||
        state.loading ||
        state.unavailable ||
        state.ready
      ) {
        return;
      }

      state.loading = true;
      const source = isMobile()
        ? scenes[index].clipMobile
        : scenes[index].clip;

      try {
        const response = await fetch(source);
        if (!response.ok) throw new Error(String(response.status));
        const blob = await response.blob();
        if (disposed) return;
        state.objectUrl = URL.createObjectURL(blob);
        video.src = state.objectUrl;
        video.load();
      } catch {
        state.unavailable = true;
        state.loading = false;
      }
    };

    const read = () => {
      const localY = clamp(
        window.scrollY - rootTop,
        0,
        totalScroll * viewportHeight,
      );
      const position = localY / viewportHeight;
      const transitionBand = 0.14;
      let nearest = 0;

      scenes.forEach((scene, index) => {
        const start = offsets[index] ?? 0;
        const end = offsets[index + 1] ?? totalScroll;
        const local = clamp((position - start) / (end - start));
        const state = states[index];
        const sceneElement = sceneRefs.current[index];
        const stillElement = stillRefs.current[index];

        if (position >= start) nearest = index;
        if (Math.abs(index - nearest) <= 1) void loadClip(index);

        let opacity = 1;
        if (position < start) {
          opacity = smooth(1 - (start - position) / transitionBand);
        } else if (position > end) {
          opacity = smooth(1 - (position - end) / transitionBand);
        }
        state.visible = opacity > 0.001;
        state.target = scene.linger ? linger(local, scene.linger) : local;

        if (sceneElement) {
          sceneElement.style.opacity = String(opacity);
          sceneElement.style.zIndex =
            position >= start && position <= end ? "12" : "10";
        }
        if (stillElement && !reduceMotion) {
          stillElement.style.transform = `scale(${(
            1.025 +
            local * 0.095
          ).toFixed(3)})`;
        }

        const copy = copyRefs.current[index];
        if (copy) {
          let copyOpacity = 0;
          if (index === 0) {
            copyOpacity = smooth(1 - local / 0.66);
          } else if (index === scenes.length - 1) {
            copyOpacity = smooth(local / 0.36);
          } else {
            copyOpacity = smooth(
              1 - Math.abs(local - 0.5) / 0.48,
            );
          }
          copy.style.opacity = String(copyOpacity);
          const drift = ((0.5 - local) * 24).toFixed(1);
          copy.style.transform = isMobile()
            ? reduceMotion
              ? "none"
              : `translateY(${drift}px)`
            : reduceMotion
              ? "translateY(-50%)"
              : `translateY(calc(-50% + ${drift}px))`;
          copy.style.pointerEvents = copyOpacity > 0.55 ? "auto" : "none";
          const copyIsInteractive = copyOpacity > 0.55;
          copy.setAttribute("aria-hidden", String(!copyIsInteractive));
          copy.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
            link.tabIndex = copyIsInteractive ? 0 : -1;
          });
        }
      });

      if (nearest !== activeIndex) {
        activeIndex = nearest;
        routeRefs.current.forEach((route, index) => {
          route?.classList.toggle("is-active", index === activeIndex);
          if (index === activeIndex) {
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
          clamp(1 - localY / (0.65 * viewportHeight)),
        );
      }
      scrollTicking = false;
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
          (state.target - state.current) * (reduceMotion ? 1 : 0.18);
        const targetTime =
          clamp(state.current, 0, 0.999) * (video.duration || 1);
        const threshold = isMobile() ? 0.02 : 0.008;
        if (Math.abs(video.currentTime - targetTime) > threshold) {
          try {
            video.currentTime = targetTime;
          } catch {
            // The still remains visible until seeking is supported.
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
      video.preload = "auto";
      video.addEventListener("loadedmetadata", () => {
        states[index].ready = true;
        states[index].loading = false;
        read();
      });
      video.addEventListener(
        "seeked",
        () => {
          sceneRefs.current[index]?.setAttribute("data-video-ready", "true");
        },
        { once: true },
      );
      video.addEventListener("loadeddata", () => {
        if (userReady) void primeVideo(video);
      });
    });

    const mobile = isMobile();
    stillRefs.current.forEach((image, index) => {
      if (image) {
        image.src = mobile
          ? scenes[index].stillMobile
          : scenes[index].still;
      }
    });

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
        if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
      });
    };
  }, [totalScroll]);

  const jumpTo = (index: number) => {
    const root = rootRef.current;
    if (!root) return;
    const before = scenes
      .slice(0, index)
      .reduce((sum, scene) => sum + scene.scroll, 0);
    const focusPoint = index === 0 ? 0.05 : 0.5;
    const target =
      window.scrollY +
      root.getBoundingClientRect().top +
      (before + scenes[index].scroll * focusPoint) * window.innerHeight;
    window.scrollTo({
      top: target,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const handleCta = (scene: WorldScene, label: string, href: string) => {
    trackEvent("scroll_world_cta_click", {
      scene: scene.id,
      cta: label,
      target: href,
    });
  };

  return (
    <section
      ref={rootRef}
      className="bi-world"
      aria-label="BI Solutions Group capabilities"
      style={{ height: `${(totalScroll + 1) * 100}vh` }}
    >
      <div className="bi-world__sticky">
        <div className="bi-world__grid" aria-hidden="true" />
        <div className="bi-world__progress" aria-hidden="true">
          <span ref={progressRef} />
        </div>

        <div className="bi-world__stage" aria-hidden="true">
          {scenes.map((scene, index) => (
            <div
              key={scene.id}
              ref={(element) => {
                sceneRefs.current[index] = element;
              }}
              className={`bi-world__scene ${
                index === 0 ? "is-initial" : ""
              }`}
            >
              <picture>
                <source
                  media="(max-width: 860px)"
                  srcSet={scene.stillMobile}
                />
                <img
                  ref={(element) => {
                    stillRefs.current[index] = element;
                  }}
                  src={scene.still}
                  alt=""
                  className="bi-world__still"
                  decoding={index === 0 ? "sync" : "async"}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </picture>
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
          {scenes.map((scene, index) => {
            const Heading = index === 0 ? "h1" : "h2";

            return (
              <article
                key={scene.id}
                ref={(element) => {
                  copyRefs.current[index] = element;
                }}
                className={`bi-world__copy ${
                  index === 0 ? "is-initial" : ""
                }`}
                aria-hidden={index !== 0}
              >
                <span className="bi-world__count">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(scenes.length).padStart(2, "0")}
                </span>
                <span className="bi-world__eyebrow">{scene.eyebrow}</span>
                <Heading className="bi-world__title">{scene.title}</Heading>
                <p className="bi-world__body">{scene.body}</p>
                <ul className="bi-world__tags" aria-label="Capabilities">
                  {scene.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                {scene.primary || scene.secondary ? (
                  <div className="bi-world__actions">
                    {scene.primary ? (
                      <Link
                        href={scene.primary.href}
                        className="bi-world__button bi-world__button--primary"
                        tabIndex={index === 0 ? 0 : -1}
                        onClick={() =>
                          handleCta(
                            scene,
                            scene.primary!.label,
                            scene.primary!.href,
                          )
                        }
                      >
                        {scene.primary.label}
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </Link>
                    ) : null}
                    {scene.secondary ? (
                      <a
                        href={withSiteBase(`/${scene.secondary.href}`)}
                        className="bi-world__button bi-world__button--secondary"
                        tabIndex={index === 0 ? 0 : -1}
                        onClick={() =>
                          handleCta(
                            scene,
                            scene.secondary!.label,
                            scene.secondary!.href,
                          )
                        }
                      >
                        {scene.secondary.label}
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <nav className="bi-world__route" aria-label="Capability journey">
          {scenes.map((scene, index) => (
            <button
              key={scene.id}
              ref={(element) => {
                routeRefs.current[index] = element;
              }}
              type="button"
              className={index === 0 ? "is-active" : ""}
              onClick={() => jumpTo(index)}
              aria-label={`Go to ${scene.label}`}
              aria-current={index === 0 ? "step" : undefined}
            >
              <span>{scene.label}</span>
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
