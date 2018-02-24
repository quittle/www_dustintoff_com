// Copyright (c) 2016, 2018 Dustin Doloff
// Licensed under Apache License v2.0

/**
 * Checks if the device is mobile
 * @return {boolean} True if the device is mobile or false if it isn't
 */
function isMobile() {
    return window.matchMedia && window.matchMedia('(max-width: 799px)').matches;
}

/**
 * Initialization function
 */
function init() {
    onHashChange();

    // Register event listeners
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('load', onHashChange);
    window.addEventListener('load', init);
}

/**
 * Handler for the `window.onHashChangeEvent`
 * @param {!Event=} opt_e The event
 * @return {boolean} If true, stops the event from being further processed
 */
function onHashChange(opt_e) {
    if (isMobile()) {
        /** @type {string} */ const section = location.hash.substring(1);
        if (section) {
            let sectionElement = document.getElementById(section + '_');
            let offset = 0;
            do {
                offset += parseInt(sectionElement.offsetTop, 10);
                sectionElement = sectionElement.parentNode;
            } while (sectionElement && sectionElement.offsetTop);
            /** @type {number} */ const navHeight = parseInt(
                    window.getComputedStyle(document.querySelector('nav'))
                            .getPropertyValue('height'),
                    10);
            window.scrollBy(0, offset + navHeight - document.body.scrollTop);
        }
    }

    return true;
}

init();
