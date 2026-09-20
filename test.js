const bizLabel = [...bizDoc.querySelectorAll(".no-side-padding, div, span, label")].find(
      (el) => (el.textContent || "").trim().includes("Business Name")
    );
    const bizRow = bizLabel?.closest(".row") || bizLabel?.parentElement;
    const e2 = bizRow?.querySelector(".normal-input strong") || bizRow?.querySelector("strong");
