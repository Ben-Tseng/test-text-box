/**
 * Run in QuickSight page console.
 * Flow:
 * 1) wait 10s
 * 2) expand Controls
 * 3) click menu -> Reset
 * 4) fill ID from clipboard/prompt -> Search
 * 5) wait 2s -> click #option-select-all
 * 6) click Minimize
 * 7) press Esc
 */
(async () => {
  const INITIAL_PAGE_SETTLE_MS = 10000;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const norm = (s) => (s || "").toLowerCase().replace(/[\s._-]+/g, "");
  const clean = (s) => String(s || "").replace(/\u00a0/g, " ").replace(/[\r\n\t]/g, "").trim();

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
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

  async function getIdValue() {
    try {
      if (navigator.clipboard?.readText) {
        const v = clean(await navigator.clipboard.readText());
        if (v) return v;
      }
    } catch (_) {}
    const v = clean(window.prompt("请输入或粘贴 ID:", ""));
    if (!v) throw new Error("未获取到 ID。");
    return v;
  }

  function findControlsToggle() {
    return queryAllDeep(
      document,
      '[data-automation-id="sheet-control-panel-toggle-expand"], #sheet_control_panel_header, [aria-label="Controls"]'
    ).find((el) => isVisible(el));
  }

  function isControlsExpanded() {
    return Boolean(
      document.querySelector('#sheet_control_panel_header[aria-expanded="true"], [data-automation-id="sheet-control-panel-toggle-expand"][aria-expanded="true"]') ||
        document.querySelector('[data-automation-id*="search_results_dropdown"]') ||
        document.querySelector('[data-automation-id*="sheet control menu button"]')
    );
  }

  async function ensureControlsExpanded(timeoutMs = 30000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (isControlsExpanded()) return;
      const toggle = findControlsToggle();
      if (toggle) openWithMouseSequence(toggle);
      await sleep(500);
    }
    throw new Error("未能展开 Controls。");
  }

  function findMenuButton() {
    const exact = queryAllDeep(
      document,
      'button[data-automation-id="sheet control menu button"][data-automation-context*="mcid_primary_decrypted equals"], button[data-automation-id="sheet.control.menu.button"][data-automation-context*="mcid_primary_decrypted equals"]'
    ).find((el) => isVisible(el));
    if (exact) return exact;
    return queryAllDeep(document, 'button[aria-haspopup="true"], [role="button"][aria-haspopup="true"]').find((el) => {
      if (!isVisible(el)) return false;
      const t = norm([el.getAttribute("data-automation-id"), el.getAttribute("data-automation-context"), el.getAttribute("aria-label"), el.getAttribute("title")].filter(Boolean).join(" "));
      return t.includes("sheetcontrolmenubutton") && t.includes("mcidprimarydecryptedequals");
    });
  }

  async function clickReset(timeoutMs = 10000) {
    const menuBtn = findMenuButton();
    if (!menuBtn) throw new Error("找不到三点菜单按钮。");
    openWithMouseSequence(menuBtn);
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const reset = queryAllDeep(document, '[role="menuitem"], li[role="menuitem"], [data-automation-id*="reset"]').find((el) => {
        if (!isVisible(el)) return false;
        const t = norm([el.getAttribute("data-automation-id"), el.textContent].filter(Boolean).join(" "));
        return t.includes("sheetcontrolreset") || t === "reset" || t.includes(" reset");
      });
      if (reset) {
        reset.click();
        return;
      }
      await sleep(120);
    }
    throw new Error("未找到 Reset。");
  }

  function findDropdown() {
    const selectors = [
      '[role="combobox"][data-automation-id="sheet_control_search_results_dropdown"][data-automation-context*="mcid primary_decrypted equals"]',
      '[role="combobox"][data-automation-id="sheet control search results dropdown"][data-automation-context*="mcid primary decrypted equals"]',
      '[role="combobox"][data-automation-id="sheet_control_search_results_dropdown"]',
      '[role="combobox"][data-automation-id="sheet control search results dropdown"]',
    ];
    for (const sel of selectors) {
      const hit = queryAllDeep(document, sel).find((el) => isVisible(el));
      if (hit) return hit;
    }
    return null;
  }

  async function waitSearchInput(timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const input = queryAllDeep(
        document,
        'input[placeholder="Search value"], input[aria-label="Search value"], input[role="combobox"]'
      ).find((el) => isVisible(el) && !el.disabled);
      if (input) return input;
      await sleep(120);
    }
    return null;
  }

  function setInputValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (setter) setter.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function findSearchButton(anchorInput) {
    const panel =
      anchorInput.closest('.MuiPopover-paper, .MuiMenu-paper, .MuiPaper-root, [role="dialog"], [role="presentation"]') ||
      document;
    return queryAllDeep(panel, "button, [role='button']").find((el) => {
      if (!isVisible(el)) return false;
      const t = norm([el.getAttribute("data-automation-id"), el.textContent, el.getAttribute("aria-label"), el.getAttribute("title")].filter(Boolean).join(" "));
      return t.includes("paginatedsearchcomponentsearch") || t === "search" || t.endsWith("search");
    });
  }

  function clickEsc() {
    const target = document.activeElement || document.body || document.documentElement;
    const init = { key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true, cancelable: true };
    target.dispatchEvent(new KeyboardEvent("keydown", init));
    target.dispatchEvent(new KeyboardEvent("keyup", init));
  }

  await sleep(INITIAL_PAGE_SETTLE_MS);
  await ensureControlsExpanded(30000);

  await clickReset(10000);
  await sleep(300);

  const idValue = await getIdValue();
  const dropdown = findDropdown();
  if (!dropdown) throw new Error("找不到下拉三角。");
  openWithMouseSequence(dropdown);
  await sleep(260);

  let input = await waitSearchInput(2500);
  if (!input) {
    openWithMouseSequence(dropdown);
    await sleep(260);
    input = await waitSearchInput(10000);
  }
  if (!input) throw new Error("找不到 Search value 输入框。");

  input.focus();
  setInputValue(input, idValue);
  await sleep(220);

  const searchBtn = findSearchButton(input);
  if (!searchBtn) throw new Error("找不到 Search 按钮。");
  searchBtn.click();

  await sleep(2000);
  const selectAll = document.getElementById("option-select-all");
  if (!selectAll || !isVisible(selectAll)) throw new Error('找不到 #option-select-all。');
  selectAll.click();

  await sleep(250);
  const minimizeBtn = document.querySelector('button[data-automation-id="analysis_visual_dropdown_minimize"]');
  if (minimizeBtn && isVisible(minimizeBtn)) minimizeBtn.click();

  await sleep(120);
  clickEsc();
  console.log("完成：Reset -> Fill -> Search -> Select all -> Minimize -> Esc", { idValue });
})();
