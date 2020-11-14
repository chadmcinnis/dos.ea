import { getSelf } from './helpers.js';

(async function () {
  let self = await getSelf();

  let updateMsg = JSON.parse(localStorage.getItem('update-msg'));
  let footerActive = $('footer.page-footer.grey.lighten-2 > div');
  if (
    (updateMsg &&
      updateMsg.closedModal &&
      updateMsg.version === self.version) ||
    !footerActive
  ) {
    return false;
  }

  let update =
    '<div id="updateComplete" class="update-complete-div"><i id="i_updateComplete_close" class="close material-icons update-complete-close">close</i><span class="update-complete-span1">App Update Complete</span><span class="update-complete-span2">[Minor] Resolved issue where API creds were passed to permalink<br />**&nbsp;&nbsp;&nbsp;Coming Soon ~ dos.ea v2 &nbsp;&nbsp;&nbsp;**</span></div>';
  footerActive.prepend(update);

  if ($('#updateComplete')) {
    document.getElementById('i_updateComplete_close').onclick = function () {
      _gaq.push(['_trackEvent', 'i_updateComplete_close', 'clicked']);

      $('#updateComplete').remove();

      let obj = {
        version: self.version,
        closedModal: true,
      };

      localStorage.setItem('update-msg', JSON.stringify(obj));
    };
  }
})();
