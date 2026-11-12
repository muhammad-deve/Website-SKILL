import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

export async function compare(before, after, output, maxRatio = 0) {
  if (!Number.isFinite(maxRatio) || maxRatio < 0 || maxRatio > 1)
    throw new Error("Allowed changed ratio must be 0..1");
  if ([before, after].some((p) => path.resolve(p) === path.resolve(output)))
    throw new Error("Diff output must not overwrite an input");
  const a = PNG.sync.read(await fs.readFile(before));
  const b = PNG.sync.read(await fs.readFile(after));
  if (a.width !== b.width || a.height !== b.height)
    throw new Error(
      "Dimensions differ; capture at the same viewport and content state.",
    );
  const diff = new PNG({ width: a.width, height: a.height });
  const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
    threshold: 0.1,
  });
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, PNG.sync.write(diff));
  const ratio = changed / (a.width * a.height);
  return {
    changed_pixels: changed,
    ratio,
    max_ratio: maxRatio,
    passed: ratio <= maxRatio,
    interpretation:
      "Pixel change only. Does not determine design quality. Match browser, fonts, data and viewport.",
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    const [before, after, output, limit = "0"] = process.argv.slice(2);
    if (!before || !after || !output)
      throw new Error(
        "Usage: node tools/compare.mjs before.png after.png diff.png [max-changed-ratio]",
      );
    const result = await compare(before, after, output, Number(limit));
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.passed ? 0 : 1;
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
