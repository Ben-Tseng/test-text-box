function startUltimateAutoBot() {

    console.log("🚀 无人值守打卡系统启动");

    const TARGET_TIMES = [
        { h: 7, m: 55, key: "morning" },
        { h: 17, m: 0, key: "evening" }
    ];

    const MAX_RETRY = 5;
    let retryMap = {};
    let lastRun = 0;
    let lastUrl = location.href;
    let lastActivity = Date.now();

    // ======================
    // 工具
    // ======================

    function todayKey(name) {
        const d = new Date();
        return `${name}-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }

    function alreadyDone(name) {
        return localStorage.getItem(todayKey(name)) === "done";
    }

    function markDone(name) {
        localStorage.setItem(todayKey(name), "done");
    }

    function inTimeWindow(target) {
        const now = new Date();
        const t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), target.h, target.m);
        return (now - t > 0 && now - t < 5 * 60 * 1000);
    }

    function shouldRun() {
        const now = Date.now();
        if (now - lastRun < 3000) return false;
        lastRun = now;
        return true;
    }

    function incRetry(tag) {
        retryMap[tag] = (retryMap[tag] || 0) + 1;
    }

    function getRetry(tag) {
        return retryMap[tag] || 0;
    }

    function safeClick(el) {
        if (!el) return false;

        el.scrollIntoView({ block: "center" });
        el.focus();

        ["mousedown", "mouseup", "click"].forEach(type => {
            el.dispatchEvent(new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        });

        lastActivity = Date.now();
        return true;
    }

    // ======================
    // 🔥 防登出检测
    // ======================

    function isLoggedOut() {
        const text = document.body.innerText.toLowerCase();

        return (
            text.includes("login") ||
            text.includes("sign in") ||
            text.includes("session expired")
        );
    }

    function handleLogout() {
        console.log("🔐 检测到登出，刷新页面");
        location.reload();
    }

    // ======================
    // 🔥 页面恢复（回到打卡页）
    // ======================

    function ensureOnWorkPage() {

        // 👉 这里你可以改成你的打卡URL关键字
        if (!location.href.includes("timestamp")) {
            console.log("🔄 不在打卡页，尝试刷新");
            location.reload();
        }
    }

    // ======================
    // 🔥 查找并点击（双形态）
    // ======================

    function findAndClick() {

        // ① 简化页面
        let quickBtn = document.getElementById("ess.recordTimestampButton.Label");
        if (quickBtn) {
            console.log("⚡ 一键打卡");
            safeClick(quickBtn);
            return true;
        }

        let elements = [...document.querySelectorAll("button, div, span")];

        // ② My Timestamp
        let entry = elements.find(el =>
            el.innerText?.toLowerCase().includes("my timestamp")
        );

        if (entry) {
            console.log("👉 点击 My Timestamp");
            safeClick(entry);
            return false;
        }

        // ③ Record
        let record = elements.find(el =>
            el.innerText?.toLowerCase().includes("record time")
        );

        if (record) {
            console.log("👉 点击 Record");
            safeClick(record);
            return true;
        }

        // ④ iframe
        const iframes = document.querySelectorAll("iframe");

        for (let iframe of iframes) {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (!doc) continue;

                let quickBtn = doc.getElementById("ess.recordTimestampButton.Label");
                if (quickBtn) {
                    console.log("⚡ iframe 一键打卡");
                    safeClick(quickBtn);
                    return true;
                }

            } catch (e) {}
        }

        return false;
    }

    // ======================
    // 成功检测
    // ======================

    function isSuccess() {
        const text = document.body.innerText.toLowerCase();
        return text.includes("recorded") || text.includes("success");
    }

    // ======================
    // 主执行
    // ======================

    function run(tag) {

        if (alreadyDone(tag)) return;

        if (isLoggedOut()) {
            handleLogout();
            return;
        }

        ensureOnWorkPage();

        const done = findAndClick();

        if (!done) return;

        setTimeout(() => {

            if (isSuccess()) {
                console.log("🎉 打卡成功");
                markDone(tag);
                return;
            }

            incRetry(tag);

            if (getRetry(tag) <= MAX_RETRY) {
                console.log(`🔁 重试 ${getRetry(tag)}`);
                setTimeout(() => run(tag), 3000);
            } else {
                console.log("❌ 多次失败，刷新");
                location.reload();
            }

        }, 3000);
    }

    // ======================
    // 🔥 页面卡死检测
    // ======================

    setInterval(() => {
        if (Date.now() - lastActivity > 5 * 60 * 1000) {
            console.log("💀 页面长时间无操作，刷新");
            location.reload();
        }
    }, 60000);

    // ======================
    // 🔥 URL变化检测
    // ======================

    setInterval(() => {
        if (location.href !== lastUrl) {
            console.log("🔄 页面跳转，重置状态");
            lastUrl = location.href;
            lastActivity = Date.now();
        }
    }, 2000);

    // ======================
    // 主循环
    // ======================

    setInterval(() => {

        if (!shouldRun()) return;

        TARGET_TIMES.forEach(t => {
            if (!alreadyDone(t.key) && inTimeWindow(t)) {
                run(t.key);
            }
        });

    }, 3000);

    console.log("👀 无人值守系统已运行");
}


(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const host =
    document.querySelector('kat-dropdown.first-column-dropdown') ||
    document.querySelector('kat-dropdown[label="Reason category"]');

  const trigger =
    host?.shadowRoot?.querySelector('.select-header') ||
    host?.shadowRoot?.querySelector('#katal-id-9') ||
    host?.shadowRoot?.querySelector('#katal-id-10');

  if (!trigger) {
    console.log('没找到 trigger');
    return;
  }

  trigger.click();
  await sleep(500);

  const visible = [...document.querySelectorAll('body *')]
    .map(el => ({
      text: el.innerText?.trim(),
      tag: el.tagName,
      cls: el.className,
      id: el.id
    }))
    .filter(x => x.text)
    .filter(x =>
      x.text.includes('Account') ||
      x.text.includes('Product') ||
      x.text.includes('Shipping') ||
      x.text.includes('Other') ||
      x.text.includes('Cases')
    );

  console.log(visible);
})();



(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const host =
    document.querySelector('kat-dropdown.first-column-dropdown') ||
    document.querySelector('kat-dropdown[label="Reason category"]');

  const trigger =
    host?.shadowRoot?.querySelector('.select-header') ||
    host?.shadowRoot?.querySelector('#katal-id-9') ||
    host?.shadowRoot?.querySelector('#katal-id-10');

  if (!trigger) {
    console.log('没找到 trigger');
    return;
  }

  trigger.click();
  await sleep(500);

  const visible = [...document.querySelectorAll('body *')]
    .map(el => ({
      text: el.innerText?.trim(),
      tag: el.tagName,
      cls: el.className,
      id: el.id
    }))
    .filter(x => x.text)
    .filter(x =>
      x.text.includes('Account') ||
      x.text.includes('Product') ||
      x.text.includes('Shipping') ||
      x.text.includes('Other') ||
      x.text.includes('Cases')
    );

  console.log(visible);
})();



(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const host = document.querySelector('kat-dropdown.first-column-dropdown');
  const trigger =
    host?.shadowRoot?.querySelector('.select-header') ||
    host?.shadowRoot?.querySelector('#katal-id-9') ||
    host?.shadowRoot?.querySelector('#katal-id-10');

  trigger?.click();
  await sleep(500);

  const inside = [...host.shadowRoot.querySelectorAll('*')]
    .map(el => ({
      text: el.innerText?.trim(),
      tag: el.tagName,
      cls: el.className,
      id: el.id
    }))
    .filter(x => x.text);

  console.log(inside);
})();

