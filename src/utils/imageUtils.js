// Upgrade Guesty HQ image URLs to higher resolution
export function getHighResImage(url, width = 1200) {
  if (!url) return ''

  // Guesty HQ CDN - uses im_w parameter
  if (url.includes('im_w=')) {
    return url.replace(/im_w=\d+/, `im_w=${width}`)
  }

  // Guesty/Airbnb muscache CDN
  if (url.includes('muscache.com')) {
    return url.replace(/im_w=\d+/, `im_w=${width}`)
      .replace(/width=\d+/, `width=${width}`)
  }

  // Guesty HQ uses aki_policy for sizing
  if (url.includes('aki_policy=')) {
    return url.replace(/aki_policy=[^&]+/, 'aki_policy=large')
  }

  // Try appending im_w if it's a known image CDN
  if (url.includes('guesty') || url.includes('cloudinary') || url.includes('imgix')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}im_w=${width}`
  }

  return url
}

export function getCardImage(url) {
  return getHighResImage(url, 1000)
}

export function getGalleryImage(url) {
  return getHighResImage(url, 1920)
}

export function getThumbImage(url) {
  return getHighResImage(url, 600)
}
