(async () => {

const BRN_VALUE = "12345678";

const sleep = ms => new Promise(r=>setTimeout(r,ms));

async function waitFor(fn, timeout=30000){
 const start = Date.now();
 while(Date.now()-start < timeout){
   const v = fn();
   if(v) return v;
   await sleep(200);
 }
 return null;
}

function click(el){
 if(!el) return false;
 el.scrollIntoView({block:"center"});
 el.click();
 return true;
}

function btn(text){
 return [...document.querySelectorAll("button")]
  .find(b => (b.innerText||"").includes(text));
}

function span(text){
 return [...document.querySelectorAll("span")]
  .find(s => (s.textContent||"").includes(text));
}

function setInput(id,value){
 const el=document.getElementById(id);
 if(!el) return false;

 const setter=Object.getOwnPropertyDescriptor(
   HTMLInputElement.prototype,"value"
 ).set;

 setter.call(el,value);

 el.dispatchEvent(new Event("input",{bubbles:true}));
 el.dispatchEvent(new Event("change",{bubbles:true}));
 el.dispatchEvent(new Event("blur",{bubbles:true}));

 return true;
}

console.log("1️⃣ 打开 Verification");

click(await waitFor(()=>document.querySelector('a[href="/verification"]')));

console.log("2️⃣ 等待 Get Started");

click(await waitFor(()=>document.querySelector('[data-testid="get-started-button"]')));

console.log("3️⃣ 等待输入框");

await waitFor(()=>document.getElementById("BusinessRegistrationNumber"));

setInput("BusinessRegistrationNumber",BRN_VALUE);

console.log("4️⃣ 点击 Review");

click(await waitFor(()=>btn("Review")));

console.log("5️⃣ 点击 Generate Report");

click(await waitFor(()=>btn("Generate Report")));

console.log("⏳ 等待报告生成");

await sleep(8000);

console.log("6️⃣ 打开 Additional data");

click(await waitFor(()=>btn("Additional data")));

console.log("7️⃣ 打开 BusinessDetails");

click(await waitFor(()=>span("BusinessDetails")));

const container = await waitFor(()=>document.querySelector('[data-testid="additional-data-appended-div"]'));

function hasContent(){
 if(container.querySelector('div[style*="padding-bottom"] > b')) return true;

 const rows=[...container.querySelectorAll("table tbody tr")];
 if(rows.length>0 && rows.some(r=>r.innerText.trim())) return true;

 return false;
}

const targets=[
 {name:"Key Info",match:"Key Information"},
 {name:"Abnormal",match:"Abnormal"},
 {name:"Change Records",match:"Change Records"}
];

const results=[];

for(const t of targets){

 console.log("检测:",t.name);

 click(await waitFor(()=>span(t.match)||span(t.name)));

 await sleep(500);

 const row={
   item:t.name,
   hasContent:hasContent()
 };

 results.push(row);
}

console.log("8️⃣ 获取 Transaction record ID");

click(await waitFor(()=>btn("View all")));

const txnId = await waitFor(()=>{
 const title=[...document.querySelectorAll("span")]
  .find(el=>el.textContent.trim()=="Transaction record ID:");
 return title?.nextElementSibling?.textContent.trim();
});

results.forEach(r=>r.transactionRecordId=txnId);

console.table(results);

console.log("Transaction record ID:",txnId);

})();
