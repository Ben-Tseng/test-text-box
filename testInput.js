const el = document.getElementById("BusinessRegistrationNumber");
const value = "12345678";

// 用原生 value setter，避免只改到属性不进框架
const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
setter.call(el, value);

// 触发事件，让 React/表单库接收到变更
el.dispatchEvent(new Event("input", { bubbles: true }));
el.dispatchEvent(new Event("change", { bubbles: true }));

// 有些页面还会监听 blur
el.dispatchEvent(new Event("blur", { bubbles: true }));


[...document.querySelectorAll("button")]
.find(b => b.innerText.includes("Generate Report"))
.click();

[...document.querySelectorAll("span")]
.find(el => el.textContent.includes("BusinessDetails"))
.click();

document.querySelector('[data-testid="additional-data-appended-div"]').innerText






const abnormal = [...document.querySelectorAll("span.categoryName")]
.find(e => e.textContent.includes("Abnormal"));

if(abnormal){
    abnormal.click();
}

setTimeout(()=>{

const rows = document.querySelectorAll(
    '[data-testid="additional-data-appended-div"] .StDataLine-sc-148d2ws-0'
);

console.log(rows.length > 0 ? "有内容" : "无内容");

},1500);








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
    // 你的左侧是 span.categoryName，文本如 "Key Information (tab...)"、"Abnormal (warning...)"、"Change Records (tab...)"
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
    // ✅ 1) Key Info 常见结构：div(style padding-bottom) > b(字段名) + 值
    const kvBlocks = container.querySelectorAll('div[style*="padding-bottom"] > b');
    if (kvBlocks.length > 0) return true;

    // ✅ 2) Table 结构：有 tbody tr 且里面有 td 文本
    const rows = [...container.querySelectorAll("table tbody tr")];
    const hasRowText = rows.some(tr => (tr.innerText || "").trim().length > 0);
    if (rows.length > 0 && hasRowText) return true;

    // ✅ 3) 兜底：去掉标题(dataTitle)和 copy 后还有剩余文本
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

    // 等待右侧渲染/稳定
    await sleep(300);
    await waitContainerStable(container, 7000);

    const has = hasRealContent(container);

    const row = { item: t.name, found: true, hasContent: has };

    // Key Info 额外提取字段，方便你核对
    if (t.name === "Key Info" && has) {
      row.sample = extractKeyValues(container);
    }

    results.push(row);
  }

  console.table(results);

})();






document.querySelector('a[href="/verification"]').click()
// 等待2.5秒
document.querySelector('[data-testid="get-started-button"]').click()
// 等待0.3s

const el = document.getElementById("BusinessRegistrationNumber");
const value = "12345678";

// 用原生 value setter，避免只改到属性不进框架
const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
setter.call(el, value);

// 触发事件，让 React/表单库接收到变更
el.dispatchEvent(new Event("input", { bubbles: true }));
el.dispatchEvent(new Event("change", { bubbles: true }));

// 有些页面还会监听 blur
el.dispatchEvent(new Event("blur", { bubbles: true }));

document.querySelector('[data-testid="review-selection-button-available"]').click()
// 0.2s

[...document.querySelectorAll("button")] .find(b=>b.innerText.includes("Generate Report")) .click()
//等8秒

[...document.querySelectorAll("button")] .find(b=>b.innerText.includes("Additional data")) .click()

[...document.querySelectorAll("span")] .find(el=>el.textContent.includes("BusinessDetails")) .click();

[...document.querySelectorAll("span")] .find(el=>el.textContent.includes("Change Records")) .click();

[...document.querySelectorAll("span")] .find(el=>el.textContent.includes("Abnormal")) .click();

[...document.querySelectorAll("span")] .find(el=>el.textContent.includes("Key Info")) .click();

[...document.querySelectorAll("button")] .find(b=>b.innerText.includes("View all")) .click()
// 0.4s









// 三种取ID的方法
document.querySelector(".copyTransactionRecordId").click();

//
const btn = document.querySelector(".copyTransactionRecordId");

if(btn){
    btn.click();
    console.log("已触发复制");
}else{
    console.log("未找到复制按钮");
}

// 3
const id = document.querySelector('.StModalFieldTitle-sc-1ini8z8-0')
  ?.nextElementSibling?.textContent.trim();

console.log(id);

//4
document.querySelector(".copyTransactionRecordId")?.click()

//5
document.querySelector(".copyTransactionRecordId")?.click()


function getTxnId() {
    const title = [...document.querySelectorAll("span")]
      .find(el => el.textContent.trim() === "Transaction record ID:");
    return title?.nextElementSibling?.textContent?.trim() || null;
  }
