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
    commit = "4787f2f8788f2acdbe033646d802352c5790d893",
    project = "rules_web",
    sha256 = "953f63b02cb9f4ebaf98f8c07c95f8e57055f0b12dce68892492daed4e4c77c1",
    user = "quittle",
)

load("@rules_web//:rules_web_deps_1.bzl", "rules_web_dependencies")

rules_web_dependencies()

load("@rules_web//:rules_web_deps_2.bzl", "rules_web_dependencies")

rules_web_dependencies()

load("@rules_web//:rules_web_deps_3.bzl", "rules_web_dependencies")

rules_web_dependencies()
