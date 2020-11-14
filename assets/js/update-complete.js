function updateMessage() {
  var version = 1.3;

  var updateMsg = JSON.parse(localStorage.getItem("update-msg"));
  if (!updateMsg || (!updateMsg.closedModal && updateMsg.version !== version)) {
    var update =
      '<div id="updateComplete" class="update-complete-div"><i id="i_updateComplete_close" class="close material-icons update-complete-close">close</i><span class="update-complete-span1">App Update Complete</span><span class="update-complete-span2">[Minor] Resolved issue where API creds were passed to permalink<br />**&nbsp;&nbsp;&nbsp;Coming Soon ~ dos.ea v2 &nbsp;&nbsp;&nbsp;**</span></div>';

    var footerActive = $("footer.page-footer.grey.lighten-2 > div");
    if (footerActive) {
      footerActive.prepend(update);

      var updateComplete = $("#updateComplete");
      if (updateComplete) {
        document.getElementById("i_updateComplete_close").onclick = function() {
          _gaq.push(["_trackEvent", "i_updateComplete_close", "clicked"]);

          var updateComplete = $("#updateComplete").remove();
          var obj = {
            version: 1.3,
            closedModal: true
          };

          localStorage.setItem("update-msg", JSON.stringify(obj));
        };
      }
    }
  }
}

updateMessage();
