const STORAGE_KEY = 'autoClickRound';
const MAX_KEY = 'autoClickMax';
const FALLBACK_READY_FRAMES = 30;

let loopActive = false;
let waitForButtonCycle = false;
let sawButtonNotReady = false;
let readyFramesAfterClick = 0;

function deepQuery(selector, root = document) {
  let found = root.querySelector(selector);
  if (found) return found;

  for (const el of root.querySelectorAll('*')) {
    if (el.shadowRoot) {
      found = deepQuery(selector, el.shadowRoot);
      if (found) return found;
    }
  }
  return null;
}

function isButtonReady(btn) {
  if (!btn) return false;
  if (btn.disabled) return false;
  if (btn.getAttribute('aria-disabled') === 'true') return false;
  return true;
}

function matchesIncreaseTaskText(node) {
  const text = (node && node.textContent ? node.textContent : '').replace(/\s+/g, ' ').trim();
  return text === 'Increase Task';
}

function findIncreaseTaskButton() {
  const selectors = [
    'kat-button[label="Increase Task"] button',
    '.increase-button kat-button[label="Increase Task"] button',
    '.increase-button button',
    'kat-button[label="Increase Task"]',
  ];

  for (const selector of selectors) {
    const found = deepQuery(selector);
    if (!found) continue;

    if (found.tagName && found.tagName.toLowerCase() === 'kat-button') {
      const shadowButton = found.shadowRoot && found.shadowRoot.querySelector('button');
      if (shadowButton) return shadowButton;
    } else {
      return found;
    }
  }

  const allButtons = deepQuery('button, kat-button');
  if (allButtons && matchesIncreaseTaskText(allButtons)) {
    return allButtons.tagName.toLowerCase() === 'kat-button'
      ? (allButtons.shadowRoot && allButtons.shadowRoot.querySelector('button'))
      : allButtons;
  }

  for (const host of document.querySelectorAll('kat-button, button')) {
    if (matchesIncreaseTaskText(host)) {
      if (host.tagName.toLowerCase() === 'kat-button') {
        const shadowButton = host.shadowRoot && host.shadowRoot.querySelector('button');
        if (shadowButton) return shadowButton;
      } else {
        return host;
      }
    }
  }

  return null;
}

function resetCycleState() {
  waitForButtonCycle = false;
  sawButtonNotReady = false;
  readyFramesAfterClick = 0;
}

function scheduleNextTick() {
  requestAnimationFrame(loopTick);
}

function stopLoop() {
  loopActive = false;
  resetCycleState();
}

function startLoop() {
  if (loopActive) return;
  loopActive = true;
  resetCycleState();
  scheduleNextTick();
}

function loopTick() {
  if (!loopActive) return;

  const round = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
  const max = parseInt(localStorage.getItem(MAX_KEY) || '0');

  if (max === 0 || round >= max) {
    console.log('🎉 全部完成或未设置次数');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MAX_KEY);
    stopLoop();
    return;
  }

  const btn = findIncreaseTaskButton();
  const ready = isButtonReady(btn);

  if (waitForButtonCycle) {
    if (!ready) {
      sawButtonNotReady = true;
      readyFramesAfterClick = 0;
    } else if (sawButtonNotReady) {
      resetCycleState();
    } else {
      readyFramesAfterClick++;
      if (readyFramesAfterClick >= FALLBACK_READY_FRAMES) {
        // 某些页面不会切换按钮状态，走帧数兜底继续下一轮
        resetCycleState();
      }
    }
    scheduleNextTick();
    return;
  }

  if (!ready) {
    scheduleNextTick();
    return;
  }

  const nextRound = round + 1;
  localStorage.setItem(STORAGE_KEY, String(nextRound));
  console.log(`⚡ 第 ${nextRound} / ${max} 轮`);
  btn.click();
  console.log('✅ 已点击 Increase Task');

  waitForButtonCycle = true;
  scheduleNextTick();
}

browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'start') {
    stopLoop();
    localStorage.setItem(STORAGE_KEY, '0');
    localStorage.setItem(MAX_KEY, String(message.maxRounds || 5));
    console.log(`🚀 极速模式启动，共 ${message.maxRounds || 5} 次`);
    startLoop();
  }
});

(function checkOnLoad() {
  const round = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
  const max = parseInt(localStorage.getItem(MAX_KEY) || '0');

  if (max > 0 && round < max) {
    console.log(`📌 检测到未完成任务（${round}/${max}），立即继续...`);
    startLoop();
  }
})();
