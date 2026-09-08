import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { normalizeSegmentFiles } from "./normalize-static-export.mjs";

test("Windows nested segments resolve to the same URLs as Linux exports", async () => {
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "lab-export-"));
  try {
    const route = path.join(output, "notes", "example");
    const nested = path.join(route, "__next.notes", "$d$slug");
    await fs.mkdir(nested, { recursive: true });
    await fs.writeFile(
      path.join(nested, "__PAGE__.txt"),
      "dynamic route payload",
    );
    await fs.writeFile(path.join(route, "__next._tree.txt"), "existing tree");
    await fs.writeFile(path.join(route, "index.html"), "page html");
    await normalizeSegmentFiles(output);
    assert.equal(
      await fs.readFile(
        path.join(route, "__next.notes.$d$slug.__PAGE__.txt"),
        "utf8",
      ),
      "dynamic route payload",
    );
    assert.equal(
      await fs.readFile(path.join(route, "__next._tree.txt"), "utf8"),
      "existing tree",
    );
    assert.equal(
      await fs.readFile(path.join(route, "index.html"), "utf8"),
      "page html",
    );
    // Running again is safe, and already-flat Linux output is left alone.
    await normalizeSegmentFiles(output);
    assert.equal(
      await fs.readFile(path.join(nested, "__PAGE__.txt"), "utf8"),
      "dynamic route payload",
    );
  } finally {
    const resolved = await fs.realpath(output);
    assert.equal(path.dirname(resolved), await fs.realpath(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith("lab-export-"));
    await fs.rm(resolved, { recursive: true, force: true });
  }
});
