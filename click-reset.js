/**
 * Usage:
 * 1) Open target page
 * 2) Open DevTools Console
 * 3) Paste this file content and run
 */
(async () => {
  const MENU_BUTTON_SELECTOR = [
    'button[data-automation-id="sheet.control.menubutton"][data-automation-context*="mcid_primary_decrypted equals"]',
    'button[data-automation-id="sheet control menubutton"][data-automation-context*="mcid_primary_decrypted equals"]',
    'button[aria-label*="options -mcid_primary_decrypted equals"]',
    'button[title*="options - mcid_primary_decrypted equals"]',
  ].join(", ");

  const RESET_ITEM_SELECTOR = [
    '[role="menuitem"][data-automation-id="sheet control reset"]',
    '[role="menuitem"][data-automation-id="sheet.control.reset"]',
    '[role="menuitem"]',
  ].join(", ");

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function waitForElement(selector, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const el = document.querySelector(selector);
      if (el) return el;
      await sleep(100);
    }
    return null;
  }

  function isResetItem(el) {
    if (!el) return false;
    const automationId = (el.getAttribute("data-automation-id") || "").toLowerCase();
    const text = (el.textContent || "").trim().toLowerCase();
    return automationId.includes("reset") || text === "reset";
  }

  const menuButton = await waitForElement(MENU_BUTTON_SELECTOR, 10000);
  if (!menuButton) {
    throw new Error("找不到三点菜单按钮，请确认页面已加载且字段名匹配。");
  }

  menuButton.click();

  // Wait for menu to render and become interactive.
  await sleep(200);

  const menuItems = Array.from(document.querySelectorAll(RESET_ITEM_SELECTOR));
  const resetItem = menuItems.find(isResetItem);

  if (!resetItem) {
    throw new Error("点击了三点菜单，但没找到 Reset 选项。");
  }

  resetItem.click();
  console.log("已完成：点击三点菜单并选择 Reset。");
})();
