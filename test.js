javascript:(function(){

    function getDelayUntil(hour, minute) {
        const now = new Date();
        const target = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hour,
            minute,
            0,
            0
        );

        return target - now;
    }

    function clickLogic() {
        console.log("开始执行打卡逻辑...");

        // ===== 第一种页面 =====
        const btn1 = document.querySelector('.related-item__btn[title="My Timestamp"]');

        if (btn1) {
            console.log("使用第一套逻辑（iframe 页面）");
            btn1.click();

            setTimeout(() => {
                const iframe = document.getElementById('widgetFrame3818');

                if (!iframe) {
                    console.log("iframe 未找到");
                    return;
                }

                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const btn2 = doc.querySelector('button[title="Record Timestamp"]');

                if (btn2) {
                    btn2.click();
                    console.log("iframe 内按钮已点击");
                } else {
                    console.log("iframe 内按钮未找到");
                }

            }, 8000);

        } else {
            // ===== 第二种页面 =====
            console.log("使用第二套逻辑（直接点击）");

            const btn = document.getElementById("ess.recordTimestampButton.Label");

            if (btn) {
                btn.click();
                console.log("直接按钮点击成功");
            } else {
                console.log("第二套按钮也没找到");
            }
        }
    }

    function scheduleOnce(hour, minute) {
        const delay = getDelayUntil(hour, minute);

        if (delay > 0) {
            setTimeout(clickLogic, delay);
            console.log(`已设置今天 ${hour}:${minute} 执行`);
        } else {
            console.log(`${hour}:${minute} 已经过了，不执行`);
        }
    }

    // ===== 只执行今天 =====
    scheduleOnce(7, 55);
    scheduleOnce(17, 0);

    alert("今天打卡定时已设置（仅执行一次）");

})();
