/**
 * Combined workflow on current QuickSight page:
 * 1) click-reset.js logic
 * 2) wait 1s
 * 3) fill-id-and-search.js logic (as-is)
 */
(async () => {
  async function runClickReset() {
    const TARGET_FIELD = "mcid_primary_decrypted equals";
    const EXACT_MENU_BUTTON_SELECTOR = [
      'button[data-automation-id="sheet control menu button"][data-automation-context="mcid_primary_decrypted equals"]',
      'button[data-automation-id="sheet.control.menu.button"][data-automation-context="mcid_primary_decrypted equals"]',
      'button[data-automation-id="sheet control menubutton"][data-automation-context="mcid_primary_decrypted equals"]',
    ].join(", ");

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const norm = (s) => (s || "").toLowerCase().replace(/[\s._-]+/g, "");

    function isVisible(el) {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    }

    function collectRoots(startDocument) {
      const roots = [startDocument];
      for (const frame of startDocument.querySelectorAll("iframe")) {
        try {
          if (frame.contentDocument) roots.push(...collectRoots(frame.contentDocument));
        } catch (_) {}
      }
      return roots;
    }

    function collectInteractiveCandidates(root) {
      const result = [];
      const walk = (nodeRoot) => {
        const candidates = nodeRoot.querySelectorAll('button, [role="button"], [aria-haspopup="true"], [role="menuitem"], li[role="menuitem"]');
        for (const el of candidates) result.push(el);
        const all = nodeRoot.querySelectorAll("*");
        for (const el of all) {
          if (el.shadowRoot) walk(el.shadowRoot);
        }
      };
      walk(root);
      return result;
    }

    function openWithMouseSequence(el) {
      const events = ["pointerdown", "mousedown", "pointerup", "mouseup", "click"];
      for (const type of events) {
        el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
      }
    }

    function scoreMenuButton(el) {
      const attrs = [
        el.getAttribute("data-automation-id"),
        el.getAttribute("data-automation-context"),
        el.getAttribute("aria-label"),
        el.getAttribute("title"),
        el.textContent,
      ]
        .filter(Boolean)
        .join(" ");
      const n = norm(attrs);
      const field = norm(TARGET_FIELD);
      let score = 0;
      if (n.includes("sheetcontrolmenubutton")) score += 5;
      if (n.includes("options")) score += 3;
      if (n.includes(field)) score += 4;
      if (n.includes("mcidprimarydecryptedequals")) score += 4;
      if ((el.getAttribute("aria-haspopup") || "").toLowerCase() === "true") score += 1;
      if (el.tagName.toLowerCase() === "button") score += 1;
      if (!isVisible(el)) score -= 100;
      return score;
    }

    function findBestMenuButton() {
      const roots = collectRoots(document);
      for (const root of roots) {
        const exact = root.querySelector(EXACT_MENU_BUTTON_SELECTOR);
        if (exact && isVisible(exact)) return exact;
      }

      let best = null;
      let bestScore = -Infinity;
      for (const root of roots) {
        const candidates = collectInteractiveCandidates(root);
        for (const el of candidates) {
          const score = scoreMenuButton(el);
          if (score > bestScore) {
            best = el;
            bestScore = score;
          }
        }
      }
      return bestScore >= 4 ? best : null;
    }

    async function waitForMenuButton(timeoutMs = 8000) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const el = findBestMenuButton();
        if (el) return el;
        await sleep(100);
      }
      return null;
    }

    function isResetItem(el, openedMenusOnly) {
      if (!el) return false;
      if (!isVisible(el)) return false;
      const automationId = norm(el.getAttribute("data-automation-id"));
      const text = norm((el.textContent || "").trim());
      if (openedMenusOnly) {
        const menuContainer = el.closest('[role="menu"], .MuiMenu-paper, .MuiPopover-paper');
        if (!menuContainer || !isVisible(menuContainer)) return false;
      }
      return automationId.includes("reset") || text === "reset" || text.includes("reset");
    }

    async function findResetItem(timeoutMs = 8000) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const roots = collectRoots(document);
        const candidates = [];
        for (const root of roots) {
          candidates.push(...collectInteractiveCandidates(root));
        }
        const resetInOpenMenu = candidates.find((el) => isResetItem(el, true));
        if (resetInOpenMenu) return resetInOpenMenu;
        const anyReset = candidates.find((el) => isResetItem(el, false));
        if (anyReset) return anyReset;
        await sleep(100);
      }
      return null;
    }

    const menuButton = await waitForMenuButton(10000);
    if (!menuButton) throw new Error("找不到三点菜单按钮。");
    openWithMouseSequence(menuButton);
    await sleep(250);
    const resetItem = await findResetItem(8000);
    if (!resetItem) throw new Error("点击了三点菜单，但没找到 Reset 选项。");
    resetItem.click();
  }

  async function runFillIdAndSearch() {
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
        } catch (_) {}
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
      try {
        if (navigator.clipboard?.readText) {
          const clip = clean(await navigator.clipboard.readText());
          if (clip) return clip;
        }
      } catch (_) {}

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
        await sleep(25);
      }
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
      const byAutomationIdWithSpace = document.querySelector(
        'button[data-automation-id="analysis_visual dropdown_minimize"]'
      );
      if (byAutomationIdWithSpace && isVisible(byAutomationIdWithSpace)) return byAutomationIdWithSpace;

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

    function findAdditionalMinimizeButton() {
      const selectors = [
        'button[data-automation-id="analysis_visual dropdown_minimize"]',
        'button[title="Minimize"][aria-label*="Related sellers"]',
        'button[aria-label*="Minimize"][aria-label*="Related sellers"]',
      ];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && isVisible(el)) return el;
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

    openDropdownWithMouseSequence(dropdown);
    await sleep(220);

    let searchInput = await waitSearchInput(dropdown, 1200);
    if (!searchInput) {
      openDropdownWithMouseSequence(dropdown);
      await sleep(220);
      searchInput = await waitSearchInput(dropdown, 10000);
    }
    if (!searchInput) throw new Error("下拉已点击，但找不到 Search value 输入框。");

    searchInput.focus();
    await typeIntoAutocomplete(searchInput, idValue);
    if (!searchInput.isConnected || !isVisible(searchInput)) {
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
    await sleep(200);

    const extraMinimizeBtn = findAdditionalMinimizeButton();
    if (extraMinimizeBtn) extraMinimizeBtn.click();
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  await runClickReset();
  await sleep(2000);
  await runFillIdAndSearch();
  console.log("完成：已执行 click-reset + fill-id-and-search。");
})();
