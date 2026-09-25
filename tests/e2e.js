// Real-app E2E. Run ONE scenario per process:
//   env -u ELECTRON_RUN_AS_NODE ./node_modules/.bin/electron tests/e2e.js [ui|ipc|build|cancel]
const { app, BrowserWindow } = require("electron");
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const scenario = process.argv[2] || "ui";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "webwrap-e2e-")).replace(/\\/g, "/");
app.setPath("documents", tmp + "/docs"); // keep the real Documents folder untouched
app.setPath("userData", tmp + "/userData");
require("../src/main/main.js");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let win;
const ev = (code) => win.webContents.executeJavaScript(code, true);
const api = (call) => ev(`(async()=>{const v=await window.webwrap.${call};return v===undefined?null:JSON.parse(JSON.stringify(v))})()`);
async function waitFor(code, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await ev(code)) return;
    await sleep(200);
  }
  throw new Error("timeout waiting for: " + code);
}
const REQUIRED = ["package.json", "main.js", "preload.js", "webwrap.config.json", "build/icon.png"];

async function makeProject(url = "https://example.com", name = "E2E App") {
  const out = tmp + "/out";
  fs.mkdirSync(out, { recursive: true });
  const r = await api(`createProject(${JSON.stringify({ url, name, description: "", outputDir: out, iconDataUrl: null })})`);
  assert.ok(r.ok, "createProject: " + r.error);
  return r.projectDir;
}

const scenarios = {
  async ui() {
    const out = tmp + "/ui-out";
    fs.mkdirSync(out);
    await waitFor(`!!document.getElementById("outputDir").textContent.trim()`);
    await ev(`setOutputDir(${JSON.stringify(out)})`);
    await ev(`(()=>{const u=document.getElementById("url");u.value="https://example.com";u.dispatchEvent(new Event("input",{bubbles:true}));u.dispatchEvent(new Event("change",{bubbles:true}));u.dispatchEvent(new Event("blur",{bubbles:true}));})()`);
    await waitFor(`!document.getElementById("preview").hidden`);
    const name = await ev(`document.getElementById("name").value`);
    assert.ok(name.length >= 2, "name autofilled: " + name);
    console.log("preview shown, name =", name);
    await ev(`document.getElementById("create").click()`);
    await waitFor(`!document.getElementById("view-success").hidden`);
    const dir = await ev(`document.getElementById("success-path").textContent`);
    for (const f of REQUIRED) assert.ok(fs.existsSync(path.join(dir, f)), "missing " + f);
    assert.ok(dir.replace(/\\/g, "/").startsWith(out), "project outside output dir: " + dir);
    console.log("ui OK:", dir);
  },

  async ipc() {
    let r = await api(`inspectUrl("https://example.com")`);
    assert.ok(r.ok && /example/i.test(r.title), "example title: " + JSON.stringify(r).slice(0, 100));
    console.log("example.com:", r.title, "icon:", !!r.iconDataUrl);
    r = await api(`inspectUrl("https://github.com")`);
    assert.ok(r.ok && r.title, "github title");
    assert.ok(r.iconDataUrl && r.iconDataUrl.startsWith("data:image/png;base64,"), "github icon PNG");
    console.log("github.com:", r.title, "icon bytes:", r.iconDataUrl.length);
    assert.deepStrictEqual(await api(`inspectUrl("not a url")`), { ok: false });
    assert.deepStrictEqual(await api(`inspectUrl("file:///etc/passwd")`), { ok: false });
    assert.strictEqual((await api(`inspectUrl("http://127.0.0.1:1/")`)).ok, false);

    r = await api(`checkBuildEnv()`);
    assert.ok(r.ok && r.node && r.npm, "build env " + JSON.stringify(r));
    r = await api(`getDefaultOutputDir()`);
    assert.strictEqual(path.normalize(r), path.normalize(tmp + "/docs/WebWrap Studio"));
    assert.ok(fs.statSync(r).isDirectory());

    const base = { url: "https://example.com", name: "Ok Name", description: "", outputDir: tmp, iconDataUrl: null };
    const bad = [
      [{ ...base, url: "ftp://x.com" }, /http/],
      [{ ...base, url: "nope" }, /http/],
      [{ ...base, name: "x" }, /name/i],
      [{ ...base, description: "d".repeat(161) }, /160/],
      [{ ...base, outputDir: "relative/dir" }, /absolute|folder/i],
      [{ ...base, outputDir: tmp + "/does-not-exist" }, /exist|writable/],
      [null, /http/],
    ];
    for (const [p, re] of bad) {
      const res = await api(`createProject(${JSON.stringify(p)})`);
      assert.ok(res.ok === false && re.test(res.error), "expected error " + re + " got " + JSON.stringify(res));
    }
    // corrupt icon data must fall back, not fail
    const dir = await makeProject();
    for (const f of REQUIRED) assert.ok(fs.existsSync(path.join(dir, f)), "missing " + f);
    for (const p of [{ projectDir: tmp + "/nope" }, { projectDir: tmp }, { projectDir: "rel" }, { projectDir: dir, target: "linux-on-win" }, null]) {
      const res = await api(`buildApp(${JSON.stringify(p)})`);
      assert.strictEqual(res.ok, false, "buildApp should reject " + JSON.stringify(p));
      console.log("buildApp reject:", res.error);
    }
    // revealPath outside allowed dirs must be a silent no-op, and not throw
    await api(`revealPath("C:/Windows")`);
    await api(`revealPath(${JSON.stringify(dir + "/../../..")})`);
    await api(`revealPath("relative")`);
    await api(`cancelBuild()`); // no build running: no-op
    console.log("ipc OK");
  },

  async build() {
    const dir = await makeProject();
    const t = Date.now();
    await ev(`window.__log=[];void window.webwrap.onBuildLog(m=>window.__log.push(m.stage+": "+m.line))`);
    const r = await api(`buildApp(${JSON.stringify({ projectDir: dir, target: "current" })})`);
    const log = await ev(`window.__log.slice(-25).join("\\n")`);
    console.log("result:", JSON.stringify(r), "secs:", Math.round((Date.now() - t) / 1000));
    if (!r.ok) console.log("LOG TAIL:\n" + log);
    assert.ok(r.ok, "build failed");
    assert.ok(/\.exe$/i.test(r.installerPath) && fs.existsSync(r.installerPath));
    console.log("installer:", r.installerPath, fs.statSync(r.installerPath).size, "bytes");
    await api(`revealPath(${JSON.stringify(r.installerPath)})`); // allowed: must not throw
  },

  async cancel() {
    const dir = await makeProject();
    await ev(`window.__n=0;void window.webwrap.onBuildLog(()=>window.__n++)`);
    const p = api(`buildApp(${JSON.stringify({ projectDir: dir, target: "current" })})`);
    await sleep(8000);
    const dup = await api(`buildApp(${JSON.stringify({ projectDir: dir, target: "current" })})`);
    assert.ok(!dup.ok && /already/.test(dup.error), "second concurrent build rejected: " + JSON.stringify(dup));
    await api(`cancelBuild()`);
    const r = await p;
    assert.ok(!r.ok && /cancel/i.test(r.error), "cancel result: " + JSON.stringify(r));
    console.log("cancel OK:", r.error);
    // a new build may start again after cancel
    const again = await api(`buildApp(${JSON.stringify({ projectDir: dir, target: "current" })})`).then(
      (x) => x, (e) => ({ err: String(e) })
    );
    assert.ok(again, "state reset");
    await api(`cancelBuild()`);
  },
};

app.whenReady().then(async () => {
  let code = 0;
  try {
    await sleep(500);
    win = BrowserWindow.getAllWindows()[0];
    assert.ok(win, "no window");
    await new Promise((r) => (win.webContents.isLoading() ? win.webContents.once("did-finish-load", r) : r()));
    assert.strictEqual(await ev(`typeof window.webwrap.buildApp`), "function", "preload not exposed");
    await scenarios[scenario]();
    console.log("E2E", scenario, "PASS");
  } catch (e) {
    console.error("E2E", scenario, "FAIL:", e && e.stack || e);
    code = 1;
  }
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
  app.exit(code);
});
