# Research and evidence method

Record URL, date, scope, version where available, and one of these evidence levels:

| Level | What it supports | What it cannot establish |
| --- | --- | --- |
| source-inspection | Instructions, algorithms and declared integrations present in inspected files | Successful execution or better output |
| document-inspection | Published guidance or textual content at a source | Computed styles, animation, mobile behavior |
| rendered-observation | Visible layout at recorded viewport and time | Complete usability or real-user performance |
| measurement | Named check, tool/version, configuration and actual result | Beauty or all accessibility requirements |
| opinion | An author's or community member's judgment | Causality or general prevalence |
| hypothesis | Proposed explanation or design recipe | A research finding |
| unavailable | Attempted source could not be meaningfully inspected | Any claim about its contents |

For repositories, read README, license, entrypoint and at least one relevant
implementation/supporting file where available. Record sampled scope honestly.
Pin commit and file paths. Do not execute downloaded commands during research.

For sites, capture desktop and mobile, inspect navigation, and record exactly which
states were exercised. Analyze hierarchy before naming fonts or pixel values. Only
record computed styles if obtained from the browser. Keep third-party screenshots
local and ignored unless redistribution is explicitly permitted. Source availability
and the current live page are not evidence of the historical awarded version.

For awards, record organization, exact designation, year and primary award URL.
An archive listing can verify membership in that archive; do not infer an individual
grand prize when multiple distinctions are mixed. Gallery inclusion is not an award.

For empirical claims, record the comparison design, confounders and missing evidence.
For community findings, separate personal workflow reports and self-promotion from
controlled studies. Do not turn anecdotal success into a promised outcome.

## Incorporation

The initial release contains no copied third-party files. Before adding one, create
an `incorporated` record in [provenance.json](provenance.json): local path, source ID,
upstream file URL and revision, SPDX license (or exact terms), copyright notice path,
modifications, and verification date. Preserve required notices and test the file.
Dependencies are separately pinned in the npm lockfile and retain their own licenses.
