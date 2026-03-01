[...document.querySelectorAll('button')]
  .find(b => b.textContent.trim() === 'Go')
  ?.click();

javascript:(()=>{var b=[].slice.call(document.querySelectorAll('button')).find(function(x){return x.textContent.trim()==='Go'});if(b)b.click();})()
