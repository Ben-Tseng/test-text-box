function startSmartTimestampBot() {

    console.log("🚀 智能打卡（带验证）已启动");

    const TARGET_TIMES = [
        { h: 7, m: 55, key: "morning" },
        { h: 17, m: 0, key: "evening" }
    ];

    const MAX_RETRY = 5;

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

    let entryClicked = false;
    let retryCount = 0;

    // 🔍 检测是否打卡成功（通用版）
    function isSuccess() {
        const text = document.body.innerText.toLowerCase();

        return (
            text.includes("recorded") ||
            text.includes("success") ||
            text.includes("timestamp")
        );
    }

    function tryClick(tag) {

        // ===== 状态B：新页面 =====
        let btn = document.getElementById("ess.recordTimestampButton.Label");

        if (btn) {
            console.log("👉 点击新页面按钮");
            btn.click();
            return true;
        }

        // ===== 状态A：旧页面 =====
        if (!entryClicked) {
            const entry = document.querySelector('.related-item__btn[title="My Timestamp"]');
            if (entry) {
                console.log("👉 点击入口");
                entry.click();
                entryClicked = true;
            }
        }

        const iframes = document.querySelectorAll("iframe");

        for (let iframe of iframes) {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;

                const btn2 = doc.querySelector('button[title="Record Timestamp"]');

                if (btn2) {
                    console.log("👉 点击 iframe 按钮");
                    btn2.click();
                    return true;
                }

            } catch (e) {}
        }

        return false;
    }

    function inTimeWindow(target) {
        const now = new Date();

        const t = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            target.h,
            target.m,
            0
        );

        const diff = now - t;

        return diff > 0 && diff < 5 * 60 * 1000;
    }

    function runWithRetry(tag) {

        if (alreadyDone(tag)) return;

        const clicked = tryClick(tag);

        if (!clicked) {
            console.log("⏳ 没点到，继续等...");
            return;
        }

        // 等待结果
        setTimeout(() => {

            if (isSuccess()) {
                console.log("🎉 打卡成功！");
                markDone(tag);
                return;
            }

            // ❌ 失败 → 重试
            retryCount++;

            if (retryCount <= MAX_RETRY) {
                console.log(`🔁 重试第 ${retryCount} 次`);
                setTimeout(() => runWithRetry(tag), 3000);
            } else {
                console.log("❌ 多次失败，准备刷新页面");
                location.reload();
            }

        }, 3000);
    }

    const observer = new MutationObserver(() => {
        TARGET_TIMES.forEach(t => {

            if (!alreadyDone(t.key) && inTimeWindow(t)) {
                runWithRetry(t.key);
            }

        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    setTimeout(() => {
        TARGET_TIMES.forEach(t => {
            if (!alreadyDone(t.key) && inTimeWindow(t)) {
                runWithRetry(t.key);
            }
        });
    }, 2000);

    console.log("👀 正在监听 DOM...");
}

function findRecordBtn() {
    // ✅ 1. 先查主页面（当前你的情况）
    let btn = document.getElementById("ess.recordTimestampButton.Label");
    if (btn) {
        console.log("✅ 主页面找到按钮");
        return btn;
    }

    // ✅ 2. 再查 iframe（兼容旧结构）
    const iframes = document.querySelectorAll("iframe");

    for (let iframe of iframes) {
        try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            if (!doc) continue;

            const btn = doc.getElementById("ess.recordTimestampButton.Label");
            if (btn) {
                console.log("✅ iframe 里找到按钮");
                return btn;
            }
        } catch (e) {}
    }

    console.log("❌ 哪里都没找到按钮");
    return null;
}
