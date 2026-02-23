/**
 * 在页面 Console 执行。
 * 功能：
 * 1) 获取一串 ID（可从指定文本框读取，或弹窗输入）
 * 2) 点击下拉按钮（All 右侧三角）
 * 3) 把 ID 填入 Search value 输入框
 * 4) 点击 Search 按钮
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

  function pickMenuButton() {
    const roots = getRoots(document);
    let best = null;
    let bestScore = -1e9;
    for (const root of roots) {
      const cands = queryAllDeep(
        root,
        'button[aria-haspopup="true"], [role="button"][aria-haspopup="true"], [data-automation-id*="menu button"], [data-automation-id*="menubutton"]'
      );
      for (const el of cands) {
        const n = norm(
          [
            el.getAttribute("data-automation-id"),
            el.getAttribute("data-automation-context"),
            el.getAttribute("aria-label"),
            el.getAttribute("title"),
            el.textContent,
          ].filter(Boolean).join(" ")
        );
        let score = 0;
        if (n.includes("sheetcontrolmenubutton") || n.includes("sheetcontrolmenubutton")) score += 8;
        if (n.includes(norm(TARGET_CONTEXT_KEYWORD))) score += 6;
        if (n.includes("options")) score += 2;
        if (n.includes("mcidprimarydecryptedequals")) score += 4;
        if (!isVisible(el)) score -= 100;
        if (score > bestScore) {
          bestScore = score;
          best = el;
        }
      }
    }
    return bestScore >= 5 ? best : null;
  }

  function getIdValue() {
    if (SOURCE_INPUT_SELECTOR) {
      const src = document.querySelector(SOURCE_INPUT_SELECTOR);
      if (!src) throw new Error(`找不到来源文本框: ${SOURCE_INPUT_SELECTOR}`);
      const v = "value" in src ? src.value : src.textContent;
      if (!v || !String(v).trim()) throw new Error("来源文本框为空，请先输入 ID。");
      return String(v).trim();
    }
    const v = window.prompt("请输入要搜索的 ID（可多值，按你的页面支持格式输入）:", "");
    if (!v || !v.trim()) throw new Error("未输入 ID，已取消。");
    return v.trim();
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

  function setReactInputValue(input, value) {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    const previous = input.value;

    input.focus();
    input.select?.();

    if (nativeSetter) nativeSetter.call(input, "");
    else input.value = "";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward", data: null }));

    // 优先走真实输入路径，部分 React/MUI 组件只认它。
    const inserted = document.execCommand && document.execCommand("insertText", false, value);
    if (!inserted || input.value !== value) {
      if (nativeSetter) nativeSetter.call(input, value);
      else input.value = value;
      const tracker = input._valueTracker;
      if (tracker) tracker.setValue(previous);
      input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
    }
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function waitSearchButton(timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      for (const root of getRoots(document)) {
        const btns = queryAllDeep(root, 'button, [role="button"]');
        const btn = btns.find((el) => {
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
        });
        if (btn) return btn;
      }
      await sleep(120);
    }
    return null;
  }

  const idValue = getIdValue();
  const menuButton = pickMenuButton();
  if (menuButton) {
    // 先点你提供的三点菜单按钮，展开筛选面板。
    openDropdownWithMouseSequence(menuButton);
    await sleep(240);
  }

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
  setReactInputValue(searchInput, idValue);
  if ((searchInput.value || "").trim() !== idValue) {
    throw new Error(`ID 未成功写入搜索框。当前值: "${searchInput.value || ""}"`);
  }
  await sleep(120);

  const searchBtn = await waitSearchButton(10000);
  if (!searchBtn) throw new Error("已填入 ID，但找不到 Search 按钮。");

  searchBtn.click();
  console.log("完成：已填入 ID 并点击 Search。", { idValue });
})();
