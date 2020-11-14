var custName, custId, groupId, profId, credsCustId, credsGroupId, profURL;
var textField, textCopy, edsProfile, site, user, pwd, value, authtype, creds;
var none, saveOptions, admimVal, curopt, type, authSel;
var a = 0;

var _gaq = _gaq || [];
_gaq.push(["_setAccount", "UA-111199777-1"]);
_gaq.push(["_trackPageview"]);
(function() {
  var ga = document.createElement("script");
  ga.type = "text/javascript";
  ga.async = true;
  ga.src = "https://ssl.google-analytics.com/ga.js";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(ga, s);
})();

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  var windowUrl = tabs[0].url;
  if (windowUrl && windowUrl.indexOf("eadmin") > -1) {
    site = "eadmin";
  } else if (windowUrl.match(/\/(bsi|ehost|eds|openurl|pfi)/i)) {
    site = "ebscohost";
  } else {
    site = "warning";
  }
});

$(".opTitle").on("click", "a", function() {
  chrome.tabs.create({ url: $(this).attr("href") });
  return false;
});

function updateAuth() {
  id = this.id;
  id = id.split("_")[1];
  $('input[id="' + id + '"]').addClass("chk");
  $('input[id="' + id + '"]').trigger("click");
}

function chips(authSel) {
  if (authSel != "") {
    if (authSel.indexOf(",") == -1) {
      $(".placeAuth").html(
        '<div class="chip"><span id="chip_' +
          authSel +
          '">' +
          authSel +
          '</span><i id="i_' +
          authSel +
          '" class="close material-icons chips_close">close</i></div>'
      );
    } else {
      $(".placeAuth").html("");
      var authSelArr = authSel.split(",");
      $(authSelArr).each(function() {
        authSel = this;
        $(".placeAuth").append(
          '<div class="chip"><span id="chip_' +
            authSel +
            '">' +
            authSel +
            '</span><i id="i_' +
            authSel +
            '" class="close material-icons chips_close">close</i></div>'
        );
      });
    }
    if ($(".chips_close").length > 0) {
      var z = document.getElementsByClassName("chips_close");
      for (var i = 0; i < z.length; i++) {
        z[i].addEventListener("click", updateAuth, false);
      }
    }
  } else {
    $(".placeAuth").html("<p>&nbsp;&nbsp;&nbsp; None -- Click AUTHTYPE</p>");
  }
}

function authDefaults() {
  $("#embed_logins").prop("checked", true);
  $("#currAuthType").text("embed_logins");
  chips("embed_logins");
}

//get any information stored
chrome.storage.local.get(
  ["sitestorage", "credsstorage", "uisite", "permalink", "saveAuthOps"],
  function(items) {
    if (typeof items.sitestorage !== "undefined") {
      custId = items.sitestorage.custId;
      groupId = items.sitestorage.groupId;
      profId = items.sitestorage.profId;
      custName = items.sitestorage.custName;
      $("#showCust").text(custId);
      $("#showGroup").text(groupId);
      $("#showProfile").text(profId);
      $("#showCustName").text(custName);
      $("#showShortcut").text(custId + "." + groupId + "." + profId);
    }
    if (typeof items.credsstorage !== "undefined") {
      user = items.credsstorage.user;
      pwd = items.credsstorage.pwd;
      $("#showUser").text(user);
      $("#showPass").text(pwd);
    }
    if (typeof items.uisite !== "undefined") {
      edsProfile = items.uisite.edsProfile;
      $("#showActSite").text(edsProfile);
    }
    if (typeof items.permalink !== "undefined") {
      profURL = items.permalink.profURL;
      $("#showUrl").text(profURL);
    }
    if (typeof items.saveAuthOps !== "undefined") {
      authtypeOrg = items.saveAuthOps.selected;
      chips(authtypeOrg);
      if (authtypeOrg.indexOf(",") > -1) {
        authtype = authtypeOrg.split(",");
        $(authtype).each(function() {
          value = this;
          $('[id="' + value + '"]').prop("checked", true);
        });
      } else {
        $("#ip,#cookie,#url").prop("checked", false);
        $('[id="' + authtypeOrg + '"]').prop("checked", true);
      }
      $("#currAuthType").text(authtypeOrg);
    } else if (typeof items.saveAuthOps === "undefined") {
      authDefaults();
    }
  }
);

if ("adminOptions" in localStorage) {
  var optionSet = localStorage.getItem("adminOptions");
  optionSet = optionSet.split(",");
  $(optionSet).each(function() {
    curopt = this;
    id = curopt.split("=")[0];
    state = curopt.split("=")[1];
    $(".switch input").each(function() {
      if (this.id == id && state == "true") {
        $(this).prop("checked", true);
      } else if (this.id == id) {
        $(this).prop("checked", false);
      }
    });
  });
} else {
  $(".switch input").each(function() {
    $(this).prop("checked", false);
  });
}

function warnMessage(msg) {
  $("#modalWrongSite").modal("open");
}
function modalClear(msg) {
  $("#modalClear").modal("open");
}

//get custid, groupid, profid, custname, and create shortcut
function getsite() {
  if (site == "eadmin") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { function: "getsite" }, function(
        response
      ) {
        if (typeof response !== "undefined") {
          custId = response.siteInfo[0];
          groupId = response.siteInfo[1];
          profId = response.siteInfo[2];
          custName = response.siteInfo[3];
          if (custId !== "all") {
            custId ? $("#showCust").text(custId) : "None";
            groupId ? $("#showGroup").text(groupId) : "None";
            profId ? $("#showProfile").text(profId) : "None";
            custName ? $("#showCustName").text(custName) : "None";

            if (custId !== null && groupId !== null && profId !== null) {
              $("#showShortcut").text(custId + "." + groupId + "." + profId);
            }

            var siteVal = {
              custId: custId,
              groupId: groupId,
              profId: profId,
              custName: custName
            };

            chrome.storage.local.set({
              sitestorage: siteVal
            });
          } else {
            $("#modalAuth").modal("open");
            allSites();
          }
        } else {
          chrome.storage.local.clear(function() {
            $("#modalClear").modal("open");
          });
        }
      });
    });
    chrome.storage.local.get("credsstorage", function(items) {
      if (typeof items.credsstorage !== "undefined") {
        credsCustId = items.credsstorage.credsCustId;
        credsGroupId = items.credsstorage.credsGroupId;
        if (custId != credsCustId || groupId != credsGroupId) {
          $("#showUser").text("");
          $("#showPass").text("");
          user = pwd = credsCustId = credsGroupId = "";
          var credVal = {
            user: user,
            pwd: pwd,
            credsCustId: credsCustId,
            credsGroupId: credsGroupId
          };

          chrome.storage.local.set({
            credsstorage: credVal
          });
        }
      }
    });
  } else {
    warnMessage("yes");
    _gaq.push(["_trackEvent", "getsite/warnMessage", "Error"]);
  }
}

function allSites() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { function: "allSites" });
  });
}

//get username and password
function getup() {
  if (site == "eadmin") {
    chrome.storage.local.get("sitestorage", function(items) {
      if (typeof items.sitestorage !== "undefined") {
        custId = items.sitestorage.custId;
        groupId = items.sitestorage.groupId;
        if (groupId == "") {
          groupId = "main";
        }
      } else {
        $("#modalUP").modal("open");
        _gaq.push(["_trackEvent", "getup1/modalUP", "Error"]);
      }
    });
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { function: "getup", custId: custId, groupId: groupId },
        function(response) {
          if (response.credInfo !== "no match") {
            user = response.credInfo[0];
            pwd = response.credInfo[1];
            credsCustId = response.credInfo[2];
            credsGroupId = response.credInfo[3];
            $("#showUser").text(user);
            $("#showPass").text(pwd);

            var credVal = {
              user: user,
              pwd: pwd,
              credsCustId: credsCustId,
              credsGroupId: credsGroupId
            };

            chrome.storage.local.set({
              credsstorage: credVal
            });
          } else {
            $("#modalUP").modal("open");
            _gaq.push(["_trackEvent", "getup2/modalUP", "Error"]);
          }
        }
      );
    });
  } else {
    warnMessage("yes");
    _gaq.push(["_trackEvent", "getup3/warnMessage", "Error"]);
  }
}

//get the custid.groupid.profid in current ui
function getuisite() {
  if (site === "ebscohost") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { function: "getuisite" }, function(
        response
      ) {
        edsProfile = response.edsPro;
        $("#showActSite").text(edsProfile);

        var uisite = {
          edsProfile: edsProfile
        };

        chrome.storage.local.set({
          uisite: uisite
        });
      });
    });
  } else {
    $("#wrongTab").modal("open");
    _gaq.push(["_trackEvent", "getuisite/wrongTab", "Error"]);
  }
}

$("#saveAuthOps").on("click", function() {
  currAuthType = $("#currAuthType").text();
  saveOptions = {
    selected: currAuthType
  };
  chrome.storage.local.set({
    saveAuthOps: saveOptions
  });
});

function createlink() {
  custId = $("#showCust").text();
  groupId = $("#showGroup").text();
  profId = $("#showProfile").text();

  if ($("#embed_logins").is(":checked")) {
    user = $("#showUser").text();
    pwd = $("#showPass").text();
    if (user == "" && pwd == "") {
      var $toastContent = $("<span>Missing User/Password</span>");
      M.toast({ html: $toastContent }, 2000);
    }
    authtype = "uid";
    creds =
      "&user=" +
      encodeURIComponent(user) +
      "&password=" +
      encodeURIComponent(pwd);
  } else {
    authtype = $("#currAuthType").text();
    creds = "";
  }
  profURL =
    "https://search.ebscohost.com/login.aspx?custid=" +
    custId +
    "&groupid=" +
    groupId +
    "&profid=" +
    profId +
    "&authtype=" +
    authtype +
    creds;
  $("#showUrl").text(profURL);

  var permalink = {
    profURL: profURL
  };

  chrome.storage.local.set({
    permalink: permalink
  });

  return profURL;
}

function openPermaLink() {
  var permaUrl = createlink();
  var win = window.open(permaUrl, "_blank");
  if (win) {
    win.focus();
  } else {
    alert("Please allow popups for this website");
  }
}

//clear all storage
function removeStorage() {
  chrome.storage.local.clear(function() {
    $("table tr td.storval").empty();
    $("#ip,#cookie,#url").prop("checked", false);
    authDefaults();
  });
}

$("table tbody tr td a:not(#btnauthtype)").on("click", function() {
  textField = $(this)
    .parent()
    .next("td");
  textCopy = textField.text();
  if (textCopy !== "") {
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = textCopy;
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand("copy");
    body.removeChild(copyFrom);
    var $toastContent = $("<span>Copied</span>");
    M.toast({ html: $toastContent }, 2000);
  } else {
    var $toastContent = $("<span>Unable to copy text</span>");
    M.toast({ html: $toastContent }, 2000);
  }
});
function gotoauth() {
  if (site == "eadmin") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { function: "gotoauth" });
    });
  } else {
    warnMessage("eadmin");
    _gaq.push(["_trackEvent", "gotoauth/warnMessage", "Error"]);
  }
}
function gotocustserv() {
  if (site == "eadmin") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { function: "gotocustserv" });
    });
  } else {
    warnMessage("eadmin");
    _gaq.push(["_trackEvent", "gotocustserv/warnMessage", "Error"]);
  }
}
function credPgDown() {
  if (site == "eadmin") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { function: "credPgDown" });
    });
  } else {
    warnMessage("eadmin");
  }
}

function clearAuthOps() {
  $('input[name="authtype"]:checked').prop("checked", false);
  $("#currAuthType, .placeAuth").text("");
  $(".chk").removeClass("chk");
}

$("#selectNoneOrAll").on("click", function() {
  var adminOpsArr = [];
  var checked = this.checked;
  $(".switch input")
    .not("#selectNoneOrAll")
    .each(function() {
      var id = this.id + "=" + checked;
      this.checked = checked;
      adminOpsArr.push(id);
    });
  localStorage.setItem("adminOptions", adminOpsArr);
});

$(".switch input")
  .not("#selectNoneOrAll")
  .on("click", function() {
    var adminOpsArr = [];
    $(".switch input")
      .not("#selectNoneOrAll")
      .each(function() {
        var id = this.id;
        if (this.checked) {
          id = this.id + "=true";
        } else {
          id = this.id + "=false";
        }
        adminOpsArr.push(id);
      });
    localStorage.setItem("adminOptions", adminOpsArr);
  });

$(".modal").modal();

$('a[href="#authtype"]').on("click", function() {
  if (!$('#authtype [type="radio"]:checked').hasClass("chk")) {
    var ckRadio = $('#authtype [type="radio"]:checked').addClass("chk");
  }
  var currAuthType = $("#currAuthType").text();
  if (
    !currAuthType.match(
      /(uid|guest|cpid|shib|sso|custiud|athens|embed_logins)/g
    )
  ) {
    $('#authtype [type="radio"]:checked').prop("checked", false);
  }
});

$('input[name="authtype"]').on("click", function() {
  if (this.id == "embed_logins") {
    $(":checked")
      .not(this)
      .prop("checked", false);
  } else if (this.id == "ip" || this.id == "cookie" || this.id == "url") {
    $("#embed_logins").prop("checked", false);
  }
  var currAuthType = $("#currAuthType").text();

  if ($(this).hasClass("chk") && this.checked && this.type == "radio") {
    $(this).removeClass("chk");
    $("#" + this.id).prop("checked", false);
    currAuthType = currAuthType.replace(this.value, "");
  } else if (this.type == "radio") {
    $(".chk").removeClass("chk");
    $(this).addClass("chk");
  }

  if (currAuthType == "embed_logins") {
    currAuthType = "";
  }
  if (this.value == "embed_logins") {
    currAuthType = "embed_logins";
  } else {
    if (currAuthType.match(/(ip|cookie|url)/g)) {
      if (
        this.checked === true &&
        this.type == "checkbox" &&
        currAuthType.indexOf(this.value) == -1
      ) {
        currAuthType = this.value + "," + currAuthType;
      } else if (this.checked === false) {
        currAuthType = currAuthType.replace(this.value, "");
      } else if (this.type == "radio") {
        var radio = currAuthType.split(",").pop();
        if (radio.match(/(ip|cookie|url)/g)) {
          currAuthType += "," + this.value;
        } else if (radio != this.value) {
          currAuthType = currAuthType.replace(radio, this.value);
        }
      }
    } else if (this.checked === false) {
      currAuthType = currAuthType.replace(this.value, "");
    } else if (this.type === "checkbox") {
      currAuthType = this.value + "," + currAuthType;
    } else {
      currAuthType = this.value;
    }
    currAuthType = currAuthType.replace(/^,|,$/g, "");
    currAuthType = currAuthType.replace(/,,/g, ",");
  }

  $("#currAuthType").text(currAuthType);
  saveOptions = {
    selected: currAuthType
  };
  chrome.storage.local.set({
    saveAuthOps: saveOptions
  });
  chips(currAuthType);
});

$(".tooltipped").tooltip();

$(".fixed-action-btn").floatingActionButton({
  direction: "right", // Direction menu comes out
  hoverEnabled: false, // Hover enabled
  toolbarEnabled: false // Toolbar transition enabled
});

function saveAdminOps() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
  });
}

$("footer .btn-large").on("click", function() {
  $("#mail").css("display", "block");
  $("#success").css("display", "none");
  $("#name").val("");
  $("#email").val("");
  $("#textarea1").val("");
});

document.getElementById("getsite").onclick = getsite;
document.getElementById("getup").onclick = getup;
document.getElementById("gotoauth").onclick = gotoauth;
document.getElementById("gotocustserv").onclick = gotocustserv;
document.getElementById("removeStorage").onclick = removeStorage;
document.getElementById("activesite").onclick = getuisite;
document.getElementById("createlink").onclick = createlink;
document.getElementById("modalCL").onclick = createlink;
document.getElementById("permalink").onclick = openPermaLink;
document.getElementById("modalLO").onclick = openPermaLink;
document.getElementById("saveAdminOps").onclick = saveAdminOps;
document.getElementById("clearAuthOps").onclick = clearAuthOps;

/* google analytics */
function trackButtonClick(e) {
  _gaq.push(["_trackEvent", e.target.id, "clicked"]);
}

var inputs = document.querySelectorAll("input");
for (var m = 0; m < inputs.length; m++) {
  inputs[m].addEventListener("click", trackButtonClick);
}
var links = document.querySelectorAll("a");
for (var q = 0; q < links.length; q++) {
  links[q].addEventListener("click", trackButtonClick);
}
var buttons = document.querySelectorAll("button");
for (var n = 0; n < buttons.length; n++) {
  buttons[n].addEventListener("click", trackButtonClick);
}
