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
  // ====== 小工具：等待/查找/点击 ======
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function waitFor(getter, { timeout = 15000, interval = 200 } = {}) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const v = getter();
      if (v) return v;
      await sleep(interval);
    }
    return null;
  }

  function clickByText(tagNames, textIncludes) {
    const els = [...document.querySelectorAll(tagNames)];
    const el = els.find(e => (e.textContent || "").trim().includes(textIncludes));
    if (!el) return false;
    el.scrollIntoView({ block: "center" });
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  }

  function clickAbnormal() {
    // 你的左侧是 <span class="categoryName">Abnormal (warning)</span>
    const spans = [...document.querySelectorAll("span.categoryName")];
    const el = spans.find(s => {
      const t = (s.textContent || "").trim();
      return t === "Abnormal" || t.startsWith("Abnormal");
    });
    if (!el) return false;
    el.scrollIntoView({ block: "center" });
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  }

  // ====== 1) 点击 Generate Report ======
  // 按你的截图，这个按钮没有 data-testid，用文字找最稳
  const clickedGenerate = clickByText("button", "Generate Report");
  console.log(clickedGenerate ? "已点击：Generate Report" : "未找到：Generate Report（如果你已生成报告可忽略）");

  // ====== 2) 等待结果/Additional data 渲染（results-tab-group 是你截图里出现的） ======
  await waitFor(() => document.querySelector('[data-testid="results-tab-group"]'), { timeout: 20000 });
  // 等一小下给页面补渲染
  await sleep(800);

  // ====== 3) 点击 Abnormal（warning） ======
  const clickedAbn = clickAbnormal() || clickByText("span,button,div", "Abnormal");
  if (!clickedAbn) {
    console.log("❌ 未找到 Abnormal（warning）条目：检查左侧是否在 Additional data 列表里");
    return;
  }
  console.log("已点击：Abnormal");

  // ====== 4) 等待右侧容器出现（你截图里：data-testid=additional-data-appended-div） ======
  const container = await waitFor(() => document.querySelector('[data-testid="additional-data-appended-div"]'), { timeout: 15000 });
  if (!container) {
    console.log("❌ 未找到右侧数据容器 additional-data-appended-div");
    return;
  }

  // ====== 5) 等待右侧内容稳定（避免刚点击就读到旧内容） ======
  // 观察文本变化：连续两次一致就认为稳定
  let last = "";
  let stableCount = 0;
  for (let i = 0; i < 30; i++) { // 最多等约 6 秒
    const now = container.innerText.trim();
    if (now && now === last) stableCount++;
    else stableCount = 0;
    last = now;
    if (stableCount >= 2) break;
    await sleep(200);
  }

  // ====== 6) 判断有无内容并提取 ======
  const text = container.innerText.trim();

  // 更“强”的判断：如果里面有具体数据行结构也算有内容（避免只出现标题/空白）
  const hasRows = container.querySelectorAll('.StDataLine-sc-148d2ws-0, [data-testid*="row"], table tbody tr').length > 0;

  if (text.length === 0 || (!hasRows && text.length < 5)) {
    console.log("✅ Abnormal：无内容");
    return;
  }

  console.log("✅ Abnormal：有内容");
  console.log("------ 提取内容开始 ------");
  console.log(text);
  console.log("------ 提取内容结束 ------");

  // 如果你想把内容复制到剪贴板（可选）
  // await navigator.clipboard.writeText(text);
  // console.log("已复制到剪贴板");

})();
