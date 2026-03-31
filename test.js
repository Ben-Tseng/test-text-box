// ==UserScript==
// @name         Auto Timestamp Bot (Stable)
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("✅ 自动打卡脚本已启动");

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

            // 在目标时间 ±5分钟内执行
            if (diff > 0 && diff < 5 * 60 * 1000) {
                if (!alreadyDone(t.key)) {
                    clickLogic(t.key);
                } else {
                    console.log(`⏩ ${t.key} 已执行过`);
                }
            }
        });
    }

    // 每分钟检查一次时间（更稳）
    setInterval(checkAndRun, 60 * 1000);

    // 页面加载时立即检查一次
    checkAndRun();

    // 每1小时自动刷新页面
    setInterval(() => {
        console.log("🔄 页面刷新：" + new Date().toLocaleTimeString());
        location.reload();
    }, 60 * 60 * 1000);

})();
