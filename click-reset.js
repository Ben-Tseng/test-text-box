/**
 * Usage:
 * 1) Open target page
 * 2) Open DevTools Console
 * 3) Paste this file content and run
 */
(async () => {
  const TARGET_FIELD = "mcid_primary_decrypted equals";

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
      } catch (_) {
        // Cross-origin iframe; skip.
      }
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

  function describeElement(el) {
    if (!el) return "";
    const parts = [
      el.tagName.toLowerCase(),
      el.getAttribute("data-automation-id") || "",
      el.getAttribute("data-automation-context") || "",
      el.getAttribute("aria-label") || "",
      el.getAttribute("title") || "",
      (el.textContent || "").trim().slice(0, 60),
    ].filter(Boolean);
    return parts.join(" | ");
  }

  function findBestMenuButton() {
    const roots = collectRoots(document);
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
  if (!menuButton) {
    const roots = collectRoots(document);
    const scored = [];
    for (const root of roots) {
      for (const el of collectInteractiveCandidates(root)) {
        const score = scoreMenuButton(el);
        if (score > -50) scored.push({ score, desc: describeElement(el) });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    console.log("候选按钮(前10):", scored.slice(0, 10));
    throw new Error("找不到三点菜单按钮。请确认字段名是否为 mcid_primary_decrypted equals，或该按钮是否在跨域 iframe 内。");
  }

  menuButton.click();

  // Wait for menu render.
  await sleep(250);
  const resetItem = await findResetItem(8000);

  if (!resetItem) {
    throw new Error("点击了三点菜单，但没找到 Reset 选项。");
  }

  resetItem.click();
  console.log("已完成：点击三点菜单并选择 Reset。");
})();
