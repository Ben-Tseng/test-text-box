   document.querySelector('a[href*="dvr-search"]').click();

const bivLink = [...innerDoc.querySelectorAll('a.calypso-link')]
  .find(a => a.textContent.trim() === 'BIV');

if (bivLink) bivLink.click();
