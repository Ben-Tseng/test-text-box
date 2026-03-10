javascript:(function(){   function findAndClickInputs(doc){     try {       const inputs = doc.querySelectorAll('input[value="calypso_answer_positive"]');       if (inputs.length > 0) {         inputs.forEach(input => input.click());         console.log(`%E2%9C%85 Clicked ${inputs.length} calypso_answer_positive input(s)`);         return true;       }     } catch (e) {       console.log("%E2%9D%8C Error clicking inputs:", e);     }     return false;   }    function searchAllFrames(win) {      try {       if (findAndClickInputs(win.document)) {         checkIdAndBirthDate(win.document);         return true;       }       for (let i = 0; i < win.frames.length; i++) {         if (searchAllFrames(win.frames[i])) return true;       }     } catch (e) {}     return false;   }    function checkIdAndBirthDate(doc){     let idNumberElement = doc.querySelectorAll('strong')[4];     let birthDateElement = doc.querySelectorAll('strong')[3];     if (!idNumberElement || !birthDateElement) return;      let idNumber = idNumberElement.textContent.trim();     let birthDate = birthDateElement.textContent.trim();      let year = idNumber.substring(6, 10);     let month = idNumber.substring(10, 12);     let day = idNumber.substring(12, 14);     let idDate = `${day}/${month}/${year}`;      let formattedBirthDate;     if (/\d{2}\/\d{2}\/\d{4}/.test(birthDate)) {       formattedBirthDate = birthDate;     } else {       let dateParts = birthDate.split(' ');       if (dateParts.length === 3) {         let monthNames = {           "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",           "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",           "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"         };         let monthName = dateParts[0];         let day = dateParts[1].replace(',', '').padStart(2, '0');         let year = dateParts[2];         let month = monthNames[monthName];         if (month) {           formattedBirthDate = `${day}/${month}/${year}`;         }       }     }      if (formattedBirthDate === idDate) {       birthDateElement.style.backgroundColor = 'yellow';     } else {       clickCheckboxesWithDelay(doc);     }   }    function clickCheckboxesWithDelay(doc){     const checkbox1 = doc.querySelector('label[for="calypso_idv_verification_question_dob_calypso_answer_negative"]');     if (checkbox1) checkbox1.click();      setTimeout(() => {       const checkbox3 = doc.querySelector('label[for="calypso_na_idv_final_question_outcome_calypso_answer_request_more_info"]');       if (checkbox3) checkbox3.click();     }, 300);      setTimeout(() => {       const checkbox2 = doc.querySelector('label[for="calypso_na_idv_final_question_outcome_calypso_rfi_date_of_birth"]');       if (checkbox2) checkbox2.click();     }, 600);   }    const success = searchAllFrames(window);   if (!success) {     alert("%E2%9D%8C %E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E6%9C%AA%E6%89%BE%E5%88%B0 value='calypso_answer_positive' %E7%9A%84%E8%BE%93%E5%85%A5%E6%A1%86%EF%BC%81");   } })();

(() => {
  /***********************
   * 1) 通用工具函数
   ***********************/
  function getAllAccessibleDocs(win, docs = []) {
    try {
      if (win.document) docs.push(win.document);
      for (let i = 0; i < win.frames.length; i++) {
        getAllAccessibleDocs(win.frames[i], docs);
      }
    } catch (e) {
      // 跨域 iframe 忽略
    }
    return docs;
  }

  function clickAllYes(doc) {
    try {
      const inputs = doc.querySelectorAll('input[value="calypso_answer_positive"]');
      inputs.forEach(input => input.click());
      return inputs.length;
    } catch (e) {
      return 0;
    }
  }

  function getPageTitle(doc) {
    const el = doc.querySelector('h2.navbar-brand');
    return el ? el.textContent.trim() : '';
  }

  function setTextareaValue(textarea, value) {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    if (setter) {
      setter.call(textarea, value);
    } else {
      textarea.value = value;
    }

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /***********************
   * 2) 按 label 取值
   * 适配你截图里的结构：
   * <div class="col-md-5 no-side-padding">DOB</div>
   * <div class="col-md-5 normal-input"><strong>Oct 08, 1997</strong></div>
   ***********************/
  function findValueByLabel(doc, labelText) {
    const label = [...doc.querySelectorAll('.no-side-padding, div, span, label')]
      .find(el => (el.textContent || '').trim() === labelText);

    if (!label) return null;

    const row = label.closest('.row') || label.parentElement;
    if (!row) return null;

    const valueEl =
      row.querySelector('.normal-input strong') ||
      row.querySelector('.normal-input') ||
      row.querySelector('strong');

    return valueEl ? valueEl.textContent.trim() : null;
  }

  function findAnnotationTextarea(docs) {
    for (const doc of docs) {
      const ta =
        doc.querySelector('#annotationText') ||
        doc.querySelector('textarea[name="annotationText"]') ||
        doc.querySelector('textarea[placeholder="Enter annotations"]');
      if (ta) return ta;
    }
    return null;
  }

  /***********************
   * 3) Business Verification
   * 自动把 Business Name 填进 annotation
   ***********************/
  function handleBusinessVerification(docs) {
    const businessDoc = docs.find(doc => getPageTitle(doc) === 'Business Verification');
    if (!businessDoc) return false;

    const businessName = findValueByLabel(businessDoc, 'Business Name');
    if (!businessName) {
      console.log('⚠️ Business Verification 页面已找到，但没取到 Business Name');
      return false;
    }

    const textarea = findAnnotationTextarea(docs);
    if (!textarea) {
      console.log('⚠️ Business Verification 页面已找到，但没找到 annotationText');
      return false;
    }

    setTextareaValue(textarea, businessName);
    console.log('✅ Business annotation 已填入:', businessName);
    return true;
  }

  /***********************
   * 4) Identity Verification
   * 只有 18 位身份证才核对 DOB
   ***********************/
  function isValidCNId18(id) {
    return /^[0-9]{17}[0-9Xx]$/.test(id);
  }

  function extractDobFromId18(idNumber) {
    const year = idNumber.substring(6, 10);
    const month = idNumber.substring(10, 12);
    const day = idNumber.substring(12, 14);
    return `${day}/${month}/${year}`;
  }

  function normalizeDobText(dobText) {
    if (!dobText) return null;

    const text = dobText.trim();

    // 已经是 dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
      return text;
    }

    // 兼容 "Oct 08, 1997"
    const m = text.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/);
    if (m) {
      const monthMap = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04',
        May: '05', Jun: '06', Jul: '07', Aug: '08',
        Sep: '09', Oct: '10', Nov: '11', Dec: '12'
      };
      const month = monthMap[m[1]];
      const day = String(m[2]).padStart(2, '0');
      const year = m[3];
      return month ? `${day}/${month}/${year}` : null;
    }

    return null;
  }

  function clickIdentityMismatchActions(doc) {
    const checkbox1 = doc.querySelector(
      'label[for="calypso_idv_verification_question_dob_calypso_answer_negative"]'
    );
    if (checkbox1) checkbox1.click();

    setTimeout(() => {
      const checkbox2 = doc.querySelector(
        'label[for="calypso_na_idv_final_question_outcome_calypso_answer_request_more_info"]'
      );
      if (checkbox2) checkbox2.click();
    }, 300);

    setTimeout(() => {
      const checkbox3 = doc.querySelector(
        'label[for="calypso_na_idv_final_question_outcome_calypso_rfi_date_of_birth"]'
      );
      if (checkbox3) checkbox3.click();
    }, 600);
  }

  function handleIdentityVerification(docs) {
    const idvDoc = docs.find(doc => {
      const title = getPageTitle(doc);
      return title === 'Identity Verification' || title === 'Identify Verification';
    });

    if (!idvDoc) return false;

    const idNumber = findValueByLabel(idvDoc, 'ID Number');
    const dobText = findValueByLabel(idvDoc, 'DOB');

    if (!idNumber || !dobText) {
      console.log('⚠️ Identity Verification 页面已找到，但没取到 ID Number 或 DOB');
      return false;
    }

    // 不是18位身份证：跳过
    if (!isValidCNId18(idNumber)) {
      console.log('ℹ️ ID Number 不是18位身份证，跳过 DOB 核对:', idNumber);
      return true;
    }

    const dobFromId = extractDobFromId18(idNumber);
    const normalizedDob = normalizeDobText(dobText);

    if (!normalizedDob) {
      console.log('⚠️ DOB 格式无法识别，跳过:', dobText);
      return false;
    }

    if (dobFromId === normalizedDob) {
      const dobLabel = [...idvDoc.querySelectorAll('.no-side-padding, div, span, label')]
        .find(el => (el.textContent || '').trim() === 'DOB');
      const row = dobLabel?.closest('.row') || dobLabel?.parentElement;
      const strong = row?.querySelector('.normal-input strong');
      if (strong) strong.style.backgroundColor = 'yellow';

      console.log('✅ DOB 核对一致:', normalizedDob);
    } else {
      console.log('❌ DOB 核对不一致，开始自动操作', {
        idNumber,
        dobFromId,
        pageDob: normalizedDob
      });
      clickIdentityMismatchActions(idvDoc);
    }

    return true;
  }

  /***********************
   * 5) 主流程
   ***********************/
  const docs = getAllAccessibleDocs(window);

  let totalYes = 0;
  docs.forEach(doc => {
    totalYes += clickAllYes(doc);
  });
  console.log(`✅ 已自动点击 Yes: ${totalYes} 个`);

  handleBusinessVerification(docs);
  handleIdentityVerification(docs);
})();



javascript:(()=>{function e(t,n=[]){try{t.document&&n.push(t.document);for(let o=0;o<t.frames.length;o++)e(t.frames[o],n)}catch(o){}return n}function t(e){try{const t=e.querySelectorAll('input[value="calypso_answer_positive"]');return t.forEach(e=>e.click()),t.length}catch(n){return 0}}function n(e){const t=e.querySelector("h2.navbar-brand");return t?t.textContent.trim():""}function o(e,t){const n=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value")?.set;n?n.call(e,t):e.value=t,e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function r(e,t){const n=[...e.querySelectorAll(".no-side-padding, div, span, label")].find(e=>(e.textContent||"").trim()===t);if(!n)return null;const o=n.closest(".row")||n.parentElement;if(!o)return null;const r=o.querySelector(".normal-input strong")||o.querySelector(".normal-input")||o.querySelector("strong");return r?r.textContent.trim():null}function i(e){for(const t of e){const e=t.querySelector("#annotationText")||t.querySelector('textarea[name="annotationText"]')||t.querySelector('textarea[placeholder="Enter annotations"]');if(e)return e}return null}function c(e){const t=e.find(e=>"Business Verification"===n(e));if(!t)return!1;const c=r(t,"Business Name");if(!c)return!1;const a=i(e);return a?(o(a,c),!0):!1}function a(e){return/^[0-9]{17}[0-9Xx]$/.test(e)}function u(e){const t=e.substring(6,10),n=e.substring(10,12),o=e.substring(12,14);return`${o}/${n}/${t}`}function l(e){if(!e)return null;const t=e.trim();if(/^\d{2}\/\d{2}\/\d{4}$/.test(t))return t;const n=t.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/);if(n){const e={Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12"}[n[1]],t=String(n[2]).padStart(2,"0"),o=n[3];return e?`${t}/${e}/${o}`:null}return null}function d(e){const t=e.querySelector('label[for="calypso_idv_verification_question_dob_calypso_answer_negative"]');t&&t.click(),setTimeout(()=>{const t=e.querySelector('label[for="calypso_na_idv_final_question_outcome_calypso_answer_request_more_info"]');t&&t.click()},300),setTimeout(()=>{const t=e.querySelector('label[for="calypso_na_idv_final_question_outcome_calypso_rfi_date_of_birth"]');t&&t.click()},600)}function s(e){const t=e.find(e=>{const t=n(e);return"Identity Verification"===t||"Identify Verification"===t});if(!t)return!1;const o=r(t,"ID Number"),i=r(t,"DOB");if(!o||!i)return!1;if(!a(o))return!0;const c=u(o),s=l(i);if(!s)return!1;if(c===s){const e=[...t.querySelectorAll(".no-side-padding, div, span, label")].find(e=>(e.textContent||"").trim()==="DOB"),n=e?.closest(".row")||e?.parentElement,o=n?.querySelector(".normal-input strong");return o&&(o.style.backgroundColor="yellow"),!0}return d(t),!0}const f=e(window);f.forEach(e=>{t(e)}),c(f),s(f)})();
