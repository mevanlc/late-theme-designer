const tokens = [
  ["bg_canvas", "terminal canvas"],
  ["bg_selection", "active row/tab fg"],
  ["bg_highlight", "secondary surface"],
  ["border_dim", "rules/separators"],
  ["border", "panel border"],
  ["border_active", "frame/act panels"],
  ["text_faint", "time/disabled txt"],
  ["text_dim", "secondary copy"],
  ["text_muted", "dashbrd/quiet txt"],
  ["text", "general text"],
  ["text_bright", "strong text"],
  ["amber", "keys/acc/progress"],
  ["amber_dim", "quotes/sub accents"],
  ["amber_glow", "hot accent"],
  ["chat_body", "chat body"],
  ["chat_author", "chat authors"],
  ["mention", "mentions/count"],
  ["success", "online/positive"],
  ["error", "errors"],
  ["bot", "bot author"],
  ["bonsai_sprout", "bonsai sprout"],
  ["bonsai_leaf", "bonsai leaves"],
  ["bonsai_canopy", "bonsai canopy"],
  ["bonsai_bloom", "bonsai blooms"],
  ["badge_bronze", "bronze badge"],
  ["badge_silver", "silver badge"],
  ["badge_gold", "gold badge"],
];

const tokenDetails = {
  bg_canvas:
    "Terminal canvas and modal background. Also used as inverse foreground for cursor-like highlights.",
  bg_selection:
    "Selected chat rows, focused modal rows, active tab inverse text, and selected list backgrounds.",
  bg_highlight:
    "Raised or secondary surfaces, especially highlighted leaderboard and puzzle cells.",
  border_dim:
    "Quiet dividers, inactive separators, card grid lines, and low-emphasis game borders.",
  border:
    "Default panel, card, modal, composer, news, showcase, and hub border color.",
  border_active:
    "Focused outer frames, active modals, current room/chat panels, and primary active borders.",
  text_faint:
    "Timestamps, disabled states, inactive room/list items, and very low-emphasis metadata.",
  text_dim:
    "Secondary labels, helper text, placeholders, command hints, and muted side copy.",
  text_muted:
    "Quiet headings and low-contrast title text, including arcade/puzzle secondary labels.",
  text:
    "Normal readable UI text, chat-adjacent copy, composer input, and list body text.",
  text_bright:
    "Strong labels, selected item text, game titles, headings, and active row emphasis.",
  amber:
    "Primary accent for keys, active markers, command letters, progress, chips, and links.",
  amber_dim:
    "Subdued accent for quotes, key hints, separators, table ids, and lower-priority highlights.",
  amber_glow:
    "Hot accent for modal titles, focus glints, leaderboard medals, and active search markers.",
  chat_body:
    "Main message text in chat, room transcripts, and chat-like event body copy.",
  chat_author:
    "Human author names in chat rows and message history.",
  mention:
    "Mention indicators, unread mention counts, and mention-side markers.",
  success:
    "Online status, positive states, balances, wins, ready states, and success feedback.",
  error:
    "Validation errors, failure banners, blocked actions, and destructive warning text.",
  bot:
    "Bot/system author names in chat rows.",
  bonsai_sprout:
    "Young bonsai growth, sprouts, and early-stage tree details.",
  bonsai_leaf:
    "Bonsai leaves plus watered/healthy status text.",
  bonsai_canopy:
    "Dense bonsai canopy shapes and mature tree foliage.",
  bonsai_bloom:
    "Bonsai blossoms, flowers, and decorative bloom highlights.",
  badge_bronze:
    "Bronze profile badges, lower-tier medals, and bronze reward accents.",
  badge_silver:
    "Silver profile badges, mid-tier medals, and silver reward accents.",
  badge_gold:
    "Gold profile badges, top-tier medals, and gold reward accents.",
};

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
const importButton = document.querySelector("#importButton");
const importDialog = document.querySelector("#importDialog");
const importText = document.querySelector("#importText");
const applyImportButton = document.querySelector("#applyImportButton");
const importStatus = document.querySelector("#importStatus");
const exportButton = document.querySelector("#exportButton");
const exportDialog = document.querySelector("#exportDialog");
const copyButton = document.querySelector("#copyButton");
const copyStatus = document.querySelector("#copyStatus");
const designerShell = document.querySelector(".designer-shell");
const themePanel = document.querySelector("#themePanel");
const hideThemePanel = document.querySelector("#hideThemePanel");
const showThemePanel = document.querySelector("#showThemePanel");
const useBackgroundColor = document.querySelector("#useBackgroundColor");
const useHoverInfo = document.querySelector("#useHoverInfo");
const preview = document.querySelector(".terminal");
const hoverInfo = document.createElement("div");

let isolatedToken = null;

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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rgbChannel(value) {
  const channel = Number.parseInt(value, 10);
  if (!Number.isInteger(channel) || channel < 0 || channel > 255) {
    return null;
  }
  return channel.toString(16).padStart(2, "0");
}

function rgbToHexValue(red, green, blue) {
  const channels = [red, green, blue].map(rgbChannel);
  if (channels.some((channel) => channel === null)) {
    return null;
  }
  return `#${channels.join("")}`;
}

function hexToRgb(hex) {
  return {
    red: Number.parseInt(hex.slice(1, 3), 16),
    green: Number.parseInt(hex.slice(3, 5), 16),
    blue: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function mixHex(hex, targetHex, amount) {
  const color = hexToRgb(hex);
  const target = hexToRgb(targetHex);
  const mixChannel = (channel, targetChannel) =>
    Math.round(channel * amount + targetChannel * (1 - amount))
      .toString(16)
      .padStart(2, "0");

  return `#${mixChannel(color.red, target.red)}${mixChannel(
    color.green,
    target.green,
  )}${mixChannel(color.blue, target.blue)}`;
}

function colorFromText(value) {
  const rgb = value.match(
    /(?:color::)?rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i,
  );
  if (rgb) {
    return rgbToHexValue(rgb[1], rgb[2], rgb[3]);
  }

  const hex = value.match(/#?([0-9a-f]{6})\b/i);
  return hex ? normalizeHex(hex[1]) : null;
}

function parseImportText(value) {
  const parsed = {};
  const seen = new Set();
  const tokenNames = tokens.map(([token]) => token);

  for (const line of value.split(/\r?\n/)) {
    for (const token of tokenNames) {
      if (seen.has(token)) {
        continue;
      }
      const tokenPattern = new RegExp(`(^|[^A-Za-z0-9_])${escapeRegExp(token)}(?![A-Za-z0-9_])`);
      if (!tokenPattern.test(line)) {
        continue;
      }
      const color = colorFromText(line);
      if (color) {
        parsed[token] = color;
        seen.add(token);
      }
    }
  }

  for (const token of tokenNames) {
    if (seen.has(token)) {
      continue;
    }
    const tokenPattern = new RegExp(
      `(^|[^A-Za-z0-9_])${escapeRegExp(token)}(?![A-Za-z0-9_])`,
      "g",
    );
    let match;
    while ((match = tokenPattern.exec(value)) !== null) {
      const color = colorFromText(value.slice(match.index, match.index + 160));
      if (color) {
        parsed[token] = color;
        seen.add(token);
        break;
      }
    }
  }

  return parsed;
}

function setToken(token, value) {
  const hex = normalizeHex(value);
  if (!hex) {
    return false;
  }
  theme[token] = hex;
  document.documentElement.style.setProperty(cssVarName(token), hex);
  syncInputs(token, hex);
  setPreviewIsolation(isolatedToken);
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

function tokenColor(token) {
  if (token === "bg_canvas" && !useBackgroundColor.checked) {
    return "#000000";
  }
  return theme[token];
}

function tokenSummary(label, token) {
  if (!token) {
    return null;
  }
  return `${label}: ${token} ${tokenColor(token)}`;
}

function closestPreviewElement(target, selector) {
  const source = target instanceof Element ? target : target.parentElement;
  const element = source?.closest(selector);
  return element && preview.contains(element) ? element : null;
}

function hoverTokens(target) {
  const foreground = closestPreviewElement(target, "[data-token]")?.dataset.token;
  const background =
    closestPreviewElement(target, "[data-token-bg]")?.dataset.tokenBg ||
    preview.dataset.tokenBg;
  const borderElement = closestPreviewElement(
    target,
    "[data-token-border], [data-token-border-top], [data-token-border-right], [data-token-border-bottom], [data-token-border-left]",
  );
  const borderTokens = borderElement
    ? [
        tokenSummary("Border", borderElement.dataset.tokenBorder),
        tokenSummary("Border top", borderElement.dataset.tokenBorderTop),
        tokenSummary("Border right", borderElement.dataset.tokenBorderRight),
        tokenSummary("Border bottom", borderElement.dataset.tokenBorderBottom),
        tokenSummary("Border left", borderElement.dataset.tokenBorderLeft),
      ].filter(Boolean)
    : [];

  return [tokenSummary("FG", foreground), tokenSummary("BG", background), ...borderTokens].filter(
    Boolean,
  );
}

function positionHoverInfo(event) {
  const offset = 14;
  const rect = hoverInfo.getBoundingClientRect();
  const maxLeft = window.innerWidth - rect.width - 8;
  const maxTop = window.innerHeight - rect.height - 8;
  hoverInfo.style.left = `${Math.max(8, Math.min(event.clientX + offset, maxLeft))}px`;
  hoverInfo.style.top = `${Math.max(8, Math.min(event.clientY + offset, maxTop))}px`;
}

function hideHoverInfo() {
  hoverInfo.hidden = true;
}

function showHoverInfo(event) {
  if (!useHoverInfo.checked) {
    hideHoverInfo();
    return;
  }

  const rows = hoverTokens(event.target);
  if (rows.length === 0) {
    hideHoverInfo();
    return;
  }

  hoverInfo.replaceChildren(
    ...rows.map((row) => {
      const item = document.createElement("div");
      item.textContent = row;
      return item;
    }),
  );
  hoverInfo.hidden = false;
  positionHoverInfo(event);
}

function elementUsesToken(element, token) {
  return (
    element.dataset.token === token ||
    element.dataset.tokenBg === token ||
    element.dataset.tokenBorder === token ||
    element.dataset.tokenBorderTop === token ||
    element.dataset.tokenBorderRight === token ||
    element.dataset.tokenBorderBottom === token ||
    element.dataset.tokenBorderLeft === token
  );
}

function dimBorderSide(element, side, targetToken) {
  if (!targetToken) {
    return;
  }
  const dimmedColor = mixHex(tokenColor(targetToken), "#000000", 0.28);
  element.style[side] = dimmedColor;
}

function setPreviewIsolation(token) {
  isolatedToken = token;
  preview.toggleAttribute("data-isolating-token", Boolean(token));
  if (token) {
    preview.dataset.isolatingToken = token;
  } else {
    delete preview.dataset.isolatingToken;
  }

  [
    preview,
    ...preview.querySelectorAll(
      "[data-token], [data-token-bg], [data-token-border], [data-token-border-top], [data-token-border-right], [data-token-border-bottom], [data-token-border-left]",
    ),
  ].forEach((element) => {
    const isMatch = Boolean(token && elementUsesToken(element, token));
    const isDimmed = Boolean(token && !isMatch);
    element.classList.toggle("is-preview-match", isMatch);
    element.classList.toggle("is-preview-dimmed", isDimmed);

    element.style.removeProperty("color");
    element.style.removeProperty("background");
    element.style.removeProperty("border-color");
    element.style.removeProperty("border-top-color");
    element.style.removeProperty("border-right-color");
    element.style.removeProperty("border-bottom-color");
    element.style.removeProperty("border-left-color");

    if (isDimmed && element.dataset.token) {
      const dimmedColor = mixHex(tokenColor(element.dataset.token), "#000000", 0.28);
      element.style.color = dimmedColor;
      element.style.borderColor = dimmedColor;
    }
    if (isDimmed && element.dataset.tokenBg) {
      element.style.background = mixHex(tokenColor(element.dataset.tokenBg), "#000000", 0.22);
    }
    if (isDimmed) {
      dimBorderSide(element, "borderColor", element.dataset.tokenBorder);
      dimBorderSide(element, "borderTopColor", element.dataset.tokenBorderTop);
      dimBorderSide(element, "borderRightColor", element.dataset.tokenBorderRight);
      dimBorderSide(element, "borderBottomColor", element.dataset.tokenBorderBottom);
      dimBorderSide(element, "borderLeftColor", element.dataset.tokenBorderLeft);
    }
  });

  document.querySelectorAll("[data-isolate-token]").forEach((button) => {
    const isPressed = button.dataset.isolateToken === token;
    button.classList.toggle("is-active", isPressed);
    button.setAttribute("aria-pressed", String(isPressed));
  });
}

function renderTokenRows() {
  tokenList.replaceChildren(
    ...tokens.map(([token, desc]) => {
      const row = document.createElement("div");
      row.className = "token-row";

      const tools = document.createElement("div");
      tools.className = "token-tools";

      const info = document.createElement("button");
      info.type = "button";
      info.className = "token-info";
      info.textContent = "i";
      info.dataset.tooltip = tokenDetails[token];
      info.setAttribute("aria-label", `${token}: ${tokenDetails[token]}`);

      const isolate = document.createElement("button");
      isolate.type = "button";
      isolate.className = "token-isolate";
      isolate.textContent = "o";
      isolate.dataset.isolateToken = token;
      isolate.setAttribute("aria-label", `Dim preview elements not using ${token}`);
      isolate.setAttribute("aria-pressed", "false");
      isolate.title = `Isolate ${token} in preview`;

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

      isolate.addEventListener("click", () => {
        setPreviewIsolation(isolatedToken === token ? null : token);
      });

      tools.append(info, isolate);
      row.append(tools, name, color, hex);
      return row;
    }),
  );
  setPreviewIsolation(isolatedToken);
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
    SocialDark: "Social [Dark]",
    SocialLight: "Social [Light]",
    Tea: "Tea",
    Crt: "CRT",
    Seasons: "4 Seasons",
    Games: "Games",
    Monochrome: "Monochrome",
    Amoled: "AMOLED",
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
  applyBackgroundColorMode();
  setPreviewIsolation(isolatedToken);
}

function applyBackgroundColorMode() {
  document.documentElement.toggleAttribute(
    "data-static-background",
    !useBackgroundColor.checked,
  );
  setPreviewIsolation(isolatedToken);
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

importButton.addEventListener("click", () => {
  importStatus.textContent = "";
  importDialog.showModal();
  importText.focus();
  importText.select();
});

applyImportButton.addEventListener("click", () => {
  const imported = parseImportText(importText.value);
  const count = Object.keys(imported).length;
  if (count === 0) {
    importStatus.textContent = "No known colors found";
    return;
  }
  loadTheme({ ...theme, ...imported });
  importStatus.textContent = `Imported ${count} color${count === 1 ? "" : "s"}`;
});

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

useBackgroundColor.addEventListener("change", applyBackgroundColorMode);
useHoverInfo.addEventListener("change", hideHoverInfo);

hoverInfo.className = "hover-info";
hoverInfo.hidden = true;
document.body.append(hoverInfo);

preview.addEventListener("mousemove", showHoverInfo);
preview.addEventListener("mouseleave", hideHoverInfo);

applyTheme();
renderPresetOptions();
renderTokenRows();
renderExport();
