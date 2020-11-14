// runs in browser window on action
console.log('injected-script.js');

function handleMessage(request) {
  console.dir(request);
  return new Promise(resolve => {
    if (!request.crux) {
      return resolve('wrong page');
    }

    // no real - hacked because of window issue
    let allScripts = document.querySelectorAll('script');
    let initialState = [...allScripts].find(script =>
      script.innerText.startsWith('window.__INITIAL_STATE__')
    );
    let stateText = initialState.innerText.split('__=')[1];
    stateText = stateText.split('; window.__PUBLIC')[0];

    let cruxData = JSON.parse(stateText);
    console.log({ data: cruxData, user: cruxData.user.data });

    resolve({ data: cruxData, user: cruxData.user.data });
  });
}

browser.runtime.onMessage.addListener(handleMessage);
