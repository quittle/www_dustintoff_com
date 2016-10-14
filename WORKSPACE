# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

workspace(name = "www_dustindoloff_com")

git_repository(
    name = "rules_web",
    commit = "1a7a584285f33f6ebc3a46a3eb06b6ee868a8c21",
    remote = "https://github.com/quittle/rules_web.git",
)

load("@rules_web//:rules_web_repositories.bzl", "rules_web_repositories")
rules_web_repositories()

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")
sass_repositories()
