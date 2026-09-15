   document.querySelector('a[href*="dvr-search"]').click();

const allIframes = document.querySelectorAll('iframe');
console.log(`页面共找到 ${allIframes.length} 个iframe`);
allIframes.forEach((f, i) => {
  console.log(`--- iframe[${i}] ---`);
  console.log('id:', f.id);
  console.log('data-widget-id:', f.getAttribute('data-widget-id'));
  console.log('class:', f.className);
  console.log('src/data-src:', f.src, f.getAttribute('data-src'));
});
