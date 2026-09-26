// Plain-node smoke test: node tests/smoke.js
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { generateProject, normalizeOptions, slugify } = require("../src/main/generator");

const store = require("../src/main/store");
(() => {
  const l = [1, 2, 3, 4, 5].map((i) => ({ folder: "f" + i }));
  assert.deepStrictEqual(store.addRecent(l, { folder: "f3" }).map((e) => e.folder), ["f3", "f1", "f2", "f4", "f5"]);
  assert.strictEqual(store.addRecent(l, { folder: "new" }).length, 5);
  const red = store.redact("fail https://a.com/x?t=1 at C:\\Users\\bob\\x /home/al/y");
  assert.ok(red.includes("<url>") && !/https?:|bob|home\/al/.test(red), red);
})();

(async () => {
  assert.strictEqual(slugify("My Cool App!"), "my-cool-app");
  assert.strictEqual(slugify("!!!"), "paneshell-app");

  const out = fs.mkdtempSync(path.join(os.tmpdir(), "paneshell-smoke-"));
  try {
    const dir = await generateProject({
      url: "https://example.com",
      name: "Smoke App",
      description: "",
      outputDir: out,
      iconDataUrl: null,
    });
    for (const f of ["package.json", "main.js", "preload.js", "paneshell.config.json", "build/icon.png"]) {
      assert.ok(fs.existsSync(path.join(dir, f)), `missing ${f}`);
    }
    for (const f of ["package.json", "paneshell.config.json"]) {
      JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    }
    assert.strictEqual(JSON.parse(fs.readFileSync(path.join(dir, "paneshell.config.json"), "utf8")).url, "https://example.com");
    execFileSync(process.execPath, ["--check", path.join(dir, "main.js")]);
    const cfg = JSON.parse(fs.readFileSync(path.join(dir, "paneshell.config.json"), "utf8"));
    assert.deepStrictEqual(cfg.window, { width: 1200, height: 800, frameless: false, alwaysOnTop: false, rememberPosition: true });
    assert.deepStrictEqual(cfg.tray, { enabled: false, minimizeToTray: false });
    assert.strictEqual(cfg.startOnLogin, false);
    assert.strictEqual(cfg.injectCss, "");
    assert.strictEqual(cfg.injectJs, "");
    assert.strictEqual(cfg.userAgent, "");
    assert.deepStrictEqual(cfg.permissions, { allow: [] });
    assert.ok(fs.existsSync(path.join(dir, "offline.html")), "missing offline.html");
    const main = fs.readFileSync(path.join(dir, "main.js"), "utf8");
    for (const s of ["did-fail-load", "paneshell:retry", "Tray", "setLoginItemSettings", "insertCSS", "setUserAgent", "setPermissionRequestHandler"]) {
      assert.ok(main.includes(s), `main.js missing ${s}`);
    }
    // Untrusted options are validated
    const n = normalizeOptions({
      window: { width: 99999, height: "x", frameless: "yes", alwaysOnTop: true },
      tray: { enabled: true, minimizeToTray: 1 },
      startOnLogin: true,
      injectCss: "a{}",
      injectJs: 5,
      userAgent: "bad\nua",
      permissions: { allow: ["media", "root", "notifications"] },
    });
    assert.strictEqual(n.window.width, 3840);
    assert.strictEqual(n.window.height, 800);
    assert.strictEqual(n.window.frameless, false);
    assert.strictEqual(n.window.alwaysOnTop, true);
    assert.deepStrictEqual(n.tray, { enabled: true, minimizeToTray: false });
    assert.strictEqual(n.startOnLogin, true);
    assert.strictEqual(n.injectCss, "a{}");
    assert.strictEqual(n.injectJs, "");
    assert.strictEqual(n.userAgent, "");
    assert.deepStrictEqual(n.permissions.allow, ["notifications", "media"]);
    assert.deepStrictEqual(normalizeOptions("junk").tray, { enabled: false, minimizeToTray: false });
    execFileSync(process.execPath, ["--check", path.join(dir, "preload.js")]);
    console.log("smoke: OK");
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error("smoke: FAIL", e);
  process.exit(1);
});
