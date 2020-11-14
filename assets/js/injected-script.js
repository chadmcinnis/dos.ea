console.log('injected-script.js');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('injected-script: ', { request, sender });

  if (request.function !== 'getup') {
    console.warn('incorrect function name - not getup: ', request.function);
    sendResponse('from injected-script.js > NO');
    return;
  }

  sendResponse('from injected-script.js > YES');
});
