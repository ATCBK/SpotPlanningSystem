const slides = Array.from(document.querySelectorAll(".slide"));
let index = 0;

function render() {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}

function next() {
  if (index < slides.length - 1) {
    index += 1;
    render();
  }
}

function prev() {
  if (index > 0) {
    index -= 1;
    render();
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    void document.documentElement.requestFullscreen();
  } else {
    void document.exitFullscreen();
  }
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "PageDown") next();
  if (event.key === "ArrowLeft" || event.key === "PageUp") prev();
  if (event.key.toLowerCase() === "f") toggleFullscreen();
});

render();
