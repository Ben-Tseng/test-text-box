(() => {
  function info(el) {
    if (!el) return null;
    return {
      tag: el.tagName,
      id: el.id,
      className: el.className,
      name: el.name,
      value: typeof el.value === "string" ? el.value : undefined
    };
  }

  const target = document.querySelector("#email-body, textarea.email-body, textarea[name='email-body']");
  console.log("target:", info(target));
  console.log("active before right click test:", info(document.activeElement));

  if (target) {
    target.addEventListener("focus", () => console.log("target focus", info(document.activeElement)), true);
    target.addEventListener("blur", () => console.log("target blur", info(document.activeElement)), true);
    target.addEventListener("contextmenu", () => {
      console.log("contextmenu on target");
      console.log("active during contextmenu:", info(document.activeElement));
      setTimeout(() => {
        console.log("active 200ms later:", info(document.activeElement));
      }, 200);
    }, true);
  }
})();


(() => {
  const active = document.activeElement;
  const target = document.querySelector("#email-body, textarea.email-body, textarea[name='email-body']");

  console.log("target === active ?", target === active);
  console.log("target:", target);
  console.log("active:", active);

  if (active && active.tagName && active.tagName.toLowerCase() === "textarea") {
    console.log("plugin would try to insert into:", active);
  } else {
    console.log("plugin would fail to recognize current active element");
  }
})();


(() => {
  const direct = document.querySelector("#email-body, textarea.email-body, textarea[name='email-body']");
  console.log("found in current document:", !!direct, direct);

  const frames = [...document.querySelectorAll("iframe, frame")];
  console.log("frames:", frames.length);

  frames.forEach((frame, i) => {
    try {
      const doc = frame.contentDocument;
      const found = doc && doc.querySelector("#email-body, textarea.email-body, textarea[name='email-body']");
      console.log(`frame ${i}:`, { src: frame.src, found: !!found, el: found || null });
    } catch (e) {
      console.log(`frame ${i}: inaccessible`, frame.src, e.message);
    }
  });
})();


(() => {
  const el = document.querySelector("#email-body, textarea.email-body, textarea[name='email-body']");
  if (!el) return console.log("target not found");

  el.focus();
  el.value = "TEST123";
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));

  console.log("immediately after set:", el.value);
  setTimeout(() => console.log("after 300ms:", el.value), 300);
  setTimeout(() => console.log("after 1000ms:", el.value), 1000);
})();


