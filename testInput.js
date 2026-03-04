const el = document.getElementById("BusinessRegistrationNumber");
const value = "12345678";

// 用原生 value setter，避免只改到属性不进框架
const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
setter.call(el, value);

// 触发事件，让 React/表单库接收到变更
el.dispatchEvent(new Event("input", { bubbles: true }));
el.dispatchEvent(new Event("change", { bubbles: true }));

// 有些页面还会监听 blur
el.dispatchEvent(new Event("blur", { bubbles: true }));


[...document.querySelectorAll("button")]
.find(b => b.innerText.includes("Generate Report"))
.click();

[...document.querySelectorAll("span")]
.find(el => el.textContent.includes("BusinessDetails"))
.click();

document.querySelector('[data-testid="additional-data-appended-div"]').innerText
