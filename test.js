[...document.querySelectorAll('button')]
  .find(b => b.textContent.trim() === 'Go')
  ?.click();

javascript:(()=>{const i=prompt("延迟几分钟后点击 Transfer Case？","5");if(i===null)return;const m=Number(i),ms=m*60*1000;if(!Number.isFinite(ms)||ms<0)return alert("请输入有效的分钟数");const n=s=>(s||"").trim().toLowerCase(),f=()=>{const k=[...document.querySelectorAll("kat-button")].find(e=>n(e.getAttribute("label")||e.textContent)==="Transfer Case");if(k)return k.querySelector("button")||k;return [...document.querySelectorAll("button")].find(e=>n(e.textContent)==="Transfer Case")||null};if(!f())return alert("当前页面未找到 Transfer Case 按钮");setTimeout(()=>{const b=f();if(b)b.click();},ms);})();
