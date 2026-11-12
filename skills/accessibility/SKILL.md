---
name: accessibility
description: "Check or repair website semantics, keyboard behavior, contrast and responsive accessibility."
---

# Accessibility

Use [accessibility guidance](../../knowledge/accessibility/checks.md). Start with the
primary task and native semantics. Evaluate keyboard order, visible unobscured focus,
labels, errors, announcements and reflow alongside visual presentation.

Run the repository browser auditor or the host project's existing axe integration.
Read violations and incomplete/manual-review results. A zero-violation scan is not
a WCAG conformance claim. Test dynamic states explicitly; the initial DOM is not
the entire interface. Review color over imagery and custom widgets manually.

Distinguish WCAG requirements from ergonomic recommendations. 44px is a useful
touch-target aim; WCAG 2.2 AA target-size rules have a 24px minimum with exceptions.
Do not substitute a blanket pixel rule for the actual criterion.

When implementation is authorized, fix the underlying semantics or behavior and
rerun affected checks. Never suppress an issue only to obtain a green report.
