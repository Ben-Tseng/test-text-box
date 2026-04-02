function startUltimateTimestampBot() {

    console.log("🚀 Ultimate 打卡脚本启动");

    const TARGET_TIMES = [
        { h: 7, m: 55, key: "morning" },
        { h: 17, m: 0, key: "evening" }
    ];

    const MAX_RETRY = 5;
    let retryMap = {};
    let lastRun = 0;

    // ========================
    // 工具函数
    // ========================

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
        const t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), target.h, target.m, 0);
        const diff = now - t;
        return diff > 0 && diff < 5 * 60 * 1000;
    }

    function shouldRun() {
        const now = Date.now();
        if (now - lastRun < 3000) return false;
        lastRun = now;
        return true;
    }

    function getRetry(tag) {
        return retryMap[tag] || 0;
    }

    function incRetry(tag) {
        retryMap[tag] = getRetry(tag) + 1;
    }

    // ========================
    // 核心：查找按钮（终极版）
    // ========================

    function findRecordBtn() {

        // ✅ 1. 主页面
        let btn = document.getElementById("ess.recordTimestampButton.Label");
        if (btn) {
            console.log("✅ 主页面找到按钮");
            return btn;
        }

        // ✅ 2. 所有 iframe
        const iframes = document.querySelectorAll("iframe");

        for (let iframe of iframes) {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (!doc) continue;

                const btn = doc.getElementById("ess.recordTimestampButton.Label");
                if (btn) {
                    console.log("✅ iframe 找到按钮");
                    return btn;
                }

            } catch (e) {}
        }

        return null;
    }

    // ========================
    // 点击（强化版）
    // ========================

    function safeClick(btn) {
        if (!btn) return false;

        console.log("🖱️ 尝试点击按钮");

        btn.scrollIntoView({ block: "center" });
        btn.focus();

        ["mousedown", "mouseup", "click"].forEach(type => {
            btn.dispatchEvent(new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        });

        return true;
    }

    // ========================
    // 成功检测（加强版）
    // ========================

    function isSuccess() {
        const text = document.body.innerText.toLowerCase();

        return (
            text.includes("successfully") ||
            text.includes("recorded") ||
            text.includes("timestamp recorded")
        );
    }

    // ========================
    // 核心执行
    // ========================

    function run(tag) {

        if (alreadyDone(tag)) return;

        const btn = findRecordBtn();

        if (!btn) {
            console.log("⏳ 按钮还没出现...");
            return;
        }

        safeClick(btn); // 👉 找到直接点（核心要求）

        setTimeout(() => {

            if (isSuccess()) {
                console.log("🎉 打卡成功！");
                markDone(tag);
                return;
            }

            incRetry(tag);

            if (getRetry(tag) <= MAX_RETRY) {
                console.log(`🔁 重试 ${getRetry(tag)} 次`);
                setTimeout(() => run(tag), 3000);
            } else {
                console.log("❌ 多次失败，刷新页面");
                location.reload();
            }

        }, 3000);
    }

    // ========================
    // 监听 DOM（防页面切换）
    // ========================

    const observer = new MutationObserver(() => {

        if (!shouldRun()) return;

        TARGET_TIMES.forEach(t => {
            if (!alreadyDone(t.key) && inTimeWindow(t)) {
                run(t.key);
            }
        });

    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // ========================
    // 定时兜底（防 observer 失效）
    // ========================

    setInterval(() => {
        TARGET_TIMES.forEach(t => {
            if (!alreadyDone(t.key) && inTimeWindow(t)) {
                run(t.key);
            }
        });
    }, 5000);

    console.log("👀 已进入监听模式（终极版）");
}
