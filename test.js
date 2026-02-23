(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const norm = (s) => (s || "").toLowerCase().replace(/[\s._-]+/g, "");

  function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && st.display !== "none" && st.visibility !== "hidden";
  }

  function fireMouseSequence(el) {
    const events = ["pointerdown", "mousedown", "pointerup", "mouseup", "click"];
    for (const type of events) {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    }
  }

  function fireKey(el, key) {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    el.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true }));
  }

  function findDropdown() {
    const cands = Array.from(document.querySelectorAll(
      '[role="combobox"], [data-automation-id*="search_results_dropdown"], [data-automation-id*="search results dropdown"]'
    )).filter(isVisible);

    let best = null, bestScore = -1e9;
    for (const el of cands) {
      const txt = norm([
        el.getAttribute("data-automation-id"),
        el.getAttribute("data-automation-context"),
        el.getAttribute("aria-label"),
        el.getAttribute("title"),
        el.textContent
      ].filter(Boolean).join(" "));
      let score = 0;
      if (txt.includes("searchresultsdropdown")) score += 8;
      if (txt.includes("mcidprimaryencryptedequals")) score += 5;
      if (txt.includes("all")) score += 1;
      if ((el.getAttribute("aria-haspopup") || "").toLowerCase().includes("listbox")) score += 1;
      if (score > bestScore) { bestScore = score; best = el; }
    }
    return best;
  }

  function isExpanded(el) {
    return (el?.getAttribute("aria-expanded") || "").toLowerCase() === "true";
  }

  const dropdown = findDropdown();
  if (!dropdown) throw new Error("找不到下拉按钮");

  // 尝试1：常规 click
  dropdown.click();
  await sleep(150);
  if (isExpanded(dropdown)) return console.log("已展开(方式1 click)");

  // 尝试2：完整鼠标事件序列（MUI 常用）
  fireMouseSequence(dropdown);
  await sleep(150);
  if (isExpanded(dropdown)) return console.log("已展开(方式2 mouse sequence)");

  // 尝试3：先 focus 再 ArrowDown / Enter
  dropdown.focus();
  fireKey(dropdown, "ArrowDown");
  await sleep(120);
  if (isExpanded(dropdown)) return console.log("已展开(方式3 ArrowDown)");

  fireKey(dropdown, "Enter");
  await sleep(120);
  if (isExpanded(dropdown)) return console.log("已展开(方式4 Enter)");

  throw new Error("已尝试4种方式，仍未展开。可能在 iframe/shadowDOM 或被遮罩层拦截。");
})();
