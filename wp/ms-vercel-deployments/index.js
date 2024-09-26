jQuery(document).ready(function ($) {
  $("#deploy-button").click(function () {
    var data = {
      action: "deploy_button_action",
      nonce: deployButton.nonce,
    };

    $.post(deployButton.ajax_url, data, function (response) {
      console.log(response);
      document.body.style.cursor = "progress";
      setTimeout(() => {
        location.reload();
      }, 1000);
    });
  });
});
