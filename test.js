// 方法1：通过ID找到链接按钮并点击
const allDocsBtn = document.getElementById('documents-link-button');
if (allDocsBtn) {
    const link = allDocsBtn.querySelector('a');
    if (link) {
        link.click();
        console.log('已点击 All Documents 链接');
    } else {
        console.log('未找到 a 标签');
    }
} else {
    // 方法2：通过文本内容查找
    const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('All Documents'));
    if (link) {
        link.click();
        console.log('已通过文本找到并点击链接');
    } else {
        console.log('未找到 All Documents 按钮');
    }
}

// 精简版 - 直接复制使用
(function(){let r=[];(function s(d){d.querySelectorAll('a').forEach(a=>{a.textContent.includes('All Documents')&&r.push(a)});d.querySelectorAll('iframe').forEach(f=>{try{let c=f.contentDocument||f.contentWindow?.document;c&&s(c)}catch(e){}})})(document);r[0]?r[0].click():console.log('未找到');})();


// 1. 找到对应的自定义组件元素
// 这里使用了 label 属性作为特征定位
const katButton = document.querySelector('kat-button[label="PERSONA_BUSINESS_LICENSE"]');

if (katButton && katButton.shadowRoot) {
    // 2. 进入 shadowRoot 寻找内部的 button 元素
    const innerButton = katButton.shadowRoot.querySelector('button.button');
    if (innerButton) {
        innerButton.click();
        console.log("成功点击按钮");
    } else {
        console.log("未找到 Shadow DOM 内部的按钮");
    }
} else {
    console.log("未找到 kat-button 元素或 shadowRoot 未开放");
}

document.querySelector('kat-button[label="PERSONA_BUSINESS_LICENSE"]').click();




function clickShadowElement(labelName) {
    // 递归函数：在元素及其所有 shadowRoot 中查找
    function findInShadow(root, selector) {
        const found = root.querySelector(selector);
        if (found) return found;

        const children = root.querySelectorAll('*');
        for (let child of children) {
            if (child.shadowRoot) {
                const result = findInShadow(child.shadowRoot, selector);
                if (result) return result;
            }
        }
        return null;
    }

    // 1. 先找到那个自定义的 kat-button
    const targetHost = findInShadow(document, `kat-button[label="${labelName}"]`);
    
    if (targetHost && targetHost.shadowRoot) {
        // 2. 找到它内部真正的 button 元素
        const realButton = targetHost.shadowRoot.querySelector('button.button');
        if (realButton) {
            realButton.click();
            console.log('✅ 成功触发点击:', labelName);
        } else {
            console.error('❌ 找到了宿主，但内部 button 没找到');
        }
    } else {
        console.error('❌ 未找到匹配 label 的 kat-button 元素');
    }
}

// 执行点击
clickShadowElement('PERSONA_BUSINESS_LICENSE');








(()=>{
  function getAllDocs(w, d=[]) {
    try {
      w.document && d.push(w.document);
      for (let i=0; i<w.frames.length; i++) getAllDocs(w.frames[i], d);
    } catch(e) {}
    return d;
  }

  function getPageTitle(doc) {
    const t = doc.querySelector("h2.navbar-brand");
    return t ? t.textContent.trim() : "";
  }

  function clickAllDocuments(doc) {
    let found = [];
    (function scan(d) {
      d.querySelectorAll('a').forEach(a => {
        a.textContent.includes('All Documents') && found.push(a);
      });
      d.querySelectorAll('iframe').forEach(f => {
        try {
          const c = f.contentDocument || f.contentWindow?.document;
          c && scan(c);
        } catch(e) {}
      });
    })(doc);
    if (found[0]) {
      found[0].click();
      return true;
    }
    console.log('未找到 All Documents');
    return false;
  }

  function findInShadow(root, selector) {
    const found = root.querySelector(selector);
    if (found) return found;
    const children = root.querySelectorAll('*');
    for (let child of children) {
      if (child.shadowRoot) {
        const result = findInShadow(child.shadowRoot, selector);
        if (result) return result;
      }
    }
    return null;
  }

  function clickShadowElement(labelName) {
    const targetHost = findInShadow(document, `kat-button[label="${labelName}"]`);
    if (targetHost && targetHost.shadowRoot) {
      const realButton = targetHost.shadowRoot.querySelector('button.button');
      if (realButton) {
        realButton.click();
        console.log('✅ 成功触发点击:', labelName);
      } else {
        console.error('❌ 找到了宿主，但内部 button 没找到');
      }
    } else {
      console.error('❌ 未找到匹配 label 的 kat-button 元素');
    }
  }

  function runForPage(labelName, docs) {
    // 先点 All Documents
    let clicked = false;
    for (const doc of docs) {
      if (clickAllDocuments(doc)) { clicked = true; break; }
    }
    if (!clicked) return;

    // 等待新页面加载后执行 clickShadowElement
    setTimeout(() => clickShadowElement(labelName), 1500);
  }

  // ── 入口：检测页面类型 ────────────────────────────────────
  const docs = getAllDocs(window);

  let pageType = null;
  for (const doc of docs) {
    const title = getPageTitle(doc);
    if (title === "Business Verification") { pageType = "business"; break; }
    if (title === "Identity Verification" || title === "Identify Verification") { pageType = "identity"; break; }
  }

  if (pageType === "business") {
    console.log("📄 检测到 Business Verification");
    runForPage("PERSONA_BUSINESS_LICENSE", docs);
  } else if (pageType === "identity") {
    console.log("📄 检测到 Identity Verification");
    runForPage("PERSONA_ID_DOCUMENT", docs);
  } else {
    console.log("⚠️ 未检测到匹配页面");
  }
})();

