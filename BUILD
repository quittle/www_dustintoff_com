# Copyright (c) 2016-2017 Dustin Doloff
# Licensed under Apache License v2.0

load(
    "@rules_web//html:html.bzl",
    "html_page",
    "minify_html",
)
load(
    "@rules_web//images:images.bzl",
    "favicon_image_generator",
    "minify_png",
)
load(
    "@rules_web//site_zip:site_zip.bzl",
    "rename_zip_paths",
    "zip_server",
    "zip_site",
)
load(
    "@rules_web//deploy:deploy.bzl",
    "deploy_site_zip_s3_script",
)

favicon_sizes = depset([
    # Powers of 2
    16,
    32,
    64,
    128,
    256,
    # Old iOS home screen
    57,
    # IE 11 tile
    70,
    15,
    310,
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

favicon_images = ["favicon/{size}.png".format(size = size) for size in favicon_sizes.to_list()]

html_page(
    name = "index",
    body = "//:index_body.html",
    config = "//:index.json",
    css_files = [
        "//resources/fonts:silkscreen",
        "//resources/style:main_css",
    ],
    deferred_js_files = [
        "//resources/scripts:all_js",
    ],
    favicon_images = favicon_images,
    favicon_sizes = favicon_sizes,
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
    image = ":min_favicon",
    output_files = favicon_images,
    output_sizes = favicon_sizes,
)

zip_site(
    name = "www_dustintoff_com",
    out_zip = "www_dustintoff_com.zip",
    root_files = [
        ":min_favicon",
        ":index_min",
    ],
)

rename_zip_paths(
    name = "rename_index_www_dustintoff_com_zip",
    path_map = {
        ":min_favicon": "favicon.png",
        ":index_min": "index.html",
    },
    source_zip = ":www_dustintoff_com",
)

alias(
    name = "final_www_dustintoff_com_zip",
    actual = ":rename_index_www_dustintoff_com_zip",
)

zip_server(
    name = "zip_server",
    port = 8080,
    zip = ":final_www_dustintoff_com_zip",
)

[
    deploy_site_zip_s3_script(
        name = "deploy_{site}".format(site = bucket),
        bucket = bucket,
        zip_file = ":final_www_dustintoff_com_zip",
    )
    for bucket in [
        "test.dustintoff.com",
        "www.dustintoff.com",
    ]
]
