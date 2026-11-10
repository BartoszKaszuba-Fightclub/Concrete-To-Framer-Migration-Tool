# Image fields, not text URLs

Requirement: map images to the correct components and Framer image fields, rather than storing them as text URLs.

## Root cause

Pass 1 already has the bytes. `assets.json` and the digests store `usablePath` as a local path (`Database/pipeline-runs/pass-1/digest/nesting/requirements/1200/default/assets/pixel.png`, status `value`) and `originalUrl` as `file:///…/tests/extractor/fixtures/pixel.png`. The `img` nodes `n-000003`, `n-000022`, and `n-000026` point at those records with `assetIds`. Their text is empty.

`.cursor/SKILLS/BUILDER.md` puts `usablePath` on the same layer list as visible text, then says to draw each local `usablePath`. It does not say to upload the file or to set a Framer image on a frame. A path in that list is a text layer. Pass 1 never opened Framer, so no image was created (`docs/pipeline-runs/pass-1-summary.md`). The stored path is what an upload needs. The missing instruction is the failure.

## Smallest change

Replace “draw each local `usablePath`” in `BUILDER.md` with one rule: upload that local file with `create_upload_url` on the Framer MCP the builder already uses (`framer` in `.cursor/mcp.json`), and set the returned asset as the image on a frame in the organism for that `img` node. Do not put the path or the `file://` URL in a text layer.

Do not add an image pipeline service.

## Alternatives rejected

A service that uploads assets and rewrites the digest before the build. The builder can upload the file it is already told to place.

Changing `usablePath` so it is no longer a string. The string is the local file.

Calling the gap closed once Framer is opened. The current sentence can still draw the path as text.

## Assumption

The requirement is met when each `img` node’s component has a frame whose image is that uploaded file. Alt text is a separate requirement. `originalUrl` stays the source address.

After review: each local usablePath is uploaded with create_upload_url and set on a frame's image, and the path is not put in a text layer.
