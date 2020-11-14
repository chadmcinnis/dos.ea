var custName, custId, groupId, profId;
var siteInfo=[];
var credInfo=[];
var optionSet=[];
var custIdVal, groupIdVal, profIdVal;
var eadmin, id, state, curopt, optionSet;

if (window.location.hostname.indexOf('eadmin') > -1 && window.location.pathname.indexOf('CustomizeEhostColorsForm') === -1) {
  var jq = document.createElement('script');
  jq.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js';
  document.getElementsByTagName('head')[0].appendChild(jq);

  var optionArray;
  chrome.extension.sendRequest({getoptions: "frombg"}, function(response) {
    optionArray = response.returnoptions;
		if (optionArray) {
			var count2 = 0;
			var waitforArray = setInterval(function() {
				count2++;
        if (count2 > 200) {
          clearInterval(waitforArray);
        } else {
  				if (optionArray.length > 0) {
  					clearInterval(waitforArray);
  					$('body').append('<span><script id="doseaCustomAdmin" data-params="#d8ecb7|'
            + optionArray[0] + '|'
            + optionArray[1] + '|'
            + optionArray[2] + '|'
            + optionArray[3] + '|'
            + optionArray[4] + '|'
            + optionArray[5] + '|'
            + optionArray[6] + '|'
            + optionArray[7] + '" src="https://gss.ebscohost.com/cmcinnis/dos.ea/assets/js/customadmin-v1.min.js"></script></span>');
  				}
				}
			},50);
		}
	});
}

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
    } else {
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
    var currentDate = new Date();
    $('#grid_MainDataGrid tr:not(:first)').each(function() {
      if (y <= tabLen) {
        var rowContents = $(this).find('.DataGrid-EmptyWhiteStyle input').val();
        var authInfo = rowContents.split(',');
        var rowUser = authInfo[0];
        var rowPass = authInfo[1];
        var rowCustid = authInfo[2];
        var rowGroup = authInfo[3];
        if (custId == rowCustid && groupId == rowGroup) {
          var expireDate = $(this).find('span[id*="_ExpireDate_"]');
          if (expireDate) {
            var expireDateVal = new Date(expireDate.text());
            if (currentDate.getTime() > expireDateVal.getTime()) {
              expireDate.parent().css('background-color','#ff000078');
              return true;
            }
          }
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

  //get the custid.groupid.profid in current ui
  if (request.function == 'getuisite') {
    if (window.location.pathname.indexOf('/openurl') === -1) {
      var ep = document.getElementsByTagName('script');
      var json = null;
      for (var i=0;i<ep.length;i++) {
        var text = ep[i].textContent;
        if (text.indexOf('var ep =') > -1){
          json = JSON.parse(text.split('ep =')[1]);
        }
      }

      if (json && json.clientData && json.clientData.pid) {
        sendResponse({edsPro: json.clientData.pid});
      } else {
        var content = $('footer').html();
        var edsProfile = content.match(/<!-- user\:.*?-->/g)[0];
        edsProfile = edsProfile.split('<!-- user: ')[1];
        edsProfile = edsProfile.split(' -->')[0];
        sendResponse({edsPro: edsProfile});
      }
    } else {
      var lastDiv = $('#footerControl div').last();
      var checkPieces = lastDiv.text().split('.');
      if (checkPieces.length === 3) {
        sendResponse({edsPro: lastDiv.text()});
      } else {
        sendResponse({edsPro: 'N/A'});
      }
    }
  }
});
