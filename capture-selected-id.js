/**
 * Run in source page console.
 * Purpose: capture selected ID text and copy to clipboard.
 */
(async () => {
  const clean = (s) => String(s || "").replace(/\u00a0/g, " ").replace(/[\r\n\t]/g, "").trim();
  const selected = clean(window.getSelection?.().toString() || "");
  const idValue = selected || clean(window.prompt("请输入或粘贴 ID:", ""));
  if (!idValue) throw new Error("未获取到 ID。");

  try {
    await navigator.clipboard.writeText(idValue);
    console.log("已复制 ID 到剪贴板:", idValue);
  } catch (_) {
    console.log("剪贴板写入失败，请手动复制这个 ID:", idValue);
  }
})();
