javascript:(function(){const STORAGE_KEY='blurb_templates';const defaultTemplates={'%E6%A8%A1%E6%9D%BF1':'%E6%82%A8%E5%A5%BD%EF%BC%81\n\n%E6%88%91%E4%BB%AC%E5%B7%B2%E5%AE%A1%E6%A0%B8%E6%82%A8%E6%8F%90%E4%BE%9B%E7%9A%84%E6%96%87%E4%BB%B6%EF%BC%8C%E4%BD%86%E6%97%A0%E6%B3%95%E6%A0%B9%E6%8D%AE%E8%BF%99%E4%BA%9B%E6%96%87%E4%BB%B6%E9%AA%8C%E8%AF%81%E6%82%A8%E7%9A%84%E8%BA%AB%E4%BB%BD%E3%80%82\n%E5%9B%A0%E6%AD%A4%EF%BC%8C%E6%82%A8%E7%9A%84%E8%B4%A6%E6%88%B7%E5%B0%86%E7%BB%A7%E7%BB%AD%E5%A4%84%E4%BA%8E%E6%9C%AA%E6%BF%80%E6%B4%BB%E7%8A%B6%E6%80%81%E3%80%82\n\n%E4%B8%BA%E4%BB%80%E4%B9%88%E4%BC%9A%E5%8F%91%E7%94%9F%E8%BF%99%E7%A7%8D%E6%83%85%E5%86%B5%EF%BC%9F\n%E6%88%91%E4%BB%AC%E6%97%A0%E6%B3%95%E9%AA%8C%E8%AF%81%E6%82%A8%E6%8F%90%E4%BE%9B%E7%9A%84%E5%85%AC%E5%8F%B8%E8%AF%81%E4%BB%B6%EF%BC%8C%E5%9B%A0%E4%B8%BA\n\n-- %E6%82%A8%E6%B3%A8%E5%86%8C%E8%B4%A6%E6%88%B7%E6%97%B6%E5%9C%A8%E5%8D%96%E5%AE%B6%E5%B9%B3%E5%8F%B0%E4%B8%AD%E8%BE%93%E5%85%A5%E7%9A%84%E7%BC%96%E7%A0%81%E4%B8%8E%E7%BB%9F%E4%B8%80%E7%A4%BE%E4%BC%9A%E4%BF%A1%E7%94%A8%E4%BB%A3%E7%A0%81%E4%B8%8D%E4%B8%80%E8%87%B4%E3%80%82%E8%AF%B7%E5%9C%A8%E5%8D%96%E5%AE%B6%E5%B9%B3%E5%8F%B0%E4%B8%AD%E6%9B%B4%E6%96%B0%E7%9B%B8%E5%BA%94%E7%BC%96%E7%A0%81%EF%BC%8C%E4%BD%BF%E5%85%B6%E4%B8%8E%E8%90%A5%E4%B8%9A%E6%89%A7%E7%85%A7%E4%B8%AD%E7%9A%84%E7%BB%9F%E4%B8%80%E7%A4%BE%E4%BC%9A%E4%BF%A1%E7%94%A8%E4%BB%A3%E7%A0%81%E6%88%96%E6%B3%A8%E5%86%8C%E5%8F%B7%E4%B8%80%E8%87%B4%E3%80%82\n\n%E8%A6%81%E8%AF%A6%E7%BB%86%E4%BA%86%E8%A7%A3%E6%88%91%E4%BB%AC%E7%9A%84%E8%A6%81%E6%B1%82%EF%BC%8C%E8%AF%B7%E5%8F%82%E9%98%85\"%E5%85%A8%E7%90%83%E5%8D%96%E5%AE%B6%E8%BA%AB%E4%BB%BD%E9%AA%8C%E8%AF%81\"\n https://sellercentral.amazon.com/gp/help/external/QRP483PDN88Q3M9 \n\n%E5%A6%82%E4%BD%95%E5%A4%84%E7%90%86%E8%BF%99%E7%A7%8D%E6%83%85%E5%86%B5%EF%BC%9F\n%E8%AF%B7%E5%9C%A8%E6%94%B6%E5%88%B0%E6%AD%A4%E7%94%B5%E5%AD%90%E9%82%AE%E4%BB%B6%E9%80%9A%E7%9F%A5%E5%90%8E%E7%9A%84 10 %E5%A4%A9%E5%86%85%E4%B8%8A%E4%BC%A0\"%E8%BA%AB%E4%BB%BD%E9%AA%8C%E8%AF%81\"%E9%A1%B5%E9%9D%A2%E4%B8%8A%E5%88%97%E5%87%BA%E7%9A%84%E6%89%80%E6%9C%89%E8%A6%81%E6%B1%82%E6%8F%90%E4%BE%9B%E7%9A%84%E6%96%87%E4%BB%B6%E7%9A%84%E6%89%AB%E6%8F%8F%E4%BB%B6%E6%88%96%E7%85%A7%E7%89%87%E3%80%82\n%E8%AF%B7%E7%A1%AE%E4%BF%9D%E6%82%A8%E5%9C%A8%E5%8D%96%E5%AE%B6%E5%B9%B3%E5%8F%B0%E4%B8%AD%E8%BE%93%E5%85%A5%E7%9A%84%E4%BF%A1%E6%81%AF%E4%B8%8E%E6%96%87%E4%BB%B6%E4%B8%AD%E7%9A%84%E4%BF%A1%E6%81%AF%E4%B8%80%E8%87%B4%E3%80%82\n%E8%A6%81%E6%8F%90%E4%BA%A4%E8%A6%81%E6%B1%82%E7%9A%84%E6%96%87%E4%BB%B6%E6%88%96%E6%9B%B4%E6%96%B0%E6%82%A8%E7%9A%84%E4%BF%A1%E6%81%AF%EF%BC%8C%E8%AF%B7%E7%99%BB%E5%BD%95%E5%8D%96%E5%AE%B6%E5%B9%B3%E5%8F%B0%EF%BC%8C%E5%AF%BC%E8%88%AA%E8%87%B3\"%E8%BA%AB%E4%BB%BD%E9%AA%8C%E8%AF%81\"%E9%A1%B5%E9%9D%A2%EF%BC%8C%E7%84%B6%E5%90%8E%E6%8C%89%E7%85%A7%E5%B1%8F%E5%B9%95%E4%B8%8A%E7%9A%84%E8%AF%B4%E6%98%8E%E6%93%8D%E4%BD%9C%EF%BC%9A\n https://sellercentral.amazon.com \n%E8%AF%B7%E5%8B%BF%E5%9B%9E%E5%A4%8D%E6%AD%A4%E7%94%B5%E5%AD%90%E9%82%AE%E4%BB%B6%EF%BC%8C%E5%B9%B6%E5%9C%A8%E9%99%84%E4%BB%B6%E4%B8%AD%E6%8F%90%E4%BE%9B%E8%A6%81%E6%B1%82%E7%9A%84%E6%96%87%E4%BB%B6%E3%80%82%E5%87%BA%E4%BA%8E%E5%AE%89%E5%85%A8%E5%8E%9F%E5%9B%A0%EF%BC%8C%E6%88%91%E4%BB%AC%E5%8F%AA%E6%8E%A5%E5%8F%97%E4%B8%8A%E4%BC%A0%E5%88%B0%E5%8D%96%E5%AE%B6%E5%B9%B3%E5%8F%B0%E4%B8%AD\"%E8%BA%AB%E4%BB%BD%E9%AA%8C%E8%AF%81\"%E9%83%A8%E5%88%86%E7%9A%84%E6%96%87%E4%BB%B6%E3%80%82\n\n%E5%A6%82%E6%9E%9C%E6%88%91%E6%B2%A1%E6%9C%89%E4%B8%8A%E4%BC%A0%E8%A6%81%E6%B1%82%E6%8F%90A%E4%BE%9B%E7%9A%84%E6%96%87%E4%BB%B6%EF%BC%8C%E4%BC%9A%E6%80%8E%E4%B9%88%E6%A0%B7%EF%BC%9F\n%E5%A6%82%E6%9E%9C%E6%82%A8%E6%9C%AA%E5%9C%A8%E6%94%B6%E5%88%B0%E6%AD%A4%E7%94%B5%E5%AD%90%E9%82%AE%E4%BB%B6%E9%80%9A%E7%9F%A5%E5%90%8E%E7%9A%84 10 %E5%A4%A9%E5%86%85%E6%8F%90%E4%BE%9B%E8%A6%81%E6%B1%82%E7%9A%84%E4%BF%A1%E6%81%AF%EF%BC%8C%E6%88%91%E4%BB%AC%E5%8F%AF%E8%83%BD%E4%BC%9A%E6%9A%82%E5%81%9C%E5%90%91%E6%82%A8%E7%9A%84%E4%BA%9A%E9%A9%AC%E9%80%8A%E9%94%80%E5%94%AE%E8%B4%A6%E6%88%B7%E4%BB%98%E6%AC%BE%EF%BC%8C%E4%B9%9F%E5%8F%AF%E8%83%BD%E4%BC%9A%E5%81%9C%E7%94%A8%E6%82%A8%E7%9A%84%E8%B4%A6%E6%88%B7%E3%80%82\n\n%E6%88%91%E4%BB%AC%E9%9A%8F%E6%97%B6%E4%B8%BA%E6%82%A8%E6%8F%90%E4%BE%9B%E5%B8%AE%E5%8A%A9\n%E5%A6%82%E6%9E%9C%E6%82%A8%E5%AF%B9%E6%88%91%E4%BB%AC%E7%9A%84%E6%94%BF%E7%AD%96%E6%88%96%E8%A6%81%E6%B1%82%E6%9C%89%E4%BB%BB%E4%BD%95%E5%85%B6%E4%BB%96%E7%96%91%E9%97%AE%EF%BC%8C%E8%AF%B7%E8%81%94%E7%B3%BB%E9%94%80%E5%94%AE%E4%BC%99%E4%BC%B4%E6%94%AF%E6%8C%81%EF%BC%9A\nhttps://sellercentral.amazon.com/cu/contact-us \n\n%E5%8D%96%E5%AE%B6%E8%BA%AB%E4%BB%BD%E9%AA%8C%E8%AF%81%E5%9B%A2%E9%98%9F'};function getTemplates(){const stored=localStorage.getItem(STORAGE_KEY);return stored?JSON.parse(stored):defaultTemplates}function saveTemplates(templates){localStorage.setItem(STORAGE_KEY,JSON.stringify(templates))}function createModal(){const modal=document.createElement('div');modal.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center';const content=document.createElement('div');content.style.cssText='background:white;padding:20px;border-radius:8px;max-width:400px;width:90%';const templates=getTemplates();content.innerHTML='<h3 style="margin-top:0">%E6%A8%A1%E6%9D%BF%E5%88%97%E8%A1%A8</h3><div id="templateList"></div><div style="margin-top:15px"><button id="addTemplate" style="margin-right:10px;padding:8px 16px">+</button><button id="closeModal" style="padding:8px 16px">x</button></div>';const templateList=content.querySelector('#templateList');function%20renderList(){templateList.innerHTML='';Object.keys(templates).forEach(name=>{const%20item=document.createElement('div');item.style.cssText='padding:8px;margin:5px%200;border:1px%20solid%20#ddd;border-radius:4px;display:flex;justify-content:space-between;align-items:center';item.innerHTML=`<span%20class="templateName"%20data-name="${name}"%20style="cursor:pointer;color:#0066cc;flex:1">${name}</span><button%20class="editBtn"%20data-name="${name}"%20style="margin-right:5px;padding:4px%208px">#</button><button%20class="deleteBtn"%20data-name="${name}"%20style="padding:4px%208px;color:red">-</button>`;templateList.appendChild(item)})}renderList();content.addEventListener('click',e=>{if(e.target.classList.contains('templateName')){const%20name=e.target.dataset.name;if(templates[name]){applyTemplate(templates[name]);document.body.removeChild(modal)}else{alert('%E6%A8%A1%E6%9D%BF%E4%B8%BA%E7%A9%BA%EF%BC%8C%E8%AF%B7%E5%85%88%E7%BC%96%E8%BE%91%E6%A8%A1%E6%9D%BF%E5%86%85%E5%AE%B9')}}else%20if(e.target.classList.contains('editBtn')){editTemplate(e.target.dataset.name)}else%20if(e.target.classList.contains('deleteBtn')){const%20name=e.target.dataset.name;if(confirm(`%E7%A1%AE%E5%AE%9A%E5%88%A0%E9%99%A4%E6%A8%A1%E6%9D%BF%20"${name}"%20%E5%90%97%EF%BC%9F`)){delete%20templates[name];saveTemplates(templates);renderList()}}});content.querySelector('#addTemplate').onclick=()=>{const%20name=prompt('%E8%AF%B7%E8%BE%93%E5%85%A5%E6%96%B0%E6%A8%A1%E6%9D%BF%E5%90%8D%E7%A7%B0%EF%BC%9B');if(name&&name.trim()){const%20trimmedName=name.trim();if(templates[trimmedName]){alert('%E6%A8%A1%E6%9D%BF%E5%90%8D%E7%A7%B0%E5%B7%B2%E5%AD%98%E5%9C%A8');return}templates[trimmedName]='';saveTemplates(templates);renderList()}};content.querySelector('#closeModal').onclick=()=>document.body.removeChild(modal);function%20editTemplate(oldName){const%20editModal=document.createElement('div');editModal.style.cssText=modal.style.cssText;const%20editContent=document.createElement('div');editContent.style.cssText='background:white;padding:20px;border-radius:8px;max-width:500px;width:90%';editContent.innerHTML=`<h3>%E7%BC%96%E8%BE%91%E6%A8%A1%E6%9D%BF</h3><div%20style="margin-bottom:10px"><label>%E6%A8%A1%E6%9D%BF%E5%90%8D%E7%A7%B0%EF%BC%9B</label><br><input%20type="text"%20id="templateName"%20value="${oldName}"%20style="width:100%;padding:5px;margin-top:5px"></div><div%20style="margin-bottom:10px"><label>%E6%A8%A1%E6%9D%BF%E5%86%85%E5%AE%B9%EF%BC%9B</label><br><textarea%20id="templateContent"%20style="width:100%;height:200px;padding:5px;margin-top:5px">${decodeURIComponent(templates[oldName]||'')}</textarea></div><div><button%20id="saveTemplate"%20style="margin-right:10px;padding:8px%2016px">%E4%BF%9D%E5%AD%98</button><button%20id="cancelEdit"%20style="padding:8px%2016px">%E5%8F%96%E6%B6%88</button></div>`;editContent.querySelector('#saveTemplate').onclick=()=>{const%20newName=editContent.querySelector('#templateName').value.trim();const%20newContent=editContent.querySelector('#templateContent').value;if(!newName){alert('%E8%AF%B7%E8%BE%93%E5%85%A5%E6%A8%A1%E6%9D%BF%E5%90%8D%E7%A7%B0');return}if(oldName!==newName){delete%20templates[oldName]}templates[newName]=encodeURIComponent(newContent);saveTemplates(templates);document.body.removeChild(editModal);renderList()};editContent.querySelector('#cancelEdit').onclick=()=>document.body.removeChild(editModal);editModal.appendChild(editContent);document.body.appendChild(editModal)}modal.appendChild(content);document.body.appendChild(modal)}function%20applyTemplate(templateContent){var%20inputElement6=document.getElementById('katal-id-6');if(inputElement6){inputElement6.value='%E5%8D%96%E5%AE%B6%E8%BA%AB%E4%BB%BD%E9%AA%8C%E8%AF%81';inputElement6.dispatchEvent(new%20Event('input',{bubbles:true}))}var%20inputElement7=document.getElementById('katal-id-7');if(inputElement7){inputElement7.value='%E5%8D%96%E5%AE%B6%E8%BA%AB%E4%BB%BD%E9%AA%8C%E8%AF%81';inputElement7.dispatchEvent(new%20Event('input',{bubbles:true}))}var%20textarea=document.querySelector('textarea');if(textarea){textarea.value=decodeURIComponent(templateContent);textarea.dispatchEvent(new%20Event('input',{bubbles:true,cancelable:true}))}var%20selectHeader=document.querySelectorAll('div.kat-select-container.small%20.select-header')[3];if(selectHeader){selectHeader.click();setTimeout(function(){var%20options=document.querySelectorAll('.select-options%20div');options.forEach(function(option){if(option.innerText.trim()==="Other%20or%20Non-TAM%20Actionable%20Cases"){option.click()}})},1)}setTimeout(function(){var%20selectHeader1=document.querySelectorAll('div.kat-select-container.small%20.select-header')[4];if(selectHeader1){selectHeader1.click();setTimeout(function(){var%20options1=document.querySelectorAll('.select-options%20div');options1.forEach(function(option){if(option.innerText.trim()==="Other%20-%20No%20Applicable%20Reason%20Code"){option.click()}})},1)}},1);var%20button=document.getElementById("katal-id-17");if(button){button.click()}}createModal()})();javascript:(function(){

    function getDelayUntil(hour, minute) {
        const now = new Date();
        const target = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hour,
            minute,
            0,
            0
        );

        return target - now;
    }

    function clickLogic() {
        console.log("开始执行打卡逻辑...");

        // ===== 第一种页面 =====
        const btn1 = document.querySelector('.related-item__btn[title="My Timestamp"]');

        if (btn1) {
            console.log("使用第一套逻辑（iframe 页面）");
            btn1.click();

            setTimeout(() => {
                const iframe = document.getElementById('widgetFrame3818');

                if (!iframe) {
                    console.log("iframe 未找到");
                    return;
                }

                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const btn2 = doc.querySelector('button[title="Record Timestamp"]');

                if (btn2) {
                    btn2.click();
                    console.log("iframe 内按钮已点击");
                } else {
                    console.log("iframe 内按钮未找到");
                }

            }, 8000);

        } else {
            // ===== 第二种页面 =====
            console.log("使用第二套逻辑（直接点击）");

            const btn = document.getElementById("ess.recordTimestampButton.Label");

            if (btn) {
                btn.click();
                console.log("直接按钮点击成功");
            } else {
                console.log("第二套按钮也没找到");
            }
        }
    }

    function scheduleOnce(hour, minute) {
        const delay = getDelayUntil(hour, minute);

        if (delay > 0) {
            setTimeout(clickLogic, delay);
            console.log(`已设置今天 ${hour}:${minute} 执行`);
        } else {
            console.log(`${hour}:${minute} 已经过了，不执行`);
        }
    }

    // ===== 只执行今天 =====
    scheduleOnce(7, 55);
    scheduleOnce(17, 0);

    alert("今天打卡定时已设置（仅执行一次）");

})();
