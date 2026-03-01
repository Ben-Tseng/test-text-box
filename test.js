[...document.querySelectorAll('button')]
  .find(b => b.textContent.trim() === 'Go')
  ?.click();
