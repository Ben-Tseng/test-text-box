/**
 * 在页面 Console 执行。
 * 功能：
 * 1) 获取一串 ID（可从指定文本框读取，或弹窗输入）
 * 2) 点击下拉按钮（All 右侧三角）
 * 3) 把 ID 填入 Search value 输入框
 * 4) 点击 Search
 * 5) 等2秒后点击 Select all results
 */
(async () => {
  // 如果你想从页面某个输入框读取 ID，把它改成对应 selector；留空则用 prompt 输入。
  const SOURCE_INPUT_SELECTOR = "";
  const TARGET_CONTEXT_KEYWORD = "mcid_primary_decrypted equals";

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
      } catch (_) {
        // cross-origin iframe ignored
      }
    }
    return roots;
  }

  function queryAllDeep(root, selector) {
    const out = [];
    const walk = (r) => {
      out.push(...r.querySelectorAll(selector));
      const all = r.querySelectorAll("*");
      for (const el of all) if (el.shadowRoot) walk(el.shadowRoot);
    };
    walk(root);
    return out;
  }

  function pickDropdown() {
    const roots = getRoots(document);
    const exactSelectors = [
      '[role="combobox"][data-automation-id="sheet_control_search_results_dropdown"][data-automation-context="mcid primary_decrypted equals"]',
      '[role="combobox"][data-automation-id="sheet control search results dropdown"][data-automation-context="mcid primary decrypted equals"]',
      '[role="combobox"][data-automation-id="sheet_control_search_results_dropdown"]',
      '[role="combobox"][data-automation-id="sheet control search results dropdown"]',
    ];
    for (const root of roots) {
      for (const selector of exactSelectors) {
        const hit = queryAllDeep(root, selector).find((el) => isVisible(el));
        if (hit) return hit;
      }
    }

    let best = null;
    let bestScore = -1e9;
    for (const root of roots) {
      const cands = queryAllDeep(
        root,
        '[role="combobox"], [data-automation-id*="search_results_dropdown"], [data-automation-id*="search results dropdown"]'
      );
      for (const el of cands) {
        const text = [
          el.getAttribute("data-automation-id"),
          el.getAttribute("data-automation-context"),
          el.getAttribute("aria-label"),
          el.getAttribute("title"),
          el.textContent,
        ]
          .filter(Boolean)
          .join(" ");
        const n = norm(text);
        let score = 0;
        if (n.includes("searchresultsdropdown")) score += 8;
        if (n.includes(norm(TARGET_CONTEXT_KEYWORD))) score += 5;
        if (n.includes("mcidprimarydecryptedequals")) score += 5;
        if (n.includes("all")) score += 1;
        if ((el.getAttribute("aria-haspopup") || "").toLowerCase().includes("listbox")) score += 1;
        if (!isVisible(el)) score -= 100;
        if (score > bestScore) {
          bestScore = score;
          best = el;
        }
      }
    }
    return bestScore >= 4 ? best : null;
  }

  async function getIdValue() {
    const clean = (v) =>
      String(v || "")
        .replace(/\u00a0/g, " ")
        .replace(/[\r\n\t]/g, "")
        .trim();

    if (SOURCE_INPUT_SELECTOR) {
      const src = document.querySelector(SOURCE_INPUT_SELECTOR);
      if (!src) throw new Error(`找不到来源文本框: ${SOURCE_INPUT_SELECTOR}`);
      const v = "value" in src ? src.value : src.textContent;
      const out = clean(v);
      if (!out) throw new Error("来源文本框为空，请先输入 ID。");
      return out;
    }
    // 优先读取系统剪贴板（需要在用户手势后/安全上下文中允许）。
    try {
      if (navigator.clipboard?.readText) {
        const clip = clean(await navigator.clipboard.readText());
        if (clip) return clip;
      }
    } catch (_) {
      // ignore and fallback to prompt
    }

    const v = window.prompt("请输入要搜索的 ID（可直接粘贴）:", "");
    const out = clean(v);
    if (!out) throw new Error("未输入 ID，已取消。");
    return out;
  }

  function openDropdownWithMouseSequence(el) {
    const events = ["pointerdown", "mousedown", "pointerup", "mouseup", "click"];
    for (const type of events) {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    }
  }

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function pickBestSearchInput(inputs, dropdown) {
    if (!inputs.length) return null;
    const dropdownCenter = centerOf(dropdown);
    let best = null;
    let bestScore = -Infinity;
    for (const el of inputs) {
      const p = norm(el.getAttribute("placeholder"));
      const a = norm(el.getAttribute("aria-label"));
      const exact = p === "searchvalue" || a === "searchvalue";
      const scoreByText = exact ? 100 : 10;
      const scoreByDistance = -distance(centerOf(el), dropdownCenter);
      const score = scoreByText + scoreByDistance;
      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    }
    return best;
  }

  async function waitSearchInput(dropdown, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const allVisibleInputs = [];
      for (const root of getRoots(document)) {
        const inputs = queryAllDeep(root, 'input[placeholder="Search value"], input[aria-label="Search value"], input[type="text"]');
        allVisibleInputs.push(...inputs.filter((el) => isVisible(el) && !el.disabled));
      }
      const target = pickBestSearchInput(allVisibleInputs, dropdown);
      if (target) return target;
      await sleep(120);
    }
    return null;
  }

  async function typeIntoAutocomplete(input, value) {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    const setValue = (v) => {
      if (nativeSetter) nativeSetter.call(input, v);
      else input.value = v;
    };

    input.focus();
    input.click();
    await sleep(60);

    // 清空旧值
    setValue("");
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward", data: null }));
    await sleep(40);

    // 逐字符输入，触发 MUI Autocomplete 的内部监听
    let current = "";
    for (const ch of String(value)) {
      current += ch;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: ch, bubbles: true }));
      setValue(current);
      input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: ch }));
      input.dispatchEvent(new KeyboardEvent("keyup", { key: ch, bubbles: true }));
      await sleep(25);
    }

    // 不触发 blur/ArrowDown，避免组件将当前输入判定为未确认并清空。
  }

  function findPanelRoot(searchInput, dropdown) {
    const fromInput = searchInput?.closest(
      '.MuiPopover-paper, .MuiMenu-paper, .MuiPaper-root, [role="dialog"], [role="presentation"]'
    );
    if (fromInput) return fromInput;

    const fromDropdown = dropdown?.closest(
      '.MuiPopover-paper, .MuiMenu-paper, .MuiPaper-root, [role="dialog"], [role="presentation"]'
    );
    if (fromDropdown) return fromDropdown;

    return document;
  }

  function findSearchButtonInPanel(scopeRoot) {
    if (window.jQuery) {
      const $ = window.jQuery;
      const $btn = $(scopeRoot)
        .find('button[data-automation-id*="search"], button')
        .filter((_, el) => norm($(el).text()) === "search" || norm($(el).text()).endsWith("search"))
        .first();
      if ($btn.length && isVisible($btn[0])) return $btn[0];
    }

    const btns = queryAllDeep(scopeRoot, 'button, [role="button"]');
    return btns.find((el) => {
      if (!isVisible(el)) return false;
      const t = norm(
        [
          el.getAttribute("data-automation-id"),
          el.getAttribute("aria-label"),
          el.getAttribute("title"),
          el.textContent,
        ]
          .filter(Boolean)
          .join(" ")
      );
      return t.includes("paginatedsearchcomponentsearch") || t === "search" || t.endsWith("search");
    }) || null;
  }

  async function waitSearchButton(scopeRoot, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const btn = findSearchButtonInPanel(scopeRoot);
      if (btn) return btn;
      await sleep(120);
    }
    return null;
  }

  function findMinimizeButton() {
    const byAutomationId = document.querySelector(
      'button[data-automation-id="analysis_visual_dropdown_minimize"]'
    );
    if (byAutomationId && isVisible(byAutomationId)) return byAutomationId;

    const candidates = queryAllDeep(document, 'button, [role="button"]');
    for (const el of candidates) {
      if (!isVisible(el)) continue;
      const t = norm(
        [
          el.getAttribute("data-automation-id"),
          el.getAttribute("aria-label"),
          el.getAttribute("title"),
          el.textContent,
        ]
          .filter(Boolean)
          .join(" ")
      );
      if (t.includes("analysisvisualdropdownminimize") || t.includes("minimize")) {
        return el;
      }
    }
    return null;
  }

  async function waitMinimizeButton(timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const btn = findMinimizeButton();
      if (btn) return btn;
      await sleep(120);
    }
    return null;
  }

  function findSelectAllInPanel(scopeRoot) {
    const byId = document.getElementById("option-select-all");
    if (byId && isVisible(byId)) return byId;

    if (window.jQuery) {
      const $ = window.jQuery;
      const $byId = $("#option-select-all");
      if ($byId.length && isVisible($byId[0])) return $byId[0];

      const $hit = $(scopeRoot)
        .find('[role="option"], li, div, span, label')
        .filter((_, el) => /select all results/i.test($(el).text()))
        .first();
      if ($hit.length) return $hit[0].closest('[role="option"], li, div, label') || $hit[0];
    }

    const candidates = queryAllDeep(scopeRoot, '[role="option"], li, div, span, label');
    for (const el of candidates) {
      if (!isVisible(el)) continue;
      if (/select all results/i.test((el.textContent || "").trim())) {
        return el.closest('[role="option"], li, div, label') || el;
      }
    }
    return null;
  }

  const idValue = await getIdValue();
  const dropdown = pickDropdown();
  if (!dropdown) throw new Error("找不到下拉按钮（All 右侧三角）。");

  // 固定用你验证有效的方式2：mouse sequence。
  openDropdownWithMouseSequence(dropdown);
  await sleep(220);

  let searchInput = await waitSearchInput(dropdown, 1200);
  if (!searchInput) {
    // 兜底再触发一次，处理偶发首次未展开。
    openDropdownWithMouseSequence(dropdown);
    await sleep(220);
    searchInput = await waitSearchInput(dropdown, 10000);
  }
  if (!searchInput) throw new Error("下拉已点击，但找不到 Search value 输入框。");

  searchInput.focus();
  await typeIntoAutocomplete(searchInput, idValue);
  if (!searchInput.isConnected || !isVisible(searchInput)) {
    // 输入过程中面板被关闭时，重新展开再输入一次。
    openDropdownWithMouseSequence(dropdown);
    await sleep(220);
    searchInput = await waitSearchInput(dropdown, 3000);
    if (!searchInput) throw new Error("输入后面板关闭，且无法重新定位 Search value 输入框。");
    await typeIntoAutocomplete(searchInput, idValue);
  }
  if ((searchInput.value || "").trim() !== idValue) {
    throw new Error(`ID 未成功写入搜索框。当前值: "${searchInput.value || ""}"`);
  }
  await sleep(250);

  const panelRoot = findPanelRoot(searchInput, dropdown);
  const searchBtn = await waitSearchButton(panelRoot, 10000);
  if (!searchBtn) throw new Error("已填入 ID，但找不到 Search 按钮。");

  searchBtn.click();
  await sleep(2000);

  const selectAll = findSelectAllInPanel(panelRoot);
  if (!selectAll) throw new Error("Search 已点击，但找不到 Select all results。");
  selectAll.click();

  await sleep(250);
  const minimizeBtn = await waitMinimizeButton(10000);
  if (!minimizeBtn) throw new Error("已完成 Select all results，但找不到 Minimize 按钮。");
  minimizeBtn.click();

  console.log("完成：已填入 ID，点击 Search，勾选 Select all results，并点击 Minimize。", { idValue });
})();
