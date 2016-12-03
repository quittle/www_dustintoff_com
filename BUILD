# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//html:html.bzl",
    "html_page",
    "minify_html",
)

load("@rules_web//images:images.bzl",
    "favicon_image_generator",
    "minify_png",
)

load("@rules_web//site_zip:site_zip.bzl",
    "generate_zip_server_python_file",
    "minify_site_zip",
    "rename_zip_paths",
    "zip_server",
    "zip_site",
)

load("@rules_web//deploy:deploy.bzl",
    "deploy_site_zip_s3_script",
)

favicon_sizes = set([
    # Powers of 2
    16, 32, 64, 128, 256,
    # Old iOS home screen
    57,
    # IE 11 tile
    70, 15, 310,
    # iPad home screen
    76,
    # Google TV
    96,
    # iOS retina touch
    120,
    # Chrome Web Store
    128,
    # IE 10 Metro tile
    144,
    # Apple touch
    152,
    # iPhone 6 Plus
    180,
    # Chrome for Android
    196,
    # Opera Coast
    228,
    # Medium Windows 8 Start Screen
    270,
    # Because it's the largest size I have
    310,
])
favicon_images = [ "favicon/{size}.png".format(size = size) for size in favicon_sizes ]

html_page(
    name = "index",
    config = "//:index.json",
    body = "//:index_body.html",
    favicon_images = favicon_images,
    favicon_sizes = favicon_sizes,
    css_files = [
        "//resources/fonts:silkscreen",
        "//resources/style:main_css",
    ],
    js_files = [
        "//resources/scripts:all_js",
    ],
)

minify_html(
    name = "index_min",
    src = ":index",
)

minify_png(
    name = "min_favicon",
    png = ":favicon.png",
)

favicon_image_generator(
    name = "favicon",
    output_files = favicon_images,
    output_sizes = favicon_sizes,
    image = ":min_favicon",
)

zip_site(
    name = "www_dustindoloff_com",
    root_files = [
        ":min_favicon",
        ":index_min",
        "//projects/fallingsand:min_fallingsand_html",
    ],
    out_zip = "www_dustindoloff_com.zip",
)

minify_site_zip(
    name = "www_dustindoloff_com_zip",
    site_zip = ":www_dustindoloff_com",
    root_files = [
        ":min_favicon",
        ":index_min",
        "//projects/fallingsand:min_fallingsand_html",
    ],
    minified_zip = "www_dustindoloff_com.min.zip",
)

rename_zip_paths(
    name = "rename_index_www_dustindoloff_com_zip",
    source_zip = ":www_dustindoloff_com_zip",
    path_map_labels_in = [
        ":min_favicon", ":index_min", "//projects/fallingsand:min_fallingsand_html",
    ],
    path_map_labels_out = [
        "favicon.png", "index.html", "projects/fallingsand",
    ],
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
    zip_file = ":rename_index_www_dustindoloff_com_zip",
)
