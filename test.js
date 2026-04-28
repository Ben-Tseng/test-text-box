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


// 查找页面上所有 label，点击文本包含 "Verified" 的那一个
Array.from(document.querySelectorAll('label')).find(el => el.textContent.trim() === 'Verified').click();

document.getElementById('calypso_na_idv_final_question_outcome_calypso_answer_pass').click();

const verifiedLabel=Array.from(targetDoc.querySelectorAll('label')).find(el=>el.textContent.trim()==='Verified');
if(verifiedLabel)verifiedLabel.click();

const annotationTA=i(docs);
  if(annotationTA)o(annotationTA,"RFD ID for DOB.");
},1600);
