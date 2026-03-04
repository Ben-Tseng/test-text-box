(async () => {
  const BRN_VALUE = "12345678"; // ← 改这里

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  async function waitFor(fn, timeout = 30000, interval = 200) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const v = fn();
      if (v) return v;
      await sleep(interval);
    }
    return null;
  }

  function click(el) {
    if (!el) return false;
    el.scrollIntoView({ block: "center" });
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  }

  async function clickSelector(sel, timeout = 30000) {
    const el = await waitFor(() => document.querySelector(sel), timeout);
    if (!el) throw new Error(`未找到：${sel}`);
    click(el);
    return el;
  }

  function findButtonByText(text) {
    const t = text.toLowerCase();
    return [...document.querySelectorAll("button")]
      .find(b => ((b.innerText || "").trim().toLowerCase()).includes(t));
  }

  async function clickButtonByText(text, timeout = 30000) {
    const btn = await waitFor(() => findButtonByText(text), timeout);
    if (!btn) throw new Error(`未找到按钮文本：${text}`);
    click(btn);
    return btn;
  }

  function setReactInputValueById(id, value) {
    const el = document.getElementById(id);
    if (!el) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (!setter) return false;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
  }

  // ===== A) 进入 Verification 流程 =====
  const link = await waitFor(() => document.querySelector('a[href="/verification"]'), 20000);
  if (!link) throw new Error('未找到 a[href="/verification"]');
  click(link);

  // Get Started
  await clickSelector('[data-testid="get-started-button"]', 30000);

  // 输入 BRN（等待输入框出现）
  const okSet = await waitFor(() => setReactInputValueById("BusinessRegistrationNumber", BRN_VALUE), 30000);
  if (!okSet) throw new Error("未找到/未成功设置 BusinessRegistrationNumber");

  // ===== B) 不用 review-selection-button_available，改用按钮文字点击 =====
  // 如果按钮文案不是 “Review …”，把下面 "Review" 换成页面真实文案（例如 "Review Selection"）
  await clickButtonByText("Review", 30000);

  // Generate Report
  await clickButtonByText("Generate Report", 60000);

  // ===== C) 进入 Additional data → BusinessDetails =====
  await clickButtonByText("Additional data", 60000);

  const bd = await waitFor(
    () => [...document.querySelectorAll("span")].find(s => (s.textContent || "").includes("BusinessDetails")),
    30000
  );
  if (!bd) throw new Error("未找到 BusinessDetails");
  click(bd);

  // ===== D) 三项检测 + Transaction record ID =====
  const container = await waitFor(() => document.querySelector('[data-testid="additional-data-appended-div"]'), 30000);
  if (!container) throw new Error("未找到 additional-data-appended-div");

  async function waitContainerStable(maxMs = 8000) {
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

  function clickCategory(label) {
    // 优先 categoryName（左侧项）
    const el1 = [...document.querySelectorAll("span.categoryName")]
      .find(s => (s.textContent || "").toLowerCase().includes(label.toLowerCase()));
    if (el1) return click(el1);

    // 兜底：任何 span 匹配
    const el2 = [...document.querySelectorAll("span")]
      .find(s => (s.textContent || "").toLowerCase().includes(label.toLowerCase()));
    if (el2) return click(el2);

    return false;
  }

  function hasRealContent() {
    // 1) Key Info 常见结构：div(style padding-bottom) > b(字段名)
    if (container.querySelectorAll('div[style*="padding-bottom"] > b').length > 0) return true;

    // 2) table 行
    const rows = [...container.querySelectorAll("table tbody tr")];
    if (rows.length > 0 && rows.some(tr => (tr.innerText || "").trim().length > 0)) return true;

    // 3) 兜底：删标题/copy 后还有文本
    const clone = container.cloneNode(true);
    clone.querySelectorAll("b.dataTitle, button.copyTitle").forEach(n => n.remove());
    const cleaned = (clone.innerText || "").replace(/\bcopy\b/gi, "").trim();
    return cleaned.length > 0;
  }

  function extractKeyValues() {
    const kv = {};
    for (const block of [...container.querySelectorAll('div[style*="padding-bottom"]')]) {
      const b = block.querySelector("b");
      if (!b) continue;
      const key = (b.textContent || "").trim();
      const raw = (block.innerText || "").trim();
      const value = raw.replace(key, "").replace(/^[:：\s]+/, "").trim();
      if (key) kv[key] = value;
    }
    return kv;
  }

  function clickViewAll() {
    const btn = findButtonByText("View all");
    return click(btn);
  }

  function getTxnId() {
    const title = [...document.querySelectorAll("span")]
      .find(el => (el.textContent || "").trim() === "Transaction record ID:");
    return title?.nextElementSibling?.textContent?.trim() || null;
  }

  async function getTxnIdViaModal() {
    if (!clickViewAll()) return null;
    const ok = await waitFor(() => getTxnId(), 20000);
    if (!ok) return null;
    await sleep(200);
    return getTxnId();
  }

  const targets = [
    { name: "Key Info", match: "Key Information" },
    { name: "Abnormal", match: "Abnormal" },
    { name: "Change Records", match: "Change Records" }
  ];

  const results = [];
  for (const t of targets) {
    const ok = clickCategory(t.match) || clickCategory(t.name);
    if (!ok) {
      results.push({ item: t.name, found: false, hasContent: null, note: "左侧未找到该项" });
      continue;
    }
    await sleep(250);
    await waitContainerStable();

    const has = hasRealContent();
    const row = { item: t.name, found: true, hasContent: has };

    if (t.name === "Key Info" && has) row.sample = extractKeyValues();
    results.push(row);
  }

  const txnId = await getTxnIdViaModal();
  results.forEach(r => (r.transactionRecordId = txnId || null));

  console.table(results);
  if (txnId) console.log("Transaction record ID:", txnId);
  else console.log("⚠️ 未拿到 Transaction record ID（可能没有 View all 或弹窗字段不同）");
})();
