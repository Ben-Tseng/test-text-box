javascript:(function(){
    alert("Bookmarklet 已执行");

    console.log("脚本开始运行");

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
        alert("开始点击逻辑");

        const btn1 = document.querySelector('.related-item__btn[title="My Timestamp"]');

        if (btn1) {
            alert("走 iframe 逻辑");
            btn1.click();

            setTimeout(() => {
                const iframe = document.getElementById('widgetFrame3818');

                if (!iframe) {
                    alert("iframe 没找到");
                    return;
                }

                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const btn2 = doc.querySelector('button[title="Record Timestamp"]');

                if (btn2) {
                    btn2.click();
                    alert("iframe 内按钮已点击");
                } else {
                    alert("iframe 内按钮没找到");
                }

            }, 8000);

        } else {
            alert("走直接点击逻辑");

            const btn = document.getElementById("ess.recordTimestampButton.Label");

            if (btn) {
                btn.click();
                alert("直接点击成功");
            } else {
                alert("按钮没找到");
            }
        }
    }

    function scheduleOnce(hour, minute) {
        const delay = getDelayUntil(hour, minute);

        console.log(hour + ":" + minute + " delay=", delay);

        if (delay > 0) {
            setTimeout(clickLogic, delay);
            alert("已设置 " + hour + ":" + minute);
        } else {
            alert(hour + ":" + minute + " 已过");
        }
    }

    scheduleOnce(7,55);
    scheduleOnce(17,0);

})();
