export function setupGallery() {
  const section = document.getElementById("gallery");
  const frame = section?.querySelector<HTMLElement>(".gallery-frame");
  const strip = section?.querySelector<HTMLElement>(".gallery-strip");
  const counter = section?.querySelector(".gallery-position span");
  const back = section?.querySelector<HTMLButtonElement>(".gallery-back");
  if (!section || !frame || !strip || !counter || !back) return;

  const picks = Array.from(strip.querySelectorAll<HTMLButtonElement>(".gallery-pick"));
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const current = () => Math.max(0, Math.min(picks.length - 1, Math.round(strip.scrollLeft / strip.clientWidth)));
  const showCount = (index: number) => { counter.textContent = String(index + 1).padStart(2, "0"); };

  picks.forEach((pick, index) => pick.addEventListener("click", () => {
    frame.dataset.single = "";
    strip.scrollTo({ left: index * strip.clientWidth, behavior: "instant" });
    showCount(index);
    frame.scrollIntoView({ block: "nearest", behavior: "instant" });
    strip.focus({ preventScroll: true });
  }, options));
  strip.addEventListener("scroll", () => {
    if (frame.hasAttribute("data-single")) showCount(current());
  }, options);
  section.querySelectorAll<HTMLButtonElement>(".gallery-step").forEach(button => {
    button.addEventListener("click", () => {
      const target = current() + Number(button.dataset.direction);
      const next = (target + picks.length) % picks.length;
      const instant = target !== next || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      strip.scrollTo({ left: next * strip.clientWidth, behavior: instant ? "instant" : "smooth" });
    }, options);
  });
  back.addEventListener("click", () => {
    const pick = picks[current()];
    delete frame.dataset.single;
    pick.focus({ preventScroll: true });
    pick.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, options);
  return () => controller.abort();
}
