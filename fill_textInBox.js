(() => {
  // 精确取 “Business Name” 这一行右侧的值（strong）
  function extractBusinessName(doc) {
    // 1) 找到文本内容 *等于* Business Name 的 label 节点（通常是 <div>Business Name</div>）
    const label = Array.from(doc.querySelectorAll('div, span, label'))
      .find(el => el.textContent && el.textContent.trim() === 'Business Name');

    if (!label) return null;

    // 2) 往上找最近的“这一行”的容器（你图里是 div.row）
    const row = label.closest('.row') || label.parentElement;
    if (!row) return null;

    // 3) 在这一行里找右侧输入区域（normal-input）里的 strong
    const valueStrong =
      row.querySelector('.normal-input strong') ||
      row.querySelector('strong');

    return valueStrong ? valueStrong.textContent.trim() : null;
  }

  function findAnnotationTextarea(doc) {
    return (
      doc.querySelector('#annotationText') ||
      doc.querySelector('textarea[name="annotationText"]') ||
      doc.querySelector('textarea[placeholder="Enter annotations"]')
    );
  }

  // React/受控输入常用：用原生 setter + input/change 事件
  function setTextarea(textarea, value) {
    textarea.focus();

    const proto = Object.getPrototypeOf(textarea);
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) desc.set.call(textarea, value);
    else textarea.value = value;

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 如果内容在 iframe，主文档和 frame 都试一下
  const docs = [document];
  document.querySelectorAll('iframe').forEach(f => {
    try { if (f.contentDocument) docs.push(f.contentDocument); } catch (_) {}
  });

  let bizName = null;
  let ta = null;

  for (const d of docs) {
    if (!bizName) bizName = extractBusinessName(d);
    if (!ta) ta = findAnnotationTextarea(d);
  }

  if (!bizName) {
    console.warn('没取到 Business Name。确认页面上 label 文本是否正好是 "Business Name"（大小写/空格/语言）。');
    return;
  }
  if (!ta) {
    console.warn('没找到 annotation textarea（#annotationText）。可能在 iframe 或 id 不同。');
    return;
  }

  setTextarea(ta, bizName);
  console.log('✅ 已写入 Business Name 到 annotationText:', bizName);
})();
