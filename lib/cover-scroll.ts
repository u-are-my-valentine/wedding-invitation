export function setupCoverScroll() {
  const invitation = document.getElementById("invitation");
  const cover = document.querySelector<HTMLElement>(".cover");
  if (!invitation || !cover) return;

  let advancing = false;
  let advanceTimeout: ReturnType<typeof setTimeout> | undefined;
  let coverGesture = false;
  let startX = 0;
  let startY = 0;

  function advance() {
    if (advancing || invitation!.getBoundingClientRect().top <= 2) return;
    advancing = true;
    clearTimeout(advanceTimeout);
    advanceTimeout = setTimeout(() => { advancing = false; }, 1500);
    invitation!.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  function onScroll() {
    if (advancing && Math.abs(invitation!.getBoundingClientRect().top) < 2) advancing = false;
  }

  function onWheel(event: WheelEvent) {
    if (event.ctrlKey || window.scrollY > 2) return;
    event.preventDefault();
    if (event.deltaY > 0 && Math.abs(event.deltaY) > Math.abs(event.deltaX)) advance();
  }

  function onTouchStart(event: TouchEvent) {
    coverGesture = event.touches.length === 1 && window.scrollY <= 2;
    if (!coverGesture) return;
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }

  function onTouchMove(event: TouchEvent) {
    if (!coverGesture || event.touches.length !== 1) return;
    event.preventDefault();
    const dy = startY - event.touches[0].clientY;
    const dx = startX - event.touches[0].clientX;
    if (dy > 20 && dy > Math.abs(dx)) advance();
  }

  function onTouchEnd() { coverGesture = false; }

  window.addEventListener("scroll", onScroll, { passive: true });
  cover.addEventListener("wheel", onWheel, { passive: false });
  cover.addEventListener("touchstart", onTouchStart, { passive: true });
  cover.addEventListener("touchmove", onTouchMove, { passive: false });
  cover.addEventListener("touchend", onTouchEnd, { passive: true });
  cover.addEventListener("touchcancel", onTouchEnd, { passive: true });
  return () => {
    clearTimeout(advanceTimeout);
    window.removeEventListener("scroll", onScroll);
    cover.removeEventListener("wheel", onWheel);
    cover.removeEventListener("touchstart", onTouchStart);
    cover.removeEventListener("touchmove", onTouchMove);
    cover.removeEventListener("touchend", onTouchEnd);
    cover.removeEventListener("touchcancel", onTouchEnd);
  };
}
