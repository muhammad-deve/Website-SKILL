# Motion recipes

Start with purpose and frequency. A filter update is feedback; an item moving between
lists can explain continuity; a campaign sequence can establish mood. None implies
that every element needs an entrance. Treat timings as starting hypotheses.

| Situation | Initial recipe | Verify |
| --- | --- | --- |
| Button feedback | 100–160ms color or small transform | Focus and pressed state remain clear |
| Panel opening | 160–240ms opacity and short translation from its origin | Rapid toggle and focus placement |
| Reordered item | Interruptible position transition | Track identity without blocking input |
| Narrative chapter | Deliberate scene transition, duration set by content | Static alternative and user-controlled progress |

Prefer animating transform and opacity when they achieve the result; layout/paint
cost varies with properties and context. Profile actual behavior before claiming
smoothness or a frame-rate improvement. Use will-change sparingly and clean it up.
See [browser rendering guidance](https://web.dev/articles/animations-guide).

```css
.action { transition: background-color 140ms ease-out, transform 140ms ease-out; }
.action:active { transform: translateY(1px); }
@media (prefers-reduced-motion: reduce) {
  .action { transition: none; }
  .action:active { transform: none; }
}
```

This original snippet is an interaction example, not a universal motion system.
Reduced motion should remove unnecessary spatial motion while keeping state changes
understandable. Test normal and reduced preferences. Still screenshots cannot reveal
timing, interruption or flashing; inspect the running behavior.
