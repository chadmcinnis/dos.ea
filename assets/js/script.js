let custName, custId, groupId, profId;
let credInfo = [];
let optionSet = [];
let custIdVal, groupIdVal, profIdVal;
let eadmin, id, state, curopt;

const isEadmin = window.location.hostname.includes('eadmin');
const isPathname = txt => window.location.pathname.includes(txt);

(async function () {
  if (!isEadmin || (isEadmin && isPathname('CustomizeEhostColorsForm'))) {
    return;
  }

  let jq = document.createElement('script');
  jq.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js';
  document.getElementsByTagName('head')[0].appendChild(jq);

  let frombgResp = await browser.runtime.sendMessage({ getoptions: 'frombg' });
  let optionArray = frombgResp.returnoptions;
  if (!optionArray.length) return;

  let script = document.createElement('script');
  script.id = 'doseaCustomAdmin';
  script.dataset.params = `#d8ecb7|${optionArray.join('|')}`;
  script.src = 'https://gss.ebscohost.com/cmcinnis/dos.ea/assets/js/dev-customadmin.js'; // prettier-ignore

  let span = document.createElement('span');
  span.appendChild(script);

  document.body.appendChild(span);
})();

//custid
function getCustId() {
  if ($('#custServiceHeader_toolbar_ddlCurrSite').length > 0) {
    custName = $(
      '#custServiceHeader_toolbar_ddlCurrSite option:selected'
    ).text();
    custId = $('#custServiceHeader_toolbar_ddlCurrSite option:selected').val();
  } else if ($('#authHeader_toolbar_ddlCurrSite').length > 0) {
    custName = $('#authHeader_toolbar_ddlCurrSite  option:selected').text();
    custId = $('#authHeader_toolbar_ddlCurrSite option:selected').val();
  } else if ($('#authHeader_toolbar_tbCurrSite').length > 0) {
    custName = $('#authHeader_toolbar_tbCurrSite').text();
    custId = custName.substring(
      custName.lastIndexOf('(') + 1,
      custName.lastIndexOf(')')
    );
  } else {
    custName = $('#custServiceHeader_toolbar_tbCurrSite').text();
    custId = custName.substring(
      custName.lastIndexOf('(') + 1,
      custName.lastIndexOf(')')
    );
  }
  return [custName, custId];
}

//groupid
function getGroupid() {
  groupId = 'main';
  if ($('#custServiceHeader_toolbar_lblCurrGroup').length) {
    groupId = $(
      '#custServiceHeader_toolbar_ddlCurrGroup option:selected'
    ).val();
  }

  return groupId;
}

//profid
function getProfid() {
  profId = $('#custServiceHeader_ddlCurrProfile option:selected').text();
  profId = profId.substring(
    profId.lastIndexOf('(') + 1,
    profId.lastIndexOf(')')
  );

  return profId;
}

function handleMessage(request) {
  return new Promise(resolve => {
    //check to see if we're on an ebsco site
    if (request.function == 'sitecheck') {
      let site = isEadmin ? 'eadmin' : 'ebscohost';

      resolve({ site });
    }

    //get custid, groupid, profid, custname, and create shortcut
    if (request.function == 'getsite') {
      let [custNameVal, custIdVal] = getCustId();
      let siteInfo = [custIdVal, getGroupid(), getProfid(), custNameVal];

      resolve({ siteInfo });
    }

    if (request.function == 'allSites') {
      $('#authHeader_toolbar_ddlCurrSite').attr(
        'style',
        'background-color:#ffecb3 !important'
      );
      resolve();
    }

    //click authentication tab
    if (request.function == 'gotoauth') {
      $('#lnkAuthLi').trigger('click');
      resolve();
    }

    //click customize services tab
    if (request.function == 'gotocustserv') {
      $('#lnkCustServLi').trigger('click');
      resolve();
    }

    //click page down on authentication tab
    if (request.function == 'credPgDown') {
      $('img[alt="MoveDown"]').trigger('click');
      resolve();
    }

    //get the custid.groupid.profid in current ui
    if (request.function == 'getuisite') {
      if (!isPathname('/openurl')) {
        let ep = document.getElementsByTagName('script');
        let json = null;
        for (let i = 0; i < ep.length; i++) {
          let text = ep[i].textContent;
          if (text.indexOf('let ep =') > -1) {
            json = JSON.parse(text.split('ep =')[1]);
          }
        }

        if (json && json.clientData && json.clientData.pid) {
          resolve({ edsPro: json.clientData.pid });
        } else {
          let content = $('footer').html();
          let edsProfile = content.match(/<!-- user\:.*?-->/g)[0];
          edsProfile = edsProfile.split('<!-- user: ')[1];
          edsProfile = edsProfile.split(' -->')[0];
          resolve({ edsPro: edsProfile });
        }
      } else {
        let lastDiv = $('#footerControl div').last();
        let checkPieces = lastDiv.text().split('.');
        if (checkPieces.length === 3) {
          resolve({ edsPro: lastDiv.text() });
        } else {
          resolve({ edsPro: 'N/A' });
        }
      }
    }

    resolve('end');
  });
}

browser.runtime.onMessage.addListener(handleMessage);

//get username and password
// if (request.function == 'getup') {
//   custId = request.custId;
//   groupId = request.groupId;
//   let y = 0;
//   let match = false;
//   let tabLen = $('#grid_MainDataGrid .DataGrid-EmptyWhiteStyle input').length;
//   let currentDate = new Date();
//   $('#grid_MainDataGrid tr:not(:first)').each(function () {
//     if (y <= tabLen) {
//       let rowContents = $(this).find('.DataGrid-EmptyWhiteStyle input').val();
//       let authInfo = rowContents.split(',');
//       let rowUser = authInfo[0];
//       let rowPass = authInfo[1];
//       let rowCustid = authInfo[2];
//       let rowGroup = authInfo[3];
//       if (custId == rowCustid && groupId == rowGroup) {
//         let expireDate = $(this).find('span[id*="_ExpireDate_"]');
//         if (expireDate) {
//           let expireDateVal = new Date(expireDate.text());
//           if (currentDate.getTime() > expireDateVal.getTime()) {
//             expireDate.parent().css('background-color', '#ff000078');
//             return true;
//           }
//         }
//         credInfo = [rowUser, rowPass, custId, groupId];
//         resolve({ credInfo });
//         match = true;
//       }
//       y++;
//     }
//   });
//   if (!match) {
//     $('#authHeader_toolbar_ddlCurrSite').attr(
//       'style',
//       'background-color:#ffecb3 !important'
//     );
//     resolve({ credInfo: 'no match' });
//   }
// }
