# Design decisions that survive implementation

These are original working heuristics, not universal aesthetic laws. Source-linked
technical facts are separated from recipes. Start from the user task and chosen style.

## Typography

Use real content specimens: a long headline, a paragraph, an error, navigation,
currency and dates. Define role, size, weight, line-height and measure before adding
families. A starting reading measure of 55–75ch and line-height near 1.5 is a design
hypothesis; assess the actual script and font. Heading scale should reflect hierarchy,
not grow mechanically until the hero displaces all useful information.

Check letterforms, punctuation, numerals, language coverage and fallback metrics.
Use `font-variant-numeric: tabular-nums` where figures must align. Fluid type can use
`clamp(2rem, 1rem + 4vw, 5rem)`; test both extremes and enlarged text. Avoid fixed
height text containers. Do not apply tight display tracking to small text.

Variable fonts expose only the axes provided by that font. Optical sizing can alter
details for different sizes; use `font-optical-sizing: auto` when supported by the
chosen font. See [MDN variable fonts](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Fonts/Variable_fonts).
Font availability is not a license. Keep asset provenance, host files only when
allowed, and check layout before and after font load. Support bidirectional text
and use logical properties rather than assuming English left-to-right alignment.

## Composition and perception

Proximity groups related content; alignment makes comparisons easier; contrast
creates order. These are tools, not a rule that all pages need one layout. Sketch
the content priority before choosing columns. Similar items may deserve similar
cards. A long article usually needs reading rhythm, not a collection of panels.

Assign spacing to relationships: control internals, related items, groups, sections.
Start with a short scale and document meaningful exceptions. A visually equal gap
is sometimes optically different because images, caps and curves have different
weight. Check rendered alignment rather than relying on numerical equality alone.

F- and Z-shaped scanning are context-dependent descriptions, not mandatory grids.
Content length, script, task and device change scanning. Use a clear entry point,
supporting proof and next action; test whether someone can find them. Avoid changing
DOM reading order merely to achieve a desktop collage. Use `minmax(0,1fr)`, wrapping
and content-driven breakpoints; do not hide page overflow to make a test pass.

## Color and tokens

Name semantic pairs: page/text, surface/text, accent/on-accent, selected/selected-text,
error/error-text. Surface, border, hover and focus have different jobs. A brand hue
does not automatically work as both a background and small text.

OKLCH provides lightness, chroma and hue controls, useful for systematic palettes.
Values may lie outside the display gamut; inspect the rendered result and retain
fallbacks appropriate to target browsers. Lightness values alone do not certify
contrast. See [MDN OKLCH](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch).
The token utility measures only opaque sRGB pairs. Transparent layers, images,
gradients, blending and actual font sizes require browser review.

Define dark-theme pairs independently; inversion usually damages semantic emphasis.
Encode status with text or shape as well as color. Gradients, glows and texture can
express a brand; judge their effect on reading, focus and performance rather than
prohibiting them by name.

## Components and state

Choose the simplest semantic control for the task. A link navigates; a button acts.
Every visible affordance must do what it promises. For a new component record:
default, hover, focus, pressed/selected, disabled, loading, empty, error and success,
including which states do not apply. Do not create fake states just to fill a matrix.

Forms need persistent labels and recoverable errors. Preserve entered values after
failure. Tables need meaningful headers and units; filters need selected state and a
clear route back to all results. Dialogs require focus management and dismissal.
Navigation must reveal location and work without hover. Chart titles, timeframes,
units and a data alternative matter more than decorative animation.

Copy states what will happen. Empty states explain the next useful action. Product
proof should demonstrate the actual workflow. Mark fictional examples as such;
never fabricate adoption, reviews, security claims or measured improvement.

## Visual assets

Choose subject, crop, focal point, light and placement together. Reserve image space
with intrinsic dimensions or aspect ratio. Test crops on small screens. Captions can
be essential context. Decorative imagery should not masquerade as product evidence.
Use an established icon family where available and align perceived weight, not just
bounding boxes. AI imagery can support a fictional visual world; it should not imply
real product photography or documented events without clear context.

## Production and performance

Keep framework choice subordinate to the existing project and interaction needs.
Use semantic tokens in components and avoid competing local overrides. Inspect
installed versions before using library-specific syntax. Build the production output
when measuring performance; development tooling changes loading and execution.

Core Web Vitals address loading, responsiveness and visual stability through LCP,
INP and CLS. Google's good thresholds are LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the
75th percentile of field visits. A local navigation timing or Lighthouse run is not
that field distribution. See [Web Vitals](https://web.dev/articles/vitals).
Our initial browser auditor deliberately reports performance as not measured.

Inspect loading, broken assets, long content, cross-browser behavior and reduced
motion. Regression images need matching browser, fonts, viewport, theme and data.
Never turn a pixel-diff threshold into a beauty score.
