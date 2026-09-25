/**
 * WebWrap Studio - renderer process
 */

const form = document.getElementById("form");
const browse = document.getElementById("browse");
const outputDirEl = document.getElementById("outputDir");
const status = document.getElementById("status");
const createButton = document.getElementById("create");
const urlInput = document.getElementById("url");
const nameInput = document.getElementById("name");
const preview = document.getElementById("preview");
const iconEl = document.getElementById("icon");
const changeIconBtn = document.getElementById("change-icon");
const emptyEl = document.getElementById("empty");
const emptyText = document.getElementById("empty-text");
const live = document.getElementById("live");
const outputTextEl = document.querySelector(".output-text");
const $ = (id) => document.getElementById(id);

const api = () => window.webwrap || {};
const has = (name) => typeof api()[name] === "function";

const hints = {
  url: document.getElementById("url-hint"),
  name: document.getElementById("name-hint"),
  outputDir: document.getElementById("output-hint"),
};

const inputs = { url: urlInput, name: nameInput };

let outputDir = "";
let iconDataUrl = null;
let nameEdited = false;
let inspectedUrl = "";
let inspectSeq = 0;
let debounceTimer = null;
let iconPicked = false;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

// Domain or localhost, optional port and path.
const URL_PATTERN = /^(https?:\/\/)?(([\w-]+\.)+[a-z]{2,}|localhost)(:\d{1,5})?(\/.*)?$/i;

function validate() {
  const errors = {};

  const urlValue = urlInput.value.trim();
  if (!urlValue) {
    errors.url = "Enter a website URL.";
  } else if (!URL_PATTERN.test(urlValue)) {
    errors.url = "Enter a valid URL, like example.com.";
  }

  const nameValue = nameInput.value.trim();
  if (!nameValue) {
    errors.name = "Enter an application name.";
  } else if (nameValue.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!outputDir) {
    errors.outputDir = "Choose an output folder.";
  }

  return errors;
}

function clearFieldError(field) {
  const hint = hints[field];
  const input = inputs[field];
  if (hint) hint.textContent = "";
  if (input) input.removeAttribute("aria-invalid");
}

function clearAllErrors() {
  Object.keys(hints).forEach(clearFieldError);
}

function applyErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const hint = hints[field];
    const input = inputs[field];
    if (hint) hint.textContent = message;
    if (input) input.setAttribute("aria-invalid", "true");
  });
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// ---------------------------------------------------------------------------
// Status (textContent only; never interpolate user text into HTML)
// ---------------------------------------------------------------------------

function clearStatus() {
  status.replaceChildren();
}

function showBanner(kind, message, actionLabel, onAction) {
  clearStatus();
  const banner = document.createElement("div");
  banner.className = `status-banner status-${kind}`;

  const text = document.createElement("span");
  text.className = "status-message";
  text.textContent = message;
  banner.appendChild(text);

  if (onAction) {
    const action = document.createElement("button");
    action.type = "button";
    action.className = "status-action";
    action.textContent = actionLabel;
    action.addEventListener("click", onAction);
    banner.appendChild(action);
  }

  status.appendChild(banner);
}

function setBusy(isBusy) {
  createButton.disabled = isBusy;
  createButton.setAttribute("aria-busy", String(isBusy));
}

// ---------------------------------------------------------------------------
// Preview card
// ---------------------------------------------------------------------------

function fallbackName(url) {
  try {
    const labels = new URL(normalizeUrl(url)).hostname.replace(/^www\./i, "").split(".");
    const label = labels.length > 1 ? labels[labels.length - 2] : labels[0];
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return "";
  }
}

function renderIcon() {
  iconEl.replaceChildren();
  if (iconDataUrl) {
    const img = document.createElement("img");
    img.src = iconDataUrl;
    img.alt = "";
    iconEl.appendChild(img);
  } else {
    iconEl.textContent = (nameInput.value.trim().charAt(0) || "?").toUpperCase();
  }
}

async function inspect() {
  const value = urlInput.value.trim();
  if (!value || !URL_PATTERN.test(value)) return;
  const url = normalizeUrl(value);
  if (url === inspectedUrl) return;
  inspectedUrl = url;
  const seq = ++inspectSeq;

  if (preview.hidden) {
    emptyText.textContent = "Looking up the site…";
    emptyEl.setAttribute("aria-busy", "true");
  }

  let info = {};
  try {
    info = (has("inspectUrl") && (await api().inspectUrl(url))) || {};
  } catch {
    info = {};
  }
  if (seq !== inspectSeq) return; // a newer URL superseded this one

  if (!iconPicked) iconDataUrl = info.ok && info.iconDataUrl ? info.iconDataUrl : null;
  if (!nameEdited || !nameInput.value.trim()) {
    nameInput.value = (info.ok && info.title && info.title.trim()) || fallbackName(url);
    nameEdited = false;
  }
  showPreview();
}

function showPreview() {
  emptyEl.hidden = true;
  emptyEl.removeAttribute("aria-busy");
  preview.hidden = false;
  renderIcon();
}

function resetPreview() {
  preview.hidden = true;
  emptyEl.hidden = false;
  emptyEl.removeAttribute("aria-busy");
  emptyText.textContent = "Your app preview appears here.";
}

// Icon picker (tile or "Change icon")
if (!has("pickIcon")) {
  changeIconBtn.hidden = true;
  iconEl.disabled = true;
  iconEl.removeAttribute("aria-label");
  iconEl.setAttribute("aria-hidden", "true");
}
async function changeIcon() {
  if (!has("pickIcon")) return;
  try {
    const res = await api().pickIcon();
    if (res && res.ok && res.iconDataUrl) {
      iconDataUrl = res.iconDataUrl;
      iconPicked = true;
      renderIcon();
      announce("Icon updated.");
    }
  } catch {
    showBanner("error", "Couldn't open the icon picker. Try again.");
  }
}
iconEl.addEventListener("click", changeIcon);
changeIconBtn.addEventListener("click", changeIcon);

function announce(text) {
  live.textContent = "";
  setTimeout(() => { live.textContent = text; }, 50);
}

function scheduleInspect() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(inspect, 500);
}

// ---------------------------------------------------------------------------
// Advanced options. Only values that differ from the defaults are sent.
// ---------------------------------------------------------------------------

const PERMS = [...document.querySelectorAll("[data-perm]")];
const presetsEl = $("presets");
const presetReset = $("preset-reset");
const presetDesc = $("preset-desc");
const optWidth = $("opt-width");
const optHeight = $("opt-height");
const boolOpts = {
  frameless: $("opt-frameless"), alwaysOnTop: $("opt-ontop"), rememberPosition: $("opt-remember"),
  tray: $("opt-tray"), minimizeToTray: $("opt-mintray"), startOnLogin: $("opt-login"),
};

function dim(input) {
  const n = Math.round(Number(input.value));
  return input.value.trim() && Number.isFinite(n) && n >= 200 && n <= 10000 ? n : undefined;
}

function readOptions() {
  const o = {};
  const win = {};
  const w = dim(optWidth);
  const h = dim(optHeight);
  if (w) win.width = w;
  if (h) win.height = h;
  if (boolOpts.frameless.checked) win.frameless = true;
  if (boolOpts.alwaysOnTop.checked) win.alwaysOnTop = true;
  if (!boolOpts.rememberPosition.checked) win.rememberPosition = false;
  if (Object.keys(win).length) o.window = win;
  const tray = {};
  if (boolOpts.tray.checked) tray.enabled = true;
  if (boolOpts.minimizeToTray.checked) tray.minimizeToTray = true;
  if (Object.keys(tray).length) o.tray = tray;
  if (boolOpts.startOnLogin.checked) o.startOnLogin = true;
  const css = $("opt-css").value.trim();
  const js = $("opt-js").value.trim();
  const ua = $("opt-ua").value.trim();
  if (css) o.injectCss = css;
  if (js) o.injectJs = js;
  if (ua) o.userAgent = ua;
  const allow = PERMS.filter((c) => c.checked).map((c) => c.dataset.perm);
  if (allow.length) o.permissions = { allow };
  return Object.keys(o).length ? o : null;
}

function applyOptions(o = {}) {
  const win = o.window || {};
  const tray = o.tray || {};
  optWidth.value = win.width || "";
  optHeight.value = win.height || "";
  boolOpts.frameless.checked = !!win.frameless;
  boolOpts.alwaysOnTop.checked = !!win.alwaysOnTop;
  boolOpts.rememberPosition.checked = win.rememberPosition !== false;
  boolOpts.tray.checked = !!tray.enabled;
  boolOpts.minimizeToTray.checked = !!tray.minimizeToTray;
  boolOpts.startOnLogin.checked = !!o.startOnLogin;
  $("opt-css").value = o.injectCss || "";
  $("opt-js").value = o.injectJs || "";
  $("opt-ua").value = o.userAgent || "";
  const allow = (o.permissions && o.permissions.allow) || [];
  PERMS.forEach((c) => { c.checked = allow.includes(c.dataset.perm); });
}

function markPreset(id) {
  presetsEl.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
  presetReset.hidden = !id;
  const p = (window.WEBWRAP_PRESETS || []).find((x) => x.id === id);
  presetDesc.textContent = p ? p.description : "";
}

(window.WEBWRAP_PRESETS || []).forEach((p) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.dataset.id = p.id;
  b.textContent = p.label;
  b.setAttribute("aria-pressed", "false");
  b.addEventListener("click", () => { applyOptions(p.options); markPreset(p.id); announce(p.label + " preset applied."); });
  presetsEl.appendChild(b);
});
presetReset.addEventListener("click", () => { applyOptions({}); markPreset(null); announce("Options reset."); });
// Editing a control by hand means the preset no longer describes the panel.
$("advanced").addEventListener("input", (e) => { if (!presetsEl.contains(e.target)) markPreset(null); });

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

function setOutputDir(dir) {
  outputDir = dir || "";
  outputDirEl.textContent = outputDir;
  outputTextEl.firstChild.textContent = outputDir ? "Saves to " : "Choose where to save";
  browse.textContent = outputDir ? "Change" : "Choose folder";
}

browse.addEventListener("click", async () => {
  try {
    const folder = await api().selectFolder();
    if (folder) {
      setOutputDir(folder);
      clearFieldError("outputDir");
      clearStatus();
    }
  } catch {
    showBanner("error", "Couldn't open the folder picker. Try again.");
  }
});

urlInput.addEventListener("input", () => {
  clearFieldError("url");
  clearStatus();
  scheduleInspect();
});
urlInput.addEventListener("blur", () => {
  clearTimeout(debounceTimer);
  inspect();
});
urlInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    clearTimeout(debounceTimer);
    inspect();
  }
});

nameInput.addEventListener("input", () => {
  nameEdited = true;
  clearFieldError("name");
  clearStatus();
  if (!iconDataUrl) renderIcon();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearAllErrors();
  clearStatus();

  // Ensure the name is prefilled before validating if the user hit Enter fast.
  await inspect();

  const errors = validate();
  if (Object.keys(errors).length > 0) {
    applyErrors(errors);
    return;
  }

  const payload = {
    url: normalizeUrl(urlInput.value),
    name: nameInput.value.trim(),
    outputDir,
    iconDataUrl,
  };
  const options = readOptions();
  if (options) payload.options = options;

  setBusy(true);

  try {
    const result = await api().createProject(payload);

    if (!result || !result.ok) {
      throw new Error((result && result.error) || "Failed to create the app.");
    }

    projectDir = result.projectDir || outputDir;
    form.reset();
    markPreset(null);
    resetPreview();
    iconDataUrl = null;
    iconPicked = false;
    nameEdited = false;
    inspectedUrl = "";
    $("success-path").textContent = projectDir;
    showView("view-success", "success-title", "App created.");
  } catch (error) {
    showBanner("error", error.message || "Something went wrong. Try again.");
  } finally {
    setBusy(false);
  }
});

(async () => {
  try {
    setOutputDir(await api().getDefaultOutputDir());
  } catch {
    setOutputDir("");
  }
})();

// ---------------------------------------------------------------------------
// Views: form -> success -> build. Focus moves to the new state's heading.
// ---------------------------------------------------------------------------

let projectDir = "";
let installerPath = "";
let cancelled = false;
let unsubscribeLog = null;
let logLines = [];
const LOG_CAP = 200;
const viewIds = ["view-form", "view-success", "view-build"];

function showView(viewId, headingId, message) {
  viewIds.forEach((id) => { $(id).hidden = id !== viewId; });
  clearStatus();
  const heading = headingId && $(headingId);
  if (heading) heading.focus();
  else urlInput.focus();
  if (message) announce(message);
}

$("another").addEventListener("click", () => showView("view-form"));
$("show-folder").addEventListener("click", () => {
  if (has("openFolder")) api().openFolder(projectDir);
});

// --- Build ---

const stageInstall = $("stage-install");
const stageBuild = $("stage-build");
const logEl = $("log");
const envNote = $("env-note");
let currentStage = "install";

function setStage(stage) {
  currentStage = stage;
  const building = stage === "build";
  stageInstall.className = building ? "is-done" : "is-current";
  stageBuild.className = building ? "is-current" : "";
  stageInstall.toggleAttribute("aria-current", !building);
  stageBuild.toggleAttribute("aria-current", building);
  if (stageInstall.hasAttribute("aria-current")) stageInstall.setAttribute("aria-current", "step");
  if (stageBuild.hasAttribute("aria-current")) stageBuild.setAttribute("aria-current", "step");
  announce(building ? "Building." : "Installing.");
}

function appendLog(line) {
  const atBottom = logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight < 8;
  logLines.push(String(line));
  if (logLines.length > LOG_CAP) logLines.shift();
  logEl.textContent = logLines.join("\n");
  if (atBottom) logEl.scrollTop = logEl.scrollHeight;
}

function buildIllustration(which) {
  ["build", "done", "fail"].forEach((k) => { $(`ill-${k}`).hidden = k !== which; });
}

function finishBuild({ title, message, ok, failed }) {
  $("build-title").textContent = title;
  const msg = $("build-message");
  msg.textContent = message || "";
  msg.hidden = !message;
  $("stages").hidden = true;
  $("progress").hidden = true;
  $("cancel-build").hidden = true;
  $("show-installer").hidden = !ok;
  $("show-details").hidden = !failed;
  $("build-back").hidden = ok;
  buildIllustration(ok ? "done" : failed ? "fail" : "build");
  $("build-title").focus();
  announce(message ? `${title}. ${message}` : title);
}

async function startBuild() {
  const buildBtn = $("build-installer");
  envNote.textContent = "";
  if (!has("buildApp")) {
    envNote.textContent = "Building installers isn't available in this version.";
    return;
  }
  buildBtn.disabled = true;
  try {
    if (has("checkBuildEnv")) {
      let env = null;
      try { env = await api().checkBuildEnv(); } catch { env = null; }
      if (!env || !env.ok) {
        envNote.textContent =
          (env && env.message) || "Node.js and npm are needed to build an installer. Install them, then try again.";
        return;
      }
    }
  } finally {
    buildBtn.disabled = false;
  }

  cancelled = false;
  installerPath = "";
  logLines = [];
  logEl.textContent = "";
  $("details").open = false;
  $("build-title").textContent = "Building your installer";
  $("build-message").hidden = true;
  $("stages").hidden = false;
  $("progress").hidden = false;
  $("cancel-build").hidden = false;
  $("cancel-build").disabled = false;
  ["show-installer", "show-details", "build-back"].forEach((id) => { $(id).hidden = true; });
  buildIllustration("build");
  setStage("install");
  showView("view-build", "build-title");

  if (has("onBuildLog")) {
    unsubscribeLog = api().onBuildLog(({ stage, line } = {}) => {
      if ((stage === "install" || stage === "build") && stage !== currentStage) setStage(stage);
      if (line != null) appendLog(line);
    });
  }

  let result;
  try {
    result = await api().buildApp({ projectDir, target: "current" });
  } catch (error) {
    result = { ok: false, error: error && error.message };
  }
  if (typeof unsubscribeLog === "function") unsubscribeLog();
  unsubscribeLog = null;

  if (cancelled) {
    showView("view-success", "success-title", "Build cancelled.");
    return;
  }
  if (result && result.ok) {
    installerPath = result.installerPath || "";
    finishBuild({ title: "Installer ready", message: installerPath, ok: true });
    $("show-installer").hidden = !(installerPath && has("revealPath"));
  } else {
    finishBuild({
      title: "The build didn't finish",
      message: (result && result.error) || "Something went wrong while building.",
      failed: true,
    });
  }
}

$("build-installer").addEventListener("click", startBuild);
$("cancel-build").addEventListener("click", async () => {
  cancelled = true;
  $("cancel-build").disabled = true;
  if (has("cancelBuild")) {
    try { await api().cancelBuild(); } catch { /* buildApp will settle either way */ }
  }
});
$("show-installer").addEventListener("click", () => {
  if (installerPath && has("revealPath")) api().revealPath(installerPath);
});
$("show-details").addEventListener("click", () => {
  const d = $("details");
  d.open = true;
  d.querySelector("summary").focus();
});
$("build-back").addEventListener("click", () => showView("view-success", "success-title"));
