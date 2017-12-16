//interact with DOM
// console.log('--script within dom--');

//template to give popup direct Information
// chrome.runtime.onMessage.addListener(demo);
// function demo(request, sender, sendResponse) {
//     if (request.greeting == "hello")
//       // sendResponse({farewell: "goodbye"});
// }

/* -------------  */
//variables
var custName, custId, groupId, profId;
var siteInfo=[];
var credInfo=[];
var optionSet=[];
var optionArray=[];
var custIdVal, groupIdVal, profIdVal;
var eadmin, id, state, curopt, optionSet;
//temp
var x;
var bottomBranding,profiles,guestAccess,dbHighlighting,pageNumbers;

if (window.location.hostname.indexOf('eadmin') > -1) {
  var jq = document.createElement('script');
  jq.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js';
  document.getElementsByTagName('head')[0].appendChild(jq);

function getSettings(optionSet) {
  $(optionSet).each(function () {
    curopt = this;
    id = curopt.split('=')[0];
    state = curopt.split('=')[1];
    optionArray.push(state);
  });
  return optionArray;
}

if ("adminOptions" in localStorage) {
  optionSet = localStorage.getItem('adminOptions');
  optionSet = optionSet.split(',');
  optionArray = getSettings(optionSet);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.function == 'adminops') {
    optionSet = request.option;
    localStorage.setItem('adminOptions', optionSet);
    getSettings(optionSet);
  }
});

var count2 = 0;
var waitforArray = setInterval( function() {
  count2++; if (count2 > 120) { clearInterval(waitforArray); } else {
  if (optionArray) {
    clearInterval(waitforArray);
    $('body').append('<script id="doseaCustomAdmin" data-params="#d8ecb7|'+optionArray[0]+'|'+optionArray[1]+'|'+optionArray[2]+'|'+optionArray[3]+'|'+optionArray[4]+'" src="https://gss.ebscohost.com/cmcinnis/dos.ea/assets/js/customadmin.js"></script>');
  }
  }
}, 500);

//custid
function getCustId(){
  if ($('#custServiceHeader_toolbar_ddlCurrSite').length > 0) {
    custName = $('#custServiceHeader_toolbar_ddlCurrSite option:selected').text();
    custId = $('#custServiceHeader_toolbar_ddlCurrSite option:selected').val();
  } else if ($('#authHeader_toolbar_ddlCurrSite').length > 0) {
    custName = $('#authHeader_toolbar_ddlCurrSite  option:selected').text();
    custId = $('#authHeader_toolbar_ddlCurrSite option:selected').val();
  } else if ($('#authHeader_toolbar_tbCurrSite').length > 0) {
    custName = $('#authHeader_toolbar_tbCurrSite').text();
    custId = custName.substring(custName.lastIndexOf('(')+1,custName.lastIndexOf(')'));
  } else {
    custName = $('#custServiceHeader_toolbar_tbCurrSite').text();
    custId = custName.substring(custName.lastIndexOf('(')+1,custName.lastIndexOf(')'));
  }
  return [custName,custId];
}

//groupid
function getGroupid() {
  if ($('#custServiceHeader_toolbar_lblCurrGroup').length > 0) {
    groupId = $('#custServiceHeader_toolbar_ddlCurrGroup option:selected').val();
  } else {
    groupId = 'main';
  }
  return groupId;
}

//profid
function getProfid() {
  profId = $('#custServiceHeader_ddlCurrProfile option:selected').text();
  profId = profId.substring(profId.lastIndexOf('(')+1,profId.lastIndexOf(')'));
  return profId;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  //check to see if we're on an ebsco site
  if (request.function == 'sitecheck') {
    if (window.location.hostname.indexOf('eadmin') > -1) {
      sendResponse({site: "eadmin"});
    } else if (window.location.hostname.match(/(eds|web|ehis|openurl|resolver|search)/)) {
      sendResponse({site: "ebscohost"});
    }
  }

  //get custid, groupid, profid, custname, and create shortcut
  if (request.function == 'getsite') {
    var custNameVal = getCustId()[0];
    var custIdVal = getCustId()[1];
    siteInfo = [custIdVal,getGroupid(),getProfid(),custNameVal];
    sendResponse({siteInfo});
  }

  //get username and password
  if (request.function == 'getup') {
    custId = request.custId;
    groupId = request.groupId;
    var y = 0;
    var match = false;
    var tabLen = $('#grid_MainDataGrid .DataGrid-EmptyWhiteStyle input').length;
    $('#grid_MainDataGrid .DataGrid-EmptyWhiteStyle input').each(function() {
      if (y <= tabLen) {
        var rowContents = $(this).val();
        var authInfo = rowContents.split(',');
        var rowUser = authInfo[0];
        var rowPass = authInfo[1];
        var rowCustid = authInfo[2];
        var rowGroup = authInfo[3];
        if (custId == rowCustid && groupId == rowGroup) {
          credInfo = [rowUser,rowPass,custId,groupId];
          sendResponse({credInfo});
          match = true;
        }
        y++;
      }
    });
    if (!match) {
     $('#authHeader_toolbar_ddlCurrSite').attr('style','background-color:#ffecb3 !important');
     sendResponse({credInfo:"no match"});
    }
  }

  if (request.function == 'allSites') {
    $('#authHeader_toolbar_ddlCurrSite').attr('style','background-color:#ffecb3 !important');
  }

  //get the custid.groupid.profid in current ui
  if (request.function == 'getuisite') {
    var content = jQuery('footer').html();
        edsProfile = content.match(/<!-- user\:.*?-->/g)[0];
        edsProfile = edsProfile.split('<!-- user: ')[1];
        edsProfile = edsProfile.split(' -->')[0];
    sendResponse({edsPro: edsProfile});
  }

  //click authentication tab
  if (request.function == 'gotoauth') {
    $('#lnkAuthLi').trigger('click');
  }
  //click customize services tab
  if (request.function == 'gotocustserv') {
    $('#lnkCustServLi').trigger('click');
  }
  //click page down on authentication tab
  if (request.function == 'credPgDown') {
    $('img[alt="MoveDown"]').trigger('click');
  }
});
} else {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //check to see if we're on an ebsco site
    if (request.function == 'sitecheck') {
      if (window.location.hostname.indexOf('eadmin') > -1) {
        sendResponse({site: "eadmin"});
      } else if (window.location.hostname.match(/(eds|web|ehis|openurl|resolver|search)/)) {
        sendResponse({site: "ebscohost"});
      }
    }
    //get the custid.groupid.profid in current ui
    if (request.function == 'getuisite') {
      var content = jQuery('footer').html();
          edsProfile = content.match(/<!-- user\:.*?-->/g)[0];
          edsProfile = edsProfile.split('<!-- user: ')[1];
          edsProfile = edsProfile.split(' -->')[0];
      sendResponse({edsPro: edsProfile});
    }
  });
}











//dfasdfsf
