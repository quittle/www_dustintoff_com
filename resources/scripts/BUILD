# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//js:js.bzl",
    "closure_compile",
)

closure_compile(
    name = "all_js",
    srcs = [ "all.js" ],
    compilation_level = "ADVANCED",
    visibility = [ "//visibility:public" ],
)
