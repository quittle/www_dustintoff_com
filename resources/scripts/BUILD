# Copyright (c) 2016, 2018 Dustin Doloff
# Licensed under Apache License v2.0

load(
    "@rules_web//js:js.bzl",
    "closure_compile",
)

closure_compile(
    name = "all_js",
    srcs = [
        "google-analytics.js",
        ":main_js",
    ],
    compilation_level = "WHITESPACE_ONLY",
    visibility = ["//visibility:public"],
)

closure_compile(
    name = "main_js",
    srcs = [
        "all.js",
        "analytics-listeners.js"
    ],
    externs = [
        "google-analytics-externs.js"
    ],
    compilation_level = "ADVANCED",
)
