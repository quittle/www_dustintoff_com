var main;

function onHashChange(b) {
    var a = location.hash.substring(1);
    b.preventDefault();
    b.stopPropagation();
    return true
}

function init() {
    main = document.getElementsByTagName("main")[0]
}
window.addEventListener("hashchange", onHashChange, true);
window.addEventListener("load", init);
window.addEventListener("load", onHashChange);
var nav, main;

function init() {
    nav = document.querySelector("nav");
    main = document.querySelector("main");
    onHashChange()
}

function isMobile() {
    return window.matchMedia && matchMedia("(max-width: 799px)").matches
}

function onHashChange() {
    console.log("hc");
    if (isMobile()) {
        console.log("hc2");
        var c = location.hash.substring(1);
        if (c) {
            var b = document.getElementById(c + "_");
            var a = b.offsetTop;
            var d = parseInt(window.getComputedStyle(document.querySelector("nav")).getPropertyValue(
                "height"));
            window.scrollBy(0, a)
        }
    }
}

function onScroll() {
    return;
    if (isMobile() && nav && main) {
        var a = nav.classList;
        if (pageYOffset > 0) {
            a.add("mobile-scroll");
            var b = getComputedStyle(nav);
            main.style.paddingTop = parseInt(b.getPropertyValue("height")) + parseInt(b.getPropertyValue(
                "padding-top")) + parseInt(b.getPropertyValue("border-bottom")) + "px"
        } else {
            a.remove("mobile-scroll");
            main.style.paddingTop = ""
        }
    }
}
window.addEventListener("hashchange", onHashChange);
window.addEventListener("load", onHashChange);
window.addEventListener("load", init);
window.addEventListener("resize", onScroll);
init();
var scrollEvents = ["scroll", "touchstart", "touchend", "touchcancel", "touchleave", "touchmove"];
for (var i = 0; i < scrollEvents.length; i++) {
    window.addEventListener(scrollEvents[i], onScroll)
};

var nav, main;

function init() {
    nav = document.querySelector("nav");
    main = document.querySelector("main");
    onHashChange()
}

function isMobile() {
    return window.matchMedia && matchMedia("(max-width: 799px)").matches
}

function onHashChange() {
    if (isMobile()) {
        var d = location.hash.substring(1);
        if (d) {
            var c = document.getElementById(d + "_");
            var b = c;
            var a = 0;
            do {
                a += parseInt(b.offsetTop);
                b = b.parentNode
            } while (b && b.offsetTop);
            var e = parseInt(window.getComputedStyle(document.querySelector("nav")).getPropertyValue(
                "height"));
            window.scrollBy(0, a + e - document.body.scrollTop)
        }
    }
}
window.addEventListener("hashchange", onHashChange);
window.addEventListener("load", init);
init();