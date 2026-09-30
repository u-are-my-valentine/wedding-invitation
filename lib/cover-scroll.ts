export function setupCoverScroll() {
  const invitation = document.getElementById("invitation");
  if (!invitation) return;

  let advancing = false;
  let coverGesture = false;
  let startX = 0;
  let startY = 0;

  function advance() {
    if (advancing || invitation!.getBoundingClientRect().top <= 2) return;
    advancing = true;
    invitation!.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  function onScroll() {
    if (advancing && Math.abs(invitation!.getBoundingClientRect().top) < 2) advancing = false;
  }

  function onWheel(event: WheelEvent) {
    if (event.ctrlKey || (!advancing && window.scrollY > 2)) return;
    event.preventDefault();
    if (event.deltaY > 0 && Math.abs(event.deltaY) > Math.abs(event.deltaX)) advance();
  }

  function onTouchStart(event: TouchEvent) {
    coverGesture = event.touches.length === 1 && (window.scrollY <= 2 || advancing);
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
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("touchcancel", onTouchEnd, { passive: true });
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", onTouchEnd);
  };
}
