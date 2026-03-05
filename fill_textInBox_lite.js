function findInFrames(win) {
  try {
    const doc = win.document;

    const nameEl = doc.querySelector('.no-side-padding + .normal-input strong');
    const ta = doc.querySelector('#annotationText');

    if (nameEl) window.bizName = nameEl.innerText.trim();
    if (ta) window.annotation = ta;

    for (let i = 0; i < win.frames.length; i++) {
      findInFrames(win.frames[i]);
    }
  } catch (e) {}
}

findInFrames(window);

if (window.bizName && window.annotation) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value"
  ).set;

  setter.call(window.annotation, window.bizName);
  window.annotation.dispatchEvent(new Event("input", { bubbles: true }));
}
