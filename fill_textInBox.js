(() => {
  // 1) 在当前 document 里找 “Business Name” 对应的 strong 文本
  function getBusinessName(doc) {
    // 找到包含 "Business Name" 的块（按你图里的结构：section.row.sop-entry-question）
    const containers = Array.from(
      doc.querySelectorAll('section.row.sop-entry-question, section.row.sop-entry, article, div')
    );

    const hit = containers.find(el => el && el.textContent && el.textContent.includes('Business Name'));
    if (!hit) return null;

    // 取该块内的 strong（你第二张图就是 strong 包住中文名）
    const strong = hit.querySelector('strong');
    return strong ? strong.innerText.trim() : null;
  }

  // 2) 找到注释输入框 textarea
  function getAnnotationTextarea(doc) {
    return (
      doc.querySelector('#annotationText') ||
      doc.querySelector('textarea[name="annotationText"]') ||
      doc.querySelector('textarea[placeholder="Enter annotations"]')
    );
  }

  // 3) 写入并触发事件（React 常用）
  function setTextareaValue(textarea, value) {
    textarea.focus();
    textarea.value = value;

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 4) 如果页面有 iframe，尝试在主文档和子 frame 里都找一遍
  const docsToTry = [document];
  document.querySelectorAll('iframe').forEach(f => {
    try {
      if (f.contentDocument) docsToTry.push(f.contentDocument);
    } catch (_) {}
  });

  let name = null;
  let targetTA = null;

  for (const doc of docsToTry) {
    if (!name) name = getBusinessName(doc);
    if (!targetTA) targetTA = getAnnotationTextarea(doc);
  }

  if (!name) {
    console.warn('没找到 Business Name 对应的 <strong> 文本（检查是否在 iframe / 文案是否不是 "Business Name"）');
    return;
  }
  if (!targetTA) {
    console.warn('没找到 annotation textarea（检查 id 是否确实是 annotationText，或是否在 iframe）');
    return;
  }

  setTextareaValue(targetTA, name);
  console.log('已写入 annotationText:', name);
})();
