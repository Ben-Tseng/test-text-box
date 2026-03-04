(async () => {
  const BRN_VALUE = "12345678"; // ← 改这里

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function waitFor(fn, timeout = 60000, interval = 200) {
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

  function btn(text) {
    const t = text.toLowerCase();
    return [...document.querySelectorAll("button")]
      .find(b => ((b.innerText || "").toLowerCase()).includes(t));
  }

  function span(text) {
    const t = text.toLowerCase();
    return [...document.querySelectorAll("span")]
      .find(s => ((s.textContent || "").toLowerCase()).includes(t));
  }

  function category(text) {
    const t = text.toLowerCase();
    return [...document.querySelectorAll("span.categoryName")]
      .find(s => ((s.textContent || "").toLowerCase()).includes(t));
  }

  function enabled(b) {
    return b && !(b.disabled || b.getAttribute("aria-disabled") === "true");
  }

  async function waitStableElement(getter, stableMs = 500, timeout = 30000) {
    const start = Date.now();
    let last = null;
    let stable = 0;

    while (Date.now() - start < timeout) {
      const cur = getter();
      if (!cur) {
        last = null;
        stable = 0;
        await sleep(100);
        continue;
      }
      if (cur === last) {
        stable += 100;
        if (stable >= stableMs) return cur;
      } else {
        last = cur;
        stable = 0;
      }
      await sleep(100);
    }
    return null;
  }

  async function fillBRN(value) {
    const el = await waitStableElement(
      () => document.getElementById("BusinessRegistrationNumber"),
      600,
      30000
    );
    if (!el) return false;

    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (!setter) return false;

    el.focus();
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));

    // ✅ 值必须稳定存在（避免 React 回写清空）
    const ok = await waitFor(async () => {
      const cur = document.getElementById("BusinessRegistrationNumber");
      if (!cur || cur.value !== value) return false;
      await sleep(150);
      const cur2 = document.getElementById("BusinessRegistrationNumber");
      return !!(cur2 && cur2.value === value);
    }, 8000);

    return !!ok;
  }

  async function waitContainerStable(container, maxMs = 8000) {
    const start = Date.now();
    let last = "";
    let stable = 0;
    while (Date.now() - start < maxMs) {
      const cur = (container.innerText || "").trim();
      if (cur && cur === last) stable++;
      else stable = 0;
      last = cur;
      if (stable >= 2) break;
      await sleep(250);
    }
  }

  function cleanContent(container) {
    const clone = container.cloneNode(true);
    clone.querySelectorAll("b.dataTitle, button.copyTitle, button.copyTransactionRecordId")
      .forEach(n => n.remove());
    return (clone.innerText || "")
      .replace(/\bcopy\b/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function hasContent(container) {
    if (container.querySelector('div[style*="padding-bottom"] > b')) return true;
    const rows = [...container.querySelectorAll("table tbody tr")];
    if (rows.length && rows.some(r => (r.innerText || "").trim())) return true;
    return cleanContent(container).length > 0;
  }

  function extractKV(container) {
    const kv = {};
    for (const block of [...container.querySelectorAll('div[style*="padding-bottom"]')]) {
      const b = block.querySelector("b");
      if (!b) continue;
      const key = (b.textContent || "").trim();
      const raw = (block.innerText || "").trim();
      kv[key] = raw.replace(key, "").replace(/^[:：\s]+/, "").trim();
    }
    return kv;
  }

  // ✅ 不点 View all：直接读 Transaction record ID
  function getTxnId() {
    const title = [...document.querySelectorAll("span")]
      .find(el => (el.textContent || "").trim() === "Transaction record ID:");
    return title?.nextElementSibling?.textContent?.trim() || null;
  }

  // =========================
  // FLOW
  // =========================
  if (!location.pathname.includes("verification")) {
    location.href = "/verification";
    return;
  }

  // Get Started
  click(await waitFor(() => document.querySelector('[data-testid="get-started-button"]'), 60000));

  // BRN input
  await waitFor(() => document.getElementById("BusinessRegistrationNumber"), 60000);

  // Fill BRN (robust)
  const ok = await fillBRN(BRN_VALUE);
  if (!ok) return console.log("❌ BRN 填入失败（可能被 React 回写清空）");

  // Review (wait enabled)
  const reviewBtn = await waitFor(() => {
    const b = btn("review");
    return enabled(b) ? b : null;
  }, 60000);
  if (!reviewBtn) return console.log("❌ Review 未出现/不可点击");
  click(reviewBtn);

  // Generate report (wait enabled)
  const genBtn = await waitFor(() => {
    const b = btn("generate report");
    return enabled(b) ? b : null;
  }, 90000);
  if (!genBtn) return console.log("❌ Generate Report 未出现/不可点击");
  click(genBtn);

  // ✅ 等报告 ready：Additional data 出现/可点（同时抓 txnId，谁先来用谁）
  const ready = await waitFor(() => {
    const add = btn("additional data") || span("additional data");
    const txn = getTxnId();
    return { add: add || null, txn: txn || null };
  }, 180000);

  if (!ready) return console.log("❌ 报告未 ready（Additional data / Transaction ID 都没出现）");

  // 尽早拿 txnId
  let txnId = ready.txn || null;

  // Additional data
  const addEl = await waitFor(() => {
    const a = btn("additional data") || span("additional data");
    if (!a) return null;
    // span 没 disabled；button 要检查
    if (a.tagName === "BUTTON" && !enabled(a)) return null;
    return a;
  }, 60000);
  if (!addEl) return console.log("❌ Additional data 未出现/不可点击");
  click(addEl);

  // BusinessDetails
  const bd = await waitFor(() => span("businessdetails") || category("businessdetails"), 60000);
  if (!bd) return console.log("❌ BusinessDetails 未找到");
  click(bd);

  // Right container
  const container = await waitFor(() => document.querySelector('[data-testid="additional-data-appended-div"]'), 60000);
  if (!container) return console.log("❌ 未找到 additional-data-appended-div");

  // Detect 3 targets
  const targets = [
    { item: "Key Info", match: "key information" },
    { item: "Abnormal", match: "abnormal" },
    { item: "Change Records", match: "change records" }
  ];

  const results = [];

  for (const t of targets) {
    const left = category(t.match) || span(t.match) || span(t.item.toLowerCase());
    if (!left) {
      results.push({ item: t.item, hasContent: null, Content: "", note: "左侧未找到该项" });
      continue;
    }

    click(left);
    await waitContainerStable(container, 9000);

    const has = hasContent(container);
    const content = has ? cleanContent(container) : "";

    const row = { item: t.item, hasContent: has, Content: content };
    if (t.item === "Key Info" && has) row.KeyValues = extractKV(container);
    results.push(row);

    // 兜底：如果 txnId 还没拿到，顺手再尝试读一次（很多时候此时已经渲染好了）
    if (!txnId) txnId = getTxnId() || txnId;
  }

  console.table(results);
  console.log("Transaction record ID:", txnId || null);

})();
