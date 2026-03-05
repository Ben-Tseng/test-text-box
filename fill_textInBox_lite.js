(function () {

  // 获取所有 iframe
  const iframes = document.querySelectorAll("iframe");

  let businessName = null;
  let textarea = null;

  iframes.forEach(frame => {
    try {
      const doc = frame.contentDocument || frame.contentWindow.document;

      // 找 Business Name
      const nameEl = doc.querySelector('.no-side-padding + .normal-input strong');
      if (nameEl) {
        businessName = nameEl.innerText.trim();
      }

      // 找 annotation textarea
      const ta = doc.querySelector('#annotationText');
      if (ta) {
        textarea = ta;
      }

    } catch (e) {}
  });

  if (businessName && textarea) {

    // React textarea setter
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value"
    ).set;

    setter.call(textarea, businessName);

    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    console.log("已写入:", businessName);
  }

})();
