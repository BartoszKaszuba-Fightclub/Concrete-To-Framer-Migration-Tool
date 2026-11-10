# Alt text

Requirement: preserve available image metadata, including alt text, and flag missing essential metadata.

## Root cause

`clip-02.json` already stores alt `Card one image` and warning `alt-missing`. Logo frame `dJ6Pp2dyk` has altText `Site logo`.

Card `XbZefmp80` has one image frame, `slVaJcJoN`. Its `altText` is the string `Card one image`. Instances `lCEbmYv2a` and `xT5lI2ZcH` both render that frame, so card two publishes that string.

`altText` is typed as a string. `null` was rejected (`Expected a string`). `undefined` left the string in place. A variable reference was rejected, and the Alt variable is not an instance control.

Image control `$control__A2BKjHfDF` is a different field. Its value type is `{ src, alt?: string }`. On `lCEbmYv2a` the value is `{ src, alt: "Card one image" }`. On `xT5lI2ZcH` it is the same asset string and has no `alt` key. The optional `alt` does not replace `altText` on the shared frame.

## Smallest change

No native write can omit that shared string on card two while card one keeps it. The requirement stays unmet.

Leave the digest warning. Leave both controls as they are. Leave `slVaJcJoN` altText as `Card one image`. Add one build-report sentence: Card image `slVaJcJoN` stays `Card one image` on both instances because `altText` is one shared string and cannot be omitted.

## Alternatives rejected

`alt=""`. An empty string is a present alt. Card two's attribute is absent.

A code component. Control `A2BKjHfDF` already exists.

`ImageAsset.cloneWithAttributes`. It is not a project API.

Binding `altText` to a variable, or using the Alt variable as a control. The reference was rejected. The control list is image `A2BKjHfDF`, title `B2KDuUS5p`, and body `pNMqKqNCJ`.

A second card component. It copies molecule `sig-001` and leaves the shared string in place. No smaller native write omits that string, so the split is not the change.

## Assumption

The published alt is the node property `altText`. The optional `alt` on the image control is already stored per instance and is a separate field. Card one keeps `Card one image` because `slVaJcJoN` still holds that string.

## After review

Keep this note. The only implement step is the Missing alt line in `Database/pipeline-runs/pass-3/digest/nesting/requirements/1200/default/build-report.md`: Card image `slVaJcJoN` stays `Card one image` on both instances because `altText` is one shared string and cannot be omitted. Leave the digest warning, both controls, and `slVaJcJoN`. The requirement stays unmet. A second card component stays out. A new frame on that copy could avoid the string, and the split is still larger than this failure.
