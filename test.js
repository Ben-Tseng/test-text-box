(() => {
  const TEST_TEXT = "TEST INSERT FROM CONSOLE";

  function isTextInput(el) {
    if (!el || !el.tagName) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === "textarea") return true;
    if (tag !== "input") return false;
    const type = (el.type || "text").toLowerCase();
    return ["text", "search", "url", "tel", "email", "password", "number"].includes(type);
  }

  function setNativeValue(el, value) {
    const proto = el.tagName.toLowerCase() === "textarea"
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    if (descriptor && typeof descriptor.set === "function") {
      descriptor.set.call(el, value);
    } else {
      el.value = value;
    }
  }

  function dispatchInputLifecycle(el, insertedText) {
    let inputEvent;
    try {
      inputEvent = new InputEvent("input", {
        bubbles: true,
        composed: true,
        inputType: "insertText",
        data: insertedText
      });
    } catch (e) {
      inputEvent = new Event("input", { bubbles: true, composed: true });
    }
    el.dispatchEvent(inputEvent);
    el.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  function insertIntoTextControl(el, text) {
    const tag = el.tagName.toLowerCase();
    const insertText = tag === "input" ? text.replace(/\n/g, " ") : text;

    const hasSelection =
      typeof el.selectionStart === "number" &&
      typeof el.selectionEnd === "number";

    if (hasSelection && typeof el.setRangeText === "function") {
      el.setRangeText(insertText, el.selectionStart, el.selectionEnd, "end");
    } else {
      const value = el.value || "";
      const start = hasSelection ? el.selectionStart : value.length;
      const end = hasSelection ? el.selectionEnd : value.length;
      const nextValue = value.slice(0, start) + insertText + value.slice(end);
      setNativeValue(el, nextValue);
      const caret = start + insertText.length;
      if (typeof el.setSelectionRange === "function") {
        el.setSelectionRange(caret, caret);
      }
    }

    el.focus();
    dispatchInputLifecycle(el, insertText);
    return true;
  }

  function insertIntoContentEditable(el, text) {
    let editable = el;
    if (!editable.isContentEditable) {
      editable = el.closest('[contenteditable="true"], [contenteditable=""], [contenteditable]:not([contenteditable="false"])');
    }
    if (!editable || !editable.isContentEditable) return false;

    editable.focus();

    if (document.queryCommandSupported && document.queryCommandSupported("insertText")) {
      const ok = document.execCommand("insertText", false, text);
      if (ok) {
        dispatchInputLifecycle(editable, text);
        return true;
      }
    }

    const selection = editable.ownerDocument.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editable.appendChild(editable.ownerDocument.createTextNode(text));
      dispatchInputLifecycle(editable, text);
      return true;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(editable.ownerDocument.createTextNode(text));
    dispatchInputLifecycle(editable, text);
    return true;
  }

  function getDeepActiveElement(doc) {
    let active = doc.activeElement;
    while (active && active.shadowRoot && active.shadowRoot.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active;
  }

  function resolveEditableTarget(doc, depth = 0) {
    if (!doc || depth > 10) return null;

    let active = getDeepActiveElement(doc);
    console.log(`[depth ${depth}] active:`, active);

    if (!active) return null;

    if (isTextInput(active) || active.isContentEditable) {
      return active;
    }

    if (active.tagName && active.tagName.toLowerCase() === "iframe") {
      try {
        const childDoc = active.contentDocument || active.contentWindow?.document;
        if (!childDoc) return active;
        return resolveEditableTarget(childDoc, depth + 1) || active;
      } catch (e) {
        console.warn("Cannot access iframe document:", e);
        return active;
      }
    }

    return active;
  }

  const target = resolveEditableTarget(document);
  console.log("final target:", target);

  if (!target) {
    console.warn("No target found");
    return;
  }

  if (isTextInput(target)) {
    insertIntoTextControl(target, TEST_TEXT);
    console.log("Inserted into text input/textarea. Current value:", target.value);
    return;
  }

  if (target.isContentEditable || target.closest?.('[contenteditable="true"], [contenteditable=""], [contenteditable]:not([contenteditable="false"])')) {
    insertIntoContentEditable(target, TEST_TEXT);
    console.log("Inserted into contenteditable");
    return;
  }

  console.warn("Target found but unsupported:", target);
})();
