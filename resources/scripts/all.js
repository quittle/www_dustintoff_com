// Copyright (c) 2016 Dustin Doloff
// Licensed under Apache License v2.0

var nav, main;

/**
 * Checks if the device is mobile
 * @return {boolean} True if the device is mobile or false if it isn't
 */
function isMobile() {
    return window.matchMedia && window.matchMedia('(max-width: 799px)').matches
}

/**
 * Callback for scroll or touch events
 */
function onScrollOrTouch() {
    /*
    if (isMobile() && nav && main) {
        var a = nav.classList;
        if (pageYOffset > 0) {
            a.add('mobile-scroll');
            var b = getComputedStyle(nav);
            main.style.paddingTop = parseInt(b.getPropertyValue('height')) + parseInt(b.getPropertyValue(
                'padding-top')) + parseInt(b.getPropertyValue('border-bottom')) + 'px'
        } else {
            a.remove('mobile-scroll');
            main.style.paddingTop = ''
        }
    }
    */
}

/**
 * Initialization function
 */
function init() {
    nav = document.querySelector('nav');
    main = document.querySelector('main');
    onHashChange()

    // Register event listeners
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('load', onHashChange);
    window.addEventListener('load', init);
    window.addEventListener('resize', onScrollOrTouch);

    const scrollEvents = ['scroll', 'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove'];
    for (let i = 0; i < scrollEvents.length; i++) {
        window.addEventListener(scrollEvents[i], onScrollOrTouch)
    };
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
                sectionElement = sectionElement.parentNode
            } while (sectionElement && sectionElement.offsetTop);
            /** @type {number} */ const navHeight = parseInt(
                    window.getComputedStyle(document.querySelector('nav'))
                            .getPropertyValue('height'),
                    10);
            window.scrollBy(0, offset + navHeight - document.body.scrollTop)
        }
    }

    return true;
}

init();
