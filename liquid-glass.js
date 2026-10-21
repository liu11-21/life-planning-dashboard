/* Decorative only: delegated events also cover controls created by the editors. */
(() => {
  const controls = "button, .file-menu-trigger, .advanced-settings > summary, .cashflow-details > summary, .model-scope-panel > summary";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)");
  const finePointer = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
  const waves = new Map();
  let hovered = null;
  let pointer = null;
  let frame = null;

  function controlAt(target) {
    const control = target instanceof Element ? target.closest(controls) : null;
    return control && !control.matches(":disabled, [aria-disabled='true']") ? control : null;
  }

  function effectsEnabled() {
    return !reducedMotion.matches && !reducedTransparency.matches && !document.hidden;
  }

  function positionLight(control, clientX, clientY) {
    const rect = control.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    control.style.setProperty("--liquid-x", `${x.toFixed(1)}px`);
    control.style.setProperty("--liquid-y", `${y.toFixed(1)}px`);
    control.style.setProperty("--liquid-drift-x", `${((x / Math.max(1, rect.width) - 0.5) * 8).toFixed(1)}px`);
    control.style.setProperty("--liquid-drift-y", `${((y / Math.max(1, rect.height) - 0.5) * 6).toFixed(1)}px`);
    return { x, y, rect };
  }

  function clearHover() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    if (hovered) {
      hovered.classList.remove("is-liquid-hover");
      ["--liquid-x", "--liquid-y", "--liquid-drift-x", "--liquid-drift-y"].forEach((name) => hovered.style.removeProperty(name));
    }
    hovered = null;
    pointer = null;
  }

  function ripple(control, clientX, clientY, pressed = false) {
    if (!effectsEnabled() || typeof control.animate !== "function") return;
    const previous = waves.get(control);
    if (previous) previous.cancel();
    // Keep a quick sweep across many controls from accumulating animations.
    if (waves.size >= 8) waves.values().next().value.cancel();
    const { x, y, rect } = positionLight(control, clientX, clientY);
    const size = Math.max(48, Math.hypot(rect.width, rect.height) * 2);
    const wave = document.createElement("span");
    wave.className = "liquid-ripple";
    wave.setAttribute("aria-hidden", "true");
    wave.style.width = `${size}px`;
    wave.style.height = `${size}px`;
    wave.style.left = `${x}px`;
    wave.style.top = `${y}px`;
    control.append(wave);
    const animation = wave.animate([
      { opacity: 0, transform: "translate(-50%, -50%) rotate(-18deg) scale(0.04)", borderRadius: "42% 58% 58% 42%" },
      { opacity: pressed ? 0.9 : 0.65, offset: 0.16, transform: "translate(-50%, -50%) rotate(-8deg) scale(0.2)", borderRadius: "54% 46% 42% 58%" },
      { opacity: 0.3, offset: 0.58, transform: "translate(-50%, -50%) rotate(8deg) scale(0.65)", borderRadius: "46% 54% 56% 44%" },
      { opacity: 0, transform: "translate(-50%, -50%) rotate(16deg) scale(1)", borderRadius: "50%" }
    ], { duration: pressed ? 820 : 1100, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
    waves.set(control, animation);
    const cleanup = () => {
      wave.remove();
      if (waves.get(control) === animation) waves.delete(control);
    };
    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
  }

  document.addEventListener("pointerover", (event) => {
    if (event.pointerType === "touch" || !finePointer.matches || !effectsEnabled()) return;
    const control = controlAt(event.target);
    if (!control || control === hovered) return;
    clearHover();
    hovered = control;
    control.classList.add("is-liquid-hover");
    ripple(control, event.clientX, event.clientY);
  }, { passive: true });

  document.addEventListener("pointermove", (event) => {
    if (!hovered) return;
    if (!effectsEnabled() || !hovered.isConnected || controlAt(event.target) !== hovered) {
      clearHover();
      return;
    }
    pointer = { x: event.clientX, y: event.clientY };
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      if (hovered && pointer) positionLight(hovered, pointer.x, pointer.y);
    });
  }, { passive: true });

  document.addEventListener("pointerout", (event) => {
    if (hovered && event.target instanceof Node && hovered.contains(event.target)
      && (!(event.relatedTarget instanceof Node) || !hovered.contains(event.relatedTarget))) clearHover();
  }, { passive: true });

  document.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    const control = controlAt(event.target);
    if (control) ripple(control, event.clientX, event.clientY, true);
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    const control = controlAt(event.target);
    if (!control) return;
    const rect = control.getBoundingClientRect();
    ripple(control, rect.left + rect.width / 2, rect.top + rect.height / 2, true);
  });

  function resetEffects() {
    clearHover();
    waves.forEach((animation) => animation.cancel());
    waves.clear();
  }
  window.addEventListener("blur", resetEffects);
  document.addEventListener("visibilitychange", resetEffects);
  reducedMotion.addEventListener("change", resetEffects);
  reducedTransparency.addEventListener("change", resetEffects);
  finePointer.addEventListener("change", resetEffects);
})();
