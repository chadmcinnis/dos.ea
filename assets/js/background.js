var optionArray = [];

function getSettings(optionSet) {
  for (var i = 0; i < optionSet.length; i++) {
    curopt = optionSet[i];
    id = curopt.split('=')[0];
    state = curopt.split('=')[1];
    optionArray.push(state);
  }
  return optionArray;
}

browser.extension.onRequest.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request.getoptions == 'frombg') {
    if ('adminOptions' in localStorage) {
      optionArray = [];
      var optionSet = localStorage.getItem('adminOptions');
      optionSet = optionSet.split(',');
      optionArray = getSettings(optionSet);
      sendResponse({ returnoptions: optionArray });
    } else {
      sendResponse({ returnoptions: false });
    }
  }
});
