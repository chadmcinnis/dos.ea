import { getActiveTab, sendMessageToActiveTab, getSelf } from './helpers.js';

// runs in popup window
console.log('call-injected-script.js');

document.addEventListener('DOMContentLoaded', async () => {
  let activeTab = await getActiveTab();
  console.log({ activeTab });

  let self = await getSelf();
  console.log({ self });
});

const getup = async () => {
  console.log('run getup');

  let messageResp = await sendMessageToActiveTab({
    function: 'getup',
    a: [1, 2, 3],
    b: 'text',
  });
  console.log({ messageResp });
};

document.getElementById('getup').onclick = getup;
