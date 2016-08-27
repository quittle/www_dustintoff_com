# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//:web.bzl", "minify_css", "minify_js", "html_page", "build_html_page", "favicon_image_generator")

minify_css(
    name = "all_css",
    srcs = [ "resources/all.css" ]
)

minify_js(
    name = "all_js",
    srcs = [ "resources/all.js" ]
)

#html_page(
#    name = "index",
#    config = "//:index.json",
#    favicon = ":favicon",
#)

#favicon_image_generator(
#    name = "favicon",
#    image = "//:favicon-32x32.png"
#)

build_html_page(name = "index",
    html_page_args = {
        "config": "//:index.json",
        "body": "//:index_body.html",
    },
    favicon_image_generator_args = {
        "image": "//:favicon-32x32.png",
    }
)