// runs in browser window on action
(function () {
  console.log('injected-script.js');

  browser.runtime.onMessage.addListener(message => {
    console.log('injected-script: ', { message });
  });
})();
