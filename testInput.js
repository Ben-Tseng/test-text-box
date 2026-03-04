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

  // 点击 Abnormal（warning）
  const abnormal = [...document.querySelectorAll("span.categoryName")]
    .find(e => (e.textContent || "").trim().startsWith("Abnormal"));
  if (!abnormal) return console.log("❌ 未找到 Abnormal");
  abnormal.click();

  // 等右侧容器出现
  let container = null;
  for (let i = 0; i < 40; i++) {
    container = document.querySelector('[data-testid="additional-data-appended-div"]');
    if (container) break;
    await sleep(200);
  }
  if (!container) return console.log("❌ 未找到 additional-data-appended-div");

  // 等内容稳定（避免读到旧内容）
  let last = "";
  for (let i = 0; i < 20; i++) {
    const now = container.innerText.trim();
    if (now && now === last) break;
    last = now;
    await sleep(200);
  }

  // ===== 关键判断：只看“真实数据” =====
  // 找到标题块（你的截图是 b.dataTitle）
  const titleEl = container.querySelector("b.dataTitle");
  if (!titleEl) {
    // 没标题，通常也代表没数据，但先给个兜底判断
    const anyMeaningful = container.querySelector("table, ul li, ol li, [role='row'], tr td, .row, .cell");
    console.log(anyMeaningful ? "✅ 有内容" : "✅ 无内容");
    return;
  }

  // 标题所在的“行容器”（通常是 sc-fuwcr eho8i3 这一行）
  const lineWrap = titleEl.closest("div");
  // 获取同一个 data line 区域里所有可见文本
  const fullText = (lineWrap ? lineWrap.innerText : container.innerText).trim();

  // 去掉标题文本、copy 文本后剩余内容
  const titleText = titleEl.innerText.trim();
  const cleaned = fullText
    .replace(titleText, "")
    .replace(/\bcopy\b/gi, "")
    .trim();

  // 同时用 DOM 结构做二次确认：是否存在表格/行/列表等“数据结构”
  const hasDataStructure = !!container.querySelector(
    "table tbody tr, ul li, ol li, [role='row'], tr td"
  );

  // 判定：既没有数据结构，清洗后也没剩余文本 => 真无内容
  const hasRealContent = hasDataStructure || cleaned.length > 0;

  console.log(hasRealContent ? "✅ Abnormal 有真实内容" : "✅ Abnormal 无真实内容");

  // 如果有真实内容，顺便把内容打印出来（可选）
  if (hasRealContent) {
    console.log("------内容（去掉标题/copy后）------");
    console.log(cleaned || container.innerText.trim());
  }
})();
