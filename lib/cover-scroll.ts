export function setupCoverScroll() {
  const invitation = document.getElementById("invitation");
  if (!invitation) return;

  let armed = window.scrollY < 8;
  let touching = false;
  let downward = false;
  let timer = 0;
  let previousY = window.scrollY;

  function settle() {
    window.clearTimeout(timer);
    if (!armed || touching || !downward || window.scrollY < 24) return;
    timer = window.setTimeout(() => {
      const targetY = invitation!.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY >= targetY) {
        armed = false;
        return;
      }
      armed = false;
      invitation!.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    }, 100);
  }

  function onScroll() {
    const y = window.scrollY;
    if (y < 8) armed = true;
    downward = y > previousY;
    if (downward) settle();
    else window.clearTimeout(timer);
    previousY = y;
  }
  function onTouchStart() { touching = true; window.clearTimeout(timer); }
  function onTouchEnd() { touching = false; settle(); }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("touchcancel", onTouchEnd, { passive: true });
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", onTouchEnd);
  };
}
