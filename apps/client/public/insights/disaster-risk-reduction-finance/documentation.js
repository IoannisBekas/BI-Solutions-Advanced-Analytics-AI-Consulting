const DOC_NAV_OFFSET_FALLBACK = 24;

(function initDocumentationNavigation() {
  const nav = document.querySelector(".doc-main .section-nav");
  const links = document.querySelectorAll('.doc-main .section-links a[href^="#"]');
  if (!nav || !links.length) return;

  const updateOffset = () => {
    document.documentElement.style.setProperty("--sticky-nav-offset", `${getDocumentationNavOffset(nav)}px`);
  };

  const scrollToHash = (hash, options = {}) => {
    const id = decodeHashId(hash);
    if (!id) return false;
    const target = document.getElementById(id);
    if (!target) return false;
    updateOffset();
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - getDocumentationNavOffset(nav));
    const behavior = options.behavior || "auto";
    window.scrollTo({ top, behavior });
    window.setTimeout(() => {
      updateOffset();
      const correctedTop = Math.max(0, window.scrollY + target.getBoundingClientRect().top - getDocumentationNavOffset(nav));
      if (Math.abs(window.scrollY - correctedTop) > 2) {
        window.scrollTo({ top: correctedTop, behavior: "auto" });
      }
    }, behavior === "smooth" ? 460 : 80);
    return true;
  };

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const id = decodeHashId(hash);
      if (!document.getElementById(id)) return;
      event.preventDefault();
      if (window.location.hash !== hash) history.pushState(null, "", hash);
      scrollToHash(hash, { behavior: "smooth" });
    });
  });

  updateOffset();
  if (window.location.hash) {
    scrollToHash(window.location.hash, { behavior: "auto" });
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToHash(window.location.hash, { behavior: "auto" })));
    window.setTimeout(() => scrollToHash(window.location.hash, { behavior: "auto" }), 160);
  }

  window.addEventListener("hashchange", () => scrollToHash(window.location.hash, { behavior: "auto" }));
  window.addEventListener("resize", debounceDocumentationNav(updateOffset, 120));
})();

function getDocumentationNavOffset(nav) {
  const style = window.getComputedStyle(nav);
  if (style.position !== "sticky") return DOC_NAV_OFFSET_FALLBACK;
  return Math.ceil(nav.getBoundingClientRect().height + 18);
}

function decodeHashId(hash) {
  const raw = String(hash || "").replace(/^#/, "");
  try {
    return decodeURIComponent(raw);
  } catch {
    return "";
  }
}

function debounceDocumentationNav(callback, wait) {
  let timer = null;
  return () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(callback, wait);
  };
}
