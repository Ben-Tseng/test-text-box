[...document.querySelectorAll('button')]
  .find(b => b.textContent.trim() === 'Go')
  ?.click();


// transfer and accept
javascript:(()=>{const transferBtn=[...document.querySelectorAll("button")].find(b=>b.textContent.trim()==="Transfer Case");if(transferBtn){transferBtn.click();console.log("✅ 已点击 Transfer Case");setTimeout(()=>{const acceptLink=[...document.querySelectorAll("a")].find(a=>a.textContent.trim()==="Accept");if(acceptLink){acceptLink.click();console.log("✅ 已点击 Accept");}else{console.warn("❌ 未找到 Accept 元素");}},3000);}else{console.warn("❌ 未找到 Transfer Case");}})()
