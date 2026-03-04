(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function waitFor(fn, timeout = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const v = fn();
      if (v) return v;
      await sleep(200);
    }
    return null;
  }

  function clickCategory(label) {
    const el = [...document.querySelectorAll("span.categoryName")]
      .find(s => (s.textContent || "").trim().toLowerCase().includes(label.toLowerCase()));
    if (!el) return false;
    el.scrollIntoView({ block: "center" });
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  }

  async function waitContainerStable(container, maxMs = 6000) {
    const start = Date.now();
    let last = "";
    let stable = 0;
    while (Date.now() - start < maxMs) {
      const now = (container.innerText || "").trim();
      if (now && now === last) stable++;
      else stable = 0;
      last = now;
      if (stable >= 2) break;
      await sleep(200);
    }
  }

  function hasRealContent(container) {
    // 1) Key Info 常见结构：div(style padding-bottom) > b(字段名) + 值
    const kvBlocks = container.querySelectorAll('div[style*="padding-bottom"] > b');
    if (kvBlocks.length > 0) return true;

    // 2) Table 结构：有 tbody tr 且里面有 td 文本
    const rows = [...container.querySelectorAll("table tbody tr")];
    const hasRowText = rows.some(tr => (tr.innerText || "").trim().length > 0);
    if (rows.length > 0 && hasRowText) return true;

    // 3) 兜底：去掉标题(dataTitle)和 copy 后还有剩余文本
    const clone = container.cloneNode(true);
    clone.querySelectorAll("b.dataTitle, button.copyTitle").forEach(n => n.remove());
    const cleaned = (clone.innerText || "").replace(/\bcopy\b/gi, "").trim();
    return cleaned.length > 0;
  }

  function extractKeyValues(container) {
    const kv = {};
    const blocks = [...container.querySelectorAll('div[style*="padding-bottom"]')];
    for (const block of blocks) {
      const b = block.querySelector("b");
      if (!b) continue;
      const key = (b.textContent || "").trim();
      const raw = (block.innerText || "").trim();
      const value = raw.replace(key, "").replace(/^[:：\s]+/, "").trim();
      if (key) kv[key] = value;
    }
    return kv;
  }

  // ===== 第二段：打开 Transaction Details 并抓 Transaction record ID =====
  function clickViewAll() {
    const btn = [...document.querySelectorAll("button")]
      .find(b => (b.innerText || "").includes("View all"));
    if (!btn) return false;
    btn.scrollIntoView({ block: "center" });
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  }

  function getTxnId() {
    const title = [...document.querySelectorAll("span")]
      .find(el => (el.textContent || "").trim() === "Transaction record ID:");
    return title?.nextElementSibling?.textContent?.trim() || null;
  }

  async function getTxnIdViaModal() {
    // 尝试点 View all
    const clicked = clickViewAll();
    if (!clicked) return null;

    // 等弹窗内容出现（通过 Transaction record ID: 文本来判断）
    const ok = await waitFor(() => getTxnId(), 15000);
    if (!ok) return null;

    // 多等一点确保稳定
    await sleep(200);
    return getTxnId();
  }

  // ===== 主流程：先跑三项检测 =====
  const targets = [
    { name: "Key Info", match: "Key Information" },
    { name: "Abnormal", match: "Abnormal" },
    { name: "Change Records", match: "Change Records" }
  ];

  const container = await waitFor(() => document.querySelector('[data-testid="additional-data-appended-div"]'));
  if (!container) return console.log("❌ 未找到右侧容器 additional-data-appended-div");

  const results = [];

  for (const t of targets) {
    const ok = clickCategory(t.match);
    if (!ok) {
      results.push({ item: t.name, found: false, hasContent: null, note: "左侧未找到该项" });
      continue;
    }

    await sleep(300);
    await waitContainerStable(container, 7000);

    const has = hasRealContent(container);
    const row = { item: t.name, found: true, hasContent: has };

    if (t.name === "Key Info" && has) row.sample = extractKeyValues(container);

    results.push(row);
  }

  // ===== 再抓 Transaction record ID，并写进表 =====
  const txnId = await getTxnIdViaModal();
  for (const r of results) r.transactionRecordId = txnId || null;

  console.table(results);

  // 额外打印一次，方便复制
  if (txnId) console.log("Transaction record ID:", txnId);
  else console.log("⚠️ 未获取到 Transaction record ID（可能没点开弹窗或字段不存在）");
})();
