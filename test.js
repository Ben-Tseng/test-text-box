[...document.querySelectorAll('button')]
  .find(b => b.textContent.trim() === 'Go')
  ?.click();


// transfer and accept
javascript:(()=>{const transferBtn=[...document.querySelectorAll("button")].find(b=>b.textContent.trim()==="Transfer Case");if(transferBtn){transferBtn.click();console.log("✅ 已点击 Transfer Case");setTimeout(()=>{const acceptLink=[...document.querySelectorAll("a")].find(a=>a.textContent.trim()==="Accept");if(acceptLink){acceptLink.click();console.log("✅ 已点击 Accept");}else{console.warn("❌ 未找到 Accept 元素");}},3000);}else{console.warn("❌ 未找到 Transfer Case");}})()


// wait transfer
javascript:(()=>{const mins=prompt("请输入等待分钟数：");if(!mins||isNaN(mins)){alert("请输入有效数字");return;}const delay=parseFloat(mins)*60*1000;console.log("⏳ 将在 "+mins+" 分钟后执行...");setTimeout(()=>{const transferBtn=[...document.querySelectorAll("button")].find(b=>b.textContent.trim()==="Transfer Case");if(transferBtn){transferBtn.click();console.log("✅ 已点击 Transfer Case");setTimeout(()=>{const acceptLink=[...document.querySelectorAll("a")].find(a=>a.textContent.trim()==="Accept");if(acceptLink){acceptLink.click();console.log("✅ 已点击 Accept");}else{console.warn("❌ 未找到 Accept 元素");}},3000);}else{console.warn("❌ 未找到 Transfer Case");}},delay);})()


//wait send
javascript:(()=>{const mins=prompt("请输入等待分钟数：");if(!mins||isNaN(mins)){alert("请输入有效数字");return;}const delay=parseFloat(mins)*60*1000;console.log("⏳ 将在 "+mins+" 分钟后执行...");setTimeout(()=>{const sendBtn=[...document.querySelectorAll("button")].find(b=>b.textContent.trim()==="Send");if(sendBtn){sendBtn.click();console.log("✅ 已点击 Send");setTimeout(()=>{const acceptLink=[...document.querySelectorAll("a")].find(a=>a.textContent.trim()==="Accept");if(acceptLink){acceptLink.click();console.log("✅ 已点击 Accept");}else{console.warn("❌ 未找到 Accept 元素");}},3000);}else{console.warn("❌ 未找到 Send");}},delay);})()
