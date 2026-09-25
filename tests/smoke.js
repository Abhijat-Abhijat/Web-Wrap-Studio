// Plain-node smoke test: node tests/smoke.js
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { generateProject, slugify } = require("../src/main/generator");

(async () => {
  assert.strictEqual(slugify("My Cool App!"), "my-cool-app");
  assert.strictEqual(slugify("!!!"), "webwrapped-app");

  const out = fs.mkdtempSync(path.join(os.tmpdir(), "webwrap-smoke-"));
  try {
    const dir = await generateProject({
      url: "https://example.com",
      name: "Smoke App",
      description: "",
      outputDir: out,
      iconDataUrl: null,
    });
    for (const f of ["package.json", "main.js", "preload.js", "webwrap.config.json", "build/icon.png"]) {
      assert.ok(fs.existsSync(path.join(dir, f)), `missing ${f}`);
    }
    for (const f of ["package.json", "webwrap.config.json"]) {
      JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    }
    assert.strictEqual(JSON.parse(fs.readFileSync(path.join(dir, "webwrap.config.json"), "utf8")).url, "https://example.com");
    execFileSync(process.execPath, ["--check", path.join(dir, "main.js")]);
    console.log("smoke: OK");
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error("smoke: FAIL", e);
  process.exit(1);
});
