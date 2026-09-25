// Plain-node generator test: node tests/gen.js
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { generateProject, normalizeOptions } = require("../src/main/generator");

// defaults
const d = normalizeOptions(undefined);
assert.deepStrictEqual(d.window, { width: 1200, height: 800, frameless: false, alwaysOnTop: false, rememberPosition: true });
assert.deepStrictEqual(d.tray, { enabled: false, minimizeToTray: false });
assert.strictEqual(d.startOnLogin, false);
assert.strictEqual(d.injectCss, "");
assert.strictEqual(d.injectJs, "");
assert.strictEqual(d.userAgent, "");
assert.deepStrictEqual(d.permissions, { allow: [] });
for (const bad of [null, 5, "x", [], () => 1]) assert.deepStrictEqual(normalizeOptions(bad), d);

// valid values and clamping
const v = normalizeOptions({
  window: { width: 99999, height: 10, frameless: true, alwaysOnTop: true, rememberPosition: false },
  tray: { enabled: true, minimizeToTray: true },
  startOnLogin: true,
  injectCss: "body{}",
  injectJs: "1+1",
  userAgent: "UA/1.0",
  permissions: { allow: ["media", "notifications", "media", "root", 5] },
});
assert.strictEqual(v.window.width, 3840);
assert.strictEqual(v.window.height, 240);
assert.strictEqual(v.window.frameless, true);
assert.strictEqual(v.window.rememberPosition, false);
assert.deepStrictEqual(v.tray, { enabled: true, minimizeToTray: true });
assert.strictEqual(v.startOnLogin, true);
assert.strictEqual(v.injectCss, "body{}");
assert.strictEqual(v.userAgent, "UA/1.0");
assert.deepStrictEqual(v.permissions.allow, ["notifications", "media"]);
assert.strictEqual(normalizeOptions({ window: { width: 800.7 } }).window.width, 801);

// hostile input
const hostile = JSON.parse(
  '{"__proto__":{"polluted":1},"constructor":{"prototype":{"p2":1}},"evil":"<script>",' +
    '"window":{"__proto__":{"p3":1},"width":"1000","height":{},"frameless":"yes","extra":1},' +
    '"tray":[],"startOnLogin":"true","injectCss":' + JSON.stringify("x".repeat(20001)) +
    ',"injectJs":42,"userAgent":"a\\nb","permissions":{"allow":"media"}}'
);
const h = normalizeOptions(hostile);
assert.strictEqual({}.polluted, undefined);
assert.strictEqual({}.p2, undefined);
assert.strictEqual({}.p3, undefined);
assert.deepStrictEqual(Object.keys(h).sort(), ["injectCss", "injectJs", "permissions", "startOnLogin", "tray", "userAgent", "window"]);
assert.deepStrictEqual(Object.keys(h.window).sort(), ["alwaysOnTop", "frameless", "height", "rememberPosition", "width"]);
assert.strictEqual(h.window.width, 1200);
assert.strictEqual(h.window.height, 800);
assert.strictEqual(h.window.frameless, false);
assert.strictEqual(h.startOnLogin, false);
assert.strictEqual(h.injectCss, "");
assert.strictEqual(h.injectJs, "");
assert.strictEqual(h.userAgent, "");
assert.deepStrictEqual(h.permissions.allow, []);
assert.doesNotThrow(() => normalizeOptions({ get window() { throw new Error("boom"); } }));
const script = normalizeOptions({ injectJs: "</script><script>alert(1)</script>" });
assert.strictEqual(script.injectJs, "</script><script>alert(1)</script>"); // data only; never interpolated into code

(async () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "webwrap-gen-"));
  try {
    const sets = [
      undefined,
      v,
      { tray: { enabled: true }, injectJs: "`${process.exit()}`\n</script>", injectCss: "a{}", userAgent: "x" },
      hostile,
    ];
    for (let i = 0; i < sets.length; i++) {
      const dir = await generateProject({
        url: "https://example.com", name: `Gen ${i}`, description: "", outputDir: out, iconDataUrl: null, options: sets[i],
      });
      for (const f of ["main.js", "preload.js", "offline.html", "webwrap.config.json"]) {
        assert.ok(fs.existsSync(path.join(dir, f)), `missing ${f}`);
      }
      execFileSync(process.execPath, ["--check", path.join(dir, "main.js")]);
      execFileSync(process.execPath, ["--check", path.join(dir, "preload.js")]);
      const cfg = JSON.parse(fs.readFileSync(path.join(dir, "webwrap.config.json"), "utf8"));
      assert.strictEqual(cfg.url, "https://example.com");
      assert.strictEqual(cfg.singleInstance, true);
      assert.strictEqual(cfg.openExternalLinksInBrowser, true);
      assert.ok(cfg.window && cfg.tray && cfg.permissions);
      assert.ok(JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8")).build.files.includes("offline.html"));
      const main = fs.readFileSync(path.join(dir, "main.js"), "utf8");
      assert.ok(!main.includes("alert(1)") && !main.includes("process.exit()"), "user strings leaked into main.js");
      for (const k of ["did-fail-load", "setPermissionRequestHandler", "setPermissionCheckHandler", "setLoginItemSettings", "insertCSS", "executeJavaScript", "window-state.json", "second-instance", "setWindowOpenHandler"]) {
        assert.ok(main.includes(k), `main.js lacks ${k}`);
      }
    }
    console.log("gen: OK");
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error("gen: FAIL", e);
  process.exit(1);
});
