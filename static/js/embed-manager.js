// Automatically loads the most visible iframe with class "lazy-iframe"
// and unloads others to save resources.
document.addEventListener("DOMContentLoaded", () => {
  const frames = Array.from(document.querySelectorAll("iframe.lazy-iframe"));
  if (frames.length === 0) return;

  const placeholder = "/images/embed-placeholder.png";

  const showPlaceholder = (f) => {
    const p = f.parentElement;
    p.style.backgroundImage = `url('${placeholder}')`;
    p.style.backgroundPosition = "center";
    p.style.backgroundRepeat = "no-repeat";
    p.style.backgroundSize = "cover";
    f.style.display = "none";
  };

  const hidePlaceholder = (f) => {
    const p = f.parentElement;
    p.style.backgroundImage = "none";
    f.style.display = "block";
  };

  const load = (f) => {
    if (f.src !== f.dataset.src) f.src = f.dataset.src;
    hidePlaceholder(f);
  };
  const unload = (f) => {
    if (f.src !== "about:blank") f.src = "about:blank";
    showPlaceholder(f);
  };

  frames.forEach((f) => {
    f.dataset.ratio = "0";
    unload(f);
  });

  if (frames.length === 1) {
    load(frames[0]);
    return;
  }

  let active = null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const iframe = entry.target.querySelector("iframe.lazy-iframe");
        iframe.dataset.ratio = entry.intersectionRatio.toString();
      });
      let most = frames[0];
      for (const f of frames) {
        if (parseFloat(f.dataset.ratio) > parseFloat(most.dataset.ratio)) {
          most = f;
        }
      }
      if (most !== active) {
        frames.forEach((f) => {
          if (f === most) {
            load(f);
          } else {
            unload(f);
          }
        });
        active = most;
      }
    },
    { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
  );

  frames.forEach((f) => observer.observe(f.parentElement));
});
