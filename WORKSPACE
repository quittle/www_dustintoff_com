# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

workspace(name = "www_dustindoloff_com")

new_git_repository(
    name = "yui_compressor",
    commit = "b3de528f45966e418d6e3e2f6f8135db4d0be7f1",
    remote = "https://github.com/yui/yuicompressor.git",
    build_file = "third_party/yui/BUILD.yui",
)

new_git_repository(
    name = "jargs",
    commit = "87e0009313e4e508102bb20bd9d736bc71ace30d",
    remote = "https://github.com/purcell/jargs.git",
    build_file = "third_party/jargs/BUILD.jargs",
)

new_git_repository(
    name = "rhino",
    commit = "d89b519209853d446f2d9014e941a5e7b3867df2", # Release 1.7R2
    remote = "https://github.com/mozilla/rhino.git",
    build_file = "third_party/rhino/BUILD.rhino",
)
