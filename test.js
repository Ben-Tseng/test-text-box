   document.querySelector('a[href*="dvr-search"]').click();

try {
  const outerIframe = document.querySelector('iframe[data-widget-id="calypso-account-summary-info-widget"]');
  if (!outerIframe) throw new Error('未找到外层iframe，检查页面是否已加载完成');

  const outerDoc = outerIframe.contentDocument || outerIframe.contentWindow.document;

  const innerIframe = outerDoc.querySelector('iframe[sandbox]');
  if (!innerIframe) throw new Error('未找到内层iframe');

  const innerDoc = innerIframe.contentDocument || innerIframe.contentWindow.document;

  const bivLink = [...innerDoc.querySelectorAll('a.calypso-link')]
    .find(a => a.textContent.trim() === 'BIV');

  if (bivLink) {
    console.log('找到BIV链接，准备点击', bivLink);
    bivLink.click();
  } else {
    console.warn('未找到BIV链接，打印所有calypso-link供排查：');
    console.log([...innerDoc.querySelectorAll('a.calypso-link')].map(a => a.textContent.trim()));
  }
} catch (e) {
  console.error('执行出错:', e.message);
}
