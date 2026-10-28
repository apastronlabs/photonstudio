/**
 * Photon Studio — Lazy Video Loader
 * Uses Intersection Observer to play/pause videos and lazy-load src
 */

export function initLazyVideos() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        // Load src if not loaded
        if (video.dataset.src && !video.src) {
          video.src = video.dataset.src;
          video.load();
        }
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0.1
  });

  // Observe all lazy videos
  document.querySelectorAll('video[data-src]').forEach(video => {
    observer.observe(video);
  });

  return observer;
}
