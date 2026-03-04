(async () => {

const BRN_VALUE="12345678";

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function waitFor(fn,timeout=60000,interval=200){
 const start=Date.now();
 while(Date.now()-start<timeout){
  try{
   const v=fn();
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

function enabled(el){
 if(!el) return false;
 if(el.tagName!=="BUTTON") return true;
 return !(el.disabled||el.getAttribute("aria-disabled")==="true");
}

async function waitStableElement(getter,stableMs=600,timeout=30000){

 const start=Date.now();
 let last=null;
 let stable=0;

 while(Date.now()-start<timeout){

  const cur=getter();

  if(!cur){
   last=null;
   stable=0;
   await sleep(100);
   continue;
  }

  if(cur===last){
   stable+=100;
   if(stable>=stableMs) return cur;
  }else{
   last=cur;
   stable=0;
  }

  await sleep(100);

 }

 return null;

}

async function fillBRN(value){

 const el=await waitStableElement(()=>document.getElementById("BusinessRegistrationNumber"));

 if(!el) return false;

 const setter=Object.getOwnPropertyDescriptor(
 HTMLInputElement.prototype,"value").set;

 el.focus();

 setter.call(el,value);

 el.dispatchEvent(new Event("input",{bubbles:true}));
 el.dispatchEvent(new Event("change",{bubbles:true}));
 el.dispatchEvent(new Event("blur",{bubbles:true}));

 return await waitFor(()=>{

  const cur=document.getElementById("BusinessRegistrationNumber");

  return cur && cur.value===value;

 },8000);

}

async function waitContainerIdle(container,idleMs=450,timeoutMs=9000){

 return new Promise(resolve=>{

  let timer=null;

  const observer=new MutationObserver(()=>{

   if(timer) clearTimeout(timer);

   timer=setTimeout(()=>{

    observer.disconnect();
    resolve(true);

   },idleMs);

  });

  observer.observe(container,{
   childList:true,
   subtree:true,
   characterData:true
  });

  timer=setTimeout(()=>{

   observer.disconnect();
   resolve(true);

  },timeoutMs);

 });

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

function formatContent(text){

 const keys=[
 "Uniform Credit Code",
 "Company Name",
 "Legal Representative",
 "Registered Capital",
 "Establishment Date",
 "Business Status",
 "Company Type",
 "Registration Authority",
 "Business Scope",
 "Registered Address"
 ];

 let t=text;

 for(const k of keys){

  const reg=new RegExp(k,"gi");

  t=t.replace(reg,"\n\n【"+k.toUpperCase()+"】\n");

 }

 return t.trim();

}

function hasContent(container){

 if(container.querySelector('div[style*="padding-bottom"] > b'))
 return true;

 const rows=[...container.querySelectorAll("table tbody tr")];

 if(rows.length && rows.some(r=>r.innerText.trim()))
 return true;

 return cleanContent(container).length>0;

}

function getTxnId(){

 const title=[...document.querySelectorAll("span")]
 .find(el=>el.textContent.trim()=="Transaction record ID:");

 return title?.nextElementSibling?.textContent.trim()||null;

}

async function clickViewAllAndGetTxnId(){

 const viewAll=await waitFor(()=>btn("view all"),60000);

 if(!viewAll) return null;

 click(viewAll);

 return await waitFor(()=>getTxnId(),60000);

}

if(!location.pathname.includes("verification")){
 location.href="/verification";
 return;
}

click(await waitFor(()=>document.querySelector('[data-testid="get-started-button"]')));

await waitFor(()=>document.getElementById("BusinessRegistrationNumber"));

const ok=await fillBRN(BRN_VALUE);

if(!ok){
 console.log("BRN fill failed");
 return;
}

const review=await waitFor(()=>{
 const b=btn("review");
 return enabled(b)?b:null;
});

click(review);

const gen=await waitFor(()=>{
 const b=btn("generate report");
 return enabled(b)?b:null;
});

click(gen);

const add=await waitFor(()=>{
 const a=btn("additional data")||span("additional data");
 if(!a) return null;
 if(a.tagName==="BUTTON"&&!enabled(a)) return null;
 return a;
},180000);

click(add);

click(await waitFor(()=>span("businessdetails")||category("businessdetails")));

const container=await waitFor(()=>document.querySelector('[data-testid="additional-data-appended-div"]'));

const txnPromise=clickViewAllAndGetTxnId();

const targets=[
 {item:"Key Info",match:"key information"},
 {item:"Abnormal",match:"abnormal"},
 {item:"Change Records",match:"change records"}
];

const results=[];

for(const t of targets){

 const left=category(t.match)||span(t.match)||span(t.item.toLowerCase());

 if(!left){
  results.push({item:t.item,hasContent:null,Content:""});
  continue;
 }

 click(left);

 await waitContainerIdle(container);

 const has=hasContent(container);

 const content=has?formatContent(cleanContent(container)):"";

 results.push({
  item:t.item,
  hasContent:has,
  Content:content
 });

}

console.table(results);

const txnId=await txnPromise;

console.log("Transaction record ID:",txnId);

if(txnId){
 navigator.clipboard.writeText(txnId);
 console.log("✔ Transaction ID copied");
}

})();
