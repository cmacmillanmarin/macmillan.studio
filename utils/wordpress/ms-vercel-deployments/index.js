const _wp_url = 'https://mortgageexpert.ms-cms.com/'
const _fe_ulr = 'https://mortgageexpert.vercel.app/'

jQuery(document).ready(function ($) {
  $('#deploy-button').click(function () {
    var data = {
      action: 'deploy_button_action',
      nonce: deployButton.nonce,
    }

    $.post(deployButton.ajax_url, data, function (response) {
      console.log(response)
      document.body.style.cursor = 'progress'
      setTimeout(() => {
        location.reload()
      }, 1000)
    })
  })

  // Edit metabox
  $(
    '#minor-publishing-actions, #misc-publishing-actions, #delete-action, #wp-admin-bar-easy-updates-manager-admin-bar, #wp-admin-bar-new-content, #wp-admin-bar-comments, #wp-admin-bar-view'
  ).hide()

  // Replace Permalink links
  // $('#sample-permalink').text(
  //   $('#sample-permalink').text().replace(_wp_url, _fe_ulr).replace('single-page/', '')
  // )
})
