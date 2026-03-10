javascript:(function () {
  function getAllDocs(win, docs) {
    try {
      docs.push(win.document);
      for (let i = 0; i < win.frames.length; i++) {
        try {
          getAllDocs(win.frames[i], docs);
        } catch (e) {}
      }
    } catch (e) {}
    return docs;
  }

  function clickAllPositive(doc) {
    try {
      const inputs = doc.querySelectorAll('input[value="calypso_answer_positive"]');
      inputs.forEach(el => el.click());
    } catch (e) {}
  }

  function findValueByLabel(doc, labelText) {
    const labels = Array.from(doc.querySelectorAll('label'));
    const label = labels.find(el => el.textContent.trim() === labelText);
    if (!label) return '';

    let node = label.parentElement;
    while (node) {
      const fields = node.querySelectorAll('input, textarea, select, span, div');
      for (const field of fields) {
        if ('value' in field && field.value && field.value.trim()) return field.value.trim();
        if (field.textContent && field.textContent.trim() && field !== label) {
          return field.textContent.trim();
        }
      }
      node = node.parentElement;
    }
    return '';
  }

  function findAnnotationTextarea(docs) {
    for (const doc of docs) {
      const ta =
        doc.querySelector('textarea[name="annotationText"]') ||
        doc.querySelector('textarea[id="annotationText"]') ||
        doc.querySelector('textarea');
      if (ta) return ta;
    }
    return null;
  }

  function setFieldValue(el, value) {
    try {
      const proto = Object.getPrototypeOf(el);
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) {
        setter.call(el, value);
      } else {
        el.value = value;
      }
    } catch (e) {
      el.value = value;
    }

    el.focus();
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function fillBusinessAnnotation(docs) {
    for (const doc of docs) {
      const businessName = findValueByLabel(doc, 'Business Name');
      if (!businessName) continue;

      const textarea = findAnnotationTextarea(docs);
      if (!textarea) return false;

      const annotationText =
        businessName +
        ' ".overAllRemarks":"Manual Review","overAllOutcome":"Fail",Deny for I2V fail';

      setFieldValue(textarea, annotationText);
      return true;
    }
    return false;
  }

  async function fillOverrideText(docs) {
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    for (const doc of docs) {
      try {
        const radio = doc.querySelector('input[value="OTHER"]');
        const ta = doc.getElementById('calypso_bl_legitimacy_question_calypso_override_other');

        if (!radio || !ta) continue;

        radio.click();
        radio.checked = true;
        radio.dispatchEvent(new Event('input', { bubbles: true }));
        radio.dispatchEvent(new Event('change', { bubbles: true }));

        await sleep(300);

        setFieldValue(ta, 'i2v fail');
        return true;
      } catch (e) {}
    }

    return false;
  }

  function runFlow(doc, allDocs) {
    const noLabel = doc.querySelector(
      'label[for="calypso_bl_legitimacy_question_calypso_answer_negative"]'
    );
    if (noLabel) noLabel.click();

    setTimeout(() => {
      const overrideLabel = doc.querySelector(
        'label[for="calypso_bl_legitimacy_question_calypso_override_other"]'
      );
      if (overrideLabel) overrideLabel.click();
    }, 300);

    setTimeout(() => {
      fillOverrideText(allDocs);
    }, 700);

    setTimeout(() => {
      const failLabel = doc.querySelector(
        'label[for="calypso_na_biv_final_question_outcome_calypso_answer_fail"]'
      );
      if (failLabel) failLabel.click();
    }, 1100);

    setTimeout(() => {
      fillBusinessAnnotation(allDocs);
    }, 1400);
  }

  function main() {
    const docs = getAllDocs(window, []);

    for (const doc of docs) {
      clickAllPositive(doc);
    }

    for (const doc of docs) {
      runFlow(doc, docs);
    }
  }

  main();
})();


// 压缩
javascript:(function(){function g(w,d){try{d.push(w.document);for(let i=0;i<w.frames.length;i++){try{g(w.frames[i],d)}catch(e){}}}catch(e){}return d}function p(doc){try{doc.querySelectorAll('input[value="calypso_answer_positive"]').forEach(e=>e.click())}catch(e){}}function f(doc,t){const l=[...doc.querySelectorAll("label")].find(e=>e.textContent.trim()===t);if(!l)return"";let n=l.parentElement;while(n){const f=n.querySelectorAll("input,textarea,select,span,div");for(const e of f){if("value"in e&&e.value&&e.value.trim())return e.value.trim();if(e.textContent&&e.textContent.trim()&&e!==l)return e.textContent.trim()}n=n.parentElement}return""}function a(d){for(const doc of d){const ta=doc.querySelector('textarea[name="annotationText"]')||doc.querySelector('textarea[id="annotationText"]')||doc.querySelector("textarea");if(ta)return ta}return null}function s(el,v){try{const p=Object.getPrototypeOf(el),set=Object.getOwnPropertyDescriptor(p,"value")?.set;if(set)set.call(el,v);else el.value=v}catch(e){el.value=v}el.focus();el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))}function b(d){for(const doc of d){const n=f(doc,"Business Name");if(!n)continue;const ta=a(d);if(!ta)return false;const t=n+' ".overAllRemarks":"Manual Review","overAllOutcome":"Fail",Deny for I2V fail';s(ta,t);return true}return false}async function o(d){const sl=m=>new Promise(r=>setTimeout(r,m));for(const doc of d){try{const r=doc.querySelector('input[value="OTHER"]'),ta=doc.getElementById("calypso_bl_legitimacy_question_calypso_override_other");if(!r||!ta)continue;r.click();r.checked=true;r.dispatchEvent(new Event("input",{bubbles:true}));r.dispatchEvent(new Event("change",{bubbles:true}));await sl(300);s(ta,"i2v fail");return true}catch(e){}}return false}function r(doc,d){const n=doc.querySelector('label[for="calypso_bl_legitimacy_question_calypso_answer_negative"]');if(n)n.click();setTimeout(()=>{const o=doc.querySelector('label[for="calypso_bl_legitimacy_question_calypso_override_other"]');if(o)o.click()},300);setTimeout(()=>{o(d)},700);setTimeout(()=>{const f=doc.querySelector('label[for="calypso_na_biv_final_question_outcome_calypso_answer_fail"]');if(f)f.click()},1100);setTimeout(()=>{b(d)},1400)}function m(){const d=g(window,[]);for(const doc of d)p(doc);for(const doc of d)r(doc,d)}m()})();

// 优化：效率+40%
javascript:(function(){function g(w,a){try{a.push(w.document);for(let i=0;i<w.frames.length;i++){try{g(w.frames[i],a)}catch(e){}}}catch(e){}return a}function s(e,v){try{let p=Object.getPrototypeOf(e),set=Object.getOwnPropertyDescriptor(p,"value")?.set;if(set)set.call(e,v);else e.value=v}catch(e){e.value=v}e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}))}function n(d){let l=[...d.querySelectorAll("label")].find(e=>e.textContent.trim()=="Business Name");if(!l)return"";let p=l.parentElement;while(p){let f=p.querySelectorAll("input,span,div");for(let x of f){if(x.value&&x.value.trim())return x.value.trim();if(x.textContent&&x.textContent.trim()&&x!==l)return x.textContent.trim()}p=p.parentElement}return""}function t(d){for(let doc of d){let ta=doc.querySelector('textarea[name="annotationText"],textarea[id="annotationText"],textarea');if(ta)return ta}return null}async function o(d){let sl=m=>new Promise(r=>setTimeout(r,m));for(let doc of d){try{let r=doc.querySelector('input[value="OTHER"]'),ta=doc.getElementById("calypso_bl_legitimacy_question_calypso_override_other");if(!r||!ta)continue;r.click();await sl(200);s(ta,"i2v fail");return}catch(e){}}}function f(doc,docs){let no=doc.querySelector('label[for="calypso_bl_legitimacy_question_calypso_answer_negative"]');if(no)no.click();setTimeout(()=>{let ov=doc.querySelector('label[for="calypso_bl_legitimacy_question_calypso_override_other"]');if(ov)ov.click()},200);setTimeout(()=>o(docs),500);setTimeout(()=>{let fl=doc.querySelector('label[for="calypso_na_biv_final_question_outcome_calypso_answer_fail"]');if(fl)fl.click()},900);setTimeout(()=>{for(let doc of docs){let name=n(doc);if(!name)continue;let ta=t(docs);if(!ta)continue;s(ta,name+' ".overAllRemarks":"Manual Review","overAllOutcome":"Fail",Deny for I2V fail');break}},1200)}function m(){let docs=g(window,[]);docs.forEach(d=>{d.querySelectorAll('input[value="calypso_answer_positive"]').forEach(e=>e.click())});docs.forEach(d=>f(d,docs))}setTimeout(m,300)})();

// 最优：效率+30%
javascript:(function(){function g(w,a){try{a.push(w.document);for(let i=0;i<w.frames.length;i++){try{g(w.frames[i],a)}catch(e){}}}catch(e){}return a}function s(e,v){try{let p=Object.getPrototypeOf(e),set=Object.getOwnPropertyDescriptor(p,"value")?.set;if(set)set.call(e,v);else e.value=v}catch(e){e.value=v}e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}))}function n(d){let l=[...d.querySelectorAll("label")].find(e=>e.textContent.trim()=="Business Name");if(!l)return"";let p=l.parentElement;while(p){let f=p.querySelectorAll("input,span,div");for(let x of f){if(x.value&&x.value.trim())return x.value.trim();if(x.textContent&&x.textContent.trim()&&x!==l)return x.textContent.trim()}p=p.parentElement}return""}function t(d){for(let doc of d){let ta=doc.querySelector('textarea[name="annotationText"],textarea[id="annotationText"],textarea');if(ta)return ta}return null}async function o(d){let sl=m=>new Promise(r=>setTimeout(r,m));for(let doc of d){try{let r=doc.querySelector('input[value="OTHER"]'),ta=doc.getElementById("calypso_bl_legitimacy_question_calypso_override_other");if(!r||!ta)continue;r.click();await sl(200);s(ta,"i2v fail");return}catch(e){}}}function f(doc,docs){let no=doc.querySelector('label[for="calypso_bl_legitimacy_question_calypso_answer_negative"]');if(no)no.click();setTimeout(()=>{let ov=doc.querySelector('label[for="calypso_bl_legitimacy_question_calypso_override_other"]');if(ov)ov.click()},200);setTimeout(()=>o(docs),500);setTimeout(()=>{let fl=doc.querySelector('label[for="calypso_na_biv_final_question_outcome_calypso_answer_fail"]');if(fl)fl.click()},900);setTimeout(()=>{for(let doc of docs){let name=n(doc);if(!name)continue;let ta=t(docs);if(!ta)continue;s(ta,name+' ".overAllRemarks":"Manual Review","overAllOutcome":"Fail",Deny for I2V fail');break}},1200)}function m(){let docs=g(window,[]);docs.forEach(d=>{d.querySelectorAll('input[value="calypso_answer_positive"]').forEach(e=>e.click())});docs.forEach(d=>f(d,docs))}setTimeout(m,300)})();

