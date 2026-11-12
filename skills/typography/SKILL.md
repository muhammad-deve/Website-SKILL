---
name: typography
description: "Resolve website typography choices, hierarchy, readability, fluid sizing and font-loading issues."
---

# Typography

Use real headings, body copy, numbers and the required languages as specimens.
Select roles before font families: display, reading, navigation, data and feedback.
Prefer improving metrics and hierarchy before adding another family.

Read the typography section of [foundations](../../knowledge/foundations/design-decisions.md).
Test line breaks at narrow and wide widths, the longest realistic label, enlarged
text, and fallback fonts. Set a useful body measure and explicit line-height.
Use tabular figures for comparison; keep proportional figures where reading matters.

Variable font axes and optical sizing depend on the actual font. Verify supported
axes and license; don't invent a font's metrics or download rights. Reserve large
tracking adjustments for display text. Do not universally ban familiar fonts,
serifs, uppercase or italics: assess readability and the selected style.

Record any font dependency and fallback. Render after fonts are ready, and check
the fallback state separately if layout shift is a concern. Type that is elegant
in a screenshot may fail on translated strings or a different operating system.
