export const getActiveTab = async () => {
  const tabsArr = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tabsArr[0];
};

export const sendMessageToActiveTab = async message => {
  let activeTab = await getActiveTab();
  return await browser.tabs.sendMessage(activeTab.id, message);
};

export const createTab = async obj => browser.tabs.create(obj);

export const getSelf = async () => browser.management.getSelf();

export const getLocalStorage = async key => browser.storage.local.get(key);
export const setLocalStorage = async items => browser.storage.local.set(items);
export const clearLocalStorage = async () => browser.storage.local.clear();

export const loadLocalStorageInUi = async () => {
  let {
    sitestorage,
    credsstorage,
    uisite,
    permalink,
    saveAuthOps,
  } = await getLocalStorage();

  console.log({
    sitestorage,
    credsstorage,
    uisite,
    permalink,
    saveAuthOps,
  });

  return {
    ...(sitestorage && {
      sitestorage: {
        custId: sitestorage.custId,
        groupId: sitestorage.groupId,
        profId: sitestorage.profId,
        custName: sitestorage.custName,
        shortcut: `${sitestorage.custId}.${sitestorage.groupId}.${sitestorage.profId}`,
      },
    }),
    ...(credsstorage && {
      credsstorage: {
        user: credsstorage.user,
        pwd: credsstorage.pwd,
      },
    }),
    ...(uisite && {
      uisite: {
        edsProfile: uisite.edsProfile,
      },
    }),
    ...(permalink && {
      permalink: {
        profURL: permalink.profURL,
      },
    }),
    ...(saveAuthOps && {
      saveAuthOps: {
        authtypeOrg: saveAuthOps.selected,
      },
    }),
  };
};

// browser.storage.onChanged.addListener(function (changes, namespace) {
//   for (var key in changes) {
//     var storageChange = changes[key];
//     console.log(
//       'Storage key "%s" in namespace "%s" changed. ' +
//         'Old value was "%s", new value is "%s".',
//       key,
//       namespace,
//       storageChange.oldValue,
//       storageChange.newValue
//     );
//   }
// });
