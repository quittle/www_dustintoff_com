# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

load("@io_bazel_rules_sass//sass:sass.bzl",
    "sass_binary",
    "sass_library",
)

sass_library(
    name = "reset_css",
    srcs = [
        "reset.scss",
    ],
)

sass_library(
    name = "sections_css",
    srcs = [
        "sections.scss",
    ],
)

sass_library(
    name = "navbar_css",
    srcs = [
        "nav.scss",
    ],
    deps = [
        ":sections_css",
    ],
)

sass_binary(
    name = "main_css",
    src = "main.scss",
    deps = [
        ":reset_css",
        ":sections_css",
        ":navbar_css",
    ],
    visibility = [ "//visibility:public" ],
)
