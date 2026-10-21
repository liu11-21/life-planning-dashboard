/* Damped height-field ripples. Decorative canvases never receive input or touch plan data. */
(() => {
  const controls = "button, .file-menu-trigger, .advanced-settings > summary, .cashflow-details > summary, .model-scope-panel > summary";
  const cards = ".topbar, .mission-panel, .panel-section, .planning-panel, .policy-panel, .gap-table-panel, .chart-panel, .metric, .age-snapshot, .protection-item, .scope-grid article, .age-item, .edit-modal-dialog";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const reducedTransparency = matchMedia("(prefers-reduced-transparency: reduce)");
  const finePointer = matchMedia("(any-hover: hover) and (any-pointer: fine)");
  const forcedColors = matchMedia("(forced-colors: active)");
  const pools = new Map();
  const fixedStep = 1000 / 60;
  const flatSpecular = Math.pow(0.922, 64);
  let frame = null;
  let previousTime = 0;
  let accumulator = 0;
  let lastRender = 0;

  function closest(target, selector) {
    return target instanceof Element ? target.closest(selector) : null;
  }

  function controlAt(target) {
    const control = closest(target, controls);
    return control && !control.matches(":disabled, [aria-disabled='true']") ? control : null;
  }

  function enabled() {
    return !reducedMotion.matches && !reducedTransparency.matches && !forcedColors.matches && !document.hidden;
  }

  class RippleSurface {
    constructor(element) {
      this.element = element;
      this.compact = element.matches(controls) && !element.matches(".age-item");
      this.canvas = document.createElement("canvas");
      this.canvas.className = "liquid-water";
      this.canvas.setAttribute("aria-hidden", "true");
      this.context = this.canvas.getContext("2d");
      this.texture = document.createElement("canvas");
      this.textureContext = this.texture.getContext("2d");
      this.width = 0;
      this.height = 0;
      this.energy = 0;
      this.lastDisturbance = 0;
      this.point = null;
      this.light = null;
      this.hovered = false;
      this.resize();
      if (this.context && this.textureContext) element.append(this.canvas);
    }

    resize() {
      const width = this.element.clientWidth;
      const height = this.element.clientHeight;
      if (!width || !height || (width === this.width && height === this.height)) return;
      this.width = width;
      this.height = height;
      // Fine cells on controls; bounded work on large or tall planning panels.
      const cell = Math.max(this.compact ? 2.5 : 4.5, Math.sqrt(width * height / 26000));
      this.columns = Math.max(6, Math.ceil(width / cell)) + 2;
      this.rows = Math.max(6, Math.ceil(height / cell)) + 2;
      const count = this.columns * this.rows;
      this.current = new Float32Array(count);
      this.previous = new Float32Array(count);
      this.next = new Float32Array(count);
      this.damping = new Float32Array(count);
      const speed = this.compact ? 95 : 150; // CSS pixels per second.
      this.cellX = width / (this.columns - 2);
      this.cellY = height / (this.rows - 2);
      this.coefficientX = Math.min(0.44, Math.pow(speed / 60 / this.cellX, 2));
      this.coefficientY = Math.min(0.44, Math.pow(speed / 60 / this.cellY, 2));
      const absorbingCells = this.compact ? 2 : 6;
      for (let y = 1; y < this.rows - 1; y += 1) {
        for (let x = 1; x < this.columns - 1; x += 1) {
          const edge = Math.min(x - 1, y - 1, this.columns - 2 - x, this.rows - 2 - y);
          // An absorbing margin prevents the card from looking like a vibrating box.
          this.damping[y * this.columns + x] = 0.995 - 0.12 * Math.pow(Math.max(0, 1 - edge / absorbingCells), 2);
        }
      }
      this.texture.width = this.columns - 2;
      this.texture.height = this.rows - 2;
      if (this.textureContext) this.image = this.textureContext.createImageData(this.texture.width, this.texture.height);
      const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(900000 / (width * height)));
      this.canvas.width = Math.max(1, Math.round(width * ratio));
      this.canvas.height = Math.max(1, Math.round(height * ratio));
      this.energy = 0;
      this.point = null;
    }

    local(clientX, clientY) {
      const rect = this.element.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(this.width, clientX - rect.left - this.element.clientLeft)),
        y: Math.max(0, Math.min(this.height, clientY - rect.top - this.element.clientTop))
      };
    }

    disturb(x, y, strength, radius) {
      if (!this.current) return;
      const centerX = x / this.cellX + 1;
      const centerY = y / this.cellY + 1;
      const reachX = Math.ceil(radius * 3 / this.cellX);
      const reachY = Math.ceil(radius * 3 / this.cellY);
      const variance = radius * radius;
      for (let row = Math.max(1, Math.floor(centerY - reachY)); row <= Math.min(this.rows - 2, Math.ceil(centerY + reachY)); row += 1) {
        for (let column = Math.max(1, Math.floor(centerX - reachX)); column <= Math.min(this.columns - 2, Math.ceil(centerX + reachX)); column += 1) {
          const dx = (column - centerX) * this.cellX;
          const dy = (row - centerY) * this.cellY;
          const distance = (dx * dx + dy * dy) / (2 * variance);
          // A small depression with a raised rim displaces approximately equal water volume.
          this.current[row * this.columns + column] -= strength * (1 - distance) * Math.exp(-distance);
        }
      }
      this.energy = Math.max(this.energy, Math.abs(strength));
      this.lastDisturbance = performance.now();
    }

    move(clientX, clientY, now, pressed = false) {
      this.resize();
      if (!this.width || !this.height) return;
      const point = this.local(clientX, clientY);
      this.light = point;
      if (pressed) {
        this.disturb(point.x, point.y, this.compact ? 1.3 : 2.2, this.compact ? 4.5 : 10);
      } else if (!this.point) {
        this.disturb(point.x, point.y, this.compact ? 0.65 : 1.0, this.compact ? 4 : 8);
      } else {
        const dx = point.x - this.point.x;
        const dy = point.y - this.point.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= 2) {
          const speed = distance / Math.max(8, now - this.point.time);
          const strength = Math.min(0.65, 0.12 + speed * 0.14);
          const samples = Math.min(10, Math.ceil(distance / 7));
          for (let sample = 1; sample <= samples; sample += 1) {
            this.disturb(this.point.x + dx * sample / samples, this.point.y + dy * sample / samples,
              strength / Math.sqrt(samples), this.compact ? 3.5 : 7);
          }
        }
      }
      this.point = { ...point, time: now };
      this.updateLight();
    }

    updateLight() {
      if (!this.light) return;
      const { x, y } = this.light;
      this.element.style.setProperty("--water-x", `${(x / this.width * 100).toFixed(1)}%`);
      this.element.style.setProperty("--water-y", `${(y / this.height * 100).toFixed(1)}%`);
      this.element.style.setProperty("--water-angle", `${(Math.atan2(y - this.height / 2, x - this.width / 2) * 180 / Math.PI + 90).toFixed(1)}deg`);
      this.element.style.setProperty("--liquid-x", `${x.toFixed(1)}px`);
      this.element.style.setProperty("--liquid-y", `${y.toFixed(1)}px`);
    }

    step() {
      if (!this.current || this.energy === 0) return;
      const { current, previous, next, columns, rows, damping, coefficientX, coefficientY } = this;
      let maximum = 0;
      for (let y = 1; y < rows - 1; y += 1) {
        for (let x = 1; x < columns - 1; x += 1) {
          const index = y * columns + x;
          const height = current[index];
          // Finite-difference 2D wave equation; coefficients stay inside the CFL stability limit.
          const value = (2 * height - previous[index]
            + coefficientX * (current[index - 1] + current[index + 1] - 2 * height)
            + coefficientY * (current[index - columns] + current[index + columns] - 2 * height)) * damping[index];
          next[index] = value;
          maximum = Math.max(maximum, Math.abs(value), Math.abs(value - height));
        }
      }
      this.previous = current;
      this.current = next;
      this.next = previous;
      this.energy = maximum;
    }

    render() {
      if (!this.context || !this.textureContext || !this.image || !this.current) return;
      const pixels = this.image.data;
      const { current, columns, rows } = this;
      const normalX = 3.4 / this.cellX;
      const normalY = 3.4 / this.cellY;
      let pixel = 0;
      for (let y = 1; y < rows - 1; y += 1) {
        for (let x = 1; x < columns - 1; x += 1) {
          const index = y * columns + x;
          const slopeX = (current[index - 1] - current[index + 1]) * normalX;
          const slopeY = (current[index - columns] - current[index + columns]) * normalY;
          const inverseLength = 1 / Math.sqrt(1 + slopeX * slopeX + slopeY * slopeY);
          const nx = slopeX * inverseLength;
          const ny = slopeY * inverseLength;
          const nz = inverseLength;
          // Reflect a soft area light off the wave normal: light crest, dark trough.
          const specular = Math.pow(Math.max(0, nx * -0.23 + ny * -0.31 + nz * 0.922), 64) - flatSpecular;
          const refraction = nx * -0.45 + ny * -0.6;
          const illumination = refraction * 0.38 + specular * 0.85;
          const highlight = Math.max(0, Math.min(1, specular * 3));
          const alpha = Math.min(0.72, Math.abs(illumination) * 1.3);
          pixels[pixel++] = illumination > 0 ? 153 + highlight * 91 : 3;
          pixels[pixel++] = illumination > 0 ? 190 + highlight * 61 : 9;
          pixels[pixel++] = illumination > 0 ? 217 + highlight * 38 : 17;
          pixels[pixel++] = Math.round(alpha * 255);
        }
      }
      this.textureContext.putImageData(this.image, 0, 0);
      const context = this.context;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(this.texture, 0, 0, this.canvas.width, this.canvas.height);
      this.canvas.style.transform = `translate(${this.element.scrollLeft}px, ${this.element.scrollTop}px)`;
    }

    settle() {
      this.current?.fill(0);
      this.previous?.fill(0);
      this.next?.fill(0);
      this.energy = 0;
      this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    dispose() {
      this.canvas.remove();
      this.element.classList.remove("is-water-active", "is-liquid-hover");
      ["--water-x", "--water-y", "--water-angle", "--liquid-x", "--liquid-y"].forEach((name) => this.element.style.removeProperty(name));
    }
  }

  function ensurePool(element) {
    if (!element) return null;
    if (pools.has(element)) return pools.get(element);
    // Retain a few receding ripples when crossing cards, with a strict resource cap.
    if (pools.size >= 4) {
      const oldest = [...pools.entries()].find(([, pool]) => !pool.hovered);
      if (oldest) {
        oldest[1].dispose();
        pools.delete(oldest[0]);
      }
    }
    const pool = new RippleSurface(element);
    if (!pool.context || !pool.textureContext) return null;
    pools.set(element, pool);
    return pool;
  }

  function setTargets(card, control) {
    pools.forEach((pool, element) => {
      const wasHovered = pool.hovered;
      pool.hovered = element === card || element === control;
      if (!pool.hovered && wasHovered) pool.point = null;
      element.classList.toggle("is-water-active", element === card);
      element.classList.toggle("is-liquid-hover", element === control);
    });
  }

  function wake() {
    if (frame !== null) return;
    previousTime = performance.now();
    accumulator = 0;
    frame = requestAnimationFrame(tick);
  }

  function tick(now) {
    frame = null;
    if (!enabled()) {
      reset();
      return;
    }
    accumulator += Math.min(64, now - previousTime);
    previousTime = now;
    pools.forEach((pool, element) => {
      if (!element.isConnected || !element.getClientRects().length) {
        pool.dispose();
        pools.delete(element);
      } else pool.resize();
    });
    while (accumulator >= fixedStep) {
      pools.forEach((pool) => pool.step());
      accumulator -= fixedStep;
    }
    let moving = false;
    pools.forEach((pool, element) => {
      const age = now - pool.lastDisturbance;
      if (age > 6000 || (age > 1000 && pool.energy < 0.002)) {
        if (pool.energy > 0) pool.settle();
        if (!pool.hovered) {
          pool.dispose();
          pools.delete(element);
        }
      } else if (pool.energy > 0) moving = true;
    });
    if (now - lastRender >= 32) {
      pools.forEach((pool) => pool.render());
      lastRender = now;
    }
    if (moving) frame = requestAnimationFrame(tick);
  }

  function followPointer(event) {
    if (event.pointerType === "touch" || !finePointer.matches || !enabled()) return;
    const card = closest(event.target, cards);
    const control = controlAt(event.target);
    ensurePool(card);
    ensurePool(control);
    setTargets(card, control);
    const now = performance.now();
    const targets = new Set([card, control]);
    targets.forEach((element) => pools.get(element)?.move(event.clientX, event.clientY, now));
    if (card || control) wake();
  }

  document.addEventListener("pointerover", followPointer, { passive: true });
  document.addEventListener("pointermove", followPointer, { passive: true });
  document.addEventListener("pointerout", (event) => {
    setTargets(closest(event.relatedTarget, cards), controlAt(event.relatedTarget));
    // Let the waves finish travelling after the cursor leaves.
    if (pools.size) wake();
  }, { passive: true });
  document.addEventListener("pointerdown", (event) => {
    if (!enabled() || !event.isPrimary || event.button !== 0) return;
    const control = controlAt(event.target);
    const card = closest(event.target, cards);
    new Set([card, control]).forEach((element) => ensurePool(element)?.move(event.clientX, event.clientY, performance.now(), true));
    wake();
  }, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (!enabled() || event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    const control = controlAt(event.target);
    if (!control) return;
    const rect = control.getBoundingClientRect();
    ensurePool(control)?.move(rect.left + rect.width / 2, rect.top + rect.height / 2, performance.now(), true);
    wake();
  });

  function reset() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    pools.forEach((pool) => pool.dispose());
    pools.clear();
  }
  window.addEventListener("blur", reset);
  window.addEventListener("scroll", reset, { passive: true });
  document.addEventListener("visibilitychange", reset);
  [reducedMotion, reducedTransparency, finePointer, forcedColors].forEach((media) => media.addEventListener("change", reset));
})();
