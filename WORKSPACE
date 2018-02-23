# Copyright (c) 2016-2018 Dustin Doloff
# Licensed under Apache License v2.0

workspace(name = "www_dustindoloff_com")

git_repository(
    name = "bazel_repository_toolbox",
    remote = "https://github.com/quittle/bazel_repository_toolbox.git",
    commit = "8f9a64e3782908571053daad5fb9053b022d040f",
)

load("@bazel_repository_toolbox//:github_repository.bzl", "github_repository")

github_repository(
    name = "rules_web",
    user = "quittle",
    project = "rules_web",
    commit = "991ac2e94e6ab9b5a26f285a923b8683f6603e71",
    sha256 = "12d51d372436fdf2acee3983d7cc51e817526c9ba0bb1a068b0ef41067204ae7",
)

load("@rules_web//:rules_web_repositories.bzl", "rules_web_repositories")
rules_web_repositories()

load("@bazel_toolbox//:bazel_toolbox_repositories.bzl", "bazel_toolbox_repositories")
bazel_toolbox_repositories()

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")
sass_repositories()