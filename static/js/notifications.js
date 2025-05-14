(function () {
  // Notification style definitions.
  const NOTIFICATION_STYLES = {
    enableLinks: { color: "red", textDecoration: "line-through" },
    disableLinks: { color: "gold", textDecoration: "none" },
    // Updated unaffordable style to include fontSize for flashing.
    unaffordable: { color: "red", fontSize: "20px" },
  };

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
    // Always get fresh original styles
    element._flashOriginalValues = {};
    styleProps.forEach(function (prop) {
      element._flashOriginalValues[prop] =
        element.style[prop] || window.getComputedStyle(element)[prop];
    });

    let count = 0;
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
    document.querySelectorAll("a:not(.bfui-button)").forEach(function (link) {
      flashElementStyle(
        link,
        ["color", "textDecoration"],
        flashValues,
        flashDuration,
        flashTimes
      );
    });
  }

  // Consolidated notification logic for toggling tools.
  // When a tool is enabled (prevMode "none" -> newMode non-"none"),
  // flash using the enableLinks style.
  // When a tool is disabled (prevMode non-"none" -> newMode "none"),
  // flash using the disableLinks style.
  function notifyToggleChange(prevMode, newMode, flashDuration, flashTimes) {
    if (prevMode === "none" && newMode !== "none") {
      flashAllLinks(NOTIFICATION_STYLES.enableLinks, flashDuration, flashTimes);
    } else if (prevMode !== "none" && newMode === "none") {
      flashAllLinks(
        NOTIFICATION_STYLES.disableLinks,
        flashDuration,
        flashTimes
      );
    }
  }

  // New function for unaffordable funds notification.
  // Now checks for coins display visibility and falls back to the global coins display if needed.
  function notifyUnaffordable(flashDuration, flashTimes) {
    let display = document.getElementById("coins-display");
    // If #coins-display is not found or is hidden, use #global-coins-display instead.
    if (!display || display.offsetParent === null) {
      display = document.getElementById("global-coins-display");
    }
    if (display) {
      flashElementStyle(
        display,
        ["color", "fontSize"],
        NOTIFICATION_STYLES.unaffordable,
        flashDuration,
        flashTimes
      );
    }
  }

  // Expose functions to the global scope.
  window.flashElementStyle = flashElementStyle;
  window.flashAllLinks = flashAllLinks;
  window.notifyToggleChange = notifyToggleChange;
  window.notifyUnaffordable = notifyUnaffordable;
})();
