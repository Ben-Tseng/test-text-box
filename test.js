function startAutoTimestampBot(options = {}) {
    console.log("✅ 自动打卡函数已启动");

    const TARGET_TIMES = options.times || [
        { h: 7, m: 55, key: "morning" },
        { h: 17, m: 0, key: "evening" }
    ];

    const REFRESH_INTERVAL = options.refreshInterval || 60 * 60 * 1000;
    const CHECK_INTERVAL = options.checkInterval || 60 * 1000;

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

    function clickLogic(tag) {
        console.log("🚀 执行打卡逻辑:", tag);

        const btn1 = document.querySelector('.related-item__btn[title="My Timestamp"]');

        if (btn1) {
            console.log("👉 使用 iframe 逻辑");

            btn1.click();

            setTimeout(() => {
                const iframe = document.getElementById('widgetFrame3818');

                if (!iframe) {
                    console.log("❌ iframe 未找到");
                    return;
                }

                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const btn2 = doc.querySelector('button[title="Record Timestamp"]');

                if (btn2) {
                    btn2.click();
                    console.log("✅ iframe 打卡成功");
                    markDone(tag);
                } else {
                    console.log("❌ iframe 按钮未找到");
                }

            }, 8000);

        } else {
            console.log("👉 使用直接点击逻辑");

            const btn = document.getElementById("ess.recordTimestampButton.Label");

            if (btn) {
                btn.click();
                console.log("✅ 直接打卡成功");
                markDone(tag);
            } else {
                console.log("❌ 按钮未找到");
            }
        }
    }

    function checkAndRun() {
        const now = new Date();

        TARGET_TIMES.forEach(t => {
            const target = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                t.h,
                t.m,
                0
            );

            const diff = now - target;

            if (diff > 0 && diff < 5 * 60 * 1000) {
                if (!alreadyDone(t.key)) {
                    clickLogic(t.key);
                } else {
                    console.log(`⏩ ${t.key} 已执行过`);
                }
            }
        });
    }

    // 启动定时器
    const checkTimer = setInterval(checkAndRun, CHECK_INTERVAL);

    const refreshTimer = setInterval(() => {
        console.log("🔄 页面刷新：" + new Date().toLocaleTimeString());
        location.reload();
    }, REFRESH_INTERVAL);

    // 立即执行一次检查
    checkAndRun();

    // 返回控制器（高级用法）
    return {
        stop: () => {
            clearInterval(checkTimer);
            clearInterval(refreshTimer);
            console.log("🛑 自动打卡已停止");
        }
    };
}
