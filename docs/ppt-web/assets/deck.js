(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const bar = document.querySelector('[data-progress]');
  const counter = document.querySelector('[data-counter]');
  const title = document.querySelector('[data-title]');
  const total = slides.length;
  let index = 0;
  let timer = null;

  function render() {
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    const ratio = ((index + 1) / total) * 100;
    if (bar) bar.style.width = `${ratio}%`;
    if (counter) counter.textContent = `${index + 1} / ${total}`;
    if (title) title.textContent = slides[index]?.dataset?.title || '';
  }

  function go(i) {
    index = Math.max(0, Math.min(total - 1, i));
    render();
  }

  function next() { go(index + 1); }
  function prev() { go(index - 1); }

  function toggleAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
      return;
    }
    timer = setInterval(() => {
      if (index >= total - 1) {
        clearInterval(timer);
        timer = null;
        return;
      }
      next();
    }, 4500);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  document.querySelector('[data-prev]')?.addEventListener('click', prev);
  document.querySelector('[data-next]')?.addEventListener('click', next);
  document.querySelector('[data-auto]')?.addEventListener('click', toggleAuto);
  document.querySelector('[data-full]')?.addEventListener('click', toggleFullscreen);

  window.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown'].includes(e.key)) next();
    if (['ArrowLeft', 'PageUp'].includes(e.key)) prev();
    if (e.key === 'Home') go(0);
    if (e.key === 'End') go(total - 1);
    if (e.key === ' ') { e.preventDefault(); next(); }
    if (e.key.toLowerCase() === 'f') toggleFullscreen();
    if (e.key.toLowerCase() === 'a') toggleAuto();
  });

  render();
})();
