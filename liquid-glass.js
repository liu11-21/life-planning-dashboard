/* Decorative layers are separate from planning data and all input handlers. */
(() => {
  const controls = "button, .file-menu-trigger, .advanced-settings > summary, .cashflow-details > summary, .model-scope-panel > summary";
  const surfaces = ".topbar, .mission-panel, .panel-section, .planning-panel, .policy-panel, .gap-table-panel, .chart-panel, .metric, .age-snapshot, .protection-item, .scope-grid article, .age-item, .edit-modal-dialog";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)");
  const finePointer = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
  const forcedColors = window.matchMedia("(forced-colors: active)");
  const waves = new Map();
  const water = document.createElement("canvas");
  water.className = "liquid-water";
  water.setAttribute("aria-hidden", "true");
  const context = water.getContext("2d");
  let hovered = null;
  let surface = null;
  let pointer = null;
  let frame = null;
  let lastPaint = 0;
  let lastStir = 0;
  let waterWidth = 0;
  let waterHeight = 0;
  let waterRatio = 0;
  let flowX = 0;
  let flowY = 0;
  let lastX = 0;
  let lastY = 0;

  function controlAt(target) {
    const control = target instanceof Element ? target.closest(controls) : null;
    return control && !control.matches(":disabled, [aria-disabled='true']") ? control : null;
  }

  function surfaceAt(target) {
    return target instanceof Element ? target.closest(surfaces) : null;
  }

  function effectsEnabled() {
    return !reducedMotion.matches && !reducedTransparency.matches && !forcedColors.matches && !document.hidden;
  }

  function positionLight(control, clientX, clientY) {
    const rect = control.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    control.style.setProperty("--liquid-x", `${x.toFixed(1)}px`);
    control.style.setProperty("--liquid-y", `${y.toFixed(1)}px`);
    control.style.setProperty("--liquid-drift-x", `${((x / Math.max(1, rect.width) - 0.5) * 18).toFixed(1)}px`);
    control.style.setProperty("--liquid-drift-y", `${((y / Math.max(1, rect.height) - 0.5) * 12).toFixed(1)}px`);
    return { x, y, rect };
  }

  function clearHover() {
    if (hovered) {
      hovered.classList.remove("is-liquid-hover");
      ["--liquid-x", "--liquid-y", "--liquid-drift-x", "--liquid-drift-y"].forEach((name) => hovered.style.removeProperty(name));
    }
    hovered = null;
  }

  function setSurface(next) {
    if (surface === next) return;
    if (surface) {
      surface.classList.remove("is-water-active");
      ["--water-x", "--water-y", "--water-angle"].forEach((name) => surface.style.removeProperty(name));
    }
    water.remove();
    surface = next;
    if (!surface || !context) return;
    surface.classList.add("is-water-active");
    surface.append(water);
    const rect = surface.getBoundingClientRect();
    flowX = pointer ? pointer.x - rect.left : rect.width / 2;
    flowY = pointer ? pointer.y - rect.top : rect.height / 2;
    waterWidth = 0;
  }

  function ripple(control, clientX, clientY, pressed = false) {
    if (!effectsEnabled() || typeof control.animate !== "function") return;
    waves.get(control)?.cancel();
    if (waves.size >= 8) waves.values().next().value.cancel();
    const { x, y, rect } = positionLight(control, clientX, clientY);
    const size = Math.max(48, Math.hypot(rect.width, rect.height) * 2);
    const wave = document.createElement("span");
    wave.className = "liquid-ripple";
    wave.setAttribute("aria-hidden", "true");
    Object.assign(wave.style, { width: `${size}px`, height: `${size}px`, left: `${x}px`, top: `${y}px` });
    control.append(wave);
    const animation = wave.animate([
      { opacity: 0, transform: "translate(-50%, -50%) rotate(-24deg) scale(0.03)", borderRadius: "36% 64% 60% 40%" },
      { opacity: 1, offset: 0.14, transform: "translate(-50%, -50%) rotate(-10deg) scale(0.2)", borderRadius: "60% 40% 34% 66%" },
      { opacity: 0.85, offset: 0.48, transform: "translate(-50%, -50%) rotate(12deg) scale(0.58)", borderRadius: "38% 62% 65% 35%" },
      { opacity: 0, transform: "translate(-50%, -50%) rotate(28deg) scale(1)", borderRadius: "50%" }
    ], { duration: pressed ? 1050 : 1450, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" });
    waves.set(control, animation);
    const cleanup = () => {
      wave.remove();
      if (waves.get(control) === animation) waves.delete(control);
    };
    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
  }

  function paintWater(now, elapsed) {
    if (!surface || !context || !pointer) return;
    const rect = surface.getBoundingClientRect();
    water.style.transform = `translate(${surface.scrollLeft}px, ${surface.scrollTop}px)`;
    const width = surface.clientWidth;
    const height = surface.clientHeight;
    if (!width || !height) return;
    // One canvas, at most 30 fps, and a bounded backing store even for long panels.
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1200000 / (width * height)));
    if (width !== waterWidth || height !== waterHeight || Math.abs(ratio - waterRatio) > 0.01) {
      water.width = Math.max(1, Math.round(width * ratio));
      water.height = Math.max(1, Math.round(height * ratio));
      waterWidth = width;
      waterHeight = height;
      waterRatio = ratio;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    const targetX = Math.max(0, Math.min(width, pointer.x - rect.left));
    const targetY = Math.max(0, Math.min(height, pointer.y - rect.top));
    const follow = 1 - Math.exp(-elapsed / 115);
    flowX += (targetX - flowX) * follow;
    flowY += (targetY - flowY) * follow;
    surface.style.setProperty("--water-x", `${(flowX / width * 100).toFixed(1)}%`);
    surface.style.setProperty("--water-y", `${(flowY / height * 100).toFixed(1)}%`);
    surface.style.setProperty("--water-angle", `${(Math.atan2(flowY - height / 2, flowX - width / 2) * 180 / Math.PI + 90).toFixed(1)}deg`);
    const dark = document.body.classList.contains("theme-dark");
    const time = now / 1000;
    const radius = Math.min(420, Math.max(160, Math.min(width, height) * 0.8));
    const glow = context.createRadialGradient(flowX, flowY, 0, flowX, flowY, radius);
    glow.addColorStop(0, dark ? "rgba(79,183,235,0.34)" : "rgba(80,185,222,0.24)");
    glow.addColorStop(0.5, dark ? "rgba(93,153,222,0.14)" : "rgba(155,200,248,0.16)");
    glow.addColorStop(1, "rgba(116,193,235,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    // Deform rounded cells to draw moving caustics, with a cursor-driven current.
    const spacing = 100;
    const minX = Math.max(-spacing, flowX - radius - spacing);
    const maxX = Math.min(width + spacing, flowX + radius + spacing);
    const minY = Math.max(-spacing, flowY - radius - spacing);
    const maxY = Math.min(height + spacing, flowY + radius + spacing);
    function node(i, j) {
      let x = i * spacing + Math.sin(j * 1.8 + i * 0.7 + time * 0.8) * 32 + Math.cos(j * 2.3 - time * 0.55) * 15;
      let y = j * spacing + Math.cos(i * 1.6 + j * 0.9 - time * 0.65) * 31 + Math.sin(i * 2.4 + time * 0.6) * 16;
      const dx = x - flowX;
      const dy = y - flowY;
      const distance = Math.hypot(dx, dy);
      const influence = Math.exp(-distance / radius * 2);
      const wave = Math.sin(distance * 0.035 - time * 2.8) * 12 * influence;
      x += (targetX - flowX) * influence * 0.65 + dx / Math.max(1, distance) * wave;
      y += (targetY - flowY) * influence * 0.65 + dy / Math.max(1, distance) * wave;
      return { x, y };
    }
    context.save();
    // A soft radial mask keeps the water local to the pointer on large panels.
    const path = new Path2D();
    for (let j = Math.floor(minY / spacing); j <= Math.ceil(maxY / spacing); j += 1) {
      for (let i = Math.floor(minX / spacing); i <= Math.ceil(maxX / spacing); i += 1) {
        const points = [node(i, j), node(i + 1, j), node(i + 1, j + 1), node(i, j + 1)];
        path.moveTo((points[3].x + points[0].x) / 2, (points[3].y + points[0].y) / 2);
        for (let k = 0; k < 4; k += 1) {
          const p = points[k];
          const next = points[(k + 1) % 4];
          path.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
        }
        path.closePath();
      }
    }
    const edge = context.createRadialGradient(flowX, flowY, 8, flowX, flowY, radius);
    edge.addColorStop(0, dark ? "rgba(113,209,252,0.65)" : "rgba(54,132,183,0.25)");
    edge.addColorStop(0.65, dark ? "rgba(113,209,252,0.24)" : "rgba(75,152,197,0.1)");
    edge.addColorStop(1, "rgba(75,152,197,0)");
    context.strokeStyle = edge;
    context.lineWidth = 7;
    context.stroke(path);
    const light = context.createRadialGradient(flowX - 5, flowY - 5, 0, flowX, flowY, radius);
    light.addColorStop(0, dark ? "rgba(218,246,255,0.9)" : "rgba(255,255,255,0.98)");
    light.addColorStop(0.55, "rgba(255,255,255,0.52)");
    light.addColorStop(1, "rgba(255,255,255,0)");
    context.translate(-1.5, -2);
    context.strokeStyle = light;
    context.lineWidth = 2;
    context.stroke(path);
    context.restore();
  }

  function tick(now) {
    frame = null;
    if (!effectsEnabled() || (surface && !surface.isConnected)) {
      resetEffects();
      return;
    }
    const elapsed = now - lastPaint;
    if (elapsed >= 32 && pointer) {
      if (hovered?.isConnected) positionLight(hovered, pointer.x, pointer.y);
      paintWater(now, Math.min(80, elapsed));
      lastPaint = now;
    }
    if (surface) frame = requestAnimationFrame(tick);
  }

  function followPointer(event) {
    if (event.pointerType === "touch" || !finePointer.matches || !effectsEnabled()) return;
    pointer = { x: event.clientX, y: event.clientY };
    const next = controlAt(event.target);
    if (next !== hovered) {
      clearHover();
      hovered = next;
      if (hovered) {
        hovered.classList.add("is-liquid-hover");
        ripple(hovered, pointer.x, pointer.y);
        lastStir = performance.now();
        lastX = pointer.x;
        lastY = pointer.y;
      }
    }
    setSurface(surfaceAt(event.target));
    const now = performance.now();
    if (hovered && now - lastStir > 280 && Math.hypot(pointer.x - lastX, pointer.y - lastY) > 24) {
      ripple(hovered, pointer.x, pointer.y);
      lastStir = now;
      lastX = pointer.x;
      lastY = pointer.y;
    }
    if ((hovered || surface) && frame === null) frame = requestAnimationFrame(tick);
  }

  document.addEventListener("pointerover", followPointer, { passive: true });
  document.addEventListener("pointermove", followPointer, { passive: true });
  document.addEventListener("pointerout", (event) => {
    if (hovered && controlAt(event.relatedTarget) !== hovered) clearHover();
    if (surface && surfaceAt(event.relatedTarget) !== surface) setSurface(null);
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
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    clearHover();
    setSurface(null);
    pointer = null;
    waves.forEach((animation) => animation.cancel());
    waves.clear();
  }
  window.addEventListener("blur", resetEffects);
  window.addEventListener("scroll", resetEffects, { passive: true });
  document.addEventListener("visibilitychange", resetEffects);
  [reducedMotion, reducedTransparency, finePointer, forcedColors].forEach((media) => media.addEventListener("change", resetEffects));
})();
