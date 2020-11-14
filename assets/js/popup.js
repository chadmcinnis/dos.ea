import {
  createTab,
  getActiveTab,
  getLocalStorage,
  setLocalStorage,
  clearLocalStorage,
  loadLocalStorageInUi,
  sendMessageToActiveTab,
} from './helpers.js';

var custName, custId, groupId, profId, credsCustId, credsGroupId, profURL;
var textField, textCopy, edsProfile, site, user, pwd, value, authtype, creds;
var none, saveOptions, admimVal, curopt, type, authSel;
var a = 0;

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-111199777-1']);
_gaq.push(['_trackPageview']);

$('.opTitle').on('click', 'a', function () {
  createTab({ url: $(this).attr('href') });
  return false;
});

function updateAuth() {
  id = this.id;
  id = id.split('_')[1];
  $('input[id="' + id + '"]').addClass('chk');
  $('input[id="' + id + '"]').trigger('click');
}

function chips(authSel) {
  if (authSel != '') {
    let setChipHtml = el =>
      `<div class="chip"><span id="chip_${el}">${el}</span><i id="i_${el}" class="close material-icons chips_close">close</i></div>`;
    $('.placeAuth').html('');

    var authSelArr = authSel.split(',');
    authSelArr.forEach(authSel => {
      $('.placeAuth').append(setChipHtml(authSel));
    });

    if ($('.chips_close').length > 0) {
      var z = document.getElementsByClassName('chips_close');
      for (var i = 0; i < z.length; i++) {
        z[i].addEventListener('click', updateAuth, false);
      }
    }
  } else {
    $('.placeAuth').html('<p>&nbsp;&nbsp;&nbsp; None -- Click AUTHTYPE</p>');
  }
}

function authDefaults() {
  $('#embed_logins').prop('checked', true);
  $('#currAuthType').text('embed_logins');
  chips('embed_logins');
}

(async function () {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);

  let activeTab = await getActiveTab();
  let parsedUrl = new URL(activeTab.url);
  switch (true) {
    case parsedUrl.host.includes('eadmin'):
      site = 'eadmin';
      break;
    case parsedUrl.host.includes('discovery.ebsco'):
      site = 'crux';
      break;
    case parsedUrl.host.match(/\/(ebscohost|eds|ehost|resolver|web)/i):
    case parsedUrl.path.match(/\/(bsi|ehost|openurl|pfi)/i):
      site = 'ebscohost';
      break;
    default:
      site = 'warning';
  }

  //get all information stored and insert it in popup UI
  let {
    sitestorage,
    credsstorage,
    uisite,
    permalink,
    saveAuthOps,
  } = await loadLocalStorageInUi();

  if (sitestorage) {
    $('#showCust').text(sitestorage.custId);
    $('#showGroup').text(sitestorage.groupId);
    $('#showProfile').text(sitestorage.profId);
    $('#showCustName').text(sitestorage.custName);
    $('#showShortcut').text(sitestorage.shortcut);
  }

  if (credsstorage) {
    $('#showUser').text(credsstorage.user);
    $('#showPass').text(credsstorage.pwd);
  }

  uisite && $('#showActSite').text(uisite.edsProfile);
  permalink && $('#showUrl').text(permalink.profURL);

  if (saveAuthOps) {
    chips(authtypeOrg);
    if (authtypeOrg.indexOf(',') > -1) {
      authtype = authtypeOrg.split(',');
      $(authtype).each(function () {
        value = this;
        $('[id="' + value + '"]').prop('checked', true);
      });
    } else {
      $('#ip,#cookie,#url').prop('checked', false);
      $('[id="' + authtypeOrg + '"]').prop('checked', true);
    }
    $('#currAuthType').text(authtypeOrg);
  } else {
    authDefaults();
  }

  // load from localStorage
  if ('adminOptions' in localStorage) {
    let optionSet = localStorage.getItem('adminOptions');
    optionSet = optionSet.split(',');
    optionSet.forEach(opt => {
      let arr = opt.split('=');
      let id = arr[0];
      let state = arr[1];
      $('.switch input:not(#selectNoneOrAll)').each(function () {
        if (this.id == id) {
          $(this).prop('checked', state == 'true');
        }
      });
    });
  } else {
    $('.switch input').each(function () {
      $(this).prop('checked', false);
    });
  }
})();

function warnMessage(msg) {
  $('#modalWrongSite').modal('open');
}
function modalClear(msg) {
  $('#modalClear').modal('open');
}

//get custid, groupid, profid, custname, and create shortcut
async function getsite() {
  if (site == 'eadmin') {
    let siteResp = await sendMessageToActiveTab({ function: 'getsite' });

    console.log({ siteResp });

    if (typeof siteResp !== 'undefined') {
      custId = siteResp.siteInfo[0];
      groupId = siteResp.siteInfo[1];
      profId = siteResp.siteInfo[2];
      custName = siteResp.siteInfo[3];

      if (custId !== 'all') {
        custId ? $('#showCust').text(custId) : 'None';
        groupId ? $('#showGroup').text(groupId) : 'None';
        profId ? $('#showProfile').text(profId) : 'None';
        custName ? $('#showCustName').text(custName) : 'None';

        if (custId && groupId && profId) {
          $('#showShortcut').text(`${custId}.${groupId}.${profId}`);
        }

        var sitestorage = {
          custId: custId,
          groupId: groupId,
          profId: profId,
          custName: custName,
        };

        setLocalStorage({ sitestorage });
      } else {
        $('#modalAuth').modal('open');
        await sendMessageToActiveTab({ function: 'allSites' });
      }
    } else {
      await clearLocalStorage();
      $('#modalClear').modal('open');
    }

    let creds = await getLocalStorage('credsstorage');
    if (typeof creds !== 'undefined') {
      credsCustId = creds.credsCustId;
      credsGroupId = creds.credsGroupId;

      if (custId != credsCustId || groupId != credsGroupId) {
        $('#showUser').text('');
        $('#showPass').text('');
        user = pwd = credsCustId = credsGroupId = '';

        var credsstorage = {
          user: user,
          pwd: pwd,
          credsCustId: credsCustId,
          credsGroupId: credsGroupId,
        };

        setLocalStorage({ credsstorage });
      }
    }
  } else {
    warnMessage('yes');
    _gaq.push(['_trackEvent', 'getsite/warnMessage', 'Error']);
  }
}

//get username and password
async function getup() {
  if (site == 'eadmin') {
    let siteItems = await getLocalStorage('sitestorage');

    if (typeof siteItems !== 'undefined') {
      custId = siteItems.custId;
      groupId = siteItems.groupId;
      if (groupId == '') {
        groupId = 'main';
      }
    } else {
      $('#modalUP').modal('open');
      _gaq.push(['_trackEvent', 'getup1/modalUP', 'Error']);
    }

    let getupResp = await sendMessageToActiveTab({
      function: 'getup',
      custId: custId,
      groupId: groupId,
    });

    if (getupResp.credInfo !== 'no match') {
      user = getupResp.credInfo[0];
      pwd = getupResp.credInfo[1];
      credsCustId = getupResp.credInfo[2];
      credsGroupId = getupResp.credInfo[3];
      $('#showUser').text(user);
      $('#showPass').text(pwd);

      var credsstorage = {
        user: user,
        pwd: pwd,
        credsCustId: credsCustId,
        credsGroupId: credsGroupId,
      };

      setLocalStorage({ credsstorage });
    } else {
      $('#modalUP').modal('open');
      _gaq.push(['_trackEvent', 'getup2/modalUP', 'Error']);
    }
  } else {
    warnMessage('yes');
    _gaq.push(['_trackEvent', 'getup3/warnMessage', 'Error']);
  }
}

//get the custid.groupid.profid in current ui
async function getuisite() {
  if (site === 'ebscohost') {
    let getuisiteResp = await sendMessageToActiveTab({ function: 'getuisite' });
    edsProfile = getuisiteResp.edsPro;
    $('#showActSite').text(edsProfile);

    var uisite = { edsProfile };
    setLocalStorage({ uisite });
  } else {
    $('#wrongTab').modal('open');
    _gaq.push(['_trackEvent', 'getuisite/wrongTab', 'Error']);
  }
}

$('#saveAuthOps').on('click', function () {
  currAuthType = $('#currAuthType').text();
  saveOptions = { selected: currAuthType };

  setLocalStorage({
    saveAuthOps: saveOptions,
  });
});

function createlink() {
  custId = $('#showCust').text();
  groupId = $('#showGroup').text();
  profId = $('#showProfile').text();

  if ($('#embed_logins').is(':checked')) {
    user = $('#showUser').text();
    pwd = $('#showPass').text();

    if (user == '' && pwd == '') {
      var $toastContent = $('<span>Missing User/Password</span>');
      M.toast({ html: $toastContent }, 2000);
    }

    authtype = 'uid';
    creds = `&user=${encodeURIComponent(user)}&password=${encodeURIComponent(
      pwd
    )}`;
  } else {
    authtype = $('#currAuthType').text();
    creds = '';
  }

  let baseUrl = `https://search.ebscohost.com/login.aspx`;
  profURL = `${baseUrl}?custid=${custId}&groupid=${groupid}&profid=${profid}&authtype=${
    authtype + creds
  }`;
  $('#showUrl').text(profURL);

  var permalink = { profURL };
  setLocalStorage({ permalink });

  return profURL;
}

function openPermaLink() {
  var permaUrl = createlink();
  var win = window.open(permaUrl, '_blank');
  if (win) {
    win.focus();
  } else {
    alert('Please allow popups for this website');
  }
}

//clear all storage
async function removeStorage() {
  await clearLocalStorage();

  $('table tr td.storval').empty();
  $('#ip,#cookie,#url').prop('checked', false);

  authDefaults();
}

$('table tbody tr td a:not(#btnauthtype)').on('click', function () {
  textField = $(this).parent().next('td');
  textCopy = textField.text();
  if (textCopy !== '') {
    var copyFrom = document.createElement('textarea');
    copyFrom.textContent = textCopy;
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    body.removeChild(copyFrom);
    var $toastContent = $('<span>Copied</span>');
    M.toast({ html: $toastContent }, 2000);
  } else {
    var $toastContent = $('<span>Unable to copy text</span>');
    M.toast({ html: $toastContent }, 2000);
  }
});

async function gotoauth() {
  if (site !== 'eadmin') {
    _gaq.push(['_trackEvent', 'gotoauth/warnMessage', 'Error']);
    return warnMessage('eadmin');
  }

  await sendMessageToActiveTab({ function: 'gotoauth' });
}

async function gotocustserv() {
  if (site !== 'eadmin') {
    _gaq.push(['_trackEvent', 'gotocustserv/warnMessage', 'Error']);
    return warnMessage('eadmin');
  }

  await sendMessageToActiveTab({ function: 'gotocustserv' });
}

async function saveAdminOps() {
  let activeTab = getActiveTab();
  await sendMessageToActiveTab({ url: activeTab.url });
}

async function credPgDown() {
  if (site !== 'eadmin') {
    return warnMessage('eadmin');
  }

  await sendMessageToActiveTab({ function: 'credPgDown' });
}

function clearAuthOps() {
  $('input[name="authtype"]:checked').prop('checked', false);
  $('#currAuthType, .placeAuth').text('');
  $('.chk').removeClass('chk');
}

let optionSwitches = $('.switch input:not(#selectNoneOrAll)');
console.log(optionSwitches);

$('#selectNoneOrAll').on('click', function () {
  var adminOpsArr = [];
  var checked = this.checked;
  [...optionSwitches].forEach(opt => {
    opt.checked = checked;
    adminOpsArr.push(`${opt.id}=${checked}`);
  });

  localStorage.setItem('adminOptions', adminOpsArr);
});

console.log(optionSwitches);
optionSwitches.on('click', function () {
  var adminOpsArr = [];
  [...optionSwitches].forEach(opt => {
    console.log({ opt });
    console.log(opt.id);
    console.log(opt.checked);
    console.dir(opt);

    adminOpsArr.push(`${opt.id}=${opt.checked == true}`);
  });

  console.log({ adminOpsArr });
  localStorage.setItem('adminOptions', adminOpsArr);
});

$('a[href="#authtype"]').on('click', function () {
  var currAuthType = $('#currAuthType').text();
  if (
    !currAuthType.match(
      /(uid|guest|cpid|shib|sso|custiud|athens|embed_logins)/g
    )
  ) {
    $('#authtype [type="radio"]:checked').prop('checked', false);
  }
});

$('input[name="authtype"]').on('click', function () {
  if (this.id == 'embed_logins') {
    $(':checked').not(this).prop('checked', false);
  } else if (this.id == 'ip' || this.id == 'cookie' || this.id == 'url') {
    $('#embed_logins').prop('checked', false);
  }

  var currAuthType = $('#currAuthType').text();
  if ($(this).hasClass('chk') && this.checked && this.type == 'radio') {
    $(this).removeClass('chk');
    $('#' + this.id).prop('checked', false);
    currAuthType = currAuthType.replace(this.value, '');
  } else if (this.type == 'radio') {
    $('.chk').removeClass('chk');
    $(this).addClass('chk');
  }

  if (currAuthType == 'embed_logins') {
    currAuthType = '';
  }

  if (this.value == 'embed_logins') {
    currAuthType = 'embed_logins';
  } else {
    if (currAuthType.match(/(ip|cookie|url)/g)) {
      if (
        this.checked === true &&
        this.type == 'checkbox' &&
        currAuthType.indexOf(this.value) == -1
      ) {
        currAuthType = this.value + ',' + currAuthType;
      } else if (this.checked === false) {
        currAuthType = currAuthType.replace(this.value, '');
      } else if (this.type == 'radio') {
        var radio = currAuthType.split(',').pop();
        if (radio.match(/(ip|cookie|url)/g)) {
          currAuthType += ',' + this.value;
        } else if (radio != this.value) {
          currAuthType = currAuthType.replace(radio, this.value);
        }
      }
    } else if (this.checked === false) {
      currAuthType = currAuthType.replace(this.value, '');
    } else if (this.type === 'checkbox') {
      currAuthType = this.value + ',' + currAuthType;
    } else {
      currAuthType = this.value;
    }
    currAuthType = currAuthType.replace(/^,|,$/g, '');
    currAuthType = currAuthType.replace(/,,/g, ',');
  }

  $('#currAuthType').text(currAuthType);
  saveOptions = { selected: currAuthType };
  setLocalStorage({
    saveAuthOps: saveOptions,
  });
  chips(currAuthType);
});

$('.modal').modal();
$('.tooltipped').tooltip();
$('.fixed-action-btn').floatingActionButton({
  direction: 'right', // Direction menu comes out
  hoverEnabled: false, // Hover enabled
  toolbarEnabled: false, // Toolbar transition enabled
});

$('footer .btn-large').on('click', function () {
  $('#mail').css('display', 'block');
  $('#success').css('display', 'none');
  $('#name').val('');
  $('#email').val('');
  $('#textarea1').val('');
});

function setOnClick(obj) {
  for (let [key, fn] of Object.entries(obj)) {
    document.getElementById(key).onclick = fn;
  }
}

setOnClick({
  getsite: getsite,
  // getup: getup,
  gotoauth: gotoauth,
  gotocustserv: gotocustserv,
  removeStorage: removeStorage,
  activesite: getuisite,
  createlink: createlink,
  modalCL: createlink,
  permalink: openPermaLink,
  modalLO: openPermaLink,
  saveAdminOps: saveAdminOps,
  clearAuthOps: clearAuthOps,
});

// document.getElementById('getsite').onclick = getsite;
// // document.getElementById("getup").onclick = getup;
// document.getElementById('gotoauth').onclick = gotoauth;
// document.getElementById('gotocustserv').onclick = gotocustserv;
// document.getElementById('removeStorage').onclick = removeStorage;
// document.getElementById('activesite').onclick = getuisite;
// document.getElementById('createlink').onclick = createlink;
// document.getElementById('modalCL').onclick = createlink;
// document.getElementById('permalink').onclick = openPermaLink;
// document.getElementById('modalLO').onclick = openPermaLink;
// document.getElementById('saveAdminOps').onclick = saveAdminOps;
// document.getElementById('clearAuthOps').onclick = clearAuthOps;

/* google analytics */
function trackButtonClick(e) {
  _gaq.push(['_trackEvent', e.target.id, 'clicked']);
}

var inputs = document.querySelectorAll('input');
for (var m = 0; m < inputs.length; m++) {
  inputs[m].addEventListener('click', trackButtonClick);
}
var links = document.querySelectorAll('a');
for (var q = 0; q < links.length; q++) {
  links[q].addEventListener('click', trackButtonClick);
}
var buttons = document.querySelectorAll('button');
for (var n = 0; n < buttons.length; n++) {
  buttons[n].addEventListener('click', trackButtonClick);
}
