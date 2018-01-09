# Copyright (c) 2016-2018 Dustin Doloff
# Licensed under Apache License v2.0

workspace(name = "www_dustindoloff_com")

git_repository(
    name = "bazel_repository_toolbox",
    remote = "https://github.com/quittle/bazel_repository_toolbox.git",
    commit = "dfffafc08ec40df1b5ef1fbe0fbe77e643f6c672",
)

load("@bazel_repository_toolbox//:github_repository.bzl", "github_repository")

github_repository(
    name = "rules_web",
    user = "quittle",
    project = "rules_web",
    commit = "31419479468fa7512def8edb78ea2519d7a6df5e",
    sha256 = "70766687916873ecd0c0afcfb8083ac5980ce07ac7aa749bf02c68f948ae6668",
)

load("@rules_web//:rules_web_repositories.bzl", "rules_web_repositories")
rules_web_repositories()

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")
sass_repositories()
