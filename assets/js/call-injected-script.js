console.log('call-injected-script.js');

function getup() {
  console.log('run getup');

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { function: 'getup', a: [1, 2, 3], b: 'text' },
      function (response) {
        console.log({ response });
      }
    );
  });
}

document.getElementById('getup').onclick = getup;
