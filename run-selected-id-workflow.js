/**
 * Usage (run in browser DevTools Console):
 * 1) Select an ID text on current page (or script will prompt)
 * 2) Paste and run this script
 * 3) It opens target QuickSight sheet, runs Reset -> Search flow, then sends Esc
 */
(async () => {
  const TARGET_URL =
    "https://eu-west-1.quicksight.aws.amazon.com/sn/account/amazonbi/dashboards/1c33135c-4187-40aa-98a9-26720ea3678f/sheets/1c33135c-4187-40aa-98a9-26720ea3678f_77e89b5c-5e2d-46e4-a095-e8365b0299af";
  const INITIAL_PAGE_SETTLE_MS = 3000;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const norm = (s) => (s || "").toLowerCase().replace(/[\s._-]+/g, "");
  const clean = (s) => String(s || "").replace(/\u00a0/g, " ").replace(/[\r\n\t]/g, "").trim();

  function getSelectedId() {
    const fromSelection = clean(window.getSelection?.().toString() || "");
    if (fromSelection) return fromSelection;
    const v = window.prompt("请输入或粘贴 ID:", "");
    const out = clean(v);
    if (!out) throw new Error("未获取到 ID，流程取消。");
    return out;
  }

  function isVisible(win, el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = win.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
  }

  function queryAllDeep(root, selector) {
    const out = [];
    const walk = (r) => {
      out.push(...r.querySelectorAll(selector));
      const all = r.querySelectorAll("*");
      for (const el of all) {
        if (el.shadowRoot) walk(el.shadowRoot);
      }
    };
    walk(root);
    return out;
  }

  function openWithMouseSequence(win, el) {
    const events = ["pointerdown", "mousedown", "pointerup", "mouseup", "click"];
    for (const type of events) {
      el.dispatchEvent(new win.MouseEvent(type, { bubbles: true, cancelable: true, view: win }));
    }
  }

  async function waitForWindowReady(win, timeoutMs = 90000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        if (win.closed) throw new Error("目标窗口已关闭。");
        if (win.document?.readyState === "complete" || win.document?.readyState === "interactive") {
          return win.document;
        }
      } catch (_) {
        // Still navigating or cross-origin transition; keep waiting.
      }
      await sleep(250);
    }
    throw new Error("等待目标页面加载超时。");
  }

  async function waitForKeyElements(doc, win, timeoutMs = 45000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const menuBtn = findMenuButton(doc, win);
      const dropdown = findDropdown(doc, win);
      if (menuBtn || dropdown) return;
      await sleep(150);
    }
    throw new Error("页面已打开，但关键元素未出现（menu/dropdown）。");
  }

  function findMenuButton(doc, win) {
    const exact = queryAllDeep(
      doc,
      'button[data-automation-id="sheet control menu button"][data-automation-context*="mcid_primary_decrypted equals"], button[data-automation-id="sheet.control.menu.button"][data-automation-context*="mcid_primary_decrypted equals"]'
    ).find((el) => isVisible(win, el));
    if (exact) return exact;

    const cands = queryAllDeep(doc, 'button[aria-haspopup="true"], [role="button"][aria-haspopup="true"]');
    let best = null;
    let bestScore = -Infinity;
    for (const el of cands) {
      if (!isVisible(win, el)) continue;
      const t = norm(
        [
          el.getAttribute("data-automation-id"),
          el.getAttribute("data-automation-context"),
          el.getAttribute("aria-label"),
          el.getAttribute("title"),
        ]
          .filter(Boolean)
          .join(" ")
      );
      let score = 0;
      if (t.includes("sheetcontrolmenubutton")) score += 8;
      if (t.includes("mcidprimarydecryptedequals")) score += 5;
      if (t.includes("options")) score += 2;
      if (score > bestScore) {
        best = el;
        bestScore = score;
      }
    }
    return bestScore >= 5 ? best : null;
  }

  async function runClickReset(doc, win) {
    const menuBtn = findMenuButton(doc, win);
    if (!menuBtn) throw new Error("找不到三点菜单按钮。");
    openWithMouseSequence(win, menuBtn);
    await sleep(260);

    const start = Date.now();
    while (Date.now() - start < 10000) {
      const items = queryAllDeep(doc, '[role="menuitem"], li[role="menuitem"], [data-automation-id*="reset"]');
      const reset = items.find((el) => {
        if (!isVisible(win, el)) return false;
        const t = norm(
          [
            el.getAttribute("data-automation-id"),
            el.textContent,
            el.getAttribute("aria-label"),
            el.getAttribute("title"),
          ]
            .filter(Boolean)
            .join(" ")
        );
        return t.includes("sheetcontrolreset") || t === "reset" || t.includes(" reset");
      });
      if (reset) {
        reset.click();
        return;
      }
      await sleep(120);
    }
    throw new Error("未找到 Reset 菜单项。");
  }

  function findDropdown(doc, win) {
    const exactSelectors = [
      '[role="combobox"][data-automation-id="sheet_control_search_results_dropdown"][data-automation-context*="mcid primary_decrypted equals"]',
      '[role="combobox"][data-automation-id="sheet control search results dropdown"][data-automation-context*="mcid primary decrypted equals"]',
      '[role="combobox"][data-automation-id="sheet_control_search_results_dropdown"]',
      '[role="combobox"][data-automation-id="sheet control search results dropdown"]',
    ];
    for (const selector of exactSelectors) {
      const hit = queryAllDeep(doc, selector).find((el) => isVisible(win, el));
      if (hit) return hit;
    }
    return null;
  }

  async function waitSearchInput(doc, win, timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const input = queryAllDeep(
        doc,
        'input[placeholder="Search value"], input[aria-label="Search value"], input[role="combobox"]'
      ).find((el) => isVisible(win, el) && !el.disabled);
      if (input) return input;
      await sleep(120);
    }
    return null;
  }

  function setInputValue(win, input, value) {
    const nativeSetter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value")?.set;
    if (nativeSetter) nativeSetter.call(input, value);
    else input.value = value;
    input.dispatchEvent(new win.Event("input", { bubbles: true }));
  }

  function findSearchButton(doc, win, anchorInput) {
    const panel = anchorInput.closest(
      '.MuiPopover-paper, .MuiMenu-paper, .MuiPaper-root, [role="dialog"], [role="presentation"]'
    ) || doc;

    if (win.jQuery) {
      const $ = win.jQuery;
      const $btn = $(panel)
        .find('button[data-automation-id*="search"], button')
        .filter((_, el) => norm($(el).text()) === "search" || norm($(el).text()).endsWith("search"))
        .first();
      if ($btn.length && isVisible(win, $btn[0])) return $btn[0];
    }

    const btns = queryAllDeep(panel, 'button, [role="button"]');
    return (
      btns.find((el) => {
        if (!isVisible(win, el)) return false;
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
      }) || null
    );
  }

  function findSelectAll(doc, win) {
    const byId = doc.getElementById("option-select-all");
    if (byId && isVisible(win, byId)) return byId;

    const candidates = queryAllDeep(doc, '[role="option"], li, div, span, label');
    return (
      candidates.find((el) => isVisible(win, el) && /select all results/i.test((el.textContent || "").trim())) || null
    );
  }

  async function runFillSearch(doc, win, idValue) {
    const dropdown = findDropdown(doc, win);
    if (!dropdown) throw new Error("找不到下拉三角按钮。");
    openWithMouseSequence(win, dropdown);
    await sleep(260);

    let input = await waitSearchInput(doc, win, 2500);
    if (!input) {
      openWithMouseSequence(win, dropdown);
      await sleep(260);
      input = await waitSearchInput(doc, win, 10000);
    }
    if (!input) throw new Error("找不到 Search value 输入框。");

    input.focus();
    setInputValue(win, input, idValue);
    await sleep(220);

    const searchBtn = findSearchButton(doc, win, input);
    if (!searchBtn) throw new Error("找不到 Search 按钮。");
    searchBtn.click();

    await sleep(2000);
    const selectAll = findSelectAll(doc, win);
    if (!selectAll) throw new Error('找不到 "Select all results"。');
    selectAll.click();

    await sleep(250);
    const minimizeBtn = doc.querySelector('button[data-automation-id="analysis_visual_dropdown_minimize"]');
    if (minimizeBtn && isVisible(win, minimizeBtn)) minimizeBtn.click();
  }

  function sendEscape(win, doc) {
    const target = doc.activeElement || doc.body || doc.documentElement;
    const evInit = {
      key: "Escape",
      code: "Escape",
      keyCode: 27,
      which: 27,
      bubbles: true,
      cancelable: true,
    };
    target.dispatchEvent(new win.KeyboardEvent("keydown", evInit));
    target.dispatchEvent(new win.KeyboardEvent("keyup", evInit));
  }

  const idValue = getSelectedId();
  const w = window.open(TARGET_URL, "_blank");
  if (!w) throw new Error("浏览器阻止了弹窗，请允许弹窗后重试。");

  const doc = await waitForWindowReady(w, 90000);
  await sleep(INITIAL_PAGE_SETTLE_MS); // Wait 3s for full page settle before any actions
  await waitForKeyElements(doc, w, 45000);

  await runClickReset(doc, w);
  await sleep(400);
  await runFillSearch(doc, w, idValue);
  await sleep(200);
  sendEscape(w, doc);

  console.log("完成：已打开目标页，执行 Reset + Search + Select all，并发送 Esc。", { idValue });
})();
