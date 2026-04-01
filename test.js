function startSmartTimestampBot() {

    console.log("🚀 智能打卡监听已启动");

    const TARGET_TIMES = [
        { h: 7, m: 55, key: "morning" },
        { h: 17, m: 0, key: "evening" }
    ];

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

    // 🎯 模拟更真实点击
    function humanClick(el) {
        if (!el) return;

        el.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(() => {
            el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
            el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
            el.click();
        }, Math.random() * 800 + 200);
    }

    function tryClick(tag) {

        // 1️⃣ 主页面
        let btn = document.getElementById("ess.recordTimestampButton.Label");

        if (btn) {
            console.log("✅ 主页面命中");
            humanClick(btn);
            markDone(tag);
            return true;
        }

        // 2️⃣ iframe
        const iframes = document.querySelectorAll("iframe");

        for (let iframe of iframes) {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;

                // iframe 入口按钮
                const entry = document.querySelector('.related-item__btn[title="My Timestamp"]');
                if (entry) {
                    humanClick(entry);
                }

                const btn2 = doc.querySelector('button[title="Record Timestamp"]');

                if (btn2) {
                    console.log("✅ iframe 命中");
                    humanClick(btn2);
                    markDone(tag);
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

    // 🔥 DOM 监听核心
    const observer = new MutationObserver(() => {
        TARGET_TIMES.forEach(t => {

            if (!alreadyDone(t.key) && inTimeWindow(t)) {

                const success = tryClick(t.key);

                if (success) {
                    console.log("🎉 打卡完成:", t.key);
                } else {
                    console.log("⏳ 元素还没出现，继续监听...");
                }
            }

        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 页面加载时也跑一次
    setTimeout(() => {
        TARGET_TIMES.forEach(t => {
            if (!alreadyDone(t.key) && inTimeWindow(t)) {
                tryClick(t.key);
            }
        });
    }, 2000);

    console.log("👀 正在监听 DOM 变化...");
}
