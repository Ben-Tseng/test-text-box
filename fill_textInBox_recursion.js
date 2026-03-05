(() => {
  let bizName = null;
  let annotationTA = null;

  function findBizNameInDoc(doc) {
    // 精确找到 label 文本等于 Business Name 的元素
    const label = [...doc.querySelectorAll('.no-side-padding, div, span, label')]
      .find(el => (el.textContent || '').trim() === 'Business Name');

    if (!label) return null;

    // 同一行容器（通常是 .row）
    const row = label.closest('.row') || label.parentElement;
    if (!row) return null;

    // 取该行右侧值
    const strong = row.querySelector('.normal-input strong') || row.querySelector('strong');
    return strong ? strong.textContent.trim() : null;
  }

  function setReactTextareaValue(textarea, value) {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    (setter ? setter.call(textarea, value) : (textarea.value = value));

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function walk(win) {
    try {
      const doc = win.document;

      // 找 textarea
      if (!annotationTA) {
        const ta = doc.querySelector('#annotationText');
        if (ta) annotationTA = ta;
      }

      // 找 Business Name（只要拿到一次就不再覆盖）
      if (!bizName) {
        const v = findBizNameInDoc(doc);
        if (v) bizName = v;
      }

      // 递归子 frame
      for (let i = 0; i < win.frames.length; i++) {
        if (bizName && annotationTA) break;
        walk(win.frames[i]);
      }
    } catch (e) {
      // 跨域 iframe 会进这里，忽略
    }
  }

  walk(window);

  if (!bizName) return console.warn('没找到 Business Name（可能 label 不是 "Business Name" 或在跨域 iframe）');
  if (!annotationTA) return console.warn('没找到 #annotationText（可能在跨域 iframe 或 id 不同）');

  setReactTextareaValue(annotationTA, bizName);
  console.log('✅ 写入成功:', bizName);
})();
