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






var selectHeader = document.querySelectorAll(
  'div.kat-select-container.small .select-header'
)[3];

if (selectHeader) {
  selectHeader.click();
  setTimeout(function () {
    var options = document.querySelectorAll('.select-options div');
    options.forEach(function (option) {
      if (option.innerText.trim() === 'Other or Non-TAM Actionable Cases') {
        option.click();
      }
    });
  }, 1);
}


(() => {
  const host = document.querySelectorAll('kat-dropdown')[3];
  if (!host) {
    console.log('没找到第4个 kat-dropdown');
    return;
  }

  const trigger =
    host.shadowRoot?.querySelector('.select-header') ||
    host.shadowRoot?.querySelector('#katal-id-10') ||
    host.shadowRoot?.querySelector('#katal-id-9');

  if (!trigger) {
    console.log('没找到 trigger');
    return;
  }

  const fire = (type) => {
    trigger.dispatchEvent(new MouseEvent(type, {
      view: window,
      bubbles: true,
      cancelable: true,
      composed: true
    }));
  };

  trigger.focus();
  fire('pointerdown');
  fire('mousedown');
  fire('mouseup');
  fire('click');

  console.log('已尝试点击 trigger', trigger);
})();


(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const host = document.querySelectorAll('kat-dropdown')[3];
  if (!host) {
    console.log('没找到 dropdown');
    return;
  }

  const trigger =
    host.shadowRoot?.querySelector('.select-header') ||
    host.shadowRoot?.querySelector('#katal-id-10') ||
    host.shadowRoot?.querySelector('#katal-id-9');

  if (!trigger) {
    console.log('没找到 trigger');
    return;
  }

  const fireMouse = (type) => {
    trigger.dispatchEvent(new MouseEvent(type, {
      view: window,
      bubbles: true,
      cancelable: true,
      composed: true
    }));
  };

  const fireKey = (key) => {
    trigger.dispatchEvent(new KeyboardEvent('keydown', {
      key,
      code: key,
      keyCode: key === 'ArrowDown' ? 40 : 13,
      which: key === 'ArrowDown' ? 40 : 13,
      bubbles: true,
      cancelable: true,
      composed: true
    }));
  };

  trigger.focus();
  fireMouse('pointerdown');
  fireMouse('mousedown');
  fireMouse('mouseup');
  fireMouse('click');

  await sleep(300);

  for (let i = 0; i < 8; i++) {
    fireKey('ArrowDown');
    await sleep(80);
  }

  fireKey('Enter');
  console.log('已尝试按第 9 项选择');
})();

(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const targetValue = '10069';

  const host = document.querySelectorAll('kat-dropdown')[3];
  if (!host) {
    console.log('没找到第4个 kat-dropdown');
    return;
  }

  const shadow = host.shadowRoot;
  const trigger =
    shadow?.querySelector('.select-header') ||
    shadow?.querySelector('#katal-id-10') ||
    shadow?.querySelector('#katal-id-11') ||
    shadow?.querySelector('#katal-id-9');

  if (!trigger) {
    console.log('没找到 trigger');
    return;
  }

  trigger.click();
  await sleep(200);

  const option =
    shadow?.querySelector(`kat-option[value="${targetValue}"]`) ||
    [...shadow.querySelectorAll('kat-option')].find(
      el => el.getAttribute('value') === targetValue
    );

  if (!option) {
    console.log(
      '没找到目标 option',
      targetValue,
      [...shadow.querySelectorAll('kat-option')].map(el => ({
        value: el.getAttribute('value'),
        text: el.innerText?.trim()
      }))
    );
    return;
  }

  option.click();
  option.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    composed: true
  }));

  console.log('已点击 option:', option);
})();

(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const targetText = 'Other or Non-TAM Actionable Cases';

  const host = document.querySelectorAll('kat-dropdown')[3];
  const shadow = host?.shadowRoot;
  const trigger = shadow?.querySelector('.select-header');

  if (!host || !shadow || !trigger) {
    console.log('初始化失败');
    return;
  }

  trigger.click();
  await sleep(200);

  const option = [...shadow.querySelectorAll('kat-option')].find(el =>
    el.innerText?.trim() === targetText ||
    el.textContent?.trim() === targetText ||
    el.getAttribute('title') === targetText
  );

  if (!option) {
    console.log(
      '没找到目标项',
      [...shadow.querySelectorAll('kat-option')].map(el => ({
        text: el.innerText?.trim(),
        textContent: el.textContent?.trim(),
        value: el.getAttribute('value')
      }))
    );
    return;
  }

  option.click();
  console.log('已点击:', option);
})();




(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function clickDropdownTrigger(host) {
    const trigger =
      host?.shadowRoot?.querySelector('.select-header') ||
      host?.shadowRoot?.querySelector('[id^="katal-id-"]');

    if (!trigger) return false;

    const fireMouse = (type) => {
      trigger.dispatchEvent(new MouseEvent(type, {
        view: window,
        bubbles: true,
        cancelable: true,
        composed: true
      }));
    };

    trigger.focus();
    fireMouse('pointerdown');
    fireMouse('mousedown');
    fireMouse('mouseup');
    fireMouse('click');
    return true;
  }

  async function chooseDropdownOption(host, targetValue) {
    if (!host || !clickDropdownTrigger(host)) return false;

    await sleep(250);

    const shadow = host.shadowRoot;
    const option =
      shadow?.querySelector(`kat-option[value="${targetValue}"]`) ||
      [...(shadow?.querySelectorAll('kat-option') || [])].find(
        (node) => node.getAttribute('value') === String(targetValue)
      );

    if (!option) {
      console.log(
        '没找到 option',
        targetValue,
        [...(shadow?.querySelectorAll('kat-option') || [])].map(node => ({
          value: node.getAttribute('value'),
          text: node.innerText?.trim(),
          title: node.getAttribute('title')
        }))
      );
      return false;
    }

    option.click();
    option.dispatchEvent(new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      composed: true
    }));

    return true;
  }

  const CATEGORY_VALUE = '10069';
  const REASON_TEXT = 'Other - No Applicable Reason Code';

  const dropdowns = [...document.querySelectorAll('kat-dropdown')];

  const categoryDropdown =
    dropdowns.find(node => node.getAttribute('label') === 'Reason category') ||
    dropdowns[3];

  const firstOk = await chooseDropdownOption(categoryDropdown, CATEGORY_VALUE);
  console.log('第一个下拉结果 =', firstOk);

  await sleep(1000);

  const refreshed = [...document.querySelectorAll('kat-dropdown')];
  const reasonDropdown =
    refreshed.find(node => node.getAttribute('label') === 'Reason code') ||
    refreshed[4];

  if (!reasonDropdown) {
    console.log('没找到第二个下拉框');
    return;
  }

  const reasonOptions = JSON.parse(reasonDropdown.getAttribute('options') || '[]');
  const matchedReason = reasonOptions.find(item => item.name === REASON_TEXT);

  if (!matchedReason) {
    console.log('没找到第二个下拉目标项', REASON_TEXT, reasonOptions);
    return;
  }

  const secondOk = await chooseDropdownOption(reasonDropdown, String(matchedReason.value));
  console.log('第二个下拉结果 =', secondOk, matchedReason);
})();


(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const SUBJECT_TEXT = '卖家身份验证';
  const BODY_TEXT = '这里先放测试正文';
  const CATEGORY_VALUE = '10069';
  const REASON_TEXT = 'Other - No Applicable Reason Code';

  function fillTextInput(element, value) {
    if (!element) return false;
    element.focus();
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function fillShadowInput(host, value) {
    const input =
      host?.shadowRoot?.querySelector('input') ||
      host?.shadowRoot?.querySelector('#katal-id-7');

    if (!input) return false;

    input.focus();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
    return true;
  }

  function fillSubject(value) {
    const host =
      document.querySelector('kat-input#createCaseInput') ||
      document.querySelector('#subject-input-group kat-input');

    if (fillShadowInput(host, value)) return true;

    return (
      fillTextInput(document.getElementById('katal-id-7'), value) ||
      fillTextInput(document.getElementById('katal-id-6'), value)
    );
  }

  function clickDropdownTrigger(host) {
    const trigger =
      host?.shadowRoot?.querySelector('.select-header') ||
      host?.shadowRoot?.querySelector('[id^="katal-id-"]');

    if (!trigger) return false;

    const fireMouse = (type) => {
      trigger.dispatchEvent(new MouseEvent(type, {
        view: window,
        bubbles: true,
        cancelable: true,
        composed: true
      }));
    };

    trigger.focus();
    fireMouse('pointerdown');
    fireMouse('mousedown');
    fireMouse('mouseup');
    fireMouse('click');
    return true;
  }

  async function chooseDropdownOption(host, targetValue) {
    if (!host || !clickDropdownTrigger(host)) return false;

    await sleep(250);

    const shadow = host.shadowRoot;
    const option =
      shadow?.querySelector(`kat-option[value="${targetValue}"]`) ||
      [...(shadow?.querySelectorAll('kat-option') || [])].find(
        (node) => node.getAttribute('value') === String(targetValue)
      );

    if (!option) {
      console.log(
        '没找到 option',
        targetValue,
        [...(shadow?.querySelectorAll('kat-option') || [])].map(node => ({
          value: node.getAttribute('value'),
          text: node.innerText?.trim(),
          title: node.getAttribute('title')
        }))
      );
      return false;
    }

    option.click();
    option.dispatchEvent(new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      composed: true
    }));

    return true;
  }

  console.log('1. 填主题');
  const subjectOk = fillSubject(SUBJECT_TEXT);
  console.log('主题结果 =', subjectOk);

  console.log('2. 填正文');
  const bodyOk = fillTextInput(document.querySelector('textarea'), BODY_TEXT);
  console.log('正文结果 =', bodyOk);

  console.log('3. 选择第一个下拉框');
  const dropdowns = [...document.querySelectorAll('kat-dropdown')];
  const categoryDropdown =
    dropdowns.find(node => node.getAttribute('label') === 'Reason category') ||
    dropdowns[3];

  const firstOk = await chooseDropdownOption(categoryDropdown, CATEGORY_VALUE);
  console.log('第一个下拉结果 =', firstOk);

  console.log('4. 等第二个下拉框出现');
  await sleep(1000);

  const refreshed = [...document.querySelectorAll('kat-dropdown')];
  const reasonDropdown =
    refreshed.find(node => node.getAttribute('label') === 'Reason code') ||
    refreshed[4];

  if (!reasonDropdown) {
    console.log('没找到第二个下拉框');
    return;
  }

  const reasonOptions = JSON.parse(reasonDropdown.getAttribute('options') || '[]');
  const matchedReason = reasonOptions.find(item => item.name === REASON_TEXT);

  if (!matchedReason) {
    console.log('没找到第二个下拉目标项', REASON_TEXT, reasonOptions);
    return;
  }

  console.log('5. 选择第二个下拉框');
  const secondOk = await chooseDropdownOption(reasonDropdown, String(matchedReason.value));
  console.log('第二个下拉结果 =', secondOk, matchedReason);

  console.log('测试结束');
})();



(() => {
  const radio =
    document.querySelector('input[name="caseStatusRadioGroup"][value="RS"]') ||
    document.querySelector('input[aria-label="Resolved"]');

  if (!radio) {
    console.log('没找到 Resolved 对应的 radio');
    return;
  }

  radio.checked = true;
  radio.click();
  radio.dispatchEvent(new Event('input', { bubbles: true }));
  radio.dispatchEvent(new Event('change', { bubbles: true }));

  console.log('已尝试选中 Resolved', radio);
})();


(() => {
  const labelText = [...document.querySelectorAll('span[part="label-text"]')]
    .find(el => el.textContent?.trim() === 'Resolved');

  const label = labelText?.closest('label');

  if (!label) {
    console.log('没找到 Resolved 的 label');
    return;
  }

  label.click();
  console.log('已点击 Resolved 的 label', label);
})();


(() => {
  const radio =
    document.querySelector('input[name="caseStatusRadioGroup"][value="RS"]') ||
    document.querySelector('input[aria-label="Resolved"]');

  if (!radio) {
    console.log('没找到 Resolved 对应的 radio');
    return;
  }

  const label = document.querySelector(`label[for="${radio.id}"]`);

  if (label) {
    label.click();
  } else {
    radio.checked = true;
    radio.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      composed: true
    }));
    radio.dispatchEvent(new Event('input', { bubbles: true }));
    radio.dispatchEvent(new Event('change', { bubbles: true }));
  }

  console.log('已尝试选中 Resolved', { radio, label });
})();



