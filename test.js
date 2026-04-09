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


(() => {
  const targetName = 'Other or Non-TAM Actionable Cases';

  const host =
    document.querySelector('kat-dropdown.first-column-dropdown') ||
    document.querySelector('kat-dropdown[label="Category"]');

  if (!host) {
    console.log('没找到第一个下拉框');
    return;
  }

  const rawOptions = host.getAttribute('options') || '[]';
  let options = [];

  try {
    options = JSON.parse(rawOptions);
  } catch (err) {
    console.log('options 解析失败', err, rawOptions);
    return;
  }

  const match = options.find(item => item.name === targetName);

  if (!match) {
    console.log('没找到目标选项', targetName, options);
    return;
  }

  host.value = match.value;
  host.setAttribute('value', match.value);

  host.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  host.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

  console.log('已设置', {
    name: match.name,
    value: match.value,
    currentValueProp: host.value,
    currentValueAttr: host.getAttribute('value')
  });
})();

(() => {
  const host =
    document.querySelector('kat-dropdown.first-column-dropdown') ||
    document.querySelector('kat-dropdown[label="Category"]');

  console.log(JSON.parse(host?.getAttribute('options') || '[]'));
})();




