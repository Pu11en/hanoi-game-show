const journey = document.querySelector('[data-hero-journey]');

if (journey) {
  const stage = journey.querySelector('[data-hero-stage]');
  const scenes = [...journey.querySelectorAll('[data-hero-scene]')];
  const captions = [...journey.querySelectorAll('[data-hero-caption]')];
  const gateway = journey.querySelector('[data-hero-gateway]');
  const sceneButtons = [...journey.querySelectorAll('[data-scene-target]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let activeScene = -1;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const ease = (value) => {
    const x = clamp(value);
    return x * x * (3 - (2 * x));
  };

  function update() {
    frame = 0;
    if (reducedMotion.matches) return;

    const bounds = journey.getBoundingClientRect();
    const distance = Math.max(1, journey.offsetHeight - window.innerHeight);
    const progress = clamp(-bounds.top / distance);
    const position = progress * (scenes.length - 1);
    const base = Math.min(scenes.length - 1, Math.floor(position));
    const blend = ease(position - base);
    const gatewayOpacity = 1 - ease(clamp(position / 0.72));

    journey.style.setProperty('--hero-progress', progress.toFixed(4));
    journey.style.setProperty('--portal-opacity', ease(clamp((progress - 0.945) / 0.055)).toFixed(4));
    journey.style.setProperty('--gateway-opacity', gatewayOpacity.toFixed(4));
    if (gateway) gateway.setAttribute('aria-hidden', String(position > 0.72));

    scenes.forEach((scene, index) => {
      let opacity = 0;
      let scale = 1.035;
      let y = 0;

      if (index === base) {
        opacity = 1;
        scale = 1.035 + (blend * 0.055);
        y = blend * -1.5;
      } else if (index === base + 1) {
        opacity = blend;
        scale = 1.09 - (blend * 0.055);
        y = (1 - blend) * 1.5;
      }

      scene.style.opacity = opacity.toFixed(4);
      scene.style.setProperty('--scene-scale', scale.toFixed(4));
      scene.style.setProperty('--scene-y', `${y.toFixed(3)}%`);
      scene.style.zIndex = String(index);
    });

    captions.forEach((caption) => {
      const captionScene = Number(caption.dataset.captionScene);
      const distanceFromScene = Math.abs(position - captionScene);
      const opacity = 1 - ease(clamp(distanceFromScene / 0.7));
      const offset = clamp(distanceFromScene, 0, 1) * 1.4;
      caption.style.opacity = opacity.toFixed(4);
      caption.style.transform = `translate3d(0, ${offset.toFixed(3)}rem, 0)`;
    });

    const nextActiveScene = Math.min(scenes.length - 1, Math.round(position));
    if (nextActiveScene !== activeScene) {
      activeScene = nextActiveScene;
      stage.dataset.activeScene = String(activeScene);
    }
  }

  function scrollToScene(sceneIndex) {
    const distance = Math.max(1, journey.offsetHeight - window.innerHeight);
    const progress = clamp(sceneIndex / Math.max(1, scenes.length - 1));
    window.scrollTo({
      top: journey.offsetTop + (distance * progress),
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  }

  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  function preloadRemainingScenes() {
    scenes.slice(2).forEach((scene) => {
      const image = scene.querySelector('img');
      if (!image || image.complete) return;
      const preload = new Image();
      preload.decoding = 'async';
      preload.src = image.currentSrc || image.src;
    });
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  reducedMotion.addEventListener('change', requestUpdate);
  window.addEventListener('load', preloadRemainingScenes, { once: true });
  sceneButtons.forEach((button) => {
    button.addEventListener('click', () => {
      button.blur();
      scrollToScene(Number(button.dataset.sceneTarget));
    });
  });
  requestUpdate();
}
