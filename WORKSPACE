# Copyright (c) 2016-2018 Dustin Doloff
# Licensed under Apache License v2.0

workspace(name = "www_dustindoloff_com")

load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "bazel_repository_toolbox",
    commit = "f512b37be02d5575d85234c9040b0f4c795a76ef",
    remote = "https://github.com/quittle/bazel_repository_toolbox.git",
)

load("@bazel_repository_toolbox//:github_repository.bzl", "github_repository")

github_repository(
    name = "rules_web",
    commit = "5bf0cf545a1da4a2695118b50d66b49201783c98",
    project = "rules_web",
    sha256 = "5764b5eb64c4c61c8c52ed2a2a68f020f9200d8495ceeb2c720341173fc8b06f",
    user = "quittle",
)

load("@rules_web//:rules_web_deps_1.bzl", "rules_web_dependencies")

rules_web_dependencies()

load("@rules_web//:rules_web_deps_2.bzl", "rules_web_dependencies")

rules_web_dependencies()

load("@rules_web//:rules_web_deps_3.bzl", "rules_web_dependencies")

rules_web_dependencies()
