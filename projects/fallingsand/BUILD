# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//html:html.bzl",
    "html_page",
    "minify_html",
)

load("@rules_web//images:images.bzl",
    "minify_png",
)

load("@rules_web//js:js.bzl",
    "closure_compile",
)

minify_png(
    name = "droplet_png",
    png = "Grow/images/droplet.png",
)

minify_png(
    name = "fire_png",
    png = "Grow/images/fire.png",
)

minify_png(
    name = "gen_png",
    png = "Grow/images/gen.png",
)

minify_png(
    name = "growth_png",
    png = "Grow/images/growth.png",
)

minify_png(
    name = "steam_png",
    png = "Grow/images/steam.png",
)

minify_png(
    name = "wall_png",
    png = "Grow/images/wall.png",
)

closure_compile(
    name = "fallingsand_js",
    srcs = [
        "grow.js",
    ],
    compilation_level = "ADVANCED",
    warning_level = "QUIET",
    extra_args = [ "--jscomp_off", "checkVars" ],
)

filegroup(
    name = "worlds",
    srcs = [
        "Grow/boring.grw",
        "Grow/world3.grw",
        "Grow/world4.grw",
    ],
)

html_page(
    name = "fallingsand_html",
    body = "index.html",
    config = "index_config.json",
    deferred_js_files = [
        ":fallingsand_js",
        #":grow.js",
    ],
    deps = [
        ":droplet_png",
        ":fire_png",
        ":gen_png",
        ":growth_png",
        ":steam_png",
        ":wall_png",
        ":worlds",
    ],
)

minify_html(
    name = "min_fallingsand_html",
    src = ":fallingsand_html",
    visibility = [ "//visibility:public" ],
)
