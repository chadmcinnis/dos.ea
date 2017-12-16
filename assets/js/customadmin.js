//injecting this code directly into admin
// console.log('--customadmin js--');

function checkallm2(checkbox) {
  $('input[id*="chScreen_"]').not(':first').not(':last').each(function() {
    (checkbox.checked) ? this.checked = true : this.checked = false;
  });
}

var trackcustAdmin = setInterval(function () { if (window.jQuery) { clearInterval(trackcustAdmin);

var getData = $('#doseaCustomAdmin').data('params');
    getData = getData.split('|');
    thirdpartydb = getData[0];
    pageNumbers = getData[1] === "true";
    dbHighlighting = getData[2] === "true";
    guestAccess = getData[3] === "true";
    profiles = getData[4] === "true";
    bottomBranding = getData[5] === "true";
  //databases formatting
  if(window.location.pathname.indexOf('CustomizeServiceDatabasesForm') > -1) {
    if(pageNumbers) {
      var nav = '';
      if ($('[alt="MoveDown"]').length > 0 || $('[alt="MoveUp"]').length > 0) {
        if ($('[alt="MoveDown"]').length > 0) {
          var onclick = $('[alt="MoveDown"]').attr('onclick');
        } else {
          var onclick = $('[alt="MoveUp"]').attr('onclick');
        }

        var currentPage = onclick.split(',')[1].trim();
        var lastPage = onclick.split(',')[2].replace(')','').trim();
        var lastPageValue = lastPage-2;
        var pgDsp = '';

        if (currentPage == 0) {
          nav += '<button style="margin-left:5px;" disabled>First Page</button>';
        } else {
          nav += '<button style="margin-left:5px;" onclick="doAdminGridUpDown(\'MoveUp\', 1, '+lastPage+')">First Page</button>';
        }

        var a = 2;
        if (lastPage != 2) {
          for (i=0;i < lastPage-2;i++) {
            if (i == currentPage-1) {
              nav += '<button style="margin-left:5px;" disabled>'+a+'</button>';
            } else {
              nav += '<button style="margin-left:5px;" onclick="doAdminGridUpDown(\'MoveDown\', '+i+', '+lastPage+')">'+a+'</button>';
            }
            a++;
          }
        }

        if (currentPage == lastPage-1) {
          nav += '<button style="margin-left:5px;" disabled>Last Page</button>';
        } else {
          nav += '<button style="margin-left:5px;" onclick="doAdminGridUpDown(\'MoveDown\', '+lastPageValue+', '+lastPage+')">Last Page</button>';
        }
      } else {
        nav += '<button style="margin-left:5px;" disabled>First Page</button>';
      }
      $('#details tbody:first .style1 td').append('<span style="font-weight:bold;margin-left:10px;padding-left:10px;border-left:1px solid #000;">Page:'+nav+'</span>');
    }
    if(dbHighlighting) {
      //colors, highlighting
      var currentDate = new Date();
      var selected = $('#ddlShowOptions').val();
      $('.DataGrid-ItemStyle-ControlColumn').css('background','none');
      $('.DataGrid-ItemStyle').css('background','none');
      $('#grid_MainDataGrid').css('background','#fff');
      $('#grid_MainDataGrid td span:contains(")")').each(function() {
      	var currdb = $(this);
      	var currPrt = currdb.parent().parent();
      	var dtspan = currPrt.find('td:last').prev().find('span');
      	var endDate = new Date(dtspan.text());
      	var currText = currdb.text();
      	var dbcode = currText.match(/\(([^)]*)\)[^(]*$/)[1];
      	var dblen = dbcode.length;
        var x;
      	if (dblen == 9 || dblen == 8) {
      		currPrt.css('background-color','#F5C5BB');
      	} else if (dbcode == 'edsebk' || currText.toLowerCase().indexOf('ebsco') > -1 || currText.toLowerCase().indexOf('supplemental') > -1 || currText.toLowerCase().indexOf('complimentary') > -1 || currText.toLowerCase().indexOf('trial') > -1 || (dblen > 2 && dblen < 8 && dbcode.indexOf('eds') == -1)) {
      		currPrt.css('background-color','#BCE0DC');
      		x = true;
      	} else if (dblen == 6 || dbcode.indexOf('eds') >-1) {
      		currPrt.css('background-color',thirdpartydb);
      	}
      	if (currentDate.getTime() > endDate.getTime() && $(dtspan).parent().prev('td').find('span').text() != 'Trial') {
      		$(dtspan).parent().css('color','#ae0404');
      	}
      	if (selected != 'E') {
      		if(currentDate.getTime() < endDate.getTime() && currPrt.find('input[value="0"]').is(':checked') && x) {
      			currPrt.css('font-weight','bold');
      		}
      		if(selected == 'A' && currPrt.find('input[value="0"]:first').is(':checked')) {
      			currdb.parent().css('text-align','right');
      		}
      	}
      });
    }
  }
  if (guestAccess) {
    //guest access
    if(window.location.pathname.indexOf('CustomizeServiceLinkingForm') > -1) {
    	var profid = $("#custServiceHeader_ddlCurrProfile option:selected").text();
    	profid = profid.substring(profid.lastIndexOf("(")+1,profid.lastIndexOf(")"));
    	var hint = $('.hint b');
    	var newLink = hint.text().replace('authtype=guest','authtype=ip,guest&profid='+profid);
    	$(hint).parent().parent().html('<b>'+newLink+'</b>');
    }
  }
  if (profiles) {
    //highlight eds/ehost
    $('option:contains("(eds) - eds")').css('background-color','#cdcdcd');
    $('option:contains("(ehost) - ehost")').css('background-color','#cdcdcd');
    $('option:contains("(wsapi) - wsapi")').css('background-color','#cdcdcd');
    $('option:contains("(edsapi) - wsapi")').css('background-color','#cdcdcd');
  }
  if (bottomBranding) {
    //select screens in bb
    var screenList = $('#chScreen').parent().parent();
    var allCheck = '<tr><td class="EditForm-NonText"><table class="normal" border="0" style="background-color:#f7eff7;border-color:#993366;border-style:solid;border-width:thin;"><tbody><tr><td><input id="allm2" type="checkbox" name="allm:2" onclick="checkallm2(this);"><label for="allm2">Select all screens <strong>but</strong> choose database or ftf</label></td></tr></tbody></table></td></tr>';
    $(allCheck).insertBefore(screenList);
    var c = 0;
    var checkState = false;
    $('input[id*="chScreen_"]').not(':first').not(':last').each(function() {
      if ((this.checked === true) && (checkState === false)) {
        c++;
      } else {
        return false;
      }
    });
    if (c == 7) {
      checkState = true;
      $('#allm2').prop('checked', true);
    }
  }
} }, 10);
