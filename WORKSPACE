# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

workspace(name = "www_dustindoloff_com")

git_repository(
    name = "rules_web",
    commit = "db1390f5bc266863b1074385a78035e31bbb0713",
    remote = "https://github.com/quittle/rules_web.git",
)

load("@rules_web//:rules_web_repositories.bzl", "rules_web_repositories")
rules_web_repositories()

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")
sass_repositories()
