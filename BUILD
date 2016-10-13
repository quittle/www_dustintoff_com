# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//:web.bzl",
    "minify_js",
    "html_page",
    "minify_html",
    "favicon_image_generator",
    "minify_ttf",
    "ttf_to_woff",
    "ttf_to_woff2",
    "ttf_to_eot",
    "font_generator",
    "zip_site",
    "minify_site_zip",
    "rename_zip_paths",
    "zip_server",
    "deploy_site_zip_s3_script",
)

load("@io_bazel_rules_sass//sass:sass.bzl",
    "sass_binary",
    "sass_library",
)

favicon_sizes = [ 16, 32 ]
favicon_images = [ "favicon/{}.png".format(size) for size in favicon_sizes ]

sass_library(
    name = "reset_css",
    srcs = [
        "resources/reset.scss",
    ],
)

sass_library(
    name = "navbar_css",
    srcs = [
        "resources/nav.scss",
    ],
)

sass_binary(
    name = "main_css",
    src = "resources/main.scss",
    deps = [
        ":reset_css",
        ":navbar_css",
    ]
)

minify_js(
    name = "all_js",
    srcs = [ "resources/all.js" ],
)

html_page(
    name = "index",
    config = "//:index.json",
    body = "//:index_body.html",
    favicon_images =  favicon_images,
    favicon_sizes = favicon_sizes,
    css_files = [
        ":silkscreen",
        ":main_css",
    ],
    js_files = [ "all_js.min.js" ],
    deps = [ ":favicon" ]
)

minify_html(
    name = "index_min",
    src = ":index",
)

favicon_image_generator(
    name = "favicon",
    output_files = favicon_images,
    output_sizes = favicon_sizes,
    image = "//:favicon-32x32.png",
)

minify_ttf(
    name = "silkscreen_ttf",
    ttf = "resources/slkscr-webfont.ttf",
)

ttf_to_woff(
    name = "silkscreen_woff",
    ttf = ":silkscreen_ttf",
)

ttf_to_woff2(
    name = "silkscreen_woff2",
    ttf = ":silkscreen_ttf",
)

ttf_to_eot(
    name = "silkscreen_eot",
    ttf = ":silkscreen_ttf",
)

font_generator(
    name = "silkscreen",
    font_name = "silkscreen",
    ttf = ":silkscreen_ttf",
    woff = ":silkscreen_woff",
    eot = ":silkscreen_eot",
)

zip_site(
    name = "www_dustindoloff_com",
    html_pages = [ ":index_min" ],
    resources = [
        ":main_css",
        ":all_js",
        ":favicon",
        ":silkscreen",
        ":silkscreen_ttf",
        ":silkscreen_woff",
        ":silkscreen_eot",
    ],
    out_zip = "www_dustindoloff_com.zip",
)

minify_site_zip(
    name = "www_dustindoloff_com_zip",
    site_zip = ":www_dustindoloff_com",
    root_files = [ ":index_min" ],
    minified_zip = "www_dustindoloff_com.min.zip",
)

rename_zip_paths(
    name = "rename_index_www_dustindoloff_com_zip",
    source_zip = ":www_dustindoloff_com_zip",
    path_map_labels_in = [ ":index_min" ],
    path_map_labels_out = [ "index.html" ],
    out_zip = "www_dustindoloff_com_final.zip",
)

zip_server(
    name = "www_dustindoloff_com_zip_server",
    zip = ":rename_index_www_dustindoloff_com_zip",
    port = 8080,
)

# BUG: Script does not run correctly due to Bazel limitation of not being able to run a target from
# within another target.
deploy_site_zip_s3_script(
    name = "deploy_test_dustindoloff_com",
    aws_access_key = "fake key",
    aws_secret_key = "fake secret",
    bucket = "test.dustindoloff.com",
    zip = ":rename_index_www_dustindoloff_com_zip",
)
