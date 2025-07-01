(function () {
  const overlayId = 'image-zoom-overlay';

  function removeOverlay() {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  }

  document.addEventListener('click', function (e) {
    const overlay = document.getElementById(overlayId);

    if (overlay) {
      // If overlay is open, clicking anywhere on it closes it
      if (e.target === overlay || overlay.contains(e.target)) {
        removeOverlay();
      }
      return;
    }

    if (window.App && window.App.simulationLoaded) return;

    const img = e.target.closest('img');
    if (!img) return;
    if (img.closest('a, button, #ballfall-ui, #spawner-container')) return;
    if (img.dataset.nozoom !== undefined) return;

    const ov = document.createElement('div');
    ov.id = overlayId;
    ov.style.position = 'fixed';
    ov.style.top = '0';
    ov.style.left = '0';
    ov.style.width = '100%';
    ov.style.height = '100%';
    ov.style.background = 'rgba(0,0,0,0.8)';
    ov.style.backdropFilter = 'blur(5px)';
    ov.style.display = 'flex';
    ov.style.alignItems = 'center';
    ov.style.justifyContent = 'center';
    ov.style.zIndex = '10000';
    ov.style.cursor = 'zoom-out';

    const big = document.createElement('img');
    big.src = img.src;
    big.style.maxWidth = '90%';
    big.style.maxHeight = '90%';
    big.style.objectFit = 'contain';
    ov.appendChild(big);

    ov.addEventListener('click', removeOverlay);

    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
  });
})();
