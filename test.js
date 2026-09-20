const bizLabel = [...bizDoc.querySelectorAll(".no-side-padding, div, span, label")].find(
      (el) => (el.textContent || "").trim().includes("Business Name")
    );
    const bizRow = bizLabel?.closest(".row") || bizLabel?.parentElement;
    const e2 = bizRow?.querySelector(".normal-input strong") || bizRow?.querySelector("strong");



const element = 
    bizDoc.querySelector('h3.sop-section-header') || 
    bizDoc.querySelector('.sop-section-header-div') || 
    bizDoc.querySelector('article[id*="calypso_bl"]') || 
    e2;


// $0 就是你当前在 DevTools 里点击选中的那个 <strong> 标签
const e2 = $0; 
console.log(e2.textContent); // 输出: 深圳市金合汇洋电子商务有限公司

<div class="row">
  <div class="col-md-5 no-side-padding">Business Name (CHINESE)</div>
  <div class="col-md-5 normal-input">
    <strong>深圳市金合汇洋电子商务有限公司</strong>
  </div>
</div>

// 在所在的 doc 中直接查找 normal-input 里的 strong 标签
const e2 = doc.querySelector('div.normal-input > strong');

// 1. 找到写着 Business Name 的那个 div/label
const labelEl = [...doc.querySelectorAll('div, span, label')].find(
  el => el.textContent.includes('Business Name')
);

// 2. 找到它所在的行 (.row)，再从中取出 strong
const row = labelEl?.closest('.row');
const e2 = row?.querySelector('strong');

console.log(e2.textContent); // 即可精准拿到文本


