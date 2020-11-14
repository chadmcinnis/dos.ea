// runs in popup window
console.log('call-injected-script.js');

const getActiveTab = async () => {
  const tabsArr = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tabsArr[0];
};

const getSeft = async () => browser.management.getSelf();

document.addEventListener('DOMContentLoaded', async () => {
  let activeTab = await getActiveTab();
  console.log({ activeTab });

  let self = await getSeft();
  console.log({ self });

  //   if (typeof <function> === "function") {
  //     // safe to use the function
  //  }
});

function getup() {
  console.log('run getup');

  browser.storage.onChanged.addListener(function (changes, namespace) {
    for (var key in changes) {
      var storageChange = changes[key];
      console.log(
        'Storage key "%s" in namespace "%s" changed. ' +
          'Old value was "%s", new value is "%s".',
        key,
        namespace,
        storageChange.oldValue,
        storageChange.newValue
      );
    }
  });

  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    browser.tabs.sendMessage(
      tabs[0].id,
      { function: 'getup', a: [1, 2, 3], b: 'text' },
      function (response) {
        console.log({ response });
      }
    );
  });
}

document.getElementById('getup').onclick = getup;
