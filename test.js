const link = [...document.querySelectorAll('a')]
  .find(a => a.textContent.includes('Workflow History'));
if (link) link.click();
