# Copyright (c) 2016, 2018 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//js:js.bzl",
    "closure_compile",
    "minify_js",
)

minify_js(
    name = "all_js",
    srcs = [ ":main_js", "google-analytics.js" ],
    visibility = [ "//visibility:public" ],
)

closure_compile(
    name = "main_js",
    srcs = [ "all.js" ],
    compilation_level = "ADVANCED",
)
