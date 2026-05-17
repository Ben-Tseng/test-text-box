function startSmartTimestampBot() {

    console.log("🚀 启动");

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

    let entryClicked = false;

    function tryClick(tag) {

        // ✅ 状态3：直接按钮
        let btn = document.getElementById("ess.recordTimestampButton.Label");

        if (btn) {
            console.log("✅ 状态3：直接点击");
            btn.click();
            markDone(tag);
            return true;
        }

        // ✅ 状态1：必须先点 entry
        const entry = document.querySelector('.related-item__btn[title="My Timestamp"]');

        if (entry && !entryClicked) {
            console.log("👉 状态1：点击 entry");
            entry.click();
            entryClicked = true;
            return false; // 等 DOM 变化
        }

        // ✅ 状态2：iframe
        const iframes = document.querySelectorAll("iframe");

        for (let iframe of iframes) {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;

                const btn2 = doc.querySelector('button[title="Record Timestamp"]');

                if (btn2) {
                    console.log("✅ 状态2：iframe 点击");
                    btn2.click();
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

    const observer = new MutationObserver(() => {
        TARGET_TIMES.forEach(t => {

            if (!alreadyDone(t.key) && inTimeWindow(t)) {

                const success = tryClick(t.key);

                if (success) {
                    console.log("🎉 成功");
                } else {
                    console.log("⏳ 等待页面变化...");
                }
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
                tryClick(t.key);
            }
        });
    }, 2000);
}







// 
// 非中国ID：跳过DOB比对，但仍需执行ARVT逻辑
if(!a(idNum)){
    const arvtResult=getArvtResult(docs);
    const annotationTA=i(docs);
    if(annotationTA){
        let suffix="";
        if(arvtResult==="fail")  suffix="ARVT results: Fail；Deny for I2V fail";
        else if(arvtResult==="skip") suffix="ARVT results: ID skipped";
        else suffix="ARVT results: Pass.";
        o(annotationTA, suffix);
    }
    if(arvtResult==="fail") runI2vIdentityFailFlow(docs);
    return true;
}
