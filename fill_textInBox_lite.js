(function () {

  const nameEl = document.querySelector('.no-side-padding + .normal-input strong');
  const textarea = document.querySelector('#annotationText');

  if (!nameEl || !textarea) return;

  const value = nameEl.innerText.trim();

  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value"
  ).set;

  setter.call(textarea, value);

  textarea.dispatchEvent(new Event("input", { bubbles: true }));

})();
