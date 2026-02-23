/**
 * Combined workflow on current QuickSight page:
 * 1) Run click-reset logic
 * 2) Run fill-id-and-search logic
 */
(async () => {
  const TARGET_FIELD = "mcid_primary_decrypted equals";
  const SOURCE_INPUT_SELECTOR = "";
  const EXACT_MENU_BUTTON_SELECTOR = [
    'button[data-automation-id="sheet control menu button"][data-automation-context="mcid_primary_decrypted equals"]',
    'button[data-automation-id="sheet.control.menu.button"][data-automation-context="mcid_primary_decrypted equals"]',
    'button[data-automation-id="sheet control menubutton"][data-automation-context="mcid_primary_decrypted equals"]',
  ].join(", ");

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const norm = (s) => (s || "").toLowerCase().replace(/[\s._-]+/g, "");

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  }

  function getRoots(doc) {
    const roots = [doc];
    for (const f of doc.querySelectorAll("iframe")) {
      try {
        if (f.contentDocument) roots.push(...getRoots(f.contentDocument));
      } catch (_) {}
    }
    return roots;
  }

  function queryAllDeep(root, selector) {
    const out = [];
    const walk = (r) => {
      out.push(...r.querySelectorAll(selector));
      for (const el of r.querySelectorAll("*")) {
        if (el.shadowRoot) walk(el.shadowRoot);
      }
    };
    walk(root);
    return out;
  }

  function openWithMouseSequence(el) {
    const events = ["pointerdown", "mousedown", "pointerup", "mouseup", "click"];
    for (const type of events) {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    }
  }

  function collectInteractiveCandidates(root) {
    return queryAllDeep(root, 'button, [role="button"], [aria-haspopup="true"], [role="menuitem"], li[role="menuitem"]');
  }

  function findMenuButton() {
    for (const root of getRoots(document)) {
      const exact = root.querySelector(EXACT_MENU_BUTTON_SELECTOR);
      if (exact && isVisible(exact)) return exact;
    }

    let best = null;
    let bestScore = -Infinity;
    for (const root of getRoots(document)) {
      for (const el of collectInteractiveCandidates(root)) {
        const t = norm(
          [
            el.getAttribute("data-automation-id"),
            el.getAttribute("data-automation-context"),
            el.getAttribute("aria-label"),
            el.getAttribute("title"),
            el.textContent,
          ]
            .filter(Boolean)
            .join(" ")
        );
        let score = 0;
        if (t.includes("sheetcontrolmenubutton")) score += 5;
        if (t.includes("options")) score += 3;
        if (t.includes(norm(TARGET_FIELD))) score += 4;
        if (t.includes("mcidprimarydecryptedequals")) score += 4;
        if ((el.getAttribute("aria-haspopup") || "").toLowerCase() === "true") score += 1;
        if (el.tagName.toLowerCase() === "button") score += 1;
        if (!isVisible(el)) score -= 100;
        if (score > bestScore) {
          best = el;
          bestScore = score;
        }
      }
    }
    return bestScore >= 4 ? best : null;
  }

  async function clickReset() {
    const start = Date.now();
    let menuBtn = null;
    while (Date.now() - start < 10000) {
      menuBtn = findMenuButton();
      if (menuBtn) break;
      await sleep(120);
    }
    if (!menuBtn) throw new Error("找不到三点菜单按钮。");

    openWithMouseSequence(menuBtn);
    await sleep(260);

    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      const items = [];
      for (const root of getRoots(document)) {
        items.push(...collectInteractiveCandidates(root));
      }
      const reset = items.find((el) => {
        if (!isVisible(el)) return false;
        const t = norm([el.getAttribute("data-automation-id"), el.textContent].filter(Boolean).join(" "));
        const inOpenMenu = !!el.closest('[role="menu"], .MuiMenu-paper, .MuiPopover-paper');
        return inOpenMenu && (t.includes("sheetcontrolreset") || t === "reset" || t.includes(" reset"));
      });
      if (reset) {
        reset.click();
        return;
      }
      await sleep(120);
    }
    throw new Error("点击三点后未找到 Reset。");
  }

  async function getIdValue() {
    const clean = (v) => String(v || "").replace(/\u00a0/g, " ").replace(/[\r\n\t]/g, "").trim();
    if (SOURCE_INPUT_SELECTOR) {
      const src = document.querySelector(SOURCE_INPUT_SELECTOR);
      if (!src) throw new Error(`找不到来源文本框: ${SOURCE_INPUT_SELECTOR}`);
      const v = "value" in src ? src.value : src.textContent;
      const out = clean(v);
      if (!out) throw new Error("来源文本框为空，请先输入 ID。");
      return out;
    }
    try {
      if (navigator.clipboard?.readText) {
        const clip = clean(await navigator.clipboard.readText());
        if (clip) return clip;
      }
    } catch (_) {}
    const out = clean(window.prompt("请输入要搜索的 ID（可直接粘贴）:", ""));
    if (!out) throw new Error("未输入 ID，已取消。");
    return out;
  }

  function findDropdown() {
    if (!isControlsExpanded()) {
      const toggle = findControlsToggle();
      if (toggle) openWithMouseSequence(toggle);
    }

    const targetNorm = norm(TARGET_FIELD);
    const altTargetNorm = norm("mcid_primary_decerpted equals");
    const containers = queryAllDeep(document, "[data-automation-context], [aria-label], [title], div, section");
    let targetContainer = null;
    for (const el of containers) {
      if (!isVisible(el)) continue;
      const text = norm(
        [
          el.getAttribute("data-automation-context"),
          el.getAttribute("aria-label"),
          el.getAttribute("title"),
          (el.textContent || "").slice(0, 120),
        ]
          .filter(Boolean)
          .join(" ")
      );
      if (text.includes(targetNorm) || text.includes(altTargetNorm)) {
        targetContainer = el;
        break;
      }
    }

    if (targetContainer) {
      const scoped = queryAllDeep(
        targetContainer,
        '[role="combobox"], [data-automation-id*="search_results_dropdown"], [data-automation-id*="search results dropdown"]'
      ).find((el) => isVisible(el));
      if (scoped) return scoped;
    }

    const exactSelectors = [
      '[role="combobox"][data-automation-id="sheet_control_search_results_dropdown"][data-automation-context="mcid primary_decrypted equals"]',
      '[role="combobox"][data-automation-id="sheet control search results dropdown"][data-automation-context="mcid primary decrypted equals"]',
      '[role="combobox"][data-automation-id="sheet.control.search.results.dropdown"][data-automation-context*="mcid"]',
      '[role="combobox"][data-automation-id="sheet_control_search_results_dropdown"]',
      '[role="combobox"][data-automation-id="sheet control search results dropdown"]',
      '[role="combobox"][data-automation-id*="search_results_dropdown"]',
      '[role="combobox"][data-automation-id*="search results dropdown"]',
    ];
    for (const root of getRoots(document)) {
      for (const selector of exactSelectors) {
        const hit = queryAllDeep(root, selector).find((el) => isVisible(el));
        if (hit) return hit;
      }
    }

    // Fallback: visible combobox whose displayed text is "All".
    const allComboboxes = queryAllDeep(document, '[role="combobox"]').filter((el) => {
      if (!isVisible(el)) return false;
      const txt = (el.textContent || "").trim().toLowerCase();
      return txt === "all" || txt.startsWith("all");
    });
    if (allComboboxes.length) return allComboboxes[0];

    return null;
  }

  function findControlsToggle() {
    const selectors = [
      '[data-automation-id="sheet-control-panel-toggle-expand"]',
      '#sheet_control_panel_header',
      '[aria-label="Controls"]',
    ];
    for (const sel of selectors) {
      const hit = queryAllDeep(document, sel).find((el) => isVisible(el));
      if (hit) return hit;
    }
    return null;
  }

  function isControlsExpanded() {
    const expanded = document.querySelector(
      '#sheet_control_panel_header[aria-expanded="true"], [data-automation-id="sheet-control-panel-toggle-expand"][aria-expanded="true"]'
    );
    if (expanded) return true;
    return Boolean(
      document.querySelector('[data-automation-id*="search_results_dropdown"]') ||
        document.querySelector('[data-automation-id*="search results dropdown"]')
    );
  }

  async function ensureControlsExpanded(timeoutMs = 30000) {
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) {
      if (isControlsExpanded()) return;
      const toggle = findControlsToggle();
      if (toggle) openWithMouseSequence(toggle);
      await sleep(400);
    }
  }

  async function waitSearchInput(dropdown, timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const inputs = [];
      for (const root of getRoots(document)) {
        inputs.push(...queryAllDeep(root, 'input[placeholder="Search value"], input[aria-label="Search value"], input[type="text"]'));
      }
      const visible = inputs.filter((el) => isVisible(el) && !el.disabled);
      if (visible.length) {
        const center = dropdown.getBoundingClientRect();
        visible.sort((a, b) => {
          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();
          const da = Math.hypot(ra.left - center.left, ra.top - center.top);
          const db = Math.hypot(rb.left - center.left, rb.top - center.top);
          return da - db;
        });
        return visible[0];
      }
      await sleep(120);
    }
    return null;
  }

  async function typeIntoAutocomplete(input, value) {
    const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    const setValue = (v) => (nativeSetter ? nativeSetter.call(input, v) : (input.value = v));
    input.focus();
    input.click();
    await sleep(50);
    setValue("");
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward", data: null }));
    await sleep(40);
    let current = "";
    for (const ch of String(value)) {
      current += ch;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: ch, bubbles: true }));
      setValue(current);
      input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: ch }));
      input.dispatchEvent(new KeyboardEvent("keyup", { key: ch, bubbles: true }));
      await sleep(20);
    }
  }

  function findPanelRoot(input, dropdown) {
    return (
      input.closest('.MuiPopover-paper, .MuiMenu-paper, .MuiPaper-root, [role="dialog"], [role="presentation"]') ||
      dropdown.closest('.MuiPopover-paper, .MuiMenu-paper, .MuiPaper-root, [role="dialog"], [role="presentation"]') ||
      document
    );
  }

  async function waitSearchButton(scopeRoot, timeoutMs = 10000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const btns = queryAllDeep(scopeRoot, "button, [role='button']");
      const btn = btns.find((el) => {
        if (!isVisible(el)) return false;
        const t = norm([el.getAttribute("data-automation-id"), el.textContent, el.getAttribute("aria-label"), el.getAttribute("title")].filter(Boolean).join(" "));
        return t.includes("paginatedsearchcomponentsearch") || t === "search" || t.endsWith("search");
      });
      if (btn) return btn;
      await sleep(120);
    }
    return null;
  }

  function findSelectAll(scopeRoot) {
    const byId = document.getElementById("option-select-all");
    if (byId && isVisible(byId)) return byId;
    const cands = queryAllDeep(scopeRoot, '[role="option"], li, div, span, label');
    return cands.find((el) => isVisible(el) && /select all results/i.test((el.textContent || "").trim())) || null;
  }

  async function clickMinimize() {
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      const btn = document.querySelector('button[data-automation-id="analysis_visual_dropdown_minimize"]');
      if (btn && isVisible(btn)) {
        btn.click();
        return;
      }
      await sleep(120);
    }
  }

  async function fillAndSearch() {
    await ensureControlsExpanded(30000);
    const idValue = await getIdValue();
    const dropdown = findDropdown();
    if (!dropdown) throw new Error("找不到下拉按钮（All 右侧三角）。");

    openWithMouseSequence(dropdown);
    await sleep(220);

    let input = await waitSearchInput(dropdown, 2500);
    if (!input) {
      openWithMouseSequence(dropdown);
      await sleep(220);
      input = await waitSearchInput(dropdown, 10000);
    }
    if (!input) throw new Error("找不到 Search value 输入框。");

    await typeIntoAutocomplete(input, idValue);
    if ((input.value || "").trim() !== idValue) throw new Error(`ID 未成功写入搜索框。当前值: "${input.value || ""}"`);

    const panelRoot = findPanelRoot(input, dropdown);
    const searchBtn = await waitSearchButton(panelRoot, 10000);
    if (!searchBtn) throw new Error("找不到 Search 按钮。");
    searchBtn.click();

    await sleep(2000);
    const selectAll = findSelectAll(panelRoot);
    if (!selectAll) throw new Error("找不到 Select all results。");
    selectAll.click();

    await sleep(250);
    await clickMinimize();
  }

  await clickReset();
  await sleep(300);
  await fillAndSearch();
  console.log("完成：已执行 click-reset + fill-id-and-search。");
})();
