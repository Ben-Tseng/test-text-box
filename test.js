const bizLabel = [...bizDoc.querySelectorAll(".no-side-padding, div, span, label")].find(
      (el) => (el.textContent || "").trim().includes("Business Name")
    );
    const bizRow = bizLabel?.closest(".row") || bizLabel?.parentElement;
    const e2 = bizRow?.querySelector(".normal-input strong") || bizRow?.querySelector("strong");



const element = 
    bizDoc.querySelector('h3.sop-section-header') || 
    bizDoc.querySelector('.sop-section-header-div') || 
    bizDoc.querySelector('article[id*="calypso_bl"]') || 
    e2;
