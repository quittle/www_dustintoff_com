# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

load(
    "@io_bazel_rules_sass//:defs.bzl",
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
    sourcemap = False,
    visibility = ["//visibility:public"],
    deps = [
        ":navbar_css",
        ":reset_css",
        ":sections_css",
    ],
)
