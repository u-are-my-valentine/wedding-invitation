export function setupCoverScroll() {
  const invitation = document.getElementById("invitation");
  const cover = document.querySelector<HTMLElement>(".cover");
  if (!invitation || !cover) return;

  let advancing = false;
  let advanceTimeout: ReturnType<typeof setTimeout> | undefined;
  let targetY = 0;
  let coverGesture = false;
  let startX = 0;
  let startY = 0;

  function finishAdvance() {
    advancing = false;
    clearTimeout(advanceTimeout);
    window.removeEventListener("scroll", onScroll);
  }

  function advance() {
    if (advancing) return;
    const distance = invitation!.getBoundingClientRect().top;
    if (distance <= 2) return;
    targetY = window.scrollY + distance;
    advancing = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    advanceTimeout = setTimeout(finishAdvance, 1500);
    invitation!.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  function onScroll() {
    if (window.scrollY >= targetY - 2) finishAdvance();
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

  cover.addEventListener("wheel", onWheel, { passive: false });
  cover.addEventListener("touchstart", onTouchStart, { passive: true });
  cover.addEventListener("touchmove", onTouchMove, { passive: false });
  cover.addEventListener("touchend", onTouchEnd, { passive: true });
  cover.addEventListener("touchcancel", onTouchEnd, { passive: true });
  return () => {
    finishAdvance();
    cover.removeEventListener("wheel", onWheel);
    cover.removeEventListener("touchstart", onTouchStart);
    cover.removeEventListener("touchmove", onTouchMove);
    cover.removeEventListener("touchend", onTouchEnd);
    cover.removeEventListener("touchcancel", onTouchEnd);
  };
}
