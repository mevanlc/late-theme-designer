const tokens = [
  ["bg_canvas", "terminal canvas"],
  ["bg_selection", "selected rows and active tab fg"],
  ["bg_highlight", "raised/secondary surface"],
  ["border_dim", "rules and separators"],
  ["border", "normal panel border"],
  ["border_active", "outer frame and active panels"],
  ["text_faint", "timestamps and disabled text"],
  ["text_dim", "secondary copy"],
  ["text_muted", "dashboard title and quiet labels"],
  ["text", "general text"],
  ["text_bright", "strong text"],
  ["amber", "keys, accents, progress"],
  ["amber_dim", "quotes and subdued accents"],
  ["amber_glow", "hot accent highlight"],
  ["chat_body", "chat message body"],
  ["chat_author", "chat author names"],
  ["mention", "mentions and mention count"],
  ["success", "online/positive state"],
  ["error", "error banners"],
  ["bot", "bot author"],
  ["bonsai_sprout", "new bonsai growth"],
  ["bonsai_leaf", "bonsai leaves/status"],
  ["bonsai_canopy", "bonsai canopy"],
  ["bonsai_bloom", "bonsai blossoms"],
  ["badge_bronze", "bronze badge"],
  ["badge_silver", "silver badge"],
  ["badge_gold", "gold badge"],
];

const fallbackTheme = {
  bg_canvas: "#000000",
  bg_selection: "#211915",
  bg_highlight: "#161314",
  border_dim: "#343044",
  border: "#4b4562",
  border_active: "#65708b",
  text_faint: "#706b80",
  text_dim: "#9b93a7",
  text_muted: "#c3b8a3",
  text: "#d4c7aa",
  text_bright: "#f0dfb9",
  amber: "#f1a55f",
  amber_dim: "#c37b3e",
  amber_glow: "#ffbd7b",
  chat_body: "#d6ccb3",
  chat_author: "#96bd68",
  mention: "#d9c6a2",
  success: "#a6bf77",
  error: "#d26d5f",
  bot: "#a878d7",
  bonsai_sprout: "#99bf68",
  bonsai_leaf: "#a7c877",
  bonsai_canopy: "#b999cf",
  bonsai_bloom: "#e7d5f2",
  badge_bronze: "#bd8954",
  badge_silver: "#c9c9ce",
  badge_gold: "#d5b85b",
};

const presetThemes = Array.isArray(window.PRESET_THEMES) ? window.PRESET_THEMES : [];
const defaultPreset = presetThemes.find((preset) => preset.id === "contrast");
const initialTheme = defaultPreset ? { ...defaultPreset.colors } : { ...fallbackTheme };

let theme = { ...initialTheme };

const tokenList = document.querySelector("#tokenList");
const exportText = document.querySelector("#exportText");
const resetButton = document.querySelector("#resetButton");
const presetSelect = document.querySelector("#presetSelect");
const exportButton = document.querySelector("#exportButton");
const exportDialog = document.querySelector("#exportDialog");
const copyButton = document.querySelector("#copyButton");
const copyStatus = document.querySelector("#copyStatus");
const designerShell = document.querySelector(".designer-shell");
const themePanel = document.querySelector("#themePanel");
const hideThemePanel = document.querySelector("#hideThemePanel");
const showThemePanel = document.querySelector("#showThemePanel");

function cssVarName(token) {
  return `--${token.replaceAll("_", "-")}`;
}

function normalizeHex(value) {
  const raw = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) {
    return raw.toLowerCase();
  }
  if (/^[0-9a-f]{6}$/i.test(raw)) {
    return `#${raw.toLowerCase()}`;
  }
  return null;
}

function setToken(token, value) {
  const hex = normalizeHex(value);
  if (!hex) {
    return false;
  }
  theme[token] = hex;
  document.documentElement.style.setProperty(cssVarName(token), hex);
  syncInputs(token, hex);
  renderExport();
  return true;
}

function syncInputs(token, value) {
  document.querySelectorAll(`[data-input-token="${token}"]`).forEach((input) => {
    if (input.value.toLowerCase() !== value) {
      input.value = value;
    }
  });
}

function renderTokenRows() {
  tokenList.replaceChildren(
    ...tokens.map(([token, desc]) => {
      const row = document.createElement("label");
      row.className = "token-row";

      const name = document.createElement("span");
      name.className = "token-name";
      name.textContent = token;

      const small = document.createElement("span");
      small.className = "token-desc";
      small.textContent = desc;
      name.append(small);

      const color = document.createElement("input");
      color.type = "color";
      color.value = theme[token];
      color.dataset.inputToken = token;

      const hex = document.createElement("input");
      hex.className = "hex-input";
      hex.value = theme[token];
      hex.dataset.inputToken = token;
      hex.spellcheck = false;

      color.addEventListener("input", () => setToken(token, color.value));
      hex.addEventListener("input", () => {
        if (setToken(token, hex.value)) {
          hex.setCustomValidity("");
        } else {
          hex.setCustomValidity("Use #rrggbb");
        }
      });

      row.append(name, color, hex);
      return row;
    }),
  );
}

function groupLabel(group) {
  return {
    Core: "Core",
    Catppuccin: "Catppuccin",
    Coffee: "Coffee",
    Ports: "Ports",
    Copper: "Copper",
    MARATHON: "MARATHON",
    JoelG: "Joel G",
    Experimental: "Experimental",
    SocialDark: "Social Dark",
    SocialLight: "Social Light",
    Tea: "Tea",
    Crt: "CRT",
  }[group] || group;
}

function renderPresetOptions() {
  if (!presetSelect) {
    return;
  }

  const groups = new Map();
  for (const preset of presetThemes) {
    if (!groups.has(preset.group)) {
      groups.set(preset.group, []);
    }
    groups.get(preset.group).push(preset);
  }

  presetSelect.replaceChildren(
    ...[...groups.entries()].map(([group, presets]) => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = groupLabel(group);
      optgroup.append(
        ...presets.map((preset) => {
          const option = document.createElement("option");
          option.value = preset.id;
          option.textContent = preset.label;
          return option;
        }),
      );
      return optgroup;
    }),
  );
  presetSelect.value = defaultPreset?.id || "";
}

function loadTheme(colors) {
  theme = { ...colors };
  applyTheme();
  for (const [token] of tokens) {
    syncInputs(token, theme[token]);
  }
  renderExport();
}

function rustRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `Color::Rgb(${r}, ${g}, ${b})`;
}

function renderExport() {
  exportText.value = `Palette {\n${tokens
    .map(([token]) => `    ${token}: ${rustRgb(theme[token])},`)
    .join("\n")}\n}`;
}

function applyTheme() {
  for (const [token] of tokens) {
    document.documentElement.style.setProperty(cssVarName(token), theme[token]);
  }
}

resetButton.addEventListener("click", () => {
  const preset = presetThemes.find((item) => item.id === presetSelect?.value);
  loadTheme(preset?.colors || initialTheme);
});

if (presetSelect) {
  presetSelect.addEventListener("change", () => {
    const preset = presetThemes.find((item) => item.id === presetSelect.value);
    if (preset) {
      loadTheme(preset.colors);
    }
  });
}

exportButton.addEventListener("click", () => {
  renderExport();
  copyStatus.textContent = "";
  exportDialog.showModal();
});

copyButton.addEventListener("click", async () => {
  exportText.select();
  try {
    await navigator.clipboard.writeText(exportText.value);
    copyStatus.textContent = "Copied";
  } catch {
    document.execCommand("copy");
    copyStatus.textContent = "Copied";
  }
});

hideThemePanel.addEventListener("click", () => {
  designerShell.classList.add("is-picker-collapsed");
  themePanel.setAttribute("aria-hidden", "true");
  showThemePanel.hidden = false;
});

showThemePanel.addEventListener("click", () => {
  designerShell.classList.remove("is-picker-collapsed");
  themePanel.removeAttribute("aria-hidden");
  showThemePanel.hidden = true;
});

applyTheme();
renderPresetOptions();
renderTokenRows();
renderExport();
