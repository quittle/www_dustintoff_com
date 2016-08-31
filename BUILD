# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//:web.bzl",
    "minify_css",
    "minify_js",
    "html_page",
    "favicon_image_generator",
)

favicon_sizes = [ 16, 32 ]
favicon_images = [ "favicon/{}.png".format(size) for size in favicon_sizes ]

minify_css(
    name = "all_css",
    srcs = [ "resources/all.css" ]
)

minify_js(
    name = "all_js",
    srcs = [ "resources/all.js" ]
)

html_page(
    name = "index",
    config = "//:index.json",
    body = "//:index_body.html",
    favicon_images =  favicon_images, #[ "favicon/32.png" ], #[ ":favicon2/{}".format(image) for image in favicon_images ],
    favicon_sizes = favicon_sizes,
    deps = [":favicon2"]
)

favicon_image_generator(
    name = "favicon2",
    output_files = favicon_images,
    output_sizes = favicon_sizes,
    image = "//:favicon-32x32.png",
)
