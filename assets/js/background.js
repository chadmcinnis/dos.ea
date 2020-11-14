function handleMessage(request) {
  return new Promise(resolve => {
    if (request.getoptions !== 'frombg') {
      return resolve();
    }

    let adminOptionsValues = [];
    if ('adminOptions' in localStorage) {
      let adminOptions = localStorage.getItem('adminOptions');
      let adminOptionsArr = adminOptions.split(',');
      adminOptionsValues = adminOptionsArr.map(opt => opt.split('=')[1]);
    }

    resolve({ returnoptions: adminOptionsValues });
  });
}

browser.runtime.onMessage.addListener(handleMessage);
