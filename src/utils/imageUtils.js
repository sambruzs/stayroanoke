// Upgrade Guesty image URLs to higher resolution
export function getHighResImage(url, width = 1200) {
  if (!url) return ''
  // Guesty uses im_w parameter to control image width
  if (url.includes('im_w=')) {
    return url.replace(/im_w=\d+/, `im_w=${width}`)
  }
  // Append if not present
  if (url.includes('muscache.com') || url.includes('guesty')) {
    return `${url}${url.includes('?') ? '&' : '?'}im_w=${width}`
  }
  return url
}

export function getCardImage(url) {
  return getHighResImage(url, 800)
}

export function getGalleryImage(url) {
  return getHighResImage(url, 1600)
}

export function getThumbImage(url) {
  return getHighResImage(url, 400)
}
