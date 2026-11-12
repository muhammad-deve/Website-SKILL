# Contributing

Prefer a deep useful module over a new label. Before changing guidance, describe the
task it improves, the evidence and the scope where it applies. Keep the user's brief
above house preferences. Do not turn one example's fix into a universal ban.

For a style, use the fields in [the schema](schemas/style.schema.json), add its ID to
[taxonomy](knowledge/taxonomy.json), link verified source IDs and distinguish original
recipes from historical claims. Include mobile, motion, accessibility, failure modes,
tokens and evaluation criteria. A backlog term is not a completed profile.

For a reference, record date, exact inspected states and evidence type in
[the catalog](references/catalog.json). Award claims need a primary source and exact
designation. For third-party incorporation, follow [methodology](research/methodology.md)
and add file-level provenance and notices before copying. No unlicensed assets.

For code, run `npm run check` and `npm test`. Browser/tool changes require
`npm run test:browser`; review new screenshots and negative fixtures. Do not weaken
assertions to obtain green results. For adapters, verify a fresh installation and
that existing user files remain unchanged. Update [progress](docs/PROGRESS.md).

Do not claim measured improvement until the [controlled protocol](evals/protocol.md)
has been run. Include failures, unknowns and reviewer disagreement in results.
