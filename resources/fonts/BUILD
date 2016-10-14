# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//:web.bzl",
    "minify_ttf",
    "ttf_to_woff",
    "ttf_to_woff2",
    "ttf_to_eot",
    "font_generator",
)

minify_ttf(
    name = "silkscreen_ttf",
    ttf = "slkscr-webfont.ttf",
    visibility = [ "//visibility:public" ],
)

ttf_to_woff(
    name = "silkscreen_woff",
    ttf = ":silkscreen_ttf",
    visibility = [ "//visibility:public" ],
)

ttf_to_woff2(
    name = "silkscreen_woff2",
    ttf = ":silkscreen_ttf",
    visibility = [ "//visibility:public" ],
)

ttf_to_eot(
    name = "silkscreen_eot",
    ttf = ":silkscreen_ttf",
    visibility = [ "//visibility:public" ],
)

font_generator(
    name = "silkscreen",
    font_name = "silkscreen",
    ttf = ":silkscreen_ttf",
    woff = ":silkscreen_woff",
    eot = ":silkscreen_eot",
    visibility = [ "//visibility:public" ],
)