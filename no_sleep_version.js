(async () => {

const BRN_VALUE = "12345678"; // 修改这里

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitFor(fn, timeout=60000, interval=200){
 const start = Date.now();
 while(Date.now()-start < timeout){
  try{
   const v = fn();
   if(v) return v;
  }catch{}
  await sleep(interval);
 }
 return null;
}

function click(el){
 if(!el) return false;
 el.scrollIntoView({block:"center"});
 el.dispatchEvent(new MouseEvent("mousedown",{bubbles:true}));
 el.dispatchEvent(new MouseEvent("mouseup",{bubbles:true}));
 el.dispatchEvent(new MouseEvent("click",{bubbles:true}));
 return true;
}

function btn(text){
 const t=text.toLowerCase();
 return [...document.querySelectorAll("button")]
 .find(b=>(b.innerText||"").toLowerCase().includes(t));
}

function span(text){
 const t=text.toLowerCase();
 return [...document.querySelectorAll("span")]
 .find(s=>(s.textContent||"").toLowerCase().includes(t));
}

function category(text){
 const t=text.toLowerCase();
 return [...document.querySelectorAll("span.categoryName")]
 .find(s=>(s.textContent||"").toLowerCase().includes(t));
}

function setBRN(value){
 const el=document.querySelector('input[name="BusinessRegistrationNumber"]');
 if(!el) return false;

 const setter=Object.getOwnPropertyDescriptor(
 HTMLInputElement.prototype,"value").set;

 setter.call(el,value);

 el.dispatchEvent(new Event("input",{bubbles:true}));
 el.dispatchEvent(new Event("change",{bubbles:true}));
 el.dispatchEvent(new Event("blur",{bubbles:true}));

 return true;
}

function btnEnabled(button){
 if(!button) return false;
 const disabled =
 button.disabled ||
 button.getAttribute("aria-disabled")==="true";
 return !disabled;
}

function getTxnId(){
 const title=[...document.querySelectorAll("span")]
 .find(el=>el.textContent.trim()=="Transaction record ID:");
 return title?.nextElementSibling?.textContent.trim()||null;
}

function cleanContent(container){

 const clone=container.cloneNode(true);

 clone.querySelectorAll(
 "b.dataTitle,button.copyTitle,button.copyTransactionRecordId"
 ).forEach(n=>n.remove());

 return clone.innerText
 .replace(/\bcopy\b/gi,"")
 .replace(/\n{3,}/g,"\n\n")
 .trim();
}

function hasContent(container){

 if(container.querySelector('div[style*="padding-bottom"] > b'))
 return true;

 const rows=[...container.querySelectorAll("table tbody tr")];

 if(rows.length && rows.some(r=>r.innerText.trim()))
 return true;

 return cleanContent(container).length>0;
}

function extractKV(container){

 const kv={};

 for(const block of [...container.querySelectorAll('div[style*="padding-bottom"]')]){

  const b=block.querySelector("b");
  if(!b) continue;

  const key=b.textContent.trim();
  const raw=block.innerText.trim();

  kv[key]=raw.replace(key,"").replace(/^[:：\s]+/,"").trim();

 }

 return kv;
}

async function waitStable(container){

 let last="";
 let stable=0;

 while(stable<2){

  const txt=container.innerText.trim();

  if(txt===last) stable++;
  else stable=0;

  last=txt;

  await sleep(300);

 }

}

console.log("STEP 1 → Verification page");

if(!location.pathname.includes("verification")){
 location.href="/verification";
 return;
}

console.log("STEP 2 → Get Started");

click(await waitFor(()=>document.querySelector('[data-testid="get-started-button"]')));

console.log("STEP 3 → Wait BRN input");

const input=await waitFor(()=>document.querySelector('input[name="BusinessRegistrationNumber"]'));

if(!input){
 console.log("❌ BRN input not found");
 return;
}

console.log("STEP 4 → Fill BRN");

async function waitStableElement(getter, stableMs = 400, timeout = 30000) {
  const start = Date.now();
  let el = null;
  let sameSince = 0;

  while (Date.now() - start < timeout) {
    const cur = getter();
    if (!cur) {
      el = null;
      sameSince = 0;
      await sleep(100);
      continue;
    }

    if (cur === el) {
      sameSince += 100;
      if (sameSince >= stableMs) return cur; // ✅ 节点稳定
    } else {
      el = cur;
      sameSince = 0;
    }

    await sleep(100);
  }
  return null;
}

async function fillBRN_byId_and_confirm(value) {
  // 1) 等 input 节点稳定（关键）
  const el = await waitStableElement(
    () => document.getElementById("BusinessRegistrationNumber"),
    500,
    30000
  );
  if (!el) return false;

  // 2) 用你验证过的写入方式
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  el.focus();
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new Event("blur", { bubbles: true }));

  // 3) 确认值“稳定存在”（防被 React 回写清空）
  const ok = await waitFor(async () => {
    const cur = document.getElementById("BusinessRegistrationNumber");
    if (!cur) return false;
    if (cur.value !== value) return false;
    await sleep(150);
    const cur2 = document.getElementById("BusinessRegistrationNumber");
    return cur2 && cur2.value === value;
  }, 8000);

  return !!ok;
}

console.log("STEP 5 → Wait Review enable");
const reviewBtn = await waitFor(() => {
  const b = btn("review");
  if (!b) return null;
  const disabled = b.disabled || b.getAttribute("aria-disabled") === "true";
  return disabled ? null : b;
}, 60000);

if (!reviewBtn) {
  console.log("❌ Review 按钮未启用：通常代表 BRN 未通过校验/未生效");
  return;
}
click(reviewBtn);

console.log("STEP 6 → Generate Report");

const generateBtn=await waitFor(()=>btnEnabled(btn("generate report"))?btn("generate report"):null);

click(generateBtn);

console.log("STEP 7 → Waiting report");

const addBtn=await waitFor(()=>btnEnabled(btn("additional data"))?btn("additional data"):null,120000);

click(addBtn);

console.log("STEP 8 → BusinessDetails");

click(await waitFor(()=>span("businessdetails")||category("businessdetails")));

const container=await waitFor(()=>document.querySelector('[data-testid="additional-data-appended-div"]'));

if(!container){
 console.log("❌ data container not found");
 return;
}

const targets=[
 {item:"Key Info",match:"key information"},
 {item:"Abnormal",match:"abnormal"},
 {item:"Change Records",match:"change records"}
];

const results=[];

for(const t of targets){

 const left=category(t.match)||span(t.match);

 if(!left){
  results.push({item:t.item,hasContent:null,Content:""});
  continue;
 }

 click(left);

 await waitStable(container);

 const has=hasContent(container);

 const row={
  item:t.item,
  hasContent:has,
  Content:has?cleanContent(container):""
 };

 if(t.item==="Key Info" && has)
 row.KeyValues=extractKV(container);

 results.push(row);

}

console.table(results);

console.log("STEP 9 → Transaction ID");

click(await waitFor(()=>btn("view all")));

const txnId=await waitFor(()=>getTxnId());

console.log("Transaction record ID:",txnId);

})();
