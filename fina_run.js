(async () => {
  const BRN_VALUE = "12345678"; // ← 改这里

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  async function waitFor(fn, timeout = 30000, interval = 200) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const v = fn();
        if (v) return v;
      } catch {}
      await sleep(interval);
    }
    return null;
  }

  function click(el) {
    if (!el) return false;
    try { el.scrollIntoView({ block: "center" }); } catch {}
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  }

  function btnByText(text) {
    const t = text.toLowerCase();
    return [...document.querySelectorAll("button")]
      .find(b => ((b.innerText || "").trim().toLowerCase()).includes(t));
  }

  function spanByText(text) {
    const t = text.toLowerCase();
    return [...document.querySelectorAll("span")]
      .find(s => ((s.textContent || "").trim().toLowerCase()).includes(t));
  }

  function categoryByText(text) {
    const t = text.toLowerCase();
    return [...document.querySelectorAll("span.categoryName")]
      .find(s => ((s.textContent || "").trim().toLowerCase()).includes(t));
  }

  function setBRN(value) {
    const el = document.querySelector('input[name="BusinessRegistrationNumber"]');
    if (!el) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (!setter) return false;

    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
  }

  async function waitContainerStable(container, maxMs = 9000) {
    const start = Date.now();
    let last = "";
    let stable = 0;
    while (Date.now() - start < maxMs) {
      const cur = (container.innerText || "").trim();
      if (cur && cur === last) stable++;
      else stable = 0;
      last = cur;
      if (stable >= 2) break;
      await sleep(200);
    }
  }

  // —— 抽取/清洗“真实内容” —— //
  function getCleanContent(container) {
    // 复制一份 DOM，删掉标题/复制按钮/纯装饰
    const clone = container.cloneNode(true);
    clone.querySelectorAll("b.dataTitle, button.copyTitle, button.copyTransactionRecordId").forEach(n => n.remove());

    // 有些页面把 “copy” 文本作为纯文本存在，这里也去掉
    let text = (clone.innerText || "")
      .replace(/\bcopy\b/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return text;
  }

  function hasRealContent(container) {
    // 1) Key Info 的 key-value block
    if (container.querySelectorAll('div[style*="padding-bottom"] > b').length > 0) return true;

    // 2) 表格有行
    const rows = [...container.querySelectorAll("table tbody tr")];
    if (rows.length > 0 && rows.some(tr => (tr.innerText || "").trim().length > 0)) return true;

    // 3) 兜底：清洗后文本还有内容
    const cleaned = getCleanContent(container);
    return cleaned.length > 0;
  }

  function extractKeyValues(container) {
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

  // —— Transaction record ID —— //
  function getTxnId() {
    const title = [...document.querySelectorAll("span")]
      .find(el => ((el.textContent || "").trim() === "Transaction record ID:"));
    return title?.nextElementSibling?.textContent?.trim() || null;
  }

  async function openViewAllAndReadTxnId() {
    const viewAll = await waitFor(() => btnByText("view all"), 30000);
    if (!viewAll) return null;
    click(viewAll);

    const txnId = await waitFor(() => getTxnId(), 30000);
    return txnId || null;
  }

  // =========================
  // 1) 跑完整流程
  // =========================
  if (!location.pathname.includes("verification")) {
    location.href = "/verification";
    return; // 跳转后再次运行即可（或你用 bookmarklet 状态机版）
  }

  // Get Started
  click(await waitFor(() => document.querySelector('[data-testid="get-started-button"]'), 3000));

  // BRN 输入框出现再填
  await waitFor(() => document.querySelector('input[name="BusinessRegistrationNumber"]'), 4000);
  setBRN(BRN_VALUE);

  // Review
  click(await waitFor(() => btnByText("review"), 4000));

  // Generate Report
  click(await waitFor(() => btnByText("generate report"), 8000));

  // 等报告生成（这里仍然给一个保底等待；如果你想更稳可改成等某个元素出现）
  await sleep(8000);

  // Additional data
  click(await waitFor(() => btnByText("additional data") || spanByText("additional data"), 1000));

  // BusinessDetails
  click(await waitFor(() => spanByText("businessdetails") || categoryByText("businessdetails"), 1000));

  // 右侧容器
  const container = await waitFor(() => document.querySelector('[data-testid="additional-data-appended-div"]'), 1000);
  if (!container) {
    console.log("❌ 未找到 additional-data-appended-div");
    return;
  }

  // =========================
  // 2) 检测三项 & 提取 Content
  // =========================
  const targets = [
    { item: "Key Info", match: "key information" },
    { item: "Abnormal", match: "abnormal" },
    { item: "Change Records", match: "change records" }
  ];

  const results = [];

  for (const t of targets) {
    const left = categoryByText(t.match) || spanByText(t.match) || spanByText(t.item.toLowerCase());
    if (!left) {
      results.push({ item: t.item, hasContent: null, Content: "", note: "左侧未找到该项" });
      continue;
    }

    click(left);
    await sleep(250);
    await waitContainerStable(container, 8000);

    const has = hasRealContent(container);
    const content = has ? getCleanContent(container) : "";

    const row = { item: t.item, hasContent: has, Content: content };

    // Key Info 额外解析结构化 KV（可选，但很实用）
    if (t.item === "Key Info" && has) {
      row.KeyValues = extractKeyValues(container); // JSON
    }

    results.push(row);
  }

  // ✅ 只输出这一张表
  console.table(results);

  // =========================
  // 3) 只输出 Transaction ID（不进表、不输出第二张表）
  // =========================
  const txnId = await openViewAllAndReadTxnId();
  console.log("Transaction record ID:", txnId);

})();
