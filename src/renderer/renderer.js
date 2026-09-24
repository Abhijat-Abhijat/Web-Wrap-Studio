/**
 * WebWrap Studio — renderer process
 */

const form = document.getElementById("form");
const browse = document.getElementById("browse");
const outputDir = document.getElementById("outputDir");
const status = document.getElementById("status");
const createButton = document.getElementById("create");
const urlInput = document.getElementById("url");
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");

const hints = {
  url: document.getElementById("url-hint"),
  name: document.getElementById("name-hint"),
  outputDir: document.getElementById("output-hint"),
};

const inputs = {
  url: urlInput,
  name: nameInput,
  outputDir,
};

const ICONS = {
  success:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/><path d="M8 12.5L10.5 15L16 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  error:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/><path d="M12 8V13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>',
};

// ─────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────

const URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/.*)?$/i;

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

  if (!outputDir.value.trim()) {
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

// ─────────────────────────────────────────────────────────────────────────
// Status
// ─────────────────────────────────────────────────────────────────────────

function clearStatus() {
  status.innerHTML = "";
}

function showSuccess(message, onOpenFolder) {
  clearStatus();
  const banner = document.createElement("div");
  banner.className = "status-banner status-success";
  banner.innerHTML = `${ICONS.success}<span class="status-message">${message}</span>`;

  if (onOpenFolder) {
    const action = document.createElement("button");
    action.type = "button";
    action.className = "status-action";
    action.textContent = "Open folder";
    action.addEventListener("click", onOpenFolder);
    banner.appendChild(action);
  }

  status.appendChild(banner);
}

function showError(message) {
  clearStatus();
  const banner = document.createElement("div");
  banner.className = "status-banner status-error";
  banner.innerHTML = `${ICONS.error}<span class="status-message">${message}</span>`;
  status.appendChild(banner);
}

// ─────────────────────────────────────────────────────────────────────────
// Button state
// ─────────────────────────────────────────────────────────────────────────

function setBusy(isBusy) {
  createButton.disabled = isBusy;
  createButton.setAttribute("aria-busy", String(isBusy));
}

// ─────────────────────────────────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────────────────────────────────

browse.addEventListener("click", async () => {
  try {
    const folder = await window.webwrap.selectFolder();
    if (folder) {
      outputDir.value = folder;
      clearFieldError("outputDir");
      clearStatus();
    }
  } catch (error) {
    showError("Couldn't open the folder picker. Try again.");
  }
});

[urlInput, nameInput, outputDir].forEach((input) => {
  input.addEventListener("input", () => {
    const field = Object.keys(inputs).find((key) => inputs[key] === input);
    if (field) clearFieldError(field);
    clearStatus();
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearAllErrors();
  clearStatus();

  const errors = validate();
  if (Object.keys(errors).length > 0) {
    applyErrors(errors);
    return;
  }

  const payload = {
    url: normalizeUrl(urlInput.value),
    name: nameInput.value.trim(),
    description: descriptionInput.value.trim(),
    outputDir: outputDir.value.trim(),
  };

  setBusy(true);

  try {
    const result = await window.webwrap.createProject(payload);

    if (!result.ok) {
      throw new Error(result.error || "Failed to create the project.");
    }

    showSuccess("Project created.", () =>
      window.webwrap.openFolder(result.projectDir)
    );
    form.reset();
    outputDir.value = "";
  } catch (error) {
    showError(error.message || "Something went wrong. Try again.");
  } finally {
    setBusy(false);
  }
});
