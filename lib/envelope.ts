export function setupEnvelopeIntro() {
  const envelope = document.querySelector<HTMLElement>("[data-envelope]");
  const button = envelope?.querySelector<HTMLButtonElement>("[data-envelope-open]");
  const main = document.querySelector<HTMLElement>("main.invitation-shell");
  if (!envelope || !button || !main || window.location.hash || window.scrollY > 2) return;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let disposed = false;

  const dismiss = () => {
    envelope.hidden = true;
    main.inert = false;
    document.documentElement.classList.remove("envelope-active");
  };

  const finishOpening = () => {
    dismiss();
    document.getElementById("cover-title")?.focus({ preventScroll: true });
  };

  const open = async () => {
    envelope.classList.add("is-opening");
    if (!motion.matches) {
      const transitions = envelope.getAnimations({ subtree: true });
      await Promise.allSettled(transitions.map(transition => transition.finished));
    }
    if (!disposed) finishOpening();
  };

  main.inert = true;
  document.documentElement.classList.add("envelope-active");
  envelope.classList.remove("is-opening");
  envelope.hidden = false;
  button.addEventListener("click", open, { once: true });

  return () => {
    disposed = true;
    button.removeEventListener("click", open);
    dismiss();
  };
}
