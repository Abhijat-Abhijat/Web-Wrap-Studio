// Tiny local persistence + redaction. No network, pure helpers exported for tests/smoke.js.
const fs = require("fs");
const path = require("path");
const os = require("os");

const MAX_RECENT = 5;

const read = (file, def) => {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return def; }
};
const write = (file, data) => {
  try { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data)); } catch { /* best effort */ }
};

// Newest first, one entry per folder, capped.
function addRecent(list, entry) {
  return [entry, ...list.filter((e) => e.folder !== entry.folder)].slice(0, MAX_RECENT);
}

// Strip URLs and user-home paths so a report is safe to paste anywhere.
function redact(text) {
  let s = String(text);
  const home = os.homedir();
  if (home) s = s.split(home).join("~").split(home.replace(/\\/g, "/")).join("~");
  return s
    .replace(/[a-z][a-z0-9+.-]*:\/\/[^\s"'<>)]+/gi, "<url>")
    .replace(/[A-Za-z]:\\Users\\[^\\\s"']+/g, "~")
    .replace(/\/(?:Users|home)\/[^/\s"']+/g, "~");
}

const logLine = (kind, msg) => `${new Date().toISOString()} ${kind} ${redact(msg).replace(/\s*\n\s*/g, " | ")}\n`;

module.exports = { read, write, addRecent, redact, logLine, MAX_RECENT };
