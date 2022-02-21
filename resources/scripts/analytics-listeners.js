/**
 * Initializer for the analytics listeners code.
 */
function alInit() {
  // Register event listeners
  window.addEventListener("hashchange", alOnHashChange);
  initializeLinkListeners();
}

/**
 * Attaches Google Analytics listeners to all links
 */
function initializeLinkListeners() {
  var links = document.querySelectorAll("a");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function onLinkClick(e) {
      ga("send", "event", "link", "click", e.currentTarget.href);
    });
  }
}

/**
 * Handler for the `window.onHashChangeEvent`
 * @param {!Event=} opt_e The event
 * @return {boolean} If true, stops the event from being further processed
 */
function alOnHashChange(opt_e) {
  /** @type {string} */ const section = location.hash.substring(1);
  ga("set", "page", section);
  ga("send", "pageview");

  return false;
}

alInit();
