const _wp_url = 'https://ms-cms.com/'
const _fe_url = 'https://macmillan.studio/'
const _preview_url = 'https://macmillanstudio-preview.vercel.app/'

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
    '#minor-publishing-actions, #misc-publishing-actions, #delete-action, #wp-admin-bar-easy-updates-manager-admin-bar, #wp-admin-bar-new-content, #wp-admin-bar-rank-math, #wp-admin-bar-comments, #wp-admin-bar-view'
  ).hide()

  const title = document.querySelector('#submitdiv h2')
  if (title) title.innerHTML = 'Actions'

  const permalinkEl = document.querySelector('#sample-permalink a')
  let permalink = permalinkEl?.href?.replace(_wp_url, '')?.split('/')?.[0] || 'no-permalink'
  const postName = document.querySelector('#editable-post-name-full')?.innerHTML || 'no-post-name'
  if (permalink === postName) permalink = 'single-page'

  console.log(permalink, postName)

  let path = ''
  if (postName !== 'homepage') {
    path = postName
  }

  const rankMathBlockedPages = ['navigation', 'dictionary']
  const permalinkBlockedPages = ['navigation', 'dictionary']

  if (rankMathBlockedPages.includes(permalink)) {
    $('#rank_math_metabox').hide()
  }

  if (permalinkBlockedPages.includes(permalink)) {
    $('#edit-slug-box').hide()
    $('.page-title-action').hide()
  } else if (permalinkEl) {
    const url = _fe_url + path
    permalinkEl.innerHTML = permalinkEl.innerHTML.replace(
      `${_wp_url}${permalink}`,
      url.replace(postName ? `/${postName}` : '', '')
    )
    permalinkEl.href = url
    permalinkEl.target = '_blank'
  }

  const previewBlockedPages = ['article-author']
  const container = document.querySelector('#publishing-action')

  if (container && !previewBlockedPages.includes(permalink)) {
    if (permalink === 'no-permalink' && postName === 'no-post-name') return

    const a = document.createElement('a')
    a.classList.add('button')
    a.classList.add('button-secondary')
    a.classList.add('button-large')
    a.style.marginLeft = '4px'
    a.href = _preview_url + path
    a.target = '_blank'
    a.innerHTML = 'Preview'
    container.appendChild(a)
  }

  // Replace Permalink links
  // $('#sample-permalink').text(
  //   $('#sample-permalink').text().replace(_wp_url, _fe_url).replace('single-page/', '')
  // )
})
