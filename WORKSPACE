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
    commit = "44b8994b90dd8d5c16aa8f3a766d86e51d050036",
    sha256 = "d3e9fa0eb312b91f3295c545eb34a667f5526e79ba9725ec6000fee5c1f8cad8",
)

load("@rules_web//:rules_web_repositories.bzl", "rules_web_repositories")
rules_web_repositories()

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")
sass_repositories()
