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
    "resource_map",
)

html_page(
    name = "commentube_html",
    body = "index.html",
    config = "html_config.json",
    js_files = [
        ":js/dQuery.js",
    ],
    deferred_js_files = [
        ":js/helper.js",
        ":js/main.js",
    ],
    css_files = ["css/main.css",]
)

html_page(
    name = "commentube_help_html",
    body = "help.html",
    config = "html_config.json",
)

minify_html(
    name = "min_commentube",
    src = ":commentube_html",
    visibility = [ "//visibility:public" ],
)

minify_html(
    name = "min_commentube_help",
    src = ":commentube_help_html",
    visibility = [ "//visibility:public" ],
)

filegroup(
    name = "commentube",
    srcs = [
        "min_commentube",
        "min_commentube_help",
    ],
    visibility = [ "//visibility:public" ],
)
