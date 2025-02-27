(function () {
  function flashElementStyle(
    element,
    styleProps,
    flashValues,
    flashDuration,
    flashTimes
  ) {
    // Clear any existing flash
    if (element._flashInterval) {
      clearInterval(element._flashInterval);
      styleProps.forEach(function (prop) {
        element.style[prop] = element._flashOriginalValues
          ? element._flashOriginalValues[prop]
          : "";
      });
      element._flashInterval = null;
    }
    // Save original styles if not already saved
    if (!element._flashOriginalValues) {
      element._flashOriginalValues = {};
      styleProps.forEach(function (prop) {
        element._flashOriginalValues[prop] =
          element.style[prop] || window.getComputedStyle(element)[prop];
      });
    }
    var count = 0;
    element._flashInterval = setInterval(function () {
      count++;
      if (count % 2 === 1) {
        styleProps.forEach(function (prop) {
          element.style[prop] = flashValues[prop];
        });
      } else {
        styleProps.forEach(function (prop) {
          element.style[prop] = element._flashOriginalValues[prop];
        });
      }
      if (count >= flashTimes) {
        clearInterval(element._flashInterval);
        element._flashInterval = null;
        styleProps.forEach(function (prop) {
          element.style[prop] = element._flashOriginalValues[prop];
        });
        element._flashOriginalValues = null;
      }
    }, flashDuration);
  }

  function flashAllLinks(flashValues, flashDuration, flashTimes) {
    document.querySelectorAll("a").forEach(function (link) {
      flashElementStyle(
        link,
        ["color", "textDecoration"],
        flashValues,
        flashDuration,
        flashTimes
      );
    });
  }

  window.flashElementStyle = flashElementStyle;
  window.flashAllLinks = flashAllLinks;
})();
