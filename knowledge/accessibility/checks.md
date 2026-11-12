# Accessibility checks

[WCAG 2.2](https://www.w3.org/TR/WCAG22/) is the normative reference. Brief essentials:
normal text generally needs 4.5:1 contrast; qualifying large text 3:1. Relevant UI
boundaries and graphics need 3:1 under the applicable non-text criterion. WCAG 2.2
AA target size is 24×24 CSS pixels with exceptions, including spacing; 44×44 is an
ergonomic aim and the enhanced criterion, not the universal AA minimum. Reflow,
keyboard use, visible focus, focus not being entirely obscured, and accessible names
must be assessed in context. Consult the exact criterion and exceptions before
claiming a pass or failure.

## Manual task pass

1. Use Tab, Shift+Tab, Enter, Space, Escape and widget-appropriate arrow keys.
2. Check order, visible focus, menu/dialog focus return and unobscured focused items.
3. Read labels and errors with assistive technology where available; record the
   software and actual task. Never infer screen-reader success from DOM structure.
4. Test zoom, text enlargement/spacing, long labels and narrow viewport reflow.
5. Exercise empty, invalid, loading and success states. Announcements should be useful
   without making the entire interface an endlessly updating live region.
6. Check imagery, status information without color, and motion alternatives.

The automated runner scans the current rendered state with axe at WCAG A/AA tags
through 2.2. Incomplete checks require review. Automation finds a subset of issues;
it does not replace inclusive testing or certify conformance. See
[Playwright's guidance](https://playwright.dev/docs/accessibility-testing).
