javascript:(async()=>{

const BRN_VALUE="12345678";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function waitFor(fn,t=30000){
 const s=Date.now();
 while(Date.now()-s<t){
  try{
   const v=fn();
   if(v) return v;
  }catch(e){}
  await sleep(200);
 }
 return null;
}

function click(el){
 if(!el) return false;
 try{el.scrollIntoView({block:"center"});}catch(e){}
 el.dispatchEvent(new MouseEvent("mousedown",{bubbles:true}));
 el.dispatchEvent(new MouseEvent("mouseup",{bubbles:true}));
 el.dispatchEvent(new MouseEvent("click",{bubbles:true}));
 return true;
}

function btn(text){
 const t=text.toLowerCase();
 return [...document.querySelectorAll("button")]
 .find(b=>((b.innerText||"").toLowerCase()).includes(t));
}

function span(text){
 const t=text.toLowerCase();
 return [...document.querySelectorAll("span")]
 .find(s=>((s.textContent||"").toLowerCase()).includes(t));
}

function category(text){
 const t=text.toLowerCase();
 return [...document.querySelectorAll("span.categoryName")]
 .find(s=>((s.textContent||"").toLowerCase()).includes(t));
}

function setInput(value){
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

console.log("1️⃣ 打开 verification");

if(!location.pathname.includes("verification")){
 location.href="/verification";
 return;
}

console.log("2️⃣ 点击 Get Started");

click(await waitFor(()=>document.querySelector('[data-testid="get-started-button"]')));

console.log("3️⃣ 等待 BRN 输入框");

await waitFor(()=>document.querySelector('input[name="BusinessRegistrationNumber"]'));

setInput(BRN_VALUE);

console.log("4️⃣ 点击 Review");

click(await waitFor(()=>btn("review")));

console.log("5️⃣ 点击 Generate Report");

click(await waitFor(()=>btn("generate report")));

console.log("⏳ 等待报告生成");

await sleep(8000);

console.log("6️⃣ 打开 Additional data");

click(await waitFor(()=>btn("additional data")||span("additional data")));

console.log("7️⃣ 打开 BusinessDetails");

click(await waitFor(()=>span("businessdetails")));

const container=await waitFor(()=>document.querySelector('[data-testid="additional-data-appended-div"]'));

function hasContent(){
 if(container.querySelector('div[style*="padding-bottom"] > b')) return true;

 const rows=[...container.querySelectorAll("table tbody tr")];
 if(rows.length>0 && rows.some(r=>r.innerText.trim())) return true;

 return false;
}

const targets=[
 {name:"Key Info",match:"key information"},
 {name:"Abnormal",match:"abnormal"},
 {name:"Change Records",match:"change records"}
];

const results=[];

for(const t of targets){

 console.log("检测:",t.name);

 click(await waitFor(()=>category(t.match)||span(t.match)));

 await sleep(500);

 results.push({
 item:t.name,
 hasContent:hasContent()
 });

}

console.log("8️⃣ 获取 Transaction ID");

click(await waitFor(()=>btn("view all")));

const txnId=await waitFor(()=>{
 const title=[...document.querySelectorAll("span")]
 .find(el=>el.textContent.trim()=="Transaction record ID:");
 return title?.nextElementSibling?.textContent.trim();
});

results.forEach(r=>r.transactionRecordId=txnId);

console.table(results);

console.log("Transaction record ID:",txnId);

})();
